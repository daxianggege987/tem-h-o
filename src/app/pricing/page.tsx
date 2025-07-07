
"use client";

import { useState } from "react";
import { PayPalScriptProvider, PayPalButtons, type PayPalButtonsComponentProps } from "@paypal/react-paypal-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Sparkles, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

// The numeric `value` is what we'll send to the PayPal API.
const pricingOptions = [
  {
    id: 'annual', // Keep ID for backend logic
    title: 'Lifetime Wisdom Circle',
    price: '$39.99',
    value: '39.99', // Numeric value for API
    priceDetails: 'USD / lifetime',
    description: 'Unlimited predictions, forever',
    features: [
      "Best Value!",
      "Become a VIP member",
      "Lifetime unlimited access",
      "Pay once, use forever"
    ],
    icon: <Sparkles className="h-6 w-6 mb-2 text-primary" />,
    isPopular: true,
  },
];

// Ensure your PayPal Client ID is in a .env.local file
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

interface PayPalButtonWrapperProps {
  product: {
    id: string;
    description: string;
    price: string;
  };
}

const PayPalButtonWrapper = ({ product }: PayPalButtonWrapperProps) => {
  const { toast } = useToast();
  const { user, fetchUserEntitlements } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const createOrder: PayPalButtonsComponentProps['createOrder'] = async (data, actions) => {
    setError(null);
    try {
      const res = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || 'Failed to create PayPal order.');
      }
      
      if (!responseData.id) {
          throw new Error("The server did not return a valid order ID.");
      }

      return responseData.id;
    } catch (err: any) {
      let errorMessage = err.message;
      if (err instanceof SyntaxError) {
          errorMessage = "An unexpected server response occurred. Please try again later.";
          console.error("Failed to parse JSON response from server:", err);
      }
      
      if (errorMessage && errorMessage.includes('invalid_client')) {
        errorMessage = "支付服务配置错误，暂时无法创建订单。请联系网站管理员解决此问题。(错误: Client Authentication Failed)";
        toast({
          title: "支付配置错误 (请检查)",
          description: "PayPal客户端ID或密钥不正确。请您前往PayPal开发者后台，确认您的 'Live' 模式凭证是否正确，并更新到您网站的后台配置中。",
          variant: "destructive",
          duration: 15000,
        });
      } else if (errorMessage && errorMessage.includes('PAYEE_ACCOUNT_RESTRICTED')) {
        errorMessage = "The merchant's PayPal account is currently restricted and cannot receive payments. Please contact support for assistance. (商家账户受限，暂时无法收款，请联系客服)";
        toast({
          title: "Payment Error / 支付错误",
          description: errorMessage,
          variant: "destructive",
          duration: 10000,
        });
      } else if (errorMessage && errorMessage.includes('not enabled for Unbranded Guest Payments')) {
        errorMessage = "This merchant's account isn't set up for direct card payments yet. Please use the 'Pay with PayPal' option to log in and pay.";
        toast({ 
          title: 'Card Payment Unavailable', 
          description: errorMessage, 
          variant: 'destructive',
          duration: 10000
        });
      } else {
        toast({ title: 'Error Creating Order', description: errorMessage, variant: 'destructive' });
      }
      
      setError(errorMessage);
      throw new Error(errorMessage); // Re-throw to trigger PayPal's onError
    }
  };

  const onApprove: PayPalButtonsComponentProps['onApprove'] = async (data, actions) => {
    setIsProcessing(true);
    try {
      toast({ title: "Processing Payment...", description: "Please wait while we confirm your payment." });
      const res = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderID: data.orderID,
          userID: user ? user.uid : null, // Pass UID if logged in, otherwise null
          productID: product.id
        }),
      });

      const orderData = await res.json();
      if (!res.ok) {
        throw new Error(orderData.error || 'Failed to capture payment.');
      }

      // Refetch user entitlements to update the UI if the user is logged in
      if (user) {
        await fetchUserEntitlements();
      }
      router.push('/vip202577661516');
      
    } catch (err: any) {
      let errorMessage = err.message;
      if (err instanceof SyntaxError) {
          errorMessage = "An unexpected server response occurred. Please try again later.";
          console.error("Failed to parse JSON response from server:", err);
      }
      setError(errorMessage);
      toast({ title: 'Payment Error', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const onError: PayPalButtonsComponentProps['onError'] = (err) => {
    console.error("PayPal button error:", err);
    toast({ title: 'PayPal Error', description: 'An unexpected error occurred with PayPal. Please try again.', variant: 'destructive' });
  }
  
  const onCancel: PayPalButtonsComponentProps['onCancel'] = () => {
    toast({ title: 'Payment Cancelled', description: 'Your payment process was cancelled.' });
  }

  return (
    <div className="w-full relative min-h-[100px]">
       {isProcessing && (
         <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-20 rounded-md">
            <Loader2 className="h-8 w-8 animate-spin text-primary"/>
            <p className="text-sm mt-2 text-muted-foreground">Finalizing...</p>
         </div>
       )}
      <PayPalButtons
        key={product.id}
        className="relative z-10"
        style={{ layout: "vertical", label: "buynow" }}
        createOrder={createOrder}
        onApprove={onApprove}
        onError={onError}
        onCancel={onCancel}
        disabled={isProcessing}
      />
      {error && <p className="text-xs text-destructive text-center mt-2">{error}</p>}
    </div>
  );
};


export default function PricingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p>Loading...</p>
      </main>
    )
  }
  
  if (PAYPAL_CLIENT_ID === "") {
     return (
      <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md text-center border-destructive">
          <CardHeader><CardTitle className="text-destructive">Configuration Error / 配置错误</CardTitle></CardHeader>
          <CardContent className="space-y-2">
             <p>The PayPal Client ID is missing. Please ensure `NEXT_PUBLIC_PAYPAL_CLIENT_ID` is configured in your environment variables.</p>
             <p className="text-muted-foreground">缺少 PayPal 客户端 ID。请确保 `NEXT_PUBLIC_PAYPAL_CLIENT_ID` 已在您的环境变量中配置。</p>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
     <PayPalScriptProvider options={{ "clientId": PAYPAL_CLIENT_ID, currency: "USD", intent: "capture" }}>
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
                </CardContent>
                <CardFooter>
                  <PayPalButtonWrapper product={{ id: option.id, description: option.title, price: option.value }} />
                </CardFooter>
              </Card>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-12">
            Secure payments processed by PayPal. Your lifetime membership is a one-time purchase and does not require subscription management.
          </p>
        </div>
      </main>
     </PayPalScriptProvider>
  );
}
