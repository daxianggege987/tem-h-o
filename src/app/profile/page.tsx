
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserCircle2, Star, Gift, ShoppingBag, CalendarDays, CreditCard, ArrowLeft, LogOut, LogIn, Home, HelpCircle } from "lucide-react"; 
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const INITIAL_FREE_CREDITS = 10;
const FREE_CREDIT_VALIDITY_HOURS = 72;

// Mocked paid credits, would come from backend
const userPaidCreditsData = {
  paidCredits: 0, 
};

export default function ProfilePage() {
  const { user, signOut, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [isVip, setIsVip] = useState<boolean>(false); 
  const [vipExpirationDate, setVipExpirationDate] = useState<string | null>(null);
  
  const [freeCreditsDisplay, setFreeCreditsDisplay] = useState<string | number>(INITIAL_FREE_CREDITS);
  const [freeCreditsTooltip, setFreeCreditsTooltip] = useState<string>("新用户专享，注册后72小时内有效");

  useEffect(() => {
    if (user) {
      // Mock VIP status (would come from backend)
      const today = new Date();
      const expiration = new Date(new Date(today).setDate(today.getDate() + 30)); 
      setIsVip(true); 
      setVipExpirationDate(expiration.toLocaleDateString('zh-CN'));

      // Calculate free credits status
      if (user.metadata?.creationTime) {
        const registrationTime = new Date(user.metadata.creationTime).getTime();
        const now = Date.now();
        const validityPeriodMs = FREE_CREDIT_VALIDITY_HOURS * 60 * 60 * 1000;

        if (now < registrationTime + validityPeriodMs) {
          setFreeCreditsDisplay(INITIAL_FREE_CREDITS); // Show initial count if within validity
          setFreeCreditsTooltip(`新用户专享，注册后${FREE_CREDIT_VALIDITY_HOURS}小时内有效`);
        } else {
          setFreeCreditsDisplay("您已用完或已超出有效期");
          setFreeCreditsTooltip(`免费次数已过期 (注册后${FREE_CREDIT_VALIDITY_HOURS}小时内有效)`);
        }
      } else {
        // Fallback if creationTime is somehow not available for a logged-in user
        setFreeCreditsDisplay(INITIAL_FREE_CREDITS);
        setFreeCreditsTooltip(`新用户专享，注册后${FREE_CREDIT_VALIDITY_HOURS}小时内有效`);
      }

    } else {
      setIsVip(false);
      setVipExpirationDate(null);
      setFreeCreditsDisplay(INITIAL_FREE_CREDITS); // Reset for logged-out state view (though usually redirected)
      setFreeCreditsTooltip("新用户专享");
    }
  }, [user]);

  if (authLoading) {
    return (
      <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
        <p>加载个人资料...</p>
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
          {isVip && (
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
                {typeof freeCreditsDisplay === 'number' ? `${freeCreditsDisplay} 次` : freeCreditsDisplay}
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
              <span className="ml-auto font-semibold text-lg">{userPaidCreditsData.paidCredits} 次</span>
            </div>
            {isVip && vipExpirationDate && (
               <div className="flex items-center text-lg">
                  <CalendarDays className="mr-3 h-6 w-6 text-accent" />
                  <span>会员到期时间:</span>
                  <span className="ml-auto font-semibold text-md">{vipExpirationDate}</span>
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

    