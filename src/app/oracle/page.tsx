"use client";

import { useEffect, useState } from "react";
import OracleDisplay from "@/components/OracleDisplay";
import { getLocaleStrings, type LocaleStrings } from "@/lib/locales";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function OraclePage() {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Hardcode language to English for this page
  const currentLang = "en";
  const uiStrings = getLocaleStrings(currentLang);

  useEffect(() => {
    const storedSessionRaw = localStorage.getItem('oracleUnlockData');
    if (storedSessionRaw) {
      try {
        const storedSession = JSON.parse(storedSessionRaw);
        const isExpired = Date.now() - storedSession.unlockedAt > 30 * 60 * 1000; // 30 minutes
        
        if (isExpired) {
          localStorage.removeItem('oracleUnlockData');
          toast({
            title: "Session Expired",
            description: "Your previous reading session has ended. Please start a new one.",
          });
          router.push('/');
          return; // Don't proceed to render this page
        }
      } catch (e) {
        console.error("Error parsing session data:", e);
        localStorage.removeItem('oracleUnlockData'); // Clear corrupted data
      }
    }
    
    setIsReady(true); // Now we are ready to render OracleDisplay
  }, [router, toast]);

  if (!isReady) {
    return (
      <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center pt-10 pb-20 px-4 relative">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p>{uiStrings.calculatingDestiny || "Loading..."}</p> 
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center pt-10 pb-20 px-4 relative">
       <div className="text-center mb-10 md:mb-16">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-headline font-bold text-primary">
          {uiStrings.appTitle}
        </h1>
        <p className="text-md sm:text-lg md:text-xl text-muted-foreground mt-3 md:mt-4 font-headline max-w-2xl mx-auto">
          {uiStrings.appDescription}
        </p>
      </div>
      <OracleDisplay 
        currentLang={currentLang} 
        uiStrings={uiStrings}
      />
    </main>
  );
}
