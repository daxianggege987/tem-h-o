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
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }), // Min 1 to ensure it's not empty
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
      // Custom errors from signInWithEmail are already toasted in AuthContext.
      // This handles general errors or Google sign-in errors specifically.
      if (!error.toLowerCase().includes('invalid email or password')) {
         toast({
           title: "Authentication Error",
           description: error,
           variant: "destructive",
         });
      }
      clearError(); // Clear error after displaying
      setIsSubmitting(false); // Ensure button is re-enabled on error
    }
  }, [error, toast, clearError]);

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    await signInWithGoogle();
    // isSubmitting will be reset by the error effect if one occurs
  };

  const onEmailSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setIsSubmitting(true);
    await signInWithEmail(data.email, data.password);
    setIsSubmitting(false); // Reset after attempt, AuthContext now handles routing.
  };
  
   useEffect(() => {
    if (!loading && user) {
        router.push('/en/profile');
    }
  }, [user, loading, router]);


  if (loading) { 
    return (
      <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline text-primary">Sign In</CardTitle>
          <CardDescription className="font-headline">
            Choose your preferred sign-in method.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(onEmailSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
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
              <Label htmlFor="password">Password</Label>
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
              Sign In with Email
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
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
            Sign in with Google
          </Button>
        </CardContent>
         <CardFooter className="flex-col items-center text-center">
            <p className="text-sm text-muted-foreground mt-2 max-w-xs">
              Don&apos;t have an account?{" "}
              <Link href="/en/signup" className="underline text-primary hover:text-primary/80">
                Sign up
              </Link>
            </p>
           <p className="text-xs text-muted-foreground mt-4 max-w-xs">
            By signing in, you agree to our Terms and Privacy Policy (placeholders).
          </p>
         </CardFooter>
      </Card>
    </main>
  );
}
