
"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import OpeningAdScreen from "@/components/OpeningAdScreen";
import { useRouter } from "next/navigation";

export default function MeditatePage() {
  const [showAdScreen, setShowAdScreen] = useState(true);
  const router = useRouter();

  const handleAdComplete = useCallback(() => {
    setShowAdScreen(false);
  }, []);

  const handleStart = () => {
    router.push('/oracle');
  };

  if (showAdScreen) {
    return <OpeningAdScreen onAdComplete={handleAdComplete} />;
  }

  return (
    <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4 text-center">
      <div className="space-y-3 sm:space-y-4 md:space-y-5">
        <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-headline">现在</p>
        <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-headline">请在心里默念三遍</p>
        <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-headline">想要决策的事</p>
        <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-headline">准备好了</p>
        <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-headline pt-2 sm:pt-3 md:pt-4">请点</p>
        <div className="pt-2 sm:pt-3 md:pt-4">
          <Button
            onClick={handleStart}
            size="lg"
            className="text-xl sm:text-2xl md:text-3xl font-headline px-12 py-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow transform hover:scale-105"
          >
            开始
          </Button>
        </div>
      </div>
    </main>
  );
}
