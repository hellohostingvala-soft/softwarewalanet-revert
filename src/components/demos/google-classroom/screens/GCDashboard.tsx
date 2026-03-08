import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, ClipboardList, Users, TrendingUp, Plus, Clock } from 'lucide-react';
import type { GCScreen } from '../GCLayout';

interface GCDashboardProps {
  onNavigate: (screen: GCScreen) => void;
}

export function GCDashboard({ onNavigate }: GCDashboardProps) {
  const [stats, setStats] = useState({ classrooms: 0, assignments: 0, submissions: 0, students: 0 });
  const [recentClasses, setRecentClasses] = useState<any[]>([]);

  useEffect(() => {
    loadStats();
    loadRecentClasses();
  }, []);

  const loadStats = async () => {
    const [c, a] = await Promise.all([
      supabase.from('gc_classrooms').select('id', { count: 'exact', head: true }),
      supabase.from('gc_assignments').select('id', { count: 'exact', head: true }),
    ]);
    setStats({
      classrooms: c.count || 0,
      assignments: a.count || 0,
      submissions: 0,
      students: 0,
    });
  };

  const loadRecentClasses = async () => {
    const { data } = await supabase
      .from('gc_classrooms')
      .select('*')
      .eq('is_archived', false)
      .order('created_at', { ascending: false })
      .limit(6);
    setRecentClasses(data || []);
  };

  const kpis = [
    { label: 'Classrooms', value: stats.classrooms, icon: BookOpen, color: '#1967d2', bg: '#e8f0fe' },
    { label: 'Assignments', value: stats.assignments, icon: ClipboardList, color: '#e37400', bg: '#fef3e0' },
    { label: 'Submissions', value: stats.submissions, icon: TrendingUp, color: '#0d904f', bg: '#e6f4ea' },
    { label: 'Students', value: stats.students, icon: Users, color: '#8430ce', bg: '#f3e8fd' },
  ];

  const classColors = ['#1967d2', '#0d904f', '#e37400', '#8430ce', '#d93025', '#137333'];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Here's what's happening in your school</p>
        </div>
        <button 
          onClick={() => onNavigate('classrooms')}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1967d2] text-white rounded-lg hover:bg-[#1557b0] transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Create Class
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: kpi.bg }}>
                  <Icon className="w-5 h-5" style={{ color: kpi.color }} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-800">{kpi.value}</p>
              <p className="text-xs text-gray-500 mt-1">{kpi.label}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Classrooms */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Classrooms</h2>
        {recentClasses.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No classrooms yet</p>
            <p className="text-gray-400 text-sm mt-1">Create your first classroom to get started</p>
            <button 
              onClick={() => onNavigate('classrooms')}
              className="mt-4 px-4 py-2 bg-[#1967d2] text-white rounded-lg hover:bg-[#1557b0] text-sm font-medium"
            >
              Create Classroom
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentClasses.map((cls, i) => (
              <div key={cls.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                <div className="h-24 p-4 flex flex-col justify-end" style={{ backgroundColor: classColors[i % classColors.length] }}>
                  <h3 className="text-white font-semibold text-lg truncate">{cls.name}</h3>
                  <p className="text-white/80 text-sm truncate">{cls.section || cls.subject || 'No section'}</p>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Code: {cls.class_code}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
