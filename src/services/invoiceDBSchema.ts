// Invoice Database Schema
// Tables: invoices, invoice_items, credit_notes, invoice_audit_log

export const invoiceTables = {
  invoices: `
    CREATE TABLE IF NOT EXISTS invoices (
      id VARCHAR(36) PRIMARY KEY,
      invoice_no VARCHAR(50) UNIQUE NOT NULL,
      order_id VARCHAR(36) UNIQUE NOT NULL,
      user_id VARCHAR(36) NOT NULL,
      role ENUM('user', 'reseller', 'franchise') NOT NULL,
      currency VARCHAR(3) DEFAULT 'INR',
      precision INT DEFAULT 2,
      subtotal DECIMAL(19, 4) NOT NULL,
      discount DECIMAL(19, 4) DEFAULT 0,
      tax_total DECIMAL(19, 4) NOT NULL,
      grand_total DECIMAL(19, 4) NOT NULL,
      status ENUM('draft', 'pending', 'paid', 'refunded', 'cancelled') DEFAULT 'draft',
      issued_at BIGINT NOT NULL,
      due_at BIGINT NOT NULL,
      paid_at BIGINT,
      checksum VARCHAR(10) NOT NULL,
      buyer_gst VARCHAR(15),
      seller_gst VARCHAR(15),
      terms TEXT,
      signature_data TEXT,
      created_at BIGINT DEFAULT (UNIX_TIMESTAMP() * 1000),
      updated_at BIGINT DEFAULT (UNIX_TIMESTAMP() * 1000),
      INDEX idx_invoice_no (invoice_no),
      INDEX idx_order_id (order_id),
      INDEX idx_user_id (user_id),
      INDEX idx_status (status),
      INDEX idx_issued_at (issued_at),
      CONSTRAINT fk_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `,

  invoice_items: `
    CREATE TABLE IF NOT EXISTS invoice_items (
      id VARCHAR(36) PRIMARY KEY,
      invoice_id VARCHAR(36) NOT NULL,
      product_id VARCHAR(36) NOT NULL,
      name_snapshot VARCHAR(255) NOT NULL,
      description TEXT,
      quantity DECIMAL(10, 2) NOT NULL,
      unit_price DECIMAL(19, 4) NOT NULL,
      tax_rate DECIMAL(5, 2) NOT NULL,
      tax_amount DECIMAL(19, 4) NOT NULL,
      line_total DECIMAL(19, 4) NOT NULL,
      hsn_sac VARCHAR(8),
      cgst_amount DECIMAL(19, 4) DEFAULT 0,
      sgst_amount DECIMAL(19, 4) DEFAULT 0,
      igst_amount DECIMAL(19, 4) DEFAULT 0,
      created_at BIGINT DEFAULT (UNIX_TIMESTAMP() * 1000),
      INDEX idx_invoice_id (invoice_id),
      INDEX idx_product_id (product_id),
      CONSTRAINT fk_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `,

  credit_notes: `
    CREATE TABLE IF NOT EXISTS credit_notes (
      id VARCHAR(36) PRIMARY KEY,
      credit_note_no VARCHAR(50) UNIQUE NOT NULL,
      invoice_id VARCHAR(36) NOT NULL,
      user_id VARCHAR(36) NOT NULL,
      role ENUM('user', 'reseller', 'franchise') NOT NULL,
      reason VARCHAR(255) NOT NULL,
      amount DECIMAL(19, 4) NOT NULL,
      tax_amount DECIMAL(19, 4) NOT NULL,
      total_amount DECIMAL(19, 4) NOT NULL,
      status ENUM('draft', 'issued', 'applied', 'cancelled') DEFAULT 'draft',
      issued_at BIGINT,
      created_at BIGINT DEFAULT (UNIX_TIMESTAMP() * 1000),
      updated_at BIGINT DEFAULT (UNIX_TIMESTAMP() * 1000),
      INDEX idx_credit_note_no (credit_note_no),
      INDEX idx_invoice_id (invoice_id),
      INDEX idx_user_id (user_id),
      INDEX idx_status (status),
      CONSTRAINT fk_credit_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `,

  invoice_audit_log: `
    CREATE TABLE IF NOT EXISTS invoice_audit_log (
      id VARCHAR(36) PRIMARY KEY,
      invoice_id VARCHAR(36) NOT NULL,
      action VARCHAR(50) NOT NULL,
      old_status VARCHAR(20),
      new_status VARCHAR(20),
      changes JSON,
      performed_by VARCHAR(36),
      performed_at BIGINT NOT NULL,
      immutable TINYINT(1) DEFAULT 1,
      INDEX idx_invoice_id (invoice_id),
      INDEX idx_action (action),
      INDEX idx_performed_at (performed_at),
      CONSTRAINT fk_audit_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `,

  invoice_payments: `
    CREATE TABLE IF NOT EXISTS invoice_payments (
      id VARCHAR(36) PRIMARY KEY,
      invoice_id VARCHAR(36) NOT NULL,
      payment_id VARCHAR(36) NOT NULL,
      amount DECIMAL(19, 4) NOT NULL,
      payment_method VARCHAR(50),
      status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
      transaction_id VARCHAR(100),
      paid_at BIGINT,
      created_at BIGINT DEFAULT (UNIX_TIMESTAMP() * 1000),
      updated_at BIGINT DEFAULT (UNIX_TIMESTAMP() * 1000),
      INDEX idx_invoice_id (invoice_id),
      INDEX idx_payment_id (payment_id),
      INDEX idx_status (status),
      CONSTRAINT fk_payment_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `,

  tax_regions: `
    CREATE TABLE IF NOT EXISTS tax_regions (
      id VARCHAR(36) PRIMARY KEY,
      country_code VARCHAR(2) NOT NULL,
      state_code VARCHAR(3) NOT NULL,
      region_name VARCHAR(100) NOT NULL,
      tax_type ENUM('CGST_SGST', 'IGST') NOT NULL,
      cgst_rate DECIMAL(5, 2) DEFAULT 0,
      sgst_rate DECIMAL(5, 2) DEFAULT 0,
      igst_rate DECIMAL(5, 2) DEFAULT 0,
      effective_from BIGINT NOT NULL,
      effective_to BIGINT,
      created_at BIGINT DEFAULT (UNIX_TIMESTAMP() * 1000),
      UNIQUE KEY uk_country_state (country_code, state_code, effective_from),
      INDEX idx_tax_type (tax_type),
      INDEX idx_effective (effective_from, effective_to)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `,
};

export const invoiceIndexes = {
  // Partial index for paid invoices
  paid_invoices: `
    CREATE INDEX idx_paid_invoices ON invoices(status, issued_at) 
    WHERE status = 'paid';
  `,

  // Partial index for pending invoices
  pending_invoices: `
    CREATE INDEX idx_pending_invoices ON invoices(user_id, due_at) 
    WHERE status = 'pending';
  `,

  // Partial index for overdue invoices
  overdue_invoices: `
    CREATE INDEX idx_overdue_invoices ON invoices(user_id, due_at) 
    WHERE status = 'pending' AND due_at < UNIX_TIMESTAMP() * 1000;
  `,
};

export const invoiceViews = {
  invoice_summary: `
    CREATE VIEW v_invoice_summary AS
    SELECT 
      i.id,
      i.invoice_no,
      i.order_id,
      i.user_id,
      i.role,
      i.currency,
      i.grand_total,
      i.status,
      i.issued_at,
      i.due_at,
      i.paid_at,
      COUNT(ii.id) as item_count,
      SUM(ii.quantity) as total_quantity
    FROM invoices i
    LEFT JOIN invoice_items ii ON i.id = ii.invoice_id
    GROUP BY i.id;
  `,

  pending_payment_invoices: `
    CREATE VIEW v_pending_payment_invoices AS
    SELECT 
      i.id,
      i.invoice_no,
      i.user_id,
      i.grand_total,
      i.due_at,
      COALESCE(SUM(ip.amount), 0) as paid_amount,
      i.grand_total - COALESCE(SUM(ip.amount), 0) as remaining_amount
    FROM invoices i
    LEFT JOIN invoice_payments ip ON i.id = ip.invoice_id AND ip.status = 'completed'
    WHERE i.status = 'pending'
    GROUP BY i.id;
  `,
};

export const invoiceTriggers = {
  prevent_duplicate_invoice_no: `
    CREATE TRIGGER tr_prevent_duplicate_invoice_no
    BEFORE INSERT ON invoices
    FOR EACH ROW
    BEGIN
      DECLARE count INT;
      SELECT COUNT(*) INTO count FROM invoices WHERE invoice_no = NEW.invoice_no;
      IF count > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Duplicate invoice number';
      END IF;
    END;
  `,

  audit_log_on_status_change: `
    CREATE TRIGGER tr_audit_status_change
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    BEGIN
      IF OLD.status != NEW.status THEN
        INSERT INTO invoice_audit_log (id, invoice_id, action, old_status, new_status, performed_at)
        VALUES (UUID(), NEW.id, 'status_change', OLD.status, NEW.status, UNIX_TIMESTAMP() * 1000);
      END IF;
    END;
  `,

  verify_totals_before_insert: `
    CREATE TRIGGER tr_verify_totals_before_insert
    BEFORE INSERT ON invoices
    FOR EACH ROW
    BEGIN
      DECLARE item_total DECIMAL(19, 4);
      SELECT SUM(line_total) INTO item_total 
      FROM invoice_items 
      WHERE invoice_id = NEW.id;
      
      IF item_total IS NOT NULL AND item_total != NEW.grand_total THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invoice totals do not match item totals';
      END IF;
    END;
  `,
};

export default { invoiceTables, invoiceIndexes, invoiceViews, invoiceTriggers };
