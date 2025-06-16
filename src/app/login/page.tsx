
"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Phone, KeyRound } from "lucide-react"; // Icons for phone and OTP
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const { user, loading, setupRecaptcha, sendOtp, verifyOtp, showOtpInput, error, clearError } = useAuth();
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const { toast } = useToast();

  const recaptchaContainerId = "recaptcha-container";

  // Setup reCAPTCHA verifier when component mounts
  useEffect(() => {
    // Ensure the container exists before setting up reCAPTCHA
    if (document.getElementById(recaptchaContainerId)) {
       setupRecaptcha(recaptchaContainerId);
    }
  }, [setupRecaptcha]);


  useEffect(() => {
    if (user && !loading) {
      router.push("/profile");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Authentication Error",
        description: error,
        variant: "destructive",
      });
      clearError(); // Clear error after showing toast
    }
  }, [error, toast, clearError]);


  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      toast({ title: "Validation Error", description: "请输入手机号码。", variant: "destructive"});
      return;
    }
    // Basic validation for Chinese phone numbers (11 digits, starts with 1)
    if (!/^1[3-9]\d{9}$/.test(phoneNumber)) {
        toast({ title: "Validation Error", description: "请输入有效的11位中国手机号码。", variant: "destructive"});
        return;
    }
    await sendOtp(phoneNumber);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.length !== 6) {
       toast({ title: "Validation Error", description: "请输入6位验证码。", variant: "destructive"});
      return;
    }
    await verifyOtp(otp);
  };

  if (loading && !showOtpInput) { // Show loading only if not in OTP input phase, or if user already exists
    return (
      <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
        <p>Loading...</p>
      </main>
    );
  }
  // If user exists and loading is done, redirect is handled by useEffect

  return (
    <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline text-primary">用户登录</CardTitle>
          <CardDescription className="font-headline">
            {showOtpInput ? "请输入您收到的验证码" : "使用手机号码登录或注册"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!showOtpInput ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <Label htmlFor="phone" className="sr-only">手机号码</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="请输入手机号码"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    className="pl-10 text-lg"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full text-lg" size="lg" disabled={loading}>
                {loading ? "发送中..." : "发送验证码"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <Label htmlFor="otp" className="sr-only">验证码</Label>
                 <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="otp"
                    type="text"
                    placeholder="请输入6位验证码"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    maxLength={6}
                    className="pl-10 text-lg tracking-[0.3em]" // Added tracking for better OTP display
                  />
                </div>
              </div>
              <Button type="submit" className="w-full text-lg" size="lg" disabled={loading}>
                {loading ? "验证中..." : "登录"}
              </Button>
               <Button variant="link" onClick={() => sendOtp(phoneNumber)} disabled={loading} className="w-full">
                没有收到? 重新发送验证码
              </Button>
            </form>
          )}
          {/* This container is used by Firebase for reCAPTCHA */}
          <div id={recaptchaContainerId}></div>
        </CardContent>
      </Card>
    </main>
  );
}
