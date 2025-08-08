"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MailCheck } from "lucide-react";

export default function VerifyEmailPage() {
  const { user, loading, resendVerificationEmail, signOut } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!loading && user && user.emailVerified) {
      toast({
        title: "Email Verified!",
        description: "You can now access all features.",
      });
      router.push("/en/profile");
    }
  }, [user, loading, router, toast]);
  
  if (loading) {
     return (
      <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p>Loading user status...</p>
      </main>
    );
  }

  if (!user) {
    return (
        <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
             <Card className="w-full max-w-md shadow-xl text-center">
                <CardHeader>
                    <CardTitle className="text-3xl font-headline text-primary">Verification Required</CardTitle>
                    <CardDescription className="font-headline">Please log in to continue.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => router.push('/en/login')} className="w-full">Go to Login</Button>
                </CardContent>
             </Card>
        </main>
    )
  }

  const handleResendEmail = async () => {
    setIsResending(true);
    const success = await resendVerificationEmail();
    if (success) {
      toast({
        title: "Email Sent",
        description: "A new verification link has been sent to your email address.",
      });
    }
    setIsResending(false);
  };

  return (
    <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <MailCheck className="h-16 w-16 text-primary"/>
          </div>
          <CardTitle className="text-3xl font-headline text-primary">Verify Your Email</CardTitle>
          <CardDescription className="pt-2 text-md">
            A verification link has been sent to <br/> <span className="font-semibold text-foreground">{user.email}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
                Please click the link in the email to complete your registration. If you don't see it, check your spam folder.
            </p>
            <Button 
              onClick={handleResendEmail} 
              className="w-full"
              disabled={isResending}
            >
               {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Resend Verification Email
            </Button>
             <p className="text-xs text-muted-foreground pt-4">
                After verifying, you can sign in again.
            </p>
            <Button onClick={signOut} variant="outline" className="w-full">
                Back to Sign In Page
            </Button>
        </CardContent>
      </Card>
    </main>
  );
}
