"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Download, ArrowLeft } from "lucide-react";

export default function DownloadCnPage() {
  return (
    <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl text-center">
        <CardHeader className="p-6 md:p-8">
          <div className="flex justify-center mb-4">
            <Download className="h-16 w-16 text-primary"/>
          </div>
          <CardTitle className="text-2xl md:text-3xl font-headline text-primary">
            感谢您的购买！
          </CardTitle>
          <CardDescription className="pt-2 text-muted-foreground text-base">
            请通过下方链接访问源码仓库。
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 py-4 pb-8 flex flex-col items-center space-y-6">
          <div className="w-full p-4 border rounded-md bg-card-foreground/5 text-center">
            <p className="font-semibold text-foreground mb-2">GitHub 仓库链接:</p>
            <Link href="https://github.com/daxianggege987/tem-h-o" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline break-all">
                https://github.com/daxianggege987/tem-h-o
            </Link>
          </div>
           <a href="https://github.com/daxianggege987/tem-h-o" target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="text-lg">
                <Download className="mr-2 h-5 w-5" />
                前往 GitHub
            </Button>
          </a>
           <div className="text-xs text-muted-foreground text-center pt-4">
            <p>如有任何问题，请联系邮箱94722424@qq.com</p>
            <p>或者联系站长微信：94722424</p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
