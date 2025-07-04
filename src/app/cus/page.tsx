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
import { Calendar as CalendarIcon, Loader2, Star } from "lucide-react";
import type { LocaleStrings } from "@/lib/locales";
import { getLocaleStrings } from "@/lib/locales";

interface OracleData {
  currentDateTime: Date;
  lunarDate: LunarDate;
  shichen: Shichen;
  firstOracleResult: OracleResultName;
  secondOracleResult: OracleResultName;
  firstOracleInterpretationZh: SingleInterpretationContent | null;
  firstOracleInterpretationLang: SingleInterpretationContent | null;
  doubleOracleInterpretationZh: DoubleInterpretationContent | null;
  doubleOracleInterpretationLang: DoubleInterpretationContent | null;
}

const shichenOptions: Shichen[] = [
  { name: "子", value: 1 }, { name: "丑", value: 2 }, { name: "寅", value: 3 },
  { name: "卯", value: 4 }, { name: "辰", value: 5 }, { name: "巳", value: 6 },
  { name: "午", value: 7 }, { name: "未", value: 8 }, { name: "申", value: 9 },
  { name: "酉", value: 10 }, { name: "戌", value: 11 }, { name: "亥", value: 12 },
];

export default function CustomOraclePage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedShichen, setSelectedShichen] = useState<Shichen | undefined>(undefined);
  const [oracleData, setOracleData] = useState<OracleData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uiStrings, setUiStrings] = useState<LocaleStrings | null>(null);
  const [currentLang, setCurrentLang] = useState<string>("en");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
      let detectedLang = navigator.language.toLowerCase();
      if (detectedLang.startsWith('zh')) {
        detectedLang = 'zh-CN';
      } else {
        detectedLang = 'en';
      }
      setCurrentLang(detectedLang);
      setUiStrings(getLocaleStrings(detectedLang));
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
        firstOracleInterpretationZh: getSinglePalaceInterpretation(firstOracleName, 'zh-CN'),
        firstOracleInterpretationLang: getSinglePalaceInterpretation(firstOracleName, currentLang),
        doubleOracleInterpretationZh: getDoublePalaceInterpretation(firstOracleName, secondOracleName, 'zh-CN'),
        doubleOracleInterpretationLang: getDoublePalaceInterpretation(firstOracleName, secondOracleName, currentLang),
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
  
  if (!uiStrings) {
    return (
      <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </main>
    )
  }

  const { currentDateTime, lunarDate, shichen, firstOracleResult, secondOracleResult, firstOracleInterpretationZh, firstOracleInterpretationLang, doubleOracleInterpretationZh, doubleOracleInterpretationLang } = oracleData || {};
  const formatDate = (d: Date, lang: string) => d.toLocaleDateString(lang.startsWith('zh') ? 'zh-Hans-CN' : lang, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formatTime = (s: Shichen, lang: string) => s.name + (lang === 'zh-CN' ? '时' : ' Hour');
  
  return (
    <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center pt-10 pb-20 px-4 space-y-8">
       <header className="text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-headline font-bold text-primary">
          自定义测算
        </h1>
        <p className="text-md sm:text-lg md:text-xl text-muted-foreground mt-3 md:mt-4 font-headline max-w-2xl mx-auto">
          选择一个日期和时辰，回顾过去或展望未来。
        </p>
      </header>

      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline">输入您的测算时间</CardTitle>
          <CardDescription>请选择公历日期和时辰</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="date-picker">公历日期</Label>
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
                  {date ? format(date, "PPP") : <span>选择一个日期</span>}
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
            <Label htmlFor="shichen-select">时辰</Label>
             <Select onValueChange={(value) => setSelectedShichen(shichenOptions.find(s => s.value === parseInt(value)))}>
                <SelectTrigger id="shichen-select" className="w-full">
                    <SelectValue placeholder="请选择一个时辰" />
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
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : "开始测算"}
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
                <p className="text-sm text-muted-foreground font-headline">您选择的时间</p>
                <p className="text-lg font-semibold font-body">{formatDate(currentDateTime!, currentLang)}<br />{formatTime(shichen!, currentLang)}</p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center pt-2">
                {[
                { label: uiStrings.lunarMonthLabel, value: lunarDate!.lunarMonth, unit: currentLang === 'zh-CN' ? '月' : uiStrings.lunarMonthUnit },
                { label: uiStrings.lunarDayLabel, value: lunarDate!.lunarDay, unit: currentLang === 'zh-CN' ? '日' : uiStrings.lunarDayUnit },
                { label: uiStrings.shichenLabel, value: shichen!.value, unit: shichen!.name + (currentLang === 'zh-CN' ? '時' : uiStrings.shichenTimeUnit) }
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
                <p className="text-4xl md:text-5xl font-bold text-primary font-headline pt-4 pb-2">{firstOracleInterpretationLang?.title || firstOracleResult}</p>
                {renderStars(firstOracleResult!)}
            </CardContent>
            </Card>
            <Card className="shadow-lg text-center">
            <CardHeader><CardTitle className="font-headline text-xl text-primary">{uiStrings.secondOracleTitle}</CardTitle></CardHeader>
            <CardContent className="pb-4">
                <p className="text-4xl md:text-5xl font-bold text-primary font-headline pt-4 pb-2">{getSinglePalaceInterpretation(secondOracleResult!, currentLang)?.title || secondOracleResult}</p>
                {renderStars(secondOracleResult!)}
            </CardContent>
            </Card>
        </div>

        {firstOracleInterpretationZh && (
            <Card className="w-full max-w-lg shadow-xl">
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
            <Card className="w-full max-w-lg shadow-xl">
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
        </>
      )}

    </main>
  );
}
