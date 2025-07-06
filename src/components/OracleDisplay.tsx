
"use client";

import { useEffect, useState } from "react";
import { PayPalScriptProvider, PayPalButtons, type PayPalButtonsComponentProps } from "@paypal/react-paypal-js";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { gregorianToLunar, getShichen } from "@/lib/calendar-utils";
import { ORACLE_RESULTS_MAP } from "@/lib/oracle-utils";
import { getSinglePalaceInterpretation, getDoublePalaceInterpretation } from "@/lib/interpretations";
import type { LunarDate, Shichen, OracleResultName, SingleInterpretationContent, DoubleInterpretationContent } from "@/lib/types";
import type { LocaleStrings } from "@/lib/locales";
import { Loader2, Star, Clock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

const unlockProduct = {
  id: 'oracle-unlock-promo-049',
  description: 'Unlock Oracle Reading (Limited Time Offer)',
  price: '0.49',
};

interface OracleData {
  currentDateTime: string; 
  lunarDate: LunarDate;
  shichen: Shichen;
  firstOracleResult: OracleResultName;
  secondOracleResult: OracleResultName;
  firstOracleInterpretationZh: SingleInterpretationContent | null;
  firstOracleInterpretationLang: SingleInterpretationContent | null;
  doubleOracleInterpretationZh: DoubleInterpretationContent | null;
  doubleOracleInterpretationLang: DoubleInterpretationContent | null;
}

interface OracleDisplayProps {
  currentLang: string;
  uiStrings: LocaleStrings;
}

interface PayPalButtonWrapperProps {
  product: {
    id: string;
    description: string;
    price: string;
  };
  onSuccess: () => void;
  disabled?: boolean;
}

const PayPalButtonWrapper = ({ product, onSuccess, disabled = false }: PayPalButtonWrapperProps) => {
  const { toast } = useToast();
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
      if (!res.ok) {
        const order = await res.json();
        throw new Error(order.error || 'Failed to create order.');
      }
      const order = await res.json();
      return order.id;
    } catch (err: any) {
      let friendlyMessage = err.message;
      // This specific error from PayPal means guest checkout (paying with a card without logging in) is not enabled on the live account.
      if (friendlyMessage && friendlyMessage.includes('not enabled for Unbranded Guest Payments')) {
        friendlyMessage = "This merchant's account isn't set up for direct card payments yet. Please use the 'Pay with PayPal' option to log in and pay.";
        toast({ 
          title: 'Card Payment Unavailable', 
          description: friendlyMessage, 
          variant: 'destructive',
          duration: 10000 // Give user more time to read
        });
      } else {
        toast({ title: 'Error Creating Order', description: friendlyMessage, variant: 'destructive' });
      }
      setError(friendlyMessage);
      return '';
    }
  };

  const onApprove: PayPalButtonsComponentProps['onApprove'] = async (data, actions) => {
    setIsProcessing(true);
    try {
      toast({ title: "Processing Payment...", description: "Please wait while we confirm your payment." });
      const res = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderID: data.orderID, productID: product.id }),
      });

      if (!res.ok) {
        const orderData = await res.json();
        throw new Error(orderData.error || 'Failed to capture payment.');
      }
      const orderData = await res.json();
      
      toast({ title: 'Payment Successful!', description: 'Your reading is now unlocked for 30 minutes.' });
      onSuccess(); 
    } catch (err: any) {
      setError(err.message);
      toast({ title: 'Payment Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const onError: PayPalButtonsComponentProps['onError'] = (err) => {
    console.error("PayPal button error:", err);
    toast({ title: 'PayPal Error', description: 'An unexpected error occurred. Please try again.', variant: 'destructive' });
  };
  
  return (
    <div className="w-full relative min-h-[50px] flex flex-col items-center">
       {isProcessing && (
         <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-20 rounded-md">
            <Loader2 className="h-8 w-8 animate-spin text-primary"/>
            <p className="text-sm mt-2 text-muted-foreground">Finalizing...</p>
         </div>
       )}
      <PayPalButtons
        key={product.id}
        className="relative z-10 w-full"
        style={{ layout: "vertical", label: "pay" }}
        createOrder={createOrder}
        onApprove={onApprove}
        onError={onError}
        disabled={isProcessing || disabled}
      />
      {error && <p className="text-xs text-destructive text-center mt-2">{error}</p>}
    </div>
  );
};

export default function OracleDisplay({ currentLang, uiStrings }: OracleDisplayProps) {
  const [oracleData, setOracleData] = useState<OracleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds

  useEffect(() => {
    if (isUnlocked) return;

    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(intervalId);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isUnlocked]);

  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const handleUnlockSuccess = () => {
    if (!oracleData) return;
    const sessionToStore = {
      unlockedAt: Date.now(),
      oracleData,
    };
    try {
      localStorage.setItem('oracleUnlockData', JSON.stringify(sessionToStore));
      setIsUnlocked(true);
    } catch (e) {
      console.error("Failed to save session to localStorage:", e);
      setIsUnlocked(true);
    }
  };
  
  useEffect(() => {
    try {
      const storedSessionRaw = localStorage.getItem('oracleUnlockData');
      if (storedSessionRaw) {
        const storedSession = JSON.parse(storedSessionRaw);
        const isExpired = Date.now() - storedSession.unlockedAt > 30 * 60 * 1000;
        if (!isExpired && storedSession.oracleData) {
          setOracleData(storedSession.oracleData);
          setIsUnlocked(true);
          setIsLoading(false);
          return;
        }
      }

      const date = new Date();
      const lDate = gregorianToLunar(date.getFullYear(), date.getMonth() + 1, date.getDate());
      const sValue = getShichen(date.getHours());
      if (!lDate || !sValue) throw new Error(uiStrings.calculationErrorText);
      
      const firstOracleSum = lDate.lunarMonth + lDate.lunarDay + sValue.value - 2;
      let firstOracleRemainder = firstOracleSum % 6;
      if (firstOracleRemainder < 0) firstOracleRemainder += 6;
      const firstOracleName = ORACLE_RESULTS_MAP[firstOracleRemainder];

      const secondOracleSum = lDate.lunarDay + sValue.value - 1;
      let secondOracleRemainderValue = secondOracleSum % 6;
      if (secondOracleRemainderValue < 0) secondOracleRemainderValue += 6;
      const secondOracleName = ORACLE_RESULTS_MAP[secondOracleRemainderValue];
      
      setOracleData({
        currentDateTime: date.toISOString(),
        lunarDate: lDate, 
        shichen: sValue,
        firstOracleResult: firstOracleName, 
        secondOracleResult: secondOracleName,
        firstOracleInterpretationZh: getSinglePalaceInterpretation(firstOracleName, 'zh-CN'),
        firstOracleInterpretationLang: getSinglePalaceInterpretation(firstOracleName, currentLang),
        doubleOracleInterpretationZh: getDoublePalaceInterpretation(firstOracleName, secondOracleName, 'zh-CN'),
        doubleOracleInterpretationLang: getDoublePalaceInterpretation(firstOracleName, secondOracleName, currentLang),
      });
    } catch (e: any) {
      setError(e.message || uiStrings.calculationErrorText);
    } finally {
      setIsLoading(false);
    }
  }, [currentLang, uiStrings]);

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
      <div className="flex flex-col items-center justify-center text-center p-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg font-headline">{uiStrings?.calculatingDestiny || "Calculating..."}</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md shadow-xl bg-destructive/10 border-destructive">
        <CardHeader><CardTitle className="font-headline text-2xl text-destructive-foreground">{uiStrings.calculationErrorTitle}</CardTitle></CardHeader>
        <CardContent><p className="text-destructive-foreground">{error}</p></CardContent>
      </Card>
    );
  }

  if (!oracleData) {
    return null;
  }
  
  const { currentDateTime, lunarDate, shichen, firstOracleResult, secondOracleResult, firstOracleInterpretationZh, firstOracleInterpretationLang, doubleOracleInterpretationZh, doubleOracleInterpretationLang } = oracleData;
  const displayDate = new Date(currentDateTime);
  const formatDate = (date: Date, lang: string) => date.toLocaleDateString(lang.startsWith('zh') ? 'zh-Hans-CN' : lang, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formatTime = (date: Date, lang: string) => date.toLocaleTimeString(lang.startsWith('zh') ? 'zh-Hans-CN' : lang);

  const UnlockedContent = (
    <div className="w-full max-w-lg space-y-8">
        <div className="grid md:grid-cols-2 gap-8 w-full">
            <Card className="shadow-lg text-center">
            <CardHeader><CardTitle className="font-headline text-xl text-primary">{uiStrings.firstOracleTitle}</CardTitle></CardHeader>
            <CardContent className="pb-4">
                <p className="text-4xl md:text-5xl font-bold text-primary font-headline pt-4 pb-2 leading-loose">{firstOracleInterpretationLang?.title}</p>
                {renderStars(firstOracleResult)}
            </CardContent>
            </Card>
            <Card className="shadow-lg text-center">
            <CardHeader><CardTitle className="font-headline text-xl text-primary">{uiStrings.secondOracleTitle}</CardTitle></CardHeader>
            <CardContent className="pb-4">
                <p className="text-4xl md:text-5xl font-bold text-primary font-headline pt-4 pb-2 leading-loose">{getSinglePalaceInterpretation(secondOracleResult, currentLang)?.title}</p>
                {renderStars(secondOracleResult)}
            </CardContent>
            </Card>
        </div>

        {firstOracleInterpretationZh && (
            <Card className="w-full shadow-xl">
            <CardHeader>
                <CardTitle className="font-headline text-xl text-primary">{uiStrings.singlePalaceInterpretationTitle}</CardTitle>
                <CardDescription className="font-headline flex items-baseline">
                  {currentLang === 'zh-CN' ? (
                    <>
                      <span>{firstOracleInterpretationZh.title}</span>
                      {firstOracleInterpretationZh.pinyin && <span className="ml-2 text-muted-foreground text-sm">({firstOracleInterpretationZh.pinyin})</span>}
                    </>
                  ) : (
                    <>
                      <span>{firstOracleInterpretationLang?.title}</span>
                      {firstOracleInterpretationZh?.title && (
                        <span className="ml-2 text-muted-foreground text-sm">
                          ({firstOracleInterpretationZh.title}
                          {firstOracleInterpretationZh.pinyin && `, ${firstOracleInterpretationZh.pinyin}`})
                        </span>
                      )}
                    </>
                  )}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <div>
                <h4 className="font-semibold text-md text-secondary-foreground font-body">{uiStrings.meaningLabel} ({uiStrings.languageNameChinese})</h4>
                <p className="text-sm font-body whitespace-pre-line">{firstOracleInterpretationZh.meaning}</p>
                </div>
                {currentLang !== 'zh-CN' && firstOracleInterpretationLang?.meaning && firstOracleInterpretationLang.meaning !== firstOracleInterpretationZh.meaning && (
                <div className="mt-3 pt-3 border-t"><h4 className="font-semibold text-md text-secondary-foreground font-body">{uiStrings.meaningLabel} ({currentLang.toUpperCase()})</h4><p className="text-sm font-body whitespace-pre-line">{firstOracleInterpretationLang.meaning}</p></div>
                )}
                {firstOracleInterpretationZh.advice && (
                <div className="mt-2"><h4 className="font-semibold text-md text-secondary-foreground font-body">{uiStrings.adviceLabel} ({uiStrings.languageNameChinese})</h4><p className="text-sm font-body whitespace-pre-line">{firstOracleInterpretationZh.advice}</p></div>
                )}
                {currentLang !== 'zh-CN' && firstOracleInterpretationLang?.advice && firstOracleInterpretationLang.advice !== firstOracleInterpretationZh.advice && (
                <div className="mt-3 pt-3 border-t"><h4 className="font-semibold text-md text-secondary-foreground font-body">{uiStrings.adviceLabel} ({currentLang.toUpperCase()})</h4><p className="text-sm font-body whitespace-pre-line">{firstOracleInterpretationLang.advice}</p></div>
                )}
            </CardContent>
            </Card>
        )}

        {doubleOracleInterpretationZh && (
            <Card className="w-full shadow-xl">
            <CardHeader>
                <CardTitle className="font-headline text-xl text-primary">{uiStrings.doublePalaceInterpretationTitle}</CardTitle>
                <CardDescription className="font-headline">
                {currentLang === 'zh-CN' ? (
                  <span>{doubleOracleInterpretationZh.title}</span>
                ) : (
                  <>
                    <span>{doubleOracleInterpretationLang?.title}</span>
                    {doubleOracleInterpretationZh?.title && doubleOracleInterpretationLang?.title !== doubleOracleInterpretationZh.title && (
                      <span className="ml-2 text-muted-foreground text-sm">({doubleOracleInterpretationZh.title})</span>
                    )}
                  </>
                )}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <div><h4 className="font-semibold text-md text-secondary-foreground font-body">{uiStrings.poemLabel} ({uiStrings.languageNameChinese})</h4><p className="text-sm font-body whitespace-pre-line">{doubleOracleInterpretationZh.poem}</p></div>
                {currentLang !== 'zh-CN' && doubleOracleInterpretationLang?.poem && doubleOracleInterpretationLang.poem !== doubleOracleInterpretationZh.poem && (
                <div className="mt-3 pt-3 border-t"><h4 className="font-semibold text-md text-secondary-foreground font-body">{uiStrings.poemLabel} ({currentLang.toUpperCase()})</h4><p className="text-sm font-body whitespace-pre-line">{doubleOracleInterpretationLang.poem}</p></div>
                )}
                <div className="mt-2"><h4 className="font-semibold text-md text-secondary-foreground font-body">{uiStrings.explanationLabel} ({uiStrings.languageNameChinese})</h4><p className="text-sm font-body whitespace-pre-line">{doubleOracleInterpretationZh.explanation}</p></div>
                {currentLang !== 'zh-CN' && doubleOracleInterpretationLang?.explanation && doubleOracleInterpretationLang.explanation !== doubleOracleInterpretationZh.explanation && (
                <div className="mt-3 pt-3 border-t"><h4 className="font-semibold text-md text-secondary-foreground font-body">{uiStrings.explanationLabel} ({currentLang.toUpperCase()})</h4><p className="text-sm font-body whitespace-pre-line">{doubleOracleInterpretationLang.explanation}</p></div>
                )}
            </CardContent>
            </Card>
        )}

        <Card className="w-full shadow-xl bg-accent/10 border-accent">
            <CardHeader><CardTitle className="font-headline text-lg text-primary">温馨提示</CardTitle></CardHeader>
            <CardContent><p className="text-sm font-body text-foreground/90 whitespace-pre-line">如果测算结果不如意，需要破解方法，请关注公众号： 改过的锤子<br />关注以后，发送消息 999</p></CardContent>
        </Card>
        
        <Card className="w-full max-w-lg shadow-xl border-primary/50">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-headline text-primary">向您推荐终身VIP</CardTitle>
            <CardDescription>仅需$39.99，一劳永逸，解锁全部潜能</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm px-6 pt-0 pb-4">
            <p className="text-center text-muted-foreground">
              专为高频使用场景设计，VIP会员将尊享以下特权：
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-muted-foreground">
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                <span className="font-semibold text-foreground">自定义时间测算 (重点推荐)</span>
              </li>
              <li className="flex items-start"><CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />无限次使用，永不过期</li>
              <li className="flex items-start"><CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />专属页面，结果直达</li>
              <li className="flex items-start"><CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />纯净体验，无任何广告</li>
            </ul>
          </CardContent>
          <CardFooter className="flex-col px-6 pb-6">
            <Link href="/pricing" className="w-full">
              <Button className="w-full text-lg" size="lg">
                立即支付
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {(!firstOracleInterpretationLang || !doubleOracleInterpretationLang) && firstOracleResult && secondOracleResult && (
            <Card className="w-full shadow-xl">
            <CardHeader><CardTitle className="font-headline text-xl text-muted-foreground">{uiStrings.interpretationsPendingTitle}</CardTitle></CardHeader>
            <CardContent>
                <p className="text-sm font-body">
                {!firstOracleInterpretationLang && uiStrings.interpretationMissingText(firstOracleResult, 'single', undefined, currentLang)}
                {(!firstOracleInterpretationLang && !doubleOracleInterpretationLang) && <br/>}
                {!doubleOracleInterpretationLang && uiStrings.interpretationMissingText(firstOracleResult, 'double', secondOracleResult, currentLang)}
                <br />{uiStrings.addInterpretationsNote}
                </p>
            </CardContent>
            </Card>
        )}
    </div>
  );

  const errorCard = (
    <Card className="w-full max-w-md text-center border-destructive">
        <CardHeader><CardTitle className="text-destructive">Configuration Error / 配置错误</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <p>The PayPal Client ID is missing. Please ensure `NEXT_PUBLIC_PAYPAL_CLIENT_ID` is configured in your environment variables.</p>
          <p className="text-muted-foreground">缺少 PayPal 客户端 ID。请确保 `NEXT_PUBLIC_PAYPAL_CLIENT_ID` 已在您的环境变量中配置。</p>
        </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col items-center w-full px-2 pb-12 space-y-8">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">{uiStrings.temporalCoordinatesTitle}</CardTitle>
          <CardDescription className="font-headline">{uiStrings.temporalCoordinatesDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground font-headline">{uiStrings.currentTimeGregorianLabel}</p>
            <p className="text-lg font-semibold font-body">{formatDate(displayDate, currentLang)}<br />{formatTime(displayDate, currentLang)}</p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center pt-2">
            {[
              { label: uiStrings.lunarMonthLabel, value: lunarDate.lunarMonth, unit: currentLang === 'zh-CN' ? '月' : uiStrings.lunarMonthUnit },
              { label: uiStrings.lunarDayLabel, value: lunarDate.lunarDay, unit: currentLang === 'zh-CN' ? '日' : uiStrings.lunarDayUnit },
              { label: uiStrings.shichenLabel, value: shichen.value, unit: shichen.name + (currentLang === 'zh-CN' ? '時' : uiStrings.shichenTimeUnit) }
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

      {isUnlocked ? (
        UnlockedContent
      ) : PAYPAL_CLIENT_ID ? (
        <div className="w-full max-w-lg">
          <Card className="bg-background/95 rounded-lg border border-primary/30 shadow-2xl flex flex-col">
            <CardHeader>
                <CardTitle className="text-2xl text-center font-headline text-primary">解锁您的完整解读</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 px-4 md:px-6 text-foreground pb-8">
                <div className="space-y-3 text-base leading-relaxed text-muted-foreground text-justify">
                    <p>
                    掐指一算属于六壬算法，是中国古代宫廷占术的一种，六壬与太乙、奇门遁甲合称三式，在时间算法上，太乙、奇门遁甲均参考六壬而来，因此六壬被称为三式之首。
                    </p>
                    <p>
                    中国著名作家鲁迅就非常善于掐指算，他曾说“经历一多，便能从前因而知后果，我的预测时时有验”。
                    </p>
                </div>

                <Separator className="my-4" />
                
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-center text-primary">现代也有非常多的真实的反馈：</h3>
                    <div className="space-y-5 text-muted-foreground italic">
                        <blockquote className="border-l-2 pl-4 border-secondary">
                        <p className="mb-2">“借老师吉言，周末3个试课的学生全都交费了，正式成为了我的学生，算的真准！”</p>
                        <footer className="text-right not-italic text-sm font-semibold">—— 周末兴趣班杨老师</footer>
                        </blockquote>
                        <blockquote className="border-l-2 pl-4 border-secondary">
                        <p className="mb-2">“太准了！周末临时起意，带老婆俩人来个短途自驾游，算的结果是赤口，结果半路上俩人就拌嘴，出去玩也没了心情。坏了出游兴致！以后算的结果不好，坚决不干！”</p>
                        <footer className="text-right not-italic text-sm font-semibold">—— 自由职业李老板</footer>
                        </blockquote>
                        <blockquote className="border-l-2 pl-4 border-secondary">
                        <p className="mb-2">“起诉欠钱7年不还的老赖之前，算了一下，速喜+小吉。结果真保全住了老赖刚到帐的一笔钱，原本不抱希望的，就当这笔钱丢了，还真的找回来了！太准了”</p>
                        <footer className="text-right not-italic text-sm font-semibold">—— 被欠款的乙方</footer>
                        </blockquote>
                        <blockquote className="border-l-2 pl-4 border-secondary">
                        <p className="mb-2">“开发本站前，测算了一下，大安。结果整个过程异常顺利，预计10-12周的开发周期，只用了短短2周就完成了。”</p>
                        <footer className="text-right not-italic text-sm font-semibold">—— 本站站长</footer>
                        </blockquote>
                    </div>
                </div>
                
                <Separator className="my-4" />

                <div className="rounded-lg border-2 border-primary bg-primary/10 p-4 my-6 text-center shadow-lg">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="h-6 w-6 text-primary" />
                    <h3 className="text-xl font-bold text-primary">限时优惠</h3>
                  </div>
                  <p className="mt-2 text-muted-foreground">优惠将在倒计时结束后失效</p>
                  <div className="my-4 text-4xl font-bold text-destructive tracking-wider">
                    {timeLeft > 0 ? formatCountdown(timeLeft) : "优惠已结束"}
                  </div>
                  <p className="text-lg">
                    仅需 <span className="font-bold text-2xl text-foreground">$0.49</span>
                    <span className="text-muted-foreground line-through ml-2">$1.00</span>
                  </p>
                </div>
                
                <div className="text-center space-y-4">
                  <PayPalScriptProvider options={{ "clientId": PAYPAL_CLIENT_ID, currency: "USD", intent: "capture" }}>
                    <div className="w-full max-w-xs mx-auto">
                        <PayPalButtonWrapper product={unlockProduct} onSuccess={handleUnlockSuccess} disabled={timeLeft <= 0} />
                    </div>
                  </PayPalScriptProvider>
                    <p className="text-sm text-muted-foreground px-4">
                        解锁后，可得到单宫+双宫解释，解说更详细。 如遇测算结果不如意，破解方法免费赠送。
                    </p>
                </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        errorCard
      )}
    </div>
  );
}
