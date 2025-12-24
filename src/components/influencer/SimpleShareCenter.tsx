import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Link2, Copy, Check, Share2, QrCode, ExternalLink,
  MousePointer, TrendingUp, Users, DollarSign, Eye,
  Send, MessageCircle, Instagram, Twitter, Facebook,
  Smartphone, Globe, Clock, CheckCircle2, Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';

interface SharedLink {
  id: string;
  url: string;
  shortUrl: string;
  product: string;
  clicks: number;
  conversions: number;
  earnings: number;
  createdAt: Date;
  lastClickAt: Date | null;
}

const SimpleShareCenter = () => {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Live click counter
  const [liveClicks, setLiveClicks] = useState(1234);
  const [todayEarnings, setTodayEarnings] = useState(4520);

  // Shared links history
  const [sharedLinks] = useState<SharedLink[]>([
    {
      id: '1',
      url: 'https://softwarevala.com/pos-system',
      shortUrl: 'https://sv.link/abc123',
      product: 'POS System',
      clicks: 456,
      conversions: 23,
      earnings: 3450,
      createdAt: new Date(Date.now() - 86400000),
      lastClickAt: new Date(Date.now() - 300000)
    },
    {
      id: '2',
      url: 'https://softwarevala.com/school-erp',
      shortUrl: 'https://sv.link/def456',
      product: 'School ERP',
      clicks: 289,
      conversions: 15,
      earnings: 2250,
      createdAt: new Date(Date.now() - 172800000),
      lastClickAt: new Date(Date.now() - 600000)
    },
    {
      id: '3',
      url: 'https://softwarevala.com/hospital-crm',
      shortUrl: 'https://sv.link/ghi789',
      product: 'Hospital CRM',
      clicks: 178,
      conversions: 8,
      earnings: 1440,
      createdAt: new Date(Date.now() - 259200000),
      lastClickAt: new Date(Date.now() - 1200000)
    },
  ]);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setLiveClicks(prev => prev + 1);
        toast.success('New click detected!', {
          description: 'Someone clicked your link',
          duration: 2000
        });
      }
      if (Math.random() > 0.9) {
        setTodayEarnings(prev => prev + Math.floor(Math.random() * 150));
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerateLink = () => {
    if (!websiteUrl.trim()) {
      toast.error('Please enter a URL first');
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      const shortCode = Math.random().toString(36).substring(2, 8);
      setGeneratedLink(`https://sv.link/${shortCode}`);
      setIsGenerating(false);
      toast.success('Link created successfully!');
    }, 1000);
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    const shareUrl = generatedLink || 'https://sv.link/demo';
    const text = 'Check out this amazing software!';
    
    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      instagram: shareUrl, // Instagram doesn't support direct URL sharing
    };

    if (platform === 'instagram') {
      handleCopyLink(shareUrl);
      toast.info('Link copied! Paste it in Instagram');
    } else {
      window.open(urls[platform], '_blank');
    }
  };

  const formatTimeAgo = (date: Date | null) => {
    if (!date) return 'Never';
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header with Live Stats */}
      <div className="flex flex-col lg:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500">
              <Share2 className="w-8 h-8 text-white" />
            </div>
            Share & Earn
          </h1>
          <p className="text-slate-400 mt-2 text-lg">Share your link → Users click → You earn money!</p>
        </div>

        {/* Live Stats Ticker */}
        <div className="flex gap-4">
          <motion.div
            animate={{ boxShadow: ['0 0 20px rgba(16, 185, 129, 0.2)', '0 0 40px rgba(16, 185, 129, 0.4)', '0 0 20px rgba(16, 185, 129, 0.2)'] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="px-6 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3"
          >
            <MousePointer className="w-6 h-6 text-emerald-400" />
            <div>
              <p className="text-xs text-emerald-400">Total Clicks</p>
              <motion.p 
                key={liveClicks}
                initial={{ scale: 1.2, color: '#34d399' }}
                animate={{ scale: 1, color: '#ffffff' }}
                className="text-2xl font-bold"
              >
                {liveClicks.toLocaleString()}
              </motion.p>
            </div>
          </motion.div>

          <motion.div
            animate={{ boxShadow: ['0 0 20px rgba(139, 92, 246, 0.2)', '0 0 40px rgba(139, 92, 246, 0.4)', '0 0 20px rgba(139, 92, 246, 0.2)'] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="px-6 py-3 rounded-2xl bg-violet-500/10 border border-violet-500/30 flex items-center gap-3"
          >
            <DollarSign className="w-6 h-6 text-violet-400" />
            <div>
              <p className="text-xs text-violet-400">Today's Earnings</p>
              <motion.p 
                key={todayEarnings}
                initial={{ scale: 1.2, color: '#a78bfa' }}
                animate={{ scale: 1, color: '#ffffff' }}
                className="text-2xl font-bold"
              >
                ₹{todayEarnings.toLocaleString()}
              </motion.p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Step by Step Guide */}
      <Card className="bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border-violet-500/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-8 justify-center">
            {[
              { step: 1, icon: Link2, text: 'Paste URL' },
              { step: 2, icon: Sparkles, text: 'Get Short Link' },
              { step: 3, icon: Share2, text: 'Share Anywhere' },
              { step: 4, icon: DollarSign, text: 'Earn Money!' },
            ].map((item, i) => (
              <div key={item.step} className="flex items-center gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-white font-medium">{item.text}</p>
                </div>
                {i < 3 && (
                  <div className="w-12 h-0.5 bg-gradient-to-r from-violet-500 to-cyan-500" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Share Box */}
      <Card className="bg-slate-900/60 border-violet-500/30">
        <CardHeader>
          <CardTitle className="text-xl text-white flex items-center gap-2">
            <Link2 className="w-6 h-6 text-violet-400" />
            Create Your Share Link
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* URL Input */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="Paste any website URL here... (e.g., https://softwarevala.com/pos)"
                className="pl-12 h-14 text-lg bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
            <Button
              onClick={handleGenerateLink}
              disabled={isGenerating}
              className="h-14 px-8 bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 text-white text-lg font-semibold"
            >
              {isGenerating ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                  <Sparkles className="w-6 h-6" />
                </motion.div>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create Link
                </>
              )}
            </Button>
          </div>

          {/* Generated Link Box */}
          <AnimatePresence>
            {generatedLink && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30"
              >
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Your link is ready!</span>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                  <code className="flex-1 text-xl text-cyan-400 font-mono">{generatedLink}</code>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleCopyLink(generatedLink)}
                    className="border-slate-600 text-white hover:bg-slate-700"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                    <span className="ml-2">{copied ? 'Copied!' : 'Copy'}</span>
                  </Button>
                </div>

                {/* Share Buttons */}
                <div className="mt-6">
                  <p className="text-slate-400 mb-3">Share on:</p>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleShare('whatsapp')}
                      className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      WhatsApp
                    </Button>
                    <Button
                      onClick={() => handleShare('facebook')}
                      className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Facebook className="w-5 h-5 mr-2" />
                      Facebook
                    </Button>
                    <Button
                      onClick={() => handleShare('twitter')}
                      className="flex-1 h-12 bg-sky-500 hover:bg-sky-600 text-white"
                    >
                      <Twitter className="w-5 h-5 mr-2" />
                      Twitter
                    </Button>
                    <Button
                      onClick={() => handleShare('instagram')}
                      className="flex-1 h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    >
                      <Instagram className="w-5 h-5 mr-2" />
                      Instagram
                    </Button>
                  </div>
                </div>

                {/* QR Code Toggle */}
                <div className="mt-6 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setShowQR(!showQR)}
                    className="border-slate-600 text-white hover:bg-slate-800"
                  >
                    <QrCode className="w-5 h-5 mr-2" />
                    {showQR ? 'Hide' : 'Show'} QR Code
                  </Button>
                </div>

                <AnimatePresence>
                  {showQR && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 flex justify-center"
                    >
                      <div className="p-6 rounded-2xl bg-white">
                        <QRCodeSVG value={generatedLink} size={180} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* My Shared Links */}
      <Card className="bg-slate-900/60 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-xl text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Eye className="w-6 h-6 text-cyan-400" />
              My Shared Links
            </span>
            <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30">
              {sharedLinks.length} Active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sharedLinks.map((link, index) => (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-violet-500/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                        {link.product}
                      </Badge>
                      <span className="text-sm text-slate-500">
                        <Clock className="w-3 h-3 inline mr-1" />
                        Last click: {formatTimeAgo(link.lastClickAt)}
                      </span>
                    </div>
                    <code className="text-cyan-400 font-mono">{link.shortUrl}</code>
                    <p className="text-sm text-slate-500 mt-1 truncate">{link.url}</p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{link.clicks}</p>
                      <p className="text-xs text-slate-500">Clicks</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-400">{link.conversions}</p>
                      <p className="text-xs text-slate-500">Sales</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-violet-400">₹{link.earnings}</p>
                      <p className="text-xs text-slate-500">Earned</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyLink(link.shortUrl)}
                      className="border-slate-600 text-slate-300"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Links', value: '24', icon: Link2, color: 'violet', subtext: '3 new today' },
          { label: 'Total Clicks', value: '45.8K', icon: MousePointer, color: 'cyan', subtext: '+12% this week' },
          { label: 'Conversions', value: '234', icon: Users, color: 'emerald', subtext: '5.1% rate' },
          { label: 'Total Earned', value: '₹1,45,280', icon: DollarSign, color: 'amber', subtext: 'Lifetime' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-5">
                <stat.icon className={`w-8 h-8 text-${stat.color}-400 mb-3`} />
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-slate-400">{stat.label}</p>
                <p className={`text-sm text-${stat.color}-400 mt-1`}>{stat.subtext}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SimpleShareCenter;
