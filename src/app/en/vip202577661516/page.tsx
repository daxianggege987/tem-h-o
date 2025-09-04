"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Bookmark, Copy, Check, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function VipSuccessPage() {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedUrl(url);
      toast({
        title: "Copied!",
        description: "The URL has been copied to your clipboard.",
      });
      setTimeout(() => setCopiedUrl(null), 2000);
    }, (err) => {
      toast({
        title: "Copy Failed",
        description: "Could not copy the URL. Please copy it manually.",
        variant: "destructive",
      });
      console.error('Could not copy text: ', err);
    });
  };

  if (!isMounted) {
    return (
      <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </main>
    );
  }

  const VipUrls = [
    { name: "Finger-Pinching Oracle (Pin)", url: "https://dachui80.cn/en/pin" },
    { name: "Divine Finger-Pinching Oracle", url: "https://dachui80.cn/en/push" },
    { name: "Custom Time Oracle", url: "https://dachui80.cn/en/cus" },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl text-center">
        <CardHeader className="p-6 md:p-8">
          <div className="flex justify-center mb-4">
            <Bookmark className="h-16 w-16 text-primary"/>
          </div>
          <CardTitle className="text-2xl md:text-3xl font-headline text-primary">
            Please Remember These Three URLs
          </CardTitle>
          <CardDescription className="pt-2 text-muted-foreground text-base">
            We recommend bookmarking them in your browser.
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
        If you encounter access issues or the page expires, please contact 94722424@qq.com
      </p>
    </main>
  );
}
