// Franchise Settings
// Profile + region + tax + bank

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Settings,
  User,
  MapPin,
  DollarSign,
  Building2,
  Save,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import '../../../styles/premium-7d-theme.css';

const FranchiseSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [region, setRegion] = useState({
    country: 'United States',
    state: 'California',
    city: 'Los Angeles',
  });
  const [tax, setTax] = useState({
    gst: 10,
    pan: '',
  });
  const [bank, setBank] = useState({
    accountNumber: '',
    ifsc: '',
    bankName: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProfile({
        name: 'Franchise Admin',
        email: 'admin@franchise.com',
        phone: '+1-555-0100',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Manage your franchise profile and configurations</p>
        </div>
        <Button className="bg-gradient-to-r from-indigo-500 to-cyan-500" onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile */}
        <Card className="bg-[#1A2236] border border-indigo-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Name</label>
              <Input
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="bg-[#0B0F1A] border-indigo-500/20 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Email</label>
              <Input
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="bg-[#0B0F1A] border-indigo-500/20 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Phone</label>
              <Input
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="bg-[#0B0F1A] border-indigo-500/20 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Region */}
        <Card className="bg-[#1A2236] border border-indigo-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Region
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Country</label>
              <Input
                value={region.country}
                onChange={(e) => setRegion({ ...region, country: e.target.value })}
                className="bg-[#0B0F1A] border-indigo-500/20 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">State</label>
              <Input
                value={region.state}
                onChange={(e) => setRegion({ ...region, state: e.target.value })}
                className="bg-[#0B0F1A] border-indigo-500/20 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">City</label>
              <Input
                value={region.city}
                onChange={(e) => setRegion({ ...region, city: e.target.value })}
                className="bg-[#0B0F1A] border-indigo-500/20 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tax */}
        <Card className="bg-[#1A2236] border border-indigo-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Tax
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">GST Rate (%)</label>
              <Input
                type="number"
                value={tax.gst}
                onChange={(e) => setTax({ ...tax, gst: parseInt(e.target.value) })}
                className="bg-[#0B0F1A] border-indigo-500/20 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">PAN Number</label>
              <Input
                value={tax.pan}
                onChange={(e) => setTax({ ...tax, pan: e.target.value })}
                className="bg-[#0B0F1A] border-indigo-500/20 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Bank */}
        <Card className="bg-[#1A2236] border border-indigo-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Bank Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Account Number</label>
              <Input
                value={bank.accountNumber}
                onChange={(e) => setBank({ ...bank, accountNumber: e.target.value })}
                className="bg-[#0B0F1A] border-indigo-500/20 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">IFSC Code</label>
              <Input
                value={bank.ifsc}
                onChange={(e) => setBank({ ...bank, ifsc: e.target.value })}
                className="bg-[#0B0F1A] border-indigo-500/20 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Bank Name</label>
              <Input
                value={bank.bankName}
                onChange={(e) => setBank({ ...bank, bankName: e.target.value })}
                className="bg-[#0B0F1A] border-indigo-500/20 text-white"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FranchiseSettings;
