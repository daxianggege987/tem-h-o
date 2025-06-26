
"use client";

import type { User } from "firebase/auth";
import React, { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from "react";
import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification } from "@/lib/firebase"; 
import { signOut as firebaseSignOut, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const TEST_USER_EMAIL_FOR_MOCK_ENTITLEMENTS = "94722424@qq.com";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const INITIAL_FREE_CREDITS_AMOUNT_CONTEXT = 10;
const FREE_CREDIT_VALIDITY_HOURS_CONTEXT = 72;
const CONSUMPTION_COOLDOWN_MINUTES = 60;

// Helper type for persisted data
interface PersistedEntitlementData {
  consumedFreeCredits: number;
  lastConsumptionTime: number;
}

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

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchUserEntitlements = useCallback(async () => {
    if (!user) {
      setEntitlements(prev => ({ ...initialEntitlementsState, isLoading: false }));
      return;
    }

    setEntitlements(prev => ({ ...prev, isLoading: true, error: null }));
    console.log("[AuthContext] Simulating API call to: /api/get-user-entitlements for user:", user.uid, "Email:", user.email);

    await new Promise(resolve => setTimeout(resolve, 500)); 

    try {
      // --- Start of Persistence Logic ---
      const persistedDataKey = `entitlements_${user.uid}`;
      const persistedDataString = localStorage.getItem(persistedDataKey);
      const persistedData: PersistedEntitlementData = persistedDataString 
        ? JSON.parse(persistedDataString) 
        : { consumedFreeCredits: 0, lastConsumptionTime: 0 };
      // --- End of Persistence Logic ---

      let mockResponse: Omit<UserEntitlements, 'isLoading' | 'error'>;
      const registrationTime = user.metadata?.creationTime ? new Date(user.metadata.creationTime).getTime() : Date.now();
      const now = Date.now();

      if (user.email === TEST_USER_EMAIL_FOR_MOCK_ENTITLEMENTS) {
        console.log("[AuthContext] Applying special mock entitlements for test user:", user.email);
        mockResponse = {
          freeCreditsRemaining: 999, 
          freeCreditsExpireAt: now + (365 * 24 * 60 * 60 * 1000), 
          paidCreditsRemaining: 9999, 
          isVip: true,
          vipExpiresAt: now + (365 * 24 * 60 * 60 * 1000), 
        };
      } else {
        const freeCreditsExpiryTimestamp = registrationTime + (FREE_CREDIT_VALIDITY_HOURS_CONTEXT * 60 * 60 * 1000);
        const hasFreeCreditsExpired = now >= freeCreditsExpiryTimestamp;

        // BUG FIX: Calculate remaining credits based on persisted consumption
        const actualFreeCreditsRemaining = hasFreeCreditsExpired 
            ? 0 
            : Math.max(0, INITIAL_FREE_CREDITS_AMOUNT_CONTEXT - persistedData.consumedFreeCredits);
        
        console.log("[AuthContext] Applying standard mock entitlements for user:", user.email);
        mockResponse = {
          freeCreditsRemaining: actualFreeCreditsRemaining,
          freeCreditsExpireAt: freeCreditsExpiryTimestamp,
          paidCreditsRemaining: 0, // Assuming paid credits are managed elsewhere
          isVip: false,
          vipExpiresAt: null,
        };
      }
      setEntitlements({ ...mockResponse, isLoading: false, error: null });
    } catch (e: any) {
      console.error("[AuthContext] Mock fetchUserEntitlements error:", e);
      setEntitlements({ 
        ...initialEntitlementsState, 
        isLoading: false, 
        error: "Failed to load entitlements (mock error)." 
      });
    }
  }, [user]);

  const consumeOracleUse = async (): Promise<boolean> => {
    if (!user) {
      setTimeout(() => {
        toast({ title: "Error", description: "You must be logged in to use the oracle.", variant: "destructive" });
      }, 0);
      return false;
    }

    if (!user.emailVerified) {
      setTimeout(() => {
        toast({ title: "Verification Required", description: "Please verify your email before using the oracle.", variant: "destructive" });
        router.push('/verify-email');
      }, 0);
      return false;
    }

    console.log("[AuthContext] Attempting to consume oracle use for user:", user.uid);
    
    const persistedDataKey = `entitlements_${user.uid}`;
    const persistedDataString = localStorage.getItem(persistedDataKey);
    const persistedData: PersistedEntitlementData = persistedDataString 
        ? JSON.parse(persistedDataString) 
        : { consumedFreeCredits: 0, lastConsumptionTime: 0 };
    
    const now = Date.now();
    const timeSinceLastConsumption = now - (persistedData.lastConsumptionTime || 0);
    const cooldownPeriod = CONSUMPTION_COOLDOWN_MINUTES * 60 * 1000;

    if (timeSinceLastConsumption < cooldownPeriod) {
        console.log(`[AuthContext] Cooldown active. Last consumption was ${Math.round(timeSinceLastConsumption/1000)}s ago. No credit consumed.`);
        setTimeout(() => {
            toast({ title: "Access Granted", description: `No credit was used as your last visit was within ${CONSUMPTION_COOLDOWN_MINUTES} minutes.`});
        }, 0);
        return true; 
    }

    let consumptionSuccessful = false;
    let toastProps: Parameters<typeof toast>[0] | null = null;
    let consumedFreeCredit = false;

    setEntitlements(prev => {
      if (prev.isLoading || prev.error) return prev;

      if (user.email === TEST_USER_EMAIL_FOR_MOCK_ENTITLEMENTS) {
        toastProps = { title: "Oracle Used (Test Account)", description: "Test account access used." };
        consumptionSuccessful = true;
        return prev; 
      }

      if (prev.isVip && prev.vipExpiresAt && Date.now() < prev.vipExpiresAt) {
        toastProps = { title: "Oracle Used (VIP)", description: "VIP access used." };
        consumptionSuccessful = true;
        return prev; 
      }
      if (prev.freeCreditsRemaining > 0 && prev.freeCreditsExpireAt && Date.now() < prev.freeCreditsExpireAt) {
        toastProps = { title: "Oracle Used (Free Credit)", description: "A free credit was used." };
        consumptionSuccessful = true;
        consumedFreeCredit = true; 
        return { ...prev, freeCreditsRemaining: prev.freeCreditsRemaining - 1 };
      }
      if (prev.paidCreditsRemaining > 0) {
        toastProps = { title: "Oracle Used (Paid Credit)", description: "A paid credit was used." };
        consumptionSuccessful = true;
        return { ...prev, paidCreditsRemaining: prev.paidCreditsRemaining - 1 };
      }
      
      toastProps = { title: "Insufficient Credits", description: "No available credits or VIP access.", variant: "destructive" };
      consumptionSuccessful = false;
      return prev;
    });

    if (toastProps) {
        setTimeout(() => {
            toast(toastProps as Parameters<typeof toast>[0]);
        }, 0);
    }
    
    if (consumptionSuccessful) {
        const newPersistedData: PersistedEntitlementData = {
            consumedFreeCredits: persistedData.consumedFreeCredits + (consumedFreeCredit ? 1 : 0),
            lastConsumptionTime: now
        };
        localStorage.setItem(persistedDataKey, JSON.stringify(newPersistedData));
        console.log("[AuthContext] Persisted new entitlement data:", newPersistedData);
    }

    await new Promise(resolve => setTimeout(resolve, 300)); 
    return consumptionSuccessful;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserEntitlements();
    } else {
      setEntitlements({ ...initialEntitlementsState, isLoading: false });
    }
  }, [user, fetchUserEntitlements]);

  const signInWithGoogle = async () => {
    clearError();
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/profile");
      setTimeout(() => {
        toast({ title: "Sign In Successful", description: "You are now signed in with Google." });
      }, 0);
    } catch (err: any) {
      let message = `Error signing in with Google: ${err.message}`;
      if (err.code === 'auth/popup-closed-by-user') {
        message = 'Google Sign-In popup closed by user.';
      } else if (err.code === 'auth/cancelled-popup-request') {
        message = 'Multiple Google Sign-In popups opened. Please try again.';
      }
      setError(message);
      setTimeout(() => {
        toast({ title: "Sign In Error", description: message, variant: "destructive" });
      }, 0);
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
        setTimeout(() => {
          toast({ title: "Sign In Successful", description: "Welcome back!" });
        }, 0);
      } else {
        router.push("/verify-email");
        setTimeout(() => {
          toast({ title: "Verification Required", description: "Please check your email to verify your account first." });
        }, 0);
      }
    } catch (err: any) {
      let message = `Error signing in: ${err.message}`;
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = 'Invalid email or password. Please try again.';
      }
      setError(message);
      setTimeout(() => {
        toast({ title: "Sign In Error", description: message, variant: "destructive" });
      }, 0);
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    clearError();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      localStorage.removeItem(`entitlements_${userCredential.user.uid}`);
      router.push("/verify-email");
       setTimeout(() => {
        toast({
          title: "Registration Successful!",
          description: "Please check your inbox for a verification link.",
        });
      }, 0);
    } catch (err: any) {
      let message = `Error signing up: ${err.message}`;
      if (err.code === 'auth/email-already-in-use') {
        message = 'This email address is already in use by another account.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password is too weak. It should be at least 6 characters.';
      }
      setError(message);
       setTimeout(() => {
        toast({ title: "Registration Error", description: message, variant: "destructive" });
      }, 0);
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationEmail = async (): Promise<boolean> => {
    if (!auth.currentUser) {
      setTimeout(() => {
        toast({ title: "Error", description: "You are not currently logged in.", variant: "destructive" });
      }, 0);
      return false;
    }

    try {
      await sendEmailVerification(auth.currentUser);
      return true;
    } catch (err: any) {
      let message = `Failed to resend verification email: ${err.message}`;
      if (err.code === 'auth/too-many-requests') {
          message = "Too many requests. Please wait a while before trying again.";
      }
      setError(message);
      setTimeout(() => {
        toast({ title: "Error", description: message, variant: "destructive" });
      }, 0);
      return false;
    }
  };

  const signOutUser = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      router.push("/"); 
      setTimeout(() => {
        toast({ title: "Signed Out", description: "You have been signed out." });
      }, 0);
    } catch (err: any) {
      setError(`Error signing out: ${err.message}`);
      setTimeout(() => {
        toast({ title: "Sign Out Error", description: `Error signing out: ${err.message}`, variant: "destructive" });
      }, 0);
    } finally {
       // onAuthStateChanged will set loading to false
    }
  };
  
  useEffect(() => {
    if (user && user.emailVerified && !loading) {
        const currentPath = window.location.pathname;
        if (currentPath === "/login" || currentPath === "/signup" || currentPath === "/verify-email") {
            router.push("/profile");
        }
    }
  }, [user, loading, router]);


  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signOut: signOutUser, 
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      resendVerificationEmail,
      error,
      clearError,
      entitlements,
      fetchUserEntitlements,
      consumeOracleUse
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
