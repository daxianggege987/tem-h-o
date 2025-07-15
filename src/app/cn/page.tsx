
"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function LandingPage() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/cn/oracle');
  };

  return (
    <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center p-6 md:p-8">
          <CardTitle className="text-3xl md:text-4xl font-headline text-primary">
            掐指一算
          </CardTitle>
          <CardDescription className="pt-4 text-muted-foreground text-base md:text-lg leading-relaxed">
            掐指一算是易经中高层次的预测学，古人根据“天干(Tiangan)”, “地支(Dizhi)”, “八卦(Bagua)”等信息，结合问事时间，推算吉凶祸福。
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 py-0">
           <Separator />
           <div className="py-6 md:py-8 text-center space-y-6">
              <div className="text-foreground">
                <p className="text-xl md:text-2xl leading-relaxed">请在心里默念三遍</p>
                <p className="text-2xl md:text-3xl font-semibold text-accent leading-relaxed">想要测算的事</p>
                 <p className="text-sm text-muted-foreground pt-2">注意：同一件事，只能测一次</p>
              </div>
              <Separator />
              <div className="text-foreground">
                <p className="text-2xl md:text-3xl leading-relaxed">请一定要诚心、恭敬</p>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">以免影响结果</p>
              </div>
           </div>
        </CardContent>
        <CardFooter className="flex-col items-center p-6 pt-0">
            <Button
              onClick={handleStart}
              size="lg"
              className="w-full max-w-xs text-xl font-headline px-12 py-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow transform hover:scale-105"
            >
              立即测算
            </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
