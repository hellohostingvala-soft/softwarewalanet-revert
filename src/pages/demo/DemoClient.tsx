/**
 * DEMO: Client / End-User Dashboard
 * Standalone demo — no auth or database calls required.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, Play, Wallet, Headphones, LogOut, Bell,
  ChevronRight, CheckCircle, Clock, Star, Crown,
  Plus, HelpCircle, Gift, Zap, User, Settings,
  ExternalLink, Download, MessageCircle, Eye, ArrowLeft,
  ShoppingCart, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import softwareValaLogo from "@/assets/software-vala-logo.png";

// ─── Mock Data ────────────────────────────────────────────────────
const MOCK_PRODUCTS = [
  {
    id: "1",
    name: "Restaurant POS",
    purchaseDate: "15 Jan 2025",
    status: "active",
    demoPath: "/demo/restaurant-pos",
  },
  {
    id: "2",
    name: "Hotel Management System",
    purchaseDate: "10 Jan 2025",
    status: "active",
    demoPath: "/demo/hotel-booking",
  },
];

const MOCK_DEMO_HISTORY = [
  { id: "1", name: "School ERP", viewedAt: "20 Jan 2025", category: "Education" },
  { id: "2", name: "Gym Management", viewedAt: "18 Jan 2025", category: "Fitness" },
  { id: "3", name: "CRM Pro", viewedAt: "15 Jan 2025", category: "Business" },
];

const MOCK_TRANSACTIONS = [
  { id: "1", type: "credit", amount: 1000, date: "20 Jan", description: "Added via UPI" },
  { id: "2", type: "debit", amount: 500, date: "18 Jan", description: "Restaurant POS purchase" },
  { id: "3", type: "credit", amount: 2000, date: "15 Jan", description: "Referral Bonus" },
  { id: "4", type: "debit", amount: 750, date: "12 Jan", description: "Hotel HMS purchase" },
];

const MOCK_FAQS = [
  { q: "How do I download my purchased product?", a: "Go to My Products and click the Download button." },
  { q: "How can I add money to my wallet?", a: "Go to the Wallet tab and click Add Money. Pay via UPI, Card, or Net Banking." },
  { q: "What is the refund policy?", a: "We offer a 7-day money-back guarantee on all purchases." },
  { q: "How do I contact support?", a: "Go to Support and click Start Chat for 24/7 assistance." },
];

const WALLET_BALANCE = 2500;

// ─── Sub-sections ─────────────────────────────────────────────────
const ProductsTab = () => (
  <div className="space-y-3">
    {MOCK_PRODUCTS.map((product) => (
      <Card key={product.id}>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Package className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold">{product.name}</p>
            <p className="text-xs text-muted-foreground">Purchased: {product.purchaseDate}</p>
            <Badge variant="default" className="text-[10px] h-4 px-1 mt-1">
              <CheckCircle className="w-2.5 h-2.5 mr-0.5" /> {product.status}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1 text-xs">
              <Play className="w-3 h-3" /> Demo
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    ))}
    <Card className="border-dashed">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
          <Plus className="w-6 h-6 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-muted-foreground">Browse More Products</p>
          <p className="text-xs text-muted-foreground">Explore our full software catalog</p>
        </div>
        <Button variant="outline" size="sm" className="text-xs gap-1">
          <ExternalLink className="w-3 h-3" /> Browse
        </Button>
      </CardContent>
    </Card>
  </div>
);

const DemosTab = () => (
  <div className="space-y-3">
    <p className="text-sm text-muted-foreground">Your recently viewed demos</p>
    {MOCK_DEMO_HISTORY.map((demo) => (
      <Card key={demo.id}>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Play className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium">{demo.name}</p>
            <p className="text-xs text-muted-foreground">{demo.category} · {demo.viewedAt}</p>
          </div>
          <Button variant="ghost" size="sm" className="text-xs gap-1">
            <Play className="w-3 h-3" /> Replay
          </Button>
        </CardContent>
      </Card>
    ))}
  </div>
);

const WalletTab = () => (
  <div className="space-y-4">
    {/* Balance Card */}
    <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
      <CardContent className="p-6">
        <p className="text-sm opacity-80">Wallet Balance</p>
        <p className="text-4xl font-bold mt-1">₹{WALLET_BALANCE.toLocaleString()}</p>
        <Button variant="secondary" size="sm" className="mt-4 gap-1">
          <Plus className="w-3 h-3" /> Add Money
        </Button>
      </CardContent>
    </Card>

    {/* Transactions */}
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Transaction History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {MOCK_TRANSACTIONS.map((txn) => (
          <div key={txn.id} className="flex items-center gap-3 py-2 border-b last:border-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              txn.type === "credit" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
            }`}>
              {txn.type === "credit" ? <Plus className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm">{txn.description}</p>
              <p className="text-xs text-muted-foreground">{txn.date}</p>
            </div>
            <p className={`text-sm font-semibold ${
              txn.type === "credit" ? "text-green-500" : "text-red-500"
            }`}>
              {txn.type === "credit" ? "+" : "-"}₹{txn.amount}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
);

const SupportTab = () => (
  <div className="space-y-4">
    <Card>
      <CardContent className="p-6 text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto">
          <MessageCircle className="w-8 h-8 text-blue-500" />
        </div>
        <h3 className="font-semibold">24/7 Support Chat</h3>
        <p className="text-sm text-muted-foreground">Our support team is ready to help you right now</p>
        <Button className="gap-2">
          <MessageCircle className="w-4 h-4" /> Start Chat
        </Button>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <HelpCircle className="w-4 h-4" /> Frequently Asked Questions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {MOCK_FAQS.map((faq, i) => (
          <div key={i} className="border rounded-lg p-3">
            <p className="text-sm font-medium">{faq.q}</p>
            <p className="text-xs text-muted-foreground mt-1">{faq.a}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────
const tabs = [
  { id: "products", label: "My Products", icon: Package },
  { id: "demos", label: "My Demos", icon: Play },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "support", label: "Support", icon: Headphones },
];

const DemoClient = () => {
  const [activeTab, setActiveTab] = useState("products");
  const navigate = useNavigate();

  const renderTab = () => {
    switch (activeTab) {
      case "products": return <ProductsTab />;
      case "demos": return <DemosTab />;
      case "wallet": return <WalletTab />;
      case "support": return <SupportTab />;
      default: return <ProductsTab />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Demo Banner */}
      <div className="bg-green-600 text-white text-center py-1.5 text-xs font-medium flex items-center justify-center gap-2">
        <Eye className="w-3 h-3" />
        DEMO MODE — Client Dashboard · No real data
        <Button
          variant="ghost"
          size="sm"
          className="h-5 px-2 text-xs text-white hover:bg-white/20 ml-4"
          onClick={() => navigate("/demos/public")}
        >
          <ArrowLeft className="w-3 h-3 mr-1" /> Back to Demos
        </Button>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={softwareValaLogo} alt="Logo" className="w-9 h-9 rounded-xl" />
            <div>
              <p className="font-bold text-sm leading-tight">Software Vala</p>
              <p className="text-[10px] text-muted-foreground">Client Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative h-8 w-8">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-destructive rounded-full text-[9px] text-destructive-foreground flex items-center justify-center">
                2
              </span>
            </Button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted cursor-pointer">
              <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold">
                JD
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold leading-tight">John Demo</p>
                <p className="text-[10px] text-muted-foreground">Prime Member</p>
              </div>
              <Crown className="w-3.5 h-3.5 text-yellow-500 hidden sm:block" />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => navigate("/demos/public")}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-green-600/10 to-primary/10 border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-bold">Welcome back, John! 👋</h1>
            <p className="text-xs text-muted-foreground">You have 2 active products and ₹{WALLET_BALANCE.toLocaleString()} in wallet</p>
          </div>
          <div className="flex items-center gap-1">
            <Crown className="w-4 h-4 text-yellow-500" />
            <span className="text-xs font-semibold text-yellow-600">Prime Member</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4 mt-4">
        <div className="flex gap-1 bg-muted rounded-xl p-1 mb-6 w-full sm:w-auto sm:inline-flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-background shadow text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:block">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="pb-8"
          >
            {renderTab()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DemoClient;
