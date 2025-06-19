
"use client";

import type { User } from "firebase/auth";
import React, { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from "react";
import { auth, googleProvider, signInWithPopup } from "@/lib/firebase"; 
import { signOut as firebaseSignOut, onAuthStateChanged, type UserMetadata } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

// Define the email address for your special test account here.
// IMPORTANT: Replace 'testuser@example.com' with your actual test Google account email.
const TEST_USER_EMAIL_FOR_MOCK_ENTITLEMENTS = "94722424@qq.com";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ""; // Keep this for future backend integration
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

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500)); 

    try {
      let mockResponse: Omit<UserEntitlements, 'isLoading' | 'error'>;
      const registrationTime = user.metadata?.creationTime ? new Date(user.metadata.creationTime).getTime() : Date.now();
      const now = Date.now();

      if (user.email === TEST_USER_EMAIL_FOR_MOCK_ENTITLEMENTS) {
        // Special entitlements for the test user
        console.log("[AuthContext] Applying special mock entitlements for test user:", user.email);
        mockResponse = {
          freeCreditsRemaining: 999, // Lots of "free" credits that don't really expire for testing
          freeCreditsExpireAt: now + (365 * 24 * 60 * 60 * 1000), // Effectively non-expiring for a year
          paidCreditsRemaining: 9999, // Lots of paid credits
          isVip: true,
          vipExpiresAt: now + (365 * 24 * 60 * 60 * 1000), // VIP for a year
        };
      } else {
        // Standard new user entitlements for everyone else
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

      // Test User always has access (simulating VIP or abundant credits)
      if (user.email === TEST_USER_EMAIL_FOR_MOCK_ENTITLEMENTS) {
        toast({ title: "Oracle Used (Test Account)", description: "Test account access used." });
        consumptionSuccessful = true;
        // Optionally, decrement test user credits if you want to see them go down, but generally not needed for bypass.
        // return { ...prev, paidCreditsRemaining: Math.max(0, prev.paidCreditsRemaining -1) }; 
        return prev; // No change in credits for super test user, effectively unlimited.
      }

      // VIP Access for regular users
      if (prev.isVip && prev.vipExpiresAt && Date.now() < prev.vipExpiresAt) {
        toast({ title: "Oracle Used (VIP)", description: "VIP access used." });
        consumptionSuccessful = true;
        return prev; 
      }
      // Free Credits for regular users
      if (prev.freeCreditsRemaining > 0 && prev.freeCreditsExpireAt && Date.now() < prev.freeCreditsExpireAt) {
        toast({ title: "Oracle Used (Free Credit)", description: "A free credit was used." });
        consumptionSuccessful = true;
        return { ...prev, freeCreditsRemaining: prev.freeCreditsRemaining - 1 };
      }
      // Paid Credits for regular users
      if (prev.paidCreditsRemaining > 0) {
        toast({ title: "Oracle Used (Paid Credit)", description: "A paid credit was used." });
        consumptionSuccessful = true;
        return { ...prev, paidCreditsRemaining: prev.paidCreditsRemaining - 1 };
      }
      
      // No access for regular users
      toast({ title: "Insufficient Credits", description: "No available credits or VIP access.", variant: "destructive" });
      consumptionSuccessful = false;
      return prev;
    });
    
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate backend call delay
    // In a real app with a backend, the backend would confirm success/failure.
    // Here, consumptionSuccessful is determined by the frontend mock logic.
    return consumptionSuccessful;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        // const isNewUser = currentUser.metadata.creationTime === currentUser.metadata.lastSignInTime;
        // console.log(`[AuthContext] User state changed. UID: ${currentUser.uid}, Email: ${currentUser.email}, IsNewUser: ${isNewUser}`);
        // if (isNewUser) {
        //   console.log("[AuthContext] New user detected by timestamp. Backend should initialize entitlements if this were live.`);
        // }
        await fetchUserEntitlements(); 
      } else {
        setEntitlements(prev => ({ ...initialEntitlementsState, isLoading: false }));
      }
    });
    return () => unsubscribe();
  }, [fetchUserEntitlements]); // fetchUserEntitlements is stable due to useCallback on `user`

  const signInWithGoogle = async () => {
    clearError();
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      // User state change will trigger onAuthStateChanged effect, which calls fetchUserEntitlements.
      // router.push("/profile") will be called after successful fetchUserEntitlements if logic is there.
      toast({ title: "Sign In Successful", description: "You are now signed in with Google." });
       // router.push("/profile"); // Let onAuthStateChanged handle initial data load, then route.
    } catch (err: any) {
      setError(`Error signing in with Google: ${err.message}`);
      toast({ title: "Sign In Error", description: `Error signing in with Google: ${err.message}`, variant: "destructive" });
    } finally {
      // setLoading(false); // setLoading(false) is handled by onAuthStateChanged
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
      setLoading(false); // User will be null, onAuthStateChanged sets loading to false.
    }
  };
  
  // Effect to redirect after user state is confirmed and entitlements loaded (or attempted)
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
