
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ScanLine } from 'lucide-react';
import type { LocaleStrings } from '@/lib/locales';

interface WeChatPayFlowProps {
  product: {
    id: string;
    description?: string;
    name: string;
    price: string;
  };
  onSuccess: () => void;
  uiStrings: LocaleStrings;
  triggerButton?: React.ReactNode;
  showIcon?: boolean;
}

export const WeChatPayFlow: React.FC<WeChatPayFlowProps> = ({ product, onSuccess, uiStrings, showIcon = true }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleCreateOrder = async () => {
    setIsProcessing(true);
    onSuccess(); // Immediately call onSuccess to set localStorage context

    try {
      const res = await fetch('/api/wechat/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product, paymentType: 'MWEB' }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "创建微信支付订单失败");
      }

      if (data.h5_url) {
        const redirectUrl = data.h5_url + `&redirect_url=${encodeURIComponent(window.location.origin + '/payment-success')}`;
        window.location.href = redirectUrl;
      } else {
        throw new Error("未能获取到支付跳转链接(h5_url)");
      }

    } catch (err: any) {
      toast({
        title: "创建订单失败",
        description: err.message,
        variant: "destructive"
      });
      setIsProcessing(false);
    } 
  };

  return (
    <Button onClick={handleCreateOrder} className="w-full text-lg bg-green-500 hover:bg-green-600 text-white" size="lg" disabled={isProcessing}>
      {isProcessing ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
      ) : (
        showIcon && <ScanLine className="mr-2 h-5 w-5" />
      )}
      {isProcessing ? "正在创建订单..." : uiStrings.wechatPayButton}
    </Button>
  );
};
