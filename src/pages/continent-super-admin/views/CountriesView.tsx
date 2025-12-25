// Continent Super Admin - Countries Screen
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe2, Eye } from 'lucide-react';
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

interface CountriesViewProps {
  onViewCountry?: (countryId: string) => void;
}

const CountriesView = ({ onViewCountry }: CountriesViewProps) => {
  const countries = [
    { id: '1', country: 'Nigeria', areaManager: 'John Okafor', status: 'Active', sales: '$420K', issues: 2 },
    { id: '2', country: 'Kenya', areaManager: 'Mary Wanjiku', status: 'Active', sales: '$380K', issues: 0 },
    { id: '3', country: 'South Africa', areaManager: 'David Nkosi', status: 'Active', sales: '$520K', issues: 1 },
    { id: '4', country: 'Ghana', areaManager: 'Kwame Asante', status: 'Active', sales: '$290K', issues: 0 },
    { id: '5', country: 'Egypt', areaManager: 'Ahmed Hassan', status: 'Under Review', sales: '$340K', issues: 3 },
    { id: '6', country: 'Morocco', areaManager: 'Fatima Benali', status: 'Active', sales: '$310K', issues: 1 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Countries</h1>
        <p className="text-muted-foreground">Manage countries under this continent</p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Globe2 className="h-5 w-5" />
            Country Directory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-muted-foreground">Country</TableHead>
                <TableHead className="text-muted-foreground">Area Manager</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Sales</TableHead>
                <TableHead className="text-muted-foreground">Issues</TableHead>
                <TableHead className="text-muted-foreground">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {countries.map((country, index) => (
                <motion.tr
                  key={country.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-border"
                >
                  <TableCell className="font-medium text-foreground">{country.country}</TableCell>
                  <TableCell className="text-muted-foreground">{country.areaManager}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={country.status === 'Active' ? 'default' : 'secondary'}
                      className={country.status === 'Active' ? 'bg-emerald-500/20 text-emerald-500' : ''}
                    >
                      {country.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-foreground">{country.sales}</TableCell>
                  <TableCell>
                    {country.issues > 0 ? (
                      <Badge variant="destructive">{country.issues}</Badge>
                    ) : (
                      <span className="text-emerald-500">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onViewCountry?.(country.id)}
                      className="border-border"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Summary
                    </Button>
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

export default CountriesView;
