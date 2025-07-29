
"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { gregorianToLunar } from "@/lib/calendar-utils";
import { ORACLE_RESULTS_MAP } from "@/lib/oracle-utils";
import { getSinglePalaceInterpretation, getDoublePalaceInterpretation } from "@/lib/interpretations";
import type { LunarDate, Shichen, OracleResultName, SingleInterpretationContent, DoubleInterpretationContent } from "@/lib/types";
import { Calendar as CalendarIcon, Loader2, Star, CreditCard } from "lucide-react";
import { getLocaleStrings, type LocaleStrings } from "@/lib/locales";

interface OracleData {
  currentDateTime: Date;
  lunarDate: LunarDate;
  shichen: Shichen;
  firstOracleResult: OracleResultName;
  secondOracleResult: OracleResultName;
  firstOracleInterpretation: SingleInterpretationContent | null;
  doubleOracleInterpretation: DoubleInterpretationContent | null;
}

const shichenOptions: Shichen[] = [
  { name: "子", value: 1 }, { name: "丑", value: 2 }, { name: "寅", value: 3 },
  { name: "卯", value: 4 }, { name: "辰", value: 5 }, { name: "巳", value: 6 },
  { name: "午", value: 7 }, { name: "未", value: 8 }, { name: "申", value: 9 },
  { name: "酉", value: 10 }, { name: "戌", value: 11 }, { name: "亥", value: 12 },
];

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


export default function CustomOraclePage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedShichen, setSelectedShichen] = useState<Shichen | undefined>(undefined);
  const [oracleData, setOracleData] = useState<OracleData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const uiStrings = getLocaleStrings("zh-CN");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleCalculate = () => {
    if (!date || !selectedShichen) {
      setError("请选择完整的日期和时辰。");
      return;
    }
    setError(null);
    setIsLoading(true);
    setOracleData(null);

    try {
      const lDate = gregorianToLunar(date.getFullYear(), date.getMonth() + 1, date.getDate());
      
      const firstOracleSum = lDate.lunarMonth + lDate.lunarDay + selectedShichen.value - 2;
      let firstOracleRemainder = firstOracleSum % 6;
      if (firstOracleRemainder < 0) firstOracleRemainder += 6;
      const firstOracleName = ORACLE_RESULTS_MAP[firstOracleRemainder];

      const secondOracleSum = lDate.lunarDay + selectedShichen.value - 1;
      let secondOracleRemainderValue = secondOracleSum % 6;
      if (secondOracleRemainderValue < 0) secondOracleRemainderValue += 6;
      const secondOracleName = ORACLE_RESULTS_MAP[secondOracleRemainderValue];
      
      setOracleData({
        currentDateTime: date, lunarDate: lDate, shichen: selectedShichen,
        firstOracleResult: firstOracleName, secondOracleResult: secondOracleName,
        firstOracleInterpretation: getSinglePalaceInterpretation(firstOracleName, 'zh-CN'),
        doubleOracleInterpretation: getDoublePalaceInterpretation(firstOracleName, secondOracleName, 'zh-CN'),
      });

    } catch (e: any) {
      setError(e.message || "计算时发生未知错误。");
    } finally {
      setIsLoading(false);
    }
  };
  
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
  
  if (!isMounted) {
    return (
      <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </main>
    )
  }

  const { currentDateTime, lunarDate, shichen, firstOracleResult, secondOracleResult, firstOracleInterpretation, doubleOracleInterpretation } = oracleData || {};
  const formatDate = (d: Date) => d.toLocaleDateString('zh-Hans-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formatTime = (s: Shichen) => s.name + '时';
  
  return (
    <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center pt-10 pb-20 px-4 space-y-8">
       <header className="text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-headline font-bold text-primary">
          {uiStrings.cusPageTitle}
        </h1>
        <p className="text-md sm:text-lg md:text-xl text-muted-foreground mt-3 md:mt-4 font-headline max-w-2xl mx-auto">
          {uiStrings.cusPageDescription}
        </p>
      </header>

      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline">{uiStrings.cusInputCardTitle}</CardTitle>
          <CardDescription>{uiStrings.cusInputCardDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="date-picker">{uiStrings.cusDateLabel}</Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="date-picker"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>{uiStrings.cusDatePlaceholder}</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(selectedDate) => {
                    setDate(selectedDate);
                    setIsCalendarOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="shichen-select">{uiStrings.cusShichenLabel}</Label>
             <Select onValueChange={(value) => setSelectedShichen(shichenOptions.find(s => s.value === parseInt(value)))}>
                <SelectTrigger id="shichen-select" className="w-full">
                    <SelectValue placeholder={uiStrings.cusShichenPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                    {shichenOptions.map(option => (
                        <SelectItem key={option.value} value={String(option.value)}>
                            {option.name}时 ({(option.value * 2 + 21) % 24}:00 - {(option.value * 2 + 23) % 24 - 1}:59)
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
          <Button onClick={handleCalculate} className="w-full text-lg" size="lg" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : uiStrings.cusCalculateButton}
          </Button>
          {error && <p className="text-sm text-destructive text-center pt-2">{error}</p>}
        </CardContent>
      </Card>
      
      {isLoading && (
         <div className="flex flex-col items-center justify-center text-center p-10">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-headline">{uiStrings.calculatingDestiny}</p>
         </div>
      )}

      {oracleData && (
        <>
        <Card className="w-full max-w-lg shadow-xl">
            <CardHeader>
            <CardTitle className="font-headline text-2xl text-primary">{uiStrings.temporalCoordinatesTitle}</CardTitle>
            <CardDescription className="font-headline">{uiStrings.temporalCoordinatesDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
            <div>
                <p className="text-sm text-muted-foreground font-headline">{uiStrings.currentTimeGregorianLabel}</p>
                <p className="text-lg font-semibold font-body">{formatDate(currentDateTime!)}<br />{formatTime(shichen!)}</p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center pt-2">
                {[
                { label: uiStrings.lunarMonthLabel, value: lunarDate!.lunarMonth, unit: '月'},
                { label: uiStrings.lunarDayLabel, value: lunarDate!.lunarDay, unit: '日' },
                { label: uiStrings.shichenLabel, value: shichen!.value, unit: shichen!.name + '時' }
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
                {renderStars(firstOracleResult!)}
            </CardContent>
            </Card>
            <Card className="shadow-lg text-center">
            <CardHeader><CardTitle className="font-headline text-xl text-primary">{uiStrings.secondOracleTitle}</CardTitle></CardHeader>
            <CardContent className="pb-4">
                <p className="text-4xl md:text-5xl font-bold text-primary font-headline pt-4 pb-2 leading-loose">{getSinglePalaceInterpretation(secondOracleResult!, 'zh-CN')?.title}</p>
                {renderStars(secondOracleResult!)}
            </CardContent>
            </Card>
        </div>

        {firstOracleInterpretation && (
            <Card className="w-full max-w-lg shadow-xl">
            <CardHeader>
                <CardTitle className="font-headline text-xl text-primary">{uiStrings.singlePalaceInterpretationTitle}</CardTitle>
                <CardDescription className="font-headline flex items-baseline">
                  <>
                    <span>{firstOracleInterpretation.title}</span>
                    {firstOracleInterpretation.pinyin && <span className="ml-2 text-muted-foreground text-sm">({firstOracleInterpretation.pinyin})</span>}
                  </>
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
        </>
      )}

    </main>
  );
}
