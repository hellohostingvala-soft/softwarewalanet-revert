import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Store,
  Search,
  Star,
  ShoppingCart,
  Filter,
  Zap,
  Package,
  TrendingUp,
  Award,
  Clock,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  badge?: string;
  description: string;
  features: string[];
}

const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Restaurant POS Pro',
    category: 'Food & Beverage',
    price: 12999,
    originalPrice: 18999,
    rating: 4.8,
    reviews: 342,
    badge: 'Bestseller',
    description: 'Complete restaurant management with billing, KOT, table management and reporting.',
    features: ['Table Management', 'KOT Printing', 'GST Billing', 'Daily Reports', 'Multi-user'],
  },
  {
    id: '2',
    name: 'School ERP Suite',
    category: 'Education',
    price: 19999,
    originalPrice: 28999,
    rating: 4.9,
    reviews: 218,
    badge: 'Top Rated',
    description: 'Comprehensive school management covering admissions, fees, attendance and exams.',
    features: ['Admissions', 'Fee Management', 'Attendance', 'Exam & Results', 'Parent App'],
  },
  {
    id: '3',
    name: 'Hotel HMS',
    category: 'Hospitality',
    price: 24999,
    rating: 4.7,
    reviews: 156,
    description: 'Full hotel management including reservations, housekeeping and billing.',
    features: ['Room Booking', 'Housekeeping', 'Restaurant POS', 'GST Reports', 'Channel Manager'],
  },
  {
    id: '4',
    name: 'Retail POS',
    category: 'Retail',
    price: 8999,
    originalPrice: 12999,
    rating: 4.6,
    reviews: 289,
    badge: 'New',
    description: 'Fast and reliable retail billing with inventory management and barcode support.',
    features: ['Barcode Scanning', 'Inventory', 'GST Billing', 'Customer Loyalty', 'Multi-Store'],
  },
  {
    id: '5',
    name: 'Gym Management',
    category: 'Fitness',
    price: 6999,
    rating: 4.5,
    reviews: 124,
    description: 'Gym and fitness center management with member tracking and billing.',
    features: ['Member Management', 'Attendance', 'Billing', 'Trainer Assign', 'SMS Alerts'],
  },
  {
    id: '6',
    name: 'CRM Pro',
    category: 'Sales',
    price: 14999,
    originalPrice: 19999,
    rating: 4.7,
    reviews: 198,
    badge: 'Popular',
    description: 'Enterprise CRM with lead management, pipeline tracking and automation.',
    features: ['Lead Pipeline', 'Follow-up Reminders', 'Email Automation', 'Reports', 'WhatsApp Integration'],
  },
];

const CATEGORIES = ['All', 'Food & Beverage', 'Education', 'Hospitality', 'Retail', 'Fitness', 'Sales'];

export function MMMarketplaceScreen() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<string[]>([]);

  const filtered = PRODUCTS.filter((p) => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleCart = (id: string) => {
    setCart((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Store className="h-6 w-6 text-purple-400" />
            Software Marketplace
          </h1>
          <p className="text-slate-400 mt-1">Browse and order software solutions for your clients</p>
        </div>
        <div className="relative">
          <Button className="bg-purple-500 hover:bg-purple-600 gap-2">
            <ShoppingCart className="h-4 w-4" />
            Cart
            {cart.length > 0 && (
              <Badge className="bg-white text-purple-700 ml-1 px-1.5 py-0 text-xs">
                {cart.length}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search software..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-purple-500 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((product) => (
          <Card
            key={product.id}
            className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-colors"
          >
            <CardContent className="p-4 space-y-3">
              {/* Top Row */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">{product.name}</h3>
                    {product.badge && (
                      <Badge className="bg-purple-500/20 text-purple-300 text-[10px] px-1.5 py-0">
                        {product.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{product.category}</p>
                </div>
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star className="h-3.5 w-3.5 fill-yellow-400" />
                  <span className="text-sm font-medium">{product.rating}</span>
                  <span className="text-xs text-slate-500">({product.reviews})</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-400 line-clamp-2">{product.description}</p>

              {/* Features */}
              <div className="flex flex-wrap gap-1">
                {product.features.slice(0, 3).map((f) => (
                  <span
                    key={f}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300"
                  >
                    {f}
                  </span>
                ))}
                {product.features.length > 3 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">
                    +{product.features.length - 3} more
                  </span>
                )}
              </div>

              {/* Pricing */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-lg font-bold text-white">₹{product.price.toLocaleString()}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-slate-500 line-through ml-2">
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700 text-xs"
                        onClick={() => setSelectedProduct(product)}
                      >
                        Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-slate-700 text-white">
                      <DialogHeader>
                        <DialogTitle>{selectedProduct?.name}</DialogTitle>
                      </DialogHeader>
                      {selectedProduct && (
                        <div className="space-y-4">
                          <p className="text-slate-400">{selectedProduct.description}</p>
                          <div>
                            <p className="font-medium mb-2">All Features:</p>
                            <ul className="space-y-1">
                              {selectedProduct.features.map((f) => (
                                <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                                  <Zap className="h-3.5 w-3.5 text-purple-400" /> {f}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="flex items-center justify-between border-t border-slate-700 pt-3">
                            <span className="text-xl font-bold">₹{selectedProduct.price.toLocaleString()}</span>
                            <Button
                              className="bg-purple-500 hover:bg-purple-600"
                              onClick={() => toggleCart(selectedProduct.id)}
                            >
                              {cart.includes(selectedProduct.id) ? 'Remove from Cart' : 'Add to Cart'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  <Button
                    size="sm"
                    className={`text-xs ${
                      cart.includes(product.id)
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-purple-500 hover:bg-purple-600'
                    }`}
                    onClick={() => toggleCart(product.id)}
                  >
                    {cart.includes(product.id) ? 'Added ✓' : 'Order'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Package className="h-12 w-12 mb-3 opacity-50" />
          <p className="text-lg font-medium">No products found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
