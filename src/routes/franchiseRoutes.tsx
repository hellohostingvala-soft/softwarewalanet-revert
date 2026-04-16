// Franchise Routes
// All franchise routes with proper structure and RBAC

import { Route, Navigate } from 'react-router-dom';
import FranchiseDashboard from '@/pages/franchise/FranchiseDashboard';
import FranchiseMarketplace from '@/pages/franchise/FranchiseMarketplace';
import FranchiseOrders from '@/pages/franchise/FranchiseOrders';
import FranchiseLeadsSEO from '@/pages/franchise/FranchiseLeadsSEO';
import FranchiseEmployees from '@/pages/franchise/FranchiseEmployees';
import FranchiseInvoices from '@/pages/franchise/FranchiseInvoices';
import FranchiseWallet from '@/pages/franchise/FranchiseWallet';
import FranchiseSupport from '@/pages/franchise/FranchiseSupport';
import FranchiseLegal from '@/pages/franchise/FranchiseLegal';
import FranchiseSettings from '@/pages/franchise/FranchiseSettings';
import FranchiseRegionGuard from '@/components/guards/FranchiseRegionGuard';

export function FranchiseRoutes() {
  return (
    <>
      {/* Main Dashboard */}
      <Route path="/franchise/dashboard" element={<FranchiseRegionGuard><FranchiseDashboard /></FranchiseRegionGuard>} />

      {/* Marketplace */}
      <Route path="/franchise/marketplace" element={<FranchiseRegionGuard><FranchiseMarketplace /></FranchiseRegionGuard>} />
      <Route path="/franchise/marketplace/product/:slug" element={<FranchiseRegionGuard><FranchiseMarketplace /></FranchiseRegionGuard>} />

      {/* Orders */}
      <Route path="/franchise/orders" element={<FranchiseRegionGuard><FranchiseOrders /></FranchiseRegionGuard>} />
      <Route path="/franchise/orders/:orderId" element={<FranchiseRegionGuard><FranchiseOrders /></FranchiseRegionGuard>} />

      {/* Leads + SEO */}
      <Route path="/franchise/leads-seo" element={<FranchiseRegionGuard><FranchiseLeadsSEO /></FranchiseRegionGuard>} />
      <Route path="/franchise/leads-seo/:type" element={<FranchiseRegionGuard><FranchiseLeadsSEO /></FranchiseRegionGuard>} />

      {/* Employees */}
      <Route path="/franchise/employees" element={<FranchiseRegionGuard><FranchiseEmployees /></FranchiseRegionGuard>} />
      <Route path="/franchise/employees/:employeeId" element={<FranchiseRegionGuard><FranchiseEmployees /></FranchiseRegionGuard>} />

      {/* Invoices */}
      <Route path="/franchise/invoices" element={<FranchiseRegionGuard><FranchiseInvoices /></FranchiseRegionGuard>} />
      <Route path="/franchise/invoices/:invoiceId" element={<FranchiseRegionGuard><FranchiseInvoices /></FranchiseRegionGuard>} />

      {/* Wallet */}
      <Route path="/franchise/wallet" element={<FranchiseRegionGuard><FranchiseWallet /></FranchiseRegionGuard>} />
      <Route path="/franchise/wallet/transactions" element={<FranchiseRegionGuard><FranchiseWallet /></FranchiseRegionGuard>} />

      {/* Support */}
      <Route path="/franchise/support" element={<FranchiseRegionGuard><FranchiseSupport /></FranchiseRegionGuard>} />
      <Route path="/franchise/support/:ticketId" element={<FranchiseRegionGuard><FranchiseSupport /></FranchiseRegionGuard>} />

      {/* Legal */}
      <Route path="/franchise/legal" element={<FranchiseRegionGuard><FranchiseLegal /></FranchiseRegionGuard>} />

      {/* Settings */}
      <Route path="/franchise/settings" element={<FranchiseRegionGuard><FranchiseSettings /></FranchiseRegionGuard>} />

      {/* Default redirect */}
      <Route path="/franchise" element={<Navigate to="/franchise/dashboard" replace />} />
    </>
  );
}
