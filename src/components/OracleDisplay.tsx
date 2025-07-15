"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { gregorianToLunar, getShichen } from "@/lib/calendar-utils";
import { ORACLE_RESULTS_MAP } from "@/lib/oracle-utils";
import { getSinglePalaceInterpretation, getDoublePalaceInterpretation } from "@/lib/interpretations";
import type { LunarDate, Shichen, OracleResultName, SingleInterpretationContent, DoubleInterpretationContent } from "@/lib/types";
import type { LocaleStrings } from "@/lib/locales";
import { Loader2, Star, Clock, CheckCircle, ScanLine, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from 'next/image';

const unlockProduct = {
  id: 'oracle-unlock-298',
  description: 'Unlock Oracle Reading',
  price: '2.98',
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

const WeChatPayFlow = React.memo(({ uiStrings, product, onSuccess }: { uiStrings: LocaleStrings, product: typeof unlockProduct, onSuccess: () => void }) => {
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const pollIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  const cleanup = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  const pollOrderStatus = useCallback(async (tradeNo: string) => {
    try {
      const response = await fetch(`/api/wechat/create-order?out_trade_no=${tradeNo}`);
      const data = await response.json();
      if (data.trade_state === 'SUCCESS') {
        toast({ title: "支付成功！", description: "您的解读已解锁。" });
        cleanup();
        onSuccess();
      }
    } catch (e) {
      console.error("Polling error:", e);
    }
  }, [toast, onSuccess, cleanup]);

  const handleCreateOrder = async () => {
    setIsCreatingOrder(true);
    setError(null);
    try {
      const res = await fetch('/api/wechat/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "创建订单失败");
      }
      
      setQrCodeUrl(data.code_url);
      setOrderId(data.out_trade_no);
      
      // Start polling
      setIsPolling(true);
      pollIntervalRef.current = setInterval(() => pollOrderStatus(data.out_trade_no), 3000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  return (
    <Dialog onOpenChange={(open) => !open && cleanup()}>
      <DialogTrigger asChild>
        <Button className="w-full text-lg bg-green-500 hover:bg-green-600 text-white" size="lg" onClick={handleCreateOrder} disabled={isCreatingOrder}>
          {isCreatingOrder ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ScanLine className="mr-2 h-5 w-5" />}
          {uiStrings.wechatPayButton}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{uiStrings.wechatPayTitle}</DialogTitle>
          <DialogDescription>{uiStrings.wechatPayDescription}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-4 min-h-[250px]">
          {error && (
            <div className="text-destructive flex flex-col items-center gap-2">
              <AlertCircle className="h-8 w-8" />
              <p className="font-semibold">出错了</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
          {!error && isCreatingOrder && <Loader2 className="h-12 w-12 animate-spin text-primary" />}
          {!error && !isCreatingOrder && qrCodeUrl && (
            <>
              <Image
                src={qrCodeUrl}
                alt="WeChat Pay QR Code"
                width={200}
                height={200}
                data-ai-hint="qr code"
              />
              <p className="mt-4 text-lg font-semibold text-destructive">{product.price} CNY</p>
              {isPolling && <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/>正在检测支付状态...</p>}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});
WeChatPayFlow.displayName = 'WeChatPayFlow';

const PaymentGateway = React.memo(({ currentLang, uiStrings, handleUnlockSuccess }: {
    currentLang: string;
    uiStrings: LocaleStrings;
    handleUnlockSuccess: () => void;
}) => {
    // For now, we only show WeChat Pay for Chinese language.
    // The English payment flow can be re-added here if needed.
    if (currentLang === 'zh-CN') {
        return <WeChatPayFlow uiStrings={uiStrings} product={unlockProduct} onSuccess={handleUnlockSuccess} />;
    }

    // Fallback or English version can show a message or a different payment method.
    return (
        <Card className="w-full max-w-md text-center border-border">
            <CardHeader><CardTitle>Payment Not Available</CardTitle></CardHeader>
            <CardContent>
             <p>The payment system for this language is not currently configured.</p>
            </CardContent>
        </Card>
    );
});
PaymentGateway.displayName = 'PaymentGateway';


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
      setIsUnlocked(true); // Still unlock the UI even if localStorage fails
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

  const getResultTitle = (oracleName: OracleResultName, lang: string) => {
    const zhContent = getSinglePalaceInterpretation(oracleName, 'zh-CN');
    if (lang === 'zh-CN' || !zhContent) {
      return <p className="text-4xl md:text-5xl font-bold text-primary font-headline pt-4 pb-2 leading-tight">{getSinglePalaceInterpretation(oracleName, lang)?.title}</p>;
    }
    const langContent = getSinglePalaceInterpretation(oracleName, lang);
    return (
      <div className="pt-4 pb-2">
        <p className="text-4xl md:text-5xl font-bold text-primary font-headline leading-tight">{zhContent.title}</p>
        <p className="text-2xl md:text-3xl font-bold text-primary/80 font-headline leading-tight mt-1">{langContent?.title}</p>
      </div>
    );
  };
  
  const UnlockedContent = (
    <div className="w-full max-w-lg space-y-8">
        <div className="grid md:grid-cols-2 gap-8 w-full">
            <Card className="shadow-lg text-center">
            <CardHeader><CardTitle className="font-headline text-xl text-primary">{uiStrings.firstOracleTitle}</CardTitle></CardHeader>
            <CardContent className="pb-4">
                {getResultTitle(firstOracleResult, currentLang)}
                {renderStars(firstOracleResult)}
            </CardContent>
            </Card>
            <Card className="shadow-lg text-center">
            <CardHeader><CardTitle className="font-headline text-xl text-primary">{uiStrings.secondOracleTitle}</CardTitle></CardHeader>
            <CardContent className="pb-4">
                {getResultTitle(secondOracleResult, currentLang)}
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
            <CardHeader><CardTitle className="font-headline text-lg text-primary">{uiStrings.unlockTipTitle}</CardTitle></CardHeader>
            <CardContent><p className="text-sm font-body text-foreground/90 whitespace-pre-line">{uiStrings.unlockTipContent}</p></CardContent>
        </Card>
        
        <Card className="w-full max-w-lg shadow-xl border-primary/50">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-headline text-primary">{uiStrings.vipRecommendTitle}</CardTitle>
            <CardDescription>{uiStrings.vipRecommendDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm px-6 pt-0 pb-4">
            <p className="text-center text-muted-foreground">
              {uiStrings.vipRecommendReason}
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-muted-foreground">
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                <span className="font-semibold text-foreground">{uiStrings.vipFeatureCustomTime}</span>
              </li>
              <li className="flex items-start"><CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />{uiStrings.vipFeatureUnlimited}</li>
              <li className="flex items-start"><CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />{uiStrings.vipFeatureDirectAccess}</li>
              <li className="flex items-start"><CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />{uiStrings.vipFeatureAdFree}</li>
            </ul>
          </CardContent>
          <CardFooter className="flex-col px-6 pb-6">
            <Link href={currentLang === 'zh-CN' ? "/cn/pricing" : "/pricing"}>
              <Button className="w-full text-lg" size="lg">
                {uiStrings.vipRecommendButton}
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
      ) : (
        <div className="w-full max-w-lg">
          <Card className="bg-background/95 rounded-lg border border-primary/30 shadow-2xl flex flex-col">
            <CardHeader>
                <CardTitle className="text-2xl text-center font-headline text-primary">{uiStrings.unlockFullReadingTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 px-4 md:px-6 text-foreground pb-8">
                <div className="space-y-3 text-base leading-relaxed text-muted-foreground text-justify">
                    <p>
                        {uiStrings.unlockIntro1}
                    </p>
                    <p>
                        {uiStrings.unlockIntro2}
                    </p>
                </div>

                <Separator className="my-4" />
                
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-center text-primary">{uiStrings.unlockTestimonialsTitle}</h3>
                    <div className="space-y-5 text-muted-foreground italic">
                        {uiStrings.unlockTestimonials.map((testimonial, index) => (
                           <blockquote key={index} className="border-l-2 pl-4 border-secondary">
                           <p className="mb-2">{testimonial.quote}</p>
                           <footer className="text-right not-italic text-sm font-semibold">{testimonial.author}</footer>
                           </blockquote>
                        ))}
                    </div>
                </div>
                
                <Separator className="my-4" />

                <div className="rounded-lg border-2 border-primary bg-primary/10 p-4 my-6 text-center shadow-lg">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="h-6 w-6 text-primary" />
                    <h3 className="text-xl font-bold text-primary">{uiStrings.unlockLimitedOfferTitle}</h3>
                  </div>
                  <p className="mt-2 text-muted-foreground">{uiStrings.unlockLimitedOfferSubtitle}</p>
                  <div className="my-4 text-4xl font-bold text-destructive tracking-wider">
                    {timeLeft > 0 ? formatCountdown(timeLeft) : uiStrings.unlockOfferEnded}
                  </div>
                  <p className="text-lg">
                    {uiStrings.unlockPricePrefix} <span className="font-bold text-2xl text-foreground">{currentLang === 'zh-CN' ? '¥2.98' : '$2.98'}</span>
                    <span className="text-muted-foreground line-through ml-2">{currentLang === 'zh-CN' ? '¥7.98' : '$7.98'}</span>
                  </p>
                </div>
                
                <div className="text-center space-y-4">
                    <PaymentGateway 
                        currentLang={currentLang}
                        uiStrings={uiStrings}
                        handleUnlockSuccess={handleUnlockSuccess}
                    />
                    <p className="text-sm text-muted-foreground px-4">
                        {uiStrings.unlockBenefits}
                    </p>
                </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
