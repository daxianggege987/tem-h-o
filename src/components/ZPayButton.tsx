
"use client";

import React, { useState, useRef } from 'react';
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

const ZPAY_SUBMIT_URL = "https://z-pay.cn/submit.php";

export const ZPayButton: React.FC<ZPayButtonProps> = ({ product, onPaymentStart, lang, uiStrings }) => {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);
    const [formFields, setFormFields] = useState<{ [key: string]: string }>({});

    const handlePay = async () => {
        setIsLoading(true);
        onPaymentStart(); // Save data to localStorage before fetching payment details

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

            setFormFields(data);
            
            // Use a timeout to ensure state has updated before submitting the form
            setTimeout(() => {
                if (formRef.current) {
                    formRef.current.submit();
                }
            }, 100);

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
        ? `仅需 $4.49 即可解锁`
        : `Only $4.49 to Unlock`;

    return (
        <div>
            <Button onClick={handlePay} disabled={isLoading} className="w-full" size="lg">
                {isLoading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin"/>
                ) : (
                    <ExternalLink className="mr-2 h-5 w-5"/>
                )}
                {isLoading ? (lang === 'zh-CN' ? "正在准备支付..." : "Preparing payment...") : buttonText}
            </Button>
            
            {/* Hidden form for submitting to Z-Pay */}
            <form ref={formRef} action={ZPAY_SUBMIT_URL} method="post" style={{ display: 'none' }}>
                {Object.entries(formFields).map(([key, value]) => (
                    <input key={key} type="hidden" name={key} value={value} />
                ))}
            </form>
        </div>
    );
};
