"use client";

import { useEffect, useState } from "react";
import { PayPalScriptProvider, PayPalButtons, type PayPalButtonsComponentProps } from "@paypal/react-paypal-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { gregorianToLunar, getShichen } from "@/lib/calendar-utils";
import { ORACLE_RESULTS_MAP } from "@/lib/oracle-utils";
import { getSinglePalaceInterpretation, getDoublePalaceInterpretation } from "@/lib/interpretations";
import type { LunarDate, Shichen, OracleResultName, SingleInterpretationContent, DoubleInterpretationContent } from "@/lib/types";
import type { LocaleStrings } from "@/lib/locales";
import { Loader2, Star, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

const unlockProduct = {
  id: 'oracle-unlock',
  description: 'Unlock Oracle Reading',
  price: '1.00', // The price to unlock one reading
};

interface OracleData {
  currentDateTime: string; // Store as ISO string for serialization
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
}

const PayPalButtonWrapper = ({ product, onSuccess }: PayPalButtonWrapperProps) => {
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
      const order = await res.json();
      if (!res.ok) throw new Error(order.error || 'Failed to create order.');
      return order.id;
    } catch (err: any) {
      setError(err.message);
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
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

      const orderData = await res.json();
      if (!res.ok) throw new Error(orderData.error || 'Failed to capture payment.');
      
      toast({ title: 'Payment Successful!', description: 'Your reading is now unlocked for 30 minutes.' });
      onSuccess(); // Trigger the unlock on the parent component
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
        disabled={isProcessing}
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
      // Even if saving fails, unlock for the current view.
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
          return; // Active session found, exit.
        }
      }

      // No active session or it's expired, so calculate a new reading.
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
        currentDateTime: date.toISOString(), // Store as ISO string
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
  const displayDate = new Date(currentDateTime); // Re-create Date object for formatting
  const formatDate = (date: Date, lang: string) => date.toLocaleDateString(lang.startsWith('zh') ? 'zh-Hans-CN' : lang, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formatTime = (date: Date, lang: string) => date.toLocaleTimeString(lang.startsWith('zh') ? 'zh-Hans-CN' : lang);

  const showBlurOverlay = !isUnlocked;

  const ctaContent = (
    <PayPalScriptProvider options={{ "clientId": PAYPAL_CLIENT_ID, currency: "USD", intent: "capture" }}>
      <div className="w-full max-w-lg bg-background/95 backdrop-blur-sm rounded-lg border border-primary/30 shadow-2xl overflow-hidden flex flex-col">
        <Card className="bg-transparent border-none shadow-none flex-grow flex flex-col">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="text-2xl text-center font-headline text-primary">解锁您的完整解读</CardTitle>
            <CardDescription className="text-center">付费后即刻查看结果</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow space-y-6 px-4 md:px-6 text-foreground pb-8">
            <div className="space-y-3 text-base leading-relaxed text-muted-foreground text-justify">
              <p>
                掐指一算属于六壬算法，是中国古代宫廷占术的一种，六壬与太乙、奇门遁甲合称三式，在时间算法上，太乙、奇门遁甲均参考六壬而来，因此六壬被称为三式之首。
              </p>
              <p>
                中国著名作家鲁迅就非常善于掐指算，他曾说“经历一多，便能从前因而知后果，我的预测时时有验”。
              </p>
            </div>
  
            <div className="w-full max-w-xs mx-auto">
              <PayPalButtonWrapper product={unlockProduct} onSuccess={handleUnlockSuccess} />
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
  
            <div className="text-center space-y-4">
               <div className="w-full max-w-xs mx-auto">
                 <PayPalButtonWrapper product={unlockProduct} onSuccess={handleUnlockSuccess} />
               </div>
               <p className="text-sm text-muted-foreground px-4">
                 解锁后，可得到单宫+双宫解释，解说更详细。 如遇测算结果不如意，破解方法免费赠送。
               </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PayPalScriptProvider>
  );

  return (
    <div className="flex flex-col items-center w-full px-2 pb-12">
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

      <div className="w-full max-w-lg relative">
        <div className={cn("space-y-8", showBlurOverlay && "filter blur-md pointer-events-none")}>
          <div className="grid md:grid-cols-2 gap-8 w-full">
            <Card className="shadow-lg text-center">
              <CardHeader><CardTitle className="font-headline text-xl text-primary">{uiStrings.firstOracleTitle}</CardTitle></CardHeader>
              <CardContent className="pb-4">
                <p className="text-4xl md:text-5xl font-bold text-primary font-headline pt-4 pb-2">{firstOracleInterpretationLang?.title || firstOracleResult}</p>
                {renderStars(firstOracleResult)}
              </CardContent>
            </Card>
            <Card className="shadow-lg text-center">
              <CardHeader><CardTitle className="font-headline text-xl text-primary">{uiStrings.secondOracleTitle}</CardTitle></CardHeader>
              <CardContent className="pb-4">
                <p className="text-4xl md:text-5xl font-bold text-primary font-headline pt-4 pb-2">{doubleOracleInterpretationLang?.title?.split(currentLang === 'zh-CN' ? "配" : "with")[1]?.trim().split(currentLang === 'zh-CN' ? "宮" : "Palace")[0]?.trim() || secondOracleResult}</p>
                {renderStars(secondOracleResult)}
              </CardContent>
            </Card>
          </div>

          {firstOracleInterpretationZh && (
            <Card className="w-full shadow-xl">
              <CardHeader>
                <CardTitle className="font-headline text-xl text-primary">{uiStrings.singlePalaceInterpretationTitle}</CardTitle>
                <CardDescription className="font-headline">
                  {firstOracleInterpretationZh.title}
                  {currentLang !== 'zh-CN' && firstOracleInterpretationLang?.title && firstOracleInterpretationLang.title !== firstOracleInterpretationZh.title && (<><br /><span className="text-sm text-muted-foreground">({firstOracleInterpretationLang.title})</span></>)}
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
                  {doubleOracleInterpretationZh.title}
                  {currentLang !== 'zh-CN' && doubleOracleInterpretationLang?.title && doubleOracleInterpretationLang.title !== doubleOracleInterpretationZh.title && (<><br /><span className="text-sm text-muted-foreground">({doubleOracleInterpretationLang.title})</span></>)}
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

        {showBlurOverlay && (
          <div className="absolute inset-0 z-20 overflow-y-auto">
            {PAYPAL_CLIENT_ID ? ctaContent : (
               <Card className="w-full max-w-md text-center">
                 <CardHeader><CardTitle className="text-destructive">Configuration Error</CardTitle></CardHeader>
                 <CardContent>
                    <p>The PayPal Client ID is missing. Please add `NEXT_PUBLIC_PAYPAL_CLIENT_ID` to your environment variables to enable payments.</p>
                 </CardContent>
               </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
