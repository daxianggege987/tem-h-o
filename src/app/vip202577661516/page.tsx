
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Bookmark, Copy, Check, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getLocaleStrings, type LocaleStrings } from "@/lib/locales";

export default function VipSuccessPage() {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [uiStrings, setUiStrings] = useState<LocaleStrings | null>(null);
  const [currentLang, setCurrentLang] = useState<string>("en");
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    let detectedLang = navigator.language.toLowerCase();
    if (detectedLang.startsWith('zh')) {
        detectedLang = 'zh-CN';
    } else {
        detectedLang = 'en';
    }
    setCurrentLang(detectedLang);
    setUiStrings(getLocaleStrings(detectedLang));
  }, []);

  const handleCopy = (url: string) => {
    if (!uiStrings) return;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedUrl(url);
      toast({
        title: uiStrings.vipUrlCopiedTitle,
        description: uiStrings.vipUrlCopiedDescription,
      });
      setTimeout(() => setCopiedUrl(null), 2000);
    }, (err) => {
      toast({
        title: uiStrings.vipUrlCopyErrorTitle,
        description: uiStrings.vipUrlCopyErrorDescription,
        variant: "destructive",
      });
      console.error('Could not copy text: ', err);
    });
  };

  if (!isMounted || !uiStrings) {
    return (
      <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </main>
    );
  }

  const VipUrls = [
    { name: uiStrings.vipLinkTitlePin, url: "https://choosewhatnow.com/pin" },
    { name: uiStrings.vipLinkTitlePush, url: "https://choosewhatnow.com/push" },
    { name: uiStrings.vipLinkTitleCus, url: "https://choosewhatnow.com/cus" },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl text-center">
        <CardHeader className="p-6 md:p-8">
          <div className="flex justify-center mb-4">
            <Bookmark className="h-16 w-16 text-primary"/>
          </div>
          <CardTitle className="text-2xl md:text-3xl font-headline text-primary">
            {uiStrings.vipSuccessTitle}
          </CardTitle>
          <CardDescription className="pt-2 text-muted-foreground text-base">
            {uiStrings.vipSuccessDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 py-4 pb-8 flex flex-col items-center space-y-4">
          {VipUrls.map((item) => (
            <div key={item.name} className="w-full max-w-sm p-3 border rounded-lg flex items-center justify-between bg-card-foreground/5">
                <div className="text-left">
                    <p className="font-semibold text-lg text-foreground">{item.name}</p>
                    <Link href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline break-all">
                        {item.url}
                    </Link>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleCopy(item.url)} aria-label={`Copy ${item.name} URL`}>
                    {copiedUrl === item.url ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5 text-muted-foreground" />}
                </Button>
            </div>
          ))}
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground mt-6 text-center max-w-lg">
        {uiStrings.vipContactInfo}
      </p>
    </main>
  );
}
