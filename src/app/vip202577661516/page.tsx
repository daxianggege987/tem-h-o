"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Bookmark, Copy, Check, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const VipUrls = [
  { name: "掐指一算 (Pin)", url: "https://choosewhatnow.com/pin" },
  { name: "掐指神算", url: "https://choosewhatnow.com/push" },
  { name: "自定义时间测算", url: "https://choosewhatnow.com/cus" },
];

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
        title: "已复制!",
        description: "网址已成功复制到您的剪贴板。",
      });
      setTimeout(() => setCopiedUrl(null), 2000);
    }, (err) => {
      toast({
        title: "复制失败",
        description: "无法复制网址，请手动复制。",
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

  return (
    <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl text-center">
        <CardHeader className="p-6 md:p-8">
          <div className="flex justify-center mb-4">
            <Bookmark className="h-16 w-16 text-primary"/>
          </div>
          <CardTitle className="text-2xl md:text-3xl font-headline text-primary">
            请您牢记这三个网址
          </CardTitle>
          <CardDescription className="pt-2 text-muted-foreground text-base">
            建议添加到您的浏览器书签页收藏
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
      <p className="text-xs text-muted-foreground mt-6 text-center">
        如果出现无法访问，或者网页过期问题，请联系94722424@qq.com
      </p>
    </main>
  );
}
