import React, { useEffect } from 'react';

const AdsterraBanner: React.FC = () => {
  useEffect(() => {
    const bannerContainer = document.getElementById('adsterra-banner');
    if (bannerContainer && bannerContainer.children.length === 0) {
      const adScript = document.createElement('script');
      adScript.type = 'text/javascript';
      adScript.innerHTML = `
        atOptions = {
          'key' : 'f881b838f9da39e1633519a531f6d15b',
          'format' : 'iframe',
          'height' : 90,
          'width' : 728,
          'params' : {}
        };
      `;

      const adLoaderScript = document.createElement('script');
      adLoaderScript.type = 'text/javascript';
      adLoaderScript.src = '//www.topcreativeformat.com/f881b838f9da39e1633519a531f6d15b/invoke.js';

      bannerContainer.appendChild(adScript);
      bannerContainer.appendChild(adLoaderScript);
    }
  }, []);

  return <div id="adsterra-banner" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '10px' }} />;
};

export default AdsterraBanner;
