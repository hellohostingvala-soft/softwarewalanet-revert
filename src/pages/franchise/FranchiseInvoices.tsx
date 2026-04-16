// Franchise Invoices
// GST + invoice generate

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  Eye,
  Plus,
  Search,
  Filter,
  DollarSign,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import '../../../styles/premium-7d-theme.css';

interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  amount: number;
  gst: number;
  total: number;
  status: 'pending' | 'paid' | 'overdue';
  createdAt: Date;
  dueDate: Date;
  customer: {
    name: string;
    email: string;
  };
}

const FranchiseInvoices = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  useEffect(() => {
    const status = searchParams.get('status');
    if (status) {
      setSelectedStatus(status);
    }
    loadInvoices();
  }, [searchParams]);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setInvoices([
        {
          id: '1',
          invoiceNumber: 'INV-2024-001',
          orderId: 'ORD-2024-001',
          amount: 99,
          gst: 9.9,
          total: 108.9,
          status: 'paid',
          createdAt: new Date('2024-01-15'),
          dueDate: new Date('2024-01-30'),
          customer: {
            name: 'John Doe',
            email: 'john@example.com',
          },
        },
        {
          id: '2',
          invoiceNumber: 'INV-2024-002',
          orderId: 'ORD-2024-002',
          amount: 149,
          gst: 14.9,
          total: 163.9,
          status: 'pending',
          createdAt: new Date('2024-01-16'),
          dueDate: new Date('2024-01-31'),
          customer: {
            name: 'Jane Smith',
            email: 'jane@example.com',
          },
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
          <p className="text-gray-400">Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Invoices</h1>
          <p className="text-gray-400">GST invoicing and management</p>
        </div>
        <div className="flex gap-4">
          <Button className="bg-gradient-to-r from-indigo-500 to-cyan-500">
            <Plus className="w-4 h-4 mr-2" />
            Generate Invoice
          </Button>
        </div>
      </div>

      <Card className="bg-[#1A2236] border border-indigo-500/20">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <motion.div
                key={invoice.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border border-indigo-500/20 rounded-lg hover:bg-indigo-500/5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-indigo-500/10">
                      <FileText className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-gray-400">{invoice.orderId} • {invoice.customer.name}</p>
                      <p className="text-xs text-gray-500">Due: {invoice.dueDate.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-white">${invoice.total.toFixed(2)}</p>
                      <p className="text-xs text-gray-400">Amount: ${invoice.amount} + GST: ${invoice.gst}</p>
                    </div>
                    <Badge className={invoice.status === 'paid' ? 'bg-green-500/10 text-green-500' : invoice.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'}>
                      {invoice.status}
                    </Badge>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="border-indigo-500 text-white hover:bg-indigo-500/10">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="border-indigo-500 text-white hover:bg-indigo-500/10">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FranchiseInvoices;
