
"use client";

import OracleDisplay from "@/components/OracleDisplay";
import { getLocaleStrings } from "@/lib/locales";

export default function OraclePage() {
  const currentLang = "en";
  const uiStrings = getLocaleStrings(currentLang);

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
