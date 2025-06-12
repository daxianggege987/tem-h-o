
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
  firstOracleInterpretation: SingleInterpretationContent | null;
  doubleOracleInterpretation: DoubleInterpretationContent | null;
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
    setIsLoading(true); // Reset loading state if lang changes and re-triggers effect
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
      
      const firstInterp = getSinglePalaceInterpretation(firstOracleName, currentLang);
      const doubleInterp = getDoublePalaceInterpretation(firstOracleName, secondOracleName, currentLang);

      setOracleData({
        currentDateTime: date,
        lunarDate: lDate,
        shichen: sValue,
        firstOracleResult: firstOracleName,
        secondOracleResult: secondOracleName,
        firstOracleInterpretation: firstInterp,
        doubleOracleInterpretation: doubleInterp,
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
  }, [currentLang, uiStrings]); // Rerun if language or uiStrings change

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
    firstOracleInterpretation,
    doubleOracleInterpretation 
  } = oracleData;

  const formatDate = (date: Date, lang: string) => {
    const locale = lang === 'zh-CN' ? 'zh-Hans-CN' : lang; // Use more specific locale for Chinese if available
    return date.toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTime = (date: Date, lang: string) => {
     const locale = lang === 'zh-CN' ? 'zh-Hans-CN' : lang;
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
          <div className="text-center pt-4">
            <p className="text-xs text-muted-foreground italic font-body">
              {uiStrings.lunarCalendarNote}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-lg">
        <Card className="shadow-lg text-center">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-primary">{uiStrings.firstOracleTitle}</CardTitle>
            <CardDescription className="font-body text-sm">{uiStrings.firstOracleFormula}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl md:text-5xl font-bold text-primary font-headline py-4">
              {firstOracleInterpretation?.title || firstOracleResult}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg text-center">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-primary">{uiStrings.secondOracleTitle}</CardTitle>
            <CardDescription className="font-body text-sm">{uiStrings.secondOracleFormula}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl md:text-5xl font-bold text-primary font-headline py-4">
              {/* Display title from double interpretation if available, else from single, else the raw name */}
              {doubleOracleInterpretation?.title.split("配")[1]?.trim().split("宮")[0] || secondOracleResult}
            </p>
          </CardContent>
        </Card>
      </div>

      {firstOracleInterpretation && (
        <Card className="w-full max-w-lg shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-primary">{uiStrings.singlePalaceInterpretationTitle}</CardTitle>
            <CardDescription className="font-headline">{firstOracleInterpretation.title}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-semibold text-md text-secondary-foreground font-body">{uiStrings.meaningLabel}</h4>
              <p className="text-sm font-body whitespace-pre-line">{firstOracleInterpretation.meaning}</p>
            </div>
            {firstOracleInterpretation.advice && (
              <div>
                <h4 className="font-semibold text-md text-secondary-foreground font-body">{uiStrings.adviceLabel}</h4>
                <p className="text-sm font-body whitespace-pre-line">{firstOracleInterpretation.advice}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {doubleOracleInterpretation && (
        <Card className="w-full max-w-lg shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-primary">{uiStrings.doublePalaceInterpretationTitle}</CardTitle>
            <CardDescription className="font-headline">{doubleOracleInterpretation.title}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-semibold text-md text-secondary-foreground font-body">{uiStrings.poemLabel}</h4>
              <p className="text-sm font-body whitespace-pre-line">{doubleOracleInterpretation.poem}</p>
            </div>
            <div>
              <h4 className="font-semibold text-md text-secondary-foreground font-body">{uiStrings.explanationLabel}</h4>
              <p className="text-sm font-body whitespace-pre-line">{doubleOracleInterpretation.explanation}</p>
            </div>
          </CardContent>
        </Card>
      )}
       
       {(!firstOracleInterpretation || !doubleOracleInterpretation) && firstOracleResult && secondOracleResult && (
         <Card className="w-full max-w-lg shadow-xl">
           <CardHeader>
             <CardTitle className="font-headline text-xl text-muted-foreground">{uiStrings.interpretationsPendingTitle}</CardTitle>
           </CardHeader>
           <CardContent>
             <p className="text-sm font-body">
               {!firstOracleInterpretation && uiStrings.interpretationMissingText(firstOracleResult, 'single')}
               {(!firstOracleInterpretation && !doubleOracleInterpretation) && <br/>}
               {!doubleOracleInterpretation && uiStrings.interpretationMissingText(firstOracleResult, 'double', secondOracleResult)}
               <br />
               {uiStrings.addInterpretationsNote}
             </p>
           </CardContent>
         </Card>
       )}
    </div>
  );
}
