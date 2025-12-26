// Continent Super Admin - Area Managers Screen
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Eye, ClipboardList, X, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AreaManager {
  id: string;
  name: string;
  country: string;
  lastLogin: string;
  status: string;
  performance: number;
  email?: string;
  tasksAssigned?: number;
}

const AreaManagersView = () => {
  const { toast } = useToast();
  const [areaManagers, setAreaManagers] = useState<AreaManager[]>([
    { id: '1', name: 'John Okafor', country: 'Nigeria', lastLogin: '2 hours ago', status: 'Online', performance: 94, email: 'john@example.com', tasksAssigned: 5 },
    { id: '2', name: 'Mary Wanjiku', country: 'Kenya', lastLogin: '30 mins ago', status: 'Online', performance: 88, email: 'mary@example.com', tasksAssigned: 3 },
    { id: '3', name: 'David Nkosi', country: 'South Africa', lastLogin: '1 day ago', status: 'Offline', performance: 91, email: 'david@example.com', tasksAssigned: 7 },
    { id: '4', name: 'Kwame Asante', country: 'Ghana', lastLogin: '5 hours ago', status: 'Away', performance: 85, email: 'kwame@example.com', tasksAssigned: 4 },
    { id: '5', name: 'Ahmed Hassan', country: 'Egypt', lastLogin: '3 hours ago', status: 'Online', performance: 79, email: 'ahmed@example.com', tasksAssigned: 6 },
    { id: '6', name: 'Fatima Benali', country: 'Morocco', lastLogin: '45 mins ago', status: 'Online', performance: 92, email: 'fatima@example.com', tasksAssigned: 2 },
  ]);

  const [viewDialog, setViewDialog] = useState<{ open: boolean; manager: AreaManager | null }>({ open: false, manager: null });
  const [assignTaskDialog, setAssignTaskDialog] = useState<{ open: boolean; manager: AreaManager | null }>({ open: false, manager: null });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium', deadline: '' });
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Online': return 'bg-emerald-500/20 text-emerald-500';
      case 'Away': return 'bg-amber-500/20 text-amber-500';
      case 'Offline': return 'bg-stone-500/20 text-stone-500';
      default: return '';
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-emerald-500';
    if (score >= 80) return 'text-amber-500';
    return 'text-red-500';
  };

  const logAudit = async (action: string, details: Record<string, string | number | boolean | null>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('audit_logs').insert([{
          user_id: user.id,
          action,
          module: 'area_managers',
          role: 'super_admin' as const,
          meta_json: details as Record<string, string | number | boolean | null>
        }]);
      }
    } catch (error) {
      console.error('Audit log error:', error);
    }
  };

  const handleView = (manager: AreaManager) => {
    setViewDialog({ open: true, manager });
    logAudit('view_area_manager', { manager_id: manager.id, manager_name: manager.name });
  };

  const handleAssignTask = async () => {
    if (!assignTaskDialog.manager) return;
    
    if (!taskForm.title.trim()) {
      toast({
        title: 'Title Required',
        description: 'Please enter a task title.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Log the task assignment
      await logAudit('task_assigned', {
        manager_id: assignTaskDialog.manager.id,
        manager_name: assignTaskDialog.manager.name,
        task_title: taskForm.title,
        priority: taskForm.priority,
      });

      // Update local state
      setAreaManagers(prev => prev.map(m => 
        m.id === assignTaskDialog.manager?.id 
          ? { ...m, tasksAssigned: (m.tasksAssigned || 0) + 1 }
          : m
      ));

      toast({
        title: 'Task Assigned',
        description: `Task "${taskForm.title}" assigned to ${assignTaskDialog.manager.name}.`,
      });

      setAssignTaskDialog({ open: false, manager: null });
      setTaskForm({ title: '', description: '', priority: 'medium', deadline: '' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to assign task.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Area Managers</h1>
        <p className="text-muted-foreground">Monitor and manage area managers</p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Users className="h-5 w-5" />
            Area Manager Directory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-muted-foreground">Name</TableHead>
                <TableHead className="text-muted-foreground">Country</TableHead>
                <TableHead className="text-muted-foreground">Last Login</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Performance</TableHead>
                <TableHead className="text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {areaManagers.map((manager, index) => (
                <motion.tr
                  key={manager.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-border"
                >
                  <TableCell className="font-medium text-foreground">{manager.name}</TableCell>
                  <TableCell className="text-muted-foreground">{manager.country}</TableCell>
                  <TableCell className="text-muted-foreground">{manager.lastLogin}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(manager.status)}>
                      {manager.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={`font-bold ${getPerformanceColor(manager.performance)}`}>
                      {manager.performance}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-border"
                        onClick={() => handleView(manager)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-border"
                        onClick={() => setAssignTaskDialog({ open: true, manager })}
                      >
                        <ClipboardList className="h-4 w-4 mr-1" />
                        Assign Task
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Manager Dialog */}
      <Dialog open={viewDialog.open} onOpenChange={(open) => !open && setViewDialog({ open: false, manager: null })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Area Manager Details</DialogTitle>
            <DialogDescription>Viewing profile for {viewDialog.manager?.name}</DialogDescription>
          </DialogHeader>
          {viewDialog.manager && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Name</Label>
                  <p className="font-medium">{viewDialog.manager.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Country</Label>
                  <p className="font-medium">{viewDialog.manager.country}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Status</Label>
                  <Badge className={getStatusColor(viewDialog.manager.status)}>
                    {viewDialog.manager.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Performance</Label>
                  <p className={`font-bold ${getPerformanceColor(viewDialog.manager.performance)}`}>
                    {viewDialog.manager.performance}%
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Last Login</Label>
                  <p className="font-medium">{viewDialog.manager.lastLogin}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Tasks Assigned</Label>
                  <p className="font-medium">{viewDialog.manager.tasksAssigned || 0}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialog({ open: false, manager: null })}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Task Dialog */}
      <Dialog open={assignTaskDialog.open} onOpenChange={(open) => {
        if (!open) {
          setAssignTaskDialog({ open: false, manager: null });
          setTaskForm({ title: '', description: '', priority: 'medium', deadline: '' });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Task</DialogTitle>
            <DialogDescription>
              Assign a new task to {assignTaskDialog.manager?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="task-title">Task Title *</Label>
              <Input
                id="task-title"
                placeholder="Enter task title"
                value={taskForm.title}
                onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="task-desc">Description</Label>
              <Textarea
                id="task-desc"
                placeholder="Enter task description"
                value={taskForm.description}
                onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Priority</Label>
                <Select
                  value={taskForm.priority}
                  onValueChange={(value) => setTaskForm(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="task-deadline">Deadline</Label>
                <Input
                  id="task-deadline"
                  type="date"
                  value={taskForm.deadline}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, deadline: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignTaskDialog({ open: false, manager: null })}>
              Cancel
            </Button>
            <Button onClick={handleAssignTask} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Assign Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AreaManagersView;
