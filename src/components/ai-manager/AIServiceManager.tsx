/**
 * AIServiceManager – Admin panel for managing API service configurations.
 * Provides CRUD, status toggles, key rotation, fallback assignment, cost caps.
 */

import { useState, useEffect, useCallback } from 'react';
import { Plus, RotateCcw, Power, PowerOff, Edit2, TestTube, Loader2, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  adminCreateService,
  adminListServices,
  adminSetStatus,
  adminRotateKey,
  adminTestService,
} from '@/routes/admin/ai-services';

type ServiceStatus = 'active' | 'disabled' | 'maintenance';

interface ServiceRecord {
  id: string;
  service_name: string;
  base_url: string;
  api_key: string;
  status: ServiceStatus;
  rate_limit: string | null;
  max_monthly_cost: number | null;
  last_used_at: string | null;
  created_at: string;
}

const STATUS_COLORS: Record<ServiceStatus, string> = {
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50',
  disabled: 'bg-red-500/10 text-red-400 border-red-500/50',
  maintenance: 'bg-amber-500/10 text-amber-400 border-amber-500/50',
};

const PROVIDERS = [
  { label: 'OpenAI', value: 'openai', url: 'https://api.openai.com/v1' },
  { label: 'ElevenLabs', value: 'elevenlabs', url: 'https://api.elevenlabs.io/v1' },
  { label: 'GitHub', value: 'github', url: 'https://api.github.com' },
  { label: 'WhatsApp Cloud', value: 'whatsapp', url: 'https://graph.facebook.com/v18.0' },
  { label: 'Stripe', value: 'stripe', url: 'https://api.stripe.com' },
  { label: 'Firebase FCM', value: 'firebase_fcm', url: 'https://fcm.googleapis.com' },
];

export const AIServiceManager = () => {
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showRotate, setShowRotate] = useState<ServiceRecord | null>(null);

  const [newSvc, setNewSvc] = useState({
    service_name: '',
    base_url: '',
    api_key_plaintext: '',
    rate_limit: '',
    max_monthly_cost: '',
  });
  const [newKey, setNewKey] = useState('');

  const fetchServices = useCallback(async () => {
    setLoading(true);
    const data = await adminListServices();
    setServices(data as ServiceRecord[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleCreate = async () => {
    if (!newSvc.service_name || !newSvc.base_url || !newSvc.api_key_plaintext) {
      toast.error('Name, Base URL and API Key are required');
      return;
    }
    const { data, error } = await adminCreateService({
      service_name: newSvc.service_name,
      base_url: newSvc.base_url,
      api_key_plaintext: newSvc.api_key_plaintext,
      rate_limit: newSvc.rate_limit || undefined,
      max_monthly_cost: newSvc.max_monthly_cost ? Number(newSvc.max_monthly_cost) : null,
    });
    if (error) {
      toast.error(`Failed to create service: ${error}`);
    } else {
      toast.success(`Service "${data?.service_name}" created`);
      setShowCreate(false);
      setNewSvc({ service_name: '', base_url: '', api_key_plaintext: '', rate_limit: '', max_monthly_cost: '' });
      fetchServices();
    }
  };

  const handleToggleStatus = async (svc: ServiceRecord) => {
    setActionId(svc.id);
    const nextStatus: ServiceStatus = svc.status === 'active' ? 'disabled' : 'active';
    const { error } = await adminSetStatus(svc.id, nextStatus);
    if (error) toast.error(`Status update failed: ${error}`);
    else toast.success(`${svc.service_name} is now ${nextStatus}`);
    await fetchServices();
    setActionId(null);
  };

  const handleTest = async (svc: ServiceRecord) => {
    setActionId(svc.id);
    const result = await adminTestService(svc.id);
    if (result.ok) toast.success(`${svc.service_name}: connectivity test passed`);
    else toast.error(`${svc.service_name}: test failed – ${result.error}`);
    setActionId(null);
  };

  const handleRotate = async () => {
    if (!showRotate || !newKey) return;
    setActionId(showRotate.id);
    const { error } = await adminRotateKey(showRotate.id, newKey);
    if (error) toast.error(`Key rotation failed: ${error}`);
    else toast.success(`API key rotated for ${showRotate.service_name}`);
    setNewKey('');
    setShowRotate(null);
    setActionId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6 text-violet-400" />
            AI Service Manager
          </h1>
          <p className="text-sm text-muted-foreground">
            Centralized API key management – all keys encrypted with AES-256
          </p>
        </div>
        <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Configured Services</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/20 hover:bg-muted/20">
                  <TableHead>Service</TableHead>
                  <TableHead>Base URL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rate Limit</TableHead>
                  <TableHead>Max Cost/mo</TableHead>
                  <TableHead>API Key</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map(svc => (
                  <TableRow key={svc.id} className="hover:bg-muted/10">
                    <TableCell className="font-medium">{svc.service_name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[180px] truncate">{svc.base_url}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn('text-[10px]', STATUS_COLORS[svc.status])}>
                        {svc.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{svc.rate_limit ?? '—'}</TableCell>
                    <TableCell className="text-xs text-emerald-400">
                      {svc.max_monthly_cost != null ? `$${svc.max_monthly_cost}` : '—'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">{svc.api_key}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {actionId === svc.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-blue-400 hover:bg-blue-500/20"
                              title="Test connectivity"
                              onClick={() => handleTest(svc)}
                            >
                              <TestTube className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-amber-400 hover:bg-amber-500/20"
                              title="Rotate API Key"
                              onClick={() => setShowRotate(svc)}
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn(
                                'h-7 w-7',
                                svc.status === 'active'
                                  ? 'text-red-400 hover:bg-red-500/20'
                                  : 'text-emerald-400 hover:bg-emerald-500/20'
                              )}
                              title={svc.status === 'active' ? 'Disable' : 'Enable'}
                              onClick={() => handleToggleStatus(svc)}
                            >
                              {svc.status === 'active' ? (
                                <PowerOff className="w-3.5 h-3.5" />
                              ) : (
                                <Power className="w-3.5 h-3.5" />
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {services.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No services configured. Click "Add Service" to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Service Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New AI Service</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Provider Preset</Label>
              <Select
                onValueChange={v => {
                  const p = PROVIDERS.find(x => x.value === v);
                  if (p) setNewSvc(prev => ({ ...prev, service_name: p.label, base_url: p.url }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a provider…" />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDERS.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Service Name *</Label>
              <Input
                value={newSvc.service_name}
                onChange={e => setNewSvc(prev => ({ ...prev, service_name: e.target.value }))}
                placeholder="e.g. OpenAI Production"
              />
            </div>
            <div className="space-y-2">
              <Label>Base URL *</Label>
              <Input
                value={newSvc.base_url}
                onChange={e => setNewSvc(prev => ({ ...prev, base_url: e.target.value }))}
                placeholder="https://api.openai.com/v1"
              />
            </div>
            <div className="space-y-2">
              <Label>API Key * (will be AES-256 encrypted)</Label>
              <Input
                type="password"
                value={newSvc.api_key_plaintext}
                onChange={e => setNewSvc(prev => ({ ...prev, api_key_plaintext: e.target.value }))}
                placeholder="sk-…"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Rate Limit</Label>
                <Input
                  value={newSvc.rate_limit}
                  onChange={e => setNewSvc(prev => ({ ...prev, rate_limit: e.target.value }))}
                  placeholder="60/min"
                />
              </div>
              <div className="space-y-2">
                <Label>Max Monthly Cost ($)</Label>
                <Input
                  type="number"
                  value={newSvc.max_monthly_cost}
                  onChange={e => setNewSvc(prev => ({ ...prev, max_monthly_cost: e.target.value }))}
                  placeholder="500"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} className="bg-violet-600 hover:bg-violet-700">
              <Plus className="w-4 h-4 mr-1" />
              Create Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rotate Key Dialog */}
      <Dialog open={!!showRotate} onOpenChange={() => setShowRotate(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Rotate API Key – {showRotate?.service_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Enter the new API key. It will be encrypted (AES-256) immediately. The old key will be overwritten.
            </p>
            <Label>New API Key</Label>
            <Input
              type="password"
              value={newKey}
              onChange={e => setNewKey(e.target.value)}
              placeholder="New key…"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRotate(null)}>Cancel</Button>
            <Button onClick={handleRotate} className="bg-amber-600 hover:bg-amber-700" disabled={!newKey}>
              <RotateCcw className="w-4 h-4 mr-1" />
              Rotate Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIServiceManager;
