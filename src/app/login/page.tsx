
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Phone, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TEST_PHONE_NUMBER_RAW = "13181914554";
const BYPASS_OTP_CODE = "BYPASS_OTP_FOR_TEST_ACCOUNT";

export default function LoginPage() {
  const { user, loading, sendCustomOtp, verifyCustomOtp, showOtpInput, error, clearError } = useAuth();
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [rawPhoneNumber, setRawPhoneNumber] = useState(""); 
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);
  const { toast } = useToast();

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
      clearError();
    }
  }, [error, toast, clearError]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawPhoneNumber.trim()) {
      toast({ title: "Validation Error", description: "请输入手机号码。", variant: "destructive"});
      return;
    }

    if (rawPhoneNumber === TEST_PHONE_NUMBER_RAW) {
      toast({ title: "Test Account", description: `Logging in test account: ${rawPhoneNumber}`});
      // Directly attempt to verify/login for the test account, bypassing OTP send
      await verifyCustomOtp(rawPhoneNumber, BYPASS_OTP_CODE);
      return;
    }

    if (!/^1[3-9]\d{9}$/.test(rawPhoneNumber)) {
        toast({ title: "Validation Error", description: "请输入有效的11位中国手机号码。", variant: "destructive"});
        return;
    }
    const success = await sendCustomOtp(rawPhoneNumber); 
    if (success) {
      setCountdown(300);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || loading) return;
     if (!rawPhoneNumber.trim()) {
      toast({ title: "Validation Error", description: "请输入手机号码。", variant: "destructive"});
      return;
    }
    if (rawPhoneNumber === TEST_PHONE_NUMBER_RAW) {
      // Should not reach here if handleSendOtp logic is correct, but as a fallback:
      toast({ title: "Test Account", description: `Logging in test account: ${rawPhoneNumber}`});
      await verifyCustomOtp(rawPhoneNumber, BYPASS_OTP_CODE);
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(rawPhoneNumber)) {
        toast({ title: "Validation Error", description: "请输入有效的11位中国手机号码。", variant: "destructive"});
        return;
    }
    const success = await sendCustomOtp(rawPhoneNumber);
    if (success) {
      setCountdown(300);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rawPhoneNumber === TEST_PHONE_NUMBER_RAW) {
      // This case should ideally be handled by handleSendOtp directly calling verifyCustomOtp
      // But if somehow user gets to OTP screen for test number:
      await verifyCustomOtp(rawPhoneNumber, BYPASS_OTP_CODE);
      return;
    }
    if (!otp.trim() || otp.length !== 6) {
       toast({ title: "Validation Error", description: "请输入6位验证码。", variant: "destructive"});
      return;
    }
    await verifyCustomOtp(rawPhoneNumber, otp); 
  };
  
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = e.target.value;
    setRawPhoneNumber(newNumber); 
    setPhoneNumber(newNumber); 
  };

  if (loading && !user && !showOtpInput) { 
    return (
      <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
        <p>Loading...</p>
      </main>
    );
  }

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
                    onChange={handlePhoneNumberChange}
                    required
                    className="pl-10 text-lg"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full text-lg" size="lg" disabled={loading}>
                {loading ? "处理中..." : "发送验证码 / 登录"}
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
                    className="pl-10 text-lg tracking-[0.3em]"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full text-lg" size="lg" disabled={loading}>
                {loading ? "验证中..." : "登录"}
              </Button>
               <Button 
                  variant="link" 
                  onClick={handleResendOtp} 
                  disabled={loading || countdown > 0} 
                  className="w-full"
                  type="button"
                >
                {countdown > 0 ? `重新发送 (${countdown}秒)` : "没有收到? 重新发送验证码"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
