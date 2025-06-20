
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
    if (!authLoading && !user && !entitlements.isLoading) { 
      // No user, no need to fetch entitlements, handled by effect below
    } else if (user && (entitlements.isLoading || entitlements.error || entitlements.freeCreditsExpireAt === null)) { // Also check if entitlements are not fully loaded
      // Fetch entitlements if user exists and entitlements are loading/errored/not yet set
      // fetchUserEntitlements(); // Now called by AuthContext on user change
    }
  }, [user, authLoading, entitlements.isLoading, entitlements.error, entitlements.freeCreditsExpireAt, fetchUserEntitlements]);


  if (authLoading || (user && entitlements.isLoading && entitlements.freeCreditsExpireAt === null && !entitlements.error)) { 
    return (
      <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        Loading profile...
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl text-center">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary">Access Your Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Please sign in to view your profile.</p>
            <Link href="/login">
              <Button className="w-full">
                <LogIn className="mr-2 h-5 w-5" />
                Go to Sign In
              </Button>
            </Link>
            <Link href="/oracle" className="block mt-2">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Oracle
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  const pageDisplayName = user.displayName || user.email || "Valued User";
  
  const getAvatarFallbackContent = () => {
    // user is guaranteed to be non-null here
    if (user.displayName) {
      return user.displayName.substring(0, 2).toUpperCase();
    } else if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return <UserCircle2 className="h-12 w-12 text-muted-foreground" />;
  };

  const freeCreditsDisplay = entitlements.freeCreditsRemaining > 0 && entitlements.freeCreditsExpireAt && Date.now() < entitlements.freeCreditsExpireAt
    ? `${entitlements.freeCreditsRemaining} credits`
    : "Used or expired";
  
  const freeCreditsTooltip = entitlements.freeCreditsExpireAt && Date.now() >= entitlements.freeCreditsExpireAt
    ? `Free credits expired (valid for ${FREE_CREDIT_VALIDITY_HOURS_PROFILE} hours after sign-up)`
    : `New user bonus, valid for ${FREE_CREDIT_VALIDITY_HOURS_PROFILE} hours after sign-up.`;

  return (
    <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-primary/80 via-primary/50 to-accent/50 opacity-50 z-0"></div>
        <Link href="/oracle" className="absolute left-4 top-4 text-primary-foreground hover:text-primary-foreground/80 transition-colors z-10" aria-label="Back to Oracle">
            <ArrowLeft className="h-6 w-6" />
        </Link>
        {entitlements.isLoading && (
            <RefreshCw className="absolute right-4 top-4 text-primary-foreground h-5 w-5 animate-spin z-10" />
        )}
        <CardHeader className="text-center pt-12 sm:pt-10 relative z-10">
          <div className="flex justify-center mb-4">
            <Avatar className="h-24 w-24 border-4 border-background bg-background shadow-lg">
              <AvatarImage src={user.photoURL || undefined} alt={pageDisplayName} data-ai-hint="profile avatar" />
              <AvatarFallback className="text-2xl font-semibold bg-muted">
                {getAvatarFallbackContent()}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-3xl font-headline text-primary">{pageDisplayName}</CardTitle>
          {entitlements.isVip && (
            <div className="mt-2">
              <Badge variant="default" className="text-sm bg-primary hover:bg-primary/90 shadow">
                <Star className="mr-1.5 h-4 w-4 text-yellow-300" fill="currentColor"/> VIP Member
              </Badge>
            </div>
          )}
           <CardDescription className="text-sm text-muted-foreground pt-1">
             {user.email || "No contact email provided"}
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-4 pb-6 px-6 relative z-10">
          
          <div className="p-4 bg-card rounded-lg shadow-inner space-y-3">
             {entitlements.error && (
                <p className="text-sm text-destructive text-center">{entitlements.error}</p>
             )}
            <div className="flex items-center text-lg">
              <Gift className="mr-3 h-6 w-6 text-accent" />
              <span>Free Credits:</span>
              <span className="ml-auto font-semibold text-lg flex items-center">
                {entitlements.isLoading && freeCreditsDisplay === "Used or expired" ? <Loader2 className="h-4 w-4 animate-spin" /> : freeCreditsDisplay}
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
              <span>Paid Credits:</span>
              <span className="ml-auto font-semibold text-lg">
                {entitlements.isLoading && entitlements.paidCreditsRemaining === 0 ? <Loader2 className="h-4 w-4 animate-spin" /> : `${entitlements.paidCreditsRemaining} credits`}
              </span>
            </div>
            {entitlements.isVip && entitlements.vipExpiresAt && (
               <div className="flex items-center text-lg">
                  <CalendarDays className="mr-3 h-6 w-6 text-accent" />
                  <span>VIP Expires:</span>
                  <span className="ml-auto font-semibold text-md">
                    {entitlements.isLoading && !entitlements.vipExpiresAt ? <Loader2 className="h-4 w-4 animate-spin" /> : new Date(entitlements.vipExpiresAt).toLocaleDateString()}
                  </span>
              </div>
            )}
          </div>
          
          <div className="pt-2 space-y-3">
            <Link href="/pricing">
              <Button className="w-full text-lg py-6" size="lg">
                  <CreditCard className="mr-2.5 h-5 w-5" />
                  Get Credits / Subscription
              </Button>
            </Link>
             {/* Link to Chinese pricing page, can be conditional based on lang if needed */}
            <Link href="/pricing-cn">
              <Button variant="outline" className="w-full text-md py-5">
                  充值 (CN Pricing)
              </Button>
            </Link>
            <div className="grid grid-cols-2 gap-3">
                 <Link href="/oracle" className="w-full">
                    <Button variant="outline" className="w-full text-md py-5">
                        <Home className="mr-2 h-5 w-5" />
                        Back to Oracle
                    </Button>
                 </Link>
                <Button variant="outline" className="w-full text-md py-5">
                    <HelpCircle className="mr-2 h-5 w-5" />
                    Help & Feedback
                </Button>
            </div>
            <Button onClick={signOut} variant="destructive" className="w-full text-lg py-6 mt-2" size="lg" disabled={authLoading}>
              {authLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogOut className="mr-2.5 h-5 w-5" />}
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground mt-6 text-center">
        Having trouble? Contact support (mock). <br/>
        Service version v1.0.2
      </p>
    </main>
  );
}
