
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

type PaymentContextType = 'oracle-unlock' | 'vip-purchase' | 'source-code-purchase' | null;
type LanguageContextType = 'en' | 'zh-CN' | 'ja' | null;

export default function PaymentSuccessPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [context, setContext] = useState<PaymentContextType>(null);
  const [language, setLanguage] = useState<LanguageContextType>(null);
  const { fetchUserEntitlements } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    
    // Fetch entitlements to update user status immediately after payment
    fetchUserEntitlements();

    const paymentContext = localStorage.getItem('paymentContext') as PaymentContextType;
    setContext(paymentContext);
    
    const paymentLanguage = localStorage.getItem('paymentLanguage') as LanguageContextType;
    setLanguage(paymentLanguage);

    if (paymentContext === 'oracle-unlock') {
      const oracleData = localStorage.getItem('oracleDataForUnlock');
      if (oracleData) {
        // Create the session object that the reading page will check
        const sessionToStore = {
          unlockedAt: Date.now(),
          oracleData: JSON.parse(oracleData),
        };
        localStorage.setItem('oracleUnlockData', JSON.stringify(sessionToStore));
      }
    }
    
    // Clear context storage after use
    localStorage.removeItem('paymentContext');
    localStorage.removeItem('paymentLanguage');
    localStorage.removeItem('oracleDataForUnlock');
    
  }, [fetchUserEntitlements]);

  const handleProceed = () => {
    if (context === 'source-code-purchase') {
       const downloadUrl = language === 'zh-CN' ? '/cn/download' : '/download';
       router.push(downloadUrl);
    } else if (context === 'oracle-unlock') {
       const readingPageUrl = language === 'zh-CN' ? '/cn/reading' : '/reading';
       router.push(readingPageUrl);
    } else { // Default to VIP page for vip-purchase
       const vipPageUrl = language === 'zh-CN' ? '/cn/vip202577661516' : '/vip202577661516';
       router.push(vipPageUrl);
    }
  };

  if (!isMounted) {
    return (
        <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </main>
    );
  }
  
  const pageContent = {
    'oracle-unlock': {
      title: language === 'zh-CN' ? "解读已解锁！" : "Reading Unlocked!",
      description: language === 'zh-CN' ? "您的神谕解读已准备就绪。请继续查看您的完整解说。" : "Your oracle reading is now available. Proceed to view your full interpretation.",
      buttonText: language === 'zh-CN' ? "查看您的解读" : "View Your Reading",
    },
    'vip-purchase': {
      title: language === 'zh-CN' ? "支付成功！" : "Payment Successful!",
      description: language === 'zh-CN' ? "感谢您的购买。您的VIP权限已开通。" : "Thank you for your purchase. Your VIP access has been granted.",
      buttonText: language === 'zh-CN' ? "继续查看您的内容" : "Proceed to Your Content",
    },
    'source-code-purchase': {
      title: language === 'zh-CN' ? "支付成功！" : "Payment Successful!",
      description: language === 'zh-CN' ? "感谢您购买源代码。请继续前往下载页面。" : "Thank you for purchasing the source code. Proceed to the download page.",
      buttonText: language === 'zh-CN' ? "前往下载页面" : "Go to Download Page",
    },
    'default': {
       title: language === 'zh-CN' ? "支付成功！" : "Payment Successful!",
       description: language === 'zh-CN' ? "感谢您的购买。您的权限已开通。" : "Thank you for your purchase. Your access has been granted.",
       buttonText: language === 'zh-CN' ? "继续查看您的内容" : "Proceed to Your Content",
    }
  };

  const content = pageContent[context || 'default'];

  return (
    <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl text-center">
        <CardHeader className="p-6 md:p-8">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500"/>
          </div>
          <CardTitle className="text-2xl md:text-3xl font-headline text-primary">
            {content.title}
          </CardTitle>
          <CardDescription className="pt-2 text-muted-foreground text-base">
            {content.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 py-4 pb-8 flex flex-col items-center space-y-4">
            <Button size="lg" className="text-lg" onClick={handleProceed}>
                {content.buttonText}
                <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground mt-6 text-center max-w-lg">
        {language === 'zh-CN' ? '如有任何疑问，请联系我们：94722424@qq.com' : 'If you have any questions, please contact us at 94722424@qq.com'}
      </p>
    </main>
  );
}

    