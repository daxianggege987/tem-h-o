
"use client";

import type { LocaleStrings } from "@/lib/locales";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface AdConfig {
  imageUrl: string;
  duration: number; // in milliseconds
  linkUrl?: string;
  altText: string;
  dataAiHint?: string;
}

interface OpeningAdScreenProps {
  onAdComplete: () => void;
  // Pass uiStrings if you need localized text for skip button, loading, etc.
  // For simplicity, we'll use hardcoded English text for now.
  // uiStrings: LocaleStrings; 
}

export default function OpeningAdScreen({ onAdComplete }: OpeningAdScreenProps) {
  const [adConfig, setAdConfig] = useState<AdConfig | null>(null);
  const [isLoadingAd, setIsLoadingAd] = useState(true);

  const skipAdText = "Skip Ad"; // Hardcoded for now, can be from uiStrings
  const loadingAdText = "Loading Advertisement..."; // Hardcoded

  useEffect(() => {
    // Simulate fetching ad configuration from a backend
    const fetchAdConfig = async () => {
      setIsLoadingAd(true);
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // In a real app, fetch this from your server:
        // const response = await fetch('/api/get-opening-ad');
        // const data = await response.json();
        // setAdConfig(data);

        // For demonstration:
        setAdConfig({
          imageUrl: "https://i.postimg.cc/j58BzPr8/a6.jpg", // Updated image URL
          duration: 5000, // 5 seconds
          // linkUrl: "https://example.com/promoted-product", // Optional
          altText: "Advertisement", // Kept previous altText
          dataAiHint: "advertisement marketing" // Kept previous dataAiHint
        });
      } catch (error) {
        console.error("Failed to load ad config:", error);
        // If ad fails to load, complete immediately to show main content
        onAdComplete();
      } finally {
        setIsLoadingAd(false);
      }
    };

    fetchAdConfig();
  }, [onAdComplete]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (adConfig && adConfig.duration > 0) {
      timer = setTimeout(() => {
        onAdComplete();
      }, adConfig.duration);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [adConfig, onAdComplete]);

  const handleSkip = useCallback(() => {
    onAdComplete();
  }, [onAdComplete]);

  if (isLoadingAd) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-foreground p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg">{loadingAdText}</p>
      </div>
    );
  }

  if (!adConfig) {
    // Ad config failed to load, and onAdComplete should have been called.
    // This state should ideally not be reached if onAdComplete is called in error handling.
    return null; 
  }

  const adImage = (
    <Image
      src={adConfig.imageUrl}
      alt={adConfig.altText}
      layout="fill"
      objectFit="cover"
      priority // Ensure ad image loads quickly
      data-ai-hint={adConfig.dataAiHint}
    />
  );

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center">
      <div className="relative w-full h-full">
        {adConfig.linkUrl ? (
          <a href={adConfig.linkUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
            {adImage}
          </a>
        ) : (
          adImage
        )}
      </div>
      <Button
        onClick={handleSkip}
        variant="outline"
        className="absolute top-4 right-4 z-10 bg-background/70 hover:bg-background/90 text-foreground"
      >
        {skipAdText}
      </Button>
    </div>
  );
}
