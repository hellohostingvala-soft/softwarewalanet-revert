# RLS Security Implementation Guide

## Overview

This document describes the Row-Level Security (RLS) policies applied to all sensitive database tables in the platform. Every table listed below has `ENABLE ROW LEVEL SECURITY` applied and at least one access policy defined.

## Migration Reference

**Migration file:** `supabase/migrations/20260228005636_enable_rls_all_tables.sql`

This migration is **non-destructive** (append-only, no data deleted) and **rollback-safe** — every `CREATE POLICY` statement is preceded by a matching `DROP POLICY IF EXISTS`, making the migration idempotent and safe to re-run.

---

## Role Hierarchy

| Role | Description |
|------|-------------|
| `boss_owner` | Platform owner — unrestricted access to all tables |
| `master` | Master admin — unrestricted access to all tables |
| `super_admin` | Super-admin — full access to all operational tables |
| `admin` | General administrator — can manage user-facing data |
| `finance_manager` | Can access all financial tables |
| `support` | Can view and respond to support tickets |
| `demo_manager` | Can manage demo access and history |
| `marketing_manager` | Can manage offers and promotional content |

---

## Protected Tables

### Tier 1 — Highly Sensitive Personal & Financial Data

These tables contain PII (personally identifiable information) or financial records. Access is strictly limited to the owning user and privileged admin roles.

#### `user_profiles`
- **Contains:** email, phone, full name, avatar
- **Owner access:** SELECT, UPDATE
- **Admin roles:** `boss_owner`, `master`, `super_admin`, `admin`

#### `profiles`
- **Contains:** display name, avatar URL, extended profile fields
- **Owner access:** SELECT, INSERT, UPDATE
- **Admin roles:** `boss_owner`, `master`, `super_admin`, `admin`

#### `user_wallet_transactions`
- **Contains:** wallet credits/debits, balances
- **Owner access:** SELECT, INSERT
- **Admin roles:** `boss_owner`, `master`, `super_admin`, `finance_manager`

#### `payment_attempts`
- **Contains:** payment metadata, email, phone, IP
- **Owner access:** SELECT (by `user_id`)
- **System:** INSERT allowed (payment gateway callbacks)
- **Admin roles:** `boss_owner`, `master`, `super_admin`, `finance_manager`

#### `processed_transactions`
- **Contains:** idempotency records for completed transactions
- **Owner access:** SELECT
- **Admin roles:** `boss_owner`, `master`, `super_admin`, `finance_manager`

#### `user_purchases`
- **Contains:** purchase history, amounts, product IDs
- **Owner access:** SELECT, INSERT
- **Admin roles:** `boss_owner`, `master`, `super_admin`, `finance_manager`

#### `wallet_audit_log`
- **Contains:** immutable financial audit trail
- **Owner access:** SELECT
- **System:** INSERT allowed (internal accounting service)
- **Admin roles:** `boss_owner`, `master`, `super_admin`, `finance_manager`

#### `system_financial_config`
- **Contains:** platform fee rates, payout limits, currency config
- **Owner access:** None (system-only)
- **Admin roles:** `boss_owner`, `master`, `super_admin`, `finance_manager`

---

### Tier 2 — Authentication & Session Security

#### `backup_codes`
- **Contains:** hashed 2FA backup codes
- **Owner access:** SELECT, INSERT, DELETE
- **Admin roles:** `boss_owner`, `master`, `super_admin`

#### `trusted_devices`
- **Contains:** device fingerprints, browser/OS metadata
- **Owner access:** SELECT, INSERT, DELETE
- **Admin roles:** `boss_owner`, `master`, `super_admin`

#### `password_verifications`
- **Contains:** password verification audit log
- **Owner access:** SELECT, INSERT
- **Admin roles:** `boss_owner`, `master`, `super_admin`

#### `session_security`
- **Contains:** active session token hashes, last-activity timestamps
- **Owner access:** SELECT, INSERT
- **Admin roles:** `boss_owner`, `master`, `super_admin`

#### `failed_login_attempts`
- **Contains:** failed login metadata: IP, email, device, count
- **Owner access:** None
- **System:** INSERT allowed
- **Admin roles:** `boss_owner`, `master`, `super_admin`, `admin`

#### `login_attempts`
- **Contains:** all login attempt audit records
- **Owner access:** None
- **System:** INSERT allowed
- **Admin roles:** `boss_owner`, `master`, `super_admin`, `admin`

#### `rate_limits`
- **Contains:** per-user/per-IP rate-limit counters
- **Owner access:** None
- **System:** INSERT allowed
- **Admin roles:** `boss_owner`, `master`, `super_admin`

---

### Tier 3 — Communication & Support Data

#### `personal_chat_threads`
- **Contains:** private 1-to-1 conversation threads
- **Owner access:** SELECT, INSERT (both participants)
- **Admin roles:** `boss_owner`, `master`, `super_admin`

#### `personal_chat_messages`
- **Contains:** individual private messages
- **Owner access:** SELECT (sender or receiver), INSERT (sender only)
- **Admin roles:** `boss_owner`, `master`, `super_admin`

#### `user_support_tickets`
- **Contains:** support ticket content, contact details
- **Owner access:** SELECT, INSERT, UPDATE
- **Admin roles:** `boss_owner`, `master`, `super_admin`, `support`

#### `quick_support_requests`
- **Contains:** pre-login support requests, email, phone
- **Owner access:** SELECT (by `user_id` when provided)
- **System:** INSERT allowed (unauthenticated form submissions)
- **Admin roles:** `boss_owner`, `master`, `super_admin`, `support`, `admin`

#### `user_notifications`
- **Contains:** per-user notification messages
- **Owner access:** SELECT, UPDATE (mark read)
- **Admin roles:** `boss_owner`, `master`, `super_admin`, `admin`

---

### Tier 4 — Usage History

#### `user_demo_history`
- **Contains:** demo view history per user
- **Owner access:** SELECT, INSERT
- **Admin roles:** `boss_owner`, `master`, `super_admin`, `demo_manager`

---

### Tier 5 — Public Catalog Data

These tables hold non-sensitive reference data. Any visitor may read them; only privileged roles may modify them.

| Table | Description | Admin Roles |
|-------|-------------|-------------|
| `software_catalog` | Product catalog | `boss_owner`, `master`, `super_admin`, `admin` |
| `global_offers` | Promotional offers | `boss_owner`, `master`, `super_admin`, `admin`, `marketing_manager` |
| `business_categories` | Category taxonomy | `boss_owner`, `master`, `super_admin`, `admin` |
| `business_subcategories` | Sub-category taxonomy | `boss_owner`, `master`, `super_admin`, `admin` |
| `sports_events` | Sports events calendar | `boss_owner`, `master`, `super_admin`, `admin` |
| `festival_calendar` | Holiday calendar | `boss_owner`, `master`, `super_admin`, `admin` |

---

## Policy Naming Convention

All policies added by this migration follow a consistent naming pattern:

```
rls_<table_name>_<action>
```

Examples:
- `rls_user_profiles_select_own` — owner SELECT on `user_profiles`
- `rls_user_profiles_admin_all` — admin ALL on `user_profiles`
- `rls_payment_attempts_system_insert` — service-role INSERT on `payment_attempts`

---

## Deployment

### Production deployment (zero downtime)

```bash
# Apply the migration
supabase db push

# Verify policies were created
supabase db diff --use-migra
```

### Rollback

Because every `CREATE POLICY` is idempotent (preceded by `DROP POLICY IF EXISTS`), rolling back is straightforward:

```sql
-- Run in Supabase SQL editor to remove all policies added by this migration
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE policyname LIKE 'rls_%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
      pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;
END $$;
```

---

## Audit Logging

Privileged access to sensitive tables is automatically captured by the existing `audit_logs` and `wallet_audit_log` infrastructure. Any query executed by a `boss_owner`, `master`, or `super_admin` role goes through Postgres audit triggers already defined in earlier migrations.

---

## Testing Checklist

Before deploying to production, validate the following scenarios in staging:

- [ ] Authenticated user can read **only their own** `user_profiles` row
- [ ] Authenticated user **cannot** read another user's `user_profiles`
- [ ] `finance_manager` can read all `user_wallet_transactions`
- [ ] Anonymous user can read `software_catalog` without authentication
- [ ] Anonymous user **cannot** read `user_profiles`
- [ ] `super_admin` can read all `personal_chat_messages`
- [ ] Regular user cannot read another user's `personal_chat_messages`
- [ ] System (service role) can INSERT into `failed_login_attempts`
- [ ] Regular user **cannot** INSERT into `system_financial_config`

---

## Security Summary

| Category | Tables Protected | Primary Risk Mitigated |
|----------|-----------------|----------------------|
| Personal data | `user_profiles`, `profiles` | PII exposure |
| Financial records | `user_wallet_transactions`, `payment_attempts`, `processed_transactions`, `user_purchases`, `wallet_audit_log`, `system_financial_config` | Financial data leak |
| Authentication | `backup_codes`, `trusted_devices`, `password_verifications`, `session_security`, `failed_login_attempts`, `login_attempts`, `rate_limits` | Account takeover / brute-force |
| Communications | `personal_chat_threads`, `personal_chat_messages`, `user_support_tickets`, `quick_support_requests`, `user_notifications` | Privacy breach |
| Usage history | `user_demo_history` | Behavioral profiling |
| Catalog data | `software_catalog`, `global_offers`, `business_categories`, `business_subcategories`, `sports_events`, `festival_calendar` | Unauthorized modification |

**Total tables hardened: 27**
