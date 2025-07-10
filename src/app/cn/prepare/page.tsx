
"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export default function PreparePage() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/cn/oracle');
  };

  return (
    <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl text-center">
        <CardContent className="p-6 md:p-10 flex flex-col items-center space-y-6">
           <p className="text-2xl md:text-3xl text-foreground leading-relaxed">
             请一定要诚心、恭敬
           </p>
           <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
             以免影响结果
           </p>
        </CardContent>
        <CardFooter className="flex justify-center p-6 md:p-8 pt-0">
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
