
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { getLocaleStrings, type LocaleStrings } from "@/lib/locales";
import { Loader2 } from "lucide-react";

export default function PreparePage() {
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
    <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl text-center">
        <CardContent className="p-6 md:p-10 flex flex-col items-center space-y-6">
           <p className="text-2xl md:text-3xl text-foreground leading-relaxed">
             {uiStrings.prepareSincere}
           </p>
           <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
             {uiStrings.prepareAffectResult}
           </p>
        </CardContent>
        <CardFooter className="flex justify-center p-6 md:p-8 pt-0">
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
