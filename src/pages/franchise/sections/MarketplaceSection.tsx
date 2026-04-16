// Marketplace Section
// Products, buy flow

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag, ShoppingCart, Eye, Star } from 'lucide-react';

const MarketplaceSection = () => {
  const products = [
    { id: 1, name: 'Product A', price: 99, rating: 4.5, views: 1250 },
    { id: 2, name: 'Product B', price: 149, rating: 4.8, views: 890 },
    { id: 3, name: 'Product C', price: 199, rating: 4.7, views: 2100 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Marketplace Products</h3>
        <Button>
          <ShoppingBag className="w-4 h-4 mr-2" />
          Browse All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <CardTitle className="text-base">{product.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">${product.price}</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  <span className="text-sm">{product.rating}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {product.views} views
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Buy
                </Button>
                <Button variant="outline" className="flex-1">
                  Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MarketplaceSection;
