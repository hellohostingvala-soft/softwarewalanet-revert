-- ============================================================
-- RLS Security Hardening: Add policies for 27 unprotected tables
-- Migration: 20260228005636_enable_rls_all_tables.sql
-- Non-destructive, append-only, fully rollback-safe
-- ============================================================

-- ============================================================
-- 1. USER PROFILES (emails, phones, full names)
-- ============================================================
DROP POLICY IF EXISTS "rls_user_profiles_select_own" ON public.user_profiles;
DROP POLICY IF EXISTS "rls_user_profiles_update_own" ON public.user_profiles;
DROP POLICY IF EXISTS "rls_user_profiles_admin_all" ON public.user_profiles;

CREATE POLICY "rls_user_profiles_select_own"
  ON public.user_profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "rls_user_profiles_update_own"
  ON public.user_profiles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "rls_user_profiles_admin_all"
  ON public.user_profiles FOR ALL
  USING (
    public.has_role(auth.uid(), 'boss_owner'::public.app_role)
    OR public.has_role(auth.uid(), 'master'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- ============================================================
-- 2. USER WALLET TRANSACTIONS (financial records)
-- ============================================================
DROP POLICY IF EXISTS "rls_user_wallet_tx_select_own" ON public.user_wallet_transactions;
DROP POLICY IF EXISTS "rls_user_wallet_tx_insert_own" ON public.user_wallet_transactions;
DROP POLICY IF EXISTS "rls_user_wallet_tx_admin_all" ON public.user_wallet_transactions;

CREATE POLICY "rls_user_wallet_tx_select_own"
  ON public.user_wallet_transactions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "rls_user_wallet_tx_insert_own"
  ON public.user_wallet_transactions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "rls_user_wallet_tx_admin_all"
  ON public.user_wallet_transactions FOR ALL
  USING (
    public.has_role(auth.uid(), 'boss_owner'::public.app_role)
    OR public.has_role(auth.uid(), 'master'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
    OR public.has_role(auth.uid(), 'finance_manager'::public.app_role)
  );

-- ============================================================
-- 3. PAYMENT ATTEMPTS (financial + personal data)
-- ============================================================
DROP POLICY IF EXISTS "rls_payment_attempts_select_own" ON public.payment_attempts;
DROP POLICY IF EXISTS "rls_payment_attempts_insert" ON public.payment_attempts;
DROP POLICY IF EXISTS "rls_payment_attempts_admin_all" ON public.payment_attempts;

CREATE POLICY "rls_payment_attempts_select_own"
  ON public.payment_attempts FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "rls_payment_attempts_insert"
  ON public.payment_attempts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "rls_payment_attempts_admin_all"
  ON public.payment_attempts FOR ALL
  USING (
    public.has_role(auth.uid(), 'boss_owner'::public.app_role)
    OR public.has_role(auth.uid(), 'master'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
    OR public.has_role(auth.uid(), 'finance_manager'::public.app_role)
  );

-- ============================================================
-- 4. PROCESSED TRANSACTIONS (financial records)
-- ============================================================
DROP POLICY IF EXISTS "rls_processed_tx_select_own" ON public.processed_transactions;
DROP POLICY IF EXISTS "rls_processed_tx_admin_all" ON public.processed_transactions;

CREATE POLICY "rls_processed_tx_select_own"
  ON public.processed_transactions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "rls_processed_tx_admin_all"
  ON public.processed_transactions FOR ALL
  USING (
    public.has_role(auth.uid(), 'boss_owner'::public.app_role)
    OR public.has_role(auth.uid(), 'master'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
    OR public.has_role(auth.uid(), 'finance_manager'::public.app_role)
  );

-- ============================================================
-- 5. PROFILES (personal profile data)
-- ============================================================
DROP POLICY IF EXISTS "rls_profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "rls_profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "rls_profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "rls_profiles_admin_all" ON public.profiles;

CREATE POLICY "rls_profiles_select_own"
  ON public.profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "rls_profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "rls_profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "rls_profiles_admin_all"
  ON public.profiles FOR ALL
  USING (
    public.has_role(auth.uid(), 'boss_owner'::public.app_role)
    OR public.has_role(auth.uid(), 'master'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- ============================================================
-- 6. BACKUP CODES (2FA security codes)
-- ============================================================
DROP POLICY IF EXISTS "rls_backup_codes_select_own" ON public.backup_codes;
DROP POLICY IF EXISTS "rls_backup_codes_insert_own" ON public.backup_codes;
DROP POLICY IF EXISTS "rls_backup_codes_delete_own" ON public.backup_codes;
DROP POLICY IF EXISTS "rls_backup_codes_admin_all" ON public.backup_codes;

CREATE POLICY "rls_backup_codes_select_own"
  ON public.backup_codes FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "rls_backup_codes_insert_own"
  ON public.backup_codes FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "rls_backup_codes_delete_own"
  ON public.backup_codes FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "rls_backup_codes_admin_all"
  ON public.backup_codes FOR ALL
  USING (
    public.has_role(auth.uid(), 'boss_owner'::public.app_role)
    OR public.has_role(auth.uid(), 'master'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  );

-- ============================================================
-- 7. TRUSTED DEVICES (device security data)
-- ============================================================
DROP POLICY IF EXISTS "rls_trusted_devices_select_own" ON public.trusted_devices;
DROP POLICY IF EXISTS "rls_trusted_devices_insert_own" ON public.trusted_devices;
DROP POLICY IF EXISTS "rls_trusted_devices_delete_own" ON public.trusted_devices;
DROP POLICY IF EXISTS "rls_trusted_devices_admin_all" ON public.trusted_devices;

CREATE POLICY "rls_trusted_devices_select_own"
  ON public.trusted_devices FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "rls_trusted_devices_insert_own"
  ON public.trusted_devices FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "rls_trusted_devices_delete_own"
  ON public.trusted_devices FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "rls_trusted_devices_admin_all"
  ON public.trusted_devices FOR ALL
  USING (
    public.has_role(auth.uid(), 'boss_owner'::public.app_role)
    OR public.has_role(auth.uid(), 'master'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  );

-- ============================================================
-- 8. PASSWORD VERIFICATIONS (authentication records)
-- ============================================================
DROP POLICY IF EXISTS "rls_password_verif_select_own" ON public.password_verifications;
DROP POLICY IF EXISTS "rls_password_verif_insert_own" ON public.password_verifications;
DROP POLICY IF EXISTS "rls_password_verif_admin_all" ON public.password_verifications;

CREATE POLICY "rls_password_verif_select_own"
  ON public.password_verifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "rls_password_verif_insert_own"
  ON public.password_verifications FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "rls_password_verif_admin_all"
  ON public.password_verifications FOR ALL
  USING (
    public.has_role(auth.uid(), 'boss_owner'::public.app_role)
    OR public.has_role(auth.uid(), 'master'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  );

-- ============================================================
-- 9. SESSION SECURITY (active session tokens)
-- ============================================================
DROP POLICY IF EXISTS "rls_session_security_select_own" ON public.session_security;
DROP POLICY IF EXISTS "rls_session_security_upsert_own" ON public.session_security;
DROP POLICY IF EXISTS "rls_session_security_admin_all" ON public.session_security;

CREATE POLICY "rls_session_security_select_own"
  ON public.session_security FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "rls_session_security_upsert_own"
  ON public.session_security FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "rls_session_security_admin_all"
  ON public.session_security FOR ALL
  USING (
    public.has_role(auth.uid(), 'boss_owner'::public.app_role)
    OR public.has_role(auth.uid(), 'master'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  );

-- ============================================================
-- 10. USER PURCHASES (billing / purchase records)
-- ============================================================
DROP POLICY IF EXISTS "rls_user_purchases_select_own" ON public.user_purchases;
DROP POLICY IF EXISTS "rls_user_purchases_insert_own" ON public.user_purchases;
DROP POLICY IF EXISTS "rls_user_purchases_admin_all" ON public.user_purchases;

CREATE POLICY "rls_user_purchases_select_own"
  ON public.user_purchases FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "rls_user_purchases_insert_own"
  ON public.user_purchases FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "rls_user_purchases_admin_all"
  ON public.user_purchases FOR ALL
  USING (
    public.has_role(auth.uid(), 'boss_owner'::public.app_role)
    OR public.has_role(auth.uid(), 'master'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
    OR public.has_role(auth.uid(), 'finance_manager'::public.app_role)
  );

-- ============================================================
-- 11. USER DEMO HISTORY (usage history)
-- ============================================================
DROP POLICY IF EXISTS "rls_user_demo_history_select_own" ON public.user_demo_history;
DROP POLICY IF EXISTS "rls_user_demo_history_insert_own" ON public.user_demo_history;
DROP POLICY IF EXISTS "rls_user_demo_history_admin_all" ON public.user_demo_history;

CREATE POLICY "rls_user_demo_history_select_own"
  ON public.user_demo_history FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "rls_user_demo_history_insert_own"
  ON public.user_demo_history FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "rls_user_demo_history_admin_all"
  ON public.user_demo_history FOR ALL
  USING (
    public.has_role(auth.uid(), 'boss_owner'::public.app_role)
    OR public.has_role(auth.uid(), 'master'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
    OR public.has_role(auth.uid(), 'demo_manager'::public.app_role)
  );

-- ============================================================
-- 12. USER SUPPORT TICKETS (personal + contact data)
-- ============================================================
DROP POLICY IF EXISTS "rls_user_support_tickets_select_own" ON public.user_support_tickets;
DROP POLICY IF EXISTS "rls_user_support_tickets_insert_own" ON public.user_support_tickets;
DROP POLICY IF EXISTS "rls_user_support_tickets_update_own" ON public.user_support_tickets;
DROP POLICY IF EXISTS "rls_user_support_tickets_admin_all" ON public.user_support_tickets;

CREATE POLICY "rls_user_support_tickets_select_own"
  ON public.user_support_tickets FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "rls_user_support_tickets_insert_own"
  ON public.user_support_tickets FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "rls_user_support_tickets_update_own"
  ON public.user_support_tickets FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "rls_user_support_tickets_admin_all"
  ON public.user_support_tickets FOR ALL
  USING (
    public.has_role(auth.uid(), 'boss_owner'::public.app_role)
    OR public.has_role(auth.uid(), 'master'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
    OR public.has_role(auth.uid(), 'support'::public.app_role)
  );

-- ============================================================
-- 13. USER NOTIFICATIONS (personal notifications)
-- ============================================================
DROP POLICY IF EXISTS "rls_user_notifications_select_own" ON public.user_notifications;
DROP POLICY IF EXISTS "rls_user_notifications_update_own" ON public.user_notifications;
DROP POLICY IF EXISTS "rls_user_notifications_admin_all" ON public.user_notifications;

CREATE POLICY "rls_user_notifications_select_own"
  ON public.user_notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "rls_user_notifications_update_own"
  ON public.user_notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "rls_user_notifications_admin_all"
  ON public.user_notifications FOR ALL
  USING (
    public.has_role(auth.uid(), 'boss_owner'::public.app_role)
    OR public.has_role(auth.uid(), 'master'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- ============================================================
-- 14. PERSONAL CHAT THREADS (private conversations)
-- ============================================================
DROP POLICY IF EXISTS "rls_personal_chat_threads_select_participant" ON public.personal_chat_threads;
DROP POLICY IF EXISTS "rls_personal_chat_threads_insert" ON public.personal_chat_threads;
DROP POLICY IF EXISTS "rls_personal_chat_threads_admin_all" ON public.personal_chat_threads;

CREATE POLICY "rls_personal_chat_threads_select_participant"
  ON public.personal_chat_threads FOR SELECT
  USING (participant_one = auth.uid() OR participant_two = auth.uid());

CREATE POLICY "rls_personal_chat_threads_insert"
  ON public.personal_chat_threads FOR INSERT
  WITH CHECK (participant_one = auth.uid() OR participant_two = auth.uid());

CREATE POLICY "rls_personal_chat_threads_admin_all"
  ON public.personal_chat_threads FOR ALL
  USING (
    public.has_role(auth.uid(), 'boss_owner'::public.app_role)
    OR public.has_role(auth.uid(), 'master'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  );

-- ============================================================
-- 15. PERSONAL CHAT MESSAGES (private messages)
-- ============================================================
DROP POLICY IF EXISTS "rls_personal_chat_messages_select_participant" ON public.personal_chat_messages;
DROP POLICY IF EXISTS "rls_personal_chat_messages_insert_sender" ON public.personal_chat_messages;
DROP POLICY IF EXISTS "rls_personal_chat_messages_admin_all" ON public.personal_chat_messages;

CREATE POLICY "rls_personal_chat_messages_select_participant"
  ON public.personal_chat_messages FOR SELECT
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "rls_personal_chat_messages_insert_sender"
  ON public.personal_chat_messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "rls_personal_chat_messages_admin_all"
  ON public.personal_chat_messages FOR ALL
  USING (
    public.has_role(auth.uid(), 'boss_owner'::public.app_role)
    OR public.has_role(auth.uid(), 'master'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  );

-- ============================================================
-- 16. FAILED LOGIN ATTEMPTS (security audit log)
-- ============================================================
DROP POLICY IF EXISTS "rls_failed_login_attempts_system_insert" ON public.failed_login_attempts;
DROP POLICY IF EXISTS "rls_failed_login_attempts_admin_all" ON public.failed_login_attempts;

CREATE POLICY "rls_failed_login_attempts_system_insert"
  ON public.failed_login_attempts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "rls_failed_login_attempts_admin_all"
  ON public.failed_login_attempts FOR ALL
  USING (
    public.has_role(auth.uid(), 'boss_owner'::public.app_role)
    OR public.has_role(auth.uid(), 'master'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- ============================================================
-- 17. LOGIN ATTEMPTS (security audit log)
-- ============================================================
DROP POLICY IF EXISTS "rls_login_attempts_system_insert" ON public.login_attempts;
DROP POLICY IF EXISTS "rls_login_attempts_admin_all" ON public.login_attempts;

CREATE POLICY "rls_login_attempts_system_insert"
  ON public.login_attempts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "rls_login_attempts_admin_all"
  ON public.login_attempts FOR ALL
  USING (
    public.has_role(auth.uid(), 'boss_owner'::public.app_role)
    OR public.has_role(auth.uid(), 'master'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- ============================================================
-- 18. RATE LIMITS (system-level data)
-- ============================================================
DROP POLICY IF EXISTS "rls_rate_limits_system_upsert" ON public.rate_limits;
DROP POLICY IF EXISTS "rls_rate_limits_admin_all" ON public.rate_limits;

CREATE POLICY "rls_rate_limits_system_upsert"
  ON public.rate_limits FOR INSERT
  WITH CHECK (true);

CREATE POLICY "rls_rate_limits_admin_all"
  ON public.rate_limits FOR ALL
  USING (
    public.has_role(auth.uid(), 'boss_owner'::public.app_role)
    OR public.has_role(auth.uid(), 'master'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  );

-- ============================================================
-- 19. SYSTEM FINANCIAL CONFIG (financial configuration)
-- ============================================================
DROP POLICY IF EXISTS "rls_system_financial_config_admin_all" ON public.system_financial_config;

CREATE POLICY "rls_system_financial_config_admin_all"
  ON public.system_financial_config FOR ALL
  USING (
    public.has_role(auth.uid(), 'boss_owner'::public.app_role)
    OR public.has_role(auth.uid(), 'master'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
    OR public.has_role(auth.uid(), 'finance_manager'::public.app_role)
  );

-- ============================================================
-- 20. SOFTWARE CATALOG (public catalog, admin-managed)
-- ============================================================
DROP POLICY IF EXISTS "rls_software_catalog_public_select" ON public.software_catalog;
DROP POLICY IF EXISTS "rls_software_catalog_admin_all" ON public.software_catalog;

CREATE POLICY "rls_software_catalog_public_select"
  ON public.software_catalog FOR SELECT
  USING (true);

CREATE POLICY "rls_software_catalog_admin_all"
  ON public.software_catalog FOR ALL
  USING (
    public.has_role(auth.uid(), 'boss_owner'::public.app_role)
    OR public.has_role(auth.uid(), 'master'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- ============================================================
-- 21. GLOBAL OFFERS (public offers, admin-managed)
-- ============================================================
DROP POLICY IF EXISTS "rls_global_offers_public_select" ON public.global_offers;
DROP POLICY IF EXISTS "rls_global_offers_admin_all" ON public.global_offers;

CREATE POLICY "rls_global_offers_public_select"
  ON public.global_offers FOR SELECT
  USING (true);

CREATE POLICY "rls_global_offers_admin_all"
  ON public.global_offers FOR ALL
  USING (
    public.has_role(auth.uid(), 'boss_owner'::public.app_role)
    OR public.has_role(auth.uid(), 'master'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'marketing_manager'::public.app_role)
  );

-- ============================================================
-- 22. BUSINESS CATEGORIES (public catalog)
-- ============================================================
DROP POLICY IF EXISTS "rls_business_categories_public_select" ON public.business_categories;
DROP POLICY IF EXISTS "rls_business_categories_admin_all" ON public.business_categories;

CREATE POLICY "rls_business_categories_public_select"
  ON public.business_categories FOR SELECT
  USING (true);

CREATE POLICY "rls_business_categories_admin_all"
  ON public.business_categories FOR ALL
  USING (
    public.has_role(auth.uid(), 'boss_owner'::public.app_role)
    OR public.has_role(auth.uid(), 'master'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- ============================================================
-- 23. BUSINESS SUBCATEGORIES (public catalog)
-- ============================================================
DROP POLICY IF EXISTS "rls_business_subcategories_public_select" ON public.business_subcategories;
DROP POLICY IF EXISTS "rls_business_subcategories_admin_all" ON public.business_subcategories;

CREATE POLICY "rls_business_subcategories_public_select"
  ON public.business_subcategories FOR SELECT
  USING (true);

CREATE POLICY "rls_business_subcategories_admin_all"
  ON public.business_subcategories FOR ALL
  USING (
    public.has_role(auth.uid(), 'boss_owner'::public.app_role)
    OR public.has_role(auth.uid(), 'master'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- ============================================================
-- 24. SPORTS EVENTS (public content, admin-managed)
-- ============================================================
DROP POLICY IF EXISTS "rls_sports_events_public_select" ON public.sports_events;
DROP POLICY IF EXISTS "rls_sports_events_admin_all" ON public.sports_events;

CREATE POLICY "rls_sports_events_public_select"
  ON public.sports_events FOR SELECT
  USING (true);

CREATE POLICY "rls_sports_events_admin_all"
  ON public.sports_events FOR ALL
  USING (
    public.has_role(auth.uid(), 'boss_owner'::public.app_role)
    OR public.has_role(auth.uid(), 'master'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- ============================================================
-- 25. FESTIVAL CALENDAR (public content, admin-managed)
-- ============================================================
DROP POLICY IF EXISTS "rls_festival_calendar_public_select" ON public.festival_calendar;
DROP POLICY IF EXISTS "rls_festival_calendar_admin_all" ON public.festival_calendar;

CREATE POLICY "rls_festival_calendar_public_select"
  ON public.festival_calendar FOR SELECT
  USING (true);

CREATE POLICY "rls_festival_calendar_admin_all"
  ON public.festival_calendar FOR ALL
  USING (
    public.has_role(auth.uid(), 'boss_owner'::public.app_role)
    OR public.has_role(auth.uid(), 'master'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- ============================================================
-- 26. QUICK SUPPORT REQUESTS (personal contact data)
-- ============================================================
DROP POLICY IF EXISTS "rls_quick_support_select_own" ON public.quick_support_requests;
DROP POLICY IF EXISTS "rls_quick_support_insert" ON public.quick_support_requests;
DROP POLICY IF EXISTS "rls_quick_support_admin_all" ON public.quick_support_requests;

CREATE POLICY "rls_quick_support_select_own"
  ON public.quick_support_requests FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "rls_quick_support_insert"
  ON public.quick_support_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "rls_quick_support_admin_all"
  ON public.quick_support_requests FOR ALL
  USING (
    public.has_role(auth.uid(), 'boss_owner'::public.app_role)
    OR public.has_role(auth.uid(), 'master'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
    OR public.has_role(auth.uid(), 'support'::public.app_role)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- ============================================================
-- 27. WALLET AUDIT LOG (financial audit trail)
-- ============================================================
DROP POLICY IF EXISTS "rls_wallet_audit_log_select_own" ON public.wallet_audit_log;
DROP POLICY IF EXISTS "rls_wallet_audit_log_system_insert" ON public.wallet_audit_log;
DROP POLICY IF EXISTS "rls_wallet_audit_log_admin_all" ON public.wallet_audit_log;

CREATE POLICY "rls_wallet_audit_log_select_own"
  ON public.wallet_audit_log FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "rls_wallet_audit_log_system_insert"
  ON public.wallet_audit_log FOR INSERT
  WITH CHECK (true);

CREATE POLICY "rls_wallet_audit_log_admin_all"
  ON public.wallet_audit_log FOR ALL
  USING (
    public.has_role(auth.uid(), 'boss_owner'::public.app_role)
    OR public.has_role(auth.uid(), 'master'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
    OR public.has_role(auth.uid(), 'finance_manager'::public.app_role)
  );
