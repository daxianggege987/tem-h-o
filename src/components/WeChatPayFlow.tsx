
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ScanLine } from 'lucide-react';
import Image from 'next/image';
import type { LocaleStrings } from '@/lib/locales';

interface WeChatPayFlowProps {
  product: {
    id: string;
    description: string;
    price: string;
  };
  onSuccess: () => void;
  uiStrings: LocaleStrings;
  triggerButton?: React.ReactNode;
}

export const WeChatPayFlow: React.FC<WeChatPayFlowProps> = ({ product, onSuccess, uiStrings, triggerButton }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderInfo, setOrderInfo] = useState<{ qrCodeUrl: string; orderId: string } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const pollIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  const cleanup = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  const pollOrderStatus = useCallback(async (tradeNo: string) => {
    try {
      const response = await fetch(`/api/wechat/create-order?out_trade_no=${tradeNo}`);
      if (!response.ok) {
        // Stop polling if the API returns an error status
        console.error(`Polling failed with status: ${response.status}`);
        cleanup();
        return;
      }
      const data = await response.json();
      if (data.trade_state === 'SUCCESS') {
        toast({ title: "支付成功！", description: "您的购买已完成。" });
        cleanup();
        setIsDialogOpen(false);
        onSuccess();
      }
    } catch (e) {
      console.error("Polling error:", e);
      cleanup(); // Stop polling on network or parsing error
    }
  }, [toast, onSuccess, cleanup]);

  const handleCreateOrder = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/wechat/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "创建订单失败");
      }
      setOrderInfo({ qrCodeUrl: data.code_url, orderId: data.out_trade_no });
      setIsDialogOpen(true);
      pollIntervalRef.current = setInterval(() => pollOrderStatus(data.out_trade_no), 3000);
    } catch (err: any) {
      toast({
        title: "创建订单失败",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleDialogChange = (open: boolean) => {
      setIsDialogOpen(open);
      if (!open) {
          cleanup();
      }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
      {triggerButton ? (
        <div onClick={handleCreateOrder} className="w-full">
          {isProcessing ? (
             <Button className="w-full text-lg" size="lg" disabled>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                 正在创建订单...
             </Button>
          ) : (
            triggerButton
          )}
        </div>
      ) : (
         <Button className="w-full text-lg bg-green-500 hover:bg-green-600 text-white" size="lg" onClick={handleCreateOrder} disabled={isProcessing}>
            {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ScanLine className="mr-2 h-5 w-5" />}
            {uiStrings.wechatPayButton}
        </Button>
      )}
      
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{uiStrings.wechatPayTitle}</DialogTitle>
          <DialogDescription>{uiStrings.wechatPayDescription}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-4 min-h-[250px]">
          {orderInfo ? (
            <>
              <Image
                src={orderInfo.qrCodeUrl}
                alt="WeChat Pay QR Code"
                width={200}
                height={200}
                data-ai-hint="qr code"
              />
              <p className="mt-4 text-lg font-semibold text-destructive">{product.price} CNY</p>
              <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/>正在检测支付状态...</p>
            </>
          ) : (
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
