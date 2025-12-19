import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Sparkles, Zap, Clock, User, Brain,
  AlertTriangle, FileText, RefreshCw, Send, Bot, Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Task } from "@/pages/TaskManager";

interface TaskAIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
}

const TaskAIPanel = ({ isOpen, onClose, task }: TaskAIPanelProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");

  const aiAnalysis = task ? {
    complexity: "Medium-High",
    estimatedTime: "4-6 hours",
    delayRisk: "Low (15%)",
    bestDeveloper: "vala(dev)4412",
    reason: "Specializes in POS modules, 94% on-time delivery rate"
  } : null;

  const aiSuggestions = [
    {
      type: "assignment",
      title: "Best Assignment",
      suggestion: "Assign to vala(dev)4412 for optimal efficiency",
      confidence: 94,
      icon: User,
    },
    {
      type: "time",
      title: "Time Estimate",
      suggestion: "Task complexity suggests 4-6 hours completion",
      confidence: 88,
      icon: Clock,
    },
    {
      type: "risk",
      title: "Delay Risk",
      suggestion: "Low risk based on developer availability and task scope",
      confidence: 92,
      icon: AlertTriangle,
    },
    {
      type: "subtasks",
      title: "Subtask Breakdown",
      suggestion: "AI can convert requirements into 5 actionable subtasks",
      confidence: 86,
      icon: Target,
    },
  ];

  const clientComms = [
    { name: "Progress Update", description: "Inform client about current status" },
    { name: "Delay Notice", description: "Notify about potential delays" },
    { name: "Completion Notice", description: "Announce task completion" },
    { name: "Clarification Request", description: "Ask for more details" },
  ];

  const handleAction = (action: string) => {
    setIsProcessing(true);
    setTimeout(() => setIsProcessing(false), 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-[480px] bg-slate-900 border-l border-violet-500/20 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">AI Task Assistant</h3>
                  <p className="text-xs text-violet-400">Intelligent task automation</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5 text-slate-400" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Task Analysis */}
              {aiAnalysis && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-xl border border-violet-500/30"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-violet-400" />
                    <span className="font-medium text-white">AI Analysis</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400">Complexity</p>
                      <p className="text-sm font-medium text-white">{aiAnalysis.complexity}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Estimated Time</p>
                      <p className="text-sm font-medium text-white">{aiAnalysis.estimatedTime}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Delay Risk</p>
                      <p className="text-sm font-medium text-green-400">{aiAnalysis.delayRisk}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Best Fit</p>
                      <p className="text-sm font-medium text-violet-400">{aiAnalysis.bestDeveloper}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-3 p-2 bg-slate-800/50 rounded">
                    💡 {aiAnalysis.reason}
                  </p>
                </motion.div>
              )}

              {/* AI Suggestions */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">AI Recommendations</h4>
                <div className="space-y-3">
                  {aiSuggestions.map((item, index) => (
                    <motion.div
                      key={item.type}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-violet-500/30 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-violet-500/20 rounded-lg">
                          <item.icon className="w-4 h-4 text-violet-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-white">{item.title}</span>
                            <span className="text-xs text-green-400">{item.confidence}% confidence</span>
                          </div>
                          <p className="text-sm text-slate-400">{item.suggestion}</p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full mt-3 bg-violet-500/20 text-violet-300 hover:bg-violet-500/30"
                        onClick={() => handleAction(item.type)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Zap className="w-4 h-4 mr-2" />
                        )}
                        Apply
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Client Communication Drafts */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-violet-400" />
                  Draft Client Communication
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {clientComms.map((comm, index) => (
                    <motion.button
                      key={comm.name}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 text-left hover:border-violet-500/30 transition-all"
                    >
                      <p className="text-sm font-medium text-white">{comm.name}</p>
                      <p className="text-xs text-slate-400">{comm.description}</p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* AI Chat */}
              <div className="bg-slate-800/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Bot className="w-4 h-4 text-violet-400" />
                  <span className="text-sm font-medium text-white">Ask AI</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask about this task..."
                    className="bg-slate-900/50 border-slate-600"
                  />
                  <Button className="bg-violet-500 hover:bg-violet-600 px-3">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TaskAIPanel;
