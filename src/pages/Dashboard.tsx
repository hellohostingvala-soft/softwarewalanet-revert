import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

// Strict role-to-dashboard mapping - each role goes to its OWN dashboard only
const ROLE_DASHBOARD_MAP: Record<string, string> = {
  super_admin: '/super-admin',
  admin: '/super-admin',
  developer: '/developer',
  franchise: '/franchise',
  reseller: '/reseller',
  influencer: '/influencer',
  prime: '/prime',
  client: '/prime',
  lead_manager: '/lead-manager',
  task_manager: '/task-manager',
  support: '/support',
  seo_manager: '/seo',
  finance_manager: '/finance',
  hr_manager: '/hr',
  legal_compliance: '/legal',
  marketing_manager: '/marketing',
  client_success: '/client-success',
  rnd_manager: '/rnd-dashboard',
  r_and_d: '/rnd-dashboard',
  performance_manager: '/performance',
  demo_manager: '/demo-manager',
  ai_manager: '/ai-console',
  api_security: '/api-integrations',
};

/**
 * Role-Based Dashboard Router
 * Strictly redirects users to their OWN dashboard based on their role
 * NO cross-role redirects allowed
 */
const Dashboard = () => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const hasNavigated = useRef(false);
  const [status, setStatus] = useState<'loading' | 'fetching-role' | 'redirecting'>('loading');

  useEffect(() => {
    // Prevent multiple navigations
    if (hasNavigated.current) return;

    // Wait for auth to finish loading
    if (loading) {
      setStatus('loading');
      return;
    }

    // If no user, redirect to login
    if (!user) {
      hasNavigated.current = true;
      navigate('/auth', { replace: true });
      return;
    }

    // If role is available, redirect immediately to the correct dashboard
    if (userRole) {
      const targetRoute = ROLE_DASHBOARD_MAP[userRole];
      
      if (targetRoute) {
        console.log(`[Dashboard Router] Role: ${userRole} → Redirecting to: ${targetRoute}`);
        setStatus('redirecting');
        hasNavigated.current = true;
        navigate(targetRoute, { replace: true });
      } else {
        console.warn(`[Dashboard Router] Unknown role: ${userRole} → Access denied`);
        hasNavigated.current = true;
        navigate('/access-denied', { replace: true });
      }
      return;
    }

    // Role not yet loaded - wait with timeout
    setStatus('fetching-role');
    const timeoutId = setTimeout(() => {
      if (!hasNavigated.current) {
        console.warn('[Dashboard Router] Role fetch timeout → Access denied');
        hasNavigated.current = true;
        navigate('/access-denied', { replace: true });
      }
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [user, userRole, loading, navigate]);

  // Reset navigation flag when user changes (logout/login cycle)
  useEffect(() => {
    hasNavigated.current = false;
  }, [user?.id]);

  const getStatusMessage = () => {
    switch (status) {
      case 'loading':
        return 'Authenticating...';
      case 'fetching-role':
        return 'Fetching your role...';
      case 'redirecting':
        return `Redirecting to ${userRole?.replace(/_/g, ' ')} dashboard...`;
      default:
        return 'Please wait...';
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
        <div>
          <h2 className="text-xl font-semibold text-foreground">Loading Dashboard</h2>
          <p className="text-muted-foreground mt-1">{getStatusMessage()}</p>
          {userRole && (
            <p className="text-xs text-muted-foreground/70 mt-2">
              Role detected: {userRole}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
