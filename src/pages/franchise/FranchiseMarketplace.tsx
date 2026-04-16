// Franchise Marketplace
// 3-level filter (category → sub → micro) + buy flow

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  Filter,
  Search,
  ShoppingCart,
  Star,
  Eye,
  ChevronDown,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { checkRegionAccess } from '@/services/franchiseRegionRBACService';
import { orderCreatedFlow } from '@/services/franchiseFlowEngineService';
import '../../../styles/premium-7d-theme.css';

interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  subCategory: string;
  microCategory: string;
  price: number;
  rating: number;
  views: number;
  region: string;
  status: 'active' | 'inactive';
  description: string;
}

const FranchiseMarketplace = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSub, setSelectedSub] = useState<string>('');
  const [selectedMicro, setSelectedMicro] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'software', name: 'Software', subs: ['SaaS', 'Desktop', 'Mobile'] },
    { id: 'services', name: 'Services', subs: ['Consulting', 'Development', 'Support'] },
    { id: 'digital', name: 'Digital Products', subs: ['Templates', 'Courses', 'Assets'] },
  ];

  const microCategories = {
    SaaS: ['CRM', 'ERP', 'Project Management'],
    Desktop: ['Productivity', 'Security', 'Utilities'],
    Mobile: ['iOS', 'Android', 'Cross-Platform'],
    Consulting: ['Strategy', 'Implementation', 'Training'],
    Development: ['Web', 'Mobile', 'Custom'],
    Support: ['Tier 1', 'Tier 2', 'Premium'],
    Templates: ['Website', 'Email', 'Social Media'],
    Courses: ['Beginner', 'Advanced', 'Expert'],
    Assets: ['Graphics', 'Audio', 'Video'],
  };

  useEffect(() => {
    const filter = searchParams.get('filter');
    if (filter === 'active') {
      loadProducts('active');
    } else {
      loadProducts();
    }
  }, [searchParams]);

  const loadProducts = async (statusFilter?: string) => {
    setLoading(true);
    try {
      // Simulate API call: GET /api/products?category&sub&micro&region
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'CRM Pro',
          slug: 'crm-pro',
          category: 'software',
          subCategory: 'SaaS',
          microCategory: 'CRM',
          price: 99,
          rating: 4.5,
          views: 1250,
          region: 'Los Angeles',
          status: 'active',
          description: 'Advanced CRM for franchise management',
        },
        {
          id: '2',
          name: 'Project Manager Plus',
          slug: 'project-manager-plus',
          category: 'software',
          subCategory: 'SaaS',
          microCategory: 'Project Management',
          price: 149,
          rating: 4.8,
          views: 890,
          region: 'Los Angeles',
          status: 'active',
          description: 'Complete project management solution',
        },
        {
          id: '3',
          name: 'Web Development Suite',
          slug: 'web-dev-suite',
          category: 'services',
          subCategory: 'Development',
          microCategory: 'Web',
          price: 299,
          rating: 4.7,
          views: 2100,
          region: 'Los Angeles',
          status: 'active',
          description: 'Full-stack web development services',
        },
      ];

      if (statusFilter === 'active') {
        setProducts(mockProducts.filter(p => p.status === 'active'));
      } else {
        setProducts(mockProducts);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBuyClick = async (product: Product) => {
    try {
      // Create order flow
      await orderCreatedFlow({
        productId: product.id,
        productName: product.name,
        price: product.price,
        franchiseId: 'current-franchise-id',
        userId: 'current-user-id',
      });

      // Navigate to checkout
      navigate(`/franchise/marketplace/product/${product.slug}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate order",
        variant: "destructive",
      });
    }
  };

  const filteredProducts = products.filter(product => {
    if (selectedCategory && product.category !== selectedCategory) return false;
    if (selectedSub && product.subCategory !== selectedSub) return false;
    if (selectedMicro && product.microCategory !== selectedMicro) return false;
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Marketplace</h1>
          <p className="text-gray-400">Browse and purchase products for your region</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64 bg-[#1A2236] border-indigo-500/20 text-white"
            />
          </div>
          <Button
            className="bg-gradient-to-r from-indigo-500 to-cyan-500"
            onClick={() => navigate('/franchise/orders?action=create')}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Place Order
          </Button>
        </div>
      </div>

      {/* 3-Level Filter */}
      <Card className="bg-[#1A2236] border border-indigo-500/20 mb-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            {/* Category */}
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm text-gray-400 mb-2 block">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedSub('');
                  setSelectedMicro('');
                }}
                className="w-full bg-[#0B0F1A] border border-indigo-500/20 rounded-lg p-2 text-white"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Sub Category */}
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm text-gray-400 mb-2 block">Sub Category</label>
              <select
                value={selectedSub}
                onChange={(e) => {
                  setSelectedSub(e.target.value);
                  setSelectedMicro('');
                }}
                disabled={!selectedCategory}
                className="w-full bg-[#0B0F1A] border border-indigo-500/20 rounded-lg p-2 text-white disabled:opacity-50"
              >
                <option value="">All Sub Categories</option>
                {selectedCategory && categories.find(c => c.id === selectedCategory)?.subs.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            {/* Micro Category */}
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm text-gray-400 mb-2 block">Micro Category</label>
              <select
                value={selectedMicro}
                onChange={(e) => setSelectedMicro(e.target.value)}
                disabled={!selectedSub}
                className="w-full bg-[#0B0F1A] border border-indigo-500/20 rounded-lg p-2 text-white disabled:opacity-50"
              >
                <option value="">All Micro Categories</option>
                {selectedSub && microCategories[selectedSub as keyof typeof microCategories]?.map(micro => (
                  <option key={micro} value={micro}>{micro}</option>
                ))}
              </select>
            </div>

            <Button
              variant="outline"
              className="border-indigo-500 text-white hover:bg-indigo-500/10 mt-6"
              onClick={() => {
                setSelectedCategory('');
                setSelectedSub('');
                setSelectedMicro('');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-[#1A2236] border border-indigo-500/20 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg">{product.name}</CardTitle>
                    <p className="text-gray-400 text-sm">{product.description}</p>
                  </div>
                  <Badge className={product.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}>
                    {product.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span>{product.category}</span>
                  <span>→</span>
                  <span>{product.subCategory}</span>
                  <span>→</span>
                  <span>{product.microCategory}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span className="text-white font-medium">{product.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400">
                    <Eye className="w-4 h-4" />
                    <span>{product.views}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-white">${product.price}</span>
                  <span className="text-sm text-gray-400">{product.region}</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600"
                    onClick={() => handleBuyClick(product)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Buy
                  </Button>
                  <Button
                    variant="outline"
                    className="border-indigo-500 text-white hover:bg-indigo-500/10"
                    onClick={() => navigate(`/franchise/marketplace/product/${product.slug}`)}
                  >
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No products found matching your filters</p>
        </div>
      )}
    </div>
  );
};

export default FranchiseMarketplace;
