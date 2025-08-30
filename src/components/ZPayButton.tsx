"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ExternalLink } from 'lucide-react';
import type { LocaleStrings } from '@/lib/locales';
import { cn } from '@/lib/utils';

interface ZPayButtonProps {
    product: {
        id: string;
        name: string;
        price: string;
    };
    onPaymentStart: () => void;
    lang: string;
    uiStrings: LocaleStrings;
    className?: string;
    showIcon?: boolean; // New prop to control icon visibility
}

const ZPAY_GATEWAY_URL = "https://z-pay.cn/submit.php";

export const ZPayButton: React.FC<ZPayButtonProps> = ({ product, onPaymentStart, lang, uiStrings, className, showIcon = true }) => {
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
    
    let buttonText = uiStrings.vipRecommendButton; // Use the specific string from locales
    if (product.id.startsWith('source-code')) {
         buttonText = lang === 'zh-CN' ? `支付 ¥${product.price} 购买源码` : `Pay ¥${product.price} for Source Code`;
    } else if (product.id.startsWith('oracle-unlock')) {
         buttonText = lang === 'zh-CN' ? `仅需 ¥${product.price} 即可解锁` : `Only ¥${product.price} to Unlock`;
    }


    return (
        <Button onClick={handlePay} disabled={isLoading} className={cn("w-full", className)} size="lg">
            {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin"/>
            ) : (
                showIcon && <ExternalLink className="mr-2 h-5 w-5"/>
            )}
            {isLoading ? (lang === 'zh-CN' ? "正在准备支付..." : "Preparing payment...") : buttonText}
        </Button>
    );
};