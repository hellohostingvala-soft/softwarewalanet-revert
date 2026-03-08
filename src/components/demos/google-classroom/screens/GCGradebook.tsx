import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BarChart3, Download } from 'lucide-react';

export function GCGradebook() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('gc_assignments')
        .select('*, gc_classrooms(name), gc_submissions(id, grade, status)')
        .order('created_at', { ascending: false });
      setAssignments(data || []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-[#1967d2] border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Gradebook</h1>
        <button className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      {assignments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-600">No grades yet</p>
          <p className="text-gray-400 text-sm mt-1">Grades will appear here after assignments are graded</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Assignment</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Class</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Points</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Submitted</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Graded</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Avg Grade</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => {
                const subs = (a as any).gc_submissions || [];
                const graded = subs.filter((s: any) => s.grade !== null);
                const avg = graded.length > 0 ? Math.round(graded.reduce((sum: number, s: any) => sum + s.grade, 0) / graded.length) : '-';
                return (
                  <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{a.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{(a as any).gc_classrooms?.name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600">{a.max_points}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600">{subs.filter((s: any) => s.status === 'turned_in').length}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600">{graded.length}</td>
                    <td className="px-4 py-3 text-sm text-center font-medium" style={{ color: typeof avg === 'number' && avg >= 70 ? '#0d904f' : typeof avg === 'number' ? '#d93025' : '#999' }}>
                      {avg}{typeof avg === 'number' ? `/${a.max_points}` : ''}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
