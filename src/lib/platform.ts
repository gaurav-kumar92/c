export const getPlatform = (): 'web' | 'mobile' => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /android|iphone|ipad|ipod|windows phone/i.test(userAgent);
  const isWebView = /wv/.test(userAgent); // Common flag for Android WebView

  // Check for Capacitor/Cordova environments
  if ((window as any).Capacitor?.isNativePlatform() || (window as any).cordova) {
      return 'mobile';
  }

  // Fallback for other WebViews
  if (isMobile && isWebView) {
      return 'mobile';
  }

  return 'web';
};

declare global {
  interface Window {
      Capacitor?: {
          isNativePlatform(): boolean;
      };
      cordova?: {};
  }
}
