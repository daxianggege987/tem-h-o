
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { gregorianToLunar, getShichen } from "@/lib/calendar-utils";
import { ORACLE_RESULTS_MAP } from "@/lib/oracle-utils";
import { getSinglePalaceInterpretation, getDoublePalaceInterpretation } from "@/lib/interpretations";
import type { LunarDate, Shichen, OracleResultName, SingleInterpretationContent, DoubleInterpretationContent } from "@/lib/types";
import type { LocaleStrings } from "@/lib/locales";
import { getLocaleStrings } from "@/lib/locales";
import { Loader2, Star, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OracleData {
  currentDateTime: Date;
  lunarDate: LunarDate;
  shichen: Shichen;
  firstOracleResult: OracleResultName;
  secondOracleResult: OracleResultName;
  firstOracleInterpretation: SingleInterpretationContent | null;
  doubleOracleInterpretation: DoubleInterpretationContent | null;
}

const SOURCE_CODE_PAYMENT_URL = "https://www.creem.io/test/payment/prod_R6rZbdej5eUPBjFJ3Vx1G";

const SourceCodePurchaseButton = ({ uiStrings }: { uiStrings: LocaleStrings }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = () => {
    setIsProcessing(true);
    localStorage.setItem('paymentContext', 'source-code-purchase');
    localStorage.setItem('paymentLanguage', 'zh-CN');
    window.location.href = SOURCE_CODE_PAYMENT_URL;
  };

  return (
    <div className="w-full max-w-xs mx-auto pt-2">
      <Button onClick={handlePurchase} disabled={isProcessing} className="w-full text-lg" size="lg">
        {isProcessing ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <CreditCard className="mr-2 h-5 w-5" />
        )}
        {isProcessing ? "正在跳转..." : "支付 $399 购买"}
      </Button>
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
          <SourceCodePurchaseButton uiStrings={uiStrings} />
        </CardContent>
      </Card>
    </main>
  );
}
