// Wallet + Billing + Payouts Section
// Payout schedule view + invoice quick-generate + reconciliation badge

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, DollarSign, Calendar, CheckCircle, XCircle, FileText } from 'lucide-react';

const WalletBillingSection = () => {
  const [walletBalance] = useState(5432.50);
  const [pendingPayout] = useState(1200.00);

  const payouts = [
    { id: 'PAYOUT-001', amount: 2500, status: 'scheduled', date: '2024-01-20', method: 'Bank Transfer' },
    { id: 'PAYOUT-002', amount: 1800, status: 'processing', date: '2024-01-25', method: 'Bank Transfer' },
    { id: 'PAYOUT-003', amount: 3200, status: 'completed', date: '2024-01-10', method: 'Bank Transfer' },
  ];

  const invoices = [
    { id: 'INV-001', orderId: 'ORD-001', amount: 99, status: 'matched', date: '2024-01-15' },
    { id: 'INV-002', orderId: 'ORD-002', amount: 149, status: 'matched', date: '2024-01-16' },
    { id: 'INV-003', orderId: 'ORD-003', amount: 199, status: 'mismatch', date: '2024-01-17' },
  ];

  const getPayoutStatusBadge = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-500/10 text-blue-500',
      processing: 'bg-yellow-500/10 text-yellow-500',
      completed: 'bg-green-500/10 text-green-500',
    };
    return <Badge className={colors[status as keyof typeof colors]}>{status}</Badge>;
  };

  const getInvoiceStatusBadge = (status: string) => {
    const colors = {
      matched: 'bg-green-500/10 text-green-500',
      mismatch: 'bg-red-500/10 text-red-500',
    };
    return <Badge className={colors[status as keyof typeof colors]}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Wallet Balance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Wallet Balance</CardTitle>
            <Wallet className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${walletBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Available for payout</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payout</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pendingPayout.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Scheduled for next payout</p>
          </CardContent>
        </Card>
      </div>

      {/* Payout Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Payout Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payouts.map((payout) => (
              <div key={payout.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <p className="font-medium">{payout.id}</p>
                  <p className="text-sm text-muted-foreground">{payout.method} • {payout.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${payout.amount}</p>
                  {getPayoutStatusBadge(payout.status)}
                </div>
              </div>
            ))}
          </div>
          <Button className="w-full mt-4">Request Payout</Button>
        </CardContent>
      </Card>

      {/* Invoice Reconciliation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Invoice Reconciliation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <p className="font-medium">{invoice.id}</p>
                  <p className="text-sm text-muted-foreground">Order: {invoice.orderId} • {invoice.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-bold">${invoice.amount}</p>
                  {getInvoiceStatusBadge(invoice.status)}
                  <Button size="sm" variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Generate
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletBillingSection;
