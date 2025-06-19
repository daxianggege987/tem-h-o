
"use client";

import type { User } from "firebase/auth";
import React, { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from "react";
import { auth, signInWithCustomToken } from "@/lib/firebase"; 
import { signOut as firebaseSignOut, onAuthStateChanged, type UserMetadata } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

// For native builds, set NEXT_PUBLIC_API_BASE_URL to your deployed backend URL.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const TEST_PHONE_NUMBER_E164_CONTEXT = "+8613181914554"; // For test user entitlements
const INITIAL_FREE_CREDITS_AMOUNT_CONTEXT = 10;
const FREE_CREDIT_VALIDITY_HOURS_CONTEXT = 72;

export interface UserEntitlements {
  freeCreditsRemaining: number;
  freeCreditsExpireAt: number | null; // Timestamp when free credits expire
  paidCreditsRemaining: number;
  isVip: boolean;
  vipExpiresAt: number | null; // Timestamp when VIP expires
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean; // Auth state loading
  signOut: () => Promise<void>;
  sendCustomOtp: (phoneNumber: string) => Promise<boolean>; 
  verifyCustomOtp: (phoneNumber: string, otp: string) => Promise<void>;
  mockSignInForTestUser: (phoneNumber: string) => void; 
  showOtpInput: boolean;
  error: string | null; // Auth-related errors
  clearError: () => void;
  entitlements: UserEntitlements;
  fetchUserEntitlements: () => Promise<void>;
  consumeOracleUse: () => Promise<boolean>; // Returns true if consumption call "succeeded"
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
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entitlements, setEntitlements] = useState<UserEntitlements>(initialEntitlementsState);
  const router = useRouter();
  const { toast } = useToast();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchUserEntitlements = useCallback(async () => {
    if (!user) {
      setEntitlements(initialEntitlementsState); // Reset if no user
      return;
    }

    setEntitlements(prev => ({ ...prev, isLoading: true, error: null }));
    console.log("[AuthContext] Simulating API call to: /api/get-user-entitlements for user:", user.uid);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      // MOCK BACKEND RESPONSE
      let mockResponse: Omit<UserEntitlements, 'isLoading' | 'error'>;

      const registrationTime = user.metadata?.creationTime ? new Date(user.metadata.creationTime).getTime() : Date.now();
      const freeCreditsExpiryTimestamp = registrationTime + (FREE_CREDIT_VALIDITY_HOURS_CONTEXT * 60 * 60 * 1000);
      const now = Date.now();
      const hasFreeCreditsExpired = now >= freeCreditsExpiryTimestamp;

      if (user.phoneNumber === TEST_PHONE_NUMBER_E164_CONTEXT || (user.uid && user.uid.startsWith("mock-uid-"))) {
        // Test user entitlements
        mockResponse = {
          freeCreditsRemaining: hasFreeCreditsExpired ? 0 : INITIAL_FREE_CREDITS_AMOUNT_CONTEXT,
          freeCreditsExpireAt: freeCreditsExpiryTimestamp,
          paidCreditsRemaining: 5,
          isVip: true,
          vipExpiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // VIP for 30 days
        };
      } else {
        // Generic logged-in user entitlements (simulates new user)
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
    // In a real app, this would make a backend call. The backend handles deduction.
    // The frontend might optimistically update or wait for fetchUserEntitlements.
    // For this simulation, we'll assume success and backend will update.
    // To see changes immediately in UI without real backend, you'd call fetchUserEntitlements() again.
    toast({ title: "Oracle Used (Simulated)", description: "Credit consumption simulated. Backend would handle actual deduction." });
    // Simulate a small delay for the "backend call"
    await new Promise(resolve => setTimeout(resolve, 300));
    // After consumption, refetch entitlements to get updated counts from the (mock) backend
    await fetchUserEntitlements(); 
    return true;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        setShowOtpInput(false);
        fetchUserEntitlements(); // Fetch entitlements when user logs in or auth state changes
      } else {
        setEntitlements(initialEntitlementsState); // Reset entitlements if user logs out
      }
    });
    return () => unsubscribe();
  }, [fetchUserEntitlements]);


  const sendCustomOtp = async (phoneNumber: string): Promise<boolean> => {
    clearError();
    setLoading(true);
    try {
      const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+86${phoneNumber}`;
      const response = await fetch(`${API_BASE_URL}/api/send-custom-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: formattedPhoneNumber }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send OTP');
      setShowOtpInput(true);
      toast({ title: "OTP Sent", description: `An OTP has been sent to ${formattedPhoneNumber}.` });
      return true; 
    } catch (err: any) {
      setError(`Error sending OTP: ${err.message}`);
      toast({ title: "OTP Error", description: `Error sending OTP: ${err.message}`, variant: "destructive" });
      return false; 
    } finally {
      setLoading(false);
    }
  };

  const verifyCustomOtp = async (phoneNumber: string, otp: string) => {
    clearError();
    setLoading(true);
    try {
      const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+86${phoneNumber}`;
      const response = await fetch(`${API_BASE_URL}/api/verify-custom-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: formattedPhoneNumber, otp }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Failed to verify OTP');
      if (data.token) {
        await signInWithCustomToken(auth, data.token);
        // User state change will trigger fetchUserEntitlements via onAuthStateChanged effect
        setShowOtpInput(false);
        toast({ title: "Login Successful", description: "You are now logged in." });
        router.push("/profile");
      } else {
        setError("OTP verified, but login incomplete. Missing Firebase token.");
        toast({ title: "Login Incomplete", description: "OTP verified, but final login step failed.", variant: "destructive" });
      }
    } catch (err: any) {
      setError(`Error verifying OTP: ${err.message}`);
      toast({ title: "OTP Error", description: `Error verifying OTP: ${err.message}`, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const mockSignInForTestUser = (phoneNumber: string) => {
    clearError();
    setLoading(true);
    const now = new Date();
    const creationTime = now.toISOString(); // Use current time for consistent testing of free credit expiry
    const lastSignInTime = creationTime;

    const mockUser: User = {
      uid: `mock-uid-${phoneNumber}`,
      phoneNumber: phoneNumber.startsWith('+') ? phoneNumber : `+86${phoneNumber}`, // Ensure E.164 for test user
      displayName: `Test User (${phoneNumber})`,
      email: null, emailVerified: false, isAnonymous: false, photoURL: null,
      providerData: [{ providerId: 'phone', uid: `mock-uid-${phoneNumber}`, displayName: `Test User (${phoneNumber})`, email: null, photoURL: null, phoneNumber: phoneNumber.startsWith('+') ? phoneNumber : `+86${phoneNumber}` }],
      metadata: { creationTime, lastSignInTime } as UserMetadata,
      providerId: 'firebase', refreshToken: 'mock-refresh-token', tenantId: null,
      delete: async () => { console.log("Mock user delete called"); },
      getIdToken: async () => 'mock-id-token',
      getIdTokenResult: async () => ({ token: 'mock-id-token', claims: {}, expirationTime: new Date(Date.now() + 3600 * 1000).toISOString(), issuedAtTime: new Date().toISOString(), signInProvider: 'custom', signInSecondFactor: null }),
      reload: async () => { console.log("Mock user reload called"); },
      toJSON: () => ({ uid: `mock-uid-${phoneNumber}`, displayName: `Test User (${phoneNumber})` }),
    };
    setUser(mockUser); // This will trigger onAuthStateChanged, which calls fetchUserEntitlements
    setShowOtpInput(false);
    setLoading(false);
    toast({ title: "Mock Login Successful", description: `Logged in as test user: ${phoneNumber}.` });
    router.push("/profile");
  };

  const signOutUser = async () => {
    setLoading(true);
    try {
      if (user && user.uid.startsWith('mock-uid-')) { // Handle mock user sign out
        setUser(null);
      } else if (auth.currentUser) { 
        await firebaseSignOut(auth);
      }
      // setUser(null) will be handled by onAuthStateChanged, which also resets entitlements
      setShowOtpInput(false);
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
      sendCustomOtp, 
      verifyCustomOtp,
      mockSignInForTestUser, 
      showOtpInput,
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

    