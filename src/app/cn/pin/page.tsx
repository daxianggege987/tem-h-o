
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { gregorianToLunar, getShichen } from "@/lib/calendar-utils";
import { ORACLE_RESULTS_MAP } from "@/lib/oracle-utils";
import { getSinglePalaceInterpretation, getDoublePalaceInterpretation } from "@/lib/interpretations";
import type { LunarDate, Shichen, OracleResultName, SingleInterpretationContent, DoubleInterpretationContent } from "@/lib/types";
import type { LocaleStrings } from "@/lib/locales";
import { getLocaleStrings } from "@/lib/locales";
import { Loader2, Star } from "lucide-react";
import { PayPalScriptProvider, PayPalButtons, type PayPalButtonsComponentProps } from "@paypal/react-paypal-js";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface OracleData {
  currentDateTime: Date;
  lunarDate: LunarDate;
  shichen: Shichen;
  firstOracleResult: OracleResultName;
  secondOracleResult: OracleResultName;
  firstOracleInterpretation: SingleInterpretationContent | null;
  doubleOracleInterpretation: DoubleInterpretationContent | null;
}


const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

const sourceCodeProduct = {
  id: 'source-code-399',
  description: 'Temporal Harmony Oracle Source Code',
  price: '399.00',
};

const PayPalButtonWrapper = ({ product, uiStrings }: { product: {id: string, description: string, price: string }, uiStrings: LocaleStrings }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          userID: user ? user.uid : null,
          productID: product.id
        }),
      });

      const orderData = await res.json();
      if (!res.ok) {
        throw new Error(orderData.error || 'Failed to capture payment.');
      }

      toast({ title: "Payment Successful!", description: "Thank you. Please save your payment record and contact 94722424@qq.com." });
      
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
        style={{ layout: "vertical", label: "buynow", locale: "zh_C2" }}
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

export default function PinPage() {
  const [oracleData, setOracleData] = useState<OracleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const uiStrings = getLocaleStrings("zh-CN");

  useEffect(() => {
    try {
      const date = new Date();
      const lDate = gregorianToLunar(date.getFullYear(), date.getMonth() + 1, date.getDate());
      const sValue = getShichen(date.getHours());
      if (!lDate || !sValue) {
        throw new Error(uiStrings.calculationErrorText);
      }
      
      const firstOracleSum = lDate.lunarMonth + lDate.lunarDay + sValue.value - 2;
      let firstOracleRemainder = firstOracleSum % 6;
      if (firstOracleRemainder < 0) firstOracleRemainder += 6;
      const firstOracleName = ORACLE_RESULTS_MAP[firstOracleRemainder];

      const secondOracleSum = lDate.lunarDay + sValue.value - 1;
      let secondOracleRemainderValue = secondOracleSum % 6;
      if (secondOracleRemainderValue < 0) secondOracleRemainderValue += 6;
      const secondOracleName = ORACLE_RESULTS_MAP[secondOracleRemainderValue];
      
      setOracleData({
        currentDateTime: date, lunarDate: lDate, shichen: sValue,
        firstOracleResult: firstOracleName, secondOracleResult: secondOracleName,
        firstOracleInterpretation: getSinglePalaceInterpretation(firstOracleName, 'zh-CN'),
        doubleOracleInterpretation: getDoublePalaceInterpretation(firstOracleName, secondOracleName, 'zh-CN'),
      });
    } catch (e: any) {
      setError(e.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [uiStrings.calculationErrorText]);

  const renderStars = (oracleName: OracleResultName) => {
    const starsConfig: { [key in OracleResultName]?: { count: number; colorClass: string } } = {
      "大安": { count: 3, colorClass: "text-destructive" }, "速喜": { count: 2, colorClass: "text-destructive" },
      "小吉": { count: 1, colorClass: "text-destructive" }, "留连": { count: 1, colorClass: "text-muted-foreground" },
      "赤口": { count: 2, colorClass: "text-muted-foreground" }, "空亡": { count: 3, colorClass: "text-muted-foreground" },
    };
    const config = starsConfig[oracleName];
    if (!config) return null;
    return <div className="flex justify-center mt-1 space-x-1">{Array(config.count).fill(0).map((_, i) => <Star key={`${oracleName}-star-${i}`} className={`h-5 w-5 ${config.colorClass}`} fill="currentColor"/>)}</div>;
  };
  
  if (isLoading) {
    return (
      <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center pt-10 pb-20 px-4 relative">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p>{uiStrings.calculatingDestiny || "正在计算..."}</p> 
      </main>
    );
  }

  if (error) {
    return (
        <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl bg-destructive/10 border-destructive">
                <CardHeader><CardTitle className="font-headline text-2xl text-destructive-foreground">{uiStrings.calculationErrorTitle}</CardTitle></CardHeader>
                <CardContent><p className="text-destructive-foreground">{error}</p></CardContent>
            </Card>
        </main>
    );
  }

  if (!oracleData) {
    return (
      <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center pt-10 pb-20 px-4 relative">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p>{uiStrings.calculationErrorText || "加载数据失败..."}</p> 
      </main>
    );
  }

  const { currentDateTime, lunarDate, shichen, firstOracleResult, secondOracleResult, firstOracleInterpretation, doubleOracleInterpretation } = oracleData;
  const formatDate = (date: Date) => date.toLocaleDateString('zh-Hans-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formatTime = (date: Date) => date.toLocaleTimeString('zh-Hans-CN');

  return (
    <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center pt-10 pb-20 px-4 space-y-8">
      <header className="text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-headline font-bold text-primary">
          {uiStrings.appTitle}
        </h1>
        <p className="text-md sm:text-lg md:text-xl text-muted-foreground mt-3 md:mt-4 font-headline max-w-2xl mx-auto">
          {uiStrings.appDescription}
        </p>
      </header>

      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">{uiStrings.temporalCoordinatesTitle}</CardTitle>
          <CardDescription className="font-headline">{uiStrings.temporalCoordinatesDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground font-headline">{uiStrings.currentTimeGregorianLabel}</p>
            <p className="text-lg font-semibold font-body">{formatDate(currentDateTime)}<br />{formatTime(currentDateTime)}</p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center pt-2">
            {[
              { label: uiStrings.lunarMonthLabel, value: lunarDate.lunarMonth, unit: '月'},
              { label: uiStrings.lunarDayLabel, value: lunarDate.lunarDay, unit: '日'},
              { label: uiStrings.shichenLabel, value: shichen.value, unit: shichen.name + '時'}
            ].map(item => (
              <div key={item.label}>
                <p className="text-sm text-muted-foreground font-headline">{item.label}</p>
                <p className="text-4xl md:text-5xl font-bold text-accent font-body">{item.value}</p>
                <p className="text-xs text-muted-foreground font-headline">{item.unit}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-lg">
        <Card className="shadow-lg text-center">
          <CardHeader><CardTitle className="font-headline text-xl text-primary">{uiStrings.firstOracleTitle}</CardTitle></CardHeader>
          <CardContent className="pb-4">
            <p className="text-4xl md:text-5xl font-bold text-primary font-headline pt-4 pb-2 leading-loose">{firstOracleInterpretation?.title}</p>
            {renderStars(firstOracleResult)}
          </CardContent>
        </Card>
        <Card className="shadow-lg text-center">
          <CardHeader><CardTitle className="font-headline text-xl text-primary">{uiStrings.secondOracleTitle}</CardTitle></CardHeader>
          <CardContent className="pb-4">
            <p className="text-4xl md:text-5xl font-bold text-primary font-headline pt-4 pb-2 leading-loose">{getSinglePalaceInterpretation(secondOracleResult, "zh-CN")?.title}</p>
            {renderStars(secondOracleResult)}
          </CardContent>
        </Card>
      </div>

      {firstOracleInterpretation && (
        <Card className="w-full max-w-lg shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-primary">{uiStrings.singlePalaceInterpretationTitle}</CardTitle>
            <CardDescription className="font-headline flex items-baseline">
                <span>{firstOracleInterpretation.title}</span>
                {firstOracleInterpretation.pinyin && <span className="ml-2 text-muted-foreground text-sm">({firstOracleInterpretation.pinyin})</span>}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-semibold text-md text-secondary-foreground font-body">{uiStrings.meaningLabel}</h4>
              <p className="text-sm font-body whitespace-pre-line">{firstOracleInterpretation.meaning}</p>
            </div>
            {firstOracleInterpretation.advice && (
              <div className="mt-2"><h4 className="font-semibold text-md text-secondary-foreground font-body">{uiStrings.adviceLabel}</h4><p className="text-sm font-body whitespace-pre-line">{firstOracleInterpretation.advice}</p></div>
            )}
          </CardContent>
        </Card>
      )}

      {doubleOracleInterpretation && (
        <Card className="w-full max-w-lg shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-primary">{uiStrings.doublePalaceInterpretationTitle}</CardTitle>
            <CardDescription className="font-headline">
                <span>{doubleOracleInterpretation.title}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div><h4 className="font-semibold text-md text-secondary-foreground font-body">{uiStrings.poemLabel}</h4><p className="text-sm font-body whitespace-pre-line">{doubleOracleInterpretation.poem}</p></div>
            <div className="mt-2"><h4 className="font-semibold text-md text-secondary-foreground font-body">{uiStrings.explanationLabel}</h4><p className="text-sm font-body whitespace-pre-line">{doubleOracleInterpretation.explanation}</p></div>
          </CardContent>
        </Card>
      )}

      <Card className="w-full max-w-lg shadow-xl bg-accent/10 border-accent">
        <CardHeader><CardTitle className="font-headline text-lg text-primary">温馨提示</CardTitle></CardHeader>
        <CardContent><p className="text-sm font-body text-foreground/90 whitespace-pre-line">如果测算结果不如意，需要破解方法，请关注公众号： 改过的锤子<br />关注以后，发送消息 999</p></CardContent>
      </Card>

      <Card className="w-full max-w-lg shadow-xl bg-card-foreground/5 border-primary/20 mt-8">
        <CardHeader>
          <CardTitle className="font-headline text-lg text-primary">{uiStrings.sourceCodeCardTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm font-body text-foreground/90 whitespace-pre-line text-left">
            {uiStrings.sourceCodeCardDescription}
          </p>
          <div className="w-full max-w-xs mx-auto pt-2">
            {PAYPAL_CLIENT_ID ? (
              <PayPalScriptProvider options={{ "clientId": PAYPAL_CLIENT_ID, currency: "USD", intent: "capture" }}>
                <PayPalButtonWrapper product={sourceCodeProduct} uiStrings={uiStrings} />
              </PayPalScriptProvider>
            ) : (
              <p className="text-xs text-destructive">PayPal payments are currently unavailable.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
