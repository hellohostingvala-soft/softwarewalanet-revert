import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Shield, 
  Crown, 
  Building2, 
  ShoppingBag, 
  Headphones, 
  TrendingUp,
  Star,
  User,
  Briefcase,
  Users,
  Lock,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface MaskedUser {
  maskedId: string;
  role: string;
  icon: React.ReactNode;
  color: string;
}

interface ChatMessage {
  id: string;
  sender: MaskedUser;
  content: string;
  timestamp: Date;
  isOwn?: boolean;
}

// Generate masked ID based on role with specific digit counts
const generateMaskedId = (role: string, userId: string): MaskedUser => {
  const hash = userId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  
  switch (role) {
    case 'super_admin':
      return {
        maskedId: `👑 BOSS-${String(hash % 100).padStart(2, '0')}`,
        role: 'Super Admin',
        icon: <Crown className="w-4 h-4" />,
        color: 'text-yellow-500 bg-yellow-500/10'
      };
    case 'admin':
    case 'management':
      return {
        maskedId: `MGT-${String(hash % 100).padStart(2, '0')}`,
        role: 'Management',
        icon: <Shield className="w-4 h-4" />,
        color: 'text-purple-500 bg-purple-500/10'
      };
    case 'developer':
    case 'employee':
    case 'hr':
    case 'legal':
    case 'task_manager':
      return {
        maskedId: `EMP-${String(hash % 1000).padStart(3, '0')}`,
        role: 'Employee',
        icon: <Briefcase className="w-4 h-4" />,
        color: 'text-blue-500 bg-blue-500/10'
      };
    case 'franchise':
      return {
        maskedId: `FRN-${String(hash % 10000).padStart(4, '0')}`,
        role: 'Franchise',
        icon: <Building2 className="w-4 h-4" />,
        color: 'text-emerald-500 bg-emerald-500/10'
      };
    case 'reseller':
      return {
        maskedId: `RSL-${String(hash % 100000).padStart(5, '0')}`,
        role: 'Reseller',
        icon: <ShoppingBag className="w-4 h-4" />,
        color: 'text-orange-500 bg-orange-500/10'
      };
    case 'sales_support':
    case 'sales':
      return {
        maskedId: `SLS-${String(hash % 100000).padStart(5, '0')}`,
        role: 'Sales',
        icon: <TrendingUp className="w-4 h-4" />,
        color: 'text-pink-500 bg-pink-500/10'
      };
    case 'support':
      return {
        maskedId: `SUP-${String(hash % 100000).padStart(5, '0')}`,
        role: 'Support',
        icon: <Headphones className="w-4 h-4" />,
        color: 'text-cyan-500 bg-cyan-500/10'
      };
    case 'prime_user':
      return {
        maskedId: `⭐ PRM-${String(hash % 10000000).padStart(7, '0')}`,
        role: 'Prime',
        icon: <Star className="w-4 h-4" />,
        color: 'text-amber-500 bg-amber-500/10'
      };
    case 'user':
    case 'common':
      return {
        maskedId: `USR-${String(hash % 100000000).padStart(8, '0')}`,
        role: 'User',
        icon: <User className="w-4 h-4" />,
        color: 'text-slate-400 bg-slate-500/10'
      };
    default:
      return {
        maskedId: `OTH-${String(hash % 1000000).padStart(6, '0')}`,
        role: 'Other',
        icon: <Users className="w-4 h-4" />,
        color: 'text-gray-500 bg-gray-500/10'
      };
  }
};

// Mock messages for demo
const mockMessages: ChatMessage[] = [
  {
    id: '1',
    sender: generateMaskedId('super_admin', 'user-boss-001'),
    content: 'System update scheduled for tonight at 2 AM.',
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: '2',
    sender: generateMaskedId('admin', 'user-mgt-002'),
    content: 'Acknowledged. All teams notified.',
    timestamp: new Date(Date.now() - 3000000),
  },
  {
    id: '3',
    sender: generateMaskedId('developer', 'user-dev-003'),
    content: 'Backend migration scripts are ready.',
    timestamp: new Date(Date.now() - 2400000),
  },
  {
    id: '4',
    sender: generateMaskedId('franchise', 'user-frn-004'),
    content: 'Will this affect our local operations?',
    timestamp: new Date(Date.now() - 1800000),
  },
  {
    id: '5',
    sender: generateMaskedId('reseller', 'user-rsl-005'),
    content: 'Client asked about the new pricing. Any updates?',
    timestamp: new Date(Date.now() - 1500000),
  },
  {
    id: '6',
    sender: generateMaskedId('support', 'user-sup-006'),
    content: 'No impact expected. Maintenance window is 30 mins.',
    timestamp: new Date(Date.now() - 1200000),
  },
  {
    id: '7',
    sender: generateMaskedId('prime_user', 'user-prm-007'),
    content: 'Thanks for the heads up!',
    timestamp: new Date(Date.now() - 600000),
  },
  {
    id: '8',
    sender: generateMaskedId('user', 'user-common-008'),
    content: 'When will the new features be available?',
    timestamp: new Date(Date.now() - 300000),
  },
];

const MaskedInternalChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser] = useState<MaskedUser>(generateMaskedId('developer', 'current-user-session'));
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      sender: currentUser,
      content: newMessage,
      timestamp: new Date(),
      isOwn: true,
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <Card className="bg-slate-900/80 border-slate-800 p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">Internal Masked Chat</h1>
                  <p className="text-xs text-muted-foreground">No real names • Only masked IDs + icons</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                  <Globe className="w-3 h-3 mr-1" />
                  Secure
                </Badge>
                <Badge variant="outline" className={currentUser.color}>
                  {currentUser.icon}
                  <span className="ml-1 font-mono">{currentUser.maskedId}</span>
                </Badge>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-4"
        >
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-2 text-xs text-amber-400 flex items-center gap-2">
            <Shield className="w-4 h-4 flex-shrink-0" />
            <span>Screenshots disabled • Messages cannot be edited or deleted • All activity logged</span>
          </div>
        </motion.div>

        {/* Chat Area */}
        <Card className="bg-slate-900/80 border-slate-800 overflow-hidden">
          <ScrollArea className="h-[500px] p-4" ref={scrollRef}>
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`mb-4 flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${message.isOwn ? 'order-2' : ''}`}>
                    {/* Sender Info */}
                    <div className={`flex items-center gap-2 mb-1 ${message.isOwn ? 'justify-end' : ''}`}>
                      <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs ${message.sender.color}`}>
                        {message.sender.icon}
                        <span className="font-mono font-medium">{message.sender.maskedId}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    
                    {/* Message Bubble */}
                    <div className={`rounded-2xl px-4 py-2.5 ${
                      message.isOwn 
                        ? 'bg-primary text-primary-foreground rounded-br-sm' 
                        : 'bg-slate-800 text-foreground rounded-bl-sm'
                    }`}>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-slate-800 p-4 bg-slate-900/50">
            <div className="flex items-center gap-3">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a secure message..."
                className="flex-1 bg-slate-800 border-slate-700 focus:border-primary"
              />
              <Button 
                onClick={handleSend}
                disabled={!newMessage.trim()}
                size="icon"
                className="shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 text-center">
              Your identity is protected. You appear as <span className="font-mono text-primary">{currentUser.maskedId}</span>
            </p>
          </div>
        </Card>

        {/* Role Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4"
        >
          <Card className="bg-slate-900/60 border-slate-800 p-4">
            <p className="text-xs text-muted-foreground mb-3 font-medium">Identity Masking Legend</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                { ...generateMaskedId('super_admin', 'legend-1'), label: '2-digit' },
                { ...generateMaskedId('admin', 'legend-2'), label: '2-digit' },
                { ...generateMaskedId('developer', 'legend-3'), label: '3-digit' },
                { ...generateMaskedId('franchise', 'legend-4'), label: '4-digit' },
                { ...generateMaskedId('reseller', 'legend-5'), label: '5-digit' },
                { ...generateMaskedId('support', 'legend-6'), label: '5-digit' },
                { ...generateMaskedId('prime_user', 'legend-7'), label: '7-digit' },
                { ...generateMaskedId('user', 'legend-8'), label: '8-digit' },
              ].map((item, i) => (
                <div key={i} className={`flex items-center gap-2 px-2 py-1.5 rounded ${item.color}`}>
                  {item.icon}
                  <span className="font-medium">{item.role}</span>
                  <span className="text-muted-foreground">({item.label})</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default MaskedInternalChat;
