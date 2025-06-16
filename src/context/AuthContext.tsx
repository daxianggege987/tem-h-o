
"use client";

import type { User } from "firebase/auth";
import React, { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from "react";
import { auth, signInWithCustomToken } from "@/lib/firebase"; // signInWithPhoneNumber and RecaptchaVerifier removed
import { signOut as firebaseSignOut, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  // setupRecaptcha removed as it's for Firebase client-side phone auth
  sendCustomOtp: (phoneNumber: string) => Promise<void>;
  verifyCustomOtp: (phoneNumber: string, otp: string) => Promise<void>;
  // confirmationResult removed
  showOtpInput: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// window.recaptchaVerifier declaration can be removed if not used elsewhere
// declare global {
//   interface Window {
//     recaptchaVerifier?: RecaptchaVerifier;
//   }
// }

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // confirmationResult state removed
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

  // setupRecaptcha function removed

  const sendCustomOtp = async (phoneNumber: string) => {
    clearError();
    setLoading(true);
    try {
      // Ensure phoneNumber is in E.164 format or as your backend expects
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
    } catch (err: any) {
      setError(`Error sending OTP: ${err.message}`);
      toast({ title: "OTP Error", description: `Error sending OTP: ${err.message}`, variant: "destructive" });
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
      
      // IMPORTANT: The backend /api/verify-custom-otp should return a custom Firebase token in data.token
      // You then use this token to sign in with Firebase on the client.
      if (data.token) {
        await signInWithCustomToken(auth, data.token);
        // onAuthStateChanged will handle setting the user and redirecting
        setShowOtpInput(false);
        toast({ title: "Login Successful", description: "You are now logged in." });
        router.push("/profile");
      } else {
        // This case handles if the backend doesn't return a token (e.g. placeholder implementation)
        // For a real app, the backend MUST return a token for Firebase sign-in.
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

  const signOutUser = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setShowOtpInput(false);
      router.push("/"); // Redirect to home or login page
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
