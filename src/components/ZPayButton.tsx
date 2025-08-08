
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ExternalLink } from 'lucide-react';
import type { LocaleStrings } from '@/lib/locales';

interface ZPayButtonProps {
    product: {
        id: string;
        name: string;
        price: string;
    };
    onPaymentStart: () => void;
    lang: string;
    uiStrings: LocaleStrings;
}

const ZPAY_GATEWAY_URL = "https://z-pay.cn/submit.php";

export const ZPayButton: React.FC<ZPayButtonProps> = ({ product, onPaymentStart, lang, uiStrings }) => {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handlePay = async () => {
        setIsLoading(true);
        onPaymentStart(); 

        try {
            const res = await fetch('/api/zpay/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product, lang }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to get payment details from server.");
            }

            // Instead of submitting a form, construct a URL and redirect.
            // This is more robust in sandboxed environments.
            const params = new URLSearchParams(data);
            const redirectUrl = `${ZPAY_GATEWAY_URL}?${params.toString()}`;
            
            window.location.href = redirectUrl;

        } catch (err: any) {
            toast({
                title: "Payment Error",
                description: err.message,
                variant: "destructive",
            });
            setIsLoading(false);
        }
    };

    const buttonText = lang === 'zh-CN'
        ? `仅需 ¥9.90 即可解锁`
        : `Only ¥9.90 to Unlock`;

    return (
        <Button onClick={handlePay} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin"/>
            ) : (
                <ExternalLink className="mr-2 h-5 w-5"/>
            )}
            {isLoading ? (lang === 'zh-CN' ? "正在准备支付..." : "Preparing payment...") : buttonText}
        </Button>
    );
};
