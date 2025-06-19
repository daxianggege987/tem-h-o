
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserCircle2, Star, Gift, ShoppingBag, CalendarDays, CreditCard, ArrowLeft, LogOut, LogIn, Home, HelpCircle, Loader2, RefreshCw } from "lucide-react"; 
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const FREE_CREDIT_VALIDITY_HOURS_PROFILE = 72;

export default function ProfilePage() {
  const { user, signOut, loading: authLoading, entitlements, fetchUserEntitlements } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!authLoading && !user && !entitlements.isLoading) { // If auth is done, no user, and entitlements not loading
      // No need to fetch entitlements if there's no user, redirect handled by effect below
    } else if (user && (entitlements.isLoading || entitlements.error)) {
      // If user exists but entitlements are loading or errored, try fetching.
      // This also handles initial load if onAuthStateChanged was faster than initial entitlements fetch.
      // fetchUserEntitlements(); // fetchUserEntitlements is now called by AuthContext on user change
    }
  }, [user, authLoading, entitlements.isLoading, entitlements.error, fetchUserEntitlements]);


  if (authLoading || (user && entitlements.isLoading && entitlements.freeCreditsExpireAt === null)) { // Show loader if auth loading OR user exists but entitlements are truly initial-loading
    return (
      <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        加载个人资料...
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl text-center">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary">访问个人中心</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>请先登录以查看您的个人资料。</p>
            <Link href="/login">
              <Button className="w-full">
                <LogIn className="mr-2 h-5 w-5" />
                前往登录
              </Button>
            </Link>
            <Link href="/oracle" className="block mt-2">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-5 w-5" />
                返回测算页
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  const pageDisplayName = user.displayName || user.phoneNumber || "神谕用户";
  const photoURL = user.photoURL; 

  const getAvatarFallbackContent = () => {
    if (user.phoneNumber && user.phoneNumber.length >= 4) {
      return user.phoneNumber.slice(-4);
    } else if (user.displayName) {
      return user.displayName.substring(0, 2).toUpperCase();
    }
    return <UserCircle2 className="h-12 w-12 text-muted-foreground" />;
  };

  const freeCreditsDisplay = entitlements.freeCreditsRemaining > 0 && entitlements.freeCreditsExpireAt && Date.now() < entitlements.freeCreditsExpireAt
    ? `${entitlements.freeCreditsRemaining} 次`
    : "您已用完或已超出有效期";
  
  const freeCreditsTooltip = entitlements.freeCreditsExpireAt && Date.now() >= entitlements.freeCreditsExpireAt
    ? `免费次数已过期 (注册后${FREE_CREDIT_VALIDITY_HOURS_PROFILE}小时内有效)`
    : `新用户专享，注册后${FREE_CREDIT_VALIDITY_HOURS_PROFILE}小时内有效`;

  return (
    <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-primary/80 via-primary/50 to-accent/50 opacity-50 z-0"></div>
        <Link href="/oracle" className="absolute left-4 top-4 text-primary-foreground hover:text-primary-foreground/80 transition-colors z-10" aria-label="返回测算页">
            <ArrowLeft className="h-6 w-6" />
        </Link>
        {entitlements.isLoading && (
            <RefreshCw className="absolute right-4 top-4 text-primary-foreground h-5 w-5 animate-spin z-10" />
        )}
        <CardHeader className="text-center pt-12 sm:pt-10 relative z-10">
          <div className="flex justify-center mb-4">
            <Avatar className="h-24 w-24 border-4 border-background bg-background shadow-lg">
              {photoURL && (
                <AvatarImage src={photoURL} alt={pageDisplayName} data-ai-hint="profile avatar" />
              )}
              <AvatarFallback className="text-2xl font-semibold bg-muted">
                {getAvatarFallbackContent()}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-3xl font-headline text-primary">{pageDisplayName}</CardTitle>
          {entitlements.isVip && (
            <div className="mt-2">
              <Badge variant="default" className="text-sm bg-primary hover:bg-primary/90 shadow">
                <Star className="mr-1.5 h-4 w-4 text-yellow-300" fill="currentColor"/> 尊贵会员
              </Badge>
            </div>
          )}
           <CardDescription className="text-sm text-muted-foreground pt-1">
             {user.email || user.phoneNumber || "暂无联系信息"}
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-4 pb-6 px-6 relative z-10">
          
          <div className="p-4 bg-card rounded-lg shadow-inner space-y-3">
             {entitlements.error && (
                <p className="text-sm text-destructive text-center">{entitlements.error}</p>
             )}
            <div className="flex items-center text-lg">
              <Gift className="mr-3 h-6 w-6 text-accent" />
              <span>剩余免费次数:</span>
              <span className="ml-auto font-semibold text-lg flex items-center">
                {entitlements.isLoading && freeCreditsDisplay === "您已用完或已超出有效期" ? <Loader2 className="h-4 w-4 animate-spin" /> : freeCreditsDisplay}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="ml-1.5 h-4 w-4 text-muted-foreground cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{freeCreditsTooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </span>
            </div>
            <div className="flex items-center text-lg">
              <ShoppingBag className="mr-3 h-6 w-6 text-accent" />
              <span>剩余付费次数:</span>
              <span className="ml-auto font-semibold text-lg">
                {entitlements.isLoading && entitlements.paidCreditsRemaining === 0 ? <Loader2 className="h-4 w-4 animate-spin" /> : `${entitlements.paidCreditsRemaining} 次`}
              </span>
            </div>
            {entitlements.isVip && entitlements.vipExpiresAt && (
               <div className="flex items-center text-lg">
                  <CalendarDays className="mr-3 h-6 w-6 text-accent" />
                  <span>会员到期时间:</span>
                  <span className="ml-auto font-semibold text-md">
                    {entitlements.isLoading && !entitlements.vipExpiresAt ? <Loader2 className="h-4 w-4 animate-spin" /> : new Date(entitlements.vipExpiresAt).toLocaleDateString('zh-CN')}
                  </span>
              </div>
            )}
          </div>
          
          <div className="pt-2 space-y-3">
            <Link href="/pricing-cn">
              <Button className="w-full text-lg py-6" size="lg">
                  <CreditCard className="mr-2.5 h-5 w-5" />
                  充值续费 / 购买次数
              </Button>
            </Link>
            <div className="grid grid-cols-2 gap-3">
                 <Link href="/oracle" className="w-full">
                    <Button variant="outline" className="w-full text-md py-5">
                        <Home className="mr-2 h-5 w-5" />
                        返回主页
                    </Button>
                 </Link>
                <Button variant="outline" className="w-full text-md py-5">
                    <HelpCircle className="mr-2 h-5 w-5" />
                    帮助与反馈
                </Button>
            </div>
            <Button onClick={signOut} variant="destructive" className="w-full text-lg py-6 mt-2" size="lg" disabled={authLoading}>
              {authLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogOut className="mr-2.5 h-5 w-5" />}
              退出登录
            </Button>
          </div>
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground mt-6 text-center">
        遇到问题？请联系客服 (模拟) <br/>
        服务版本 v1.0.1
      </p>
    </main>
  );
}

    