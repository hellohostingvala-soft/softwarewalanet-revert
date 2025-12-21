import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Shield, AlertTriangle, Send, CheckCircle } from 'lucide-react';
import { useFraudDetection } from '@/hooks/useFraudDetection';
import { toast } from 'sonner';

export function SuspensionNotice() {
  const { isSuspended, suspensionInfo, submitAppeal } = useFraudDetection();
  const [appealText, setAppealText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appealSubmitted, setAppealSubmitted] = useState(false);

  if (!isSuspended) return null;

  const handleSubmitAppeal = async () => {
    if (!appealText.trim()) {
      toast.error('Please provide details for your appeal');
      return;
    }

    setIsSubmitting(true);
    const success = await submitAppeal(appealText);
    setIsSubmitting(false);

    if (success) {
      setAppealSubmitted(true);
      toast.success('Appeal submitted successfully');
    } else {
      toast.error('Failed to submit appeal');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <Card className="max-w-lg w-full border-red-500/50">
        <CardContent className="p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center"
          >
            <Shield className="h-10 w-10 text-red-500" />
          </motion.div>

          <h2 className="text-2xl font-bold mb-2">Account Temporarily Suspended</h2>
          <p className="text-muted-foreground mb-6">
            {suspensionInfo?.reason || 'Your account has been suspended for security review.'}
          </p>

          <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">What does this mean?</p>
                <p className="text-muted-foreground mt-1">
                  Our security system detected unusual activity on your account. 
                  This is a precautionary measure to protect your data and funds.
                </p>
              </div>
            </div>
          </div>

          {suspensionInfo?.canAppeal && !appealSubmitted ? (
            <div className="space-y-4">
              <Textarea
                placeholder="Explain why you believe this suspension is incorrect..."
                value={appealText}
                onChange={(e) => setAppealText(e.target.value)}
                rows={4}
                className="text-left"
              />
              <Button 
                onClick={handleSubmitAppeal} 
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  'Submitting...'
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" /> Submit Appeal
                  </>
                )}
              </Button>
            </div>
          ) : appealSubmitted ? (
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="font-medium text-green-400">Appeal Submitted</p>
              <p className="text-sm text-muted-foreground mt-1">
                We'll review your appeal within 24-48 hours
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              You have already submitted an appeal. Please wait for our team to review it.
            </p>
          )}

          <p className="text-xs text-muted-foreground mt-6">
            Need immediate help? Contact support@softwarevala.com
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
