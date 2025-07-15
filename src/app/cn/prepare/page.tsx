
"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function PreparePage() {
  const router = useRouter();

  const handleNext = () => {
    router.push('/cn/meditate');
  };

  return (
    <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center p-8">
          <CardTitle className="text-3xl font-headline text-primary">
             请一定要诚心、恭敬
          </CardTitle>
        </CardHeader>
        <CardContent>
           <p className="text-center text-xl text-muted-foreground leading-relaxed">以免影响结果</p>
        </CardContent>
        <CardFooter className="justify-center p-6">
            <Button
              onClick={handleNext}
              size="lg"
              className="w-full max-w-xs text-xl font-headline px-12 py-8 rounded-lg shadow-lg"
            >
              下一步
            </Button>
        </CardFooter>
      </Card>
    </main>
  );
}

