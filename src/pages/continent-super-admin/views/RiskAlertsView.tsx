// Continent Super Admin - Risk & Alerts Screen
import { motion } from 'framer-motion';
import { AlertTriangle, Shield, Clock, Eye, ArrowUpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const RiskAlertsView = () => {
  const securityAlerts = [
    { id: '1', type: 'Unauthorized Access', country: 'Egypt', severity: 'Critical', time: '2 hours ago' },
    { id: '2', type: 'Suspicious Login', country: 'Nigeria', severity: 'High', time: '5 hours ago' },
    { id: '3', type: 'Multiple Failed Attempts', country: 'Kenya', severity: 'Medium', time: '1 day ago' },
  ];

  const slaBreaches = [
    { id: '1', task: 'Security Audit', country: 'Egypt', overdue: '3 days', assignee: 'Ahmed Hassan' },
    { id: '2', task: 'Compliance Report', country: 'Ghana', overdue: '1 day', assignee: 'Kwame Asante' },
  ];

  const fraudFlags = [
    { id: '1', type: 'Unusual Transaction', country: 'Nigeria', amount: '$45,000', status: 'Under Review' },
    { id: '2', type: 'Pattern Anomaly', country: 'South Africa', amount: '$12,000', status: 'Flagged' },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'High': return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
      case 'Medium': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Risk & Alerts</h1>
        <p className="text-muted-foreground">Monitor security alerts, SLA breaches, and fraud flags</p>
      </div>

      {/* Security Alerts */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Shield className="h-5 w-5 text-red-500" />
            Security Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {securityAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">{alert.type}</span>
                    </div>
                    <p className="text-sm opacity-80 mt-1">{alert.country}</p>
                  </div>
                  <div className="text-right">
                    <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                    <p className="text-xs opacity-70 mt-1">{alert.time}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" className="border-current">
                    <Eye className="h-3 w-3 mr-1" />
                    Review
                  </Button>
                  <Button size="sm" variant="outline" className="border-current">
                    <ArrowUpCircle className="h-3 w-3 mr-1" />
                    Escalate
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SLA Breaches */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Clock className="h-5 w-5 text-amber-500" />
              SLA Breaches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {slaBreaches.map((breach, index) => (
                <motion.div
                  key={breach.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-foreground">{breach.task}</p>
                      <p className="text-sm text-muted-foreground">{breach.country} • {breach.assignee}</p>
                    </div>
                    <Badge variant="destructive">Overdue {breach.overdue}</Badge>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline" className="border-amber-500/30 text-amber-500">
                      <Eye className="h-3 w-3 mr-1" />
                      Review
                    </Button>
                    <Button size="sm" variant="outline" className="border-amber-500/30 text-amber-500">
                      <ArrowUpCircle className="h-3 w-3 mr-1" />
                      Escalate
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fraud Flags */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Fraud Flags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {fraudFlags.map((flag, index) => (
                <motion.div
                  key={flag.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 bg-red-500/10 rounded-lg border border-red-500/20"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-foreground">{flag.type}</p>
                      <p className="text-sm text-muted-foreground">{flag.country} • {flag.amount}</p>
                    </div>
                    <Badge className="bg-red-500/20 text-red-500">{flag.status}</Badge>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline" className="border-red-500/30 text-red-500">
                      <Eye className="h-3 w-3 mr-1" />
                      Review
                    </Button>
                    <Button size="sm" variant="outline" className="border-red-500/30 text-red-500">
                      <ArrowUpCircle className="h-3 w-3 mr-1" />
                      Escalate
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RiskAlertsView;
