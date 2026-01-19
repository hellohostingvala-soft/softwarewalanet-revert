/**
 * VALA AI DEVELOPMENT STUDIO
 * Lovable-style split view with AI Chat + Live Preview
 * Features: Theme development, Clone, Update, Real-time preview
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, Send, Monitor, Tablet, Smartphone, RefreshCw, 
  Copy, Download, Eye, Code, Palette, Layout, Sparkles,
  Loader2, ChevronLeft, ChevronRight, Sun, Moon, Wand2,
  FileCode, Layers, Save, GitBranch, Play, Pause, Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type DeviceType = 'desktop' | 'tablet' | 'mobile';
type ThemeMode = 'light' | 'dark';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ThemeConfig {
  name: string;
  primary: string;
  secondary: string;
  background: string;
  foreground: string;
  accent: string;
  muted: string;
}

const defaultTheme: ThemeConfig = {
  name: 'Default Dark',
  primary: '221 83% 53%',
  secondary: '210 40% 96%',
  background: '222 47% 11%',
  foreground: '210 40% 98%',
  accent: '217 91% 60%',
  muted: '215 20% 65%',
};

const presetThemes: ThemeConfig[] = [
  { name: 'Ocean Blue', primary: '200 98% 39%', secondary: '199 89% 48%', background: '222 47% 11%', foreground: '210 40% 98%', accent: '188 94% 43%', muted: '200 20% 60%' },
  { name: 'Forest Green', primary: '142 76% 36%', secondary: '142 69% 58%', background: '220 40% 13%', foreground: '210 40% 98%', accent: '158 64% 52%', muted: '150 20% 60%' },
  { name: 'Sunset Orange', primary: '25 95% 53%', secondary: '32 98% 50%', background: '20 14% 10%', foreground: '60 9% 98%', accent: '38 92% 50%', muted: '30 20% 60%' },
  { name: 'Purple Dream', primary: '270 95% 65%', secondary: '280 87% 60%', background: '280 25% 10%', foreground: '280 20% 98%', accent: '290 90% 60%', muted: '270 20% 60%' },
  { name: 'Cyber Neon', primary: '180 100% 50%', secondary: '300 100% 50%', background: '240 20% 8%', foreground: '180 100% 90%', accent: '320 100% 60%', muted: '200 30% 50%' },
];

export const ValaAIDevStudio: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Welcome to VALA AI Dev Studio! I can help you develop themes, create UI components, and preview changes in real-time. What would you like to build today?', timestamp: new Date() }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>('desktop');
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(defaultTheme);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('/');
  const [generatedCode, setGeneratedCode] = useState('');
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'theme'>('preview');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vala-ai-chat`;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const streamChat = async (userMessage: string) => {
    setIsLoading(true);
    let assistantContent = '';
    setMessages(prev => [...prev, { role: 'assistant', content: '', timestamp: new Date() }]);

    try {
      const chatMessages = messages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }));
      chatMessages.push({ role: 'user', content: userMessage });

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          messages: chatMessages,
          userRole: 'developer',
          context: 'Theme Development Studio - Help create themes, UI components, and design systems'
        }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed`);
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = { role: 'assistant', content: assistantContent, timestamp: new Date() };
                return newMessages;
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get response';
      toast.error(errorMessage);
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { role: 'assistant', content: `Error: ${errorMessage}`, timestamp: new Date() };
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (!inputMessage.trim() || isLoading) return;
    const msg = inputMessage.trim();
    setMessages(prev => [...prev, { role: 'user', content: msg, timestamp: new Date() }]);
    setInputMessage('');
    streamChat(msg);
  };

  const handleCloneTheme = () => {
    const cloned = { ...currentTheme, name: `${currentTheme.name} (Clone)` };
    setCurrentTheme(cloned);
    toast.success('Theme cloned! Make your changes and save.');
  };

  const handleSaveTheme = () => {
    const cssVars = `
:root {
  --primary: ${currentTheme.primary};
  --secondary: ${currentTheme.secondary};
  --background: ${currentTheme.background};
  --foreground: ${currentTheme.foreground};
  --accent: ${currentTheme.accent};
  --muted: ${currentTheme.muted};
}`;
    setGeneratedCode(cssVars);
    setActiveTab('code');
    toast.success('Theme saved! CSS variables generated.');
  };

  const handleApplyTheme = (theme: ThemeConfig) => {
    setCurrentTheme(theme);
    toast.success(`Applied "${theme.name}" theme`);
  };

  const handleRefreshPreview = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
      toast.info('Preview refreshed');
    }
  };

  const getDeviceWidth = () => {
    switch (selectedDevice) {
      case 'mobile': return 'max-w-[375px]';
      case 'tablet': return 'max-w-[768px]';
      default: return 'w-full';
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
      {/* Left Panel: AI Chat */}
      <motion.div 
        className={cn(
          "flex flex-col border-r border-slate-800 bg-slate-900/50 transition-all duration-300",
          sidebarCollapsed ? "w-12" : "w-[400px]"
        )}
      >
        {/* Chat Header */}
        <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h3 className="text-sm font-semibold text-white">VALA AI</h3>
                <p className="text-xs text-emerald-400">Development Assistant</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-slate-400 hover:text-white"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        {!sidebarCollapsed && (
          <>
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}
                  >
                    <div className={cn(
                      "max-w-[85%] p-3 rounded-2xl text-sm",
                      msg.role === 'user'
                        ? "bg-emerald-500/20 text-emerald-100 rounded-br-md"
                        : "bg-slate-800 text-slate-200 rounded-bl-md"
                    )}>
                      {msg.content || (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Thinking...
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Quick Actions */}
            <div className="p-2 border-t border-slate-800">
              <div className="flex gap-1 flex-wrap">
                {['Create dark theme', 'Add glassmorphism', 'Neon accent colors', 'Minimalist style'].map((prompt) => (
                  <Button
                    key={prompt}
                    variant="outline"
                    size="sm"
                    className="text-xs h-7 bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700"
                    onClick={() => setInputMessage(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-800 bg-slate-900/50">
              <div className="flex items-center gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Describe your theme or ask for help..."
                  disabled={isLoading}
                  className="flex-1 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                />
                <Button
                  onClick={handleSend}
                  size="sm"
                  disabled={isLoading || !inputMessage.trim()}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* Right Panel: Preview & Tools */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-2">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="h-8 bg-slate-800/50">
                <TabsTrigger value="preview" className="text-xs h-7 gap-1 data-[state=active]:bg-emerald-500/20">
                  <Eye className="w-3 h-3" /> Preview
                </TabsTrigger>
                <TabsTrigger value="code" className="text-xs h-7 gap-1 data-[state=active]:bg-emerald-500/20">
                  <Code className="w-3 h-3" /> Code
                </TabsTrigger>
                <TabsTrigger value="theme" className="text-xs h-7 gap-1 data-[state=active]:bg-emerald-500/20">
                  <Palette className="w-3 h-3" /> Themes
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex items-center gap-2">
            {/* Device Toggle */}
            <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                className={cn("h-7 w-7 p-0", selectedDevice === 'desktop' && "bg-slate-700 text-cyan-400")}
                onClick={() => setSelectedDevice('desktop')}
              >
                <Monitor className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn("h-7 w-7 p-0", selectedDevice === 'tablet' && "bg-slate-700 text-cyan-400")}
                onClick={() => setSelectedDevice('tablet')}
              >
                <Tablet className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn("h-7 w-7 p-0", selectedDevice === 'mobile' && "bg-slate-700 text-cyan-400")}
                onClick={() => setSelectedDevice('mobile')}
              >
                <Smartphone className="w-4 h-4" />
              </Button>
            </div>

            {/* Theme Mode Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
              className="h-8 w-8 p-0"
            >
              {themeMode === 'dark' ? <Moon className="w-4 h-4 text-cyan-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </Button>

            {/* Actions */}
            <Button variant="outline" size="sm" className="h-8 gap-1 text-xs" onClick={handleRefreshPreview}>
              <RefreshCw className="w-3 h-3" /> Refresh
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-1 text-xs" onClick={handleCloneTheme}>
              <Copy className="w-3 h-3" /> Clone
            </Button>
            <Button size="sm" className="h-8 gap-1 text-xs bg-emerald-500 hover:bg-emerald-600" onClick={handleSaveTheme}>
              <Save className="w-3 h-3" /> Save
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === 'preview' && (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex items-center justify-center"
              >
                <div className={cn(
                  "h-full bg-slate-900 rounded-xl border border-slate-700 overflow-hidden transition-all duration-300 mx-auto",
                  getDeviceWidth()
                )}>
                  <div className="h-8 bg-slate-800 flex items-center px-3 gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    </div>
                    <Input
                      value={previewUrl}
                      onChange={(e) => setPreviewUrl(e.target.value)}
                      className="h-5 text-xs bg-slate-900 border-slate-700 text-slate-300"
                    />
                  </div>
                  <iframe
                    ref={iframeRef}
                    src={previewUrl}
                    className="w-full h-[calc(100%-2rem)] bg-white"
                    title="Live Preview"
                  />
                </div>
              </motion.div>
            )}

            {activeTab === 'code' && (
              <motion.div
                key="code"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <Card className="h-full bg-slate-900/50 border-slate-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-white">
                      <FileCode className="w-4 h-4 text-cyan-400" />
                      Generated CSS Variables
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={generatedCode || `/* Apply theme using VALA AI */
/* Select a theme or describe your requirements */

:root {
  --primary: ${currentTheme.primary};
  --secondary: ${currentTheme.secondary};
  --background: ${currentTheme.background};
  --foreground: ${currentTheme.foreground};
  --accent: ${currentTheme.accent};
  --muted: ${currentTheme.muted};
}`}
                      readOnly
                      className="h-[400px] font-mono text-sm bg-slate-950 border-slate-700 text-emerald-400"
                    />
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm" className="gap-1" onClick={() => {
                        navigator.clipboard.writeText(generatedCode || '');
                        toast.success('Code copied to clipboard');
                      }}>
                        <Copy className="w-3 h-3" /> Copy Code
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Download className="w-3 h-3" /> Download CSS
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'theme' && (
              <motion.div
                key="theme"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full overflow-auto"
              >
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Current Theme */}
                  <Card className="col-span-full bg-gradient-to-br from-slate-900 to-slate-800 border-emerald-500/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-white">
                        <Wand2 className="w-4 h-4 text-emerald-400" />
                        Current Theme: {currentTheme.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-6 gap-2">
                        {Object.entries(currentTheme).filter(([k]) => k !== 'name').map(([key, value]) => (
                          <div key={key} className="text-center">
                            <div 
                              className="w-full h-10 rounded-lg border border-slate-600 mb-1"
                              style={{ backgroundColor: `hsl(${value})` }}
                            />
                            <p className="text-[10px] text-slate-400 capitalize">{key}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Preset Themes */}
                  {presetThemes.map((theme) => (
                    <Card 
                      key={theme.name}
                      className="bg-slate-900/50 border-slate-800 hover:border-slate-600 cursor-pointer transition-all"
                      onClick={() => handleApplyTheme(theme)}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs text-white">{theme.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-1">
                          <div className="w-6 h-6 rounded" style={{ backgroundColor: `hsl(${theme.primary})` }} />
                          <div className="w-6 h-6 rounded" style={{ backgroundColor: `hsl(${theme.secondary})` }} />
                          <div className="w-6 h-6 rounded" style={{ backgroundColor: `hsl(${theme.accent})` }} />
                        </div>
                        <Button size="sm" variant="outline" className="w-full mt-2 text-xs h-7">
                          Apply Theme
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ValaAIDevStudio;
