
"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function LandingPage() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/oracle');
  };

  return (
    <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center p-6 md:p-8">
          <CardTitle className="text-3xl md:text-4xl font-headline text-primary">
            掐指一算
          </CardTitle>
          <CardDescription className="pt-4 text-muted-foreground text-base md:text-lg leading-relaxed">
            掐指一算是易经中最高层次的预测学，中国古人根据“天干”“地支”“八卦”“八门”“九宫”“九星”“九神”等信息，结合问卦时间或者事发时间，推算出事情的吉凶祸福。
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 py-0">
           <Separator />
           <div className="py-6 md:py-8">
             <p className="text-base md:text-lg text-muted-foreground leading-loose text-center">
              可以测算的包括但不限于：<br />
              求财如何行？失物何处去？寻人去何方？<br className="hidden sm:block" />
              官事欲如何？疾病安与康？姻缘合不合？<br className="hidden sm:block" />
              谋事参几何？ <span className="font-semibold text-foreground">当下有结果！</span>
            </p>
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
