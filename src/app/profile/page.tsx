
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserCircle2, Star, Gift, ShoppingBag, CalendarDays, CreditCard } from "lucide-react"; 

// Placeholder data - in a real app, this would come from an API or user context
const userData = {
  avatarUrl: "https://placehold.co/128x128.png",
  username: "OracleUser123",
  freeCredits: 3, // Updated
  paidCredits: 0, // Updated
  isVip: true,
  vipExpirationDate: "2024-12-31", 
};

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Avatar className="h-24 w-24 border-2 border-primary shadow-md">
              <AvatarImage src={userData.avatarUrl} alt={userData.username} data-ai-hint="profile avatar" />
              <AvatarFallback>
                <UserCircle2 className="h-12 w-12 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-3xl font-headline text-primary">{userData.username}</CardTitle>
          {userData.isVip && (
            <div className="mt-2">
              <Badge variant="default" className="text-sm bg-primary hover:bg-primary/90">
                <Star className="mr-1 h-4 w-4" /> VIP Member
              </Badge>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6 pt-2">
          <div className="flex items-center text-lg">
            <Gift className="mr-3 h-6 w-6 text-accent" />
            <span>Free Credits:</span>
            <span className="ml-auto font-semibold">{userData.freeCredits}</span>
          </div>
          <div className="flex items-center text-lg">
            <ShoppingBag className="mr-3 h-6 w-6 text-accent" />
            <span>Paid Credits:</span>
            <span className="ml-auto font-semibold">{userData.paidCredits}</span>
          </div>
          
          {userData.isVip ? (
             <div className="flex items-center text-lg">
                <CalendarDays className="mr-3 h-6 w-6 text-accent" />
                <span>VIP Expires:</span>
                <span className="ml-auto font-semibold">{userData.vipExpirationDate}</span>
            </div>
          ) : (
             <div className="flex items-center text-lg">
                <Star className="mr-3 h-6 w-6 text-muted-foreground" />
                <span>VIP Status:</span>
                <span className="ml-auto font-semibold">Not Active</span>
            </div>
          )}

          <div className="pt-4">
            <Button className="w-full text-lg" size="lg">
              <CreditCard className="mr-2 h-5 w-5" />
              Purchase Credits / Upgrade
            </Button>
          </div>
          
          <div className="text-center text-xs text-muted-foreground pt-4">
            This is your personal profile page.
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
