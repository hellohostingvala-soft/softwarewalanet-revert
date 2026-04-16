// Global Header Component
// With all missing buttons: Search, Analytics, Notifications, Wallet Top-Up, Download Center, Settings

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  BarChart3,
  Bell,
  Wallet,
  Download,
  Settings,
  ChevronDown,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import '../../../styles/premium-7d-theme.css';

const GlobalHeader = () => {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New order received', message: 'Order #1234 created', priority: 'high', read: false },
    { id: 2, title: 'Payment successful', message: 'Wallet payment completed', priority: 'medium', read: false },
    { id: 3, title: 'Commission credited', message: '$50 credited to reseller wallet', priority: 'low', read: true },
  ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleNotificationClick = (notification: any) => {
    setNotificationsOpen(false);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 bg-[#0B0F1A]/95 backdrop-blur-sm border-b border-indigo-500/20 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-white">Vala Platform</h1>
        </div>

        {/* Center Actions */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-indigo-500/10"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="w-5 h-5" />
            </Button>
            {searchOpen && (
              <Card className="absolute top-full left-0 mt-2 w-96 bg-[#1A2236] border-indigo-500/20 p-4">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <Input
                    placeholder="Search products, docs, pages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-[#0B0F1A] border-indigo-500/20 text-white flex-1"
                    autoFocus
                  />
                  <Button type="submit" className="bg-gradient-to-r from-indigo-500 to-cyan-500">
                    Search
                  </Button>
                </form>
              </Card>
            )}
          </div>

          {/* Analytics */}
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-indigo-500/10"
            onClick={() => navigate('/control-panel?view=analytics')}
            title="Analytics"
          >
            <BarChart3 className="w-5 h-5" />
          </Button>

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-indigo-500/10"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center p-0">
                  {unreadCount}
                </Badge>
              )}
            </Button>
            {notificationsOpen && (
              <Card className="absolute top-full right-0 mt-2 w-80 bg-[#1A2236] border-indigo-500/20 max-h-96 overflow-y-auto">
                <div className="p-4 border-b border-indigo-500/20 flex items-center justify-between">
                  <h3 className="text-white font-semibold">Notifications</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-indigo-500/10"
                    onClick={() => setNotificationsOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="p-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg cursor-pointer hover:bg-indigo-500/10 transition-colors ${
                        !notification.read ? 'bg-indigo-500/5' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          notification.priority === 'high' ? 'bg-red-500' :
                          notification.priority === 'medium' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`} />
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm">{notification.title}</p>
                          <p className="text-gray-400 text-xs">{notification.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Wallet Top-Up */}
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-indigo-500/10"
            onClick={() => navigate('/wallet/topup')}
            title="Wallet Top-Up"
          >
            <Wallet className="w-5 h-5" />
          </Button>

          {/* Download Center */}
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-indigo-500/10"
            onClick={() => navigate('/downloads')}
            title="Download Center"
          >
            <Download className="w-5 h-5" />
          </Button>

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-indigo-500/10"
            onClick={() => navigate('/control-panel/settings')}
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
            <span className="text-white font-bold">U</span>
          </div>
          <div className="text-right">
            <p className="text-white font-medium text-sm">User</p>
            <p className="text-gray-400 text-xs">Online</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default GlobalHeader;
