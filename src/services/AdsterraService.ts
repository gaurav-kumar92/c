
// src/services/AdsterraService.ts

export class AdsterraService {
  private static isAdPlaying = false;

  static canShowAd(): boolean {
    return !this.isAdPlaying;
  }

  /**
   * Show Adsterra full-page overlay ad
   */
  static async showAd(onAdComplete?: () => void): Promise<void> {
    if (this.isAdPlaying) {
      console.warn("Ad already playing");
      if (onAdComplete) onAdComplete();
      return;
    }

    this.isAdPlaying = true;

    try {
      if (typeof window === "undefined") {
        console.log("Not in browser, skipping ad");
        if (onAdComplete) onAdComplete();
        return;
      }

      await this.triggerAdsterraOverlayAd();

    } catch (error) {
      console.error("Adsterra ad error:", error);
    } finally {
      this.isAdPlaying = false;
      // Ensure onAdComplete is always called
      if (onAdComplete) {
        onAdComplete();
      }
    }
  }

  /**
   * Trigger Adsterra full-page overlay ad
   */
  private static async triggerAdsterraOverlayAd(): Promise<void> {
    return new Promise((resolve) => {
      const modal = document.createElement("div");
      modal.id = "ad-modal";
      modal.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      `;

      const container = document.createElement("div");
      container.style.cssText = `
        background: #1a1a1a;
        width: 95vw;
        height: 95vh;
        max-width: 1200px;
        max-height: 800px;
        border-radius: 10px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        display: flex;
        flex-direction: column;
      `;
      
      const header = document.createElement("div");
      header.style.cssText = `
        padding: 10px 20px;
        color: white;
        text-align: center;
        font-family: sans-serif;
      `;
      header.innerHTML = `
        <p style="margin: 0; font-size: 14px;">Advertisement</p>
        <p style="margin: 0; font-size: 12px; opacity: 0.7;">This ad will close automatically.</p>
      `;

      const adFrame = document.createElement("iframe");
      adFrame.src = "https://pl28641636.effectivegatecpm.com/";
      adFrame.style.cssText = `
        flex-grow: 1;
        border: none;
        border-bottom-left-radius: 10px;
        border-bottom-right-radius: 10px;
      `;

      container.appendChild(header);
      container.appendChild(adFrame);
      modal.appendChild(container);
      document.body.appendChild(modal);
      
      const AD_DURATION = 5000; // 5 seconds

      // Auto-close after duration
      setTimeout(() => {
        if (modal.parentElement) {
          modal.remove();
        }
        resolve();
      }, AD_DURATION);
    });
  }
}
