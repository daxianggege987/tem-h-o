"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2, Star, CheckCircle } from "lucide-react";
import type { OracleResultName, SingleInterpretationContent, DoubleInterpretationContent, LunarDate, Shichen } from "@/lib/types";
import { getLocaleStrings, type LocaleStrings } from "@/lib/locales";
import { getSinglePalaceInterpretation } from "@/lib/interpretations";

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

export default function ReadingCnPage() {
  const [oracleData, setOracleData] = useState<OracleData | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const router = useRouter();

  const currentLang = "zh-CN";
  const uiStrings: LocaleStrings = getLocaleStrings(currentLang);

  useEffect(() => {
    // This effect runs once on mount to verify the session.
    let isSessionValid = false;
    let sessionData: OracleData | null = null;

    // 1. Check for an existing, valid session
    const existingSessionRaw = localStorage.getItem('oracleUnlockData');
    if (existingSessionRaw) {
      try {
        const existingSession = JSON.parse(existingSessionRaw);
        const isExpired = Date.now() - existingSession.unlockedAt > 60 * 60 * 1000; // 60 minutes
        if (!isExpired && existingSession.oracleData) {
          sessionData = existingSession.oracleData;
          isSessionValid = true;
        } else {
          localStorage.removeItem('oracleUnlockData'); // Clean up expired session
        }
      } catch (e) {
        console.error("Error parsing existing session data:", e);
        localStorage.removeItem('oracleUnlockData');
      }
    }

    // 2. If no valid session, check for post-payment data to create a new session
    if (!isSessionValid) {
      const postPaymentDataRaw = localStorage.getItem('oracleDataForUnlock');
      if (postPaymentDataRaw) {
        try {
          const postPaymentData = JSON.parse(postPaymentDataRaw);
          const newSession = {
            unlockedAt: Date.now(),
            oracleData: postPaymentData,
          };
          localStorage.setItem('oracleUnlockData', JSON.stringify(newSession));
          localStorage.removeItem('oracleDataForUnlock'); // Clean up temporary data
          sessionData = postPaymentData;
          isSessionValid = true;
        } catch (e) {
          console.error("Error parsing post-payment data:", e);
          localStorage.removeItem('oracleDataForUnlock');
        }
      }
    }

    if (isSessionValid && sessionData) {
      setOracleData(sessionData);
      setIsVerifying(false);
    } else {
      router.push('/cn');
    }
  }, [router]);

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

  const getResultTitle = (oracleName: OracleResultName) => {
    const zhContent = getSinglePalaceInterpretation(oracleName, 'zh-CN');
    return <p className="text-4xl md:text-5xl font-bold text-primary font-headline pt-4 pb-2 leading-tight">{zhContent?.title}</p>;
  };

  if (isVerifying) {
    return (
      <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4">正在验证您的访问权限...</p>
      </main>
    );
  }

  if (!oracleData) {
     // This case should ideally not be reached due to the redirect, but it's a good fallback.
     return (
      <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl bg-destructive/10 border-destructive">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-destructive-foreground">{uiStrings.calculationErrorTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive-foreground">无法加载您的解读。</p>
            <Button onClick={() => router.push('/cn')} className="mt-4 w-full">返回首页</Button>
          </CardContent>
        </Card>
      </main>
    );
  }
  
  const { firstOracleResult, secondOracleResult, firstOracleInterpretationZh, doubleOracleInterpretationZh } = oracleData;

  return (
    <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center pt-10 pb-20 px-4 space-y-8">
      <header className="text-center mb-4">
        <h1 className="text-4xl sm:text-5xl font-headline font-bold text-primary">
          您的完整解读
        </h1>
        <p className="text-md text-muted-foreground mt-2">
          会话已解锁，以下是您的测算结果。
        </p>
      </header>

      <div className="w-full max-w-lg space-y-8">
        <div className="grid md:grid-cols-2 gap-8 w-full">
            <Card className="shadow-lg text-center">
            <CardHeader><CardTitle className="font-headline text-xl text-primary">{uiStrings.firstOracleTitle}</CardTitle></CardHeader>
            <CardContent className="pb-4">
                {getResultTitle(firstOracleResult)}
                {renderStars(firstOracleResult)}
            </CardContent>
            </Card>
            <Card className="shadow-lg text-center">
            <CardHeader><CardTitle className="font-headline text-xl text-primary">{uiStrings.secondOracleTitle}</CardTitle></CardHeader>
            <CardContent className="pb-4">
                {getResultTitle(secondOracleResult)}
                {renderStars(secondOracleResult)}
            </CardContent>
            </Card>
        </div>

        {firstOracleInterpretationZh && (
            <Card className="w-full shadow-xl">
            <CardHeader>
                <CardTitle className="font-headline text-xl text-primary">{uiStrings.singlePalaceInterpretationTitle}</CardTitle>
                <CardDescription className="font-headline flex items-baseline">
                  <span>{firstOracleInterpretationZh.title}</span>
                  {firstOracleInterpretationZh.pinyin && <span className="ml-2 text-muted-foreground text-sm">({firstOracleInterpretationZh.pinyin})</span>}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <div>
                <h4 className="font-semibold text-md text-secondary-foreground font-body">{uiStrings.meaningLabel}</h4>
                <p className="text-sm font-body whitespace-pre-line">{firstOracleInterpretationZh.meaning}</p>
                </div>
                {firstOracleInterpretationZh.advice && (
                <div className="mt-2"><h4 className="font-semibold text-md text-secondary-foreground font-body">{uiStrings.adviceLabel}</h4><p className="text-sm font-body whitespace-pre-line">{firstOracleInterpretationZh.advice}</p></div>
                )}
            </CardContent>
            </Card>
        )}

        {doubleOracleInterpretationZh && (
            <Card className="w-full shadow-xl">
            <CardHeader>
                <CardTitle className="font-headline text-xl text-primary">{uiStrings.doublePalaceInterpretationTitle}</CardTitle>
                <CardDescription className="font-headline">
                  <span>{doubleOracleInterpretationZh.title}</span>
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <div><h4 className="font-semibold text-md text-secondary-foreground font-body">{uiStrings.poemLabel}</h4><p className="text-sm font-body whitespace-pre-line">{doubleOracleInterpretationZh.poem}</p></div>
                <div className="mt-2"><h4 className="font-semibold text-md text-secondary-foreground font-body">{uiStrings.explanationLabel}</h4><p className="text-sm font-body whitespace-pre-line">{doubleOracleInterpretationZh.explanation}</p></div>
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
            <Link href={"/cn/pricing"}>
              <Button className="w-full text-lg" size="lg">
                {uiStrings.vipRecommendButton}
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
