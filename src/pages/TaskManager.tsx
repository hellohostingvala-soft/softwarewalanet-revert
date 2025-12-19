import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, Users, Wallet, ClipboardList, Bell, 
  User, BarChart3, Monitor, Zap, CheckSquare, Timer, 
  GitBranch, FileCheck, Calendar, MessageSquare, History, AlertTriangle, Plus
} from "lucide-react";
import TaskManagerTopBar from "@/components/tasks/TaskManagerTopBar";
import TaskPipeline from "@/components/tasks/TaskPipeline";
import TaskDetails from "@/components/tasks/TaskDetails";
import TaskAIPanel from "@/components/tasks/TaskAIPanel";
import TaskNotifications from "@/components/tasks/TaskNotifications";
import TaskPerformance from "@/components/tasks/TaskPerformance";
import TaskWalletPanel from "@/components/tasks/TaskWalletPanel";
import TaskCreationPanel from "@/components/tasks/TaskCreationPanel";
import TaskTimerSLA from "@/components/tasks/TaskTimerSLA";
import TaskBuzzerAlert from "@/components/tasks/TaskBuzzerAlert";
import TaskDependencyManager from "@/components/tasks/TaskDependencyManager";
import TaskApprovalWorkflow from "@/components/tasks/TaskApprovalWorkflow";
import TaskGanttView from "@/components/tasks/TaskGanttView";
import TaskChatIntegration from "@/components/tasks/TaskChatIntegration";
import TaskHistoryLogs from "@/components/tasks/TaskHistoryLogs";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: "new" | "in_progress" | "ai_review" | "waiting_client" | "testing" | "completed" | "on_hold" | "cancelled";
  priority: "low" | "medium" | "high" | "critical";
  createdBy: string;
  createdByRole: string;
  assignedTo: string;
  assignedRole: string;
  expectedDelivery: string;
  estimatedHours: number;
  actualHours: number;
  timerStarted: boolean;
  timerStartTime: string | null;
  promisedDelivery: string | null;
  notes: Array<{ sender: string; message: string; time: string }>;
  attachments: Array<{ name: string; type: string; url: string }>;
  subtasks: Array<{ id: string; title: string; completed: boolean }>;
  billable: boolean;
  cost: number;
  createdAt: string;
  progress: number;
}

const TaskManager = () => {
  const [activeSection, setActiveSection] = useState("pipeline");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: "1", message: "Task accepted. Timer started. Please deliver before the promised window.", type: "success", time: "Just now" },
    { id: "2", message: "New task assigned: POS Module Enhancement", type: "info", time: "5 min ago" },
  ]);

  const sidebarItems = [
    { id: "pipeline", label: "Task Pipeline", icon: CheckSquare },
    { id: "timer", label: "Timer & SLA", icon: Timer },
    { id: "buzzer", label: "Buzzer Alerts", icon: AlertTriangle, badge: "3" },
    { id: "dependencies", label: "Dependencies", icon: GitBranch },
    { id: "approval", label: "Approval Workflow", icon: FileCheck },
    { id: "gantt", label: "Gantt View", icon: Calendar },
    { id: "chat", label: "Task Chat", icon: MessageSquare },
    { id: "history", label: "History & Logs", icon: History },
    { id: "performance", label: "Performance", icon: BarChart3 },
    { id: "wallet", label: "Wallet", icon: Wallet },
  ];

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const mockTimerTasks = [
    { id: "1", title: "POS Module Enhancement", priority: "high", estimatedHours: 6, timerStarted: true, timerStartTime: "2024-01-16T10:00:00" },
    { id: "2", title: "Hospital Dashboard Bug Fix", priority: "critical", estimatedHours: 4, timerStarted: true, timerStartTime: "2024-01-16T09:00:00" },
    { id: "3", title: "School ERP API Integration", priority: "medium", estimatedHours: 12, timerStarted: false, timerStartTime: null },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "pipeline":
        return <TaskPipeline onSelectTask={setSelectedTask} selectedTask={selectedTask} />;
      case "timer":
        return <TaskTimerSLA tasks={mockTimerTasks} onTimerAction={(id, action) => console.log(id, action)} />;
      case "buzzer":
        return <TaskBuzzerAlert />;
      case "dependencies":
        return <TaskDependencyManager />;
      case "approval":
        return <TaskApprovalWorkflow />;
      case "gantt":
        return <TaskGanttView />;
      case "chat":
        return <TaskChatIntegration />;
      case "history":
        return <TaskHistoryLogs />;
      case "performance":
        return <TaskPerformance />;
      case "wallet":
        return <TaskWalletPanel />;
      default:
        return <TaskPipeline onSelectTask={setSelectedTask} selectedTask={selectedTask} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        {/* Glow Effects */}
        <motion.div
          className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.2, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        {/* Floating Particles */}
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-violet-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.5, 0.1],
            }}
            transition={{
              duration: 5 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Top Bar */}
      <TaskManagerTopBar onAIClick={() => setShowAIPanel(true)} />

      <div className="flex pt-16">
        {/* Sidebar */}
        <motion.aside
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-slate-900/60 backdrop-blur-xl border-r border-violet-500/20 z-40"
        >
          <div className="p-4 space-y-2">
            {sidebarItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative ${
                  activeSection === item.id
                    ? "bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/50 text-violet-300"
                    : "hover:bg-slate-800/50 text-slate-400 hover:text-violet-300"
                }`}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <item.icon className={`w-5 h-5 ${
                  activeSection === item.id ? "text-violet-400" : "group-hover:text-violet-400"
                }`} />
                <span className="text-sm font-medium">{item.label}</span>
                {activeSection === item.id && (
                  <motion.div
                    layoutId="activeTaskIndicator"
                    className="absolute left-0 w-1 h-8 bg-gradient-to-b from-violet-400 to-purple-500 rounded-r-full"
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Quick Action */}
          <div className="absolute bottom-4 left-4 right-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateTask(true)}
              className="w-full py-3 px-4 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25"
            >
              <Plus className="w-4 h-4" />
              Create Task
            </motion.button>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 p-6 overflow-auto">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {renderContent()}
          </motion.div>
        </main>

        {/* Task Details Panel */}
        <AnimatePresence>
          {selectedTask && (
            <TaskDetails 
              task={selectedTask} 
              onClose={() => setSelectedTask(null)} 
            />
          )}
        </AnimatePresence>

        {/* AI Panel */}
        <TaskAIPanel 
          isOpen={showAIPanel} 
          onClose={() => setShowAIPanel(false)}
          task={selectedTask}
        />

        {/* Notifications */}
        <TaskNotifications 
          notifications={notifications}
          onDismiss={dismissNotification}
        />

        {/* Task Creation Panel */}
        <TaskCreationPanel 
          isOpen={showCreateTask}
          onClose={() => setShowCreateTask(false)}
          onCreateTask={(task) => console.log('Created task:', task)}
        />
      </div>
    </div>
  );
};

export default TaskManager;
