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
        title: "邮箱已验证！",
        description: "您现在可以访问所有功能了。",
      });
      router.push("/profile");
    }
  }, [user, loading, router, toast]);
  
  if (loading) {
     return (
      <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p>正在加载用户状态...</p>
      </main>
    );
  }

  if (!user) {
    return (
        <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
             <Card className="w-full max-w-md shadow-xl text-center">
                <CardHeader>
                    <CardTitle className="text-3xl font-headline text-primary">需要验证</CardTitle>
                    <CardDescription className="font-headline">请先登录以继续。</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => router.push('/login')} className="w-full">前往登录</Button>
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
        title: "邮件已发送",
        description: "新的验证链接已发送到您的邮箱地址。",
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
          <CardTitle className="text-3xl font-headline text-primary">验证您的邮箱</CardTitle>
          <CardDescription className="pt-2 text-md">
            一封验证链接已发送至 <br/> <span className="font-semibold text-foreground">{user.email}</span>。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
                请点击邮件中的链接以完成注册。如果没有看到邮件，请检查您的垃圾邮件文件夹。
            </p>
            <Button 
              onClick={handleResendEmail} 
              className="w-full"
              disabled={isResending}
            >
               {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              重新发送验证邮件
            </Button>
             <p className="text-xs text-muted-foreground pt-4">
                验证后，您可以重新登录。
            </p>
            <Button onClick={signOut} variant="outline" className="w-full">
                返回登录页面
            </Button>
        </CardContent>
      </Card>
    </main>
  );
}
