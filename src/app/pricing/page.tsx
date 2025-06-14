
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Sparkles, DollarSign, Zap, ArrowLeft } from "lucide-react";
import Link from "next/link";

const pricingOptions = [
  {
    id: 'one-time',
    title: 'Quick Oracle Boost',
    price: '$1.00',
    priceDetails: 'USD',
    description: '10 Predictions',
    features: [
      "Perfect for a quick insight",
      "Can only be purchased once"
    ],
    buttonText: 'Get 10 Predictions',
    icon: <Zap className="h-6 w-6 mb-2 text-primary" />,
    isOneTime: true,
  },
  {
    id: 'monthly',
    title: 'Monthly Oracle Pass',
    price: '$19.90',
    priceDetails: 'USD / month',
    description: 'Unlimited predictions for 30 days',
    features: [
      "Access to all standard features",
      "Regular updates"
    ],
    buttonText: 'Subscribe Monthly',
    icon: <DollarSign className="h-6 w-6 mb-2 text-primary" />,
  },
  {
    id: 'quarterly',
    title: 'Quarterly Sage Plan',
    price: '$55.50',
    priceDetails: 'USD / 90 days',
    description: 'Unlimited predictions for 90 days',
    features: [
      "Save vs. Monthly plan",
      "Priority insights (mock feature)",
      "Early access to new features (mock feature)"
    ],
    buttonText: 'Subscribe Quarterly',
    icon: <DollarSign className="h-6 w-6 mb-2 text-primary" />,
    isPopular: true,
  },
  {
    id: 'semi-annual',
    title: '180-Day Harmony',
    price: '$105.50',
    priceDetails: 'USD / 180 days',
    description: 'Unlimited predictions for 180 days',
    features: [
      "Greater savings",
      "All Quarterly benefits",
      "Deeper wisdom journey (mock feature)"
    ],
    buttonText: 'Subscribe for 180 Days',
    icon: <DollarSign className="h-6 w-6 mb-2 text-primary" />,
  },
  {
    id: 'annual',
    title: 'Yearly Wisdom Circle',
    price: '$188.80',
    priceDetails: 'USD / year',
    description: 'Unlimited predictions for 365 days',
    features: [
      "Best Value!",
      "All benefits included",
      "Exclusive yearly forecast (mock feature)"
    ],
    buttonText: 'Subscribe Annually',
    icon: <DollarSign className="h-6 w-6 mb-2 text-primary" />,
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-5xl">
        <div className="mb-8 text-center relative">
          <Link href="/profile" className="absolute left-0 top-1/2 -translate-y-1/2 sm:left-4 text-primary hover:text-primary/80 transition-colors">
            <ArrowLeft className="h-6 w-6" />
            <span className="sr-only">Back to Profile</span>
          </Link>
          <h1 className="text-4xl sm:text-5xl font-headline font-bold text-primary">
            Choose Your Plan
          </h1>
          <p className="text-md sm:text-lg text-muted-foreground mt-2 font-headline">
            Unlock deeper insights and unlimited access.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {pricingOptions.map((option) => (
            <Card key={option.id} className={`flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 ${option.isPopular ? 'border-primary border-2 relative overflow-hidden' : 'border-border'}`}>
              {option.isPopular && (
                <Badge 
                  variant="default" 
                  className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 rotate-45 px-4 py-2 text-xs bg-primary hover:bg-primary/90"
                  style={{width: '120px', textAlign: 'center'}}
                >
                  <Sparkles className="h-3 w-3 mr-1 inline-block" />
                  Popular
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
                {option.isOneTime && (
                  <p className="text-xs text-center text-accent-foreground bg-accent/20 p-2 rounded-md">{option.details}</p>
                )}
              </CardContent>
              <CardFooter>
                <Button className="w-full text-lg" size="lg" variant={option.isPopular ? "default" : "outline"}>
                  {option.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-12">
          Secure payments processed by our partners. Subscriptions can be managed or canceled anytime from your profile (mock feature).
        </p>
      </div>
    </main>
  );
}
    
