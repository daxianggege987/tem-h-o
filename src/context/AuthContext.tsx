
"use client";

import type { User } from "firebase/auth";
import React, { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from "react";
import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, db } from "@/lib/firebase"; 
import { signOut as firebaseSignOut, onAuthStateChanged, getIdToken } from "firebase/auth";
import { doc, getDoc, setDoc, Timestamp, runTransaction } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const INITIAL_FREE_CREDITS_AMOUNT = 10;
const FREE_CREDIT_VALIDITY_HOURS = 72;
const CONSUMPTION_COOLDOWN_MINUTES = 60;

export interface UserEntitlements {
  freeCreditsRemaining: number;
  freeCreditsExpireAt: number | null; 
  paidCreditsRemaining: number;
  isVip: boolean;
  vipExpiresAt: number | null; 
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean; 
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  resendVerificationEmail: () => Promise<boolean>;
  error: string | null; 
  clearError: () => void;
  entitlements: UserEntitlements;
  fetchUserEntitlements: () => Promise<void>;
  consumeOracleUse: () => Promise<boolean>; 
}

const initialEntitlementsState: UserEntitlements = {
  freeCreditsRemaining: 0,
  freeCreditsExpireAt: null,
  paidCreditsRemaining: 0,
  isVip: false,
  vipExpiresAt: null,
  isLoading: true,
  error: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entitlements, setEntitlements] = useState<UserEntitlements>(initialEntitlementsState);
  const router = useRouter();
  const { toast } = useToast();

  const clearError = useCallback(() => setError(null), []);

  const fetchUserEntitlements = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setEntitlements({ ...initialEntitlementsState, isLoading: false });
      return;
    }
    setEntitlements(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const token = await currentUser.getIdToken(true); // Force refresh the token
      const response = await fetch('/api/get-entitlements', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      setEntitlements({
        ...data, // The API returns the exact structure we need
        isLoading: false,
        error: null,
      });

    } catch (e: any) {
      console.error("[AuthContext] fetchUserEntitlements error:", e);
      setEntitlements({ ...initialEntitlementsState, isLoading: false, error: "Failed to load user entitlements." });
    }
  }, []);

  const consumeOracleUse = async (): Promise<boolean> => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to use the oracle.", variant: "destructive" });
      return false;
    }
    if (!user.emailVerified) {
      toast({ title: "Verification Required", description: "Please verify your email before using the oracle.", variant: "destructive" });
      router.push('/verify-email');
      return false;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);
      let accessGranted = false;
      
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists()) {
          throw new Error("User document not found.");
        }

        const data = userDoc.data();
        const entitlementsData = data.entitlements || {};
        const now = Date.now();

        // 1. Check Cooldown
        const lastConsumptionTime = entitlementsData.lastConsumptionTime || 0;
        if (now - lastConsumptionTime < CONSUMPTION_COOLDOWN_MINUTES * 60 * 1000) {
          toast({ title: "Access Granted", description: `No credit was used as your last visit was within ${CONSUMPTION_COOLDOWN_MINUTES} minutes.` });
          accessGranted = true;
          return; // Exit transaction early, no update needed
        }
        
        // 2. Check Entitlements (VIP > Free > Paid)
        let newEntitlements = { ...entitlementsData };
        let consumedSomething = false;

        if (entitlementsData.isVip && entitlementsData.vipExpiresAt?.toMillis() > now) {
          toast({ title: "Oracle Used (VIP)", description: "VIP access used." });
          consumedSomething = true;
        } else if (entitlementsData.freeCredits > 0 && entitlementsData.freeCreditsExpireAt?.toMillis() > now) {
          newEntitlements.freeCredits = entitlementsData.freeCredits - 1;
          toast({ title: "Oracle Used (Free Credit)", description: "A free credit was used." });
          consumedSomething = true;
        } else if (entitlementsData.paidCredits > 0) {
          newEntitlements.paidCredits = entitlementsData.paidCredits - 1;
          toast({ title: "Oracle Used (Paid Credit)", description: "A paid credit was used." });
          consumedSomething = true;
        }

        if (consumedSomething) {
          newEntitlements.lastConsumptionTime = now;
          transaction.set(userDocRef, { entitlements: newEntitlements }, { merge: true });
          accessGranted = true;
        } else {
          toast({ title: "Insufficient Credits", description: "No available credits or VIP access.", variant: "destructive" });
          accessGranted = false;
        }
      });
      
      if(accessGranted) await fetchUserEntitlements(); // Refresh state after successful consumption
      return accessGranted;

    } catch (e: any) {
      console.error("Error consuming oracle use:", e);
      toast({ title: "Error", description: "Could not process oracle use. Please try again.", variant: "destructive" });
      return false;
    }
  };

  const handleUserAuth = useCallback(async (currentUser: User | null) => {
    setUser(currentUser);
    if (currentUser) {
      // Special logic for the test account to ensure it always has entitlements for testing.
      // This will run on every login/refresh for this specific user.
      if (currentUser.email === '94722424@qq.com') {
        try {
          console.log('Test account detected. Seeding entitlements for testing...');
          const userDocRef = doc(db, 'users', currentUser.uid);
          const oneYearFromNow = new Date();
          oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

          const testEntitlements = {
            freeCredits: 10,
            freeCreditsExpireAt: Timestamp.fromMillis(Date.now() + (FREE_CREDIT_VALIDITY_HOURS * 60 * 60 * 1000)),
            paidCredits: 100,
            isVip: true,
            vipExpiresAt: Timestamp.fromDate(oneYearFromNow),
          };
          // Use set with merge to create or overwrite the entitlements for the test user
          await setDoc(userDocRef, { entitlements: testEntitlements }, { merge: true });
          console.log('Test account entitlements successfully set.');
        } catch (e) {
            console.error("Failed to seed test account entitlements:", e);
        }
      }

      await fetchUserEntitlements();
    } else {
      setEntitlements({ ...initialEntitlementsState, isLoading: false });
    }
    setLoading(false);
  }, [fetchUserEntitlements]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, handleUserAuth);
    return () => unsubscribe();
  }, [handleUserAuth]);

  const signInWithGoogle = async () => {
    clearError();
    setLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const currentUser = userCredential.user;
      
      // Check for and create user doc on first Google sign-in
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        const creationTime = currentUser.metadata.creationTime ? new Date(currentUser.metadata.creationTime).getTime() : Date.now();
        const initialData = {
          uid: currentUser.uid, email: currentUser.email, createdAt: Timestamp.fromMillis(creationTime),
          entitlements: {
            freeCredits: INITIAL_FREE_CREDITS_AMOUNT,
            freeCreditsExpireAt: Timestamp.fromMillis(creationTime + (FREE_CREDIT_VALIDITY_HOURS * 60 * 60 * 1000)),
            paidCredits: 0, isVip: false, vipExpiresAt: null, lastConsumptionTime: 0
          }
        };
        await setDoc(userDocRef, initialData, { merge: true });
      }

      router.push("/profile");
      toast({ title: "Sign In Successful", description: "You are now signed in with Google." });
    } catch (err: any) {
      let message = `Error signing in with Google: ${err.message}`;
      if (err.code === 'auth/popup-closed-by-user') message = 'Google Sign-In popup closed by user.';
      setError(message);
      toast({ title: "Sign In Error", description: message, variant: "destructive" });
    } finally {
       setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    clearError();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (userCredential.user.emailVerified) {
        router.push("/profile");
        toast({ title: "Sign In Successful", description: "Welcome back!" });
      } else {
        router.push("/verify-email");
        toast({ title: "Verification Required", description: "Please check your email to verify your account first." });
      }
    } catch (err: any) {
      let message = 'Invalid email or password. Please try again.';
      if (err.code !== 'auth/invalid-credential') message = `Error signing in: ${err.message}`;
      setError(message);
      toast({ title: "Sign In Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    clearError();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const currentUser = userCredential.user;

      const creationTime = currentUser.metadata.creationTime ? new Date(currentUser.metadata.creationTime).getTime() : Date.now();
      const initialEntitlements = {
        freeCredits: INITIAL_FREE_CREDITS_AMOUNT,
        freeCreditsExpireAt: Timestamp.fromMillis(creationTime + (FREE_CREDIT_VALIDITY_HOURS * 60 * 60 * 1000)),
        paidCredits: 0, isVip: false, vipExpiresAt: null, lastConsumptionTime: 0,
      };

      await setDoc(doc(db, "users", currentUser.uid), {
        uid: currentUser.uid, email: currentUser.email, createdAt: Timestamp.fromMillis(creationTime),
        entitlements: initialEntitlements
      });

      await sendEmailVerification(currentUser);
      router.push("/verify-email");
      toast({ title: "Registration Successful!", description: "Please check your inbox for a verification link." });
    } catch (err: any) {
      let message = `Error signing up: ${err.message}`;
      if (err.code === 'auth/email-already-in-use') {
        message = 'This email address is already in use.';
      }
      setError(message);
      toast({ title: "Registration Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationEmail = async (): Promise<boolean> => {
    if (!auth.currentUser) {
      toast({ title: "Error", description: "You are not currently logged in.", variant: "destructive" });
      return false;
    }
    try {
      await sendEmailVerification(auth.currentUser);
      return true;
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to resend verification email.", variant: "destructive" });
      return false;
    }
  };

  const signOutUser = async () => {
    setLoading(true);

    try {
      await firebaseSignOut(auth);
      router.push("/"); 
      toast({ title: "Signed Out", description: "You have been signed out." });
    } catch (err: any) {
      setError(`Error signing out: ${err.message}`);
      toast({ title: "Sign Out Error", description: `Error signing out: ${err.message}`, variant: "destructive" });
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (user?.emailVerified && !loading) {
        const currentPath = window.location.pathname;
        if (currentPath === "/login" || currentPath === "/signup" || currentPath === "/verify-email") {
            router.push("/profile");
        }
    }
  }, [user, loading, router]);

  return (
    <AuthContext.Provider value={{ 
      user, loading, signOut: signOutUser, signInWithGoogle, signInWithEmail,
      signUpWithEmail, resendVerificationEmail, error, clearError,
      entitlements, fetchUserEntitlements, consumeOracleUse
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

    