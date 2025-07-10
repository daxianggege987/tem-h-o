
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Bookmark, Copy, Check, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getLocaleStrings, type LocaleStrings } from "@/lib/locales";
import Image from "next/image";

export default function VipSuccessPage() {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [uiStrings, setUiStrings] = useState<LocaleStrings | null>(null);
  const [currentLang, setCurrentLang] = useState<string>("zh-CN");
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    // Force Chinese for this route
    const lang = 'zh-CN';
    setCurrentLang(lang);
    setUiStrings(getLocaleStrings(lang));
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
      console.error('无法复制文本: ', err);
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
    { name: uiStrings.vipLinkTitlePin, url: "https://dachui80.cn/cn/pin" },
    { name: uiStrings.vipLinkTitlePush, url: "https://dachui80.cn/cn/push" },
    { name: uiStrings.vipLinkTitleCus, url: "https://dachui80.cn/cn/cus" },
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
                <Button variant="ghost" size="icon" onClick={() => handleCopy(item.url)} aria-label={`复制 ${item.name} 链接`}>
                    {copiedUrl === item.url ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5 text-muted-foreground" />}
                </Button>
            </div>
          ))}
        </CardContent>
      </Card>
      <div className="text-xs text-muted-foreground mt-6 text-center max-w-lg">
         <p>请联系微信81324338</p>
         <Image 
            src="/wechat-qr.png" 
            alt="WeChat QR Code" 
            width={150} 
            height={150} 
            className="mt-2 mx-auto"
            data-ai-hint="qr code"
        />
      </div>
    </main>
  );
}
