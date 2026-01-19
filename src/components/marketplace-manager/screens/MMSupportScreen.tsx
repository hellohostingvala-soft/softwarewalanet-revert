import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  Image as ImageIcon,
  Mic,
  User,
  Bot,
  Clock,
  CheckCheck,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  content: string;
  timestamp: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  type?: 'text' | 'image' | 'file';
}

const initialMessages: Message[] = [
  {
    id: '1',
    sender: 'bot',
    content: 'Hello! 👋 Welcome to Software Vala Support. I\'m powered by AI and ready to help you with orders, products, wallet, and more. How can I assist you today?',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'read'
  },
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-marketplace-support`;

type ChatMsg = { role: 'user' | 'assistant'; content: string };

async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: ChatMsg[];
  onDelta: (deltaText: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}) {
  try {
    const resp = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages }),
    });

    if (resp.status === 429) {
      onError('Rate limit exceeded. Please wait a moment and try again.');
      return;
    }
    if (resp.status === 402) {
      onError('AI credits exhausted. Please contact support.');
      return;
    }
    if (!resp.ok || !resp.body) {
      onError('Failed to connect to AI service.');
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }

    // Final flush
    if (textBuffer.trim()) {
      for (let raw of textBuffer.split('\n')) {
        if (!raw) continue;
        if (raw.endsWith('\r')) raw = raw.slice(0, -1);
        if (raw.startsWith(':') || raw.trim() === '') continue;
        if (!raw.startsWith('data: ')) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === '[DONE]') continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch { /* ignore */ }
      }
    }

    onDone();
  } catch (error) {
    console.error('Stream error:', error);
    onError('Connection error. Please try again.');
  }
}

export function MMSupportScreen() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [chatHistory, setChatHistory] = useState<ChatMsg[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };

    setMessages(prev => [...prev, userMessage]);
    const newChatHistory: ChatMsg[] = [...chatHistory, { role: 'user', content: inputValue }];
    setChatHistory(newChatHistory);
    setInputValue('');
    setIsTyping(true);

    let assistantContent = '';
    const botMessageId = (Date.now() + 1).toString();

    // Add empty bot message that will be updated
    setMessages(prev => [...prev, {
      id: botMessageId,
      sender: 'bot',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered'
    }]);

    await streamChat({
      messages: newChatHistory,
      onDelta: (chunk) => {
        assistantContent += chunk;
        setMessages(prev => prev.map(m => 
          m.id === botMessageId ? { ...m, content: assistantContent } : m
        ));
      },
      onDone: () => {
        setIsTyping(false);
        setChatHistory(prev => [...prev, { role: 'assistant', content: assistantContent }]);
      },
      onError: (error) => {
        setIsTyping(false);
        toast.error(error);
        // Update bot message with error
        setMessages(prev => prev.map(m => 
          m.id === botMessageId ? { ...m, content: `⚠️ ${error}` } : m
        ));
      }
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (action: string) => {
    setInputValue(action);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 bg-slate-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
            </div>
            <div>
              <h2 className="font-semibold flex items-center gap-2">
                AI Support Assistant
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                  Lovable AI
                </Badge>
              </h2>
              <p className="text-xs text-emerald-400">Online • Powered by Gemini</p>
            </div>
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            <Clock className="h-3 w-3 mr-1" />
            Instant responses
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                ${message.sender === 'user' 
                  ? 'bg-purple-500' 
                  : 'bg-gradient-to-br from-purple-500 to-pink-500'
                }
              `}>
                {message.sender === 'user' ? (
                  <User className="h-4 w-4 text-white" />
                ) : (
                  <Sparkles className="h-4 w-4 text-white" />
                )}
              </div>
              <div>
                <div className={`
                  p-3 rounded-2xl whitespace-pre-wrap
                  ${message.sender === 'user'
                    ? 'bg-purple-500 text-white rounded-tr-sm'
                    : 'bg-slate-800 border border-slate-700 rounded-tl-sm'
                  }
                `}>
                  {message.content || (
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  )}
                </div>
                <div className={`flex items-center gap-1 mt-1 text-xs text-slate-500 ${
                  message.sender === 'user' ? 'justify-end' : ''
                }`}>
                  <span>{message.timestamp}</span>
                  {message.sender === 'user' && message.status === 'read' && (
                    <CheckCheck className="h-3 w-3 text-blue-400" />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && messages[messages.length - 1]?.content && (
          <div className="flex justify-start">
            <div className="flex gap-2 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700 rounded-tl-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-t border-slate-700 bg-slate-900">
        <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
          {['Order Status', 'Wallet Balance', 'Product Info', 'Report Issue', 'Development Progress'].map(action => (
            <Button
              key={action}
              variant="outline"
              size="sm"
              className="border-slate-600 whitespace-nowrap hover:bg-purple-500/20 hover:border-purple-500/50"
              onClick={() => handleQuickAction(action)}
            >
              {action}
            </Button>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="border-slate-600">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="border-slate-600">
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Input
            placeholder="Ask me anything..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-slate-800 border-slate-700"
            disabled={isTyping}
          />
          <Button variant="outline" size="icon" className="border-slate-600">
            <Mic className="h-4 w-4" />
          </Button>
          <Button 
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            className="bg-purple-500 hover:bg-purple-600"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
