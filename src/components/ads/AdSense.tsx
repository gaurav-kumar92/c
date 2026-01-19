import React, { useEffect, useRef } from 'react';

const AdSense: React.FC = () => {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    // We only want to push the ad if the ad slot is empty.
    // React's Strict Mode in development can cause this effect to run twice.
    if (adRef.current && adRef.current.children.length === 0) {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }
  }, []);

  return (
    <ins
      ref={adRef}
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client="ca-pub-9788212864829344"
      data-ad-slot="5125839099" // IMPORTANT: Replace with your AdSense Ad Unit ID
      data-ad-format="auto"
      data-full-width-responsive="true"
    ></ins>
  );
};

export default AdSense;
