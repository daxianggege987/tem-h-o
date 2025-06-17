
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserCircle2, Star, Gift, ShoppingBag, CalendarDays, CreditCard, ArrowLeft, LogOut, LogIn, Home, HelpCircle, Loader2 } from "lucide-react"; 
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const INITIAL_FREE_CREDITS_AMOUNT = 10;
const FREE_CREDIT_VALIDITY_HOURS = 72;

interface ProfileData {
  freeCredits: number | string;
  paidCredits: number;
  isVip: boolean;
  vipExpirationDate: string | null;
  freeCreditsTooltip: string;
}

export default function ProfilePage() {
  const { user, signOut, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoadingProfileData, setIsLoadingProfileData] = useState(true);

  const fetchProfileData = useCallback(async (currentUser: typeof user) => {
    setIsLoadingProfileData(true);
    // Simulate API call to fetch user entitlements
    await new Promise(resolve => setTimeout(resolve, 500)); // Mock delay

    let fetchedData: Omit<ProfileData, 'freeCredits' | 'freeCreditsTooltip'> = {
      paidCredits: 0,
      isVip: false,
      vipExpirationDate: null,
    };

    if (currentUser) {
      // Test user specific mock entitlements
      if (currentUser.phoneNumber === "+8613181914554" || (currentUser.uid && currentUser.uid.startsWith("mock-uid-"))) {
        fetchedData = {
          paidCredits: 5, // Mock paid credits for test user
          isVip: true,    // Mock VIP status for test user
          vipExpirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('zh-CN'), // Mock VIP expiry
        };
      }

      // Calculate free credits status based on registration time
      let currentFreeCredits: number | string = INITIAL_FREE_CREDITS_AMOUNT;
      let currentFreeCreditsTooltip = `新用户专享，注册后${FREE_CREDIT_VALIDITY_HOURS}小时内有效`;

      if (currentUser.metadata?.creationTime) {
        const registrationTime = new Date(currentUser.metadata.creationTime).getTime();
        const now = Date.now();
        const validityPeriodMs = FREE_CREDIT_VALIDITY_HOURS * 60 * 60 * 1000;

        if (now >= registrationTime + validityPeriodMs) {
          currentFreeCredits = "您已用完或已超出有效期";
          currentFreeCreditsTooltip = `免费次数已过期 (注册后${FREE_CREDIT_VALIDITY_HOURS}小时内有效)`;
        }
      }
      
      setProfileData({
        ...fetchedData,
        freeCredits: currentFreeCredits,
        freeCreditsTooltip: currentFreeCreditsTooltip,
      });

    } else {
      setProfileData({
        freeCredits: INITIAL_FREE_CREDITS_AMOUNT,
        paidCredits: 0,
        isVip: false,
        vipExpirationDate: null,
        freeCreditsTooltip: "新用户专享",
      });
    }
    setIsLoadingProfileData(false);
  }, []);

  useEffect(() => {
    if (!authLoading) {
      fetchProfileData(user);
    }
  }, [user, authLoading, fetchProfileData]);

  if (authLoading || isLoadingProfileData && !profileData) {
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

  return (
    <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-primary/80 via-primary/50 to-accent/50 opacity-50 z-0"></div>
        <Link href="/oracle" className="absolute left-4 top-4 text-primary-foreground hover:text-primary-foreground/80 transition-colors z-10" aria-label="返回测算页">
            <ArrowLeft className="h-6 w-6" />
        </Link>
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
          {profileData?.isVip && (
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
            <div className="flex items-center text-lg">
              <Gift className="mr-3 h-6 w-6 text-accent" />
              <span>剩余免费次数:</span>
              <span className="ml-auto font-semibold text-lg flex items-center">
                {profileData ? (typeof profileData.freeCredits === 'number' ? `${profileData.freeCredits} 次` : profileData.freeCredits) : <Loader2 className="h-4 w-4 animate-spin" />}
                {profileData && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="ml-1.5 h-4 w-4 text-muted-foreground cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{profileData.freeCreditsTooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </span>
            </div>
            <div className="flex items-center text-lg">
              <ShoppingBag className="mr-3 h-6 w-6 text-accent" />
              <span>剩余付费次数:</span>
              <span className="ml-auto font-semibold text-lg">
                {profileData ? `${profileData.paidCredits} 次` : <Loader2 className="h-4 w-4 animate-spin" />}
              </span>
            </div>
            {profileData?.isVip && profileData.vipExpirationDate && (
               <div className="flex items-center text-lg">
                  <CalendarDays className="mr-3 h-6 w-6 text-accent" />
                  <span>会员到期时间:</span>
                  <span className="ml-auto font-semibold text-md">{profileData.vipExpirationDate}</span>
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
            <Button onClick={signOut} variant="destructive" className="w-full text-lg py-6 mt-2" size="lg">
              <LogOut className="mr-2.5 h-5 w-5" />
              退出登录
            </Button>
          </div>
          
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground mt-6 text-center">
        遇到问题？请联系客服 (模拟) <br/>
        服务版本 v1.0.0
      </p>
    </main>
  );
}
    

    