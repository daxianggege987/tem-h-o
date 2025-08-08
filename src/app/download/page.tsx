
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";

export default function DownloadCnPage() {
  return (
    <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl text-center">
        <CardHeader className="p-6 md:p-8">
          <div className="flex justify-center mb-4">
            <Mail className="h-16 w-16 text-primary"/>
          </div>
          <CardTitle className="text-2xl md:text-3xl font-headline text-primary">
            感谢您的购买！
          </CardTitle>
          <CardDescription className="pt-2 text-muted-foreground text-base">
            请按以下指引获取您的源码。
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 py-4 pb-8 flex flex-col items-center space-y-6">
          <div className="w-full p-4 border rounded-md bg-card-foreground/5 text-left">
            <p className="font-semibold text-foreground mb-2">操作指引：</p>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>请准备好您的付款邮箱、姓名、订单号以及付款时间。</li>
                <li>将以上信息的截图或文字内容，发送至下方的联系邮箱。</li>
                <li>我们工作人员确认无误后，会通过邮件把源码发给您。</li>
            </ol>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">联系邮箱：</p>
            <p className="font-semibold text-lg text-foreground">94722424@qq.com</p>
          </div>
           <Link href="/vip202577661516">
            <Button size="lg" className="text-lg">
                <ArrowLeft className="mr-2 h-5 w-5" />
                返回VIP专属页面
            </Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
