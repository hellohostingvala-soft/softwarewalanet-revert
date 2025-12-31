/**
 * Prime Route Guard Component
 * 
 * Wraps Prime user pages to enforce route restrictions.
 * Blocks admin/finance/partner access with premium styling.
 */

import { useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { ShieldX, ArrowLeft, Crown, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// Forbidden routes for Prime role
const FORBIDDEN_ROUTES = [
  '/admin',
  '/super-admin',
  '/master',
  '/master-admin',
  '/finance',
  '/promise-management',
  '/developer',
  '/franchise',
  '/reseller',
  '/influencer',
  '/security-command',
  '/server-manager',
  '/api-manager',
  '/marketing-manager',
  '/seo-manager',
  '/legal-manager',
  '/area-manager',
  '/continent-super-admin',
  '/safe-assist',
  '/assist-manager',
];

interface PrimeRouteGuardProps {
  children: ReactNode;
}

export function PrimeRouteGuard({ children }: PrimeRouteGuardProps) {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isPrime = (userRole as string) === 'prime';
  const currentPath = location.pathname;
  const isForbidden = FORBIDDEN_ROUTES.some(route => currentPath.startsWith(route));

  useEffect(() => {
    if (loading) return;
    
    if (isPrime && isForbidden) {
      toast.error('Access restricted. Premium benefits do not include admin access.');
    }
  }, [isPrime, isForbidden, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950/20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (isPrime && isForbidden) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950/20 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="w-full max-w-md border-amber-500/30 bg-stone-900/80 backdrop-blur-xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center mb-4 relative">
                <ShieldX className="w-10 h-10 text-amber-500" />
                <div className="absolute -top-1 -right-1">
                  <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-stone-900 text-xs">
                    VIP
                  </Badge>
                </div>
              </div>
              <CardTitle className="text-2xl text-amber-100">Premium Access Only</CardTitle>
              <CardDescription className="text-stone-400">
                This administrative area is not available to Prime members.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-stone-800/50 rounded-lg border border-amber-500/20">
                <p className="text-sm text-stone-300">
                  <Crown className="inline w-4 h-4 text-amber-400 mr-1" />
                  Your Prime membership includes premium demos, priority support, and faster SLA — 
                  but not administrative controls.
                </p>
              </div>
              
              <p className="text-sm text-center text-stone-500">
                Attempted: <code className="bg-stone-800 px-2 py-1 rounded text-amber-400">{currentPath}</code>
              </p>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="flex-1 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
                <Button
                  onClick={() => navigate('/prime')}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-900"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Prime Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}

export default PrimeRouteGuard;
