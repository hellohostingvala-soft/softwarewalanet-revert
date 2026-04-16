// Franchise Routes
// SINGLE ENTRY POINT: /franchise-dashboard
// All legacy routes redirect to unified dashboard

import { RouteObject } from 'react-router-dom';
import type { FranchiseUser } from './franchiseRBACService';

// Route guards
const requireFranchiseOwner = (user: FranchiseUser | null) => {
  if (!user || user.role !== 'franchise_owner') {
    return false;
  }
  return true;
};

const requireFranchiseAccess = (user: FranchiseUser | null) => {
  if (!user) return false;
  return ['franchise_owner', 'franchise_manager', 'franchise_staff'].includes(user.role);
};

// Franchise routes configuration - SINGLE ENTRY POINT
export const franchiseRoutes: RouteObject[] = [
  {
    path: '/franchise-dashboard',
    lazy: () => import('../pages/franchise/FranchiseUnifiedDashboard'),
  },
  // Legacy routes - redirect to unified dashboard with appropriate section
  {
    path: '/franchise',
    lazy: () => import('../pages/franchise/FranchiseRedirect').then(m => ({ default: () => m.default() })),
  },
  {
    path: '/franchise/dashboard',
    lazy: () => import('../pages/franchise/FranchiseRedirect').then(m => ({ default: () => m.default({ section: 'overview' }) })),
  },
  {
    path: '/franchise/marketplace',
    lazy: () => import('../pages/franchise/FranchiseRedirect').then(m => ({ default: () => m.default({ section: 'marketplace' }) })),
  },
  {
    path: '/franchise/marketplace/product/:slug',
    lazy: () => import('../pages/franchise/FranchiseRedirect').then(m => ({ default: () => m.default({ section: 'marketplace' }) })),
  },
  {
    path: '/franchise/orders',
    lazy: () => import('../pages/franchise/FranchiseRedirect').then(m => ({ default: () => m.default({ section: 'orders' }) })),
  },
  {
    path: '/franchise/orders/:orderId',
    lazy: () => import('../pages/franchise/FranchiseRedirect').then(m => ({ default: () => m.default({ section: 'orders' }) })),
  },
  {
    path: '/franchise/leads-seo',
    lazy: () => import('../pages/franchise/FranchiseRedirect').then(m => ({ default: () => m.default({ section: 'leads-seo' }) })),
  },
  {
    path: '/franchise/leads-seo/:type',
    lazy: () => import('../pages/franchise/FranchiseRedirect').then(m => ({ default: () => m.default({ section: 'leads-seo' }) })),
  },
  {
    path: '/franchise/employees',
    lazy: () => import('../pages/franchise/FranchiseRedirect').then(m => ({ default: () => m.default({ section: 'team' }) })),
  },
  {
    path: '/franchise/employees/:employeeId',
    lazy: () => import('../pages/franchise/FranchiseRedirect').then(m => ({ default: () => m.default({ section: 'team' }) })),
  },
  {
    path: '/franchise/invoices',
    lazy: () => import('../pages/franchise/FranchiseRedirect').then(m => ({ default: () => m.default({ section: 'wallet-billing' }) })),
  },
  {
    path: '/franchise/invoices/:invoiceId',
    lazy: () => import('../pages/franchise/FranchiseRedirect').then(m => ({ default: () => m.default({ section: 'wallet-billing' }) })),
  },
  {
    path: '/franchise/wallet',
    lazy: () => import('../pages/franchise/FranchiseRedirect').then(m => ({ default: () => m.default({ section: 'wallet-billing' }) })),
  },
  {
    path: '/franchise/wallet/transactions',
    lazy: () => import('../pages/franchise/FranchiseRedirect').then(m => ({ default: () => m.default({ section: 'wallet-billing' }) })),
  },
  {
    path: '/franchise/support',
    lazy: () => import('../pages/franchise/FranchiseRedirect').then(m => ({ default: () => m.default({ section: 'support' }) })),
  },
  {
    path: '/franchise/support/:ticketId',
    lazy: () => import('../pages/franchise/FranchiseRedirect').then(m => ({ default: () => m.default({ section: 'support' }) })),
  },
  {
    path: '/franchise/legal',
    lazy: () => import('../pages/franchise/FranchiseRedirect').then(m => ({ default: () => m.default({ section: 'settings' }) })),
  },
  {
    path: '/franchise/settings',
    lazy: () => import('../pages/franchise/FranchiseRedirect').then(m => ({ default: () => m.default({ section: 'settings' }) })),
  },
  {
    path: '/franchise/promises',
    lazy: () => import('../pages/franchise/FranchiseRedirect').then(m => ({ default: () => m.default({ section: 'overview' }) })),
  },
];

// Route navigation helpers - updated to use new unified dashboard
export const franchiseNavigate = {
  dashboard: () => '/franchise-dashboard#overview',
  marketplace: (filter?: string) => filter ? `/franchise-dashboard#marketplace?filter=${filter}` : '/franchise-dashboard#marketplace',
  product: (slug: string) => `/franchise-dashboard#marketplace`,
  orders: (status?: string) => status ? `/franchise-dashboard#orders?status=${status}` : '/franchise-dashboard#orders',
  orderDetail: (orderId: string) => `/franchise-dashboard#orders`,
  leadsSEO: (type?: string) => type ? `/franchise-dashboard#leads-seo?type=${type}` : '/franchise-dashboard#leads-seo',
  employees: () => '/franchise-dashboard#team',
  employeeDetail: (employeeId: string) => `/franchise-dashboard#team`,
  invoices: (status?: string) => status ? `/franchise-dashboard#wallet-billing?status=${status}` : '/franchise-dashboard#wallet-billing',
  invoiceDetail: (invoiceId: string) => `/franchise-dashboard#wallet-billing`,
  wallet: () => '/franchise-dashboard#wallet-billing',
  walletTransactions: () => '/franchise-dashboard#wallet-billing',
  support: () => '/franchise-dashboard#support',
  supportDetail: (ticketId: string) => `/franchise-dashboard#support`,
  legal: () => '/franchise-dashboard#settings',
  settings: () => '/franchise-dashboard#settings',
  promises: () => '/franchise-dashboard#overview',
};

// Permission checks for routes
export const routePermissions = {
  dashboard: ['dashboard.view'],
  marketplace: ['marketplace.view', 'marketplace.buy'],
  orders: ['orders.view', 'orders.create', 'orders.manage'],
  leadsSEO: ['leads.view', 'leads.assign', 'leads.manage', 'seo.view', 'seo.manage'],
  employees: ['employees.view', 'employees.create', 'employees.manage'],
  invoices: ['invoices.view', 'invoices.create'],
  wallet: ['wallet.view', 'wallet.manage'],
  support: ['support.view', 'support.manage'],
  legal: ['legal.view', 'legal.manage'],
  settings: ['settings.view', 'settings.manage'],
  promises: ['promises.view'],
};

// Check if user has permission for route
export const hasRoutePermission = (user: FranchiseUser | null, route: keyof typeof routePermissions): boolean => {
  if (!user) return false;
  const requiredPermissions = routePermissions[route];
  return requiredPermissions.some(perm => user.permissions.includes(perm));
};

export default franchiseRoutes;
