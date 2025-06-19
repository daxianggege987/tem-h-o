
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, ShoppingBag, Award, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react"; // For mocking purchase state
import { useAuth } from "@/context/AuthContext"; // To potentially get user info
import { useToast } from "@/hooks/use-toast";

interface PricingOption {
  id: string;
  title: string;
  price: string;
  priceDetails: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonDisabledText?: string;
  icon: React.ReactNode;
  isPopular?: boolean;
  isOneTime?: boolean;
  purchaseLimitReached?: boolean; // Mock state
  actionLink?: string; // Placeholder for actual purchase action
}

export default function PricingCnPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  // Mock state for the one-time purchase. In a real app, this would come from backend.
  const [hasPurchasedOneTimeOffer, setHasPurchasedOneTimeOffer] = useState(false);

  // Simulate fetching purchase status
  useEffect(() => {
    if (user) {
      // In a real app, you'd fetch if this user has purchased the one-time offer from your backend.
      // This is just a frontend simulation.
      if (user.phoneNumber === "+8613181914554") {
         setHasPurchasedOneTimeOffer(false); // Allow test user to see it active
      } else {
         // For other users, you might fetch their actual status.
         // setHasPurchasedOneTimeOffer(true); // Example: if they had bought it
      }
    }
  }, [user]);

  const pricingOptions: PricingOption[] = [
    {
      id: 'one-time-10',
      title: '新手尝鲜包',
      price: '¥1.00',
      priceDetails: '人民币',
      description: '10 次测算机会',
      features: [
        "快速体验核心功能",
        "深入了解神谕指引",
        "每个用户限购一次"
      ],
      buttonText: '立即抢购',
      buttonDisabledText: '您已购买',
      icon: <Zap className="h-8 w-8 mb-3 text-primary" />,
      isOneTime: true,
      purchaseLimitReached: hasPurchasedOneTimeOffer, // Determined by state
      actionLink: '#', // Placeholder
    },
    {
      id: 'standard-30',
      title: '标准测算包',
      price: '¥29.90',
      priceDetails: '人民币',
      description: '30 次测算机会',
      features: [
        "满足日常使用需求",
        "多次探索不同问题",
        "可重复购买"
      ],
      buttonText: '立即购买',
      icon: <ShoppingBag className="h-8 w-8 mb-3 text-primary" />,
      actionLink: '#', // Placeholder
    },
    {
      id: 'annual-subscription',
      title: '年度智者会员',
      price: '¥188.00',
      priceDetails: '人民币 / 年',
      description: '365天订阅服务',
      features: [
        "全年畅享测算 (模拟)",
        "专享会员身份标识",
        "订阅时长可累计",
        "未来更多特权 (敬请期待)"
      ],
      buttonText: '立即订阅',
      icon: <Award className="h-8 w-8 mb-3 text-primary" />,
      isPopular: true,
      actionLink: '#', // Placeholder
    },
  ];

  const handlePurchase = (option: PricingOption) => {
    // PAYMENT INTEGRATION POINT
    // 1. Check if user is logged in.
    // 2. Call your backend API to initiate a payment session with your chosen payment provider (e.g., Stripe, Alipay, WeChat Pay via a third-party).
    // 3. The backend API would return a payment URL or data for the client-side SDK.
    // 4. Redirect user or use the payment provider's SDK to complete payment.
    // 5. Your backend webhook receives confirmation, verifies it, and updates user entitlements in Firestore.
    // 6. Frontend might poll for status or get an update via WebSocket/SSE.
    console.log(`Attempting to purchase: ${option.title} (ID: ${option.id})`);

    if (!user) {
      toast({ title: "请先登录", description: "您需要登录后才能进行购买。", variant: "destructive"});
      // Optionally, redirect to login page: router.push('/login');
      return;
    }

    if (option.isOneTime && hasPurchasedOneTimeOffer) {
      toast({ title: "购买限制", description: "此尝鲜包每位用户仅限购买一次。", variant: "destructive" });
      return;
    }

    // --- MOCK Success Logic (Remove for real implementation) ---
    toast({ title: "购买处理中 (模拟)", description: `正在处理您的 ${option.title} 购买请求...`});
    setTimeout(() => {
      if (option.isOneTime) {
        setHasPurchasedOneTimeOffer(true); // Mock state update
      }
      toast({ title: "购买成功 (模拟)", description: `您已成功购买 ${option.title}！实际应用中，此处会与支付网关交互。`});
      // In a real app, you'd then likely refetch user entitlements or navigate them.
    }, 1500);
    // --- END MOCK ---
  };

  return (
    <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-5xl">
        <div className="mb-8 md:mb-12 text-center relative">
          <Link href="/profile" className="absolute left-0 top-1/2 -translate-y-1/2 sm:left-4 text-primary hover:text-primary/80 transition-colors" aria-label="返回个人中心">
            <ArrowLeft className="h-6 w-6" />
            <span className="sr-only">返回个人中心</span>
          </Link>
          <h1 className="text-4xl sm:text-5xl font-headline font-bold text-primary">
            选择您的充值方案
          </h1>
          <p className="text-md sm:text-lg text-muted-foreground mt-3 font-headline max-w-xl mx-auto">
            解锁更多测算次数，开启您的智慧之旅。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {pricingOptions.map((option) => (
            <Card 
              key={option.id} 
              className={`flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl overflow-hidden 
                ${option.isPopular ? 'border-primary border-2 relative' : 'border-border'}
                ${option.purchaseLimitReached ? 'bg-muted/50' : ''}`}
            >
              {option.isPopular && !option.purchaseLimitReached && (
                <Badge 
                  variant="default" 
                  className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 rotate-45 px-6 py-2 text-sm bg-primary hover:bg-primary/90"
                  style={{width: '150px', textAlign: 'center', zIndex: 1}}
                >
                  热门推荐
                </Badge>
              )}
              <CardHeader className="items-center text-center pt-8 pb-4">
                {option.icon}
                <CardTitle className="text-2xl font-headline text-primary">{option.title}</CardTitle>
                <CardDescription className="text-4xl font-bold font-body text-foreground pt-3">{option.price}</CardDescription>
                <p className="text-sm text-muted-foreground">{option.priceDetails}</p>
                <p className="text-md text-muted-foreground pt-2 h-12">{option.description}</p>
              </CardHeader>
              <CardContent className="flex-grow space-y-3 pt-2 pb-6 px-6">
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  {option.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2.5 mt-0.5 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {option.isOneTime && option.purchaseLimitReached && (
                  <p className="text-xs text-center text-destructive p-2 rounded-md bg-destructive/10 mt-2">
                    提示：此新手体验包每位用户仅限购买一次。
                  </p>
                )}
              </CardContent>
              <CardFooter className="p-6">
                <Button 
                  className="w-full text-lg py-6" 
                  size="lg" 
                  variant={option.isPopular && !option.purchaseLimitReached ? "default" : "outline"}
                  disabled={option.purchaseLimitReached}
                  onClick={() => handlePurchase(option)}
                >
                  {option.purchaseLimitReached ? option.buttonDisabledText : option.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-12 px-4">
          安全支付由合作方处理。订阅服务可在您的个人中心管理或取消 (模拟功能)。所有解释权归本应用所有。
        </p>
      </div>
    </main>
  );
}
    

    