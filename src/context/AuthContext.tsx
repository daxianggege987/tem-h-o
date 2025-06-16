
"use client";

import type { User } from "firebase/auth";
import React, { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from "react";
import { auth, signInWithCustomToken } from "@/lib/firebase"; 
import { signOut as firebaseSignOut, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  sendCustomOtp: (phoneNumber: string) => Promise<boolean>; 
  verifyCustomOtp: (phoneNumber: string, otp: string) => Promise<void>;
  mockSignInForTestUser: (phoneNumber: string) => void; // New function for mock sign-in
  showOtpInput: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        setShowOtpInput(false); 
      }
    });
    return () => unsubscribe();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const sendCustomOtp = async (phoneNumber: string): Promise<boolean> => {
    clearError();
    setLoading(true);
    try {
      const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+86${phoneNumber}`;

      const response = await fetch('/api/send-custom-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: formattedPhoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

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
      const response = await fetch('/api/verify-custom-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: formattedPhoneNumber, otp }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to verify OTP');
      }
      
      if (data.token) {
        await signInWithCustomToken(auth, data.token);
        setShowOtpInput(false);
        toast({ title: "Login Successful", description: "You are now logged in." });
        router.push("/profile");
      } else {
        // This case implies OTP was verified by backend but token was not provided or Admin SDK failed.
        // For the test account with mock login, this path won't be hit if login page calls mockSignIn directly.
        console.warn("OTP verified with custom backend, but no Firebase token received. User not signed into Firebase.");
        setError("OTP verified, but login incomplete. Missing Firebase token from backend.");
        toast({ title: "Login Incomplete", description: "OTP verified, but final login step failed. Backend might be missing token generation.", variant: "destructive" });
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
    const mockUser = {
      uid: `mock-uid-${phoneNumber}`,
      phoneNumber: phoneNumber,
      displayName: `Test User (${phoneNumber})`,
      email: null,
      emailVerified: false,
      isAnonymous: false,
      photoURL: null,
      providerData: [{
        providerId: 'phone',
        uid: `mock-uid-${phoneNumber}`,
        displayName: `Test User (${phoneNumber})`,
        email: null,
        photoURL: null,
        phoneNumber: phoneNumber,
      }],
      metadata: {}, // Add other required fields as needed by 'User' type
      providerId: 'firebase', // A common default
      refreshToken: 'mock-refresh-token',
      tenantId: null,
      delete: async () => {},
      getIdToken: async () => 'mock-id-token',
      getIdTokenResult: async () => ({ token: 'mock-id-token', claims: {}, expirationTime: '', issuedAtTime: '', signInProvider: null, signInSecondFactor: null }),
      reload: async () => {},
      toJSON: () => ({}),
    } as User; // Type assertion

    setUser(mockUser);
    setShowOtpInput(false);
    setLoading(false);
    toast({ title: "Mock Login Successful", description: `Logged in as test user: ${phoneNumber}. (Not a real Firebase session)` });
    router.push("/profile");
  };

  const signOutUser = async () => {
    setLoading(true);
    try {
      // If the current user is a mock user, just clear them from state.
      // A real Firebase signOut would error if currentUser is a mock object not from Firebase.
      if (user && user.uid.startsWith('mock-uid-')) {
        setUser(null);
      } else if (auth.currentUser) { // Check if there's a real Firebase user
        await firebaseSignOut(auth);
        setUser(null);
      } else {
        setUser(null); // If no real user and not our mock user, just clear
      }
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
      clearError
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
