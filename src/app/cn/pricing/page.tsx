
"use client";

import { useState } from "react";
import { PayPalScriptProvider, PayPalButtons, type PayPalButtonsComponentProps } from "@paypal/react-paypal-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Sparkles, Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const pricingOptions = [
  {
    id: 'annual',
    title: '终身智者圈',
    price: '¥288',
    value: '39.99', // USD value for API
    priceDetails: '人民币 / 终身',
    description: '一次支付，永久使用',
    features: [
      "最具性价比！",
      "成为尊贵的VIP会员",
      "终身无限次测算",
      "解锁所有高级功能"
    ],
    icon: <Sparkles className="h-6 w-6 mb-2 text-primary" />,
    isPopular: true,
  },
];

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
      if (!res.ok) throw new Error(responseData.error || '创建PayPal订单失败。');
      if (!responseData.id) throw new Error("服务器未返回有效订单ID。");
      return responseData.id;
    } catch (err: any) {
      let errorMessage = err.message;
       if (errorMessage && errorMessage.includes('invalid_client')) {
        errorMessage = "支付服务配置错误，暂时无法创建订单。请联系网站管理员解决此问题。(错误: Client Authentication Failed)";
        toast({
          title: "支付配置错误 (请检查)",
          description: "PayPal客户端ID或密钥不正确。请您前往PayPal开发者后台，确认您的 'Live' 模式凭证是否正确，并更新到您网站的后台配置中。",
          variant: "destructive",
          duration: 15000,
        });
      } else {
        toast({ title: '创建订单出错', description: errorMessage, variant: 'destructive' });
      }
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const onApprove: PayPalButtonsComponentProps['onApprove'] = async (data, actions) => {
    setIsProcessing(true);
    try {
      toast({ title: "正在处理支付...", description: "请稍候，我们正在确认您的付款。" });
      const res = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderID: data.orderID,
          userID: user ? user.uid : null,
          productID: product.id
        }),
      });
      const orderData = await res.json();
      if (!res.ok) throw new Error(orderData.error || '捕获付款失败。');
      if (user) await fetchUserEntitlements();
      router.push('/cn/vip202577661516');
    } catch (err: any) {
      setError(err.message);
      toast({ title: '支付错误', description: err.message, variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const onError: PayPalButtonsComponentProps['onError'] = (err) => {
    console.error("PayPal按钮错误:", err);
    toast({ title: 'PayPal错误', description: 'PayPal出现意外错误，请重试。', variant: 'destructive' });
  }

  return (
    <div className="w-full relative min-h-[100px]">
       {isProcessing && (
         <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-20 rounded-md">
            <Loader2 className="h-8 w-8 animate-spin text-primary"/>
            <p className="text-sm mt-2 text-muted-foreground">处理中...</p>
         </div>
       )}
      <PayPalButtons
        key={product.id}
        className="relative z-10"
        style={{ layout: "vertical", label: "buynow", locale: "zh_C2" }}
        createOrder={createOrder}
        onApprove={onApprove}
        onError={onError}
        disabled={isProcessing}
      />
      {error && <p className="text-xs text-destructive text-center mt-2">{error}</p>}
    </div>
  );
};

export default function PricingCnPage() {
  const { loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p>正在加载...</p>
      </main>
    )
  }
  
  if (PAYPAL_CLIENT_ID === "") {
     return (
      <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md text-center border-destructive">
          <CardHeader><CardTitle className="text-destructive">配置错误</CardTitle></CardHeader>
          <CardContent className="space-y-2">
             <p>缺少 PayPal 客户端 ID。请确保 `NEXT_PUBLIC_PAYPAL_CLIENT_ID` 已在您的环境变量中正确配置。</p>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
     <PayPalScriptProvider options={{ "clientId": PAYPAL_CLIENT_ID, currency: "USD", intent: "capture" }}>
      <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center p-4 sm:p-8">
        <div className="w-full max-w-5xl">
          <div className="mb-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-headline font-bold text-primary">
              选择您的方案
            </h1>
            <p className="text-md sm:text-lg text-muted-foreground mt-2 font-headline">
              解锁更深刻的洞见与无限次使用权。
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
                    热门推荐
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
            支付由PayPal安全处理。您的终身会员资格为一次性购买，无需订阅管理。
          </p>
        </div>
      </main>
     </PayPalScriptProvider>
  );
}
