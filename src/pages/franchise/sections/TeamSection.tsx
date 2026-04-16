// Team Section
// Role templates + activity feed + invite via link

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Copy, Clock, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const TeamSection = () => {
  const [inviteLink, setInviteLink] = useState('https://yourdomain.com/invite/fr-abc123');
  const [copied, setCopied] = useState(false);

  const team = [
    { id: 1, name: 'John Manager', role: 'Manager', status: 'active', lastActivity: '2 hours ago' },
    { id: 2, name: 'Sarah Sales', role: 'Sales Rep', status: 'active', lastActivity: '5 minutes ago' },
    { id: 3, name: 'Mike Support', role: 'Support', status: 'inactive', lastActivity: '2 days ago' },
  ];

  const roleTemplates = [
    { name: 'Sales Representative', permissions: ['View Leads', 'Add Leads', 'View Orders'] },
    { name: 'Manager', permissions: ['All Sales Permissions', 'Approve Orders', 'View Reports'] },
    { name: 'Support', permissions: ['View Customers', 'Respond to Tickets', 'View Orders'] },
  ];

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Invite link copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Invite Link */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Invite Team Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input value={inviteLink} readOnly className="flex-1" />
              <Button onClick={handleCopyInviteLink}>
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Link expires in 7 days • Single use • Role: Sales Representative
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Role Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Role Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {roleTemplates.map((template, index) => (
              <div key={index} className="p-3 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{template.name}</p>
                  <Button size="sm" variant="outline">Use Template</Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {template.permissions.map((perm, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{perm}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {team.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{member.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={member.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}>
                    {member.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {member.lastActivity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamSection;
