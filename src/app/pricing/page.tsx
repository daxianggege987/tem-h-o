"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles, CalendarClock, Home, CreditCard } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const pricingOptions = [
  {
    id: 'annual',
    title: 'Lifetime Wisdom Circle',
    price: '$39.99',
    value: '39.99',
    priceDetails: 'USD / one-time payment',
    description: 'One-time payment to unlock all premium features.',
    features: [
      "Custom Time Divination (VIP Exclusive)",
      "Lifetime unlimited access",
      "Exclusive pages for direct results",
      "A pure, ad-free experience",
    ],
    icon: <CalendarClock className="h-6 w-6 mb-2 text-primary" />,
    isPopular: true,
  },
];

const VIP_PAYMENT_URL = "https://www.creem.io/test/payment/prod_1YcyBhz62eyJql3NiUYl6g";

export default function PricingPage() {
  const { user, loading } = useAuth();

  const handlePurchaseClick = () => {
    // Set context for the payment success page to know this was a VIP purchase
    localStorage.setItem('paymentContext', 'vip-purchase');
    // Set language context for correct redirection
    localStorage.setItem('paymentLanguage', 'en'); 
    window.location.href = VIP_PAYMENT_URL;
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
          {pricingOptions.map((option) => (
            <Card key={option.id} className={`flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 w-full max-w-sm ${option.isPopular ? 'border-primary border-2 relative overflow-hidden' : 'border-border'}`}>
              {option.isPopular && (
                <Badge 
                  variant="default" 
                  className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 rotate-45 px-4 py-2 text-xs bg-primary hover:bg-primary/90"
                  style={{width: '120px', textAlign: 'center'}}
                >
                  <Sparkles className="h-3 w-3 mr-1 inline-block" />
                  Best Value
                </Badge>
              )}
              <CardHeader className="items-center text-center pt-8">
                {option.icon}
                <CardTitle className="text-2xl font-headline text-primary">{option.title}</CardTitle>
                <CardDescription className="text-3xl font-bold font-body text-foreground pt-2">{option.price}</CardDescription>
                <p className="text-sm text-muted-foreground">{option.priceDetails}</p>
                <p className="text-sm text-muted-foreground pt-1 h-10">{option.description}</p>
              </CardHeader>
              <CardContent className="flex-grow space-y-3 pt-2 pb-6">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {option.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex-col space-y-2 px-6 pb-6">
                <Button onClick={handlePurchaseClick} className="w-full text-lg" size="lg">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Purchase Now
                </Button>
                <Link href="/" className="w-full">
                  <Button variant="outline" className="w-full mt-2">
                    <Home className="h-4 w-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-12">
          Payments will be handled by a secure third-party provider. Your lifetime membership is a one-time purchase.
        </p>
      </div>
    </main>
  );
}
