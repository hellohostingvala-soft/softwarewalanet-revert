import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Megaphone, Plus, Pin } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function GCAnnouncements() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ content: '', classroom_id: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const [aRes, cRes] = await Promise.all([
      supabase.from('gc_announcements').select('*, gc_classrooms(name)').order('is_pinned', { ascending: false }).order('created_at', { ascending: false }),
      supabase.from('gc_classrooms').select('id, name').eq('is_archived', false),
    ]);
    setAnnouncements(aRes.data || []);
    setClassrooms(cRes.data || []);
    setLoading(false);
  };

  const createAnnouncement = async () => {
    if (!form.content.trim() || !form.classroom_id) { toast.error('Content and classroom required'); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error('Please login'); return; }

    const { error } = await supabase.from('gc_announcements').insert({
      content: form.content,
      classroom_id: form.classroom_id,
      author_id: user.id,
    });

    if (error) { toast.error(error.message); return; }
    toast.success('Announcement posted!');
    setShowCreate(false);
    setForm({ content: '', classroom_id: '' });
    fetchData();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-[#1967d2] border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Stream</h1>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#1967d2] text-white rounded-lg hover:bg-[#1557b0] text-sm font-medium">
          <Plus className="w-4 h-4" /> Announce
        </button>
      </div>

      {/* Post box */}
      <div 
        onClick={() => setShowCreate(true)}
        className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1967d2] flex items-center justify-center text-white font-medium">T</div>
          <p className="text-gray-400 text-sm">Announce something to your class...</p>
        </div>
      </div>

      {announcements.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No announcements yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1967d2] flex items-center justify-center text-white font-medium shrink-0">T</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800 text-sm">Teacher</span>
                    <span className="text-xs text-gray-400">{new Date(a.created_at).toLocaleDateString()}</span>
                    {a.is_pinned && <Pin className="w-3 h-3 text-[#1967d2]" />}
                  </div>
                  <span className="text-xs text-gray-500">{(a as any).gc_classrooms?.name}</span>
                  <p className="text-gray-700 text-sm mt-2 whitespace-pre-wrap">{a.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader><DialogTitle className="text-gray-800">Post Announcement</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Classroom *</label>
              <select value={form.classroom_id} onChange={(e) => setForm(p => ({ ...p, classroom_id: e.target.value }))} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1967d2]">
                <option value="">Select classroom</option>
                {classrooms.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Announcement *</label>
              <textarea value={form.content} onChange={(e) => setForm(p => ({ ...p, content: e.target.value }))} placeholder="Share with your class..." className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none h-32 focus:outline-none focus:ring-2 focus:ring-[#1967d2]" />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={createAnnouncement} className="bg-[#1967d2] hover:bg-[#1557b0]">Post</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
