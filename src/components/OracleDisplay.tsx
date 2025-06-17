
"use client";

import { useEffect, useState } from "react";
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { gregorianToLunar } from "@/lib/calendar-utils";
import { getShichen } from "@/lib/calendar-utils";
import { ORACLE_RESULTS_MAP } from "@/lib/oracle-utils";
import { getSinglePalaceInterpretation, getDoublePalaceInterpretation } from "@/lib/interpretations";
import type { LunarDate, Shichen, OracleResultName, SingleInterpretationContent, DoubleInterpretationContent } from "@/lib/types";
import type { LocaleStrings } from "@/lib/locales";
import { Loader2, Star, EyeOff, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

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

// Mock data structure for user credits - in a real app, this would come from a backend/context
interface UserCredits {
  freeCredits: number;
  paidCredits: number;
}

export default function OracleDisplay({ currentLang, uiStrings }: OracleDisplayProps) {
  const [oracleData, setOracleData] = useState<OracleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user, loading: authLoading } = useAuth();

  // Mock state for credits and VIP status. In a real app, fetch this from a backend.
  const [userCredits, setUserCredits] = useState<UserCredits>({ freeCredits: 3, paidCredits: 0 });
  const [isVip, setIsVip] = useState<boolean>(false);
  const [vipExpirationDate, setVipExpirationDate] = useState<Date | null>(null);
  
  const [showBlurOverlay, setShowBlurOverlay] = useState<boolean>(false);

  useEffect(() => {
    // Initialize Oracle Data
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

  useEffect(() => {
    // Determine if content should be blurred based on auth, credits, VIP status
    if (authLoading) return; // Wait for auth state to be clear

    let currentCredits = { freeCredits: 3, paidCredits: 0 }; // Default initial credits
    let currentIsVip = false;
    let currentVipExpiration: Date | null = null;

    if (user) {
      // Simulate VIP status and credits for the test user for easier testing
      if (user.phoneNumber === "+8613181914554" || (user.uid && user.uid.startsWith("mock-uid-13181914554")) ) {
        currentIsVip = true;
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30); // VIP for 30 days
        currentVipExpiration = futureDate;
        currentCredits = { freeCredits: 5, paidCredits: 10 }; // Give some credits
      } else {
        // For other logged-in users, use default mock values or fetch from backend in a real app
        // For now, they also get default initial credits. No VIP unless specifically set.
        // currentCredits = { freeCredits: 3, paidCredits: 0 }; 
        // currentIsVip = false;
        // currentVipExpiration = null;
      }
    }
    // Update state for credits and VIP
    setUserCredits(currentCredits);
    setIsVip(currentIsVip);
    setVipExpirationDate(currentVipExpiration);


    // Condition 1: Not logged in
    if (!user) {
      setShowBlurOverlay(true);
      return;
    }

    // Condition 2: Logged In AND (Has Free Credits OR Has Paid Credits OR Is VIP with valid subscription)
    const hasCredits = currentCredits.freeCredits > 0 || currentCredits.paidCredits > 0;
    const isVipActive = currentIsVip && (currentVipExpiration ? new Date(currentVipExpiration) > new Date() : true);

    if (hasCredits || isVipActive) {
      setShowBlurOverlay(false);
      return;
    }

    // Condition 3: Logged In AND ((No VIP OR VIP Expired) AND Free Credits == 0 AND Paid Credits == 0)
    setShowBlurOverlay(true);

  }, [user, authLoading]);


  const renderStars = (oracleName: OracleResultName) => {
    const starsConfig: { [key in OracleResultName]?: { count: number; colorClass: string } } = {
      "大安": { count: 3, colorClass: "text-destructive" },
      "速喜": { count: 2, colorClass: "text-destructive" },
      "小吉": { count: 1, colorClass: "text-destructive" },
      "留连": { count: 1, colorClass: "text-muted-foreground" },
      "赤口": { count: 2, colorClass: "text-muted-foreground" },
      "空亡": { count: 3, colorClass: "text-muted-foreground" },
    };
    const config = starsConfig[oracleName];
    if (!config) return null;
    const starElements = [];
    for (let i = 0; i < config.count; i++) {
      starElements.push(
        <Star 
          key={`${oracleName}-star-${i}`} 
          className={`h-5 w-5 ${config.colorClass}`} 
          fill="currentColor"
        />
      );
    }
    return <div className="flex justify-center mt-1 space-x-1">{starElements}</div>;
  };

  if (isLoading || authLoading || !uiStrings || !oracleData) {
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

  const ctaContent = !user ? (
    <>
      <Lock className="h-12 w-12 text-primary mb-4" />
      <p className="text-lg font-semibold mb-4 text-foreground">请登录以查看完整神谕解析</p>
      <Link href="/login">
        <Button size="lg">登录查看</Button>
      </Link>
    </>
  ) : (
    <>
      <EyeOff className="h-12 w-12 text-primary mb-4" />
      <p className="text-lg font-semibold mb-2 text-foreground">内容受限</p>
      <p className="text-sm text-muted-foreground mb-4 text-center max-w-xs">您的免费次数已用尽或会员已到期。请充值以解锁更多解析。</p>
      <Link href="/pricing-cn">
        <Button size="lg">前往充值</Button>
      </Link>
    </>
  );

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

      <div className={cn(
          "w-full max-w-lg space-y-8 relative",
          showBlurOverlay && "filter blur-sm pointer-events-none"
        )}
      >
        <div className="grid md:grid-cols-2 gap-8 w-full">
          <Card className="shadow-lg text-center">
            <CardHeader>
              <CardTitle className="font-headline text-xl text-primary">{uiStrings.firstOracleTitle}</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <p className="text-4xl md:text-5xl font-bold text-primary font-headline pt-4 pb-2">
                {firstOracleInterpretationLang?.title || firstOracleResult}
              </p>
              {renderStars(firstOracleResult)}
            </CardContent>
          </Card>

          <Card className="shadow-lg text-center">
            <CardHeader>
              <CardTitle className="font-headline text-xl text-primary">{uiStrings.secondOracleTitle}</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <p className="text-4xl md:text-5xl font-bold text-primary font-headline pt-4 pb-2">
                {doubleOracleInterpretationLang?.title?.split(currentLang === 'zh-CN' ? "配" : "with")[1]?.trim().split(currentLang === 'zh-CN' ? "宮" : "Palace")[0]?.trim() || 
                 secondOracleResult}
              </p>
              {renderStars(secondOracleResult)}
            </CardContent>
          </Card>
        </div>

        {firstOracleInterpretationZh && (
          <Card className="w-full shadow-xl">
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
          <Card className="w-full shadow-xl">
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

        <Card className="w-full shadow-xl bg-accent/10 border-accent">
          <CardHeader>
            <CardTitle className="font-headline text-lg text-primary">温馨提示</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-body text-foreground/90 whitespace-pre-line">
              如果测算结果不如意，需要破解方法，请关注公众号： 改过的锤子
              <br />
              关注以后，发送消息 999
            </p>
          </CardContent>
        </Card>
         
         {(!firstOracleInterpretationLang || !doubleOracleInterpretationLang) && firstOracleResult && secondOracleResult && (
           <Card className="w-full shadow-xl">
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
      {showBlurOverlay && (
        <div className="absolute inset-x-0 bottom-0 top-[calc(33%-2rem)] md:top-[calc(25%-2rem)] mx-auto max-w-lg z-20 flex flex-col items-center justify-center p-6 bg-card/90 backdrop-blur-sm rounded-lg shadow-2xl border border-border text-center">
          {ctaContent}
        </div>
      )}
    </div>
  );
}
