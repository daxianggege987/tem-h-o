
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from 'next/link'; // Added
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"; // Added
import { UserCircle2 } from "lucide-react"; // Added
import OracleDisplay from "@/components/OracleDisplay";
import OpeningAdScreen from "@/components/OpeningAdScreen";
import { getLocaleStrings, type LocaleStrings } from "@/lib/locales";
import { Loader2 } from "lucide-react";

// Placeholder for avatar for the profile link
const userAvatarUrl = "https://placehold.co/40x40.png"; 

export default function Home() {
  const [uiStrings, setUiStrings] = useState<LocaleStrings | null>(null);
  const [currentLang, setCurrentLang] = useState<string>("en"); // Default to English
  const [showAdScreen, setShowAdScreen] = useState(true); // State to control ad screen visibility

  useEffect(() => {
    let detectedLang = navigator.language.toLowerCase();
    if (detectedLang.startsWith('zh')) {
      detectedLang = 'zh-CN';
    } else if (detectedLang.startsWith('en')) {
      detectedLang = 'en';
    } else {
      detectedLang = 'en'; // Fallback
    }
    setCurrentLang(detectedLang);
    setUiStrings(getLocaleStrings(detectedLang));
  }, []);

  const handleAdComplete = useCallback(() => {
    setShowAdScreen(false);
  }, []);

  if (showAdScreen) {
    // Pass onAdComplete to the OpeningAdScreen
    return <OpeningAdScreen onAdComplete={handleAdComplete} />;
  }

  if (!uiStrings) {
    return (
      <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center pt-10 pb-20 px-4 relative">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p>{getLocaleStrings(currentLang).calculatingDestiny || "Loading..."}</p> 
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center pt-10 pb-20 px-4 relative"> {/* Added relative positioning */}
      
      <Link href="/profile" legacyBehavior>
        <a className="absolute top-6 right-6 z-10 p-1 bg-card rounded-full shadow-md hover:shadow-lg transition-shadow" aria-label="View Profile">
          <Avatar className="h-10 w-10 border-2 border-primary">
            <AvatarImage src={userAvatarUrl} alt="User Profile" data-ai-hint="profile avatar" />
            <AvatarFallback>
              <UserCircle2 className="h-6 w-6 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
        </a>
      </Link>
      
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
