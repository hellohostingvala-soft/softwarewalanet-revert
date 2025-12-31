// ==============================================
// Secrets Management
// Masked Only - Rotation Supported
// No Plaintext - No Download
// ==============================================

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Key, Eye, EyeOff, RotateCcw, Clock, 
  Shield, AlertTriangle, CheckCircle, Lock
} from 'lucide-react';
import { toast } from 'sonner';

interface Secret {
  id: string;
  name: string;
  type: 'api_key' | 'database' | 'certificate' | 'oauth' | 'encryption';
  environment: 'production' | 'staging' | 'all';
  maskedValue: string;
  lastRotated: string;
  expiresAt: string | null;
  rotationPolicy: string;
  status: 'active' | 'expiring_soon' | 'expired' | 'rotating';
}

export function SMSecrets() {
  const [secrets, setSecrets] = useState<Secret[]>([
    {
      id: 'sec-001',
      name: 'DATABASE_URL',
      type: 'database',
      environment: 'production',
      maskedValue: 'postgresql://****:****@****:5432/****',
      lastRotated: '2024-01-15',
      expiresAt: '2024-04-15',
      rotationPolicy: 'Every 90 days',
      status: 'active',
    },
    {
      id: 'sec-002',
      name: 'API_SECRET_KEY',
      type: 'api_key',
      environment: 'all',
      maskedValue: 'sk_live_****************************',
      lastRotated: '2024-01-01',
      expiresAt: null,
      rotationPolicy: 'Manual',
      status: 'active',
    },
    {
      id: 'sec-003',
      name: 'JWT_SIGNING_KEY',
      type: 'encryption',
      environment: 'production',
      maskedValue: '************************************',
      lastRotated: '2024-01-20',
      expiresAt: '2024-02-20',
      rotationPolicy: 'Every 30 days',
      status: 'expiring_soon',
    },
    {
      id: 'sec-004',
      name: 'OAUTH_CLIENT_SECRET',
      type: 'oauth',
      environment: 'production',
      maskedValue: '****-****-****-****',
      lastRotated: '2023-12-01',
      expiresAt: '2024-02-01',
      rotationPolicy: 'Every 60 days',
      status: 'expired',
    },
    {
      id: 'sec-005',
      name: 'TLS_CERTIFICATE',
      type: 'certificate',
      environment: 'production',
      maskedValue: '-----BEGIN CERTIFICATE-----****',
      lastRotated: '2024-01-10',
      expiresAt: '2025-01-10',
      rotationPolicy: 'Annual',
      status: 'active',
    },
  ]);

  const [rotatingSecret, setRotatingSecret] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'expiring_soon': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'expired': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'rotating': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'database': return '🗄️';
      case 'api_key': return '🔑';
      case 'certificate': return '📜';
      case 'oauth': return '🔐';
      case 'encryption': return '🔒';
      default: return '🔑';
    }
  };

  const handleRotate = async (secretId: string, secretName: string) => {
    setRotatingSecret(secretId);
    toast.info(`Rotating ${secretName}...`);
    
    // Simulate rotation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setSecrets(prev => prev.map(sec => 
      sec.id === secretId 
        ? { 
            ...sec, 
            status: 'active' as const, 
            lastRotated: new Date().toISOString().split('T')[0],
            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          }
        : sec
    ));
    
    setRotatingSecret(null);
    toast.success(`${secretName} rotated successfully`);
  };

  const handleViewSecret = () => {
    toast.error('BLOCKED: Plaintext secret viewing is not allowed');
  };

  const handleDownload = () => {
    toast.error('BLOCKED: Secret download is not allowed');
  };

  const filteredSecrets = secrets.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Key className="h-5 w-5 text-primary" />
          Secrets Management
        </h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-500/10 text-green-400">
            <Shield className="h-3 w-3 mr-1" />
            Encrypted at Rest
          </Badge>
        </div>
      </div>

      {/* Security Notice */}
      <Card className="bg-red-500/10 border-red-500/30">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 text-sm text-red-400">
            <Lock className="h-4 w-4" />
            <span>Secrets are masked. No plaintext viewing or downloading allowed. Rotation supported.</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Search secrets..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400">
            {secrets.filter(s => s.status === 'expiring_soon').length} Expiring
          </Badge>
          <Badge variant="outline" className="bg-red-500/10 text-red-400">
            {secrets.filter(s => s.status === 'expired').length} Expired
          </Badge>
        </div>
      </div>

      <div className="space-y-3">
        {filteredSecrets.map(secret => (
          <Card key={secret.id} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{getTypeIcon(secret.type)}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium">{secret.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {secret.type.replace('_', ' ')}
                      </Badge>
                      <Badge className={secret.environment === 'production' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}>
                        {secret.environment}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Badge className={getStatusColor(secret.status)}>
                  {secret.status === 'rotating' && <RotateCcw className="h-3 w-3 mr-1 animate-spin" />}
                  {secret.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                  {secret.status === 'expiring_soon' && <Clock className="h-3 w-3 mr-1" />}
                  {secret.status === 'expired' && <AlertTriangle className="h-3 w-3 mr-1" />}
                  {secret.status.toUpperCase().replace('_', ' ')}
                </Badge>
              </div>

              <div className="bg-muted/50 p-2 rounded font-mono text-sm mb-3">
                {secret.maskedValue}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                <div>
                  <span className="text-muted-foreground">Last Rotated:</span>
                  <span className="ml-2">{secret.lastRotated}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Expires:</span>
                  <span className={`ml-2 ${secret.status === 'expired' ? 'text-red-400' : secret.status === 'expiring_soon' ? 'text-yellow-400' : ''}`}>
                    {secret.expiresAt || 'Never'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Policy:</span>
                  <span className="ml-2">{secret.rotationPolicy}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-border">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRotate(secret.id, secret.name)}
                  disabled={rotatingSecret === secret.id}
                  className="text-xs"
                >
                  <RotateCcw className={`h-3 w-3 mr-1 ${rotatingSecret === secret.id ? 'animate-spin' : ''}`} />
                  Rotate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleViewSecret}
                  className="text-xs text-muted-foreground"
                  disabled
                >
                  <EyeOff className="h-3 w-3 mr-1" />
                  View (Blocked)
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownload}
                  className="text-xs text-muted-foreground"
                  disabled
                >
                  Download (Blocked)
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
