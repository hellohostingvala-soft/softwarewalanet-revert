import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Eye, Clock } from 'lucide-react';

interface Application {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  country?: string;
  status: string;
  created_at: string;
  reviewer_notes?: string;
  rejection_reason?: string;
}

export default function AdminResellerApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('reseller_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch applications');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (applicationId: string) => {
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('reseller-approve', {
        body: {
          application_id: applicationId,
          action: 'approve',
          reviewer_notes: reviewerNotes
        }
      });

      if (error) throw error;

      toast.success('Application approved successfully!');
      setSelectedApp(null);
      setReviewerNotes('');
      fetchApplications();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve application');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (applicationId: string) => {
    if (!reviewerNotes.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('reseller-approve', {
        body: {
          application_id: applicationId,
          action: 'reject',
          reviewer_notes: reviewerNotes
        }
      });

      if (error) throw error;

      toast.success('Application rejected');
      setSelectedApp(null);
      setReviewerNotes('');
      fetchApplications();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject application');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reseller Applications</h1>
          <p className="text-gray-600 mt-2">
            Review and manage reseller applications
          </p>
        </div>

        <div className="grid gap-6">
          {applications.map((app) => (
            <Card key={app.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(app.status)}
                    <div>
                      <CardTitle className="text-lg">{app.full_name}</CardTitle>
                      <CardDescription>{app.email}</CardDescription>
                    </div>
                  </div>
                  <Badge className={getStatusColor(app.status)}>
                    {app.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <strong>Phone:</strong> {app.phone || 'N/A'}
                  </div>
                  <div>
                    <strong>Country:</strong> {app.country || 'N/A'}
                  </div>
                  <div>
                    <strong>Applied:</strong> {new Date(app.created_at).toLocaleDateString()}
                  </div>
                </div>

                {app.status === 'pending' && (
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedApp(app)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Review Application</DialogTitle>
                          <DialogDescription>
                            Review the application details and make a decision
                          </DialogDescription>
                        </DialogHeader>

                        {selectedApp && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <strong>Name:</strong> {selectedApp.full_name}
                              </div>
                              <div>
                                <strong>Email:</strong> {selectedApp.email}
                              </div>
                              <div>
                                <strong>Phone:</strong> {selectedApp.phone || 'N/A'}
                              </div>
                              <div>
                                <strong>Country:</strong> {selectedApp.country || 'N/A'}
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="notes">Reviewer Notes (Optional)</Label>
                              <Textarea
                                id="notes"
                                placeholder="Add any notes about this application..."
                                value={reviewerNotes}
                                onChange={(e) => setReviewerNotes(e.target.value)}
                              />
                            </div>

                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="destructive"
                                onClick={() => handleReject(selectedApp.id)}
                                disabled={processing}
                              >
                                {processing ? 'Processing...' : 'Reject'}
                              </Button>
                              <Button
                                onClick={() => handleApprove(selectedApp.id)}
                                disabled={processing}
                              >
                                {processing ? 'Processing...' : 'Approve'}
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                )}

                {(app.status === 'approved' || app.status === 'rejected') && (
                  <div className="text-sm text-gray-600">
                    {app.reviewer_notes && (
                      <p><strong>Notes:</strong> {app.reviewer_notes}</p>
                    )}
                    {app.rejection_reason && (
                      <p><strong>Rejection Reason:</strong> {app.rejection_reason}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {applications.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No applications found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}