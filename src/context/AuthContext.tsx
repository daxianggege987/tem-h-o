
"use client";

import type { User } from "firebase/auth";
import React, { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from "react";
import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword } from "@/lib/firebase"; 
import { signOut as firebaseSignOut, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const TEST_USER_EMAIL_FOR_MOCK_ENTITLEMENTS = "94722424@qq.com";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const INITIAL_FREE_CREDITS_AMOUNT_CONTEXT = 10;
const FREE_CREDIT_VALIDITY_HOURS_CONTEXT = 72;

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
  signInWithEmail: (email: string, password: string) => Promise<void>; // New
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
        console.log("[AuthContext] Applying standard mock entitlements for user:", user.email);
        mockResponse = {
          freeCreditsRemaining: hasFreeCreditsExpired ? 0 : INITIAL_FREE_CREDITS_AMOUNT_CONTEXT,
          freeCreditsExpireAt: freeCreditsExpiryTimestamp,
          paidCreditsRemaining: 0,
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
      toast({ title: "Error", description: "You must be logged in to use the oracle.", variant: "destructive" });
      return false;
    }
    console.log("[AuthContext] Simulating API call to: /api/consume-oracle-use for user:", user.uid);
    
    let consumptionSuccessful = false;
    setEntitlements(prev => {
      if (prev.isLoading || prev.error) return prev;

      if (user.email === TEST_USER_EMAIL_FOR_MOCK_ENTITLEMENTS) {
        toast({ title: "Oracle Used (Test Account)", description: "Test account access used." });
        consumptionSuccessful = true;
        return prev; 
      }

      if (prev.isVip && prev.vipExpiresAt && Date.now() < prev.vipExpiresAt) {
        toast({ title: "Oracle Used (VIP)", description: "VIP access used." });
        consumptionSuccessful = true;
        return prev; 
      }
      if (prev.freeCreditsRemaining > 0 && prev.freeCreditsExpireAt && Date.now() < prev.freeCreditsExpireAt) {
        toast({ title: "Oracle Used (Free Credit)", description: "A free credit was used." });
        consumptionSuccessful = true;
        return { ...prev, freeCreditsRemaining: prev.freeCreditsRemaining - 1 };
      }
      if (prev.paidCreditsRemaining > 0) {
        toast({ title: "Oracle Used (Paid Credit)", description: "A paid credit was used." });
        consumptionSuccessful = true;
        return { ...prev, paidCreditsRemaining: prev.paidCreditsRemaining - 1 };
      }
      
      toast({ title: "Insufficient Credits", description: "No available credits or VIP access.", variant: "destructive" });
      consumptionSuccessful = false;
      return prev;
    });
    
    await new Promise(resolve => setTimeout(resolve, 300)); 
    return consumptionSuccessful;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        await fetchUserEntitlements(); 
      } else {
        setEntitlements(prev => ({ ...initialEntitlementsState, isLoading: false }));
      }
    });
    return () => unsubscribe();
  }, [fetchUserEntitlements]);

  const signInWithGoogle = async () => {
    clearError();
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      toast({ title: "Sign In Successful", description: "You are now signed in with Google." });
    } catch (err: any) {
      let message = `Error signing in with Google: ${err.message}`;
      if (err.code === 'auth/popup-closed-by-user') {
        message = 'Google Sign-In popup closed by user.';
      } else if (err.code === 'auth/cancelled-popup-request') {
        message = 'Multiple Google Sign-In popups opened. Please try again.';
      }
      setError(message);
      toast({ title: "Sign In Error", description: message, variant: "destructive" });
    } finally {
      // setLoading(false); // onAuthStateChanged handles this
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    clearError();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Sign In Successful", description: "You are now signed in with your email." });
    } catch (err: any) {
      let message = `Error signing in: ${err.message}`;
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = 'Invalid email or password. Please try again.';
      }
      setError(message);
      toast({ title: "Sign In Error", description: message, variant: "destructive" });
    } finally {
      // setLoading(false); // onAuthStateChanged handles this
    }
  };

  const signOutUser = async () => {
    setLoading(true);
    try {
      if (auth.currentUser) { 
        await firebaseSignOut(auth);
      }
      router.push("/"); 
      toast({ title: "Signed Out", description: "You have been signed out." });
    } catch (err: any) {
      setError(`Error signing out: ${err.message}`);
      toast({ title: "Sign Out Error", description: `Error signing out: ${err.message}`, variant: "destructive" });
    } finally {
      // setLoading(false); // onAuthStateChanged handles this
    }
  };
  
  useEffect(() => {
    if (!loading && user && !entitlements.isLoading) {
        const currentPath = window.location.pathname;
        if (currentPath === "/login") {
            router.push("/profile");
        }
    }
  }, [user, loading, entitlements.isLoading, router]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signOut: signOutUser, 
      signInWithGoogle,
      signInWithEmail,
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
