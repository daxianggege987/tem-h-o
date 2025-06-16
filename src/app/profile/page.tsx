
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserCircle2, Star, Gift, ShoppingBag, CalendarDays, CreditCard, ArrowLeft, LogOut, LogIn } from "lucide-react"; 
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const userCreditsData = {
  freeCredits: 3,
  paidCredits: 0,
};

export default function ProfilePage() {
  const { user, signOut, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const isVip = !!user; 
  const [vipExpirationDate, setVipExpirationDate] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const today = new Date();
      const expiration = new Date(today.setDate(today.getDate() + 30)); 
      setVipExpirationDate(expiration.toLocaleDateString());
    } else {
      setVipExpirationDate(null);
    }
  }, [user]);

  if (authLoading) {
    return (
      <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
        <p>Loading profile...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl text-center">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary">Profile Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Please log in to view your profile.</p>
            <Link href="/login">
              <Button className="w-full">
                <LogIn className="mr-2 h-5 w-5" />
                Go to Login
              </Button>
            </Link>
            <Link href="/" className="block mt-2">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  // User is logged in
  const pageDisplayName = user.displayName || user.phoneNumber || "Oracle User";
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
      <Card className="w-full max-w-md shadow-xl relative">
        <Link href="/" className="absolute left-4 top-4 text-primary hover:text-primary/80 transition-colors" aria-label="Back to Home">
            <ArrowLeft className="h-6 w-6" />
        </Link>
        <CardHeader className="text-center pt-12 sm:pt-6">
          <div className="flex justify-center mb-4">
            <Avatar className="h-24 w-24 border-2 border-primary shadow-md">
              {photoURL && (
                <AvatarImage src={photoURL} alt={pageDisplayName} data-ai-hint="profile avatar" />
              )}
              <AvatarFallback>
                {getAvatarFallbackContent()}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-3xl font-headline text-primary">{pageDisplayName}</CardTitle>
          {isVip && (
            <div className="mt-2">
              <Badge variant="default" className="text-sm bg-primary hover:bg-primary/90">
                <Star className="mr-1 h-4 w-4" /> VIP Member
              </Badge>
            </div>
          )}
           <CardDescription className="text-xs text-muted-foreground pt-1">
             {user.email || user.phoneNumber || "No contact info"}
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-2">
          <div className="flex items-center text-lg">
            <Gift className="mr-3 h-6 w-6 text-accent" />
            <span>Free Credits:</span>
            <span className="ml-auto font-semibold">{userCreditsData.freeCredits}</span>
          </div>
          <div className="flex items-center text-lg">
            <ShoppingBag className="mr-3 h-6 w-6 text-accent" />
            <span>Paid Credits:</span>
            <span className="ml-auto font-semibold">{userCreditsData.paidCredits}</span>
          </div>
          
          {isVip && vipExpirationDate && (
             <div className="flex items-center text-lg">
                <CalendarDays className="mr-3 h-6 w-6 text-accent" />
                <span>VIP Expires:</span>
                <span className="ml-auto font-semibold">{vipExpirationDate}</span>
            </div>
          )}

          <div className="pt-4 space-y-3">
            <Link href="/pricing">
              <Button className="w-full text-lg" size="lg">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Purchase Credits / Upgrade
              </Button>
            </Link>
            <Button onClick={signOut} variant="outline" className="w-full text-lg" size="lg">
              <LogOut className="mr-2 h-5 w-5" />
              Sign Out
            </Button>
          </div>
          
        </CardContent>
      </Card>
    </main>
  );
}
