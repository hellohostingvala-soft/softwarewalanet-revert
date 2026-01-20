/**
 * FRANCHISE OWNER LEADS & SEO SCREEN
 * Lead management + SEO setup
 */

import React, { useState } from 'react';
import { 
  Target, Search, Filter, Globe, TrendingUp, Facebook, Instagram,
  FileText, UserPlus, Phone, Mail, CheckCircle2, Clock, XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Lead {
  id: string;
  name: string;
  email: string;
  mobile: string;
  source: 'seo' | 'google_ads' | 'facebook' | 'instagram' | 'landing_page' | 'manual';
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  assignedTo?: string;
  createdAt: string;
}

const MOCK_LEADS: Lead[] = [
  { id: '1', name: 'John D***', email: 'joh***@email.com', mobile: '+91 98***45', source: 'seo', status: 'new', createdAt: '2024-01-20' },
  { id: '2', name: 'Sarah M***', email: 'sar***@email.com', mobile: '+91 87***12', source: 'google_ads', status: 'contacted', assignedTo: 'Staff A', createdAt: '2024-01-19' },
  { id: '3', name: 'Mike R***', email: 'mik***@email.com', mobile: '+91 76***89', source: 'facebook', status: 'qualified', assignedTo: 'Staff B', createdAt: '2024-01-18' },
  { id: '4', name: 'Lisa K***', email: 'lis***@email.com', mobile: '+91 65***34', source: 'instagram', status: 'converted', assignedTo: 'Staff A', createdAt: '2024-01-15' },
];

export function FOLeadsSEOScreen() {
  const [activeTab, setActiveTab] = useState('leads');
  const [searchQuery, setSearchQuery] = useState('');

  const getSourceIcon = (source: Lead['source']) => {
    switch (source) {
      case 'seo': return <Globe className="h-3 w-3" />;
      case 'google_ads': return <TrendingUp className="h-3 w-3" />;
      case 'facebook': return <Facebook className="h-3 w-3" />;
      case 'instagram': return <Instagram className="h-3 w-3" />;
      case 'landing_page': return <FileText className="h-3 w-3" />;
      case 'manual': return <UserPlus className="h-3 w-3" />;
    }
  };

  const getStatusBadge = (status: Lead['status']) => {
    switch (status) {
      case 'new': return <Badge className="bg-blue-500/20 text-blue-400">New</Badge>;
      case 'contacted': return <Badge className="bg-amber-500/20 text-amber-400">Contacted</Badge>;
      case 'qualified': return <Badge className="bg-purple-500/20 text-purple-400">Qualified</Badge>;
      case 'converted': return <Badge className="bg-emerald-500/20 text-emerald-400">Converted</Badge>;
      case 'lost': return <Badge className="bg-destructive/20 text-destructive">Lost</Badge>;
    }
  };

  const handleSaveSEO = () => {
    toast.success('SEO settings saved successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Leads & SEO
          </h1>
          <p className="text-muted-foreground text-sm">Manage leads and optimize SEO</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="leads">Lead Management</TabsTrigger>
          <TabsTrigger value="seo">SEO Setup</TabsTrigger>
          <TabsTrigger value="sources">Lead Sources</TabsTrigger>
        </TabsList>

        {/* Leads Tab */}
        <TabsContent value="leads" className="mt-4 space-y-4">
          {/* Search */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search leads..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Leads List */}
          <div className="space-y-3">
            {MOCK_LEADS.map((lead) => (
              <Card key={lead.id} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{lead.name}</span>
                        {getStatusBadge(lead.status)}
                        <Badge variant="outline" className="text-[10px] gap-1">
                          {getSourceIcon(lead.source)}
                          {lead.source.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{lead.email}</span>
                        <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{lead.mobile}</span>
                      </div>
                      {lead.assignedTo && (
                        <p className="text-xs text-muted-foreground mt-1">Assigned to: {lead.assignedTo}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Follow-up</Button>
                      <Button size="sm">View</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                SEO Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Meta Title</Label>
                  <Input placeholder="Your business title for search engines" />
                </div>
                <div className="space-y-2">
                  <Label>Keywords</Label>
                  <Input placeholder="keyword1, keyword2, keyword3" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Textarea placeholder="Description for search engine results (max 160 chars)" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-muted/30 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sitemap Status</span>
                    <Badge className="bg-emerald-500/20 text-emerald-400"><CheckCircle2 className="h-3 w-3 mr-1" />Active</Badge>
                  </div>
                </Card>
                <Card className="bg-muted/30 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Indexing Status</span>
                    <Badge className="bg-emerald-500/20 text-emerald-400"><CheckCircle2 className="h-3 w-3 mr-1" />Indexed</Badge>
                  </div>
                </Card>
              </div>
              <Button onClick={handleSaveSEO}>Save SEO Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sources Tab */}
        <TabsContent value="sources" className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'SEO', icon: Globe, count: 24, color: 'bg-blue-500' },
              { label: 'Google Ads', icon: TrendingUp, count: 18, color: 'bg-amber-500' },
              { label: 'Facebook', icon: Facebook, count: 12, color: 'bg-indigo-500' },
              { label: 'Instagram', icon: Instagram, count: 8, color: 'bg-pink-500' },
              { label: 'Landing Pages', icon: FileText, count: 6, color: 'bg-purple-500' },
              { label: 'Manual', icon: UserPlus, count: 4, color: 'bg-emerald-500' },
            ].map((source, i) => (
              <Card key={i} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${source.color}`}>
                      <source.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{source.count}</p>
                      <p className="text-sm text-muted-foreground">{source.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
