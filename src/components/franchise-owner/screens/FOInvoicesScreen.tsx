/**
 * FRANCHISE OWNER INVOICES SCREEN
 * Invoice management with GST/Tax breakdown
 */

import React, { useState } from 'react';
import { 
  FileText, Search, Filter, Download, Mail, Eye,
  CheckCircle2, Clock, XCircle, Smartphone, Globe
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  productName: string;
  clientName: string;
  amount: number;
  gst: number;
  total: number;
  status: 'paid' | 'pending' | 'failed';
  type: 'software' | 'app' | 'domain' | 'hosting';
  createdAt: string;
}

const MOCK_INVOICES: Invoice[] = [
  { id: '1', invoiceNumber: 'INV-2024-0001', orderId: 'PRJ-2024-001', productName: 'E-Commerce Pro', clientName: 'ABC Corp', amount: 31500, gst: 5670, total: 37170, status: 'paid', type: 'software', createdAt: '2024-01-15' },
  { id: '2', invoiceNumber: 'INV-2024-0002', orderId: 'PRJ-2024-002', productName: 'Mobile App v2.1', clientName: 'XYZ Ltd', amount: 24500, gst: 4410, total: 28910, status: 'pending', type: 'app', createdAt: '2024-01-18' },
  { id: '3', invoiceNumber: 'INV-2024-0003', orderId: 'PRJ-2024-003', productName: 'Domain Renewal', clientName: 'Tech Inc', amount: 1200, gst: 216, total: 1416, status: 'paid', type: 'domain', createdAt: '2024-01-10' },
  { id: '4', invoiceNumber: 'INV-2024-0004', orderId: 'PRJ-2024-004', productName: 'Hosting Annual', clientName: 'Food Co', amount: 8500, gst: 1530, total: 10030, status: 'failed', type: 'hosting', createdAt: '2024-01-20' },
];

export function FOInvoicesScreen() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-emerald-500/20 text-emerald-400"><CheckCircle2 className="h-3 w-3 mr-1" />Paid</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500/20 text-amber-400"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'failed':
        return <Badge className="bg-destructive/20 text-destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
    }
  };

  const getTypeIcon = (type: Invoice['type']) => {
    switch (type) {
      case 'software': return <FileText className="h-4 w-4" />;
      case 'app': return <Smartphone className="h-4 w-4" />;
      case 'domain': return <Globe className="h-4 w-4" />;
      case 'hosting': return <Globe className="h-4 w-4" />;
    }
  };

  const handleDownload = (invoice: Invoice) => {
    toast.success(`Downloading ${invoice.invoiceNumber}...`);
  };

  const handleEmail = (invoice: Invoice) => {
    toast.success(`Emailing invoice to ${invoice.clientName}`);
  };

  const filteredInvoices = MOCK_INVOICES.filter(inv => {
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'app') return matchesSearch && inv.type === 'app';
    return matchesSearch && inv.status === activeTab;
  });

  const totalPaid = MOCK_INVOICES.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);
  const totalPending = MOCK_INVOICES.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.total, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Invoices
          </h1>
          <p className="text-muted-foreground text-sm">Manage invoices and payments</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Invoices</p>
            <p className="text-2xl font-bold">{MOCK_INVOICES.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Paid</p>
            <p className="text-2xl font-bold text-emerald-400">₹{totalPaid.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Pending</p>
            <p className="text-2xl font-bold text-amber-400">₹{totalPending.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">GST Collected</p>
            <p className="text-2xl font-bold">₹{MOCK_INVOICES.reduce((sum, i) => sum + i.gst, 0).toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Invoices</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="app">App Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4 space-y-4">
          {/* Search */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by invoice number or client..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Invoices List */}
          <div className="space-y-3">
            {filteredInvoices.map((invoice) => (
              <Card key={invoice.id} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm text-primary">{invoice.invoiceNumber}</span>
                        {getStatusBadge(invoice.status)}
                        <Badge variant="outline" className="gap-1">
                          {getTypeIcon(invoice.type)}
                          {invoice.type}
                        </Badge>
                      </div>
                      <h3 className="font-semibold">{invoice.productName}</h3>
                      <p className="text-sm text-muted-foreground">Client: {invoice.clientName} • Order: {invoice.orderId}</p>
                    </div>
                    <div className="text-right mr-4">
                      <p className="text-xs text-muted-foreground">Amount: ₹{invoice.amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">GST (18%): ₹{invoice.gst.toLocaleString()}</p>
                      <p className="text-lg font-bold">₹{invoice.total.toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleDownload(invoice)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleEmail(invoice)}>
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
