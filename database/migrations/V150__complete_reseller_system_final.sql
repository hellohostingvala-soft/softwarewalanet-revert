-- COMPLETE RESELLER SYSTEM MIGRATION
-- ERD: users → reseller_applications → resellers → customers/orders/transactions/payouts
-- ALL tables use consistent user_id

-- 1. reseller_applications table (application requests)
CREATE TABLE IF NOT EXISTS public.reseller_applications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text NOT NULL,
    email text NOT NULL,
    phone text,
    country text,
    business_type text,
    experience_years integer,
    motivation text,
    documents jsonb DEFAULT '{}',
    status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    reviewer_notes text,
    reviewed_by uuid REFERENCES auth.users(id),
    reviewed_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. resellers table (approved resellers only)
CREATE TABLE IF NOT EXISTS public.resellers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    commission_rate numeric NOT NULL DEFAULT 10.0,
    status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'BLOCKED', 'SUSPENDED')),
    joined_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. customers table (reseller's customers)
CREATE TABLE IF NOT EXISTS public.customers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reseller_id uuid NOT NULL REFERENCES public.resellers(id) ON DELETE CASCADE,
    name text NOT NULL,
    email text,
    phone text,
    address text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. orders table (reseller's sales orders)
CREATE TABLE IF NOT EXISTS public.orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reseller_id uuid NOT NULL REFERENCES public.resellers(id) ON DELETE CASCADE,
    customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
    product_name text NOT NULL,
    amount numeric NOT NULL CHECK (amount > 0),
    currency text NOT NULL DEFAULT 'USD',
    status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELLED', 'REFUNDED')),
    order_date timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5. transactions table (commission tracking)
CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reseller_id uuid NOT NULL REFERENCES public.resellers(id) ON DELETE CASCADE,
    order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    commission_amount numeric NOT NULL CHECK (commission_amount >= 0),
    commission_rate numeric NOT NULL,
    status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELLED')),
    processed_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 6. payouts table (commission payouts to resellers)
CREATE TABLE IF NOT EXISTS public.payouts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reseller_id uuid NOT NULL REFERENCES public.resellers(id) ON DELETE CASCADE,
    amount numeric NOT NULL CHECK (amount > 0),
    currency text NOT NULL DEFAULT 'USD',
    status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'PAID', 'FAILED', 'CANCELLED')),
    payment_method text,
    payment_details jsonb DEFAULT '{}',
    requested_at timestamptz NOT NULL DEFAULT now(),
    processed_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_reseller_applications_user_id ON public.reseller_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_reseller_applications_status ON public.reseller_applications(status);
CREATE INDEX IF NOT EXISTS idx_resellers_user_id ON public.resellers(user_id);
CREATE INDEX IF NOT EXISTS idx_resellers_status ON public.resellers(status);
CREATE INDEX IF NOT EXISTS idx_customers_reseller_id ON public.customers(reseller_id);
CREATE INDEX IF NOT EXISTS idx_orders_reseller_id ON public.orders(reseller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_transactions_reseller_id ON public.transactions(reseller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON public.transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payouts_reseller_id ON public.payouts(reseller_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON public.payouts(status);

-- ROW LEVEL SECURITY (RLS) POLICIES

-- reseller_applications: users can see their own, admins can see all
ALTER TABLE public.reseller_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own applications" ON public.reseller_applications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications" ON public.reseller_applications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

-- resellers: resellers can see their own, admins can see all
ALTER TABLE public.resellers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Resellers can view own record" ON public.resellers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all resellers" ON public.resellers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

-- customers: resellers can see their own customers, admins can see all
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Resellers can manage own customers" ON public.customers
    FOR ALL USING (
        reseller_id IN (
            SELECT id FROM public.resellers WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all customers" ON public.customers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

-- orders: resellers can see their own orders, admins can see all
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Resellers can manage own orders" ON public.orders
    FOR ALL USING (
        reseller_id IN (
            SELECT id FROM public.resellers WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all orders" ON public.orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

-- transactions: resellers can see their own transactions, admins can see all
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Resellers can view own transactions" ON public.transactions
    FOR SELECT USING (
        reseller_id IN (
            SELECT id FROM public.resellers WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all transactions" ON public.transactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

-- payouts: resellers can see their own payouts, admins can manage all
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Resellers can view own payouts" ON public.payouts
    FOR SELECT USING (
        reseller_id IN (
            SELECT id FROM public.resellers WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all payouts" ON public.payouts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

-- TRIGGERS for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reseller_applications_updated_at
    BEFORE UPDATE ON public.reseller_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resellers_updated_at
    BEFORE UPDATE ON public.resellers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payouts_updated_at
    BEFORE UPDATE ON public.payouts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- FUNCTION: Auto-create transaction when order is completed
CREATE OR REPLACE FUNCTION create_transaction_on_order_complete()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'COMPLETED' AND OLD.status != 'COMPLETED' THEN
        INSERT INTO public.transactions (
            reseller_id,
            order_id,
            commission_amount,
            commission_rate
        )
        SELECT
            o.reseller_id,
            NEW.id,
            (NEW.amount * r.commission_rate / 100),
            r.commission_rate
        FROM public.orders o
        JOIN public.resellers r ON r.id = o.reseller_id
        WHERE o.id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_transaction_on_order_complete
    AFTER UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION create_transaction_on_order_complete();</content>
<parameter name="filePath">c:\Users\dell\softwarewalanet\database\migrations\V150__complete_reseller_system_final.sql