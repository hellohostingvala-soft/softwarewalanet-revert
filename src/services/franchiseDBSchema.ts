// Franchise DB Schema
// 8 franchise tables for complete system

export interface Franchise {
  id: string;
  franchiseId: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'suspended';
  region: {
    country: string;
    state: string;
    city: string;
  };
  taxRate: number;
  bankDetails: {
    accountNumber: string;
    ifsc: string;
    bankName: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface FranchiseRegion {
  id: string;
  franchiseId: string;
  country: string;
  state: string;
  city: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  radius: number; // in km for geo-fencing
  createdAt: Date;
}

export interface FranchiseOrder {
  id: string;
  orderId: string;
  franchiseId: string;
  productId: string;
  productName: string;
  amount: number;
  status: 'init' | 'paid' | 'running' | 'completed' | 'cancelled';
  paymentMethod: 'wallet' | 'razorpay' | 'payu' | 'bank' | 'binance';
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  region: string;
  createdAt: Date;
  paidAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  timeline: OrderTimelineEvent[];
}

export interface OrderTimelineEvent {
  eventId: string;
  event: string;
  timestamp: Date;
  description: string;
  metadata?: any;
}

export interface FranchiseLead {
  id: string;
  leadId: string;
  franchiseId: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  priority: 'low' | 'medium' | 'high' | 'critical';
  region: string;
  assignedTo?: string; // employeeId
  assignedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FranchiseWallet {
  id: string;
  franchiseId: string;
  balance: number;
  currency: string;
  ledger: WalletTransaction[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  orderId?: string;
  invoiceId?: string;
  balanceAfter: number;
  timestamp: Date;
  metadata?: any;
}

export interface FranchiseEmployee {
  id: string;
  employeeId: string;
  franchiseId: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'sales' | 'support';
  status: 'active' | 'inactive' | 'suspended';
  region: string;
  permissions: string[];
  joinedAt: Date;
  lastActive?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FranchiseSEOLocal {
  id: string;
  franchiseId: string;
  keyword: string;
  city: string;
  state: string;
  country: string;
  slug: string; // /city/product
  rank: number;
  volume: number;
  impressions: number;
  clicks: number;
  ctr: number;
  status: 'active' | 'inactive';
  lastUpdated: Date;
  createdAt: Date;
}

export interface FranchiseNotification {
  id: string;
  franchiseId: string;
  type: 'order' | 'payment' | 'lead' | 'seo' | 'system' | 'alert';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  read: boolean;
  actionUrl?: string;
  metadata?: any;
  createdAt: Date;
  readAt?: Date;
}

export interface FranchiseInvoice {
  id: string;
  invoiceNumber: string;
  franchiseId: string;
  orderId: string;
  amount: number;
  gst: number;
  total: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  customerName: string;
  customerEmail: string;
  dueDate: Date;
  paidAt?: Date;
  pdfUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// DB Schema Definition
export const franchiseDBSchema = {
  tables: {
    franchise: `
      CREATE TABLE franchise (
        id VARCHAR(36) PRIMARY KEY,
        franchise_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
        country VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        city VARCHAR(100) NOT NULL,
        tax_rate DECIMAL(5, 2) DEFAULT 0,
        account_number VARCHAR(50),
        ifsc VARCHAR(20),
        bank_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_franchise_id (franchise_id),
        INDEX idx_status (status),
        INDEX idx_region (country, state, city)
      )
    `,

    franchise_region: `
      CREATE TABLE franchise_region (
        id VARCHAR(36) PRIMARY KEY,
        franchise_id VARCHAR(50) NOT NULL,
        country VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        city VARCHAR(100) NOT NULL,
        postal_code VARCHAR(20),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        radius DECIMAL(10, 2) DEFAULT 10,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (franchise_id) REFERENCES franchise(franchise_id) ON DELETE CASCADE,
        INDEX idx_franchise_id (franchise_id),
        INDEX idx_geo (country, state, city),
        INDEX idx_coordinates (latitude, longitude)
      )
    `,

    franchise_orders: `
      CREATE TABLE franchise_orders (
        id VARCHAR(36) PRIMARY KEY,
        order_id VARCHAR(50) UNIQUE NOT NULL,
        franchise_id VARCHAR(50) NOT NULL,
        product_id VARCHAR(50) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        status ENUM('init', 'paid', 'running', 'completed', 'cancelled') DEFAULT 'init',
        payment_method ENUM('wallet', 'razorpay', 'payu', 'bank', 'binance') NOT NULL,
        customer_id VARCHAR(50),
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(20),
        region VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        paid_at TIMESTAMP NULL,
        started_at TIMESTAMP NULL,
        completed_at TIMESTAMP NULL,
        FOREIGN KEY (franchise_id) REFERENCES franchise(franchise_id) ON DELETE CASCADE,
        INDEX idx_franchise_id (franchise_id),
        INDEX idx_order_id (order_id),
        INDEX idx_status (status),
        INDEX idx_region (region),
        INDEX idx_created_at (created_at)
      )
    `,

    franchise_order_timeline: `
      CREATE TABLE franchise_order_timeline (
        id VARCHAR(36) PRIMARY KEY,
        order_id VARCHAR(50) NOT NULL,
        event VARCHAR(100) NOT NULL,
        description TEXT,
        metadata JSON,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES franchise_orders(order_id) ON DELETE CASCADE,
        INDEX idx_order_id (order_id),
        INDEX idx_timestamp (timestamp)
      )
    `,

    franchise_leads: `
      CREATE TABLE franchise_leads (
        id VARCHAR(36) PRIMARY KEY,
        lead_id VARCHAR(50) UNIQUE NOT NULL,
        franchise_id VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        source VARCHAR(100),
        status ENUM('new', 'contacted', 'qualified', 'converted', 'lost') DEFAULT 'new',
        priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        region VARCHAR(100) NOT NULL,
        assigned_to VARCHAR(50),
        assigned_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (franchise_id) REFERENCES franchise(franchise_id) ON DELETE CASCADE,
        INDEX idx_franchise_id (franchise_id),
        INDEX idx_status (status),
        INDEX idx_priority (priority),
        INDEX idx_region (region),
        INDEX idx_assigned_to (assigned_to)
      )
    `,

    franchise_wallet: `
      CREATE TABLE franchise_wallet (
        id VARCHAR(36) PRIMARY KEY,
        franchise_id VARCHAR(50) UNIQUE NOT NULL,
        balance DECIMAL(15, 2) DEFAULT 0,
        currency VARCHAR(3) DEFAULT 'USD',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (franchise_id) REFERENCES franchise(franchise_id) ON DELETE CASCADE,
        INDEX idx_franchise_id (franchise_id)
      )
    `,

    franchise_wallet_transactions: `
      CREATE TABLE franchise_wallet_transactions (
        id VARCHAR(36) PRIMARY KEY,
        franchise_id VARCHAR(50) NOT NULL,
        type ENUM('credit', 'debit') NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        description TEXT,
        order_id VARCHAR(50),
        invoice_id VARCHAR(50),
        balance_after DECIMAL(15, 2) NOT NULL,
        metadata JSON,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (franchise_id) REFERENCES franchise(franchise_id) ON DELETE CASCADE,
        INDEX idx_franchise_id (franchise_id),
        INDEX idx_type (type),
        INDEX idx_timestamp (timestamp),
        INDEX idx_order_id (order_id)
      )
    `,

    franchise_employees: `
      CREATE TABLE franchise_employees (
        id VARCHAR(36) PRIMARY KEY,
        employee_id VARCHAR(50) UNIQUE NOT NULL,
        franchise_id VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role ENUM('admin', 'manager', 'sales', 'support') DEFAULT 'sales',
        status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
        region VARCHAR(100) NOT NULL,
        permissions JSON,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_active TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (franchise_id) REFERENCES franchise(franchise_id) ON DELETE CASCADE,
        INDEX idx_franchise_id (franchise_id),
        INDEX idx_employee_id (employee_id),
        INDEX idx_role (role),
        INDEX idx_status (status),
        INDEX idx_region (region)
      )
    `,

    franchise_seo_local: `
      CREATE TABLE franchise_seo_local (
        id VARCHAR(36) PRIMARY KEY,
        franchise_id VARCHAR(50) NOT NULL,
        keyword VARCHAR(255) NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        country VARCHAR(100) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        rank INT DEFAULT 0,
        volume INT DEFAULT 0,
        impressions INT DEFAULT 0,
        clicks INT DEFAULT 0,
        ctr DECIMAL(5, 2) DEFAULT 0,
        status ENUM('active', 'inactive') DEFAULT 'active',
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (franchise_id) REFERENCES franchise(franchise_id) ON DELETE CASCADE,
        INDEX idx_franchise_id (franchise_id),
        INDEX idx_keyword (keyword),
        INDEX idx_slug (slug),
        INDEX idx_geo (country, state, city),
        INDEX idx_rank (rank)
      )
    `,

    franchise_notifications: `
      CREATE TABLE franchise_notifications (
        id VARCHAR(36) PRIMARY KEY,
        franchise_id VARCHAR(50) NOT NULL,
        type ENUM('order', 'payment', 'lead', 'seo', 'system', 'alert') NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        read BOOLEAN DEFAULT FALSE,
        action_url VARCHAR(500),
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read_at TIMESTAMP NULL,
        FOREIGN KEY (franchise_id) REFERENCES franchise(franchise_id) ON DELETE CASCADE,
        INDEX idx_franchise_id (franchise_id),
        INDEX idx_type (type),
        INDEX idx_priority (priority),
        INDEX idx_read (read),
        INDEX idx_created_at (created_at)
      )
    `,

    franchise_invoices: `
      CREATE TABLE franchise_invoices (
        id VARCHAR(36) PRIMARY KEY,
        invoice_number VARCHAR(50) UNIQUE NOT NULL,
        franchise_id VARCHAR(50) NOT NULL,
        order_id VARCHAR(50) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        gst DECIMAL(10, 2) NOT NULL,
        total DECIMAL(10, 2) NOT NULL,
        status ENUM('pending', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        due_date DATE NOT NULL,
        paid_at TIMESTAMP NULL,
        pdf_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (franchise_id) REFERENCES franchise(franchise_id) ON DELETE CASCADE,
        INDEX idx_franchise_id (franchise_id),
        INDEX idx_invoice_number (invoice_number),
        INDEX idx_order_id (order_id),
        INDEX idx_status (status),
        INDEX idx_due_date (due_date)
      )
    `,
  },
};
