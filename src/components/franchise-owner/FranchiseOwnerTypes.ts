/**
 * FRANCHISE OWNER - TYPE DEFINITIONS
 * All section types and interfaces for FO Dashboard
 */

export type FOSection =
  | 'dashboard'
  | 'marketplace'
  | 'my_orders'
  | 'leads_seo'
  | 'employees'
  | 'invoices'
  | 'wallet'
  | 'support_assist'
  | 'legal'
  | 'settings';

export interface FOHeaderMetric {
  id: string;
  label: string;
  value: string | number;
  icon: React.ElementType;
  onClick?: () => void;
}

export interface FOProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  commission: number;
  logo: string;
  category: string;
}

export interface FOOrder {
  id: string;
  projectId: string;
  productName: string;
  clientName: string;
  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'rejected';
  createdAt: string;
  amount: number;
}

export interface FOInvoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  amount: number;
  gst: number;
  total: number;
  status: 'paid' | 'pending' | 'failed';
  createdAt: string;
}

export interface FOLead {
  id: string;
  name: string;
  email: string;
  mobile: string;
  source: 'seo' | 'google_ads' | 'facebook' | 'instagram' | 'landing_page' | 'manual';
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  assignedTo?: string;
  createdAt: string;
}

export interface FOEmployee {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  leadsAssigned: number;
  performance: number;
  lastLogin?: string;
}

export interface FOPromise {
  id: string;
  promiseId: string;
  linkedOrderId: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'fulfilled' | 'escalated' | 'overdue';
}

export interface FOAssistRequest {
  id: string;
  requestId: string;
  subject: string;
  description: string;
  status: 'open' | 'ai_review' | 'pending_approval' | 'resolved';
  slaStatus: 'on_track' | 'at_risk' | 'breached';
  createdAt: string;
}
