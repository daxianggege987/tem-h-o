
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

  const uiStrings: LocaleStrings = getLocaleStrings("zh-CN");
  
  useEffect(() => {
    // This logic is for guest checkout sessions
    const storedSessionRaw = localStorage.getItem('oracleUnlockData');
    if (storedSessionRaw) {
      try {
        const storedSession = JSON.parse(storedSessionRaw);
        const isExpired = Date.now() - storedSession.unlockedAt > 30 * 60 * 1000; // 30 minutes
        
        if (isExpired) {
          localStorage.removeItem('oracleUnlockData');
          toast({
            title: "会话已过期",
            description: "您之前的测算会话已结束，请重新开始。",
          });
          router.push('/cn'); // Redirect to Chinese homepage
          return;
        }
      } catch (e) {
        console.error("解析会话数据时出错:", e);
        localStorage.removeItem('oracleUnlockData');
      }
    }

    setIsReady(true);
  }, [router, toast]);

  if (!isReady) {
    return (
      <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center pt-10 pb-20 px-4 relative">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p>{"正在加载..."}</p> 
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center pt-10 pb-20 px-4 relative">
      <header className="text-center mb-10 md:mb-16">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-headline font-bold text-primary">
          {uiStrings.appTitle}
        </h1>
        <p className="text-md sm:text-lg md:text-xl text-muted-foreground mt-3 md:mt-4 font-headline max-w-2xl mx-auto">
          {uiStrings.appDescription}
        </p>
      </header>
      <OracleDisplay 
        currentLang={"zh-CN"} 
        uiStrings={uiStrings} 
      />
    </main>
  );
}

    