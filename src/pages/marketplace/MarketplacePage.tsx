// Marketplace Page
// /products route

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  Search,
  Filter,
  ShoppingCart,
  Star,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import '../../../styles/premium-7d-theme.css';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  rating: number;
  views: number;
  category: string;
  resellerId?: string;
  franchiseId?: string;
}

const MarketplacePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProducts([
        {
          id: '1',
          name: 'CRM Pro',
          slug: 'crm-pro',
          price: 99,
          rating: 4.5,
          views: 1250,
          category: 'Software',
          resellerId: 'reseller-1',
        },
        {
          id: '2',
          name: 'Project Manager Plus',
          slug: 'project-manager-plus',
          price: 149,
          rating: 4.8,
          views: 890,
          category: 'Software',
          franchiseId: 'franchise-1',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (slug: string) => {
    navigate(`/product/${slug}`);
  };

  const handleBuy = (productId: string) => {
    navigate(`/checkout/${productId}`);
  };

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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Marketplace</h1>
          <p className="text-gray-400">Browse products from resellers and franchises</p>
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
          <Button className="bg-gradient-to-r from-indigo-500 to-cyan-500">
            <ShoppingBag className="w-4 h-4 mr-2" />
            View Cart
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-[#1A2236] border border-indigo-500/20 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-white text-lg">{product.name}</CardTitle>
                  {product.resellerId && <Badge className="bg-blue-500/10 text-blue-500">Reseller</Badge>}
                  {product.franchiseId && <Badge className="bg-purple-500/10 text-purple-500">Franchise</Badge>}
                </div>
                <p className="text-gray-400 text-sm">{product.category}</p>
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
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-cyan-500"
                    onClick={() => handleBuy(product.id)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Buy
                  </Button>
                  <Button
                    variant="outline"
                    className="border-indigo-500 text-white hover:bg-indigo-500/10"
                    onClick={() => handleProductClick(product.slug)}
                  >
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MarketplacePage;
