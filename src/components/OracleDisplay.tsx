
"use client";

import { useEffect, useState, useCallback }
from "react";
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { gregorianToLunar } from "@/lib/calendar-utils";
import { getShichen } from "@/lib/calendar-utils";
import { ORACLE_RESULTS_MAP } from "@/lib/oracle-utils";
import { getSinglePalaceInterpretation, getDoublePalaceInterpretation } from "@/lib/interpretations";
import type { LunarDate, Shichen, OracleResultName, SingleInterpretationContent, DoubleInterpretationContent } from "@/lib/types";
import type { LocaleStrings } from "@/lib/locales";
import { Loader2, Star, EyeOff, Lock, RefreshCw } from "lucide-react"; // Added RefreshCw
import { useAuth, type UserEntitlements } from "@/context/AuthContext";
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

interface CalculatedAccessStatus {
  canView: boolean;
  reason: 'login_required' | 'no_credits_or_vip' | 'loading_entitlements' | 'auth_loading' | null;
}

export default function OracleDisplay({ currentLang, uiStrings }: OracleDisplayProps) {
  const [oracleData, setOracleData] = useState<OracleData | null>(null);
  const [isLoadingOracle, setIsLoadingOracle] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user, loading: authLoading, entitlements, consumeOracleUse, fetchUserEntitlements } = useAuth();
  const [accessStatus, setAccessStatus] = useState<CalculatedAccessStatus>({
    canView: false,
    reason: 'auth_loading',
  });
  const [consumptionAttempted, setConsumptionAttempted] = useState(false);

  const determineAccess = useCallback((currentUser: typeof user, currentEntitlements: UserEntitlements) => {
    if (authLoading) {
      return { canView: false, reason: 'auth_loading' } as CalculatedAccessStatus;
    }
    if (!currentUser) {
      return { canView: false, reason: 'login_required' } as CalculatedAccessStatus;
    }
    if (currentEntitlements.isLoading) {
      return { canView: false, reason: 'loading_entitlements' } as CalculatedAccessStatus;
    }
    if (currentEntitlements.error) {
       // Allow viewing even if entitlements errored, but might show stale data
       // Or, decide to block view: return { canView: false, reason: 'no_credits_or_vip' };
       // For now, let's be optimistic and allow view, with a note that data might be stale.
    }

    // Access Rules Priority: VIP > Valid Free Credits > Paid Credits
    if (currentEntitlements.isVip && currentEntitlements.vipExpiresAt && Date.now() < currentEntitlements.vipExpiresAt) {
      return { canView: true, reason: null } as CalculatedAccessStatus;
    }
    if (currentEntitlements.freeCreditsRemaining > 0 && currentEntitlements.freeCreditsExpireAt && Date.now() < currentEntitlements.freeCreditsExpireAt) {
      return { canView: true, reason: null } as CalculatedAccessStatus;
    }
    if (currentEntitlements.paidCreditsRemaining > 0) {
      return { canView: true, reason: null } as CalculatedAccessStatus;
    }
    
    return { canView: false, reason: 'no_credits_or_vip' } as CalculatedAccessStatus;
  }, [authLoading]);

  useEffect(() => {
    setIsLoadingOracle(true); 
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
        firstOracleInterpretationLang: getSinglePalaceInterpretation(firstOracleName, currentLang),
        doubleOracleInterpretationZh: getDoublePalaceInterpretation(firstOracleName, secondOracleName, 'zh-CN'),
        doubleOracleInterpretationLang: getDoublePalaceInterpretation(firstOracleName, secondOracleName, currentLang),
      });
    } catch (e: any) {
      setError(e.message || uiStrings.calculationErrorText);
    } finally {
      setIsLoadingOracle(false);
    }
  }, [currentLang, uiStrings]);

  useEffect(() => {
    const newAccessStatus = determineAccess(user, entitlements);
    setAccessStatus(newAccessStatus);

    // If access is granted and oracle data is ready, and consumption hasn't been attempted for this view
    if (newAccessStatus.canView && oracleData && !consumptionAttempted && !entitlements.isLoading) {
      consumeOracleUse().then(() => {
        // After (mock) consumption, entitlements are refetched by AuthContext.
        // The determineAccess will run again with new entitlements.
      });
      setConsumptionAttempted(true); // Mark consumption as attempted for this "session" of viewing
    }
    
    // Reset consumption attempt if user logs out or entitlements become loading (e.g. user change)
    if (!user || entitlements.isLoading) {
        setConsumptionAttempted(false);
    }

  }, [user, entitlements, determineAccess, oracleData, consumptionAttempted, consumeOracleUse]);


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

  if (isLoadingOracle || (authLoading && !user) || (user && entitlements.isLoading && accessStatus.reason === 'loading_entitlements') || !uiStrings || !oracleData) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg font-headline">{uiStrings?.calculatingDestiny || "Calculating..."}</p>
         {entitlements.isLoading && <p className="text-sm text-muted-foreground mt-2">正在检查您的访问权限...</p>}
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
  
  const { currentDateTime, lunarDate, shichen, firstOracleResult, secondOracleResult, firstOracleInterpretationZh, firstOracleInterpretationLang, doubleOracleInterpretationZh, doubleOracleInterpretationLang } = oracleData;
  const formatDate = (date: Date, lang: string) => date.toLocaleDateString(lang.startsWith('zh') ? 'zh-Hans-CN' : lang.startsWith('ja') ? 'ja-JP' : lang, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formatTime = (date: Date, lang: string) => date.toLocaleTimeString(lang.startsWith('zh') ? 'zh-Hans-CN' : lang.startsWith('ja') ? 'ja-JP' : lang);
  
  const showBlurOverlay = !accessStatus.canView && accessStatus.reason !== 'loading_entitlements' && accessStatus.reason !== 'auth_loading';
  
  let ctaTitle = "";
  let ctaDescription = "";
  let ctaButtonText = "";
  let ctaButtonLink = "";
  let CtaIcon = Lock;

  if (accessStatus.reason === 'login_required') {
    ctaTitle = "请登录以查看完整神谕解析";
    ctaButtonText = "登录查看";
    ctaButtonLink = "/login";
    CtaIcon = Lock;
  } else if (accessStatus.reason === 'no_credits_or_vip') {
    ctaTitle = "内容受限";
    ctaDescription = "您的免费次数已用尽或会员已到期。请充值或购买会员以解锁更多解析。";
    ctaButtonText = "前往充值/购买";
    ctaButtonLink = "/pricing-cn";
    CtaIcon = EyeOff;
  }

  const ctaContent = (
    <>
      <CtaIcon className="h-12 w-12 text-primary mb-4" />
      <p className="text-lg font-semibold mb-2 text-foreground">{ctaTitle}</p>
      {ctaDescription && <p className="text-sm text-muted-foreground mb-4 text-center max-w-xs">{ctaDescription}</p>}
      <Link href={ctaButtonLink}><Button size="lg">{ctaButtonText}</Button></Link>
      <p className="text-xs text-muted-foreground mt-4">(测算结果已生成，解锁后即可查看)</p>
      {entitlements.error && <p className="text-xs text-destructive mt-2">{entitlements.error}</p>}
    </>
  );

  return (
    <div className="flex flex-col items-center space-y-8 w-full px-2 pb-12">
      {entitlements.isLoading && accessStatus.canView && (
        <div className="fixed top-4 right-4 z-50 p-2 bg-background/80 rounded-md shadow-lg">
            <RefreshCw className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}
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

      <div className="w-full max-w-lg relative">
        <div className={cn("space-y-8", showBlurOverlay && "filter blur-sm pointer-events-none")}>
          <div className="grid md:grid-cols-2 gap-8 w-full">
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
            <Card className="w-full shadow-xl">
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
            <Card className="w-full shadow-xl">
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

          <Card className="w-full shadow-xl bg-accent/10 border-accent">
            <CardHeader><CardTitle className="font-headline text-lg text-primary">温馨提示</CardTitle></CardHeader>
            <CardContent><p className="text-sm font-body text-foreground/90 whitespace-pre-line">如果测算结果不如意，需要破解方法，请关注公众号： 改过的锤子<br />关注以后，发送消息 999</p></CardContent>
          </Card>
           
           {(!firstOracleInterpretationLang || !doubleOracleInterpretationLang) && firstOracleResult && secondOracleResult && (
             <Card className="w-full shadow-xl">
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
        </div>

        {showBlurOverlay && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-start pt-8 sm:pt-12 p-4 bg-card/90 backdrop-blur-sm rounded-lg shadow-xl border border-border text-center">
            <div className="w-full max-w-md">{ctaContent}</div>
          </div>
        )}
      </div>
    </div>
  );
}

    