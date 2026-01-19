import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  PlayCircle, 
  Wand2,
  Copy,
  Eye,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  Bug,
  ArrowUpCircle,
  ShieldCheck,
  Link,
  Key,
  Lock,
  Timer,
  Sparkles,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';

interface DemoManagementScreenProps {
  subScreen?: string;
}

const demos = [
  { id: '1', name: 'CRM Pro Suite Demo', product: 'CRM Pro Suite', status: 'live', url: 'demo.softwarevala.com/crm-pro', password: 'demo123', expiresIn: '7 days', completion: 100, aiGenerated: true },
  { id: '2', name: 'E-Shop Builder Demo', product: 'E-Shop Builder', status: 'live', url: 'demo.softwarevala.com/eshop', password: 'demo456', expiresIn: '14 days', completion: 100, aiGenerated: false },
  { id: '3', name: 'AI Lead Magnet Demo', product: 'AI Lead Magnet', status: 'incomplete', url: 'demo.softwarevala.com/lead', password: 'demo789', expiresIn: '3 days', completion: 65, aiGenerated: true },
  { id: '4', name: 'Marketing Autopilot Demo', product: 'Marketing Autopilot', status: 'expired', url: 'demo.softwarevala.com/marketing', password: 'demo321', expiresIn: 'Expired', completion: 100, aiGenerated: true },
];

const statusConfig = {
  live: { label: 'Live', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle },
  incomplete: { label: 'Incomplete', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Clock },
  expired: { label: 'Expired', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle },
  locked: { label: 'Locked', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: Lock },
};

export function MMDemoManagementScreen({ subScreen = 'all-demos' }: DemoManagementScreenProps) {
  if (subScreen === 'demo-builder') {
    return <DemoBuilderView />;
  }
  if (subScreen === 'demo-completion') {
    return <DemoCompletionView />;
  }
  if (subScreen === 'demo-upgrade') {
    return <DemoUpgradeView />;
  }
  if (subScreen === 'demo-bugs') {
    return <DemoBugTrackerView />;
  }
  if (subScreen === 'demo-approval') {
    return <DemoApprovalView />;
  }

  return <AllDemosView />;
}

function AllDemosView() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <PlayCircle className="h-6 w-6 text-purple-400" />
            All Demos
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 ml-2">
              <Sparkles className="h-3 w-3 mr-1" />
              VALA AI Powered
            </Badge>
          </h1>
          <p className="text-slate-400 mt-1">Manage product demos and trials</p>
        </div>
        <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
          <Wand2 className="h-4 w-4 mr-2" />
          Create AI Demo
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-emerald-500/10 border-emerald-500/30">
          <CardContent className="p-4 text-center">
            <PlayCircle className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-emerald-400">{demos.filter(d => d.status === 'live').length}</p>
            <p className="text-xs text-emerald-400">Live Demos</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-amber-400">{demos.filter(d => d.status === 'incomplete').length}</p>
            <p className="text-xs text-amber-400">Incomplete</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-4 text-center">
            <Sparkles className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-400">{demos.filter(d => d.aiGenerated).length}</p>
            <p className="text-xs text-purple-400">AI Generated</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4 text-center">
            <Timer className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-400">{demos.filter(d => d.status === 'expired').length}</p>
            <p className="text-xs text-red-400">Expired</p>
          </CardContent>
        </Card>
      </div>

      {/* Demos Grid */}
      <div className="space-y-4">
        {demos.map((demo) => {
          const status = statusConfig[demo.status as keyof typeof statusConfig];
          const StatusIcon = status.icon;

          return (
            <Card key={demo.id} className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-purple-500/20">
                      <PlayCircle className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{demo.name}</h3>
                        {demo.aiGenerated && (
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                            <Sparkles className="h-2 w-2 mr-1" />
                            AI
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-400">{demo.product}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Demo URL */}
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-700">
                      <Link className="h-4 w-4 text-slate-400" />
                      <code className="text-xs text-slate-300">{demo.url}</code>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={() => copyToClipboard(demo.url, `url-${demo.id}`)}
                      >
                        {copiedId === `url-${demo.id}` ? (
                          <CheckCircle className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>

                    {/* Password */}
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-700">
                      <Key className="h-4 w-4 text-slate-400" />
                      <code className="text-xs text-slate-300">{demo.password}</code>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={() => copyToClipboard(demo.password, `pass-${demo.id}`)}
                      >
                        {copiedId === `pass-${demo.id}` ? (
                          <CheckCircle className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>

                    {/* Expiry */}
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Expires</p>
                      <p className={`text-sm font-medium ${demo.status === 'expired' ? 'text-red-400' : ''}`}>
                        {demo.expiresIn}
                      </p>
                    </div>

                    {/* Status */}
                    <Badge className={status.color}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {status.label}
                    </Badge>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="border-slate-600">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="border-slate-600">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="border-slate-600">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {demo.status === 'incomplete' && (
                  <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-amber-400">Demo Completion</span>
                      <span className="text-sm font-medium">{demo.completion}%</span>
                    </div>
                    <Progress value={demo.completion} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function DemoBuilderView() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wand2 className="h-6 w-6 text-purple-400" />
          AI Demo Builder
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white ml-2">VALA AI</Badge>
        </h1>
        <p className="text-slate-400 mt-1">Create demos with AI assistance</p>
      </div>

      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">One-Click Demo Creation</h3>
              <p className="text-slate-400">Let VALA AI create a complete demo in minutes</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <h4 className="font-medium mb-2">Select Product</h4>
              <Input className="bg-slate-900 border-slate-600" placeholder="Search products..." />
            </div>
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <h4 className="font-medium mb-2">Demo Duration</h4>
              <Input className="bg-slate-900 border-slate-600" placeholder="e.g., 7 days, 14 days" />
            </div>
          </div>

          <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 py-6 text-lg">
            <Wand2 className="h-5 w-5 mr-2" />
            Generate Demo with VALA AI
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <Wand2 className="h-6 w-6 text-purple-400 mx-auto mb-2" />
            <p className="font-medium">Auto Button Wiring</p>
            <p className="text-xs text-slate-400 mt-1">All buttons work end-to-end</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <ShieldCheck className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
            <p className="font-medium">Permission Mapping</p>
            <p className="text-xs text-slate-400 mt-1">Auto role permissions</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <Bug className="h-6 w-6 text-amber-400 mx-auto mb-2" />
            <p className="font-medium">Error Prevention</p>
            <p className="text-xs text-slate-400 mt-1">Bugs fixed before publish</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-6 w-6 text-blue-400 mx-auto mb-2" />
            <p className="font-medium">95% Automation</p>
            <p className="text-xs text-slate-400 mt-1">Human-free completion</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DemoCompletionView() {
  const incompletedemos = demos.filter(d => d.completion < 100);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CheckCircle className="h-6 w-6 text-purple-400" />
          Demo Completion Status
        </h1>
        <p className="text-slate-400 mt-1">Track demo build progress</p>
      </div>

      <div className="space-y-4">
        {demos.map((demo) => (
          <Card key={demo.id} className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <PlayCircle className="h-5 w-5 text-purple-400" />
                  <span className="font-medium">{demo.name}</span>
                </div>
                <Badge className={demo.completion === 100 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}>
                  {demo.completion}% Complete
                </Badge>
              </div>
              <Progress value={demo.completion} className="h-3" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function DemoUpgradeView() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ArrowUpCircle className="h-6 w-6 text-purple-400" />
          Demo Upgrade Queue
        </h1>
        <p className="text-slate-400 mt-1">Pending demo upgrade requests</p>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6 text-center">
          <ArrowUpCircle className="h-12 w-12 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-400">No pending upgrade requests</p>
        </CardContent>
      </Card>
    </div>
  );
}

function DemoBugTrackerView() {
  const bugs = [
    { id: '1', demo: 'AI Lead Magnet Demo', issue: 'Form validation not working', severity: 'high', status: 'open' },
    { id: '2', demo: 'E-Shop Builder Demo', issue: 'Cart total miscalculation', severity: 'medium', status: 'in-progress' },
    { id: '3', demo: 'CRM Pro Suite Demo', issue: 'Export button non-functional', severity: 'low', status: 'resolved' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bug className="h-6 w-6 text-purple-400" />
          Demo Bug Tracker
        </h1>
        <p className="text-slate-400 mt-1">Track and resolve demo issues</p>
      </div>

      <div className="space-y-4">
        {bugs.map((bug) => (
          <Card key={bug.id} className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Bug className={`h-5 w-5 ${bug.severity === 'high' ? 'text-red-400' : bug.severity === 'medium' ? 'text-amber-400' : 'text-blue-400'}`} />
                  <div>
                    <p className="font-medium">{bug.issue}</p>
                    <p className="text-xs text-slate-400">{bug.demo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={bug.severity === 'high' ? 'bg-red-500/20 text-red-400' : bug.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}>
                    {bug.severity}
                  </Badge>
                  <Badge className={bug.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400' : bug.status === 'in-progress' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-500/20 text-slate-400'}>
                    {bug.status}
                  </Badge>
                  <Button variant="outline" size="sm" className="border-slate-600">View</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function DemoApprovalView() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-purple-400" />
          Demo Approval Flow
        </h1>
        <p className="text-slate-400 mt-1">Approve demos before going live</p>
      </div>

      <Card className="bg-amber-500/10 border-amber-500/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Clock className="h-6 w-6 text-amber-400" />
              <div>
                <p className="font-medium">AI Lead Magnet Demo</p>
                <p className="text-sm text-slate-400">Submitted for approval</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10">
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button className="bg-emerald-500 hover:bg-emerald-600">
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
