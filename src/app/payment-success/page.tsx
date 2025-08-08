"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Verifying payment, please wait...");

  useEffect(() => {
    const paymentContext = localStorage.getItem('paymentContext');
    const paymentLanguage = localStorage.getItem('paymentLanguage');
    const isEnglish = paymentLanguage === 'en';

    if (paymentContext === 'vip-purchase') {
      const targetUrl = isEnglish ? '/en/vip202577661516' : '/vip202577661516';
      setMessage("VIP Purchase Successful! Redirecting...");
      router.push(targetUrl);
    } else if (paymentContext === 'source-code-purchase') {
      const targetUrl = isEnglish ? '/en/download' : '/download';
      setMessage("Source Code Purchase Successful! Redirecting to download page...");
      router.push(targetUrl);
    } else if (paymentContext === 'oracle-unlock') {
      const targetUrl = isEnglish ? '/en/reading' : '/reading';
      setMessage("Payment Successful! Unlocking your reading...");
      router.push(targetUrl);
    } else {
      setMessage("Could not determine payment context. Redirecting to homepage.");
      const targetUrl = isEnglish ? '/en' : '/';
      router.push(targetUrl);
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-headline text-primary">Processing</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p>{message}</p>
        </CardContent>
      </Card>
    </main>
  );
}
