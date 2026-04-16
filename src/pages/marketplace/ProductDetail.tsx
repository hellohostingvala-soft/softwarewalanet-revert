// Product Detail Page
// /product/:slug route

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  Star,
  Eye,
  ArrowLeft,
  Heart,
  Share2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import '../../../styles/premium-7d-theme.css';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    loadProduct();
  }, [slug]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProduct({
        id: '1',
        name: 'CRM Pro',
        slug: 'crm-pro',
        price: 99,
        rating: 4.5,
        views: 1250,
        category: 'Software',
        description: 'Advanced CRM for business management',
        features: ['Contact Management', 'Sales Tracking', 'Analytics', 'Integration'],
        resellerId: 'reseller-1',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = () => {
    navigate(`/checkout/${product.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] p-6">
      <Button
        variant="ghost"
        className="text-white mb-6"
        onClick={() => navigate('/products')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Marketplace
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-[#1A2236] border border-indigo-500/20">
          <CardContent className="pt-6">
            <div className="aspect-video bg-[#0B0F1A] rounded-lg mb-4 flex items-center justify-center">
              <span className="text-gray-400">Product Image</span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{product.name}</h1>
            <p className="text-gray-400 mb-4">{product.description}</p>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <span className="text-white font-medium">{product.rating}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-400">
                <Eye className="w-4 h-4" />
                <span>{product.views}</span>
              </div>
              {product.resellerId && <Badge className="bg-blue-500/10 text-blue-500">Reseller</Badge>}
            </div>
            <p className="text-3xl font-bold text-white">${product.price}</p>
          </div>

          <Card className="bg-[#1A2236] border border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white">Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {product.features.map((feature: string, index: number) => (
                  <li key={index} className="text-gray-300 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              className="flex-1 bg-gradient-to-r from-indigo-500 to-cyan-500"
              onClick={handleBuy}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Buy Now
            </Button>
            <Button variant="outline" className="border-indigo-500 text-white hover:bg-indigo-500/10">
              <Heart className="w-4 h-4" />
            </Button>
            <Button variant="outline" className="border-indigo-500 text-white hover:bg-indigo-500/10">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
