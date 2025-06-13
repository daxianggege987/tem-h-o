
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { gregorianToLunar } from "@/lib/calendar-utils";
import { getShichen } from "@/lib/calendar-utils";
import { ORACLE_RESULTS_MAP } from "@/lib/oracle-utils";
import { getSinglePalaceInterpretation, getDoublePalaceInterpretation } from "@/lib/interpretations";
import type { LunarDate, Shichen, OracleResultName, SingleInterpretationContent, DoubleInterpretationContent } from "@/lib/types";
import type { LocaleStrings } from "@/lib/locales";
import { Loader2 } from "lucide-react";

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

interface OracleDisplayProps {
  currentLang: string;
  uiStrings: LocaleStrings;
}

export default function OracleDisplay({ currentLang, uiStrings }: OracleDisplayProps) {
  const [oracleData, setOracleData] = useState<OracleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true); 
    try {
      const date = new Date();
      
      const year = date.getFullYear();
      const month = date.getMonth() + 1; 
      const day = date.getDate();
      const hour = date.getHours();

      const lDate = gregorianToLunar(year, month, day);
      const sValue = getShichen(hour);

      if (!lDate || !sValue) {
        throw new Error("Failed to derive calendar or shichen data.");
      }
      
      const firstOracleSum = lDate.lunarMonth + lDate.lunarDay + sValue.value - 2;
      let firstOracleRemainder = firstOracleSum % 6;
      if (firstOracleRemainder < 0) firstOracleRemainder += 6;
      const firstOracleName = ORACLE_RESULTS_MAP[firstOracleRemainder];

      const secondOracleSum = lDate.lunarDay + sValue.value - 1;
      let secondOracleRemainderValue = secondOracleSum % 6;
      if (secondOracleRemainderValue < 0) secondOracleRemainderValue += 6;
      const secondOracleName = ORACLE_RESULTS_MAP[secondOracleRemainderValue];
      
      const firstInterpZh = getSinglePalaceInterpretation(firstOracleName, 'zh-CN');
      const firstInterpLang = getSinglePalaceInterpretation(firstOracleName, currentLang);
      const doubleInterpZh = getDoublePalaceInterpretation(firstOracleName, secondOracleName, 'zh-CN');
      const doubleInterpLang = getDoublePalaceInterpretation(firstOracleName, secondOracleName, currentLang);

      setOracleData({
        currentDateTime: date,
        lunarDate: lDate,
        shichen: sValue,
        firstOracleResult: firstOracleName,
        secondOracleResult: secondOracleName,
        firstOracleInterpretationZh: firstInterpZh,
        firstOracleInterpretationLang: firstInterpLang,
        doubleOracleInterpretationZh: doubleInterpZh,
        doubleOracleInterpretationLang: doubleInterpLang,
      });
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError(uiStrings.calculationErrorText || "An unknown error occurred during calculation.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentLang, uiStrings]);

  if (isLoading || !uiStrings) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg font-headline">{uiStrings?.calculatingDestiny || "Calculating..."}</p>
      </div>
    );
  }

  if (error || !oracleData) {
    return (
      <Card className="w-full max-w-md shadow-xl bg-destructive/10 border-destructive">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-destructive-foreground">{uiStrings.calculationErrorTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive-foreground">
            {error || uiStrings.calculationErrorText}
          </p>
        </CardContent>
      </Card>
    );
  }

  const { 
    currentDateTime, 
    lunarDate, 
    shichen, 
    firstOracleResult, 
    secondOracleResult,
    firstOracleInterpretationZh,
    firstOracleInterpretationLang,
    doubleOracleInterpretationZh,
    doubleOracleInterpretationLang
  } = oracleData;

  const formatDate = (date: Date, lang: string) => {
    const locale = lang.startsWith('zh') ? 'zh-Hans-CN' : lang.startsWith('ja') ? 'ja-JP' : lang;
    return date.toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTime = (date: Date, lang: string) => {
     const locale = lang.startsWith('zh') ? 'zh-Hans-CN' : lang.startsWith('ja') ? 'ja-JP' : lang;
     return date.toLocaleTimeString(locale);
  }

  return (
    <div className="flex flex-col items-center space-y-8 w-full px-2 pb-12">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">{uiStrings.temporalCoordinatesTitle}</CardTitle>
          <CardDescription className="font-headline">{uiStrings.temporalCoordinatesDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground font-headline">{uiStrings.currentTimeGregorianLabel}</p>
            <p className="text-lg font-semibold font-body">
              {formatDate(currentDateTime, currentLang)}
              <br />
              {formatTime(currentDateTime, currentLang)}
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center pt-2">
            <div>
              <p className="text-sm text-muted-foreground font-headline">{uiStrings.lunarMonthLabel}</p>
              <p className="text-4xl md:text-5xl font-bold text-accent font-body">{lunarDate.lunarMonth}</p>
              <p className="text-xs text-muted-foreground font-headline">{currentLang === 'zh-CN' ? '月' : uiStrings.lunarMonthUnit}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-headline">{uiStrings.lunarDayLabel}</p>
              <p className="text-4xl md:text-5xl font-bold text-accent font-body">{lunarDate.lunarDay}</p>
              <p className="text-xs text-muted-foreground font-headline">{currentLang === 'zh-CN' ? '日' : uiStrings.lunarDayUnit}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-headline">{uiStrings.shichenLabel}</p>
              <p className="text-4xl md:text-5xl font-bold text-accent font-body">{shichen.value}</p>
              <p className="text-xs text-muted-foreground font-headline">{shichen.name}{currentLang === 'zh-CN' ? '時' : uiStrings.shichenTimeUnit}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-lg">
        <Card className="shadow-lg text-center">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-primary">{uiStrings.firstOracleTitle}</CardTitle>
            {/* Formula removed from here */}
          </CardHeader>
          <CardContent>
            <p className="text-4xl md:text-5xl font-bold text-primary font-headline py-4">
              {firstOracleInterpretationLang?.title || firstOracleResult}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg text-center">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-primary">{uiStrings.secondOracleTitle}</CardTitle>
            {/* Formula removed from here */}
          </CardHeader>
          <CardContent>
            <p className="text-4xl md:text-5xl font-bold text-primary font-headline py-4">
              {doubleOracleInterpretationLang?.title?.split(currentLang === 'zh-CN' ? "配" : "with")[1]?.trim().split(currentLang === 'zh-CN' ? "宮" : "Palace")[0]?.trim() || 
               secondOracleResult}
            </p>
          </CardContent>
        </Card>
      </div>

      {firstOracleInterpretationZh && (
        <Card className="w-full max-w-lg shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-primary">{uiStrings.singlePalaceInterpretationTitle}</CardTitle>
            <CardDescription className="font-headline">
                {firstOracleInterpretationZh.title}
                {currentLang !== 'zh-CN' && firstOracleInterpretationLang?.title && firstOracleInterpretationLang.title !== firstOracleInterpretationZh.title && (
                    <>
                        <br />
                        <span className="text-sm text-muted-foreground">({firstOracleInterpretationLang.title})</span>
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
              <div className="mt-3 pt-3 border-t">
                <h4 className="font-semibold text-md text-secondary-foreground font-body">{uiStrings.meaningLabel} ({currentLang.toUpperCase()})</h4>
                <p className="text-sm font-body whitespace-pre-line">{firstOracleInterpretationLang.meaning}</p>
              </div>
            )}
            {firstOracleInterpretationZh.advice && (
              <div className="mt-2">
                <h4 className="font-semibold text-md text-secondary-foreground font-body">{uiStrings.adviceLabel} ({uiStrings.languageNameChinese})</h4>
                <p className="text-sm font-body whitespace-pre-line">{firstOracleInterpretationZh.advice}</p>
              </div>
            )}
            {currentLang !== 'zh-CN' && firstOracleInterpretationLang?.advice && firstOracleInterpretationLang.advice !== firstOracleInterpretationZh.advice && (
              <div className="mt-3 pt-3 border-t">
                <h4 className="font-semibold text-md text-secondary-foreground font-body">{uiStrings.adviceLabel} ({currentLang.toUpperCase()})</h4>
                <p className="text-sm font-body whitespace-pre-line">{firstOracleInterpretationLang.advice}</p>
              </div>
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
                {currentLang !== 'zh-CN' && doubleOracleInterpretationLang?.title && doubleOracleInterpretationLang.title !== doubleOracleInterpretationZh.title && (
                     <>
                        <br />
                        <span className="text-sm text-muted-foreground">({doubleOracleInterpretationLang.title})</span>
                    </>
                )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-semibold text-md text-secondary-foreground font-body">{uiStrings.poemLabel} ({uiStrings.languageNameChinese})</h4>
              <p className="text-sm font-body whitespace-pre-line">{doubleOracleInterpretationZh.poem}</p>
            </div>
            {currentLang !== 'zh-CN' && doubleOracleInterpretationLang?.poem && doubleOracleInterpretationLang.poem !== doubleOracleInterpretationZh.poem && (
              <div className="mt-3 pt-3 border-t">
                <h4 className="font-semibold text-md text-secondary-foreground font-body">{uiStrings.poemLabel} ({currentLang.toUpperCase()})</h4>
                <p className="text-sm font-body whitespace-pre-line">{doubleOracleInterpretationLang.poem}</p>
              </div>
            )}
            <div className="mt-2">
              <h4 className="font-semibold text-md text-secondary-foreground font-body">{uiStrings.explanationLabel} ({uiStrings.languageNameChinese})</h4>
              <p className="text-sm font-body whitespace-pre-line">{doubleOracleInterpretationZh.explanation}</p>
            </div>
            {currentLang !== 'zh-CN' && doubleOracleInterpretationLang?.explanation && doubleOracleInterpretationLang.explanation !== doubleOracleInterpretationZh.explanation && (
              <div className="mt-3 pt-3 border-t">
                <h4 className="font-semibold text-md text-secondary-foreground font-body">{uiStrings.explanationLabel} ({currentLang.toUpperCase()})</h4>
                <p className="text-sm font-body whitespace-pre-line">{doubleOracleInterpretationLang.explanation}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
       
       {/* This card shows if the *current language's* interpretation is missing */}
       {(!firstOracleInterpretationLang || !doubleOracleInterpretationLang) && firstOracleResult && secondOracleResult && (
         <Card className="w-full max-w-lg shadow-xl">
           <CardHeader>
             <CardTitle className="font-headline text-xl text-muted-foreground">{uiStrings.interpretationsPendingTitle}</CardTitle>
           </CardHeader>
           <CardContent>
             <p className="text-sm font-body">
               {!firstOracleInterpretationLang && uiStrings.interpretationMissingText(firstOracleResult, 'single', undefined, currentLang)}
               {(!firstOracleInterpretationLang && !doubleOracleInterpretationLang) && <br/>}
               {!doubleOracleInterpretationLang && uiStrings.interpretationMissingText(firstOracleResult, 'double', secondOracleResult, currentLang)}
               <br />
               {uiStrings.addInterpretationsNote}
             </p>
           </CardContent>
         </Card>
       )}
    </div>
  );
}
