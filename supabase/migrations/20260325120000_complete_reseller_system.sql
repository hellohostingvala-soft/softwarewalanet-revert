-- Complete Reseller System Migration
-- Implements the full reseller application → approval → dashboard flow

-- 1. Modify existing resellers table to match user requirements
-- Drop existing resellers table and recreate with correct structure
DROP TABLE IF EXISTS public.resellers CASCADE;

CREATE TABLE IF NOT EXISTS public.resellers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'BLOCKED')) DEFAULT 'ACTIVE',
    commission_rate NUMERIC(5,2) NOT NULL DEFAULT 10.00,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create customers table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reseller_id UUID NOT NULL REFERENCES public.resellers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reseller_id UUID NOT NULL REFERENCES public.resellers(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reseller_id UUID NOT NULL REFERENCES public.resellers(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    commission_amount NUMERIC(12,2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Create payouts table
CREATE TABLE IF NOT EXISTS public.payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reseller_id UUID NOT NULL REFERENCES public.resellers(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'paid', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_resellers_user_id ON public.resellers(user_id);
CREATE INDEX IF NOT EXISTS idx_resellers_status ON public.resellers(status);
CREATE INDEX IF NOT EXISTS idx_customers_reseller_id ON public.customers(reseller_id);
CREATE INDEX IF NOT EXISTS idx_orders_reseller_id ON public.orders(reseller_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_transactions_reseller_id ON public.transactions(reseller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON public.transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payouts_reseller_id ON public.payouts(reseller_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON public.payouts(status);

-- Enable RLS
ALTER TABLE public.resellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for resellers
DROP POLICY IF EXISTS "resellers_select_own" ON public.resellers;
CREATE POLICY "resellers_select_own"
ON public.resellers
FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "resellers_admin_all" ON public.resellers;
CREATE POLICY "resellers_admin_all"
ON public.resellers
FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'boss_owner'));

-- RLS Policies for customers
DROP POLICY IF EXISTS "customers_reseller_own" ON public.customers;
CREATE POLICY "customers_reseller_own"
ON public.customers
FOR ALL
USING (
    reseller_id IN (
        SELECT id FROM public.resellers WHERE user_id = auth.uid()
    )
    OR has_role(auth.uid(), 'admin')
    OR has_role(auth.uid(), 'boss_owner')
);

-- RLS Policies for orders
DROP POLICY IF EXISTS "orders_reseller_own" ON public.orders;
CREATE POLICY "orders_reseller_own"
ON public.orders
FOR ALL
USING (
    reseller_id IN (
        SELECT id FROM public.resellers WHERE user_id = auth.uid()
    )
    OR has_role(auth.uid(), 'admin')
    OR has_role(auth.uid(), 'boss_owner')
);

-- RLS Policies for transactions
DROP POLICY IF EXISTS "transactions_reseller_own" ON public.transactions;
CREATE POLICY "transactions_reseller_own"
ON public.transactions
FOR ALL
USING (
    reseller_id IN (
        SELECT id FROM public.resellers WHERE user_id = auth.uid()
    )
    OR has_role(auth.uid(), 'admin')
    OR has_role(auth.uid(), 'boss_owner')
);

-- RLS Policies for payouts
DROP POLICY IF EXISTS "payouts_reseller_own" ON public.payouts;
CREATE POLICY "payouts_reseller_own"
ON public.payouts
FOR ALL
USING (
    reseller_id IN (
        SELECT id FROM public.resellers WHERE user_id = auth.uid()
    )
    OR has_role(auth.uid(), 'admin')
    OR has_role(auth.uid(), 'boss_owner')
);

-- Update triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_resellers_updated_at ON public.resellers;
CREATE TRIGGER update_resellers_updated_at
    BEFORE UPDATE ON public.resellers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customers_updated_at ON public.customers;
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payouts_updated_at ON public.payouts;
CREATE TRIGGER update_payouts_updated_at
    BEFORE UPDATE ON public.payouts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();