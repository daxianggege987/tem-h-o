
"use client";

import type { User } from "firebase/auth";
import React, { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from "react";
import { auth, googleProvider, signInWithPopup } from "@/lib/firebase"; 
import { signOut as firebaseSignOut, onAuthStateChanged, type UserMetadata } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const INITIAL_FREE_CREDITS_AMOUNT_CONTEXT = 10;
const FREE_CREDIT_VALIDITY_HOURS_CONTEXT = 72;

// If you have a specific test Google account email for special entitlements, define it here.
// const TEST_USER_EMAIL_FOR_MOCK_ENTITLEMENTS = "testuser@example.com";

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
      setEntitlements(prev => ({ ...initialEntitlementsState, isLoading: false })); // Reset and ensure loading is false
      return;
    }

    setEntitlements(prev => ({ ...prev, isLoading: true, error: null }));
    console.log("[AuthContext] Simulating API call to: /api/get-user-entitlements for user:", user.uid);

    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      let mockResponse: Omit<UserEntitlements, 'isLoading' | 'error'>;

      const registrationTime = user.metadata?.creationTime ? new Date(user.metadata.creationTime).getTime() : Date.now();
      const freeCreditsExpiryTimestamp = registrationTime + (FREE_CREDIT_VALIDITY_HOURS_CONTEXT * 60 * 60 * 1000);
      const now = Date.now();
      const hasFreeCreditsExpired = now >= freeCreditsExpiryTimestamp;

      // Example: Provide special entitlements for a specific test email
      // if (user.email === TEST_USER_EMAIL_FOR_MOCK_ENTITLEMENTS) {
      //   mockResponse = {
      //     freeCreditsRemaining: hasFreeCreditsExpired ? 0 : INITIAL_FREE_CREDITS_AMOUNT_CONTEXT,
      //     freeCreditsExpireAt: freeCreditsExpiryTimestamp,
      //     paidCreditsRemaining: 50, // More paid credits for test user
      //     isVip: true,
      //     vipExpiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000, // VIP for 1 year
      //   };
      // } else {
        // Standard new user entitlements
        mockResponse = {
          freeCreditsRemaining: hasFreeCreditsExpired ? 0 : INITIAL_FREE_CREDITS_AMOUNT_CONTEXT,
          freeCreditsExpireAt: freeCreditsExpiryTimestamp,
          paidCreditsRemaining: 0,
          isVip: false,
          vipExpiresAt: null,
        };
      // }
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
    
    // MOCK: Simulate credit consumption directly in mock entitlements for immediate UI feedback
    setEntitlements(prev => {
      if (prev.isLoading || prev.error) return prev;

      // VIP Access
      if (prev.isVip && prev.vipExpiresAt && Date.now() < prev.vipExpiresAt) {
        toast({ title: "Oracle Used (VIP)", description: "VIP access used." });
        return prev; // No change in credits for VIP
      }
      // Free Credits
      if (prev.freeCreditsRemaining > 0 && prev.freeCreditsExpireAt && Date.now() < prev.freeCreditsExpireAt) {
        toast({ title: "Oracle Used (Free Credit)", description: "A free credit was used." });
        return { ...prev, freeCreditsRemaining: prev.freeCreditsRemaining - 1 };
      }
      // Paid Credits
      if (prev.paidCreditsRemaining > 0) {
        toast({ title: "Oracle Used (Paid Credit)", description: "A paid credit was used." });
        return { ...prev, paidCreditsRemaining: prev.paidCreditsRemaining - 1 };
      }
      // No access
      toast({ title: "Insufficient Credits", description: "No available credits or VIP access.", variant: "destructive" });
      return prev;
    });
    // In a real app, this would make a backend call. The backend handles deduction.
    // The frontend might optimistically update OR wait for fetchUserEntitlements.
    // For this simulation, we'll assume success and backend will update.
    // To see changes immediately in UI without real backend, you'd call fetchUserEntitlements() again.
    // toast({ title: "Oracle Used (Simulated)", description: "Credit consumption simulated. Backend would handle actual deduction." });
    // Simulate a small delay for the "backend call"
    await new Promise(resolve => setTimeout(resolve, 300));
    // After consumption, refetch entitlements to get updated counts from the (mock) backend
    // await fetchUserEntitlements(); 
    return true;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        // Check if it's a new user (first sign-in)
        const isNewUser = currentUser.metadata.creationTime === currentUser.metadata.lastSignInTime;
        if (isNewUser) {
          // TODO: In a real app, call a backend endpoint here to initialize user entitlements in Firestore.
          // e.g., await fetch(`${API_BASE_URL}/api/initialize-user-entitlements`, { method: 'POST' });
          console.log("[AuthContext] New user detected. Backend should initialize entitlements.");
        }
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
      // User state change will trigger onAuthStateChanged effect, which calls fetchUserEntitlements
      toast({ title: "Sign In Successful", description: "You are now signed in with Google." });
      router.push("/profile"); 
    } catch (err: any) {
      setError(`Error signing in with Google: ${err.message}`);
      toast({ title: "Sign In Error", description: `Error signing in with Google: ${err.message}`, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    setLoading(true);
    try {
      if (auth.currentUser) { 
        await firebaseSignOut(auth);
      }
      // setUser(null) will be handled by onAuthStateChanged, which also resets entitlements
      router.push("/"); 
      toast({ title: "Signed Out", description: "You have been signed out." });
    } catch (err: any) {
      setError(`Error signing out: ${err.message}`);
      toast({ title: "Sign Out Error", description: `Error signing out: ${err.message}`, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

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
