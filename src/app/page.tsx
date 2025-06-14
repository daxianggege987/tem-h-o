
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from 'next/link';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserCircle2, LogIn } from "lucide-react";
import OracleDisplay from "@/components/OracleDisplay";
import OpeningAdScreen from "@/components/OpeningAdScreen";
import { getLocaleStrings, type LocaleStrings } from "@/lib/locales";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext"; // Import useAuth

export default function Home() {
  const [uiStrings, setUiStrings] = useState<LocaleStrings | null>(null);
  const [currentLang, setCurrentLang] = useState<string>("en");
  const [showAdScreen, setShowAdScreen] = useState(true);
  const { user, loading: authLoading } = useAuth(); // Get user and loading state

  useEffect(() => {
    let detectedLang = navigator.language.toLowerCase();
    if (detectedLang.startsWith('zh')) {
      detectedLang = 'zh-CN';
    } else if (detectedLang.startsWith('en')) {
      detectedLang = 'en';
    } else {
      detectedLang = 'en'; 
    }
    setCurrentLang(detectedLang);
    setUiStrings(getLocaleStrings(detectedLang));
  }, []);

  const handleAdComplete = useCallback(() => {
    setShowAdScreen(false);
  }, []);

  if (showAdScreen) {
    return <OpeningAdScreen onAdComplete={handleAdComplete} />;
  }

  if (!uiStrings || authLoading) { // Also wait for authLoading
    return (
      <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center pt-10 pb-20 px-4 relative">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p>{getLocaleStrings(currentLang).calculatingDestiny || "Loading..."}</p> 
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center pt-10 pb-20 px-4 relative">
      
      <div className="absolute top-6 right-6 z-10">
        {user ? (
          <Link href="/profile" className="p-1 bg-card rounded-full shadow-md hover:shadow-lg transition-shadow" aria-label="View Profile">
            <Avatar className="h-10 w-10 border-2 border-primary">
              <AvatarImage src={user.photoURL || "https://placehold.co/40x40.png"} alt={user.displayName || "User Profile"} data-ai-hint="profile avatar" />
              <AvatarFallback>
                <UserCircle2 className="h-6 w-6 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
          </Link>
        ) : (
          <Link href="/login" passHref>
            <Button variant="outline" size="sm">
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Button>
          </Link>
        )}
      </div>
      
      <header className="text-center mb-10 md:mb-16">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-headline font-bold text-primary">
          {uiStrings.appTitle}
        </h1>
        <p className="text-md sm:text-lg md:text-xl text-muted-foreground mt-3 md:mt-4 font-headline max-w-2xl mx-auto">
          {uiStrings.appDescription}
        </p>
      </header>
      <OracleDisplay currentLang={currentLang} uiStrings={uiStrings} />
    </main>
  );
}
