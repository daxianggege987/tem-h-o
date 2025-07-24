
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Mail, KeyRound, ArrowLeft } from "lucide-react";
import { getLocaleStrings, type LocaleStrings } from "@/lib/locales";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function SourceCodeSuccessPage() {
  const [uiStrings, setUiStrings] = useState<LocaleStrings | null>(null);

  useEffect(() => {
    // This component only needs the English strings
    setUiStrings(getLocaleStrings("en"));
  }, []);

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
          <div className="flex justify-center mb-4">
            <KeyRound className="h-16 w-16 text-primary"/>
          </div>
          <CardTitle className="text-2xl md:text-3xl font-headline text-primary">
            {uiStrings.sourceCodeSuccessTitle}
          </CardTitle>
          <CardDescription className="pt-2 text-muted-foreground text-base">
            {uiStrings.sourceCodeSuccessInstructionTitle}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 py-4 pb-8 flex flex-col items-center space-y-6">
          <div className="p-4 border rounded-md bg-card-foreground/5 text-left text-sm text-foreground/90">
            <p className="whitespace-pre-line">
              {uiStrings.sourceCodeSuccessInstructionBody}
            </p>
          </div>
          <div className="flex items-center space-x-2 p-3 bg-accent/10 rounded-lg">
            <Mail className="h-5 w-5 text-accent"/>
            <span className="font-mono font-semibold text-accent-foreground">{uiStrings.sourceCodeSuccessContactEmail}</span>
          </div>
          <Link href="/vip202577661516">
            <Button size="lg" className="text-lg mt-4">
                <ArrowLeft className="mr-2 h-5 w-5" />
                {uiStrings.sourceCodeSuccessButton}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
