"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const signUpSchema = z.object({
  email: z.string().email({ message: "请输入有效的邮箱地址。" }),
  password: z.string().min(6, { message: "密码必须至少为6个字符。" }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "两次输入的密码不匹配。",
  path: ["confirmPassword"],
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const { user, loading, signUpWithEmail, error, clearError } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  useEffect(() => {
    if (error) {
      clearError(); 
      setIsSubmitting(false);
    }
  }, [error, clearError]);

  useEffect(() => {
    if (!loading && user) {
        router.push('/profile');
    }
  }, [user, loading, router]);

  const onSignUpSubmit: SubmitHandler<SignUpFormData> = async (data) => {
    setIsSubmitting(true);
    await signUpWithEmail(data.email, data.password);
    setIsSubmitting(false);
  };

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
          <CardTitle className="text-3xl font-headline text-primary">创建账户</CardTitle>
          <CardDescription className="font-headline">
            输入您的信息以完成注册
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(onSignUpSubmit)} className="space-y-4">
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
             <div>
              <Label htmlFor="confirmPassword">确认密码</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                placeholder="••••••••" 
                {...register("confirmPassword")}
                className={errors.confirmPassword ? "border-destructive" : ""}
                disabled={isSubmitting}
              />
              {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>}
            </div>
            <Button 
              type="submit" 
              className="w-full text-lg" 
              size="lg" 
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              注册
            </Button>
          </form>
        </CardContent>
         <CardFooter className="flex-col items-center text-center">
            <p className="text-sm text-muted-foreground mt-2 max-w-xs">
              已经有账户了？{" "}
              <Link href="/login" className="underline text-primary hover:text-primary/80">
                登录
              </Link>
            </p>
         </CardFooter>
      </Card>
    </main>
  );
}
