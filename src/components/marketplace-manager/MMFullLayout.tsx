import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MMFullSidebar } from './MMFullSidebar';
import { MMMarketplaceScreen } from './screens/MMMarketplaceScreen';
import { MMOrdersScreen } from './screens/MMOrdersScreen';
import { MMDevelopmentScreen } from './screens/MMDevelopmentScreen';
import { MMWalletScreen } from './screens/MMWalletScreen';
import { MMSupportScreen } from './screens/MMSupportScreen';
import { MMSettingsScreen } from './screens/MMSettingsScreen';

type MarketplaceScreen = 'marketplace' | 'my-orders' | 'development' | 'wallet' | 'support' | 'settings';

const SCREEN_PATHS: Record<MarketplaceScreen, string> = {
  marketplace: '',
  'my-orders': 'orders',
  development: 'development',
  wallet: 'wallet',
  support: 'support',
  settings: 'settings',
};

const getScreenFromPath = (pathname: string): MarketplaceScreen => {
  if (pathname.startsWith('/user/orders')) return 'my-orders';
  if (pathname.startsWith('/user/library')) return 'marketplace';

  if (pathname.includes('/orders')) return 'my-orders';
  if (pathname.includes('/development')) return 'development';
  if (pathname.includes('/wallet')) return 'wallet';
  if (pathname.includes('/support')) return 'support';
  if (pathname.includes('/settings')) return 'settings';

  return 'marketplace';
};

export function MMFullLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeScreen, setActiveScreen] = useState<MarketplaceScreen>('marketplace');

  useEffect(() => {
    const nextScreen = getScreenFromPath(location.pathname);
    setActiveScreen((prev) => (prev === nextScreen ? prev : nextScreen));
  }, [location.pathname]);

  const handleScreenChange = (screen: MarketplaceScreen) => {
    setActiveScreen(screen);

    const suffix = SCREEN_PATHS[screen];
    navigate(suffix ? `/marketplace/${suffix}` : '/marketplace');
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'marketplace':
        return <MMMarketplaceScreen />;
      case 'my-orders':
        return <MMOrdersScreen />;
      case 'development':
        return <MMDevelopmentScreen />;
      case 'wallet':
        return <MMWalletScreen />;
      case 'support':
        return <MMSupportScreen />;
      case 'settings':
        return <MMSettingsScreen />;
      default:
        return <MMMarketplaceScreen />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-white">
      <MMFullSidebar activeScreen={activeScreen} onScreenChange={handleScreenChange} />
      <main className="flex-1 overflow-auto">{renderScreen()}</main>
    </div>
  );
}

