import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  UserPlus, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  MapPin,
  Building,
  Phone,
  Mail,
  AlertTriangle,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';

interface ResellerApplication {
  id: string;
  valaId: string;
  submittedAt: string;
  businessName: string;
  businessType: string;
  territory: string;
  region: string;
  contactPhone: string;
  contactEmail: string;
  experienceYears: number;
  expectedVolume: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected';
}

const mockApplications: ResellerApplication[] = [
  {
    id: '1',
    valaId: 'VL-RS-7829',
    submittedAt: '2024-01-15T10:30:00Z',
    businessName: 'Metro Sales Partners',
    businessType: 'B2B Distributor',
    territory: 'North Region',
    region: 'Maharashtra',
    contactPhone: '+91-98XXX-XXXXX',
    contactEmail: 'c***@metro.com',
    experienceYears: 5,
    expectedVolume: '50-100 leads/month',
    status: 'pending'
  },
  {
    id: '2',
    valaId: 'VL-RS-4512',
    submittedAt: '2024-01-14T14:20:00Z',
    businessName: 'South Trade Hub',
    businessType: 'Retail Network',
    territory: 'South Region',
    region: 'Karnataka',
    contactPhone: '+91-87XXX-XXXXX',
    contactEmail: 's***@tradehub.com',
    experienceYears: 3,
    expectedVolume: '25-50 leads/month',
    status: 'pending'
  }
];

export const RMApplicationsQueue: React.FC = () => {
  const [applications, setApplications] = useState<ResellerApplication[]>(mockApplications);
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [clarificationRequest, setClarificationRequest] = useState('');

  const handleApprove = (id: string) => {
    setApplications(prev => 
      prev.map(app => 
        app.id === id ? { ...app, status: 'approved' as const } : app
      )
    );
    toast.success('Reseller application approved');
    setSelectedApp(null);
  };

  const handleReject = (id: string) => {
    if (!rejectReason.trim()) {
      toast.error('Rejection reason is mandatory');
      return;
    }
    setApplications(prev => 
      prev.map(app => 
        app.id === id ? { ...app, status: 'rejected' as const } : app
      )
    );
    toast.success('Application rejected with reason logged');
    setRejectReason('');
    setSelectedApp(null);
  };

  const handleRequestClarification = (id: string) => {
    if (!clarificationRequest.trim()) {
      toast.error('Clarification request details required');
      return;
    }
    toast.success('Clarification request sent to applicant');
    setClarificationRequest('');
    setSelectedApp(null);
  };

  const pendingApps = applications.filter(app => app.status === 'pending');

  return (
    <Card className="bg-card border-border">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <UserPlus className="h-5 w-5 text-primary" />
            Reseller Applications Queue
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
              <Shield className="h-3 w-3 mr-1" />
              Auto-Approve BLOCKED
            </Badge>
            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
              <Shield className="h-3 w-3 mr-1" />
              Bulk Actions BLOCKED
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {pendingApps.length} applications pending individual review
        </p>
      </CardHeader>
      <CardContent className="p-4">
        <AnimatePresence>
          {pendingApps.map((app) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="border border-border rounded-lg p-4 mb-4 bg-background"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm text-primary">{app.valaId}</span>
                    <Badge variant="outline" className="text-xs">
                      {new Date(app.submittedAt).toLocaleDateString()}
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-foreground">{app.businessName}</h4>
                  <p className="text-sm text-muted-foreground">{app.businessType}</p>
                </div>
                <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500">
                  Pending Review
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{app.territory}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{app.region}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{app.contactPhone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{app.contactEmail}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4 text-sm">
                <span className="text-muted-foreground">
                  Experience: <strong className="text-foreground">{app.experienceYears} years</strong>
                </span>
                <span className="text-muted-foreground">
                  Expected Volume: <strong className="text-foreground">{app.expectedVolume}</strong>
                </span>
              </div>

              {selectedApp === app.id ? (
                <div className="space-y-4 border-t border-border pt-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Rejection Reason (mandatory for reject):
                    </label>
                    <Textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Provide detailed reason for rejection..."
                      className="bg-background border-border"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Request Clarification:
                    </label>
                    <Textarea
                      value={clarificationRequest}
                      onChange={(e) => setClarificationRequest(e.target.value)}
                      placeholder="What additional information do you need?"
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleApprove(app.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleReject(app.id)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleRequestClarification(app.id)}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Request Info
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setSelectedApp(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setSelectedApp(app.id)}
                >
                  Review Application
                </Button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {pendingApps.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <UserPlus className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>No pending applications</p>
          </div>
        )}

        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
            <p className="text-xs text-yellow-500">
              Each application must be reviewed individually. Auto-approve and bulk actions are permanently disabled for compliance.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
