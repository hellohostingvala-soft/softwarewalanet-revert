import React, { useState } from 'react';
import { MMFullSidebar } from './MMFullSidebar';
import { MMDashboardScreen } from './screens/MMDashboardScreen';
import { MMProductManagementScreen } from './screens/MMProductManagementScreen';
import { MMDemoManagementScreen } from './screens/MMDemoManagementScreen';
import { MMOrdersScreen } from './screens/MMOrdersScreen';
import { MMWalletScreen } from './screens/MMWalletScreen';
import { MMDevelopmentScreen } from './screens/MMDevelopmentScreen';
import { MMSupportScreen } from './screens/MMSupportScreen';
import { MMSettingsScreen } from './screens/MMSettingsScreen';
import { Card, CardContent } from '@/components/ui/card';
import { Cpu, Sparkles, Brain, Wand2, Bug, LayoutGrid, Activity, MousePointer, ShieldCheck, Eye, Tag, Search, BarChart3, Globe, Ticket, AlertTriangle, CreditCard, MessageSquare, Percent, Receipt, MapPin, Lock, FileCheck, Milestone } from 'lucide-react';

export function MMFullLayout() {
  const [activeScreen, setActiveScreen] = useState('overview');

  const renderScreen = () => {
    // Dashboard screens
    if (['overview', 'live-metrics', 'ai-insights', 'marketplace-health'].includes(activeScreen)) {
      return <MMDashboardScreen subScreen={activeScreen} />;
    }
    
    // Product Management screens
    if (['all-products', 'add-product', 'product-drafts', 'pending-approval', 'approved-products', 'rejected-products', 'product-versioning', 'product-status'].includes(activeScreen)) {
      return <MMProductManagementScreen subScreen={activeScreen} />;
    }
    
    // Demo Management screens
    if (['all-demos', 'demo-builder', 'demo-completion', 'demo-upgrade', 'demo-bugs', 'demo-approval'].includes(activeScreen)) {
      return <MMDemoManagementScreen subScreen={activeScreen} />;
    }
    
    // VALA AI screens
    if (['ai-prompt-manager', 'ai-demo-generator', 'ai-feature-suggestion', 'ai-bug-detection', 'ai-ui-completion', 'ai-flow-validation', 'ai-button-testing', 'ai-compliance'].includes(activeScreen)) {
      return <ValaAIScreen subScreen={activeScreen} />;
    }
    
    // Orders screens
    if (['all-orders', 'pending-orders', 'active-subscriptions', 'expired-subscriptions', 'upgrade-requests', 'renewal-queue'].includes(activeScreen)) {
      return <MMOrdersScreen />;
    }
    
    // Wallet screens
    if (['wallet-balance', 'add-money', 'transaction-history', 'platform-charges', 'developer-payouts', 'refund-processing'].includes(activeScreen)) {
      return <MMWalletScreen />;
    }
    
    // Development pipeline
    if (['in-development', 'assigned-developers', 'milestone-tracker', 'approval-gate', 'delivery-status'].includes(activeScreen)) {
      return <MMDevelopmentScreen />;
    }
    
    // Marketplace visibility
    if (['public-marketplace', 'category-management', 'subcategory', 'micro-category', 'seo-control', 'product-ranking'].includes(activeScreen)) {
      return <MarketplaceVisibilityScreen subScreen={activeScreen} />;
    }
    
    // Support screens
    if (['marketplace-tickets', 'product-issues', 'demo-issues', 'payment-issues', 'ai-support'].includes(activeScreen)) {
      return activeScreen === 'ai-support' ? <MMSupportScreen /> : <SupportScreen subScreen={activeScreen} />;
    }
    
    // Settings
    if (['marketplace-rules', 'commission-engine', 'tax-rules', 'country-availability', 'legal-compliance', 'lock-system'].includes(activeScreen)) {
      return <MMSettingsScreen />;
    }

    return <MMDashboardScreen subScreen="overview" />;
  };

  return (
    <div className="flex h-screen bg-slate-950 text-white">
      <MMFullSidebar activeScreen={activeScreen} onScreenChange={setActiveScreen} />
      <main className="flex-1 overflow-auto">{renderScreen()}</main>
    </div>
  );
}

// VALA AI Dashboard placeholder
function ValaAIScreen({ subScreen }: { subScreen: string }) {
  const aiFeatures = {
    'ai-prompt-manager': { title: 'AI Prompt Manager', icon: MessageSquare, desc: 'Manage AI prompts and templates' },
    'ai-demo-generator': { title: 'AI Demo Generator', icon: Wand2, desc: 'Generate demos automatically' },
    'ai-feature-suggestion': { title: 'AI Feature Suggestion', icon: Brain, desc: 'AI-powered feature recommendations' },
    'ai-bug-detection': { title: 'AI Bug Detection', icon: Bug, desc: 'Automatic bug detection and fixes' },
    'ai-ui-completion': { title: 'AI UI Completion', icon: LayoutGrid, desc: 'Complete UI components with AI' },
    'ai-flow-validation': { title: 'AI Flow Validation', icon: Activity, desc: 'Validate user flows automatically' },
    'ai-button-testing': { title: 'AI Button Testing', icon: MousePointer, desc: 'Auto-test all buttons' },
    'ai-compliance': { title: 'AI Compliance Checker', icon: ShieldCheck, desc: 'Check compliance automatically' },
  };

  const feature = aiFeatures[subScreen as keyof typeof aiFeatures] || aiFeatures['ai-prompt-manager'];
  const Icon = feature.icon;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Cpu className="h-6 w-6 text-purple-400" />
          VALA AI Dashboard
          <span className="ml-2 px-2 py-1 text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 rounded text-white">CORE POWER</span>
        </h1>
        <p className="text-slate-400 mt-1">AI-powered marketplace automation</p>
      </div>

      <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30">
        <CardContent className="p-8 text-center">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-4">
            <Icon className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{feature.title}</h2>
          <p className="text-slate-400 mb-6">{feature.desc}</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-400 text-sm">
            <Sparkles className="h-4 w-4" />
            AI System Active & Ready
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Marketplace Visibility placeholder
function MarketplaceVisibilityScreen({ subScreen }: { subScreen: string }) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Eye className="h-6 w-6 text-purple-400" />
          Marketplace Visibility
        </h1>
        <p className="text-slate-400 mt-1">Control product visibility and SEO</p>
      </div>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6 text-center text-slate-400">
          <Globe className="h-12 w-12 mx-auto mb-3 text-slate-500" />
          {subScreen.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} management interface
        </CardContent>
      </Card>
    </div>
  );
}

// Support placeholder
function SupportScreen({ subScreen }: { subScreen: string }) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Ticket className="h-6 w-6 text-purple-400" />
          Support & Issues
        </h1>
        <p className="text-slate-400 mt-1">Handle marketplace support tickets</p>
      </div>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6 text-center text-slate-400">
          <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-slate-500" />
          {subScreen.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} interface
        </CardContent>
      </Card>
    </div>
  );
}
