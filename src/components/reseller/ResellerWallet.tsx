import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ArrowUpRight, ArrowDownLeft, Clock, Download, TrendingUp, Gift, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';

const transactions = [
  { id: 1, type: 'credit', description: 'Commission - POS System Sale', amount: '+₹7,500', date: '2 hours ago', status: 'completed' },
  { id: 2, type: 'credit', description: 'Referral Bonus', amount: '+₹2,000', date: '1 day ago', status: 'completed' },
  { id: 3, type: 'debit', description: 'Withdrawal to Bank', amount: '-₹50,000', date: '3 days ago', status: 'completed' },
  { id: 4, type: 'credit', description: 'Commission - School ERP', amount: '+₹12,000', date: '5 days ago', status: 'pending' },
];

const payoutSchedule = [
  { period: 'This Week', amount: '₹19,500', status: 'processing' },
  { period: 'Next Week', amount: '₹12,000', status: 'pending' },
  { period: 'Month End Bonus', amount: '₹5,000', status: 'eligible' },
];

export const ResellerWallet = () => {
  const [withdrawAmount, setWithdrawAmount] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-mono font-bold text-foreground">Wallet & Commission</h2>
          <p className="text-sm text-muted-foreground">Track earnings and withdraw funds</p>
        </div>
        <Button variant="outline" className="border-neon-blue/30">
          <Download className="w-4 h-4 mr-2" />
          Download Statement
        </Button>
      </div>

      {/* Balance Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="glass-panel border-border/30 bg-gradient-to-br from-neon-blue/10 to-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Wallet className="w-6 h-6 text-neon-blue" />
              <span className="text-sm text-muted-foreground">Total Balance</span>
            </div>
            <p className="text-3xl font-mono font-bold text-foreground">₹1,26,500</p>
            <p className="text-xs text-neon-green mt-1">+₹19,500 this week</p>
          </CardContent>
        </Card>
        <Card className="glass-panel border-border/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <ArrowUpRight className="w-6 h-6 text-neon-green" />
              <span className="text-sm text-muted-foreground">Total Earned</span>
            </div>
            <p className="text-3xl font-mono font-bold text-foreground">₹4,85,000</p>
            <p className="text-xs text-muted-foreground mt-1">Lifetime</p>
          </CardContent>
        </Card>
        <Card className="glass-panel border-border/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-6 h-6 text-neon-orange" />
              <span className="text-sm text-muted-foreground">Pending</span>
            </div>
            <p className="text-3xl font-mono font-bold text-foreground">₹31,500</p>
            <p className="text-xs text-muted-foreground mt-1">Clearing soon</p>
          </CardContent>
        </Card>
        <Card className="glass-panel border-border/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Gift className="w-6 h-6 text-neon-purple" />
              <span className="text-sm text-muted-foreground">Referral Bonus</span>
            </div>
            <p className="text-3xl font-mono font-bold text-foreground">₹8,000</p>
            <p className="text-xs text-neon-purple mt-1">4 referrals</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Transaction Ledger */}
        <Card className="lg:col-span-2 glass-panel border-border/30">
          <CardHeader>
            <CardTitle className="text-foreground">Commission Ledger</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {transactions.map((tx, index) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-xl bg-secondary/20 border border-border/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      tx.type === 'credit' ? 'bg-neon-green/10' : 'bg-neon-orange/10'
                    }`}>
                      {tx.type === 'credit' ? (
                        <ArrowUpRight className="w-5 h-5 text-neon-green" />
                      ) : (
                        <ArrowDownLeft className="w-5 h-5 text-neon-orange" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">{tx.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-mono font-bold ${
                      tx.type === 'credit' ? 'text-neon-green' : 'text-neon-orange'
                    }`}>{tx.amount}</p>
                    <Badge variant={tx.status === 'completed' ? 'default' : 'secondary'}>
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Withdraw & Payout */}
        <div className="space-y-6">
          <Card className="glass-panel border-border/30">
            <CardHeader>
              <CardTitle className="text-foreground">Withdraw Funds</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Amount</label>
                <Input
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="bg-secondary/30 border-border/30"
                />
              </div>
              <div className="p-3 rounded-lg bg-secondary/20">
                <p className="text-xs text-muted-foreground">Withdrawable Balance</p>
                <p className="text-lg font-mono font-bold text-neon-green">₹95,000</p>
              </div>
              <Button className="w-full bg-gradient-to-r from-neon-blue to-primary text-background">
                Request Withdrawal
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-panel border-border/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <TrendingUp className="w-5 h-5 text-neon-blue" />
                Payout Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {payoutSchedule.map((payout, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
                  <div>
                    <p className="text-sm font-medium text-foreground">{payout.period}</p>
                    <Badge variant="outline" className="mt-1">{payout.status}</Badge>
                  </div>
                  <p className="font-mono font-bold text-foreground">{payout.amount}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Monthly Target */}
      <Card className="glass-panel border-neon-blue/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-neon-blue" />
              <div>
                <h3 className="font-mono font-semibold text-foreground">Monthly Commission Target</h3>
                <p className="text-sm text-muted-foreground">₹22,000 more to unlock Gold tier bonus</p>
              </div>
            </div>
            <span className="text-2xl font-mono font-bold text-neon-blue">78%</span>
          </div>
          <Progress value={78} className="h-3" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>₹0</span>
            <span className="text-neon-green">Current: ₹78,000</span>
            <span>Target: ₹1,00,000</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
