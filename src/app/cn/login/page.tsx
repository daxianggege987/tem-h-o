
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Chrome } from "lucide-react"; 
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Separator } from "@/components/ui/separator";

const loginSchema = z.object({
  email: z.string().email({ message: "无效的邮箱地址。" }),
  password: z.string().min(1, { message: "密码不能为空。" }),
});
type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { user, loading, signInWithGoogle, signInWithEmail, error, clearError } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (error) {
      if (!error.toLowerCase().includes('invalid email or password')) {
         toast({
           title: "认证错误",
           description: error,
           variant: "destructive",
         });
      }
      clearError();
      setIsSubmitting(false);
    }
  }, [error, toast, clearError]);

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    await signInWithGoogle();
  };

  const onEmailSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setIsSubmitting(true);
    await signInWithEmail(data.email, data.password);
    setIsSubmitting(false);
  };
  
  // Redirect to profile if already logged in
  useEffect(() => {
    if (!loading && user) {
        router.push('/cn/profile');
    }
  }, [user, loading, router]);


  if (loading || user) { 
    return (
      <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p>正在加载...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline text-primary">登录</CardTitle>
          <CardDescription className="font-headline">
            选择您的登录方式
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(onEmailSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">邮箱</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="you@example.com" 
                {...register("email")}
                className={errors.email ? "border-destructive" : ""}
                disabled={isSubmitting}
              />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="password">密码</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                {...register("password")}
                className={errors.password ? "border-destructive" : ""}
                disabled={isSubmitting}
              />
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
            </div>
            <Button 
              type="submit" 
              className="w-full text-lg" 
              size="lg" 
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              使用邮箱登录
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                或使用其他方式
              </span>
            </div>
          </div>

          <Button 
            onClick={handleGoogleSignIn} 
            className="w-full text-lg bg-card border border-input hover:bg-accent hover:text-accent-foreground text-foreground" 
            size="lg" 
            disabled={isSubmitting}
            variant="outline"
          >
            {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            <Chrome className="mr-2 h-5 w-5" />
            使用谷歌登录
          </Button>
        </CardContent>
         <CardFooter className="flex-col items-center text-center">
            <p className="text-sm text-muted-foreground mt-2 max-w-xs">
              还没有账户？{" "}
              <Link href="/cn/signup" className="underline text-primary hover:text-primary/80">
                注册
              </Link>
            </p>
           <p className="text-xs text-muted-foreground mt-4 max-w-xs">
            登录即表示您同意我们的服务条款和隐私政策 (占位符)。
          </p>
         </CardFooter>
      </Card>
    </main>
  );
}
