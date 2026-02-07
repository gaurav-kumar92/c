// src/components/LevelUpModal.tsx
import { useState, useEffect } from "react";
import { AdsterraService } from "@/services/AdsterraService";

interface LevelUpModalProps {
  onContinue: () => void;
  level: number;
}

export function LevelUpModal({ onContinue, level }: LevelUpModalProps) {
  const [isLoadingAd, setIsLoadingAd] = useState(false);
  const [adReady, setAdReady] = useState(AdsterraService.canShowAd());
  const [cooldownTime, setCooldownTime] = useState(0);

  // Update cooldown display
  useEffect(() => {
    if (!adReady) {
      const interval = setInterval(() => {
        const timeLeft = AdsterraService.getTimeUntilNextAd();
        setCooldownTime(timeLeft);

        if (timeLeft <= 0) {
          setAdReady(true);
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [adReady]);

  const handleShowAdAndContinue = async () => {
    if (!adReady || isLoadingAd) return;

    setIsLoadingAd(true);

    try {
      // Show the Adsterra ad
      await AdsterraService.showAd();
      
      // Ad completed, continue game
      setIsLoadingAd(false);
      setAdReady(false);
      onContinue();
    } catch (error) {
      console.error("Error showing ad:", error);
      setIsLoadingAd(false);
      setAdReady(false);
      onContinue();
    }
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-slate-800 text-white rounded-2xl p-8 text-center shadow-2xl max-w-md mx-auto">
        <h2 className="text-5xl font-bold text-yellow-400 mb-4">Level Up!</h2>
        <p className="text-2xl mb-8">
          Congratulations, you've reached level {level}!
        </p>

        {/* Ad Button Section */}
        {adReady ? (
          <button
            onClick={handleShowAdAndContinue}
            disabled={isLoadingAd}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors w-full mb-4 flex items-center justify-center gap-2"
          >
            <span>🎬</span>
            <span>{isLoadingAd ? "Loading Ad..." : "Watch Ad & Continue"}</span>
          </button>
        ) : (
          <div className="bg-gray-600 text-white font-bold py-4 px-8 rounded-lg text-xl w-full mb-4 flex items-center justify-center gap-2">
            <span>⏳</span>
            <span>Ad ready in {cooldownTime}s</span>
          </div>
        )}

        {/* Skip Button */}
        <button
          onClick={onContinue}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors w-full"
        >
          Skip (Continue Without Ad)
        </button>

        {/* Info Text */}
        <p className="text-xs text-gray-400 mt-4">
          Watching ads helps us keep the game free!
        </p>
      </div>
    </div>
  );
}
