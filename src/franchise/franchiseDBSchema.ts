// Franchise DB Schema
// franchise + region + orders + leads + wallet + employees + seo + notifications

const franchiseDBSchema = `
-- Franchise Table
CREATE TABLE franchise (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  region_id VARCHAR(36) NOT NULL,
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  commission_rate DECIMAL(5, 2) DEFAULT 0.00,
  wallet_balance DECIMAL(15, 2) DEFAULT 0.00,
  currency VARCHAR(3) DEFAULT 'INR',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_region_id (region_id),
  INDEX idx_status (status),
  CONSTRAINT fk_franchise_region FOREIGN KEY (region_id) REFERENCES franchise_region(id)
);

-- Franchise Region Table
CREATE TABLE franchise_region (
  id VARCHAR(36) PRIMARY KEY,
  city VARCHAR(100),
  state VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL DEFAULT 'India',
  postal_code VARCHAR(20),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_state (state),
  INDEX idx_country (country),
  INDEX idx_active (active)
);

-- Franchise Orders Table
CREATE TABLE franchise_orders (
  id VARCHAR(36) PRIMARY KEY,
  franchise_id VARCHAR(36) NOT NULL,
  order_no VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20),
  total_amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  status ENUM('init', 'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') DEFAULT 'init',
  payment_method ENUM('wallet', 'razorpay', 'payu', 'bank', 'binance'),
  payment_status ENUM('pending', 'success', 'failed', 'refunded') DEFAULT 'pending',
  items JSON,
  shipping_address JSON,
  billing_address JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_franchise_id (franchise_id),
  INDEX idx_order_no (order_no),
  INDEX idx_status (status),
  INDEX idx_payment_status (payment_status),
  INDEX idx_created_at (created_at),
  CONSTRAINT fk_orders_franchise FOREIGN KEY (franchise_id) REFERENCES franchise(id) ON DELETE CASCADE
);

-- Franchise Leads Table
CREATE TABLE franchise_leads (
  id VARCHAR(36) PRIMARY KEY,
  franchise_id VARCHAR(36) NOT NULL,
  lead_no VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20) NOT NULL,
  source VARCHAR(100),
  status ENUM('new', 'contacted', 'qualified', 'converted', 'lost') DEFAULT 'new',
  assigned_to VARCHAR(36),
  notes TEXT,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_franchise_id (franchise_id),
  INDEX idx_lead_no (lead_no),
  INDEX idx_status (status),
  INDEX idx_assigned_to (assigned_to),
  INDEX idx_created_at (created_at),
  CONSTRAINT fk_leads_franchise FOREIGN KEY (franchise_id) REFERENCES franchise(id) ON DELETE CASCADE
);

-- Franchise Wallet Table
CREATE TABLE franchise_wallet (
  id VARCHAR(36) PRIMARY KEY,
  franchise_id VARCHAR(36) NOT NULL UNIQUE,
  balance DECIMAL(15, 2) DEFAULT 0.00,
  currency VARCHAR(3) DEFAULT 'INR',
  credit_limit DECIMAL(15, 2) DEFAULT 0.00,
  status ENUM('active', 'frozen', 'closed') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_wallet_franchise FOREIGN KEY (franchise_id) REFERENCES franchise(id) ON DELETE CASCADE
);

-- Franchise Wallet Ledger Table
CREATE TABLE franchise_wallet_ledger (
  id VARCHAR(36) PRIMARY KEY,
  franchise_id VARCHAR(36) NOT NULL,
  transaction_type ENUM('credit', 'debit') NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  balance_after DECIMAL(15, 2) NOT NULL,
  reference_id VARCHAR(36),
  reference_type VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_franchise_id (franchise_id),
  INDEX idx_transaction_type (transaction_type),
  INDEX idx_reference_id (reference_id),
  INDEX idx_created_at (created_at),
  CONSTRAINT fk_ledger_franchise FOREIGN KEY (franchise_id) REFERENCES franchise(id) ON DELETE CASCADE
);

-- Franchise Employees Table
CREATE TABLE franchise_employees (
  id VARCHAR(36) PRIMARY KEY,
  franchise_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('manager', 'sales', 'support') NOT NULL,
  status ENUM('active', 'inactive', 'terminated') DEFAULT 'active',
  permissions JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_franchise_id (franchise_id),
  INDEX idx_user_id (user_id),
  INDEX idx_role (role),
  INDEX idx_status (status),
  UNIQUE KEY unique_franchise_user (franchise_id, user_id),
  CONSTRAINT fk_employees_franchise FOREIGN KEY (franchise_id) REFERENCES franchise(id) ON DELETE CASCADE
);

-- Franchise SEO Local Table
CREATE TABLE franchise_seo_local (
  id VARCHAR(36) PRIMARY KEY,
  franchise_id VARCHAR(36) NOT NULL,
  page_url VARCHAR(500) NOT NULL,
  geo_slug VARCHAR(500),
  keywords JSON,
  meta_title VARCHAR(255),
  meta_description TEXT,
  heading_h1 VARCHAR(255),
  ranking_position INT DEFAULT 0,
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_franchise_id (franchise_id),
  INDEX idx_page_url (page_url),
  INDEX idx_geo_slug (geo_slug),
  INDEX idx_ranking (ranking_position),
  CONSTRAINT fk_seo_franchise FOREIGN KEY (franchise_id) REFERENCES franchise(id) ON DELETE CASCADE
);

-- Franchise Notifications Table
CREATE TABLE franchise_notifications (
  id VARCHAR(36) PRIMARY KEY,
  franchise_id VARCHAR(36) NOT NULL,
  type ENUM('order', 'payment', 'lead', 'support', 'system', 'alert') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSON,
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_franchise_id (franchise_id),
  INDEX idx_type (type),
  INDEX idx_read (read),
  INDEX idx_created_at (created_at),
  CONSTRAINT fk_notifications_franchise FOREIGN KEY (franchise_id) REFERENCES franchise(id) ON DELETE CASCADE
);

-- Views for common queries
CREATE VIEW v_franchise_summary AS
SELECT 
  f.id,
  f.name,
  f.status,
  r.city,
  r.state,
  r.country,
  f.wallet_balance,
  COUNT(DISTINCT fo.id) as total_orders,
  COUNT(DISTINCT fl.id) as total_leads,
  COUNT(DISTINCT fe.id) as total_employees
FROM franchise f
LEFT JOIN franchise_region r ON f.region_id = r.id
LEFT JOIN franchise_orders fo ON f.id = fo.franchise_id
LEFT JOIN franchise_leads fl ON f.id = fl.franchise_id
LEFT JOIN franchise_employees fe ON f.id = fe.franchise_id AND fe.status = 'active'
GROUP BY f.id, f.name, f.status, r.city, r.state, r.country, f.wallet_balance;

CREATE VIEW v_franchise_pending_orders AS
SELECT 
  fo.*,
  f.name as franchise_name
FROM franchise_orders fo
JOIN franchise f ON fo.franchise_id = f.id
WHERE fo.status IN ('init', 'pending', 'processing');

CREATE VIEW v_franchise_leads_summary AS
SELECT 
  franchise_id,
  COUNT(*) as total_leads,
  SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_leads,
  SUM(CASE WHEN status = 'contacted' THEN 1 ELSE 0 END) as contacted_leads,
  SUM(CASE WHEN status = 'qualified' THEN 1 ELSE 0 END) as qualified_leads,
  SUM(CASE WHEN status = 'converted' THEN 1 ELSE 0 END) as converted_leads,
  SUM(CASE WHEN status = 'lost' THEN 1 ELSE 0 END) as lost_leads
FROM franchise_leads
GROUP BY franchise_id;

-- Triggers for audit logging
DELIMITER //
CREATE TRIGGER trg_franchise_orders_audit
AFTER INSERT ON franchise_orders
FOR EACH ROW
BEGIN
  INSERT INTO franchise_audit_log (table_name, record_id, action, old_data, new_data, created_at)
  VALUES ('franchise_orders', NEW.id, 'INSERT', NULL, JSON_OBJECT(
    'id', NEW.id,
    'franchise_id', NEW.franchise_id,
    'order_no', NEW.order_no,
    'status', NEW.status,
    'total_amount', NEW.total_amount
  ), NOW());
END//
DELIMITER ;

DELIMITER //
CREATE TRIGGER trg_franchise_wallet_ledger_audit
AFTER INSERT ON franchise_wallet_ledger
FOR EACH ROW
BEGIN
  INSERT INTO franchise_audit_log (table_name, record_id, action, old_data, new_data, created_at)
  VALUES ('franchise_wallet_ledger', NEW.id, 'INSERT', NULL, JSON_OBJECT(
    'id', NEW.id,
    'franchise_id', NEW.franchise_id,
    'transaction_type', NEW.transaction_type,
    'amount', NEW.amount,
    'balance_after', NEW.balance_after
  ), NOW());
END//
DELIMITER ;

-- Audit Log Table
CREATE TABLE franchise_audit_log (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  table_name VARCHAR(100) NOT NULL,
  record_id VARCHAR(36) NOT NULL,
  action ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
  old_data JSON,
  new_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_table_name (table_name),
  INDEX idx_record_id (record_id),
  INDEX idx_created_at (created_at)
);
`;

export default franchiseDBSchema;
