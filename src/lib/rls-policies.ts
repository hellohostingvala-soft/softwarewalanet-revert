/**
 * RLS Policy Definitions
 *
 * Documents the Row-Level Security policies enforced on each sensitive table.
 * These policies mirror the SQL definitions in:
 *   supabase/migrations/20260228005636_enable_rls_all_tables.sql
 *
 * Access levels:
 *   - "own"   : authenticated user may access only their own rows
 *   - "admin" : privileged roles (boss_owner, master, super_admin, + table-specific roles)
 *   - "public": any visitor, no authentication required (read-only catalog data)
 *   - "system": service-role inserts only (no direct user access)
 */

export type RlsAccessLevel = 'own' | 'admin' | 'public' | 'system';

export interface RlsTablePolicy {
  /** Database table name (public schema) */
  table: string;
  /** Short description of the data stored */
  description: string;
  /** Roles that have unrestricted access */
  adminRoles: string[];
  /** Whether authenticated owners can SELECT their rows */
  ownerCanSelect: boolean;
  /** Whether authenticated owners can INSERT rows */
  ownerCanInsert: boolean;
  /** Whether authenticated owners can UPDATE their rows */
  ownerCanUpdate: boolean;
  /** Whether authenticated owners can DELETE their rows */
  ownerCanDelete: boolean;
  /** Whether anonymous users can SELECT rows (public catalog tables) */
  publicCanSelect: boolean;
  /** Whether anonymous (unauthenticated) users may INSERT rows, e.g. public contact forms */
  publicCanInsert: boolean;
  /** Whether the system/service-role may INSERT without user context */
  systemCanInsert: boolean;
}

const PRIVILEGED_ROLES = ['boss_owner', 'master', 'super_admin'] as const;

/**
 * RLS policies for the 27 tables hardened in the security migration.
 * Tables are grouped by sensitivity tier.
 */
export const RLS_POLICIES: RlsTablePolicy[] = [
  // ── Tier 1: Highly sensitive personal & financial data ──────────────────

  {
    table: 'user_profiles',
    description: 'Full user profiles: email, phone, full name',
    adminRoles: [...PRIVILEGED_ROLES, 'admin'],
    ownerCanSelect: true,
    ownerCanInsert: false,
    ownerCanUpdate: true,
    ownerCanDelete: false,
    publicCanSelect: false,
    publicCanInsert: false,
    systemCanInsert: false,
  },
  {
    table: 'profiles',
    description: 'Extended personal profile data',
    adminRoles: [...PRIVILEGED_ROLES, 'admin'],
    ownerCanSelect: true,
    ownerCanInsert: true,
    ownerCanUpdate: true,
    ownerCanDelete: false,
    publicCanSelect: false,
    publicCanInsert: false,
    systemCanInsert: false,
  },
  {
    table: 'user_wallet_transactions',
    description: 'User wallet financial transactions',
    adminRoles: [...PRIVILEGED_ROLES, 'finance_manager'],
    ownerCanSelect: true,
    ownerCanInsert: true,
    ownerCanUpdate: false,
    ownerCanDelete: false,
    publicCanSelect: false,
    publicCanInsert: false,
    systemCanInsert: false,
  },
  {
    table: 'payment_attempts',
    description: 'Payment attempt records including email and phone',
    adminRoles: [...PRIVILEGED_ROLES, 'finance_manager'],
    ownerCanSelect: true,
    ownerCanInsert: false,
    ownerCanUpdate: false,
    ownerCanDelete: false,
    publicCanSelect: false,
    publicCanInsert: false,
    systemCanInsert: true,
  },
  {
    table: 'processed_transactions',
    description: 'Idempotency-safe processed payment records',
    adminRoles: [...PRIVILEGED_ROLES, 'finance_manager'],
    ownerCanSelect: true,
    ownerCanInsert: false,
    ownerCanUpdate: false,
    ownerCanDelete: false,
    publicCanSelect: false,
    publicCanInsert: false,
    systemCanInsert: false,
  },
  {
    table: 'user_purchases',
    description: 'Per-user purchase history and billing records',
    adminRoles: [...PRIVILEGED_ROLES, 'finance_manager'],
    ownerCanSelect: true,
    ownerCanInsert: true,
    ownerCanUpdate: false,
    ownerCanDelete: false,
    publicCanSelect: false,
    publicCanInsert: false,
    systemCanInsert: false,
  },
  {
    table: 'wallet_audit_log',
    description: 'Immutable financial audit trail',
    adminRoles: [...PRIVILEGED_ROLES, 'finance_manager'],
    ownerCanSelect: true,
    ownerCanInsert: false,
    ownerCanUpdate: false,
    ownerCanDelete: false,
    publicCanSelect: false,
    publicCanInsert: false,
    systemCanInsert: true,
  },
  {
    table: 'system_financial_config',
    description: 'Platform-level financial configuration (limits, fees)',
    adminRoles: [...PRIVILEGED_ROLES, 'finance_manager'],
    ownerCanSelect: false,
    ownerCanInsert: false,
    ownerCanUpdate: false,
    ownerCanDelete: false,
    publicCanSelect: false,
    publicCanInsert: false,
    systemCanInsert: false,
  },

  // ── Tier 2: Authentication & session security ────────────────────────────

  {
    table: 'backup_codes',
    description: '2FA backup codes (hashed)',
    adminRoles: [...PRIVILEGED_ROLES],
    ownerCanSelect: true,
    ownerCanInsert: true,
    ownerCanUpdate: false,
    ownerCanDelete: true,
    publicCanSelect: false,
    publicCanInsert: false,
    systemCanInsert: false,
  },
  {
    table: 'trusted_devices',
    description: 'User trusted device fingerprints',
    adminRoles: [...PRIVILEGED_ROLES],
    ownerCanSelect: true,
    ownerCanInsert: true,
    ownerCanUpdate: false,
    ownerCanDelete: true,
    publicCanSelect: false,
    publicCanInsert: false,
    systemCanInsert: false,
  },
  {
    table: 'password_verifications',
    description: 'Password verification event log',
    adminRoles: [...PRIVILEGED_ROLES],
    ownerCanSelect: true,
    ownerCanInsert: true,
    ownerCanUpdate: false,
    ownerCanDelete: false,
    publicCanSelect: false,
    publicCanInsert: false,
    systemCanInsert: false,
  },
  {
    table: 'session_security',
    description: 'Active session token hashes and activity timestamps',
    adminRoles: [...PRIVILEGED_ROLES],
    ownerCanSelect: true,
    ownerCanInsert: true,
    ownerCanUpdate: false,
    ownerCanDelete: false,
    publicCanSelect: false,
    publicCanInsert: false,
    systemCanInsert: false,
  },
  {
    table: 'failed_login_attempts',
    description: 'Failed authentication attempts (IP, email, device)',
    adminRoles: [...PRIVILEGED_ROLES, 'admin'],
    ownerCanSelect: false,
    ownerCanInsert: false,
    ownerCanUpdate: false,
    ownerCanDelete: false,
    publicCanSelect: false,
    publicCanInsert: false,
    systemCanInsert: true,
  },
  {
    table: 'login_attempts',
    description: 'All login attempt records',
    adminRoles: [...PRIVILEGED_ROLES, 'admin'],
    ownerCanSelect: false,
    ownerCanInsert: false,
    ownerCanUpdate: false,
    ownerCanDelete: false,
    publicCanSelect: false,
    publicCanInsert: false,
    systemCanInsert: true,
  },
  {
    table: 'rate_limits',
    description: 'Per-user / per-IP rate limit counters',
    adminRoles: [...PRIVILEGED_ROLES],
    ownerCanSelect: false,
    ownerCanInsert: false,
    ownerCanUpdate: false,
    ownerCanDelete: false,
    publicCanSelect: false,
    publicCanInsert: false,
    systemCanInsert: true,
  },

  // ── Tier 3: Communication & support data ────────────────────────────────

  {
    table: 'personal_chat_threads',
    description: 'Private 1-to-1 chat threads between two users',
    adminRoles: [...PRIVILEGED_ROLES],
    ownerCanSelect: true,  // "owner" = either participant
    ownerCanInsert: true,
    ownerCanUpdate: false,
    ownerCanDelete: false,
    publicCanSelect: false,
    publicCanInsert: false,
    systemCanInsert: false,
  },
  {
    table: 'personal_chat_messages',
    description: 'Individual messages within private chat threads',
    adminRoles: [...PRIVILEGED_ROLES],
    ownerCanSelect: true,  // sender or receiver
    ownerCanInsert: true,  // sender only
    ownerCanUpdate: false,
    ownerCanDelete: false,
    publicCanSelect: false,
    publicCanInsert: false,
    systemCanInsert: false,
  },
  {
    table: 'user_support_tickets',
    description: 'User-submitted support tickets',
    adminRoles: [...PRIVILEGED_ROLES, 'support'],
    ownerCanSelect: true,
    ownerCanInsert: true,
    ownerCanUpdate: true,
    ownerCanDelete: false,
    publicCanSelect: false,
    publicCanInsert: false,
    systemCanInsert: false,
  },
  {
    table: 'quick_support_requests',
    description: 'Quick (pre-login) support requests with contact details',
    adminRoles: [...PRIVILEGED_ROLES, 'support', 'admin'],
    ownerCanSelect: true,
    ownerCanInsert: false,
    ownerCanUpdate: false,
    ownerCanDelete: false,
    publicCanSelect: false,
    publicCanInsert: true,   // WITH CHECK (true) — anonymous contact-form submissions
    systemCanInsert: false,
  },
  {
    table: 'user_notifications',
    description: 'Per-user notification inbox',
    adminRoles: [...PRIVILEGED_ROLES, 'admin'],
    ownerCanSelect: true,
    ownerCanInsert: false,
    ownerCanUpdate: true,
    ownerCanDelete: false,
    publicCanSelect: false,
    publicCanInsert: false,
    systemCanInsert: false,
  },

  // ── Tier 4: Usage history ────────────────────────────────────────────────

  {
    table: 'user_demo_history',
    description: 'User demo view history',
    adminRoles: [...PRIVILEGED_ROLES, 'demo_manager'],
    ownerCanSelect: true,
    ownerCanInsert: true,
    ownerCanUpdate: false,
    ownerCanDelete: false,
    publicCanSelect: false,
    publicCanInsert: false,
    systemCanInsert: false,
  },

  // ── Tier 5: Public catalog data (read-only for everyone) ─────────────────

  {
    table: 'software_catalog',
    description: 'Platform software product catalog',
    adminRoles: [...PRIVILEGED_ROLES, 'admin'],
    ownerCanSelect: false,
    ownerCanInsert: false,
    ownerCanUpdate: false,
    ownerCanDelete: false,
    publicCanSelect: true,
    publicCanInsert: false,
    systemCanInsert: false,
  },
  {
    table: 'global_offers',
    description: 'Platform-wide promotional offers',
    adminRoles: [...PRIVILEGED_ROLES, 'admin', 'marketing_manager'],
    ownerCanSelect: false,
    ownerCanInsert: false,
    ownerCanUpdate: false,
    ownerCanDelete: false,
    publicCanSelect: true,
    publicCanInsert: false,
    systemCanInsert: false,
  },
  {
    table: 'business_categories',
    description: 'Top-level business category taxonomy',
    adminRoles: [...PRIVILEGED_ROLES, 'admin'],
    ownerCanSelect: false,
    ownerCanInsert: false,
    ownerCanUpdate: false,
    ownerCanDelete: false,
    publicCanSelect: true,
    publicCanInsert: false,
    systemCanInsert: false,
  },
  {
    table: 'business_subcategories',
    description: 'Business sub-category taxonomy',
    adminRoles: [...PRIVILEGED_ROLES, 'admin'],
    ownerCanSelect: false,
    ownerCanInsert: false,
    ownerCanUpdate: false,
    ownerCanDelete: false,
    publicCanSelect: true,
    publicCanInsert: false,
    systemCanInsert: false,
  },
  {
    table: 'sports_events',
    description: 'Public sports events calendar',
    adminRoles: [...PRIVILEGED_ROLES, 'admin'],
    ownerCanSelect: false,
    ownerCanInsert: false,
    ownerCanUpdate: false,
    ownerCanDelete: false,
    publicCanSelect: true,
    publicCanInsert: false,
    systemCanInsert: false,
  },
  {
    table: 'festival_calendar',
    description: 'Public festival / holiday calendar',
    adminRoles: [...PRIVILEGED_ROLES, 'admin'],
    ownerCanSelect: false,
    ownerCanInsert: false,
    ownerCanUpdate: false,
    ownerCanDelete: false,
    publicCanSelect: true,
    publicCanInsert: false,
    systemCanInsert: false,
  },
];

/**
 * Returns the policy entry for a given table name, or undefined if not found.
 */
export function getPolicyForTable(
  tableName: string,
): RlsTablePolicy | undefined {
  return RLS_POLICIES.find((p) => p.table === tableName);
}

/**
 * Returns all tables accessible by a given role (beyond their own rows).
 */
export function getTablesAccessibleByRole(role: string): string[] {
  return RLS_POLICIES.filter((p) => p.adminRoles.includes(role)).map(
    (p) => p.table,
  );
}

/**
 * Returns all tables that expose public (unauthenticated) SELECT access.
 */
export function getPublicSelectTables(): string[] {
  return RLS_POLICIES.filter((p) => p.publicCanSelect).map((p) => p.table);
}
