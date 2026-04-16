// Settings Section
// Security (2FA, device sessions) + permission diff viewer

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Settings, Shield, Smartphone, Globe, Bell, Lock } from 'lucide-react';

const SettingsSection = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const devices = [
    { id: 1, name: 'Chrome on Windows', lastActive: '2 hours ago', current: true },
    { id: 2, name: 'Safari on iPhone', lastActive: '1 day ago', current: false },
    { id: 3, name: 'Firefox on Mac', lastActive: '3 days ago', current: false },
  ];

  const permissions = [
    { resource: 'Orders', permission: 'Full Access' },
    { resource: 'Customers', permission: 'View Only' },
    { resource: 'Wallet', permission: 'Full Access' },
    { resource: 'Team', permission: 'Manage' },
  ];

  return (
    <div className="space-y-6">
      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
              </div>
            </div>
            <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Login Notifications</p>
                <p className="text-sm text-muted-foreground">Get notified of new logins</p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Device Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Active Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {devices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{device.name}</p>
                    <p className="text-sm text-muted-foreground">Last active: {device.lastActive}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {device.current && <Badge className="bg-green-500/10 text-green-500">Current</Badge>}
                  {!device.current && <Button size="sm" variant="destructive">Revoke</Button>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {permissions.map((perm, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <p className="font-medium">{perm.resource}</p>
                  <p className="text-sm text-muted-foreground">Access level</p>
                </div>
                <Badge className="bg-blue-500/10 text-blue-500">{perm.permission}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Receive email updates</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-muted-foreground">Use dark theme</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsSection;
