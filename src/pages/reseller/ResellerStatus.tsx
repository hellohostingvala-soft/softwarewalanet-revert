import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

export default function ResellerStatus() {
  const navigate = useNavigate();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplicationStatus();
  }, []);

  const fetchApplicationStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('reseller_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching application:', error);
      } else {
        setApplication(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-8 w-8 text-red-500" />;
      default:
        return <Clock className="h-8 w-8 text-yellow-500" />;
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

  if (!application) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl text-center">
          <CardHeader>
            <CardTitle>No Application Found</CardTitle>
            <CardDescription>
              You haven't submitted a reseller application yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/reseller/apply')}>
              Apply Now
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon(application.status)}
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Application Status
          </CardTitle>
          <CardDescription>
            Submitted on {new Date(application.created_at).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <Badge className={getStatusColor(application.status)}>
              {application.status.toUpperCase()}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Full Name:</strong> {application.full_name}
            </div>
            <div>
              <strong>Email:</strong> {application.email}
            </div>
            {application.phone && (
              <div>
                <strong>Phone:</strong> {application.phone}
              </div>
            )}
            {application.country && (
              <div>
                <strong>Country:</strong> {application.country}
              </div>
            )}
          </div>

          {application.status === 'approved' && (
            <div className="text-center">
              <p className="text-green-600 font-medium mb-4">
                Congratulations! Your application has been approved.
              </p>
              <Button onClick={() => navigate('/reseller/dashboard')}>
                Access Dashboard
              </Button>
            </div>
          )}

          {application.status === 'rejected' && (
            <div className="text-center">
              <p className="text-red-600 font-medium mb-2">
                Unfortunately, your application was not approved.
              </p>
              {application.rejection_reason && (
                <p className="text-sm text-gray-600 mb-4">
                  Reason: {application.rejection_reason}
                </p>
              )}
              <Button onClick={() => navigate('/reseller/apply')}>
                Apply Again
              </Button>
            </div>
          )}

          {application.status === 'pending' && (
            <div className="text-center">
              <p className="text-yellow-600 font-medium mb-4">
                Your application is under review. We'll notify you once it's processed.
              </p>
              <Button variant="outline" onClick={fetchApplicationStatus}>
                Refresh Status
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}