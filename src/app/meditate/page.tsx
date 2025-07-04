"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function MeditatePage() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/oracle');
  };

  return (
    <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl text-center">
        <CardHeader className="p-6 md:p-8">
          <CardTitle className="text-3xl md:text-4xl font-headline text-primary">
            现在
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 py-0 flex flex-col items-center space-y-4">
           <p className="text-xl md:text-2xl text-foreground leading-relaxed">
             请在心里默念三遍
           </p>
           <p className="text-2xl md:text-3xl font-semibold text-accent leading-relaxed">
             想要测算的事
           </p>
           <p className="text-sm text-muted-foreground pt-4">
              注意：同一件事，只能测一次
           </p>
        </CardContent>
        <CardFooter className="flex-col items-center p-6 md:p-8 mt-6">
            <p className="text-lg md:text-xl text-foreground mb-4">
              准备好了, 请点
            </p>
            <Button
              onClick={handleStart}
              size="lg"
              className="w-full max-w-xs text-xl font-headline px-12 py-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow transform hover:scale-105"
            >
              开始
            </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
