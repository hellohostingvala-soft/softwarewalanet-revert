import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, FileText, Code, Bug, Zap, Wrench, 
  Upload, Calendar, Clock, User, AlertTriangle,
  X, Sparkles, Link2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface TaskCreationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (task: any) => void;
}

const taskTypes = [
  { id: 'development', label: 'Development', icon: Code, color: 'violet' },
  { id: 'support', label: 'Support', icon: Wrench, color: 'blue' },
  { id: 'bug', label: 'Bug Fix', icon: Bug, color: 'red' },
  { id: 'hotfix', label: 'Hotfix', icon: Zap, color: 'orange' },
  { id: 'custom', label: 'Custom', icon: FileText, color: 'slate' },
];

const priorities = [
  { id: 'normal', label: 'Normal', color: 'green' },
  { id: 'high', label: 'High', color: 'yellow' },
  { id: 'critical', label: 'Critical', color: 'orange' },
  { id: 'prime', label: 'Prime Priority', color: 'purple', badge: 'Fast Lane' },
];

const linkageTypes = [
  { id: 'reseller', label: 'Reseller ID' },
  { id: 'franchise', label: 'Franchise ID' },
  { id: 'prime_user', label: 'Prime User' },
  { id: 'support_ticket', label: 'Support Ticket' },
];

const skillTags = ['PHP', 'Node.js', 'Java', 'Python', 'React', 'Flutter', 'DevOps', 'Database', 'API'];

const TaskCreationPanel = ({ isOpen, onClose, onCreateTask }: TaskCreationPanelProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'development',
    priority: 'normal',
    expectedHours: '',
    deadline: '',
    skills: [] as string[],
    linkageType: '',
    linkageId: '',
    attachments: [] as File[],
  });
  const [aiSuggesting, setAiSuggesting] = useState(false);

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleAISuggest = async () => {
    setAiSuggesting(true);
    // Simulate AI suggestion
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        expectedHours: '8',
        skills: ['React', 'Node.js', 'Database'],
      }));
      setAiSuggesting(false);
      toast.success('AI suggested optimal settings based on task description');
    }, 1500);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }
    onCreateTask(formData);
    toast.success('Task created successfully');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 rounded-2xl border border-violet-500/30 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 p-4 border-b border-slate-700/50 bg-slate-900/95 backdrop-blur-sm flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Create New Task</h2>
              <p className="text-xs text-slate-400">Fill in the task details</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Task Type */}
          <div>
            <label className="text-sm text-slate-400 mb-3 block">Task Type</label>
            <div className="flex gap-2 flex-wrap">
              {taskTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setFormData(prev => ({ ...prev, type: type.id }))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    formData.type === type.id
                      ? `bg-${type.color}-500/20 border-${type.color}-500/50 text-${type.color}-400`
                      : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <type.icon className="w-4 h-4" />
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title & Description */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Task Title *</label>
              <Input
                placeholder="Enter task title..."
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="bg-slate-800/50 border-slate-600"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Description *</label>
              <Textarea
                placeholder="Describe the task in detail..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="bg-slate-800/50 border-slate-600 min-h-[100px]"
              />
            </div>
          </div>

          {/* AI Suggestion */}
          <Button
            variant="outline"
            onClick={handleAISuggest}
            disabled={aiSuggesting || !formData.description}
            className="border-violet-500/30 text-violet-400"
          >
            <Sparkles className={`w-4 h-4 mr-2 ${aiSuggesting ? 'animate-spin' : ''}`} />
            {aiSuggesting ? 'AI Analyzing...' : 'AI Suggest Settings'}
          </Button>

          {/* Priority */}
          <div>
            <label className="text-sm text-slate-400 mb-3 block">Priority & Severity</label>
            <div className="flex gap-2 flex-wrap">
              {priorities.map((priority) => (
                <button
                  key={priority.id}
                  onClick={() => setFormData(prev => ({ ...prev, priority: priority.id }))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    formData.priority === priority.id
                      ? `bg-${priority.color}-500/20 border-${priority.color}-500/50 text-${priority.color}-400`
                      : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {priority.id === 'critical' && <AlertTriangle className="w-4 h-4" />}
                  {priority.id === 'prime' && <Zap className="w-4 h-4" />}
                  {priority.label}
                  {priority.badge && (
                    <Badge className="bg-purple-500/20 text-purple-400 text-xs">{priority.badge}</Badge>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Expected Hours
              </label>
              <Input
                type="number"
                placeholder="e.g., 8"
                value={formData.expectedHours}
                onChange={(e) => setFormData(prev => ({ ...prev, expectedHours: e.target.value }))}
                className="bg-slate-800/50 border-slate-600"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-2 block flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Deadline
              </label>
              <Input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                className="bg-slate-800/50 border-slate-600"
              />
            </div>
          </div>

          {/* Skill Tags */}
          <div>
            <label className="text-sm text-slate-400 mb-3 block">Required Skills (for auto-assignment)</label>
            <div className="flex gap-2 flex-wrap">
              {skillTags.map((skill) => (
                <button
                  key={skill}
                  onClick={() => handleSkillToggle(skill)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                    formData.skills.includes(skill)
                      ? 'bg-violet-500/20 border border-violet-500/50 text-violet-400'
                      : 'bg-slate-800/50 border border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Multi-Role Linkage */}
          <div>
            <label className="text-sm text-slate-400 mb-3 block flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Link to Entity (Optional)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <select
                value={formData.linkageType}
                onChange={(e) => setFormData(prev => ({ ...prev, linkageType: e.target.value }))}
                className="p-2 rounded-lg bg-slate-800/50 border border-slate-600 text-white"
              >
                <option value="">Select linkage type...</option>
                {linkageTypes.map((type) => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
              <Input
                placeholder="Enter ID..."
                value={formData.linkageId}
                onChange={(e) => setFormData(prev => ({ ...prev, linkageId: e.target.value }))}
                className="bg-slate-800/50 border-slate-600"
                disabled={!formData.linkageType}
              />
            </div>
          </div>

          {/* Attachments */}
          <div>
            <label className="text-sm text-slate-400 mb-3 block">Attachments</label>
            <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center hover:border-violet-500/50 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Drop files here or click to upload</p>
              <p className="text-xs text-slate-500 mt-1">Max 10MB per file</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 p-4 border-t border-slate-700/50 bg-slate-900/95 backdrop-blur-sm flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit}
            className="bg-gradient-to-r from-violet-500 to-purple-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Task
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TaskCreationPanel;
