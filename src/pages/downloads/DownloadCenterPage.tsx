// Download Center Page
// /downloads route with license check

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  FileText,
  Package,
  Image,
  Video,
  FileCode,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import '../../../styles/premium-7d-theme.css';

interface DownloadItem {
  id: string;
  name: string;
  type: 'document' | 'software' | 'image' | 'video' | 'code';
  size: string;
  version: string;
  licenseRequired: boolean;
  hasLicense: boolean;
  downloadUrl: string;
  createdAt: Date;
}

const DownloadCenterPage = () => {
  const [loading, setLoading] = useState(true);
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);

  useEffect(() => {
    loadDownloads();
  }, []);

  const loadDownloads = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDownloads([
        {
          id: '1',
          name: 'Product Documentation',
          type: 'document',
          size: '2.5 MB',
          version: '1.0.0',
          licenseRequired: false,
          hasLicense: true,
          downloadUrl: '#',
          createdAt: new Date('2024-01-15'),
        },
        {
          id: '2',
          name: 'CRM Pro Installer',
          type: 'software',
          size: '45.2 MB',
          version: '2.1.0',
          licenseRequired: true,
          hasLicense: true,
          downloadUrl: '#',
          createdAt: new Date('2024-01-16'),
        },
        {
          id: '3',
          name: 'Project Manager Plus',
          type: 'software',
          size: '52.8 MB',
          version: '1.5.0',
          licenseRequired: true,
          hasLicense: false,
          downloadUrl: '#',
          createdAt: new Date('2024-01-17'),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (item: DownloadItem) => {
    if (item.licenseRequired && !item.hasLicense) {
      toast({
        title: "License Required",
        description: "You need a valid license to download this item",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Download Started",
      description: `Downloading ${item.name}`,
    });
  };

  const getTypeIcon = (type: DownloadItem['type']) => {
    switch (type) {
      case 'document':
        return <FileText className="w-5 h-5" />;
      case 'software':
        return <Package className="w-5 h-5" />;
      case 'image':
        return <Image className="w-5 h-5" />;
      case 'video':
        return <Video className="w-5 h-5" />;
      case 'code':
        return <FileCode className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading downloads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Download Center</h1>
        <p className="text-gray-400">Access your purchased software and resources</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {downloads.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-[#1A2236] border border-indigo-500/20 hover:border-indigo-500/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="p-3 rounded-full bg-indigo-500/10">
                    {getTypeIcon(item.type)}
                  </div>
                  {item.licenseRequired && (
                    <Badge className={item.hasLicense ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}>
                      {item.hasLicense ? 'Licensed' : 'No License'}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-white text-lg">{item.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Size</span>
                    <span className="text-white">{item.size}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Version</span>
                    <span className="text-white">{item.version}</span>
                  </div>
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500"
                  onClick={() => handleDownload(item)}
                  disabled={item.licenseRequired && !item.hasLicense}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {downloads.length === 0 && (
        <div className="text-center py-12">
          <Download className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No downloads available</p>
        </div>
      )}
    </div>
  );
};

export default DownloadCenterPage;
