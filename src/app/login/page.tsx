
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Chrome } from "lucide-react"; // Using Chrome icon for Google
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const { user, loading, signInWithGoogle, error, clearError } = useAuth();
  const router = useRouter();
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

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
  };

  if (loading && !user) { 
    return (
      <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline text-primary">Sign In</CardTitle>
          <CardDescription className="font-headline">
            Sign in with your Google account to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button 
            onClick={handleGoogleSignIn} 
            className="w-full text-lg bg-card border border-input hover:bg-accent hover:text-accent-foreground text-foreground" 
            size="lg" 
            disabled={loading}
            variant="outline"
          >
            {loading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Chrome className="mr-2 h-5 w-5" />
            )}
            {loading ? "Signing in..." : "Sign in with Google"}
          </Button>
        </CardContent>
      </Card>
       <p className="text-center text-xs text-muted-foreground mt-8 max-w-xs">
        By signing in, you agree to our Terms of Service and Privacy Policy (these are placeholders, please link your actual policies).
      </p>
    </main>
  );
}
