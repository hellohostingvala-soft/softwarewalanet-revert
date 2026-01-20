/**
 * FRANCHISE OWNER LEGAL SCREEN
 * Legal & Compliance management
 */

import React, { useState } from 'react';
import { 
  Scale, FileText, Shield, Copyright, CheckCircle2, 
  AlertTriangle, Clock, Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Agreement {
  id: string;
  title: string;
  type: 'terms' | 'privacy' | 'copyright' | 'trademark';
  version: string;
  acceptedAt?: string;
  status: 'accepted' | 'pending' | 'expired';
}

const AGREEMENTS: Agreement[] = [
  { id: '1', title: 'Terms & Conditions', type: 'terms', version: 'v2.1', acceptedAt: '2024-01-15', status: 'accepted' },
  { id: '2', title: 'Privacy Policy', type: 'privacy', version: 'v1.5', acceptedAt: '2024-01-15', status: 'accepted' },
  { id: '3', title: 'Copyright Notice', type: 'copyright', version: 'v1.0', acceptedAt: '2024-01-15', status: 'accepted' },
  { id: '4', title: 'Trademark Policy', type: 'trademark', version: 'v1.2', status: 'pending' },
];

const CONSENT_LOG = [
  { id: '1', action: 'Terms & Conditions Accepted', date: '2024-01-15 10:30 AM', ip: '192.168.x.x', device: 'Chrome/Windows' },
  { id: '2', action: 'Privacy Policy Accepted', date: '2024-01-15 10:30 AM', ip: '192.168.x.x', device: 'Chrome/Windows' },
  { id: '3', action: 'Order Agreement Signed', date: '2024-01-18 02:15 PM', ip: '192.168.x.x', device: 'Chrome/Windows' },
];

export function FOLegalScreen() {
  const [activeTab, setActiveTab] = useState('agreements');
  const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(null);
  const [acceptChecked, setAcceptChecked] = useState(false);

  const getTypeIcon = (type: Agreement['type']) => {
    switch (type) {
      case 'terms': return <FileText className="h-4 w-4" />;
      case 'privacy': return <Shield className="h-4 w-4" />;
      case 'copyright': return <Copyright className="h-4 w-4" />;
      case 'trademark': return <Scale className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: Agreement['status']) => {
    switch (status) {
      case 'accepted': return <Badge className="bg-emerald-500/20 text-emerald-400"><CheckCircle2 className="h-3 w-3 mr-1" />Accepted</Badge>;
      case 'pending': return <Badge className="bg-amber-500/20 text-amber-400"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'expired': return <Badge className="bg-destructive/20 text-destructive"><AlertTriangle className="h-3 w-3 mr-1" />Expired</Badge>;
    }
  };

  const handleAccept = () => {
    if (!acceptChecked) {
      toast.error('Please check the acceptance box');
      return;
    }
    toast.success(`${selectedAgreement?.title} accepted successfully`);
    setSelectedAgreement(null);
    setAcceptChecked(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            Legal & Compliance
          </h1>
          <p className="text-muted-foreground text-sm">Manage agreements and compliance</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="agreements">Agreements</TabsTrigger>
          <TabsTrigger value="consent">Consent Log</TabsTrigger>
        </TabsList>

        {/* Agreements Tab */}
        <TabsContent value="agreements" className="mt-4 space-y-3">
          <Card className="bg-muted/30 p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="text-sm">Digital consent is required before placing any order</span>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AGREEMENTS.map((agreement) => (
              <Card key={agreement.id} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        {getTypeIcon(agreement.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{agreement.title}</h3>
                        <p className="text-xs text-muted-foreground">Version: {agreement.version}</p>
                        {agreement.acceptedAt && (
                          <p className="text-xs text-muted-foreground">Accepted: {agreement.acceptedAt}</p>
                        )}
                        <div className="mt-2">
                          {getStatusBadge(agreement.status)}
                        </div>
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon" onClick={() => setSelectedAgreement(agreement)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{agreement.title}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <p>This is a sample {agreement.title.toLowerCase()} document. In a production environment, this would contain the full legal text.</p>
                            <h4>1. Acceptance of Terms</h4>
                            <p>By using our services, you agree to be bound by these terms...</p>
                            <h4>2. Services Description</h4>
                            <p>Software Vala provides software development and related services...</p>
                            <h4>3. User Obligations</h4>
                            <p>Users are responsible for maintaining the confidentiality of their account...</p>
                            <h4>4. Intellectual Property</h4>
                            <p>All software and content remain the property of Software Vala...</p>
                            <h4>5. Limitation of Liability</h4>
                            <p>Software Vala shall not be liable for any indirect damages...</p>
                          </div>

                          {agreement.status === 'pending' && (
                            <div className="space-y-4 pt-4 border-t border-border">
                              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                                <Checkbox 
                                  id="accept" 
                                  checked={acceptChecked}
                                  onCheckedChange={(checked) => setAcceptChecked(checked as boolean)}
                                />
                                <Label htmlFor="accept" className="text-sm cursor-pointer">
                                  I have read and agree to the {agreement.title}
                                </Label>
                              </div>
                              <Button className="w-full" onClick={handleAccept} disabled={!acceptChecked}>
                                Accept Agreement
                              </Button>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Consent Log Tab */}
        <TabsContent value="consent" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Agreement Acceptance Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {CONSENT_LOG.map((log) => (
                  <div key={log.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <div>
                        <p className="font-medium text-sm">{log.action}</p>
                        <p className="text-xs text-muted-foreground">{log.date}</p>
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>IP: {log.ip}</p>
                      <p>{log.device}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
