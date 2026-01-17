import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Play, Square, Plus, Trash2, CreditCard, AlertTriangle,
  Search, Filter, MoreVertical, CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Service {
  id: string;
  name: string;
  category: 'AI' | 'API';
  type: string;
  provider: string;
  status: 'running' | 'stopped';
  payment: 'paid' | 'unpaid';
  usageToday: string;
  usageMonth: string;
  cost: string;
  lastActivity: string;
  riskLevel: 'low' | 'medium' | 'high';
}

const SERVICES: Service[] = [
  { id: '1', name: 'GPT-4 Turbo', category: 'AI', type: 'LLM', provider: 'OpenAI', status: 'running', payment: 'paid', usageToday: '45K', usageMonth: '1.2M', cost: '$124', lastActivity: '2m ago', riskLevel: 'low' },
  { id: '2', name: 'Claude 3', category: 'AI', type: 'LLM', provider: 'Anthropic', status: 'running', payment: 'paid', usageToday: '32K', usageMonth: '890K', cost: '$89', lastActivity: '5m ago', riskLevel: 'low' },
  { id: '3', name: 'DALL-E 3', category: 'AI', type: 'Image', provider: 'OpenAI', status: 'running', payment: 'paid', usageToday: '1.2K', usageMonth: '45K', cost: '$67', lastActivity: '1h ago', riskLevel: 'low' },
  { id: '4', name: 'Whisper', category: 'AI', type: 'Voice', provider: 'OpenAI', status: 'stopped', payment: 'paid', usageToday: '0', usageMonth: '12K', cost: '$23', lastActivity: '2d ago', riskLevel: 'low' },
  { id: '5', name: 'Gemini Pro', category: 'AI', type: 'Multimodal', provider: 'Google', status: 'running', payment: 'paid', usageToday: '28K', usageMonth: '650K', cost: '$78', lastActivity: '3m ago', riskLevel: 'low' },
  { id: '6', name: 'Stripe', category: 'API', type: 'Payment', provider: 'Stripe', status: 'running', payment: 'paid', usageToday: '2.3K', usageMonth: '67K', cost: '$45', lastActivity: '1m ago', riskLevel: 'low' },
  { id: '7', name: 'Razorpay', category: 'API', type: 'Payment', provider: 'Razorpay', status: 'running', payment: 'unpaid', usageToday: '890', usageMonth: '23K', cost: '$32', lastActivity: '15m ago', riskLevel: 'medium' },
  { id: '8', name: 'Twilio SMS', category: 'API', type: 'Messaging', provider: 'Twilio', status: 'running', payment: 'paid', usageToday: '5.6K', usageMonth: '145K', cost: '$56', lastActivity: '30s ago', riskLevel: 'low' },
  { id: '9', name: 'SendGrid', category: 'API', type: 'Messaging', provider: 'SendGrid', status: 'stopped', payment: 'unpaid', usageToday: '0', usageMonth: '8K', cost: '$18', lastActivity: '5d ago', riskLevel: 'high' },
  { id: '10', name: 'Firebase Auth', category: 'API', type: 'Auth', provider: 'Google', status: 'running', payment: 'paid', usageToday: '12K', usageMonth: '340K', cost: '$0', lastActivity: '10s ago', riskLevel: 'low' },
  { id: '11', name: 'Llama 3', category: 'AI', type: 'LLM', provider: 'Meta', status: 'stopped', payment: 'unpaid', usageToday: '0', usageMonth: '0', cost: '$0', lastActivity: 'Never', riskLevel: 'low' },
  { id: '12', name: 'AWS S3', category: 'API', type: 'Storage', provider: 'AWS', status: 'running', payment: 'paid', usageToday: '234GB', usageMonth: '4.5TB', cost: '$89', lastActivity: '2s ago', riskLevel: 'low' },
];

export const AIAPIServicesTable = () => {
  const [services, setServices] = useState<Service[]>(SERVICES);
  const [search, setSearch] = useState('');

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.type.toLowerCase().includes(search.toLowerCase()) ||
    s.provider.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleStatus = (id: string) => {
    setServices(prev => prev.map(s => 
      s.id === id ? { ...s, status: s.status === 'running' ? 'stopped' : 'running' } : s
    ));
    const service = services.find(s => s.id === id);
    toast.success(`${service?.name} ${service?.status === 'running' ? 'stopped' : 'started'}`);
  };

  const handleTogglePayment = (id: string) => {
    setServices(prev => prev.map(s => 
      s.id === id ? { ...s, payment: s.payment === 'paid' ? 'unpaid' : 'paid' } : s
    ));
    const service = services.find(s => s.id === id);
    toast.success(`${service?.name} marked as ${service?.payment === 'paid' ? 'unpaid' : 'paid'}`);
  };

  const handleDelete = (id: string) => {
    const service = services.find(s => s.id === id);
    setServices(prev => prev.filter(s => s.id !== id));
    toast.success(`${service?.name} deleted`);
  };

  return (
    <Card className="bg-slate-900/50 border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-white">All AI & API Services</CardTitle>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-64 bg-muted/20 border-border/50"
              />
            </div>
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/20 hover:bg-muted/20">
                <TableHead className="text-xs">Service</TableHead>
                <TableHead className="text-xs">Category</TableHead>
                <TableHead className="text-xs">Type</TableHead>
                <TableHead className="text-xs">Provider</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Payment</TableHead>
                <TableHead className="text-xs">Usage (Today)</TableHead>
                <TableHead className="text-xs">Cost</TableHead>
                <TableHead className="text-xs">Risk</TableHead>
                <TableHead className="text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.map((service) => (
                <TableRow key={service.id} className="hover:bg-muted/10">
                  <TableCell className="font-medium text-white">{service.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(
                      "text-[10px]",
                      service.category === 'AI' ? "text-violet-400 border-violet-500/50" : "text-blue-400 border-blue-500/50"
                    )}>
                      {service.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">{service.type}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{service.provider}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(
                      "text-[10px]",
                      service.status === 'running' 
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/50" 
                        : "bg-slate-500/10 text-slate-400 border-slate-500/50"
                    )}>
                      {service.status === 'running' ? 'RUNNING' : 'STOPPED'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(
                      "text-[10px]",
                      service.payment === 'paid' 
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/50" 
                        : "bg-amber-500/10 text-amber-400 border-amber-500/50"
                    )}>
                      {service.payment === 'paid' ? 'PAID' : 'UNPAID'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">{service.usageToday}</TableCell>
                  <TableCell className="text-emerald-400 text-xs font-medium">{service.cost}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(
                      "text-[10px]",
                      service.riskLevel === 'low' && "text-emerald-400 border-emerald-500/50",
                      service.riskLevel === 'medium' && "text-amber-400 border-amber-500/50",
                      service.riskLevel === 'high' && "text-red-400 border-red-500/50 animate-pulse",
                    )}>
                      {service.riskLevel.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {/* RUN / STOP */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-7 w-7",
                          service.status === 'running' 
                            ? "text-amber-400 hover:bg-amber-500/20" 
                            : "text-emerald-400 hover:bg-emerald-500/20"
                        )}
                        onClick={() => handleToggleStatus(service.id)}
                      >
                        {service.status === 'running' ? (
                          <Square className="w-3.5 h-3.5" />
                        ) : (
                          <Play className="w-3.5 h-3.5" />
                        )}
                      </Button>

                      {/* PAY / UNPAY */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-7 w-7",
                          service.payment === 'paid' 
                            ? "text-blue-400 hover:bg-blue-500/20" 
                            : "text-amber-400 hover:bg-amber-500/20"
                        )}
                        onClick={() => handleTogglePayment(service.id)}
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                      </Button>

                      {/* DELETE */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-400 hover:bg-red-500/20"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-slate-900 border-border">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete {service.name}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove the service. This action requires Boss approval for critical services.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-500 hover:bg-red-600"
                              onClick={() => handleDelete(service.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
