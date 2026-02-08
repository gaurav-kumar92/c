
// src/services/AdService.ts

// This declares the existence of a special Android object on the window,
// which will be injected by the native Android app's WebView.

declare global {
  interface Window {
    Android?: {
      showAd: () => void;
    };
  }
}

export class AdService {
  private static isAdInProgress = false;
  private static adCompletionCallback: (() => void) | null = null;

  // This function will be called by the native Android app when the ad is finished.
  static adFinished() {
    if (this.adCompletionCallback) {
      this.adCompletionCallback();
    }
    this.isAdInProgress = false;
    this.adCompletionCallback = null;
  }

  /**
   * Shows an ad. It intelligently decides whether to show a native AdMob ad 
   * (if inside the Android app) or a web-based Adsterra ad.
   */
  static showAd(onAdComplete?: () => void): Promise<void> {
    if (this.isAdInProgress) {
      console.warn("Ad is already in progress.");
      return Promise.resolve();
    }

    this.isAdInProgress = true;
    this.adCompletionCallback = onAdComplete || null;

    try {
      // Check if the Android bridge is available
      if (window.Android && typeof window.Android.showAd === 'function') {
        // --- NATIVE ANDROID APP (ADMOB) --- 
        // The native app will call `AdService.adFinished()` when done.
        console.log("Calling native Android AdMob ad...");
        window.Android.showAd();

      } else {
        // --- STANDARD WEB BROWSER (ADSTERRA) --- 
        console.log("Opening web Adsterra ad...");
        const adUrl = "https://pl28641636.effectivegatecpm.com/";
        window.open(adUrl, '_blank');

        // For web, we can't reliably know when the ad is done,
        // so we call the completion callback immediately.
        this.adFinished(); 
      }

    } catch (error) {
      console.error("Ad service error:", error);
      this.adFinished(); // Ensure we always clean up
    }
    
    return Promise.resolve();
  }
}

// Make the adFinished function globally accessible so the Android app can call it.
if (typeof window !== 'undefined') {
  (window as any).AdService = AdService;
}
