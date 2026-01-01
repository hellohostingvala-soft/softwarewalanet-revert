import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Box, Package, Play, Eye, Plus, Edit2, Trash2, Search, Filter,
  BarChart3, TrendingUp, ShoppingCart, Layers, CreditCard, Tag,
  CheckCircle2, XCircle, Clock, AlertCircle, Activity, Settings,
  Image, FileText, Star, Users, Globe2, Download
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

// Mock products data
const mockProducts = [
  { 
    id: "PRD-001", 
    name: "Enterprise ERP Suite", 
    category: "Software",
    status: "active",
    demos: 45,
    views: 12500,
    price: "₹2,50,000",
    rating: 4.8,
    image: "/placeholder.svg"
  },
  { 
    id: "PRD-002", 
    name: "CRM Professional", 
    category: "Software",
    status: "active",
    demos: 32,
    views: 8900,
    price: "₹1,50,000",
    rating: 4.6,
    image: "/placeholder.svg"
  },
  { 
    id: "PRD-003", 
    name: "Inventory Manager", 
    category: "Software",
    status: "draft",
    demos: 0,
    views: 2100,
    price: "₹75,000",
    rating: 0,
    image: "/placeholder.svg"
  },
  { 
    id: "PRD-004", 
    name: "HR Management System", 
    category: "Software",
    status: "active",
    demos: 28,
    views: 6700,
    price: "₹1,25,000",
    rating: 4.5,
    image: "/placeholder.svg"
  },
  { 
    id: "PRD-005", 
    name: "E-Commerce Platform", 
    category: "Platform",
    status: "active",
    demos: 56,
    views: 15200,
    price: "₹3,00,000",
    rating: 4.9,
    image: "/placeholder.svg"
  },
];

// Mock demos data
const mockDemos = [
  { id: "DEM-001", product: "Enterprise ERP Suite", client: "ABC Corp", status: "scheduled", date: "2024-01-20", time: "10:00 AM" },
  { id: "DEM-002", product: "CRM Professional", client: "XYZ Ltd", status: "completed", date: "2024-01-18", time: "02:00 PM" },
  { id: "DEM-003", product: "E-Commerce Platform", client: "Tech Solutions", status: "pending", date: "2024-01-22", time: "11:00 AM" },
  { id: "DEM-004", product: "HR Management System", client: "Global Inc", status: "scheduled", date: "2024-01-21", time: "03:00 PM" },
  { id: "DEM-005", product: "Enterprise ERP Suite", client: "Prime Industries", status: "cancelled", date: "2024-01-15", time: "10:00 AM" },
];

// Mock activity log
const activityLog = [
  { action: "Product updated", target: "Enterprise ERP Suite", time: "5 min ago" },
  { action: "Demo scheduled", target: "CRM Professional", time: "15 min ago" },
  { action: "New product added", target: "Inventory Manager", time: "1 hour ago" },
  { action: "Pricing updated", target: "E-Commerce Platform", time: "2 hours ago" },
  { action: "Demo completed", target: "HR Management System", time: "3 hours ago" },
];

const ProductManagerDashboard = () => {
  const [selectedProduct, setSelectedProduct] = useState<typeof mockProducts[0] | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddProduct, setShowAddProduct] = useState(false);

  const handleAddProduct = () => {
    toast.success("Product creation initiated");
    setShowAddProduct(false);
  };

  const handleScheduleDemo = () => {
    toast.success("Demo scheduled successfully");
  };

  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-emerald-500/20 text-emerald-400";
      case "draft": return "bg-amber-500/20 text-amber-400";
      case "scheduled": return "bg-blue-500/20 text-blue-400";
      case "completed": return "bg-emerald-500/20 text-emerald-400";
      case "pending": return "bg-amber-500/20 text-amber-400";
      case "cancelled": return "bg-red-500/20 text-red-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950/20 via-background to-violet-950/20 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/20">
              <Box className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Product Manager Dashboard</h1>
              <p className="text-indigo-400/80">Product Catalog • Demo Management • Listings</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/50 px-4 py-2">
              <Package className="w-4 h-4 mr-2" />
              PRODUCT MANAGEMENT
            </Badge>
            <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-500 hover:bg-indigo-600 gap-2">
                  <Plus className="w-4 h-4" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-indigo-500/20">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Input placeholder="Product Name" className="bg-muted border-indigo-500/30" />
                  <Input placeholder="Category" className="bg-muted border-indigo-500/30" />
                  <Input placeholder="Price" className="bg-muted border-indigo-500/30" />
                  <Button onClick={handleAddProduct} className="w-full bg-indigo-500 hover:bg-indigo-600">
                    Create Product
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card className="bg-card/50 border-indigo-500/20 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Products</p>
                <p className="text-2xl font-bold text-foreground mt-1">156</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <Box className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-indigo-500/20 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Active Demos</p>
                <p className="text-2xl font-bold text-foreground mt-1">24</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Play className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-indigo-500/20 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Views</p>
                <p className="text-2xl font-bold text-foreground mt-1">45.2K</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-indigo-500/20 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Conversions</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">12.5%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-indigo-500/20 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Revenue</p>
                <p className="text-2xl font-bold text-foreground mt-1">₹2.8Cr</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 border border-indigo-500/20 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">
            Overview
          </TabsTrigger>
          <TabsTrigger value="products" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">
            All Products
          </TabsTrigger>
          <TabsTrigger value="demos" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">
            Demo Management
          </TabsTrigger>
          <TabsTrigger value="catalog" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">
            Product Catalog
          </TabsTrigger>
          <TabsTrigger value="pricing" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">
            Pricing & Plans
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <Card className="bg-card/50 border-indigo-500/20 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Star className="w-5 h-5 text-indigo-400" />
                  Top Performing Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {mockProducts.filter(p => p.status === "active").slice(0, 5).map((product, i) => (
                      <div key={product.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-indigo-500/10">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.views.toLocaleString()} views • {product.demos} demos</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="text-sm text-foreground">{product.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-card/50 border-indigo-500/20 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-400" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {activityLog.map((log, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-indigo-500/10">
                        <Clock className="w-4 h-4 text-indigo-400" />
                        <div className="flex-1">
                          <p className="text-sm text-foreground">{log.action}</p>
                          <p className="text-xs text-muted-foreground">{log.target}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{log.time}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Powers Section */}
          <Card className="bg-card/50 border-indigo-500/20 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-400" />
                Product Manager Powers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Box, label: "Manage All Products", desc: "CRUD operations" },
                  { icon: Play, label: "Demo Management", desc: "Schedule & track demos" },
                  { icon: Layers, label: "Product Catalog", desc: "Categories & listings" },
                  { icon: CreditCard, label: "Pricing Control", desc: "Plans & pricing" },
                  { icon: Tag, label: "Tags & Metadata", desc: "SEO & visibility" },
                  { icon: Image, label: "Media Library", desc: "Product assets" },
                  { icon: BarChart3, label: "Product Analytics", desc: "Performance metrics" },
                  { icon: Globe2, label: "Regional Availability", desc: "Market control" },
                ].map((power, i) => (
                  <div key={i} className="p-4 rounded-lg bg-muted/50 border border-indigo-500/20">
                    <power.icon className="w-6 h-6 text-indigo-400 mb-2" />
                    <p className="text-sm font-medium text-foreground">{power.label}</p>
                    <p className="text-xs text-muted-foreground">{power.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search products..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-muted border-indigo-500/30"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-muted border-indigo-500/30">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="bg-indigo-500 hover:bg-indigo-600 gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Product List */}
            <div className="lg:col-span-2">
              <Card className="bg-card/50 border-indigo-500/20">
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px]">
                    <div className="divide-y divide-indigo-500/10">
                      {filteredProducts.map((product) => (
                        <div 
                          key={product.id}
                          onClick={() => setSelectedProduct(product)}
                          className={`p-4 cursor-pointer transition-colors ${
                            selectedProduct?.id === product.id 
                              ? "bg-indigo-500/10 border-l-2 border-indigo-500" 
                              : "hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center">
                              <Box className="w-8 h-8 text-indigo-400" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium text-foreground">{product.name}</h3>
                                <Badge className={getStatusColor(product.status)}>
                                  {product.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{product.category} • {product.price}</p>
                              <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" /> {product.views.toLocaleString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Play className="w-3 h-3" /> {product.demos} demos
                                </span>
                                {product.rating > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {product.rating}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Product Detail */}
            <Card className="bg-card/50 border-indigo-500/20">
              <CardHeader>
                <CardTitle className="text-foreground text-lg">Product Details</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedProduct ? (
                  <div className="space-y-4">
                    <div className="text-center pb-4 border-b border-indigo-500/20">
                      <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center mx-auto mb-3">
                        <Box className="w-12 h-12 text-indigo-400" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground">{selectedProduct.name}</h3>
                      <Badge className={getStatusColor(selectedProduct.status)}>
                        {selectedProduct.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">ID</span>
                        <span className="text-sm font-mono text-foreground">{selectedProduct.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Category</span>
                        <span className="text-sm text-foreground">{selectedProduct.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Price</span>
                        <span className="text-sm font-bold text-foreground">{selectedProduct.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Views</span>
                        <span className="text-sm text-foreground">{selectedProduct.views.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Demos</span>
                        <span className="text-sm text-foreground">{selectedProduct.demos}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-4">
                      <Button size="sm" variant="outline" className="border-indigo-500/50 text-indigo-400">
                        <Eye className="w-3 h-3 mr-1" /> View
                      </Button>
                      <Button size="sm" variant="outline" className="border-indigo-500/50 text-indigo-400">
                        <Edit2 className="w-3 h-3 mr-1" /> Edit
                      </Button>
                      <Button size="sm" variant="outline" className="border-emerald-500/50 text-emerald-400">
                        <Play className="w-3 h-3 mr-1" /> Demo
                      </Button>
                      <Button size="sm" variant="outline" className="border-red-500/50 text-red-400">
                        <Trash2 className="w-3 h-3 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Box className="w-12 h-12 text-indigo-400/50 mx-auto mb-3" />
                    <p className="text-muted-foreground">Select a product to view details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Demo Management Tab */}
        <TabsContent value="demos" className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <Input 
              placeholder="Search demos..." 
              className="max-w-sm bg-muted border-indigo-500/30"
            />
            <Button className="bg-emerald-500 hover:bg-emerald-600 gap-2" onClick={handleScheduleDemo}>
              <Plus className="w-4 h-4" />
              Schedule Demo
            </Button>
          </div>

          <Card className="bg-card/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Play className="w-5 h-5 text-emerald-400" />
                Demo Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {mockDemos.map((demo) => (
                    <div key={demo.id} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border border-indigo-500/10">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                        <Play className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-foreground">{demo.product}</h3>
                          <Badge className={getStatusColor(demo.status)}>
                            {demo.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Client: {demo.client}</p>
                        <p className="text-xs text-muted-foreground">{demo.date} at {demo.time}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="border-indigo-500/50 text-indigo-400">
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="border-amber-500/50 text-amber-400">
                          <Edit2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Product Catalog Tab */}
        <TabsContent value="catalog" className="space-y-6">
          <Card className="bg-card/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                Product Catalog Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["Software", "Platform", "Services", "Hardware", "Bundles", "Add-ons"].map((category) => (
                  <div key={category} className="p-4 rounded-lg bg-muted/50 border border-indigo-500/20">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-foreground">{category}</span>
                      <Badge variant="outline" className="border-indigo-500/50 text-indigo-400">
                        {Math.floor(Math.random() * 30 + 5)} items
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 border-muted-foreground text-muted-foreground">
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="border-indigo-500/50 text-indigo-400">
                        <Settings className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-6">
          <Card className="bg-card/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-400" />
                Pricing & Plans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: "Starter", price: "₹25,000/mo", features: 5, users: 125 },
                  { name: "Professional", price: "₹75,000/mo", features: 12, users: 340 },
                  { name: "Enterprise", price: "₹2,00,000/mo", features: 25, users: 85 },
                ].map((plan) => (
                  <div key={plan.name} className="p-6 rounded-xl bg-muted/50 border border-indigo-500/20 text-center">
                    <h3 className="text-lg font-bold text-foreground mb-2">{plan.name}</h3>
                    <p className="text-2xl font-bold text-indigo-400 mb-4">{plan.price}</p>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>{plan.features} features</p>
                      <p>{plan.users} active users</p>
                    </div>
                    <Button className="w-full mt-4 bg-indigo-500 hover:bg-indigo-600">
                      Edit Plan
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card/50 border-indigo-500/20">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-400" />
                  Product Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center rounded-lg bg-muted/50 border border-indigo-500/20">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-indigo-400/50 mx-auto mb-2" />
                    <p className="text-muted-foreground">Performance Chart</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-indigo-500/20">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  Conversion Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center rounded-lg bg-muted/50 border border-indigo-500/20">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 text-emerald-400/50 mx-auto mb-2" />
                    <p className="text-muted-foreground">Conversion Chart</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductManagerDashboard;
