// Leads + SEO Section
// Local + global SEO with per-city preview + keyword gap

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Target, Globe, Search, TrendingUp, BarChart } from 'lucide-react';

const LeadsSEOSection = () => {
  const [selectedCity, setSelectedCity] = useState('all');

  const cities = ['all', 'New York', 'Los Angeles', 'Chicago', 'Houston'];
  const leads = [
    { id: 1, name: 'John Doe', email: 'john@example.com', city: 'New York', status: 'hot' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', city: 'Los Angeles', status: 'warm' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', city: 'Chicago', status: 'cold' },
  ];

  const keywords = [
    { keyword: 'franchise business', rank: 3, volume: 1200, gap: 'high' },
    { keyword: 'business opportunity', rank: 5, volume: 800, gap: 'medium' },
    { keyword: 'start franchise', rank: 8, volume: 500, gap: 'low' },
  ];

  return (
    <div className="space-y-6">
      {/* City Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Local SEO by City
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {cities.map((city) => (
              <Button
                key={city}
                variant={selectedCity === city ? 'default' : 'outline'}
                onClick={() => setSelectedCity(city)}
              >
                {city === 'all' ? 'All Cities' : city}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Leads */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Leads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="font-medium">{lead.name}</p>
                  <p className="text-sm text-muted-foreground">{lead.email}</p>
                  <p className="text-xs text-muted-foreground">{lead.city}</p>
                </div>
                <Badge className={lead.status === 'hot' ? 'bg-red-500/10 text-red-500' : lead.status === 'warm' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-blue-500/10 text-blue-500'}>
                  {lead.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SEO Keywords */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Keyword Gap Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {keywords.map((kw, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="font-medium">{kw.keyword}</p>
                  <p className="text-sm text-muted-foreground">Rank: #{kw.rank} • Volume: {kw.volume}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={kw.gap === 'high' ? 'bg-red-500/10 text-red-500' : kw.gap === 'medium' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'}>
                    {kw.gap} gap
                  </Badge>
                  <Button size="sm" variant="outline">Apply</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SERP Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="w-5 h-5" />
            SERP Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 border border-border rounded-lg bg-muted/50">
            <div className="space-y-2">
              <p className="text-blue-600 text-lg underline cursor-pointer hover:text-blue-700">
                Best Franchise Opportunities in {selectedCity === 'all' ? 'Your Area' : selectedCity}
              </p>
              <p className="text-green-700 text-sm">
                https://yourdomain.com/franchise/{selectedCity === 'all' ? '' : selectedCity.toLowerCase().replace(' ', '-')}
              </p>
              <p className="text-sm text-gray-600">
                Discover top franchise opportunities in {selectedCity === 'all' ? 'your area' : selectedCity}. Start your business journey today with our proven franchise model.
              </p>
              <div className="flex gap-2 text-xs text-muted-foreground">
                <span>⭐ 4.8 (125 reviews)</span>
                <span>•</span>
                <span>Jan 15, 2024</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadsSEOSection;
