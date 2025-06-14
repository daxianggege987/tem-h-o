
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { Chrome } from "lucide-react"; // Using Chrome icon for Google as an example
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { user, signInWithGoogle, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push("/profile"); // Redirect if already logged in
    }
  }, [user, loading, router]);

  if (loading || user) {
    // Show a loading state or nothing while redirecting
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
          <CardTitle className="text-3xl font-headline text-primary">Login</CardTitle>
          <CardDescription className="font-headline">
            Sign in to access your profile and features.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button 
            onClick={signInWithGoogle} 
            className="w-full text-lg" 
            size="lg"
            disabled={loading}
          >
            <Chrome className="mr-2 h-5 w-5" /> 
            Sign in with Google
          </Button>
          {/* Add more social login buttons here if needed */}
        </CardContent>
      </Card>
    </main>
  );
}
