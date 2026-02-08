
// src/services/AdsterraService.ts

export class AdsterraService {
  private static readonly AD_COOLDOWN_MS = 30000; // 30 seconds between ads
  private static lastAdTime = 0;
  private static isAdPlaying = false;

  static canShowAd(): boolean {
    const timeSinceLastAd = Date.now() - this.lastAdTime;
    return !this.isAdPlaying && timeSinceLastAd >= this.AD_COOLDOWN_MS;
  }

  static getTimeUntilNextAd(): number {
    const timeLeft = this.AD_COOLDOWN_MS - (Date.now() - this.lastAdTime);
    return Math.max(0, Math.ceil(timeLeft / 1000));
  }

  /**
   * Show Adsterra banner ad
   */
  static async showAd(onAdComplete?: () => void): Promise<void> {
    if (this.isAdPlaying) {
      console.warn("Ad already playing");
      return;
    }

    if (!this.canShowAd()) {
      console.warn(
        `Ad cooldown active. Wait ${this.getTimeUntilNextAd()} more seconds`
      );
      return;
    }

    this.isAdPlaying = true;
    this.lastAdTime = Date.now();

    try {
      // Check if running in browser
      if (typeof window === "undefined") {
        console.log("Not in browser, skipping ad");
        if (onAdComplete) onAdComplete();
        return;
      }

      // Trigger Adsterra banner ad
      await this.triggerAdsterraBannerAd();

      // Wait for ad to complete
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (onAdComplete) {
        onAdComplete();
      }
    } catch (error) {
      console.error("Adsterra ad error:", error);
      // Still mark as complete to allow game to continue
      if (onAdComplete) {
        onAdComplete();
      }
    } finally {
      this.isAdPlaying = false;
    }
  }

  /**
   * Trigger Adsterra banner ad
   * This injects a banner ad into the page
   */
  private static async triggerAdsterraBannerAd(): Promise<void> {
    try {
      // Method: Inject banner ad script
      const bannerContainer = document.createElement("div");
      bannerContainer.id = "adsterra-banner-container";
      document.body.appendChild(bannerContainer);

      const adScript = document.createElement("script");
      adScript.type = "text/javascript";
      adScript.innerHTML = `
        atOptions = {
          'key' : 'f881b838f9da39e1633519a531f6d15b',
          'format' : 'iframe',
          'height' : 90,
          'width' : 728,
          'params' : {}
        };
      `;
      bannerContainer.appendChild(adScript);

      const adLoaderScript = document.createElement("script");
      adLoaderScript.type = "text/javascript";
      adLoaderScript.src =
        "//www.topcreativeformat.com/f881b838f9da39e1633519a531f6d15b/invoke.js";
      bannerContainer.appendChild(adLoaderScript);
    } catch (error) {
      console.error("Error creating Adsterra banner ad:", error);
      throw error;
    }
  }

  /**
   * Show mock ad for testing (fallback if Adsterra unavailable)
   */
  static async showMockAd(): Promise<void> {
    return new Promise((resolve) => {
      if (typeof document === "undefined") {
        resolve();
        return;
      }

      const modal = document.createElement("div");
      modal.id = "mock-ad-modal";
      modal.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.85);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      `;

      const container = document.createElement("div");
      container.style.cssText = `
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 20px;
        padding: 32px;
        max-width: 400px;
        text-align: center;
        color: white;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      `;

      const title = document.createElement("h2");
      title.textContent = "Advertisement";
      title.style.cssText = `
        font-size: 24px;
        margin: 0 0 20px 0;
        font-weight: bold;
      `;

      const adContent = document.createElement("div");
      adContent.innerHTML = `
        <div style="background: white; color: #333; padding: 40px 20px; border-radius: 12px; margin-bottom: 15px; font-size: 40px;">
          🎮
        </div>
        <h3 style="font-size: 18px; margin: 15px 0; font-weight: bold;">Download Amazing Game</h3>
        <p style="margin: 10px 0; font-size: 14px;">Get rewards and play awesome games!</p>
        <p style="font-size: 12px; opacity: 0.8; margin-top: 20px;">Ad closes in <span id="ad-countdown">3</span> seconds...</p>
      `;

      const closeBtn = document.createElement("button");
      closeBtn.textContent = "Close Ad";
      closeBtn.style.cssText = `
        background: white;
        color: #667eea;
        border: none;
        padding: 12px 32px;
        border-radius: 8px;
        font-weight: bold;
        cursor: pointer;
        font-size: 16px;
        margin-top: 20px;
        width: 100%;
        transition: all 0.2s;
      `;

      closeBtn.onmouseover = () => {
        closeBtn.style.backgroundColor = "#f0f0f0";
      };
      closeBtn.onmouseout = () => {
        closeBtn.style.backgroundColor = "white";
      };

      closeBtn.onclick = () => {
        if (modal.parentElement) {
          modal.remove();
        }
        resolve();
      };

      container.appendChild(title);
      container.appendChild(adContent);
      container.appendChild(closeBtn);
      modal.appendChild(container);
      document.body.appendChild(modal);

      // Auto-close after 3 seconds
      let secondsLeft = 3;
      const countdownEl = document.getElementById("ad-countdown");

      const interval = setInterval(() => {
        secondsLeft--;
        if (countdownEl) {
          countdownEl.textContent = secondsLeft.toString();
        }

        if (secondsLeft <= 0) {
          clearInterval(interval);
          if (modal.parentElement) {
            modal.remove();
          }
          resolve();
        }
      }, 1000);
    });
  }
}
