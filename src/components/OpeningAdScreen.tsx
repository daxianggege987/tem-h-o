
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Default duration if AdSense doesn't load or as a fallback
const FALLBACK_AD_DURATION = 5000; // 5 seconds

interface OpeningAdScreenProps {
  onAdComplete: () => void;
}

export default function OpeningAdScreen({ onAdComplete }: OpeningAdScreenProps) {
  const [isLoading, setIsLoading] = useState(false); // To manage loading state if needed for AdSense
  const adPushed = useRef(false); // Use a ref to prevent double-pushing in Strict Mode
  
  const skipAdText = "Skip Ad"; 
  const loadingAdText = "Loading Advertisement...";

  // This useEffect handles pushing the ad to AdSense
  useEffect(() => {
    // Prevent the effect from running twice in development (Strict Mode)
    if (adPushed.current) {
      return;
    }

    try {
      // Ensure this runs only on the client and adsbygoogle is available
      if (typeof window !== "undefined" && (window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        adPushed.current = true; // Mark that we've pushed the ad
        setIsLoading(false); // Assume AdSense will handle loading display
      } else {
        // Fallback if adsbygoogle is not ready immediately, maybe retry or skip
        console.warn("AdSense script not ready yet or ad blocker active.");
        setIsLoading(false); 
      }
    } catch (e) {
      console.error("Error displaying AdSense ad:", e);
      setIsLoading(false);
    }
  }, []);


  // This useEffect handles the fallback timer for skipping or completing the ad screen
  useEffect(() => {
    // The ad screen will show for a minimum duration or until skipped
    // AdSense doesn't provide a reliable "ad loaded" or "ad finished" event for display ads
    // So, we rely on a timer or the skip button.
    const adDisplayTimer = setTimeout(() => {
      onAdComplete();
    }, FALLBACK_AD_DURATION); // User can skip before this

    return () => {
      clearTimeout(adDisplayTimer);
    };
  }, [onAdComplete]);


  const handleSkip = useCallback(() => {
    onAdComplete();
  }, [onAdComplete]);

  // If you want a loading spinner while AdSense script potentially initializes or first ad loads
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-foreground p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg">{loadingAdText}</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center">
      <div className="relative w-full h-full flex items-center justify-center">
        {/* 
          Google AdSense Ad Unit
          IMPORTANT: 
          1. Replace 'ca-pub-YOUR_PUBLISHER_ID' with your actual AdSense Publisher ID.
          2. Replace 'YOUR_AD_SLOT_ID' with the ID of your specific AdSense ad unit.
          3. Configure the style, data-ad-format, etc., as per your AdSense ad unit setup.
             For an interstitial-like experience, you might use a full-screen format if AdSense policies allow.
             This example uses a responsive display ad format.
        */}
        <div style={{ minWidth: '300px', minHeight: '250px', width: '80%', height: '70%', maxWidth: '728px', maxHeight: '500px', margin: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ins className="adsbygoogle"
               style={{ display: 'block', width: '100%', height: '100%', textAlign: 'center' }}
               data-ad-client="ca-pub-YOUR_PUBLISHER_ID" 
               data-ad-slot="YOUR_AD_SLOT_ID" 
               data-ad-format="auto"
               data-full-width-responsive="true"></ins>
        </div>
      </div>
      <Button
        onClick={handleSkip}
        variant="outline"
        className="absolute top-4 right-4 z-10 bg-background/70 hover:bg-background/90 text-foreground"
      >
        {skipAdText} ({Math.ceil(FALLBACK_AD_DURATION / 1000)}s)
      </Button>
    </div>
  );
}
