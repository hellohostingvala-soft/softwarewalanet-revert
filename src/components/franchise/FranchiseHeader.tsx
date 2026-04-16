// Franchise Header Component
// Marketplace, Place Order, Promise, Assist, Notifications, Wallet, Profile Menu, Auto Refresh, Search, Quick Actions

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  ClipboardList,
  CheckCircle,
  MessageSquare,
  Bell,
  Wallet,
  User,
  LogOut,
  Search,
  RefreshCw,
  UserPlus,
  Target,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

interface HeaderProps {
  onRefresh?: () => void;
  autoRefresh?: boolean;
  onToggleAutoRefresh?: () => void;
}

const FranchiseHeader = ({ onRefresh, autoRefresh, onToggleAutoRefresh }: HeaderProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [walletBalance, setWalletBalance] = useState('₹0');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadNotifications();
    loadWalletBalance();
  }, []);

  const loadNotifications = async () => {
    try {
      // GET /api/notifications?role=franchise
      const response = await fetch('/api/notifications?role=franchise');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: any) => !n.read).length);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const loadWalletBalance = async () => {
    try {
      // GET /api/wallet/balance
      const response = await fetch('/api/wallet/balance');
      if (response.ok) {
        const data = await response.json();
        setWalletBalance(`₹${data.balance.toLocaleString()}`);
      }
    } catch (error) {
      console.error('Failed to load wallet balance:', error);
    }
  };

  const handleMarketplace = async () => {
    try {
      // GET /api/products?region
      const response = await fetch('/api/products?region=current');
      if (response.ok) {
        const data = await response.json();
        // State sync (category/sub/micro)
        navigate('/franchise/marketplace', { state: { products: data } });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load marketplace products',
        variant: 'destructive',
      });
    }
  };

  const handlePlaceOrder = () => {
    // Open product select modal
    // POST /api/orders/create
    // redirect /checkout
    // payment → order_confirm
    navigate('/franchise/orders?action=create');
  };

  const handlePromise = () => {
    // Open form modal
    // POST /api/promise/create
    // sync → control-panel (approval)
    navigate('/franchise/promises?action=create');
  };

  const handleAssist = () => {
    // Open support chat/ticket modal
    // POST /api/support/create
    navigate('/franchise/support?action=create');
  };

  const handleNotifications = async () => {
    // Mark all as read
    try {
      // PATCH /api/notifications/read
      const response = await fetch('/api/notifications/read', {
        method: 'PATCH',
      });
      if (response.ok) {
        setUnreadCount(0);
        loadNotifications();
      }
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
    navigate('/franchise/notifications');
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // GET /api/search?q=
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        // results: products/leads/orders
        setSearchResults(data);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLogout = async () => {
    try {
      // POST /api/auth/logout
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (response.ok) {
        navigate('/login');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to logout',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="bg-[#121826] border-b border-indigo-500/20 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Header Buttons */}
        <div className="flex items-center gap-3">
          <Button
            className="bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600"
            onClick={handleMarketplace}
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Marketplace
          </Button>
          <Button
            variant="outline"
            className="border-indigo-500 text-white hover:bg-indigo-500/10"
            onClick={handlePlaceOrder}
          >
            <ClipboardList className="w-4 h-4 mr-2" />
            Place Order
          </Button>
          <Button
            variant="outline"
            className="border-indigo-500 text-white hover:bg-indigo-500/10"
            onClick={handlePromise}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Promise
          </Button>
          <Button
            variant="outline"
            className="border-indigo-500 text-white hover:bg-indigo-500/10"
            onClick={handleAssist}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Assist
          </Button>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-md mx-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search products, leads, orders..."
              className="bg-[#1A2236] border-indigo-500/20 text-white pl-10 pr-4"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#1A2236] border border-indigo-500/20 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="p-3 hover:bg-indigo-500/10 cursor-pointer border-b border-indigo-500/10 last:border-0"
                    onClick={() => {
                      navigate(result.route);
                      setSearchResults([]);
                      setSearchQuery('');
                    }}
                  >
                    <p className="text-white text-sm">{result.title}</p>
                    <p className="text-gray-400 text-xs">{result.type}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Notifications, Wallet, Profile, Auto Refresh */}
        <div className="flex items-center gap-3">
          {/* Auto Refresh Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className={`text-white hover:bg-indigo-500/10 ${autoRefresh ? 'bg-indigo-500/20' : ''}`}
            onClick={onToggleAutoRefresh}
          >
            <RefreshCw className={`w-5 h-5 ${autoRefresh ? 'animate-spin' : ''}`} />
          </Button>

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-indigo-500/10"
              onClick={handleNotifications}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Wallet Balance */}
          <Button
            variant="outline"
            className="border-indigo-500 text-white hover:bg-indigo-500/10"
            onClick={() => navigate('/franchise/wallet')}
          >
            <Wallet className="w-4 h-4 mr-2" />
            {walletBalance}
          </Button>

          {/* Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-indigo-500/10">
                <User className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#1A2236] border-indigo-500/20 text-white">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-indigo-500/20" />
              <DropdownMenuItem onClick={() => navigate('/franchise/settings')}>
                <User className="w-4 h-4 mr-2" />
                My Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-indigo-500/20" />
              <DropdownMenuItem onClick={handleLogout} className="text-red-400">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-4 mt-4 text-sm">
        <span className="text-gray-400">Quick Actions:</span>
        <Button
          variant="ghost"
          size="sm"
          className="text-indigo-400 hover:bg-indigo-500/10"
          onClick={() => navigate('/franchise/employees/create')}
        >
          <UserPlus className="w-4 h-4 mr-1" />
          Add Employee
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-indigo-400 hover:bg-indigo-500/10"
          onClick={() => navigate('/franchise/leads-seo')}
        >
          <Target className="w-4 h-4 mr-1" />
          View Leads
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-indigo-400 hover:bg-indigo-500/10"
          onClick={() => navigate('/franchise/invoices/create')}
        >
          <FileText className="w-4 h-4 mr-1" />
          Create Invoice
        </Button>
      </div>
    </div>
  );
};

export default FranchiseHeader;
