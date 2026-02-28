import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Edit, Trash2 } from 'lucide-react';
import {
  getApiServices,
  createApiService,
  updateApiService,
  pauseApiService,
  resumeApiService,
  deleteApiService,
  getServiceHealthStatus,
} from '@/routes/api-services';

interface ApiService {
  id: string;
  name: string;
  provider: string;
  status: string;
  is_active: boolean;
  daily_limit: number;
  monthly_limit: number;
  api_key?: string;
  tenant_id: string;
}

interface HealthMap {
  [id: string]: boolean;
}

interface Props {
  tenantId: string;
}

const PROVIDERS = ['openai', 'anthropic', 'gemini', 'cohere', 'mistral', 'groq', 'together'];

export default function AIServiceManager({ tenantId }: Props) {
  const [services, setServices] = useState<ApiService[]>([]);
  const [health, setHealth] = useState<HealthMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ApiService | null>(null);
  const [form, setForm] = useState({ name: '', provider: '', api_key: '', daily_limit: '', monthly_limit: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error: err } = await getApiServices(tenantId);
    if (err) { setError(err.message); setLoading(false); return; }
    const svcs = (data ?? []) as ApiService[];
    setServices(svcs);
    setLoading(false);

    const healthResults: HealthMap = {};
    await Promise.all(
      svcs.map(async s => {
        const { data: h } = await getServiceHealthStatus(s.id, tenantId);
        healthResults[s.id] = h?.healthy ?? true;
      }),
    );
    setHealth(healthResults);
  };

  useEffect(() => { load(); }, [tenantId]);

  const openAdd = () => {
    setEditTarget(null);
    setForm({ name: '', provider: '', api_key: '', daily_limit: '', monthly_limit: '' });
    setDialogOpen(true);
  };

  const openEdit = (svc: ApiService) => {
    setEditTarget(svc);
    setForm({ name: svc.name, provider: svc.provider, api_key: '', daily_limit: String(svc.daily_limit ?? ''), monthly_limit: String(svc.monthly_limit ?? '') });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload: Record<string, any> = {
      name: form.name,
      provider: form.provider,
      daily_limit: Number(form.daily_limit) || null,
      monthly_limit: Number(form.monthly_limit) || null,
    };
    if (form.api_key) payload.api_key = form.api_key;

    if (editTarget) {
      await updateApiService(editTarget.id, payload, tenantId);
    } else {
      payload.status = 'active';
      payload.is_active = true;
      await createApiService(payload, tenantId);
    }
    setSaving(false);
    setDialogOpen(false);
    load();
  };

  const handleToggle = async (svc: ApiService) => {
    if (svc.is_active) await pauseApiService(svc.id, tenantId);
    else await resumeApiService(svc.id, tenantId);
    load();
  };

  const handleDelete = async (svc: ApiService) => {
    if (!confirm(`Delete "${svc.name}"?`)) return;
    await deleteApiService(svc.id, tenantId);
    load();
  };

  if (loading) return (
    <Card><CardContent className="p-6 space-y-3">
      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
    </CardContent></Card>
  );

  if (error) return (
    <Card><CardContent className="p-6 text-red-500">Error: {error}</CardContent></Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">AI Service Manager</h2>
        <Button onClick={openAdd}><Plus className="w-4 h-4 mr-2" />Add Service</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Health</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Daily Limit</TableHead>
                <TableHead>Monthly Limit</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No services configured</TableCell></TableRow>
              )}
              {services.map(svc => (
                <TableRow key={svc.id}>
                  <TableCell>
                    <span className={`inline-block w-3 h-3 rounded-full ${health[svc.id] !== false ? 'bg-green-500' : 'bg-red-500'}`} />
                  </TableCell>
                  <TableCell className="font-medium">{svc.name}</TableCell>
                  <TableCell><Badge variant="outline">{svc.provider}</Badge></TableCell>
                  <TableCell>
                    <Badge variant={svc.status === 'active' ? 'default' : 'secondary'}>{svc.status}</Badge>
                  </TableCell>
                  <TableCell>{svc.daily_limit?.toLocaleString() ?? '—'}</TableCell>
                  <TableCell>{svc.monthly_limit?.toLocaleString() ?? '—'}</TableCell>
                  <TableCell>
                    <Switch checked={svc.is_active} onCheckedChange={() => handleToggle(svc)} />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(svc)}><Edit className="w-3 h-3" /></Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(svc)}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTarget ? 'Edit Service' : 'Add Service'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div>
              <Label>Provider</Label>
              <Select value={form.provider} onValueChange={v => setForm(f => ({ ...f, provider: v }))}>
                <SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
                <SelectContent>{PROVIDERS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>API Key {editTarget && '(leave blank to keep existing)'}</Label><Input type="password" value={form.api_key} onChange={e => setForm(f => ({ ...f, api_key: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Daily Limit (tokens)</Label><Input type="number" value={form.daily_limit} onChange={e => setForm(f => ({ ...f, daily_limit: e.target.value }))} /></div>
              <div><Label>Monthly Limit (tokens)</Label><Input type="number" value={form.monthly_limit} onChange={e => setForm(f => ({ ...f, monthly_limit: e.target.value }))} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.name || !form.provider}>{saving ? 'Saving…' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
