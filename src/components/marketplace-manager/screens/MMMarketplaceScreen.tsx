import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Star, 
  ShoppingCart, 
  Eye,
  Sparkles,
  Tag,
  CheckCircle,
  ArrowRight,
  Heart,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  description: string;
  features: string[];
  basePrice: number;
  franchiseDiscount: number;
  franchisePrice: number;
  rating: number;
  reviews: number;
  popular: boolean;
  demoUrl?: string;
}

const categories = [
  { id: 'all', label: 'All Products' },
  { id: 'crm', label: 'CRM Solutions' },
  { id: 'hrm', label: 'HRM Systems' },
  { id: 'erp', label: 'ERP Software' },
  { id: 'ecommerce', label: 'E-Commerce' },
  { id: 'marketing', label: 'Marketing Tools' },
];

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'CRM Pro Suite',
    category: 'crm',
    subCategory: 'Sales CRM',
    description: 'Complete customer relationship management solution with AI insights',
    features: ['Lead Management', 'Sales Pipeline', 'Email Integration', 'AI Analytics'],
    basePrice: 50000,
    franchiseDiscount: 30,
    franchisePrice: 35000,
    rating: 4.8,
    reviews: 124,
    popular: true,
    demoUrl: 'https://demo.softwarewala.net/crm-pro',
  },
  {
    id: '2',
    name: 'HRM Enterprise',
    category: 'hrm',
    subCategory: 'Employee Management',
    description: 'Full-featured human resource management system',
    features: ['Attendance', 'Payroll', 'Performance', 'Recruitment'],
    basePrice: 75000,
    franchiseDiscount: 30,
    franchisePrice: 52500,
    rating: 4.6,
    reviews: 89,
    popular: true,
    demoUrl: 'https://demo.softwarewala.net/hrm-enterprise',
  },
  {
    id: '3',
    name: 'E-Shop Builder',
    category: 'ecommerce',
    subCategory: 'Online Store',
    description: 'Build stunning online stores with integrated payments',
    features: ['Store Builder', 'Payment Gateway', 'Inventory', 'Shipping'],
    basePrice: 40000,
    franchiseDiscount: 30,
    franchisePrice: 28000,
    rating: 4.9,
    reviews: 203,
    popular: true,
    demoUrl: 'https://demo.softwarewala.net/eshop-builder',
  },
  {
    id: '4',
    name: 'Marketing Autopilot',
    category: 'marketing',
    subCategory: 'Email Marketing',
    description: 'Automate your marketing campaigns with AI-powered insights',
    features: ['Email Campaigns', 'SMS Automation', 'Social Media', 'Analytics'],
    basePrice: 35000,
    franchiseDiscount: 30,
    franchisePrice: 24500,
    rating: 4.7,
    reviews: 156,
    popular: false,
    demoUrl: 'https://demo.softwarewala.net/marketing-autopilot',
  },
  {
    id: '5',
    name: 'ERP Complete',
    category: 'erp',
    subCategory: 'Enterprise Resource Planning',
    description: 'Unified platform for all business operations',
    features: ['Accounting', 'Inventory', 'HR', 'Sales', 'Reports'],
    basePrice: 120000,
    franchiseDiscount: 30,
    franchisePrice: 84000,
    rating: 4.5,
    reviews: 78,
    popular: true,
    demoUrl: 'https://demo.softwarewala.net/erp-complete',
  },
  {
    id: '6',
    name: 'Lead Magnet Pro',
    category: 'marketing',
    subCategory: 'Lead Generation',
    description: 'Capture and convert high-quality leads effortlessly',
    features: ['Landing Pages', 'Forms', 'Lead Scoring', 'Email Integration'],
    basePrice: 25000,
    franchiseDiscount: 30,
    franchisePrice: 17500,
    rating: 4.4,
    reviews: 92,
    popular: false,
    demoUrl: 'https://demo.softwarewala.net/lead-magnet',
  },
];

export function MMMarketplaceScreen() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);

  const filteredProducts = mockProducts.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleLiveDemo = (product: Product) => {
    if (product.demoUrl) {
      window.open(product.demoUrl, '_blank');
      toast.success(`Opening ${product.name} demo...`);
    } else {
      toast.error('Demo not available for this product');
    }
  };

  const handleBuyNow = (product: Product) => {
    setSelectedProduct(product);
    setShowOrderDialog(true);
    toast.info(`Proceeding to checkout for ${product.name}`);
  };

  const handlePlaceOrder = () => {
    if (selectedProduct) {
      toast.success(`Order placed for ${selectedProduct.name}! Order ID: ORD-${Date.now()}`);
      setShowOrderDialog(false);
      setSelectedProduct(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
            <ShoppingCart className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Marketplace</h1>
            <p className="text-slate-400">Browse and purchase enterprise software solutions</p>
          </div>
        </div>

        {/* Search and Filter Row */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-slate-700">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(cat.id)}
            className={selectedCategory === cat.id ? "bg-purple-600 hover:bg-purple-700" : "border-slate-600"}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <Card 
            key={product.id} 
            className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all overflow-hidden group"
          >
            {/* Header with Popular Badge */}
            <div className="relative p-4 pb-2">
              {product.popular && (
                <Badge className="absolute top-2 right-2 bg-amber-500/20 text-amber-400 border-amber-500/30">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Popular
                </Badge>
              )}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{product.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{product.subCategory}</p>
                </div>
              </div>
            </div>

            <CardContent className="space-y-4">
              {/* Description */}
              <p className="text-sm text-slate-300">{product.description}</p>

              {/* Features */}
              <div className="flex flex-wrap gap-2">
                {product.features.slice(0, 3).map(feature => (
                  <Badge 
                    key={feature} 
                    variant="secondary" 
                    className="bg-slate-700/50 text-slate-300 text-xs"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {feature}
                  </Badge>
                ))}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-slate-400">{product.rating} ({product.reviews} reviews)</span>
              </div>

              {/* Pricing */}
              <div className="space-y-2 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Base Price:</span>
                  <span className="text-sm font-semibold text-slate-300 line-through">₹{product.basePrice.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Franchise Price:</span>
                  <span className="text-lg font-bold text-emerald-400">₹{product.franchisePrice.toLocaleString()}</span>
                </div>
                <div className="text-xs text-purple-300">
                  <Tag className="h-3 w-3 inline mr-1" />
                  {product.franchiseDiscount}% discount applied
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => handleLiveDemo(product)}
                  variant="outline"
                  className="flex-1 border-slate-600 hover:border-cyan-500 text-slate-300 hover:text-cyan-400"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Live Demo
                </Button>
                <Button
                  onClick={() => handleBuyNow(product)}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Buy Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Products Message */}
      {filteredProducts.length === 0 && (
        <div className="col-span-full text-center py-12">
          <Search className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">No products found matching your criteria</p>
        </div>
      )}

      {/* Order Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle>Order {selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4 mt-4">
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <p className="text-sm text-slate-400">Product</p>
                <p className="text-lg font-bold text-white">{selectedProduct.name}</p>
              </div>
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <p className="text-sm text-slate-400">Franchise Price</p>
                <p className="text-2xl font-bold text-emerald-400">₹{selectedProduct.franchisePrice.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <p className="text-sm text-slate-400 mb-2">Features Included</p>
                <ul className="space-y-1">
                  {selectedProduct.features.map(feature => (
                    <li key={feature} className="text-sm text-slate-300 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <Button 
                onClick={handlePlaceOrder}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-10"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Confirm Order
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}