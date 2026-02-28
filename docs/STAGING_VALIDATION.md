# Software Vala - Staging Validation Procedures

## Overview

This document defines the end-to-end testing procedures for the staging environment used to validate all 4 PRs before production rollout.

**Staging URL:** `https://staging.softwarewala.net`  
**Database:** Separate Supabase staging project  
**Deployment:** Vercel staging environment  
**Validation Duration:** 7 days continuous testing

---

## Phase 1: Initial Deployment (Day 1)

### 1.1 Create Staging Branch

```bash
git checkout main
git pull origin main
git checkout -b staging
# Merge all 4 PRs
git merge --no-ff <pr1-branch>
git merge --no-ff <pr2-branch>
git merge --no-ff <pr3-branch>
git merge --no-ff <pr4-branch>
git push origin staging
# Tag the staging release
git tag -a staging-deploy-2026-02-28 -m "Staging deployment 2026-02-28"
git push origin staging-deploy-2026-02-28
```

### 1.2 Smoke Test Checklist

- [ ] Staging URL accessible and loads correctly
- [ ] Authentication flow functional (login/logout)
- [ ] Role-based navigation renders for each role
- [ ] No JavaScript console errors on main pages
- [ ] Supabase staging project connected

---

## Test Suite 1: Activity Logging (PR #1)

**Owner:** DevOps / Backend Team  
**Target Days:** Day 1–2

| Test Case | Description | Expected Result | Status |
|-----------|-------------|-----------------|--------|
| AL-01 | All 131 modules write to `system_activity_log` | Every user action logged with module, action, user_id, timestamp | ☐ |
| AL-02 | Boss Dashboard real-time subscription | New activity appears in < 100ms on Boss Dashboard | ☐ |
| AL-03 | Activity stream performance | End-to-end latency < 100ms under normal load | ☐ |
| AL-04 | Audit trail completeness | No gaps in log sequence for a test user session | ☐ |
| AL-05 | Rollback capability | Reverting a transaction updates `system_activity_log` with rollback event | ☐ |
| AL-06 | Concurrent writes | 100 simultaneous actions all logged without data loss | ☐ |
| AL-07 | Log immutability | Existing log entries cannot be updated or deleted by non-admin users | ☐ |

### Validation Steps

```sql
-- Verify log entries are created for every module action
SELECT module, COUNT(*) as action_count
FROM system_activity_log
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY module
ORDER BY module;

-- Check for latency: compare event timestamp vs log timestamp
SELECT AVG(EXTRACT(EPOCH FROM (logged_at - event_at)) * 1000) AS avg_latency_ms
FROM system_activity_log
WHERE created_at > NOW() - INTERVAL '1 hour';
```

---

## Test Suite 2: Lovable Removal + AI Integration (PR #2)

**Owner:** Frontend / AI Team  
**Target Days:** Day 2–3

| Test Case | Description | Expected Result | Status |
|-----------|-------------|-----------------|--------|
| AI-01 | Lovable runtime dependencies removed | `package.json` has no Lovable runtime deps | ☐ |
| AI-02 | OpenAI integration (gpt-4o-mini) | AI responses generated successfully via gpt-4o-mini | ☐ |
| AI-03 | ElevenLabs TTS — Rachel voice | Audio playback using Rachel voice profile works | ☐ |
| AI-04 | GitHub App webhook | Webhook receives and processes GitHub events correctly | ☐ |
| AI-05 | Marketplace sync automation | Product listings sync automatically on trigger | ☐ |
| AI-06 | AIRA assistant service layer | AIRA responds to valid commands and rejects invalid ones | ☐ |
| AI-07 | Fallback when OpenAI unavailable | Graceful error message displayed; no crash | ☐ |

### Validation Steps

```bash
# Confirm no Lovable runtime dependency
node -e "
  const p = require('./package.json');
  const runtime = Object.keys(p.dependencies || {});
  const lovable = runtime.filter(d => d.toLowerCase().includes('lovable'));
  console.log('Lovable runtime deps:', lovable.length === 0 ? 'NONE ✅' : lovable.join(', ') + ' ❌');
"
```

---

## Test Suite 3: AIRA Security Hardening (PR #3)

**Owner:** Security Team  
**Target Days:** Day 3–4

| Test Case | Description | Expected Result | Status |
|-----------|-------------|-----------------|--------|
| AS-01 | Owner-only enforcement | Only `boss_owner` role can issue AIRA commands | ☐ |
| AS-02 | Non-owner access blocked | Any other role receives `403 Forbidden` on AIRA endpoints | ☐ |
| AS-03 | Command logging to `aira_logs` | Every AIRA command (success or failure) logged with user, command, timestamp | ☐ |
| AS-04 | ElevenLabs voice output toggle | Voice output can be enabled/disabled per session | ☐ |
| AS-05 | Failsafe mode | When OpenAI/ElevenLabs APIs are unavailable, AIRA enters failsafe gracefully | ☐ |
| AS-06 | Error recovery | After API error, AIRA resumes normal operation on next request | ☐ |
| AS-07 | Injection prevention | Prompt injection attempts are sanitised and logged | ☐ |

### Validation Steps

```sql
-- Verify all AIRA commands are logged
SELECT user_id, command, status, created_at
FROM aira_logs
ORDER BY created_at DESC
LIMIT 20;

-- Verify only boss_owner role can trigger commands
SELECT role, COUNT(*) as attempt_count
FROM aira_logs
GROUP BY role;
```

---

## Test Suite 4: RLS Security (PR #4)

**Owner:** Security / Database Team  
**Target Days:** Day 3–4

| Test Case | Description | Expected Result | Status |
|-----------|-------------|-----------------|--------|
| RLS-01 | All 27 tables have RLS enabled | `SELECT relname FROM pg_class WHERE relrowsecurity = true` returns all 27 | ☐ |
| RLS-02 | Role-based access policies | Each role can only access rows permitted by their policy | ☐ |
| RLS-03 | Personal data restricted | Users can only read/write their own personal records | ☐ |
| RLS-04 | Admin override policies | Admins and super-admins can access all rows as expected | ☐ |
| RLS-05 | Audit logging for privileged access | Admin data access events are recorded in audit log | ☐ |
| RLS-06 | Cross-user data leak test | User A cannot read User B's private data | ☐ |
| RLS-07 | Policy regression | Existing features still function correctly with RLS active | ☐ |

### Validation Steps

```sql
-- Verify RLS is enabled on all 27 tables
SELECT relname AS table_name, relrowsecurity AS rls_enabled
FROM pg_class
JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
WHERE pg_namespace.nspname = 'public'
  AND pg_class.relkind = 'r'
ORDER BY relname;

-- List all RLS policies
SELECT schemaname, tablename, policyname, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

---

## Phase 3: Integration Testing (Day 4–5)

| Test Case | Description | Expected Result | Status |
|-----------|-------------|-----------------|--------|
| INT-01 | Cross-module activity logging | Actions across 3+ modules all appear in `system_activity_log` | ☐ |
| INT-02 | AI command with logging | AIRA command execution triggers both `aira_logs` and `system_activity_log` entries | ☐ |
| INT-03 | RLS with existing features | All CRUD operations across modules work correctly with RLS active | ☐ |
| INT-04 | Performance under integration | All operations complete in < 200ms with all 4 PRs active | ☐ |
| INT-05 | Database query optimization | No N+1 queries; explain-analyze confirms index usage | ☐ |

---

## Phase 4: Security Validation (Day 4–5)

| Test Case | Description | Expected Result | Status |
|-----------|-------------|-----------------|--------|
| SEC-01 | No data exposure vulnerabilities | Penetration test returns zero critical/high findings | ☐ |
| SEC-02 | RLS prevents unauthorized access | Direct database queries from non-admin role return 0 rows for restricted tables | ☐ |
| SEC-03 | AIRA owner-only enforced end-to-end | Non-owner JWT tokens rejected at API gateway level | ☐ |
| SEC-04 | Audit logs immutable | `UPDATE`/`DELETE` on log tables returns `ERROR: permission denied` for non-admins | ☐ |
| SEC-05 | Rate limiting functional | > 100 requests/min triggers rate limit response (429) | ☐ |

---

## Phase 5: Performance Testing (Day 5–6)

| Benchmark | Target | Tool | Status |
|-----------|--------|------|--------|
| Concurrent users | 1 000 | K6 | ☐ |
| Activity logging throughput | 10 000 events/min | K6 | ☐ |
| Boss Dashboard latency | < 100ms | Lighthouse / K6 | ☐ |
| AIRA command execution | < 5s | Manual / K6 | ☐ |
| Database query performance | No regressions vs baseline | pg_stat_statements | ☐ |

### Running K6 Load Tests

```bash
k6 run tests/load/k6-load-test.js \
  --out json=reports/staging-load-results.json \
  -e API_URL=https://staging.softwarewala.net/api
```

---

## Phase 6: Regression Testing (Day 5–6)

| Test Case | Description | Expected Result | Status |
|-----------|-------------|-----------------|--------|
| REG-01 | All existing features functional | Every feature in QA_TEST_CASES.md passes | ☐ |
| REG-02 | No broken routes | All application routes return 200 or expected redirect | ☐ |
| REG-03 | UI consistency maintained | Visual snapshots match baseline screenshots | ☐ |
| REG-04 | Mobile responsiveness intact | App renders correctly on 375px, 768px, 1280px viewports | ☐ |
| REG-05 | Browser compatibility | Chrome, Firefox, Safari — no rendering or JS errors | ☐ |

---

## Phase 7: Production Readiness Checklist (Day 7)

- [ ] All test suites passing (Suites 1–4 above)
- [ ] Performance benchmarks met (Phase 5)
- [ ] Security audit passed (Phase 4)
- [ ] Documentation updated (`PRODUCTION_ROLLOUT.md` reviewed)
- [ ] Rollback plan verified (stable tag created)
- [ ] Monitoring & alerting configured (`monitoring/staging-alerts.yaml` active)
- [ ] Stakeholder approval obtained

---

## Rollback Procedures

If any critical issue is found during staging validation:

```bash
# Tag current main as stable before any rollout
git tag -a stable-2026-02-28 -m "Stable baseline before staging PRs"
git push origin stable-2026-02-28

# To rollback staging branch to the stable tag
git checkout staging
git reset --hard stable-2026-02-28
git push --force-with-lease origin staging
```

**Zero data loss:** Staging uses an isolated Supabase project — production data is never affected.

---

## Monitoring During Validation

| Tool | What It Monitors | Alert Threshold |
|------|-----------------|-----------------|
| Sentry | Runtime errors | Any new error |
| DataDog | API latency, throughput | p95 > 500ms |
| Supabase Dashboard | DB query performance, RLS errors | Query time > 200ms |
| Activity Log Monitor | Log write failures | Any write failure |
| Security Alerts | Unauthorized access attempts | Any attempt |

See `monitoring/staging-alerts.yaml` for full alert configuration.
