# Software Vala - Production Rollout Plan

## Overview

This document defines the production deployment plan following successful staging validation (7-day period).

**Production URL:** `https://softwarewala.net`  
**Deployment Tool:** Vercel  
**Database:** Supabase production project  
**Strategy:** Progressive rollout — 10% → 50% → 100%

---

## Pre-Rollout Checklist

Before initiating any production deployment, confirm each item below is complete:

- [ ] All staging test suites passed (`docs/STAGING_VALIDATION.md`)
- [ ] Performance benchmarks met (< 200ms for all operations)
- [ ] Security audit passed (zero critical/high findings)
- [ ] Rollback tag created: `stable-2026-02-28`
- [ ] Monitoring & alerting configured and verified
- [ ] Stakeholder approval obtained
- [ ] Maintenance window scheduled and communicated
- [ ] On-call engineer assigned for rollout window

---

## Rollout Strategy

### Step 1: Tag Stable Baseline

Before any changes reach production, tag the current production state:

```bash
git checkout main
git pull origin main
git tag -a stable-2026-02-28 -m "Stable baseline before PR rollout 2026-02-28"
git push origin stable-2026-02-28
```

### Step 2: Progressive Rollout

| Phase | Traffic | Duration | Go/No-Go Criteria |
|-------|---------|----------|-------------------|
| Canary (10%) | 10% of users | 1 hour | Error rate < 0.1%, p95 latency < 300ms |
| Partial (50%) | 50% of users | 2 hours | Error rate < 0.1%, p95 latency < 300ms |
| Full (100%) | All users | Ongoing | Error rate < 0.1%, p95 latency < 200ms |

Configure traffic splitting in `vercel.json` or via the Vercel dashboard.

### Step 3: Monitor Each Phase

During each phase, watch the following dashboards:

- **Sentry:** Zero new critical errors
- **DataDog:** API p95 latency and throughput
- **Supabase:** Database query performance and connection count
- **Activity Log Monitor:** Log write success rate ≥ 99.9%

---

## Deployment Steps

### 1. Create Production PR

```bash
git checkout main
git pull origin main
git merge --no-ff staging
git push origin main
```

The existing `deploy.yml` workflow will automatically deploy to Vercel production on push to `main`.

### 2. Verify Production Deployment

```bash
# Confirm deployment URL is live
curl -o /dev/null -s -w "%{http_code}" https://softwarewala.net
# Expected: 200
```

### 3. Run Post-Deploy Smoke Tests

- [ ] Homepage loads in < 3s
- [ ] Login flow functional
- [ ] Role-based navigation renders correctly
- [ ] Boss Dashboard real-time feed active
- [ ] AIRA assistant responds (boss_owner only)
- [ ] Activity log captures first post-deploy action
- [ ] No JavaScript console errors on main pages

---

## Rollback Procedures

### Immediate Rollback (< 5 minutes)

If critical issues are detected during or after deployment:

```bash
# 1. Revert main branch to stable tag
git checkout main
git revert HEAD --no-edit
git push origin main
# The deploy.yml workflow re-deploys automatically

# OR: Hard reset to stable tag (force push required — coordinate with team)
# git reset --hard stable-2026-02-28
# git push --force-with-lease origin main
```

### Database Rollback

If schema migrations need to be reverted:

```bash
# Using Supabase CLI — revert the last migration
supabase db reset --linked

# Or target a specific migration
supabase migration repair --status reverted <migration_timestamp>
```

**Zero data loss guarantee:** All rollback procedures are tested in staging before production rollout.

---

## PR-Specific Rollback Procedures

| PR | Component | Rollback Action |
|----|-----------|-----------------|
| PR #1 (Activity Logging) | `system_activity_log` writes | Disable log triggers via feature flag |
| PR #2 (AI Integration) | OpenAI / ElevenLabs calls | Set `VITE_AI_ENABLED=false` env var |
| PR #3 (AIRA Security) | AIRA endpoints | Disable AIRA route in API gateway |
| PR #4 (RLS Security) | Row Level Security policies | Re-apply previous migration snapshot |

---

## Monitoring & Alerting

See `monitoring/staging-alerts.yaml` for full alert definitions.

### Key Production Alerts

| Alert | Condition | Action |
|-------|-----------|--------|
| High error rate | Error rate > 1% for 5 min | Page on-call engineer; consider rollback |
| Latency spike | p95 > 500ms for 5 min | Investigate DB queries; scale if needed |
| Activity log failure | Write failure rate > 0.1% | Check DB connection; alert DBA |
| RLS policy error | Any RLS-denied request logged | Security team review within 15 min |
| AIRA unauthorized access | Non-owner AIRA attempt | Immediate security alert |

---

## Post-Rollout Verification (T+24h)

After 24 hours at 100% traffic, confirm:

- [ ] Error rate < 0.1% sustained
- [ ] No new Sentry issues introduced by the PRs
- [ ] Activity log completeness ≥ 99.9%
- [ ] RLS policies have not blocked any legitimate requests
- [ ] AIRA available and responding for `boss_owner` users
- [ ] Database performance stable (no query regressions)
- [ ] All 131 modules logging correctly

---

## Timeline Summary

| Day | Activity |
|-----|----------|
| Day 1–7 | Staging validation (see `STAGING_VALIDATION.md`) |
| Day 8 | Final stakeholder review & approval |
| Day 8 | Tag stable baseline, schedule maintenance window |
| Day 9 | Canary rollout (10%) — 1 hour observation |
| Day 9 | Partial rollout (50%) — 2 hour observation |
| Day 9 | Full rollout (100%) |
| Day 10 | Post-rollout 24h verification |
| Day 11+ | Monitoring & incident response as usual |

---

## Contact & Escalation

| Role | Responsibility | Escalation |
|------|---------------|------------|
| DevOps Engineer | Deployment execution | On-call pager |
| Backend Lead | Activity logging & DB | Slack #backend |
| Security Lead | RLS & AIRA security | Slack #security |
| AI Lead | OpenAI / ElevenLabs integration | Slack #ai-team |
| Product Owner | Stakeholder sign-off | Direct message |
