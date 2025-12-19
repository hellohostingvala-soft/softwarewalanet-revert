import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Clock, CheckCircle2, XCircle, AlertTriangle,
  Code2, Timer, Play, Shield, FileText, Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  techStack: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedHours: number;
  maxDeliveryHours: number;
  buzzerActive: boolean;
  assignedAt: Date;
  clientInfo: { masked: true; industry: string };
}

const DevTaskAssignment = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Payment Gateway Integration',
      description: 'Integrate Razorpay payment gateway with existing checkout flow. Handle success/failure callbacks.',
      category: 'Backend Development',
      techStack: ['Node.js', 'Express', 'MongoDB'],
      priority: 'urgent',
      estimatedHours: 2,
      maxDeliveryHours: 2,
      buzzerActive: true,
      assignedAt: new Date(),
      clientInfo: { masked: true, industry: 'E-commerce' },
    },
    {
      id: '2',
      title: 'Dashboard Analytics Widget',
      description: 'Create interactive charts for sales analytics using Chart.js. Include date filters.',
      category: 'Frontend Development',
      techStack: ['React', 'TypeScript', 'Chart.js'],
      priority: 'high',
      estimatedHours: 1.5,
      maxDeliveryHours: 2,
      buzzerActive: true,
      assignedAt: new Date(Date.now() - 300000),
      clientInfo: { masked: true, industry: 'Finance' },
    },
  ]);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPromiseModal, setShowPromiseModal] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400 bg-red-500/20 border-red-500/50';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/50';
      case 'medium': return 'text-amber-400 bg-amber-500/20 border-amber-500/50';
      default: return 'text-slate-400 bg-slate-500/20 border-slate-500/50';
    }
  };

  const handleAcceptTask = (task: Task) => {
    setSelectedTask(task);
    setShowPromiseModal(true);
  };

  const handlePromiseAndStart = () => {
    if (!agreedToTerms || !selectedTask) return;

    setTasks(prev => prev.map(t => 
      t.id === selectedTask.id 
        ? { ...t, buzzerActive: false }
        : t
    ));

    toast({
      title: "Task Accepted!",
      description: `Timer started for "${selectedTask.title}". Deliver within ${selectedTask.maxDeliveryHours} hours.`,
    });

    setShowPromiseModal(false);
    setSelectedTask(null);
    setAgreedToTerms(false);
  };

  const handleRejectTask = (taskId: string) => {
    toast({
      title: "Task Rejected",
      description: "The task will be reassigned to another developer.",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Task Assignment</h1>
          <p className="text-slate-400">Accept tasks to start the timer. Buzzer requires action.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/50 rounded-lg">
          <Bell className="w-4 h-4 text-amber-400" />
          <span className="text-amber-400 text-sm font-medium">{tasks.filter(t => t.buzzerActive).length} Pending</span>
        </div>
      </div>

      {/* Pending Tasks */}
      <div className="space-y-4">
        {tasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-6 rounded-xl border backdrop-blur-sm transition-all ${
              task.buzzerActive 
                ? 'bg-red-500/5 border-red-500/30 animate-pulse' 
                : 'bg-slate-800/50 border-slate-700/50'
            }`}
          >
            {/* Buzzer Alert */}
            {task.buzzerActive && (
              <div className="flex items-center gap-2 mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                >
                  <Bell className="w-5 h-5 text-red-400" />
                </motion.div>
                <span className="text-red-400 font-medium">BUZZER ACTIVE - Action Required</span>
              </div>
            )}

            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs border ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                <p className="text-slate-400 text-sm mb-4">{task.description}</p>

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Tag className="w-4 h-4" />
                    <span>{task.category}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Timer className="w-4 h-4" />
                    <span>Est. {task.estimatedHours}h • Max {task.maxDeliveryHours}h</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Shield className="w-4 h-4" />
                    <span>Client: [MASKED] • {task.clientInfo.industry}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {task.techStack.map(tech => (
                    <span key={tech} className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full border border-cyan-500/30">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2 ml-4">
                <Button
                  onClick={() => handleAcceptTask(task)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Accept & Start
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleRejectTask(task.id)}
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">All Caught Up!</h3>
          <p className="text-slate-400">No pending tasks at the moment.</p>
        </div>
      )}

      {/* Promise Modal */}
      <AnimatePresence>
        {showPromiseModal && selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPromiseModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg p-6 bg-slate-900 border border-cyan-500/30 rounded-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-cyan-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Promise & Start</h2>
                <p className="text-slate-400 text-sm mt-2">Review and accept the task terms</p>
              </div>

              <div className="p-4 bg-slate-800/50 rounded-lg mb-4">
                <h3 className="font-semibold text-white mb-2">{selectedTask.title}</h3>
                <div className="text-sm text-slate-400 space-y-1">
                  <p>• Maximum delivery time: <span className="text-amber-400">{selectedTask.maxDeliveryHours} hours</span></p>
                  <p>• Timer starts immediately upon acceptance</p>
                  <p>• Late delivery affects performance score</p>
                  <p>• Pause allowed only with valid justification</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg mb-6">
                <Checkbox
                  id="agree"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                />
                <label htmlFor="agree" className="text-sm text-slate-300 cursor-pointer">
                  I agree to complete this task within the specified time. I understand that late delivery or abandonment will affect my performance score and may result in penalties.
                </label>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowPromiseModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                  disabled={!agreedToTerms}
                  onClick={handlePromiseAndStart}
                >
                  <Play className="w-4 h-4 mr-2" />
                  I Promise & Start
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DevTaskAssignment;
