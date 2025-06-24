
"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import OpeningAdScreen from "@/components/OpeningAdScreen";
import { useRouter } from "next/navigation";
import { getLocaleStrings, type LocaleStrings } from "@/lib/locales";
import { Loader2 } from "lucide-react";

export default function MeditatePage() {
  const [showAdScreen, setShowAdScreen] = useState(true);
  const router = useRouter();
  const [uiStrings, setUiStrings] = useState<LocaleStrings | null>(null);

  useEffect(() => {
    let detectedLang = navigator.language.toLowerCase();
    if (detectedLang.startsWith('zh')) {
      detectedLang = 'zh-CN';
    } else if (detectedLang.startsWith('en')) {
      detectedLang = 'en';
    } else {
      detectedLang = 'en'; 
    }
    setUiStrings(getLocaleStrings(detectedLang));
  }, []);

  const handleAdComplete = useCallback(() => {
    setShowAdScreen(false);
  }, []);

  const handleStart = () => {
    router.push('/oracle');
  };

  if (showAdScreen) {
    return <OpeningAdScreen onAdComplete={handleAdComplete} />;
  }

  if (!uiStrings) {
    return (
      <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4 text-center">
      <div className="space-y-3 sm:space-y-4 md:space-y-5">
        <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-headline">{uiStrings.meditateNow}</p>
        <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-headline">{uiStrings.meditateRepeat}</p>
        <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-headline">{uiStrings.meditateDecision}</p>
        <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-headline">{uiStrings.meditateReady}</p>
        <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-headline pt-2 sm:pt-3 md:pt-4">{uiStrings.meditateClick}</p>
        <div className="pt-2 sm:pt-3 md:pt-4">
          <Button
            onClick={handleStart}
            size="lg"
            className="text-xl sm:text-2xl md:text-3xl font-headline px-12 py-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow transform hover:scale-105"
          >
            {uiStrings.meditateStart}
          </Button>
        </div>
      </div>
    </main>
  );
}
