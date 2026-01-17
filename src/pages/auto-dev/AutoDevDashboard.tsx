import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, MicOff, Upload, FileText, Image, Video, Send, 
  Sparkles, Bot, Loader2, CheckCircle2, AlertCircle,
  HelpCircle, Lightbulb, Play, Pause, RotateCcw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { UniversalInputBox } from "@/components/auto-dev/UniversalInputBox";
import { AIConversation } from "@/components/auto-dev/AIConversation";
import { BuildProgress } from "@/components/auto-dev/BuildProgress";
import { QuickActions } from "@/components/auto-dev/QuickActions";
import { AutoDevHelp } from "@/components/auto-dev/AutoDevHelp";
import { useEnterpriseAudit } from "@/hooks/useEnterpriseAudit";

export type BuildStatus = 'idle' | 'understanding' | 'clarifying' | 'building' | 'testing' | 'deploying' | 'complete' | 'paused' | 'error';

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type: 'text' | 'voice' | 'file' | 'image' | 'video';
  attachments?: { name: string; type: string; url?: string }[];
  timestamp: Date;
  isTyping?: boolean;
}

const AutoDevDashboard = () => {
  const { logButtonClick } = useEnterpriseAudit();
  const [buildStatus, setBuildStatus] = useState<BuildStatus>('idle');
  const [buildProgress, setBuildProgress] = useState(0);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [currentProject, setCurrentProject] = useState<{
    name: string;
    description: string;
    status: string;
  } | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const handleUserInput = useCallback(async (
    content: string, 
    type: 'text' | 'voice' | 'file' | 'image' | 'video',
    attachments?: { name: string; type: string; url?: string }[]
  ) => {
    await logButtonClick('auto_dev_input', 'User Input', 'vala_builder', { type });

    // Add user message
    const userMessage: ConversationMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      type,
      attachments,
      timestamp: new Date(),
    };
    setConversation(prev => [...prev, userMessage]);

    // Start AI processing
    setBuildStatus('understanding');
    
    // Simulate AI understanding with typing effect
    const aiTypingMessage: ConversationMessage = {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content: '',
      type: 'text',
      timestamp: new Date(),
      isTyping: true,
    };
    setConversation(prev => [...prev, aiTypingMessage]);

    // Simulate AI response with slow, human-like typing
    await new Promise(resolve => setTimeout(resolve, 1500));

    const aiResponse = generateAIResponse(content, type, attachments);
    
    setConversation(prev => prev.map(msg => 
      msg.id === aiTypingMessage.id 
        ? { ...msg, content: aiResponse.message, isTyping: false }
        : msg
    ));

    if (aiResponse.needsClarification) {
      setBuildStatus('clarifying');
    } else if (aiResponse.canBuild) {
      // Start auto-build
      startBuild(aiResponse.projectName || 'New Project', aiResponse.description || content);
    } else {
      setBuildStatus('idle');
    }
  }, [logButtonClick]);

  const generateAIResponse = (content: string, type: string, attachments?: any[]) => {
    // Simulate AI understanding different input types
    const hasImage = type === 'image' || attachments?.some(a => a.type.startsWith('image'));
    const hasVideo = type === 'video' || attachments?.some(a => a.type.startsWith('video'));
    const hasFile = type === 'file' || attachments?.some(a => !a.type.startsWith('image') && !a.type.startsWith('video'));

    if (content.toLowerCase().includes('create') || content.toLowerCase().includes('build') || content.toLowerCase().includes('make')) {
      return {
        message: `I understand you want to create something. Let me help!\n\n📋 **What I understood:**\n${content}\n\n${hasImage ? '🖼️ I see you uploaded a reference image - I\'ll match that design.\n' : ''}${hasVideo ? '🎬 I\'ll analyze the video for reference.\n' : ''}${hasFile ? '📄 I\'ll extract requirements from your document.\n' : ''}\n\n✅ Ready to start building? Just say "OK" or "Go ahead"!`,
        needsClarification: false,
        canBuild: true,
        projectName: extractProjectName(content),
        description: content,
      };
    }

    if (content.toLowerCase().includes('fix') || content.toLowerCase().includes('bug') || content.toLowerCase().includes('error')) {
      return {
        message: `🔧 I understand you're reporting an issue.\n\n${hasImage ? '📸 I see the screenshot - analyzing the problem...\n' : ''}\n\n**Detected Issue:** UI rendering problem\n**Suggested Fix:** Auto-correcting component styles\n\nShould I apply this fix automatically?`,
        needsClarification: true,
        canBuild: false,
      };
    }

    return {
      message: `I'm here to help! 🤖\n\nYou can:\n• Describe what you want to build\n• Upload a design image\n• Share a reference video\n• Upload requirements document\n• Report a bug with a screenshot\n\nWhat would you like to create today?`,
      needsClarification: false,
      canBuild: false,
    };
  };

  const extractProjectName = (content: string): string => {
    const words = content.toLowerCase().split(' ');
    const createIndex = words.findIndex(w => ['create', 'build', 'make'].includes(w));
    if (createIndex !== -1 && words[createIndex + 1]) {
      return words.slice(createIndex + 1, createIndex + 4).join(' ');
    }
    return 'New Project';
  };

  const startBuild = async (name: string, description: string) => {
    setCurrentProject({ name, description, status: 'Building' });
    setBuildStatus('building');
    setBuildProgress(0);

    await logButtonClick('auto_dev_build_start', 'Start Build', 'vala_builder', { name });

    // Simulate build progress
    const stages = [
      { progress: 15, status: 'Analyzing requirements...' },
      { progress: 30, status: 'Generating architecture...' },
      { progress: 45, status: 'Creating components...' },
      { progress: 60, status: 'Building UI...' },
      { progress: 75, status: 'Connecting APIs...' },
      { progress: 85, status: 'Running tests...', buildStatus: 'testing' as BuildStatus },
      { progress: 95, status: 'Deploying...', buildStatus: 'deploying' as BuildStatus },
      { progress: 100, status: 'Complete!', buildStatus: 'complete' as BuildStatus },
    ];

    for (const stage of stages) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setBuildProgress(stage.progress);
      if (stage.buildStatus) {
        setBuildStatus(stage.buildStatus);
      }
      setCurrentProject(prev => prev ? { ...prev, status: stage.status } : null);
    }

    toast.success('🎉 Your software is now live!', {
      description: 'Domain and license auto-configured.',
    });
  };

  const handlePauseBuild = async () => {
    await logButtonClick('auto_dev_pause', 'Pause Build', 'vala_builder');
    setBuildStatus('paused');
    toast.warning('Build paused', { description: 'You can resume anytime.' });
  };

  const handleResumeBuild = async () => {
    await logButtonClick('auto_dev_resume', 'Resume Build', 'vala_builder');
    setBuildStatus('building');
    toast.success('Build resumed');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-950 to-slate-950 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Auto Development</h1>
              <p className="text-sm text-purple-400">Voice • Text • Image • Video • Unlimited Possibilities</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/50">
              <Bot className="w-3 h-3 mr-1" />
              AI Active
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowHelp(!showHelp)}
              className="text-muted-foreground hover:text-white"
            >
              <HelpCircle className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Universal Input & Conversation */}
        <div className="lg:col-span-2 space-y-6">
          {/* Universal Input Box */}
          <UniversalInputBox 
            onSubmit={handleUserInput}
            isProcessing={buildStatus === 'understanding'}
          />

          {/* AI Conversation */}
          <AIConversation 
            messages={conversation}
            buildStatus={buildStatus}
          />

          {/* Quick Actions */}
          <QuickActions 
            onAction={(action) => {
              handleUserInput(`${action}`, 'text');
            }}
          />
        </div>

        {/* Right Column - Build Progress & Help */}
        <div className="space-y-6">
          {/* Build Progress */}
          <BuildProgress 
            status={buildStatus}
            progress={buildProgress}
            project={currentProject}
            onPause={handlePauseBuild}
            onResume={handleResumeBuild}
          />

          {/* Contextual Help */}
          <AnimatePresence>
            {showHelp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <AutoDevHelp />
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI Suggestions */}
          <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-violet-300">
                <Lightbulb className="w-4 h-4" />
                AI Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-muted-foreground">
                {buildStatus === 'idle' 
                  ? 'Try saying: "Create a school management system"'
                  : buildStatus === 'complete'
                  ? 'Your software is live! Want to add more features?'
                  : 'I\'m working on your request...'}
              </p>
              {buildStatus === 'idle' && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {['Restaurant POS', 'CRM System', 'E-commerce', 'HR Portal'].map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="ghost"
                      size="sm"
                      className="text-xs bg-violet-500/10 hover:bg-violet-500/20 text-violet-300"
                      onClick={() => handleUserInput(`Create a ${suggestion}`, 'text')}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AutoDevDashboard;
