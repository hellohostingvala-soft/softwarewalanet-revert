// Franchise Wallet
// Balance + ledger + credit/debit on sales/payout

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Wallet,
  ArrowUp,
  ArrowDown,
  Download,
  Plus,
  Minus,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import '../../../styles/premium-7d-theme.css';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  orderId?: string;
  timestamp: Date;
  balance: number;
}

const FranchiseWallet = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBalance(12450);
      setTransactions([
        {
          id: '1',
          type: 'credit',
          amount: 99,
          description: 'Order payment received',
          orderId: 'ORD-2024-001',
          timestamp: new Date('2024-01-15'),
          balance: 12450,
        },
        {
          id: '2',
          type: 'debit',
          amount: 500,
          description: 'Payout withdrawn',
          timestamp: new Date('2024-01-14'),
          balance: 12351,
        },
        {
          id: '3',
          type: 'credit',
          amount: 149,
          description: 'Order payment received',
          orderId: 'ORD-2024-002',
          timestamp: new Date('2024-01-13'),
          balance: 11851,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Wallet</h1>
        <p className="text-gray-400">Balance and transaction history</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 border-indigo-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">${balance.toLocaleString()}</p>
            <p className="text-sm text-gray-400 mt-2 flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              +15% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1A2236] border border-indigo-500/20">
          <CardHeader>
            <CardTitle className="text-white">Total Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-500">$8,450</p>
            <p className="text-sm text-gray-400">From sales</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1A2236] border border-indigo-500/20">
          <CardHeader>
            <CardTitle className="text-white">Total Debits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-500">$4,000</p>
            <p className="text-sm text-gray-400">Payouts</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 mb-6">
        <Button className="bg-gradient-to-r from-indigo-500 to-cyan-500">
          <Plus className="w-4 h-4 mr-2" />
          Add Funds
        </Button>
        <Button variant="outline" className="border-indigo-500 text-white hover:bg-indigo-500/10">
          <Minus className="w-4 h-4 mr-2" />
          Withdraw
        </Button>
        <Button variant="outline" className="border-indigo-500 text-white hover:bg-indigo-500/10">
          <Download className="w-4 h-4 mr-2" />
          Download Statement
        </Button>
      </div>

      <Card className="bg-[#1A2236] border border-indigo-500/20">
        <CardHeader>
          <CardTitle className="text-white">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((txn) => (
              <motion.div
                key={txn.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border border-indigo-500/20 rounded-lg flex items-center justify-between hover:bg-indigo-500/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${txn.type === 'credit' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                    {txn.type === 'credit' ? (
                      <ArrowDown className="w-5 h-5 text-green-500" />
                    ) : (
                      <ArrowUp className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-white">{txn.description}</p>
                    <p className="text-sm text-gray-400">{txn.timestamp.toLocaleString()}</p>
                    {txn.orderId && <p className="text-xs text-gray-500">{txn.orderId}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-bold ${txn.type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>
                    {txn.type === 'credit' ? '+' : '-'}${txn.amount}
                  </p>
                  <p className="text-sm text-gray-400">Balance: ${txn.balance}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FranchiseWallet;
