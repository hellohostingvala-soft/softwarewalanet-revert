// Franchise Leads + SEO
// Region-filtered leads + local SEO management

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Target,
  Search,
  Globe,
  TrendingUp,
  BarChart,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { checkRegionAccess } from '@/services/franchiseRegionRBACService';
import { leadGeneratedFlow, seoRankUpdateFlow } from '@/services/franchiseFlowEngineService';
import '../../../styles/premium-7d-theme.css';

const FranchiseLeadsSEO = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'leads' | 'seo'>('leads');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'seo') {
      setActiveTab('seo');
    }
    loadData();
  }, [searchParams]);

  const loadData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Leads + SEO</h1>
        <p className="text-gray-400">Region-filtered leads and local SEO management</p>
      </div>

      <Card className="bg-[#1A2236] border border-indigo-500/20">
        <CardHeader>
          <div className="flex gap-4">
            <Button
              variant={activeTab === 'leads' ? 'default' : 'outline'}
              className={activeTab === 'leads' ? 'bg-indigo-500' : 'border-indigo-500 text-white hover:bg-indigo-500/10'}
              onClick={() => setActiveTab('leads')}
            >
              <Target className="w-4 h-4 mr-2" />
              Leads
            </Button>
            <Button
              variant={activeTab === 'seo' ? 'default' : 'outline'}
              className={activeTab === 'seo' ? 'bg-indigo-500' : 'border-indigo-500 text-white hover:bg-indigo-500/10'}
              onClick={() => setActiveTab('seo')}
            >
              <Globe className="w-4 h-4 mr-2" />
              SEO
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === 'leads' ? (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Leads management - Region filtered</p>
              <Button className="mt-4 bg-gradient-to-r from-indigo-500 to-cyan-500">
                <Plus className="w-4 h-4 mr-2" />
                Add Lead
              </Button>
            </div>
          ) : (
            <div className="text-center py-12">
              <Globe className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Local SEO management - Geo keywords</p>
              <Button className="mt-4 bg-gradient-to-r from-indigo-500 to-cyan-500">
                <Plus className="w-4 h-4 mr-2" />
                Add SEO
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FranchiseLeadsSEO;
