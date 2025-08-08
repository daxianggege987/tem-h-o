"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles, Loader2, CalendarClock, ScanLine, CreditCard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { getLocaleStrings, type LocaleStrings } from "@/lib/locales";

const pricingOptions = [
  {
    id: 'annual',
    title: '终身智者圈',
    price: '$39.99',
    value: '39.99',
    priceDetails: '一次性付费',
    description: '一次性付费，解锁全部高级功能',
    features: [
      "自定义时间测算 (VIP专属)",
      "不限次数，终身有效",
      "专属页面，结果直达",
      "纯净体验，无任何广告"
    ],
    icon: <CalendarClock className="h-6 w-6 mb-2 text-primary" />,
    isPopular: true,
  },
];

const VIP_PAYMENT_URL = "https://www.creem.io/test/payment/prod_1YcyBhz62eyJql3NiUYl6g";

export default function PricingCnPage() {
  const { loading } = useAuth();
  const router = useRouter();
  const uiStrings = getLocaleStrings('zh-CN');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchaseClick = () => {
    setIsProcessing(true);
    localStorage.setItem('paymentContext', 'vip-purchase');
    localStorage.setItem('paymentLanguage', 'zh-CN'); 
    window.location.href = VIP_PAYMENT_URL;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p>正在加载...</p>
      </main>
    )
  }
  
  return (
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
                    最具性价比
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
                   <Button onClick={handlePurchaseClick} className="w-full text-lg" size="lg" disabled={isProcessing}>
                      {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CreditCard className="mr-2 h-5 w-5" />}
                      {isProcessing ? '正在跳转...' : '立即购买'}
                    </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-12">
            支付由第三方安全处理。您的终身会员资格为一次性购买，无需订阅管理。
          </p>
        </div>
      </main>
  );
}
