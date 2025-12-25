// Continent Super Admin - Area Managers Screen
import { motion } from 'framer-motion';
import { Users, Eye, ClipboardList } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const AreaManagersView = () => {
  const areaManagers = [
    { id: '1', name: 'John Okafor', country: 'Nigeria', lastLogin: '2 hours ago', status: 'Online', performance: 94 },
    { id: '2', name: 'Mary Wanjiku', country: 'Kenya', lastLogin: '30 mins ago', status: 'Online', performance: 88 },
    { id: '3', name: 'David Nkosi', country: 'South Africa', lastLogin: '1 day ago', status: 'Offline', performance: 91 },
    { id: '4', name: 'Kwame Asante', country: 'Ghana', lastLogin: '5 hours ago', status: 'Away', performance: 85 },
    { id: '5', name: 'Ahmed Hassan', country: 'Egypt', lastLogin: '3 hours ago', status: 'Online', performance: 79 },
    { id: '6', name: 'Fatima Benali', country: 'Morocco', lastLogin: '45 mins ago', status: 'Online', performance: 92 },
  ];

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
                      <Button size="sm" variant="outline" className="border-border">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="border-border">
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
    </div>
  );
};

export default AreaManagersView;
