
"use client";

import type { User } from "firebase/auth";
import React, { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from "react";
import { auth, RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from "@/lib/firebase";
import { signOut as firebaseSignOut, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  setupRecaptcha: (elementId: string) => void;
  sendOtp: (phoneNumber: string) => Promise<void>;
  verifyOtp: (otp: string) => Promise<void>;
  confirmationResult: ConfirmationResult | null;
  showOtpInput: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Ensure window.recaptchaVerifier is typed correctly
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        setShowOtpInput(false); // Reset OTP flow if user is found
        setConfirmationResult(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const setupRecaptcha = useCallback((elementId: string) => {
    if (!window.recaptchaVerifier && auth) {
      try {
         // It's important that the reCAPTCHA element is visible or 'invisible' reCAPTCHA is used.
         // For invisible reCAPTCHA, the button that triggers sign-in is passed as a parameter.
         // Here we assume a visible container.
        window.recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
          'size': 'invisible', // can be 'normal' or 'invisible'
          'callback': (response: any) => {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
            // If 'invisible', this callback is called immediately.
            console.log("reCAPTCHA solved:", response);
          },
          'expired-callback': () => {
            // Response expired. Ask user to solve reCAPTCHA again.
            setError("reCAPTCHA response expired. Please try again.");
            toast({ title: "reCAPTCHA Error", description: "reCAPTCHA response expired. Please try again.", variant: "destructive" });
            if (window.recaptchaVerifier) {
              window.recaptchaVerifier.render().then((widgetId) => {
                // @ts-ignore // grecaptcha is a global from reCAPTCHA script
                if (typeof grecaptcha !== 'undefined' && grecaptcha.reset) {
                   // @ts-ignore
                  grecaptcha.reset(widgetId);
                }
              });
            }
          }
        });
        window.recaptchaVerifier.render().catch((err) => {
            setError(`reCAPTCHA render error: ${err.message}`);
            toast({ title: "reCAPTCHA Error", description: `reCAPTCHA render error: ${err.message}`, variant: "destructive" });
        });
      } catch (err: any) {
        setError(`RecaptchaVerifier error: ${err.message}`);
        toast({ title: "Setup Error", description: `RecaptchaVerifier error: ${err.message}`, variant: "destructive" });
      }
    }
  }, [toast]);

  const sendOtp = async (phoneNumber: string) => {
    clearError();
    if (!window.recaptchaVerifier) {
      setError("reCAPTCHA verifier not initialized. Ensure setupRecaptcha is called with a valid element ID.");
      toast({ title: "Setup Error", description: "reCAPTCHA verifier not initialized.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      // Ensure phoneNumber is in E.164 format (e.g., +16505551234)
      // For China, it would be like +8613800138000
      // For simplicity, we are not adding a country code selector here, assuming +86 for Chinese users
      const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+86${phoneNumber}`;

      const result = await signInWithPhoneNumber(auth, formattedPhoneNumber, window.recaptchaVerifier);
      setConfirmationResult(result);
      setShowOtpInput(true);
      toast({ title: "OTP Sent", description: `An OTP has been sent to ${formattedPhoneNumber}.` });
    } catch (err: any) {
      setError(`Error sending OTP: ${err.message}`);
      toast({ title: "OTP Error", description: `Error sending OTP: ${err.message}`, variant: "destructive" });
      // Reset reCAPTCHA if it exists, to allow retrying
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.render().then((widgetId) => {
          // @ts-ignore
           if (typeof grecaptcha !== 'undefined' && grecaptcha.reset) {
            // @ts-ignore
            grecaptcha.reset(widgetId);
          }
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (otp: string) => {
    clearError();
    if (!confirmationResult) {
      setError("No OTP confirmation context found. Please request an OTP first.");
      toast({ title: "Verification Error", description: "No OTP confirmation context found.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
      // onAuthStateChanged will handle setting the user
      setShowOtpInput(false); // Hide OTP input on success
      toast({ title: "Login Successful", description: "You are now logged in." });
      router.push("/profile");
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
      setConfirmationResult(null);
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
      setupRecaptcha,
      sendOtp, 
      verifyOtp,
      confirmationResult, 
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
