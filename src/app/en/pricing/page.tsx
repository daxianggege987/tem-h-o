"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles, CalendarClock, Home } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ZPayButton } from "@/components/ZPayButton";
import { getLocaleStrings } from "@/lib/locales";

export default function PricingPage() {
  const { user, loading } = useAuth();
  const uiStrings = getLocaleStrings('en');

  const product = {
    id: 'vip-annual-399',
    name: 'VIP Membership',
    price: '39.9',
  };

  const handlePaymentStart = () => {
    localStorage.setItem('paymentContext', 'vip-purchase');
    localStorage.setItem('paymentLanguage', 'en'); 
  };

  return (
    <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-5xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-headline font-bold text-primary">
            Choose Your Plan
          </h1>
          <p className="text-md sm:text-lg text-muted-foreground mt-2 font-headline">
            Unlock deeper insights and unlimited access.
          </p>
        </div>

        <div className="mt-8 flex justify-center">
            <Card className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 w-full max-w-sm border-primary border-2 relative overflow-hidden">
              <Badge 
                variant="default" 
                className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 rotate-45 px-4 py-2 text-xs bg-primary hover:bg-primary/90"
                style={{width: '120px', textAlign: 'center'}}
              >
                <Sparkles className="h-3 w-3 mr-1 inline-block" />
                Best Value
              </Badge>
              <CardHeader className="items-center text-center pt-8">
                <CalendarClock className="h-6 w-6 mb-2 text-primary" />
                <CardTitle className="text-2xl font-headline text-primary">Lifetime Wisdom Circle</CardTitle>
                <CardDescription className="text-3xl font-bold font-body text-foreground pt-2">¥39.9</CardDescription>
                <p className="text-sm text-muted-foreground">CNY / one-time payment</p>
                <p className="text-sm text-muted-foreground pt-1 h-10">One-time payment to unlock all premium features.</p>
              </CardHeader>
              <CardContent className="flex-grow space-y-3 pt-2 pb-6">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {[
                    "Custom Time Divination (VIP Exclusive)",
                    "Lifetime unlimited access",
                    "Exclusive pages for direct results",
                    "A pure, ad-free experience",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex-col space-y-2 px-6 pb-6">
                <div className="w-full space-y-2">
                   <ZPayButton 
                        product={product}
                        onPaymentStart={handlePaymentStart}
                        lang="en"
                        uiStrings={{...uiStrings, vipRecommendButton: "Pay with WeChat"}}
                        paymentType="wxpay"
                        className="bg-green-500 hover:bg-green-600 text-white"
                   />
                   <ZPayButton 
                        product={product}
                        onPaymentStart={handlePaymentStart}
                        lang="en"
                        uiStrings={{...uiStrings, vipRecommendButton: "Pay with Alipay"}}
                        paymentType="alipay"
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                   />
                 </div>
                <Link href="/en" className="w-full">
                  <Button variant="outline" className="w-full mt-2">
                    <Home className="h-4 w-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
              </CardFooter>
            </Card>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-12">
          Payments will be handled by a secure third-party provider. Your lifetime membership is a one-time purchase.
        </p>
      </div>
    </main>
  );
}

    