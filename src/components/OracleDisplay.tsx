"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { gregorianToLunar } from "@/lib/calendar-utils";
import { getShichen } from "@/lib/calendar-utils";
import { ORACLE_RESULTS_MAP } from "@/lib/oracle-utils";
import { getSinglePalaceInterpretation, getDoublePalaceInterpretation } from "@/lib/interpretations";
import type { LunarDate, Shichen, OracleResultName } from "@/lib/types";
import { Loader2 } from "lucide-react";

interface OracleData {
  currentDateTime: Date;
  lunarDate: LunarDate;
  shichen: Shichen;
  firstOracleResult: OracleResultName;
  secondOracleResult: OracleResultName;
  firstOracleInterpretation: { title: string; meaning: string; advice?: string } | null;
  doubleOracleInterpretation: { title: string; poem: string; explanation: string } | null;
}

export default function OracleDisplay() {
  const [oracleData, setOracleData] = useState<OracleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const date = new Date();
      
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // JS months are 0-indexed
      const day = date.getDate();
      const hour = date.getHours();

      const lDate = gregorianToLunar(year, month, day);
      const sValue = getShichen(hour);

      if (!lDate || !sValue) {
        throw new Error("Failed to derive calendar or shichen data.");
      }
      
      // Calculate First Oracle (Single Palace)
      const firstOracleSum = lDate.lunarMonth + lDate.lunarDay + sValue.value - 2;
      let firstOracleRemainder = firstOracleSum % 6;
      if (firstOracleRemainder < 0) firstOracleRemainder += 6;
      const firstOracleName = ORACLE_RESULTS_MAP[firstOracleRemainder];

      // Calculate Second Oracle (for Double Palace)
      // Uses the remainder from the first oracle calculation
      const secondOracleSum = firstOracleRemainder + lDate.lunarDay + sValue.value - 2;
      let secondOracleRemainderValue = secondOracleSum % 6;
      if (secondOracleRemainderValue < 0) secondOracleRemainderValue += 6;
      const secondOracleName = ORACLE_RESULTS_MAP[secondOracleRemainderValue];
      
      const firstInterp = getSinglePalaceInterpretation(firstOracleName);
      const doubleInterp = getDoublePalaceInterpretation(firstOracleName, secondOracleName);

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
        setError("An unknown error occurred during calculation.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg font-headline">Calculating your destiny...</p>
      </div>
    );
  }

  if (error || !oracleData) {
    return (
      <Card className="w-full max-w-md shadow-xl bg-destructive/10 border-destructive">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-destructive-foreground">Calculation Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive-foreground">
            {error || "Could not retrieve oracle data. Please try refreshing the page."}
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

  return (
    <div className="flex flex-col items-center space-y-8 w-full px-2 pb-12">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">Your Temporal Coordinates</CardTitle>
          <CardDescription className="font-headline">Based on your current local time.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground font-headline">Current Time (Gregorian):</p>
            <p className="text-lg font-semibold font-body">
              {currentDateTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              <br />
              {currentDateTime.toLocaleTimeString()}
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center pt-2">
            <div>
              <p className="text-sm text-muted-foreground font-headline">Lunar Month</p>
              <p className="text-4xl md:text-5xl font-bold text-accent font-body">{lunarDate.lunarMonth}</p>
              <p className="text-xs text-muted-foreground font-headline">月</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-headline">Lunar Day</p>
              <p className="text-4xl md:text-5xl font-bold text-accent font-body">{lunarDate.lunarDay}</p>
              <p className="text-xs text-muted-foreground font-headline">日</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-headline">Shichen (时辰)</p>
              <p className="text-4xl md:text-5xl font-bold text-accent font-body">{shichen.value}</p>
              <p className="text-xs text-muted-foreground font-headline">{shichen.name}時</p>
            </div>
          </div>
          <div className="text-center pt-4">
            <p className="text-xs text-muted-foreground italic font-body">
              Note: Lunar calendar conversion is a simplified mock for demonstration purposes.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-lg">
        <Card className="shadow-lg text-center">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-primary">First Oracle (Single Palace)</CardTitle>
            <CardDescription className="font-body text-sm">(月 + 日 + 时辰 - 2) mod 6</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl md:text-5xl font-bold text-primary font-headline py-4">{firstOracleResult}</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg text-center">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-primary">Second Oracle (for Double Palace)</CardTitle>
            <CardDescription className="font-body text-sm">(First Oracle Value + 日 + 时辰 - 2) mod 6</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl md:text-5xl font-bold text-primary font-headline py-4">{secondOracleResult}</p>
          </CardContent>
        </Card>
      </div>

      {firstOracleInterpretation && (
        <Card className="w-full max-w-lg shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-primary">Single Palace Interpretation (单宫解说)</CardTitle>
            <CardDescription className="font-headline">{firstOracleInterpretation.title}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-semibold text-md text-secondary-foreground font-body">Meaning:</h4>
              <p className="text-sm font-body whitespace-pre-line">{firstOracleInterpretation.meaning}</p>
            </div>
            {firstOracleInterpretation.advice && (
              <div>
                <h4 className="font-semibold text-md text-secondary-foreground font-body">Advice (斷曰):</h4>
                <p className="text-sm font-body whitespace-pre-line">{firstOracleInterpretation.advice}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {doubleOracleInterpretation && (
        <Card className="w-full max-w-lg shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-primary">Double Palace Interpretation (双宫解说)</CardTitle>
            <CardDescription className="font-headline">{doubleOracleInterpretation.title}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-semibold text-md text-secondary-foreground font-body">Poem (詩曰):</h4>
              <p className="text-sm font-body whitespace-pre-line">{doubleOracleInterpretation.poem}</p>
            </div>
            <div>
              <h4 className="font-semibold text-md text-secondary-foreground font-body">Explanation (解):</h4>
              <p className="text-sm font-body whitespace-pre-line">{doubleOracleInterpretation.explanation}</p>
            </div>
          </CardContent>
        </Card>
      )}
       
       {(!firstOracleInterpretation || !doubleOracleInterpretation) && firstOracleResult && secondOracleResult && (
         <Card className="w-full max-w-lg shadow-xl">
           <CardHeader>
             <CardTitle className="font-headline text-xl text-muted-foreground">Interpretations Pending</CardTitle>
           </CardHeader>
           <CardContent>
             <p className="text-sm font-body">
               {!firstOracleInterpretation && `Interpretation for ${firstOracleResult} (single) is not yet defined.`}
               {(!firstOracleInterpretation && !doubleOracleInterpretation) && <br/>}
               {!doubleOracleInterpretation && `Interpretation for ${firstOracleResult} combined with ${secondOracleResult} (double) is not yet defined.`}
               <br />
               Please add them to <code>src/lib/interpretations.ts</code> to see the detailed explanations.
             </p>
           </CardContent>
         </Card>
       )}

    </div>
  );
}
