/**
 * HOME PAGE SYNC SCREEN
 * Control demo visibility on home page
 * LOCK: No modifications without approval
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Home,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  GripVertical
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

export const DMEHomepageSyncScreen: React.FC = () => {
  const [demos, setDemos] = useState([
    { id: 1, name: 'E-Commerce Pro', visible: true, order: 1, featured: true, lastSync: '2 min ago' },
    { id: 2, name: 'Sales CRM', visible: true, order: 2, featured: true, lastSync: '5 min ago' },
    { id: 3, name: 'Hospital Management', visible: true, order: 3, featured: false, lastSync: '10 min ago' },
    { id: 4, name: 'Fleet Manager', visible: false, order: 4, featured: false, lastSync: '1 hour ago' },
    { id: 5, name: 'School ERP', visible: false, order: 5, featured: false, lastSync: 'Never' },
  ]);

  const toggleVisibility = (id: number) => {
    setDemos(demos.map(d => d.id === id ? { ...d, visible: !d.visible } : d));
  };

  const toggleFeatured = (id: number) => {
    setDemos(demos.map(d => d.id === id ? { ...d, featured: !d.featured } : d));
  };

  const moveUp = (id: number) => {
    const idx = demos.findIndex(d => d.id === id);
    if (idx > 0) {
      const newDemos = [...demos];
      [newDemos[idx - 1], newDemos[idx]] = [newDemos[idx], newDemos[idx - 1]];
      setDemos(newDemos.map((d, i) => ({ ...d, order: i + 1 })));
    }
  };

  const moveDown = (id: number) => {
    const idx = demos.findIndex(d => d.id === id);
    if (idx < demos.length - 1) {
      const newDemos = [...demos];
      [newDemos[idx], newDemos[idx + 1]] = [newDemos[idx + 1], newDemos[idx]];
      setDemos(newDemos.map((d, i) => ({ ...d, order: i + 1 })));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Home className="w-5 h-5 text-purple-400" />
            </div>
            Home Page Sync
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Control demo visibility & order on home page</p>
        </div>
        <Button className="bg-neon-teal/20 text-neon-teal hover:bg-neon-teal/30 border border-neon-teal/30">
          <RefreshCw className="w-4 h-4 mr-2" />
          Sync All
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-neon-green/10 border border-neon-green/30">
          <p className="text-xs text-muted-foreground mb-1">Visible on Home</p>
          <p className="text-2xl font-bold text-neon-green">{demos.filter(d => d.visible).length}</p>
        </div>
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <p className="text-xs text-muted-foreground mb-1">Featured</p>
          <p className="text-2xl font-bold text-amber-400">{demos.filter(d => d.featured).length}</p>
        </div>
        <div className="p-4 rounded-xl bg-secondary border border-border">
          <p className="text-xs text-muted-foreground mb-1">Hidden</p>
          <p className="text-2xl font-bold text-muted-foreground">{demos.filter(d => !d.visible).length}</p>
        </div>
      </div>

      {/* Demo List */}
      <div className="space-y-3">
        {demos.map((demo, index) => (
          <motion.div
            key={demo.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`p-4 rounded-xl border flex items-center justify-between ${
              demo.visible ? 'bg-card border-border' : 'bg-secondary/30 border-border/50'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-1">
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => moveUp(demo.id)}>
                  <ArrowUp className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => moveDown(demo.id)}>
                  <ArrowDown className="w-3 h-3" />
                </Button>
              </div>
              <GripVertical className="w-4 h-4 text-muted-foreground" />
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                demo.visible ? 'bg-neon-green/20' : 'bg-secondary'
              }`}>
                {demo.visible ? (
                  <Eye className="w-4 h-4 text-neon-green" />
                ) : (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${demo.visible ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {demo.name}
                  </span>
                  {demo.featured && (
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                      FEATURED
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Position #{demo.order} • Last sync: {demo.lastSync}</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Featured</span>
                <Switch
                  checked={demo.featured}
                  onCheckedChange={() => toggleFeatured(demo.id)}
                  disabled={!demo.visible}
                  className="data-[state=checked]:bg-amber-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Visible</span>
                <Switch
                  checked={demo.visible}
                  onCheckedChange={() => toggleVisibility(demo.id)}
                  className="data-[state=checked]:bg-neon-green"
                />
              </div>
              <Button size="sm" variant="outline" className="border-border">
                <RefreshCw className="w-3 h-3 mr-1" />
                Sync
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Auto-update Notice */}
      <div className="p-4 rounded-xl bg-neon-teal/10 border border-neon-teal/30 flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-neon-teal" />
        <p className="text-sm text-foreground">
          Demo details auto-update when synced. Inactive demos are automatically hidden.
        </p>
      </div>
    </div>
  );
};
