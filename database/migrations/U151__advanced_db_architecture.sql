-- U151__advanced_db_architecture.sql
-- Undo migration for V151__advanced_db_architecture.sql

-- Drop triggers
DROP TRIGGER IF EXISTS update_modules_updated_at ON public.modules;
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
DROP TRIGGER IF EXISTS update_subcategories_updated_at ON public.subcategories;

-- Drop policies
DROP POLICY IF EXISTS "modules_select" ON public.modules;
DROP POLICY IF EXISTS "modules_insert" ON public.modules;
DROP POLICY IF EXISTS "modules_update" ON public.modules;
DROP POLICY IF EXISTS "modules_delete" ON public.modules;

DROP POLICY IF EXISTS "categories_select" ON public.categories;
DROP POLICY IF EXISTS "categories_insert" ON public.categories;
DROP POLICY IF EXISTS "categories_update" ON public.categories;
DROP POLICY IF EXISTS "categories_delete" ON public.categories;

DROP POLICY IF EXISTS "subcategories_select" ON public.subcategories;
DROP POLICY IF EXISTS "subcategories_insert" ON public.subcategories;
DROP POLICY IF EXISTS "subcategories_update" ON public.subcategories;
DROP POLICY IF EXISTS "subcategories_delete" ON public.subcategories;

-- Drop tables (cascade will handle foreign keys)
DROP TABLE IF EXISTS public.subcategories CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.modules CASCADE;

-- Drop function if not used elsewhere
-- DROP FUNCTION IF EXISTS public.update_updated_at_column();