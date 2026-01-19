import React, { useState, useEffect } from 'react';
import { getPlatform } from '@/lib/platform';
import AdSense from './AdSense';
import AdMob from './AdMob';

const AdContainer: React.FC = () => {
  const [platform, setPlatform] = useState<'web' | 'mobile' | null>(null);

  useEffect(() => {
    setPlatform(getPlatform());
  }, []);

  if (platform === 'web') {
    return <AdSense />;
  }

  if (platform === 'mobile') {
    return <AdMob />;
  }

  return null; // Don't render anything if platform is not determined yet
};

export default AdContainer;
