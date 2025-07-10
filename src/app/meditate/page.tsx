
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { getLocaleStrings, type LocaleStrings } from "@/lib/locales";

export default function MeditatePage() {
  const router = useRouter();
  const [uiStrings, setUiStrings] = useState<LocaleStrings | null>(null);

  useEffect(() => {
    let detectedLang = navigator.language.toLowerCase();
    if (detectedLang.startsWith('zh')) {
      detectedLang = 'zh-CN';
    } else {
      detectedLang = 'en';
    }
    setUiStrings(getLocaleStrings(detectedLang));
  }, []);

  const handleStart = () => {
    if (!uiStrings) return;
    const basePath = uiStrings.langCode === 'zh-CN' ? '/cn' : '';
    router.push(`${basePath}/prepare`);
  };

  if (!uiStrings) {
    return (
      <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl text-center">
        <CardHeader className="p-6 md:p-8">
          <CardTitle className="text-3xl md:text-4xl font-headline text-primary">
            {uiStrings.meditateNow}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 py-0 flex flex-col items-center space-y-4">
           <p className="text-xl md:text-2xl text-foreground leading-relaxed">
             {uiStrings.meditateRepeat}
           </p>
           <p className="text-2xl md:text-3xl font-semibold text-accent leading-relaxed">
             {uiStrings.meditateDecision}
           </p>
           <p className="text-sm text-muted-foreground pt-4">
              {uiStrings.meditateNote}
           </p>
        </CardContent>
        <CardFooter className="flex-col items-center p-6 md:p-8 mt-6">
            <p className="text-lg md:text-xl text-foreground mb-4">
              {uiStrings.meditateReady}
            </p>
            <Button
              onClick={handleStart}
              size="lg"
              className="w-full max-w-xs text-xl font-headline px-12 py-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow transform hover:scale-105"
            >
              {uiStrings.meditateStart}
            </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
