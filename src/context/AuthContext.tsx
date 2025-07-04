
"use client";

import type { User } from "firebase/auth";
import React, { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from "react";
import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, db } from "@/lib/firebase"; 
import { signOut as firebaseSignOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const INITIAL_FREE_CREDITS_AMOUNT = 10;
const FREE_CREDIT_VALIDITY_HOURS = 72;

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
        let errorData = { error: `Request failed with status ${response.status}.` };
        try {
            errorData = await response.json();
        } catch (parseError) {
            console.log("Could not parse error response as JSON.", parseError);
        }
        const errorMessage = errorData.error || "An unknown API error occurred.";
        setEntitlements({ ...initialEntitlementsState, isLoading: false, error: errorMessage });
        return; 
      }

      const data = await response.json();
      
      setEntitlements({
        ...data,
        isLoading: false,
        error: null,
      });

    } catch (e: any) {
      const errorMessage = e.message || "A network error occurred while fetching entitlements.";
      setEntitlements({ ...initialEntitlementsState, isLoading: false, error: errorMessage });
    }
  }, []);

  const handleUserAuth = useCallback(async (currentUser: User | null) => {
    setUser(currentUser);
    if (currentUser) {
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

      console.log(`Attempting to send verification email to ${currentUser.email}...`);
      await sendEmailVerification(currentUser).catch(err => {
        console.error("sendEmailVerification promise rejected:", err);
        toast({ title: "Email Sending Failed", description: "Could not initiate email verification. Please check console for errors.", variant: "destructive" });
      });

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
      entitlements, fetchUserEntitlements
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
