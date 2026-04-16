// Franchise Employees
// CRUD staff + role assign (sales/support)

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  Shield,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import '../../../styles/premium-7d-theme.css';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'sales' | 'support' | 'manager';
  status: 'active' | 'inactive';
  region: string;
  joinedAt: Date;
}

const FranchiseEmployees = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEmployees([
        {
          id: '1',
          name: 'John Sales',
          email: 'john@franchise.com',
          phone: '+1-555-0101',
          role: 'sales',
          status: 'active',
          region: 'Los Angeles',
          joinedAt: new Date('2024-01-01'),
        },
        {
          id: '2',
          name: 'Sarah Support',
          email: 'sarah@franchise.com',
          phone: '+1-555-0102',
          role: 'support',
          status: 'active',
          region: 'Los Angeles',
          joinedAt: new Date('2024-01-05'),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Employees</h1>
          <p className="text-gray-400">Manage staff and assign roles</p>
        </div>
        <Button className="bg-gradient-to-r from-indigo-500 to-cyan-500">
          <Plus className="w-4 h-4 mr-2" />
          Add Employee
        </Button>
      </div>

      <Card className="bg-[#1A2236] border border-indigo-500/20">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {employees.map((employee) => (
              <motion.div
                key={employee.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border border-indigo-500/20 rounded-lg flex items-center justify-between hover:bg-indigo-500/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-indigo-500">{employee.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-white">{employee.name}</p>
                    <p className="text-sm text-gray-400">{employee.email} • {employee.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className={employee.role === 'sales' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'}>
                    {employee.role}
                  </Badge>
                  <Badge className={employee.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}>
                    {employee.status}
                  </Badge>
                  <Button variant="outline" size="sm" className="border-indigo-500 text-white hover:bg-indigo-500/10">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FranchiseEmployees;
