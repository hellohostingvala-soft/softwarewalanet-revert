import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, LogOut, Eye, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

const PendingApproval = () => {
  const navigate = useNavigate();
  const { user, signOut, userRole, approvalStatus } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/auth', { replace: true });
    }
    // If already approved, redirect to dashboard
    if (approvalStatus === 'approved') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, approvalStatus, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/auth', { replace: true });
  };

  const handleBrowseDemos = () => {
    navigate('/demos/public');
  };

  const handleExploreFeatures = () => {
    navigate('/explore');
  };

  // Show approved state briefly before redirect
  if (approvalStatus === 'approved') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-green-500/5 p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground">Account Approved!</h2>
          <p className="text-muted-foreground mt-2">Redirecting to your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-amber-500/5 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-amber-500/30 bg-card/80 backdrop-blur-xl">
          <CardHeader className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4"
            >
              <Clock className="w-8 h-8 text-amber-500" />
            </motion.div>
            <CardTitle className="text-xl">Account Pending Approval</CardTitle>
            <CardDescription>
              Your account is being reviewed. You can explore our features while you wait!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Role requested:</span>{' '}
                <span className="capitalize">{userRole?.replace(/_/g, ' ') || 'Pending'}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                An admin will review your request soon
              </p>
            </div>

            <div className="bg-gradient-to-r from-teal-500/10 to-blue-500/10 rounded-lg p-4 border border-teal-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span className="text-sm font-medium text-foreground">While you wait</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Feel free to explore demos and features. You'll get full access once approved.
              </p>
            </div>

            <Button variant="default" className="w-full" onClick={handleBrowseDemos}>
              <Eye className="w-4 h-4 mr-2" />
              Browse Public Demos
            </Button>

            <Button variant="secondary" className="w-full" onClick={handleExploreFeatures}>
              <Sparkles className="w-4 h-4 mr-2" />
              Explore Features
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <Button variant="ghost" className="w-full text-muted-foreground" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PendingApproval;