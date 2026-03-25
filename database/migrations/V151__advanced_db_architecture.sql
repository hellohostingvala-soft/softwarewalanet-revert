-- V151__advanced_db_architecture.sql
-- Advanced DB Architecture: MODULE → CATEGORY → SUBCATEGORY
-- Implements: Separate tables with foreign key relations, RLS isolation, role-based access
-- Scalable design for 10,000+ modules, no hardcoding, data integrity constraints

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================================================
-- 1. Modules Table
-- ========================================================================
CREATE TABLE IF NOT EXISTS public.modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(255) NOT NULL UNIQUE,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for scalability
CREATE INDEX IF NOT EXISTS idx_modules_created_by ON public.modules (created_by);
CREATE INDEX IF NOT EXISTS idx_modules_is_active ON public.modules (is_active);
CREATE INDEX IF NOT EXISTS idx_modules_name_lower ON public.modules (lower(name) text_pattern_ops);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_modules_updated_at'
  ) THEN
    CREATE TRIGGER update_modules_updated_at
    BEFORE UPDATE ON public.modules
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
  END IF;
END$$;

-- ========================================================================
-- 2. Categories Table
-- ========================================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  name varchar(255) NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(module_id, name) -- No duplicate category names within a module
);

-- Indexes for scalability
CREATE INDEX IF NOT EXISTS idx_categories_module_id ON public.categories (module_id);
CREATE INDEX IF NOT EXISTS idx_categories_created_by ON public.categories (created_by);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories (is_active);
CREATE INDEX IF NOT EXISTS idx_categories_name_lower ON public.categories (lower(name) text_pattern_ops);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_categories_updated_at'
  ) THEN
    CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
  END IF;
END$$;

-- ========================================================================
-- 3. Subcategories Table
-- ========================================================================
CREATE TABLE IF NOT EXISTS public.subcategories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name varchar(255) NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(category_id, name) -- No duplicate subcategory names within a category
);

-- Indexes for scalability
CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON public.subcategories (category_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_created_by ON public.subcategories (created_by);
CREATE INDEX IF NOT EXISTS idx_subcategories_is_active ON public.subcategories (is_active);
CREATE INDEX IF NOT EXISTS idx_subcategories_name_lower ON public.subcategories (lower(name) text_pattern_ops);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_subcategories_updated_at'
  ) THEN
    CREATE TRIGGER update_subcategories_updated_at
    BEFORE UPDATE ON public.subcategories
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
  END IF;
END$$;

-- ========================================================================
-- 4. Row Level Security (RLS) Policies
-- ========================================================================

-- Enable RLS on all tables
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

-- Modules RLS: Users can only see modules they created or have access to
-- Assuming roles are stored in auth.users or jwt payload
-- For simplicity, allow creators to manage, admins to see all

CREATE POLICY "modules_select" ON public.modules
FOR SELECT USING (
  created_by = auth.uid() OR
  (auth.jwt() ->> 'role')::text IN ('admin', 'super_admin')
);

CREATE POLICY "modules_insert" ON public.modules
FOR INSERT WITH CHECK (
  created_by = auth.uid() AND
  (auth.jwt() ->> 'role')::text IN ('admin', 'super_admin', 'module_creator')
);

CREATE POLICY "modules_update" ON public.modules
FOR UPDATE USING (
  created_by = auth.uid() OR
  (auth.jwt() ->> 'role')::text IN ('admin', 'super_admin')
);

CREATE POLICY "modules_delete" ON public.modules
FOR DELETE USING (
  created_by = auth.uid() OR
  (auth.jwt() ->> 'role')::text IN ('admin', 'super_admin')
);

-- Categories RLS: Scoped to module access
CREATE POLICY "categories_select" ON public.categories
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.modules m
    WHERE m.id = categories.module_id
    AND (m.created_by = auth.uid() OR (auth.jwt() ->> 'role')::text IN ('admin', 'super_admin'))
  ) OR
  created_by = auth.uid()
);

CREATE POLICY "categories_insert" ON public.categories
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.modules m
    WHERE m.id = module_id
    AND (m.created_by = auth.uid() OR (auth.jwt() ->> 'role')::text IN ('admin', 'super_admin'))
  ) AND
  created_by = auth.uid() AND
  (auth.jwt() ->> 'role')::text IN ('admin', 'super_admin', 'category_manager')
);

CREATE POLICY "categories_update" ON public.categories
FOR UPDATE USING (
  created_by = auth.uid() OR
  (auth.jwt() ->> 'role')::text IN ('admin', 'super_admin') OR
  EXISTS (
    SELECT 1 FROM public.modules m
    WHERE m.id = categories.module_id
    AND m.created_by = auth.uid()
  )
);

CREATE POLICY "categories_delete" ON public.categories
FOR DELETE USING (
  created_by = auth.uid() OR
  (auth.jwt() ->> 'role')::text IN ('admin', 'super_admin')
);

-- Subcategories RLS: Scoped to category and module access
CREATE POLICY "subcategories_select" ON public.subcategories
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.categories c
    JOIN public.modules m ON m.id = c.module_id
    WHERE c.id = subcategories.category_id
    AND (m.created_by = auth.uid() OR c.created_by = auth.uid() OR (auth.jwt() ->> 'role')::text IN ('admin', 'super_admin'))
  ) OR
  created_by = auth.uid()
);

CREATE POLICY "subcategories_insert" ON public.subcategories
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.categories c
    JOIN public.modules m ON m.id = c.module_id
    WHERE c.id = category_id
    AND (m.created_by = auth.uid() OR c.created_by = auth.uid() OR (auth.jwt() ->> 'role')::text IN ('admin', 'super_admin'))
  ) AND
  created_by = auth.uid() AND
  (auth.jwt() ->> 'role')::text IN ('admin', 'super_admin', 'subcategory_manager')
);

CREATE POLICY "subcategories_update" ON public.subcategories
FOR UPDATE USING (
  created_by = auth.uid() OR
  (auth.jwt() ->> 'role')::text IN ('admin', 'super_admin') OR
  EXISTS (
    SELECT 1 FROM public.categories c
    JOIN public.modules m ON m.id = c.module_id
    WHERE c.id = subcategories.category_id
    AND (m.created_by = auth.uid() OR c.created_by = auth.uid())
  )
);

CREATE POLICY "subcategories_delete" ON public.subcategories
FOR DELETE USING (
  created_by = auth.uid() OR
  (auth.jwt() ->> 'role')::text IN ('admin', 'super_admin')
);

-- ========================================================================
-- 5. Data Integrity Constraints
-- ========================================================================

-- Ensure active modules have active categories/subcategories (soft delete cascade)
-- This is handled via application logic, but we can add checks if needed

-- Add check constraints for name lengths
ALTER TABLE public.modules ADD CONSTRAINT modules_name_length CHECK (length(name) >= 1 AND length(name) <= 255);
ALTER TABLE public.categories ADD CONSTRAINT categories_name_length CHECK (length(name) >= 1 AND length(name) <= 255);
ALTER TABLE public.subcategories ADD CONSTRAINT subcategories_name_length CHECK (length(name) >= 1 AND length(name) <= 255);

-- ========================================================================
-- 6. Performance Indexes for Scalability
-- ========================================================================

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_categories_module_active ON public.categories (module_id, is_active);
CREATE INDEX IF NOT EXISTS idx_subcategories_category_active ON public.subcategories (category_id, is_active);

-- Full-text search if needed (can be added later)
-- For now, basic text search via lower(name)