// Wallet Top-Up Page
// /wallet/topup route

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Wallet,
  ArrowLeft,
  CreditCard,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import '../../../styles/premium-7d-theme.css';

const WalletTopUpPage = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'payu' | 'bank' | 'binance'>('payu');
  const [loading, setLoading] = useState(false);

  const handleTopUp = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Process top-up
      // POST /api/wallet/add
      
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Success",
        description: `Successfully added $${amount} to your wallet`,
      });

      navigate('/wallet');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to top up wallet",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [10, 25, 50, 100, 250, 500];

  return (
    <div className="min-h-screen bg-[#0B0F1A] p-6">
      <Button
        variant="ghost"
        className="text-white mb-6"
        onClick={() => navigate('/wallet')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Wallet
      </Button>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Top Up Wallet</h1>

        <Card className="bg-[#1A2236] border border-indigo-500/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Enter Amount
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-[#0B0F1A] border-indigo-500/20 text-white text-2xl h-16"
            />
            <div className="flex flex-wrap gap-2">
              {quickAmounts.map((quickAmount) => (
                <Button
                  key={quickAmount}
                  variant="outline"
                  className="border-indigo-500 text-white hover:bg-indigo-500/10"
                  onClick={() => setAmount(quickAmount.toString())}
                >
                  ${quickAmount}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A2236] border border-indigo-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
              <div className="flex items-center gap-3 p-4 border border-indigo-500/20 rounded-lg mb-2">
                <RadioGroupItem value="payu" id="payu" />
                <Label htmlFor="payu" className="text-white cursor-pointer flex-1">
                  PayU
                </Label>
              </div>
              <div className="flex items-center gap-3 p-4 border border-indigo-500/20 rounded-lg mb-2">
                <RadioGroupItem value="bank" id="bank" />
                <Label htmlFor="bank" className="text-white cursor-pointer flex-1">
                  Bank Transfer
                </Label>
              </div>
              <div className="flex items-center gap-3 p-4 border border-indigo-500/20 rounded-lg">
                <RadioGroupItem value="binance" id="binance" />
                <Label htmlFor="binance" className="text-white cursor-pointer flex-1">
                  Binance
                </Label>
              </div>
            </RadioGroup>

            <Button
              className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 mt-6"
              onClick={handleTopUp}
              disabled={loading}
            >
              {loading ? (
                'Processing...'
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Top Up ${amount || '0'}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WalletTopUpPage;
