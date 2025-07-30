
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { gregorianToLunar, getShichen } from "@/lib/calendar-utils";
import { ORACLE_RESULTS_MAP } from "@/lib/oracle-utils";
import { getSinglePalaceInterpretation, getDoublePalaceInterpretation } from "@/lib/interpretations";
import type { LunarDate, Shichen, OracleResultName, SingleInterpretationContent, DoubleInterpretationContent } from "@/lib/types";
import type { LocaleStrings } from "@/lib/locales";
import { Loader2, Clock, Info, ExternalLink } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const CREEM_PAYMENT_URL = "https://www.creem.io/test/payment/prod_dfYrkm0u2AoY8fIXtVj1f";

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
    handlePaymentInitiation: (provider: 'creem') => void;
}) => {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleCreemPayment = () => {
        setIsProcessing(true);
        handlePaymentInitiation('creem');
        window.location.href = CREEM_PAYMENT_URL;
    };
    
    const buttonText = currentLang === 'zh-CN'
        ? `仅需 $4.49 即可解锁`
        : `Only $4.49 to Unlock`;

    return (
        <Button onClick={handleCreemPayment} disabled={isProcessing} className="w-full" size="lg">
            {isProcessing ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin"/>
            ) : (
                <ExternalLink className="mr-2 h-5 w-5"/>
            )}
            {isProcessing ? (currentLang === 'zh-CN' ? "正在跳转至支付..." : "Redirecting to payment...") : buttonText}
        </Button>
    );
});
PaymentGateway.displayName = 'PaymentGateway';


export default function OracleDisplay({ currentLang, uiStrings }: OracleDisplayProps) {
  const [oracleData, setOracleData] = useState<OracleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  useEffect(() => {
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
  }, []);

  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const handlePaymentInitiation = useCallback((provider: 'creem') => {
    if (!oracleData) return;
    localStorage.setItem('paymentContext', 'oracle-unlock');
    localStorage.setItem('paymentLanguage', currentLang); // Save the current language
    localStorage.setItem('oracleDataForUnlock', JSON.stringify(oracleData));
  }, [oracleData, currentLang]);
  
  useEffect(() => {
    try {
      // Clear any previous unlock data when starting a new divination
      localStorage.removeItem('oracleUnlockData');

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
  
  const { currentDateTime, lunarDate, shichen } = oracleData;
  const displayDate = new Date(currentDateTime);
  const formatDate = (date: Date, lang: string) => date.toLocaleDateString(lang.startsWith('zh') ? 'zh-Hans-CN' : lang, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formatTime = (date: Date, lang: string) => date.toLocaleTimeString(lang.startsWith('zh') ? 'zh-Hans-CN' : lang);

  const introParagraphs = currentLang === 'zh-CN' ? [uiStrings.unlockIntro1, uiStrings.unlockIntro2] : [uiStrings.unlockIntro1, uiStrings.unlockIntro2];
  const benefitParagraphs = currentLang === 'zh-CN' ? [uiStrings.unlockBenefit1, uiStrings.unlockBenefit2, uiStrings.unlockBenefit3] : [uiStrings.unlockBenefit1, uiStrings.unlockBenefit2, uiStrings.unlockBenefit3];

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

      <div className="w-full max-w-lg">
        <Card className="bg-background/95 rounded-lg border border-primary/30 shadow-2xl flex flex-col">
          <CardHeader>
              <CardTitle className="text-2xl text-center font-headline text-primary">{uiStrings.unlockFullReadingTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 px-4 md:px-6 text-foreground pb-8">
              <div className="space-y-3 text-base leading-relaxed text-muted-foreground text-justify">
                  {introParagraphs.map((text, index) => <p key={index}>{text}</p>)}
              </div>
              
              <Separator/>

              <div className="rounded-md border bg-card-foreground/5 p-4 space-y-3 text-sm text-foreground/90">
                  <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-accent flex-shrink-0 mt-0.5"/>
                      <div className='space-y-2'>
                        {benefitParagraphs.map((text, index) => <p key={index}>{text}</p>)}
                      </div>
                  </div>
              </div>
              
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
                  {uiStrings.unlockPricePrefix} <span className="font-bold text-2xl text-foreground">${'4.49'}</span>
                  <span className="text-muted-foreground line-through ml-2">${'7.98'}</span>
                </p>
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
    </div>
  );
}
