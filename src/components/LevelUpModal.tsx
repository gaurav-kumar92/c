'use client';

// src/components/LevelUpModal.tsx
import { useState } from "react";
import { AdService } from "@/services/AdService";

interface LevelUpModalProps {
  onContinue: () => void;
  level: number;
}

export function LevelUpModal({ onContinue, level }: LevelUpModalProps) {
  const [isLoadingAd, setIsLoadingAd] = useState(false);

  const handleShowAdAndContinue = () => {
    if (isLoadingAd) return;

    setIsLoadingAd(true);

    const afterAdCallback = () => {
      setIsLoadingAd(false);
      onContinue();
    };

    AdService.showAd(afterAdCallback);
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-slate-800 text-white rounded-2xl p-8 text-center shadow-2xl max-w-md mx-auto">
        <h2 className="text-5xl font-bold text-yellow-400 mb-4">Level Up!</h2>
        <p className="text-2xl mb-8">
          Congratulations, you've reached level {level}!
        </p>

        {/* Ad Button Section */}
        <button
          onClick={handleShowAdAndContinue}
          disabled={isLoadingAd}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors w-full mb-4 flex items-center justify-center gap-2"
        >
          <span>🎬</span>
          <span>{isLoadingAd ? "Loading Ad..." : "Watch Ad & Continue"}</span>
        </button>

        {/* Info Text */}
        <p className="text-xs text-gray-400 mt-4">
          Watching ads helps us keep the game free!
        </p>
      </div>
    </div>
  );
}
