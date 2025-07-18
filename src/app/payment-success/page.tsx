
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function PaymentSuccessPage() {
  const [isMounted, setIsMounted] = useState(false);
  const { fetchUserEntitlements } = useAuth();

  useEffect(() => {
    setIsMounted(true);
    // Attempt to refresh entitlements in case the user was logged in during purchase
    fetchUserEntitlements();
  }, [fetchUserEntitlements]);

  if (!isMounted) {
    return null; // Or a loading spinner
  }
  
  // Determine the correct VIP page based on browser language
  const vipPageUrl = navigator.language.toLowerCase().startsWith('zh') 
    ? '/cn/vip202577661516' 
    : '/vip202577661516';

  return (
    <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl text-center">
        <CardHeader className="p-6 md:p-8">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500"/>
          </div>
          <CardTitle className="text-2xl md:text-3xl font-headline text-primary">
            Payment Successful!
          </CardTitle>
          <CardDescription className="pt-2 text-muted-foreground text-base">
            Thank you for your purchase. Your access has been granted.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 py-4 pb-8 flex flex-col items-center space-y-4">
          <p className="text-sm text-foreground">
            You can now access your exclusive content using the button below.
          </p>
          <Link href={vipPageUrl}>
            <Button size="lg" className="text-lg">
                Proceed to Your Content
                <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground mt-6 text-center max-w-lg">
        If you have any questions, please contact us at 94722424@qq.com
      </p>
    </main>
  );
}
