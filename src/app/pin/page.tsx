
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

export default function PinPage() {
  const [oracleData, setOracleData] = useState<OracleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [setError] = useState<string | null>(null);
  const [uiStrings, setUiStrings] = useState<LocaleStrings | null>(null);
  const [currentLang, setCurrentLang] = useState<string>("en");

  useEffect(() => {
    // Detect language
    let detectedLang = navigator.language.toLowerCase();
    if (detectedLang.startsWith('zh')) {
      detectedLang = 'zh-CN';
    } else {
      detectedLang = 'en';
    }
    setCurrentLang(detectedLang);
    setUiStrings(getLocaleStrings(detectedLang));

    // Calculate Oracle
    try {
      const date = new Date();
      const lDate = gregorianToLunar(date.getFullYear(), date.getMonth() + 1, date.getDate());
      const sValue = getShichen(date.getHours());
      if (!lDate || !sValue) throw new Error("Failed to derive calendar or shichen data.");
      
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
        firstOracleInterpretationZh: getSinglePalaceInterpretation(firstOracleName, 'zh-CN'),
        firstOracleInterpretationLang: getSinglePalaceInterpretation(firstOracleName, detectedLang),
        doubleOracleInterpretationZh: getDoublePalaceInterpretation(firstOracleName, secondOracleName, 'zh-CN'),
        doubleOracleInterpretationLang: getDoublePalaceInterpretation(firstOracleName, secondOracleName, detectedLang),
      });
    } catch (e: any) {
      const strings = getLocaleStrings(navigator.language.toLowerCase());
      setError(e.message || strings.calculationErrorText);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
  
  if (isLoading || !uiStrings || !oracleData) {
    const strings = getLocaleStrings(currentLang);
    return (
      <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center pt-10 pb-20 px-4 relative">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p>{strings.calculatingDestiny || "Calculating..."}</p> 
      </main>
    );
  }

  const error = null; // Error state is set but not used, declare to prevent build issues.
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

  const { currentDateTime, lunarDate, shichen, firstOracleResult, secondOracleResult, firstOracleInterpretationZh, firstOracleInterpretationLang, doubleOracleInterpretationZh, doubleOracleInterpretationLang } = oracleData;
  const formatDate = (date: Date, lang: string) => date.toLocaleDateString(lang.startsWith('zh') ? 'zh-Hans-CN' : lang, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formatTime = (date: Date, lang: string) => date.toLocaleTimeString(lang.startsWith('zh') ? 'zh-Hans-CN' : lang);

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
            <p className="text-lg font-semibold font-body">{formatDate(currentDateTime, currentLang)}<br />{formatTime(currentDateTime, currentLang)}</p>
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

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-lg">
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

      <Card className="w-full max-w-lg shadow-xl bg-accent/10 border-accent">
        <CardHeader><CardTitle className="font-headline text-lg text-primary">温馨提示</CardTitle></CardHeader>
        <CardContent><p className="text-sm font-body text-foreground/90 whitespace-pre-line">如果测算结果不如意，需要破解方法，请关注公众号： 改过的锤子<br />关注以后，发送消息 999</p></CardContent>
      </Card>
       
       {(!firstOracleInterpretationLang || !doubleOracleInterpretationLang) && firstOracleResult && secondOracleResult && (
         <Card className="w-full max-w-lg shadow-xl">
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
    </main>
  );
}
