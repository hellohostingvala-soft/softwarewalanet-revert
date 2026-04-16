// Checkout Page
// /checkout/:productId route with wallet integration

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  Wallet,
  CreditCard,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import '../../../styles/premium-7d-theme.css';

const CheckoutPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'payu' | 'bank' | 'binance'>('wallet');
  const [walletBalance, setWalletBalance] = useState(0);
  const [useWallet, setUseWallet] = useState(true);

  useEffect(() => {
    loadCheckoutData();
  }, [productId]);

  const loadCheckoutData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProduct({
        id: '1',
        name: 'CRM Pro',
        price: 99,
      });
      setWalletBalance(500);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (useWallet && walletBalance < product.price) {
      toast({
        title: "Insufficient Balance",
        description: "Please top up your wallet or use another payment method",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create order
      // POST /api/order/create
      // payment_method = wallet/payu/bank/binance
      
      toast({
        title: "Order Created",
        description: "Your order has been created successfully",
      });
      navigate('/orders');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] p-6">
      <Button
        variant="ghost"
        className="text-white mb-6"
        onClick={() => navigate(`/product/${product.slug}`)}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Product
      </Button>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-[#1A2236] border border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">{product.name}</span>
                <span className="text-white font-bold">${product.price}</span>
              </div>
              <div className="border-t border-indigo-500/20 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total</span>
                  <span className="text-white font-bold text-xl">${product.price}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1A2236] border border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white">Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4 p-4 border border-indigo-500/20 rounded-lg bg-indigo-500/5">
                <Wallet className="w-5 h-5 text-indigo-500" />
                <div className="flex-1">
                  <p className="text-white font-medium">Wallet Balance</p>
                  <p className="text-gray-400 text-sm">${walletBalance.toFixed(2)}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-indigo-500 text-white hover:bg-indigo-500/10"
                  onClick={() => navigate('/wallet/topup')}
                >
                  Top Up
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="use-wallet"
                  checked={useWallet}
                  onChange={(e) => setUseWallet(e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="use-wallet" className="text-white cursor-pointer">
                  Use Wallet Balance
                </Label>
              </div>

              <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                <div className="flex items-center gap-3 p-4 border border-indigo-500/20 rounded-lg">
                  <RadioGroupItem value="wallet" id="wallet" />
                  <Label htmlFor="wallet" className="text-white cursor-pointer flex-1">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4" />
                      Wallet
                    </div>
                  </Label>
                </div>
                <div className="flex items-center gap-3 p-4 border border-indigo-500/20 rounded-lg">
                  <RadioGroupItem value="payu" id="payu" />
                  <Label htmlFor="payu" className="text-white cursor-pointer flex-1">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      PayU
                    </div>
                  </Label>
                </div>
                <div className="flex items-center gap-3 p-4 border border-indigo-500/20 rounded-lg">
                  <RadioGroupItem value="bank" id="bank" />
                  <Label htmlFor="bank" className="text-white cursor-pointer flex-1">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Bank Transfer
                    </div>
                  </Label>
                </div>
                <div className="flex items-center gap-3 p-4 border border-indigo-500/20 rounded-lg">
                  <RadioGroupItem value="binance" id="binance" />
                  <Label htmlFor="binance" className="text-white cursor-pointer flex-1">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Binance
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              <Button
                className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500"
                onClick={handleCheckout}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
