import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Package, 
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Trash2,
  Eye,
  Lock,
  Unlock,
  History,
  ToggleRight,
  Globe,
  Gauge,
  Key,
  FileText,
  Upload,
  Sparkles,
  MoreVertical
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ProductManagementScreenProps {
  subScreen?: string;
}

const products = [
  { id: '1', name: 'CRM Pro Suite', category: 'Software Products', status: 'live', version: '2.4.1', price: 49999, views: 1234, orders: 45, rating: 4.8 },
  { id: '2', name: 'E-Shop Builder', category: 'SaaS Systems', status: 'live', version: '1.2.0', price: 39999, views: 987, orders: 32, rating: 4.6 },
  { id: '3', name: 'AI Lead Magnet', category: 'AI Tools', status: 'pending', version: '1.0.0', price: 24999, views: 0, orders: 0, rating: 0 },
  { id: '4', name: 'Marketing Autopilot', category: 'Software Products', status: 'paused', version: '3.1.0', price: 34999, views: 456, orders: 12, rating: 4.2 },
  { id: '5', name: 'Custom ERP System', category: 'Custom Development', status: 'locked', version: '1.5.2', price: 149999, views: 234, orders: 5, rating: 4.9 },
  { id: '6', name: 'Invoice Manager', category: 'Software Products', status: 'rejected', version: '1.0.0', price: 19999, views: 0, orders: 0, rating: 0 },
];

const statusConfig = {
  live: { label: 'Live', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle },
  pending: { label: 'Pending', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Clock },
  paused: { label: 'Paused', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: ToggleRight },
  locked: { label: 'Locked', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: Lock },
  rejected: { label: 'Rejected', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle },
};

export function MMProductManagementScreen({ subScreen = 'all-products' }: ProductManagementScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  if (subScreen === 'add-product') {
    return <AddProductView />;
  }
  if (subScreen === 'product-drafts') {
    return <ProductListView title="Product Drafts" filter="draft" />;
  }
  if (subScreen === 'pending-approval') {
    return <ProductListView title="Pending Approval" filter="pending" />;
  }
  if (subScreen === 'approved-products') {
    return <ProductListView title="Approved Products" filter="live" />;
  }
  if (subScreen === 'rejected-products') {
    return <ProductListView title="Rejected Products" filter="rejected" />;
  }
  if (subScreen === 'product-versioning') {
    return <ProductVersioningView />;
  }
  if (subScreen === 'product-status') {
    return <ProductStatusView />;
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (selectedCategory === 'all' || p.category === selectedCategory)
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6 text-purple-400" />
            All Products
          </h1>
          <p className="text-slate-400 mt-1">Manage your marketplace products</p>
        </div>
        <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
          <Plus className="h-4 w-4 mr-2" />
          Add New Product
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-400">{products.length}</p>
            <p className="text-xs text-slate-400">Total Products</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/10 border-emerald-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">{products.filter(p => p.status === 'live').length}</p>
            <p className="text-xs text-emerald-400">Live</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-400">{products.filter(p => p.status === 'pending').length}</p>
            <p className="text-xs text-amber-400">Pending</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{products.filter(p => p.status === 'paused').length}</p>
            <p className="text-xs text-blue-400">Paused</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-400">{products.filter(p => p.status === 'rejected').length}</p>
            <p className="text-xs text-red-400">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48 bg-slate-800 border-slate-700">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Software Products">Software Products</SelectItem>
            <SelectItem value="AI Tools">AI Tools</SelectItem>
            <SelectItem value="SaaS Systems">SaaS Systems</SelectItem>
            <SelectItem value="Custom Development">Custom Development</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="border-slate-700">
          <Filter className="h-4 w-4 mr-2" />
          More Filters
        </Button>
      </div>

      {/* Products Table */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left p-4 text-xs text-slate-400 font-medium">Product</th>
                <th className="text-left p-4 text-xs text-slate-400 font-medium">Category</th>
                <th className="text-left p-4 text-xs text-slate-400 font-medium">Status</th>
                <th className="text-left p-4 text-xs text-slate-400 font-medium">Version</th>
                <th className="text-left p-4 text-xs text-slate-400 font-medium">Price</th>
                <th className="text-left p-4 text-xs text-slate-400 font-medium">Views</th>
                <th className="text-left p-4 text-xs text-slate-400 font-medium">Orders</th>
                <th className="text-right p-4 text-xs text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const status = statusConfig[product.status as keyof typeof statusConfig];
                const StatusIcon = status.icon;
                return (
                  <tr key={product.id} className="border-b border-slate-700/50 hover:bg-slate-800/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/20">
                          <Package className="h-4 w-4 text-purple-400" />
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-slate-500">Rating: {product.rating || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-400">{product.category}</td>
                    <td className="p-4">
                      <Badge className={status.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status.label}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm">v{product.version}</td>
                    <td className="p-4 text-sm font-medium">₹{product.price.toLocaleString()}</td>
                    <td className="p-4 text-sm text-slate-400">{product.views.toLocaleString()}</td>
                    <td className="p-4 text-sm text-slate-400">{product.orders}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          {product.status === 'locked' ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-400">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function ProductListView({ title, filter }: { title: string; filter: string }) {
  const filtered = products.filter(p => p.status === filter);
  
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package className="h-6 w-6 text-purple-400" />
          {title}
        </h1>
        <p className="text-slate-400 mt-1">{filtered.length} products</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {filtered.map((product) => (
          <Card key={product.id} className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <Package className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-xs text-slate-400">{product.category}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-lg font-bold">₹{product.price.toLocaleString()}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-slate-600">View</Button>
                  <Button size="sm" className="bg-purple-500 hover:bg-purple-600">Edit</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-12 text-slate-500">
            No products found
          </div>
        )}
      </div>
    </div>
  );
}

function AddProductView() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Plus className="h-6 w-6 text-purple-400" />
          Add New Product
        </h1>
        <p className="text-slate-400 mt-1">Create a new product listing</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Product Name</Label>
              <Input className="mt-2 bg-slate-900 border-slate-600" placeholder="Enter product name" />
            </div>
            <div>
              <Label>Category</Label>
              <Select>
                <SelectTrigger className="mt-2 bg-slate-900 border-slate-600">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="software">Software Products</SelectItem>
                  <SelectItem value="ai">AI Tools</SelectItem>
                  <SelectItem value="saas">SaaS Systems</SelectItem>
                  <SelectItem value="custom">Custom Development</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea className="mt-2 bg-slate-900 border-slate-600" placeholder="Enter product description" rows={4} />
            </div>
            <div>
              <Label>Price (₹)</Label>
              <Input type="number" className="mt-2 bg-slate-900 border-slate-600" placeholder="Enter price" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle>Product Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Product Images</Label>
              <div className="mt-2 border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                <p className="text-sm text-slate-400">Click to upload images</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-700">
              <div>
                <p className="font-medium">AI-Powered Demo</p>
                <p className="text-xs text-slate-400">Generate demo with VALA AI</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-700">
              <div>
                <p className="font-medium">Geo Restrictions</p>
                <p className="text-xs text-slate-400">Limit availability by country</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-700">
              <div>
                <p className="font-medium">Usage Limiter</p>
                <p className="text-xs text-slate-400">Set usage limits per license</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" className="border-slate-600">Save as Draft</Button>
        <Button className="bg-gradient-to-r from-purple-500 to-pink-500">Submit for Approval</Button>
      </div>
    </div>
  );
}

function ProductVersioningView() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <History className="h-6 w-6 text-purple-400" />
          Product Versioning
        </h1>
        <p className="text-slate-400 mt-1">Manage product versions and updates</p>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <div className="space-y-4">
            {products.filter(p => p.status === 'live').map(product => (
              <div key={product.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50 border border-slate-700">
                <div className="flex items-center gap-4">
                  <Package className="h-5 w-5 text-purple-400" />
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-slate-400">Current: v{product.version}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="border-slate-600">3 versions</Badge>
                  <Button variant="outline" size="sm" className="border-slate-600">View History</Button>
                  <Button size="sm" className="bg-purple-500 hover:bg-purple-600">New Version</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProductStatusView() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ToggleRight className="h-6 w-6 text-purple-400" />
          Product Status Control
        </h1>
        <p className="text-slate-400 mt-1">Control product visibility and availability</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-emerald-500/10 border-emerald-500/30">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-emerald-400">3</p>
            <p className="text-xs text-emerald-400">Live Products</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-4 text-center">
            <ToggleRight className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-400">1</p>
            <p className="text-xs text-blue-400">Paused Products</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-500/10 border-slate-500/30">
          <CardContent className="p-4 text-center">
            <Lock className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-400">1</p>
            <p className="text-xs text-slate-400">Locked Products</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle>Quick Status Toggle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {products.map(product => (
              <div key={product.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50 border border-slate-700">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-purple-400" />
                  <span className="font-medium">{product.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={statusConfig[product.status as keyof typeof statusConfig].color}>
                    {statusConfig[product.status as keyof typeof statusConfig].label}
                  </Badge>
                  <Button variant="outline" size="sm" className="border-slate-600">
                    {product.status === 'live' ? 'Pause' : product.status === 'paused' ? 'Go Live' : 'Unlock'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
