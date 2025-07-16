
"use client";

import { useState }from "react";
import { PayPalScriptProvider, PayPalButtons, type PayPalButtonsComponentProps } from "@paypal/react-paypal-js";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import type { LocaleStrings } from "@/lib/locales";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

interface PayPalButtonWrapperProps {
  product: {
    id: string;
    description: string;
    price: string;
  };
  onSuccess: () => void;
  uiStrings: LocaleStrings;
}

const PayPalButtonsComponent = ({ product, onSuccess, uiStrings }: PayPalButtonWrapperProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrder: PayPalButtonsComponentProps['createOrder'] = async (data, actions) => {
    // A check for user is removed here to allow guest checkout.
    // The userID will be passed as null to the capture endpoint for guests.
    setError(null);
    try {
      const res = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product }),
      });

      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.error || 'Failed to create PayPal order.');
      if (!responseData.id) throw new Error("The server did not return a valid order ID.");
      return responseData.id;
    } catch (err: any) {
      let errorMessage = err.message;
      if (err instanceof SyntaxError) {
          errorMessage = "An unexpected server response occurred. Please try again later.";
      }
      toast({ title: 'Error Creating Order', description: errorMessage, variant: 'destructive' });
      setError(errorMessage);
      throw new Error(errorMessage);
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
          userID: user ? user.uid : null, // Pass user.uid if logged in, otherwise null
          productID: product.id
        }),
      });

      const orderData = await res.json();
      if (!res.ok) throw new Error(orderData.error || 'Failed to capture payment.');
      
      onSuccess(); // Call the passed onSuccess function

    } catch (err: any) {
      let errorMessage = err.message;
      if (err instanceof SyntaxError) {
          errorMessage = "An unexpected server response occurred. Please try again later.";
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
  };
  
  const onCancel: PayPalButtonsComponentProps['onCancel'] = () => {
    toast({ title: 'Payment Cancelled', description: 'Your payment process was cancelled.' });
  };

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


export const PayPalWrapper = (props: PayPalButtonWrapperProps) => {
    if (!PAYPAL_CLIENT_ID) {
        return <p className="text-xs text-destructive text-center">PayPal payments are currently unavailable due to misconfiguration.</p>;
    }

    return (
        <PayPalScriptProvider options={{ "clientId": PAYPAL_CLIENT_ID, currency: "USD", intent: "capture" }}>
            <PayPalButtonsComponent {...props} />
        </PayPalScriptProvider>
    )
}
