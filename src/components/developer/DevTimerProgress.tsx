import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Timer, Play, Pause, CheckCircle2, AlertTriangle,
  Clock, Code2, Bug, TestTube, Upload, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

interface ActiveTask {
  id: string;
  title: string;
  status: 'working' | 'testing' | 'blocked';
  startedAt: Date;
  deadline: Date;
  progress: number;
  pauseReason?: string;
  isPaused: boolean;
}

const DevTimerProgress = () => {
  const [activeTask, setActiveTask] = useState<ActiveTask>({
    id: '1',
    title: 'Payment Gateway Integration',
    status: 'working',
    startedAt: new Date(Date.now() - 2700000), // 45 minutes ago
    deadline: new Date(Date.now() + 4500000), // 1h 15min from now
    progress: 45,
    isPaused: false,
  });

  const [timeRemaining, setTimeRemaining] = useState('');
  const [elapsedTime, setElapsedTime] = useState('');
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pauseReason, setPauseReason] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      if (!activeTask.isPaused) {
        const now = new Date();
        const remaining = activeTask.deadline.getTime() - now.getTime();
        const elapsed = now.getTime() - activeTask.startedAt.getTime();

        if (remaining > 0) {
          const hours = Math.floor(remaining / 3600000);
          const minutes = Math.floor((remaining % 3600000) / 60000);
          const seconds = Math.floor((remaining % 60000) / 1000);
          setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeRemaining('OVERDUE');
        }

        const elapsedHours = Math.floor(elapsed / 3600000);
        const elapsedMinutes = Math.floor((elapsed % 3600000) / 60000);
        const elapsedSeconds = Math.floor((elapsed % 60000) / 1000);
        setElapsedTime(`${elapsedHours}h ${elapsedMinutes}m ${elapsedSeconds}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTask]);

  const handleStatusChange = (newStatus: 'working' | 'testing' | 'blocked') => {
    setActiveTask(prev => ({ ...prev, status: newStatus }));
    toast({
      title: "Status Updated",
      description: `Task status changed to ${newStatus.toUpperCase()}`,
    });
  };

  const handlePause = () => {
    if (!pauseReason.trim()) {
      toast({
        title: "Justification Required",
        description: "Please provide a reason for pausing the task.",
        variant: "destructive",
      });
      return;
    }

    setActiveTask(prev => ({ ...prev, isPaused: true, pauseReason }));
    setShowPauseModal(false);
    setPauseReason('');
    toast({
      title: "Task Paused",
      description: "Your pause reason has been logged.",
    });
  };

  const handleResume = () => {
    setActiveTask(prev => ({ ...prev, isPaused: false }));
    toast({
      title: "Task Resumed",
      description: "Timer is now running.",
    });
  };

  const handleComplete = () => {
    toast({
      title: "Task Completed!",
      description: "Great work! Your submission is under review.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working': return 'bg-cyan-500';
      case 'testing': return 'bg-purple-500';
      case 'blocked': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  const isOverdue = timeRemaining === 'OVERDUE';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Timer & Progress</h1>
        <p className="text-slate-400">Track your active task in real-time</p>
      </div>

      {/* Main Timer Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-8 rounded-2xl border backdrop-blur-sm ${
          isOverdue 
            ? 'bg-red-500/10 border-red-500/50' 
            : activeTask.isPaused 
              ? 'bg-amber-500/10 border-amber-500/50'
              : 'bg-slate-800/50 border-slate-700/50'
        }`}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">{activeTask.title}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-3 py-1 rounded-full text-xs text-white ${getStatusColor(activeTask.status)}`}>
                {activeTask.status.toUpperCase()}
              </span>
              {activeTask.isPaused && (
                <span className="px-3 py-1 rounded-full text-xs bg-amber-500/20 text-amber-400 border border-amber-500/50">
                  PAUSED
                </span>
              )}
            </div>
          </div>
          <div className={`text-right ${isOverdue ? 'text-red-400' : 'text-slate-400'}`}>
            <p className="text-sm">Time Remaining</p>
            <p className={`text-3xl font-mono font-bold ${isOverdue ? 'text-red-400 animate-pulse' : 'text-white'}`}>
              {timeRemaining}
            </p>
          </div>
        </div>

        {/* Timer Display */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="p-4 bg-slate-900/50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-slate-400">Elapsed Time</span>
            </div>
            <p className="text-2xl font-mono font-bold text-white">{elapsedTime}</p>
          </div>
          <div className="p-4 bg-slate-900/50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Timer className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-slate-400">Deadline</span>
            </div>
            <p className="text-2xl font-mono font-bold text-white">
              {activeTask.deadline.toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-slate-400">Progress</span>
            <span className="text-sm text-cyan-400">{activeTask.progress}%</span>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${activeTask.progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Status Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button
            variant={activeTask.status === 'working' ? 'default' : 'outline'}
            onClick={() => handleStatusChange('working')}
            className={activeTask.status === 'working' ? 'bg-cyan-500 hover:bg-cyan-600' : ''}
          >
            <Code2 className="w-4 h-4 mr-2" />
            Working
          </Button>
          <Button
            variant={activeTask.status === 'testing' ? 'default' : 'outline'}
            onClick={() => handleStatusChange('testing')}
            className={activeTask.status === 'testing' ? 'bg-purple-500 hover:bg-purple-600' : ''}
          >
            <TestTube className="w-4 h-4 mr-2" />
            Testing
          </Button>
          <Button
            variant={activeTask.status === 'blocked' ? 'default' : 'outline'}
            onClick={() => handleStatusChange('blocked')}
            className={activeTask.status === 'blocked' ? 'bg-red-500 hover:bg-red-600' : ''}
          >
            <Bug className="w-4 h-4 mr-2" />
            Blocked
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {activeTask.isPaused ? (
            <Button onClick={handleResume} className="flex-1 bg-emerald-500 hover:bg-emerald-600">
              <Play className="w-4 h-4 mr-2" />
              Resume Task
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => setShowPauseModal(true)}
              className="flex-1 border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
            >
              <Pause className="w-4 h-4 mr-2" />
              Pause (Justification Required)
            </Button>
          )}
          <Button onClick={handleComplete} className="flex-1 bg-emerald-500 hover:bg-emerald-600">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Mark Complete
          </Button>
        </div>
      </motion.div>

      {/* Activity Log */}
      <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">Activity Log</h3>
        <div className="space-y-3">
          {[
            { time: '10:30 AM', action: 'Task accepted & timer started', type: 'start' },
            { time: '10:45 AM', action: 'Status changed to Working', type: 'update' },
            { time: '11:00 AM', action: 'Checkpoint: 25% complete', type: 'checkpoint' },
            { time: '11:15 AM', action: 'Status changed to Testing', type: 'update' },
          ].map((log, index) => (
            <div key={index} className="flex items-center gap-4 p-3 bg-slate-900/50 rounded-lg">
              <span className="text-xs text-slate-500 font-mono w-20">{log.time}</span>
              <div className={`w-2 h-2 rounded-full ${
                log.type === 'start' ? 'bg-emerald-400' : 
                log.type === 'checkpoint' ? 'bg-cyan-400' : 'bg-slate-400'
              }`} />
              <span className="text-sm text-slate-300">{log.action}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pause Modal */}
      {showPauseModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowPauseModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="w-full max-w-md p-6 bg-slate-900 border border-amber-500/30 rounded-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
              <h3 className="text-lg font-semibold text-white">Pause Task</h3>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              Pausing requires a valid justification. This will be logged permanently.
            </p>
            <Textarea
              value={pauseReason}
              onChange={e => setPauseReason(e.target.value)}
              placeholder="Enter reason for pausing (e.g., waiting for clarification, external blocker)..."
              className="mb-4 bg-slate-800 border-slate-700"
            />
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowPauseModal(false)}>
                Cancel
              </Button>
              <Button className="flex-1 bg-amber-500 hover:bg-amber-600" onClick={handlePause}>
                Confirm Pause
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default DevTimerProgress;
