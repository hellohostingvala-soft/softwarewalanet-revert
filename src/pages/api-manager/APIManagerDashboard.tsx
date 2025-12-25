import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, KeyRound, Zap, Activity, Brain, Settings,
  Monitor, FileText, BarChart3, Shield, LogOut, Lock, Ban
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSecurityEnforcement } from '@/hooks/useSecurityEnforcement';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import APIOverview from './screens/APIOverview';
import APIKeys from './screens/APIKeys';
import APIIntegrations from './screens/APIIntegrations';
import APIRateLimits from './screens/APIRateLimits';
import AIModels from './screens/AIModels';
import AutomationRules from './screens/AutomationRules';
import APIMonitoring from './screens/APIMonitoring';
import APILogs from './screens/APILogs';
import APIReports from './screens/APIReports';
import APIAudit from './screens/APIAudit';

const SIDEBAR_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'keys', label: 'API Keys', icon: KeyRound },
  { id: 'integrations', label: 'Integrations', icon: Zap },
  { id: 'limits', label: 'Rate Limits', icon: Activity },
  { id: 'models', label: 'AI Models', icon: Brain },
  { id: 'automation', label: 'Automation Rules', icon: Settings },
  { id: 'monitoring', label: 'Monitoring', icon: Monitor },
  { id: 'logs', label: 'Logs', icon: FileText },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'audit', label: 'Audit', icon: Shield },
];

const APIManagerDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeScreen, setActiveScreen] = useState('overview');
  const [systemHealth, setSystemHealth] = useState<'Stable' | 'Warning' | 'Critical'>('Stable');

  // Enforce security
  useSecurityEnforcement();

  // Parse screen from URL
  useEffect(() => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    if (pathParts.length > 1) {
      setActiveScreen(pathParts[1]);
    } else {
      setActiveScreen('overview');
    }
  }, [location.pathname]);

  const handleNavigation = (screenId: string) => {
    setActiveScreen(screenId);
    navigate(`/api-manager/${screenId === 'overview' ? '' : screenId}`);
  };

  const handleSecureLogout = async () => {
    try {
      await supabase.from('audit_logs').insert({
        action: 'secure_logout',
        module: 'api_manager',
        meta_json: { screen: activeScreen }
      });
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'overview': return <APIOverview />;
      case 'keys': return <APIKeys />;
      case 'integrations': return <APIIntegrations />;
      case 'limits': return <APIRateLimits />;
      case 'models': return <AIModels />;
      case 'automation': return <AutomationRules />;
      case 'monitoring': return <APIMonitoring />;
      case 'logs': return <APILogs />;
      case 'reports': return <APIReports />;
      case 'audit': return <APIAudit />;
      default: return <APIOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Fixed Left Sidebar */}
      <aside className="w-64 border-r border-border/50 bg-sidebar flex flex-col">
        {/* Logo/Title */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-400" />
            <span className="font-bold text-foreground">API / AI Manager</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : ''}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Security Info */}
        <div className="p-4 border-t border-border/50 space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span>Keys Masked</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Ban className="h-3 w-3" />
            <span>No Export</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-14 border-b border-border/50 bg-card/50 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-foreground">API / AI Manager — Control Center</h1>
          </div>
          <div className="flex items-center gap-4">
            {/* System Health */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">System Health:</span>
              <Badge variant={
                systemHealth === 'Stable' ? 'default' :
                systemHealth === 'Warning' ? 'secondary' : 'destructive'
              } className={
                systemHealth === 'Stable' ? 'bg-green-500/20 text-green-400' :
                systemHealth === 'Warning' ? 'bg-yellow-500/20 text-yellow-400' : ''
              }>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  systemHealth === 'Stable' ? 'bg-green-400' :
                  systemHealth === 'Warning' ? 'bg-yellow-400' : 'bg-red-400'
                } animate-pulse`} />
                {systemHealth}
              </Badge>
            </div>

            {/* Secure Logout */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSecureLogout}
              className="text-red-400 border-red-400/50 hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Secure Logout
            </Button>
          </div>
        </header>

        {/* Screen Content */}
        <main className="flex-1 overflow-auto p-6">
          {renderScreen()}
        </main>
      </div>
    </div>
  );
};

export default APIManagerDashboard;
