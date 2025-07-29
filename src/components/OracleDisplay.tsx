
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { gregorianToLunar, getShichen } from "@/lib/calendar-utils";
import { ORACLE_RESULTS_MAP } from "@/lib/oracle-utils";
import { getSinglePalaceInterpretation, getDoublePalaceInterpretation } from "@/lib/interpretations";
import type { LunarDate, Shichen, OracleResultName, SingleInterpretationContent, DoubleInterpretationContent } from "@/lib/types";
import type { LocaleStrings } from "@/lib/locales";
import { Loader2, Star, Clock, CheckCircle, ScanLine, AlertTriangle, ExternalLink, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WeChatPayFlow } from "@/components/WeChatPayFlow";


const unlockProduct = {
  id: 'oracle-unlock-449',
  description: 'Unlock Oracle Reading',
  price: '4.49',
};

const CREEM_PAYMENT_URL = "https://www.creem.io/payment/prod_5ZAZWBGvj5bxNi63q90opL";

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

const PaymentGateway = React.memo(({ currentLang, uiStrings, handlePaymentInitiation }: {
    currentLang: string;
    uiStrings: LocaleStrings;
    handlePaymentInitiation: (provider: 'creem' | 'wechat') => void;
}) => {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleCreemPayment = () => {
        setIsProcessing(true);
        handlePaymentInitiation('creem');
        window.location.href = CREEM_PAYMENT_URL;
    };

    if (currentLang === 'zh-CN') {
        const wechatUnlockProduct = {
            id: 'oracle-unlock-449-cny',
            description: uiStrings.unlockFullReadingTitle,
            price: '4.49' // This should be an actual RMB value
        };
        return <WeChatPayFlow 
                  product={wechatUnlockProduct} 
                  onSuccess={() => window.location.href = '/payment-success'}
                  uiStrings={uiStrings}
                />;
    }
    
    return (
        <Button onClick={handleCreemPayment} disabled={isProcessing} className="w-full" size="lg">
            {isProcessing ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin"/>
            ) : (
                <ExternalLink className="mr-2 h-5 w-5"/>
            )}
            {isProcessing ? "Redirecting to payment..." : `${uiStrings.unlockPricePrefix} $4.49 to Unlock`}
        </Button>
    );
});
PaymentGateway.displayName = 'PaymentGateway';


export default function OracleDisplay({ currentLang, uiStrings }: OracleDisplayProps) {
  const [oracleData, setOracleData] = useState<OracleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(15 * 60);

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

  const handlePaymentInitiation = useCallback((provider: 'creem' | 'wechat') => {
    if (!oracleData) return;
    localStorage.setItem('paymentContext', 'oracle-unlock');
    localStorage.setItem('paymentLanguage', currentLang); // Save the current language
    localStorage.setItem('oracleDataForUnlock', JSON.stringify(oracleData));
  }, [oracleData, currentLang]);
  
  useEffect(() => {
    try {
      const storedSessionRaw = localStorage.getItem('oracleUnlockData');
      if (storedSessionRaw) {
        const storedSession = JSON.parse(storedSessionRaw);
        const isExpired = Date.now() - storedSession.unlockedAt > 60 * 60 * 1000; // 60 minutes
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
                {!doubleOracleInterpretationLang && uiStrings.interpretationMissingText(firstOracleResult, 'double', secondOracleName, currentLang)}
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
                    {uiStrings.unlockPricePrefix} <span className="font-bold text-2xl text-foreground">{currentLang === 'zh-CN' ? '¥4.49' : '$4.49'}</span>
                    <span className="text-muted-foreground line-through ml-2">{currentLang === 'zh-CN' ? '¥7.98' : '$7.98'}</span>
                  </p>
                </div>

                <div className="rounded-md border bg-card-foreground/5 p-4 space-y-3 text-sm text-foreground/90">
                    <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-accent flex-shrink-0 mt-0.5"/>
                        <p className="whitespace-pre-line">{uiStrings.unlockBenefits}</p>
                    </div>
                </div>
                
                <div className="text-center space-y-4 pt-4">
                    <PaymentGateway 
                        currentLang={currentLang}
                        uiStrings={uiStrings}
                        handlePaymentInitiation={handlePaymentInitiation}
                    />
                </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}




