/**
 * FRANCHISE OWNER MY ORDERS SCREEN
 * Order tracking with project ID linking
 */

import React, { useState } from 'react';
import { 
  ClipboardList, Search, Filter, Eye, Clock, CheckCircle2, 
  AlertCircle, XCircle, FolderKanban
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Order {
  id: string;
  projectId: string;
  productName: string;
  clientName: string;
  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'rejected';
  createdAt: string;
  amount: number;
}

const MOCK_ORDERS: Order[] = [
  { id: '1', projectId: 'PRJ-2024-001', productName: 'E-Commerce Pro', clientName: 'ABC Corp', status: 'in_progress', createdAt: '2024-01-15', amount: 31500 },
  { id: '2', projectId: 'PRJ-2024-002', productName: 'CRM Enterprise', clientName: 'XYZ Ltd', status: 'pending', createdAt: '2024-01-18', amount: 24500 },
  { id: '3', projectId: 'PRJ-2024-003', productName: 'Mobile App', clientName: 'Tech Inc', status: 'completed', createdAt: '2024-01-10', amount: 38500 },
  { id: '4', projectId: 'PRJ-2024-004', productName: 'Restaurant POS', clientName: 'Food Co', status: 'approved', createdAt: '2024-01-20', amount: 19600 },
  { id: '5', projectId: 'PRJ-2024-005', productName: 'ERP Solution', clientName: 'Big Corp', status: 'rejected', createdAt: '2024-01-12', amount: 52500 },
];

export function FOMyOrdersScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'in_progress':
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30"><FolderKanban className="h-3 w-3 mr-1" />In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return null;
    }
  };

  const filteredOrders = MOCK_ORDERS.filter(order => {
    const matchesSearch = order.projectId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && order.status === activeTab;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            My Orders
          </h1>
          <p className="text-muted-foreground text-sm">Track all your orders and projects</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by Project ID, Product, or Client..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm text-primary">{order.projectId}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <h3 className="font-semibold">{order.productName}</h3>
                      <p className="text-sm text-muted-foreground">Client: {order.clientName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">₹{order.amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{order.createdAt}</p>
                    </div>
                    <Button variant="outline" size="icon" className="ml-4">
                      <Eye className="h-4 w-4" />
                    </Button>
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
