
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { getLocaleStrings, type LocaleStrings } from "@/lib/locales";

export default function LandingPage() {
  const router = useRouter();
  const [uiStrings, setUiStrings] = useState<LocaleStrings | null>(null);
  const [currentLang, setCurrentLang] = useState<string>("en");

  useEffect(() => {
    let detectedLang = navigator.language.toLowerCase();
    if (detectedLang.startsWith('zh')) {
      detectedLang = 'zh-CN';
    } else {
      detectedLang = 'en';
    }
    setCurrentLang(detectedLang);
    setUiStrings(getLocaleStrings(detectedLang));
  }, []);

  const handleStart = () => {
    const basePath = currentLang === 'zh-CN' ? '/cn' : '';
    router.push(`${basePath}/oracle`);
  };

  if (!uiStrings) {
    return (
      <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center pt-10 pb-20 p-4">
      <Card className="w-full max-w-3xl shadow-xl">
        <CardHeader className="text-center p-6 md:p-8 pb-8 md:pb-10">
          <CardTitle className="text-3xl md:text-4xl font-headline text-primary">
            {uiStrings.landingTitle}
          </CardTitle>
          <CardDescription className="pt-4 text-muted-foreground text-base md:text-lg leading-relaxed">
            {uiStrings.landingDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 py-0">
           <Separator />
           <div className="py-6 md:py-8 text-center space-y-6">
              <div className="text-foreground">
                <p className="text-xl md:text-2xl leading-relaxed">{uiStrings.meditateRepeat}</p>
                <p className="text-2xl md:text-3xl font-semibold text-accent leading-relaxed">{uiStrings.meditateDecision}</p>
                 <p className="text-sm text-muted-foreground pt-2">{uiStrings.meditateNote}</p>
              </div>
              <Separator />
              <div className="text-foreground">
                <p className="text-2xl md:text-3xl leading-relaxed">{uiStrings.prepareSincere}</p>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">{uiStrings.prepareAffectResult}</p>
              </div>
           </div>
        </CardContent>
        <CardFooter className="flex-col items-center p-6 pt-0">
            <Button
              onClick={handleStart}
              size="lg"
              className="w-full max-w-xs text-xl font-headline px-12 py-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow transform hover:scale-105"
            >
              {uiStrings.landingButton}
            </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
