// Franchise Legal
// Agreements + logs

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  Eye,
  Scale,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import '../../../styles/premium-7d-theme.css';

interface Agreement {
  id: string;
  name: string;
  type: 'franchise' | 'nda' | 'service' | 'privacy';
  version: string;
  signedAt: Date;
  expiresAt?: Date;
  status: 'active' | 'expired' | 'pending';
}

const FranchiseLegal = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [agreements, setAgreements] = useState<Agreement[]>([]);

  useEffect(() => {
    loadAgreements();
  }, []);

  const loadAgreements = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAgreements([
        {
          id: '1',
          name: 'Franchise Agreement',
          type: 'franchise',
          version: '2.0',
          signedAt: new Date('2024-01-01'),
          expiresAt: new Date('2025-01-01'),
          status: 'active',
        },
        {
          id: '2',
          name: 'NDA',
          type: 'nda',
          version: '1.0',
          signedAt: new Date('2024-01-01'),
          status: 'active',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading agreements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Legal</h1>
        <p className="text-gray-400">Agreements and compliance logs</p>
      </div>

      <Card className="bg-[#1A2236] border border-indigo-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Scale className="w-5 h-5" />
            Agreements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agreements.map((agreement) => (
              <motion.div
                key={agreement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border border-indigo-500/20 rounded-lg hover:bg-indigo-500/5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-indigo-500/10">
                      <FileText className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{agreement.name}</p>
                      <p className="text-sm text-gray-400">Version: {agreement.version} • Signed: {agreement.signedAt.toLocaleDateString()}</p>
                      {agreement.expiresAt && <p className="text-xs text-gray-500">Expires: {agreement.expiresAt.toLocaleDateString()}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={agreement.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}>
                      {agreement.status}
                    </Badge>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="border-indigo-500 text-white hover:bg-indigo-500/10">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="border-indigo-500 text-white hover:bg-indigo-500/10">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FranchiseLegal;
