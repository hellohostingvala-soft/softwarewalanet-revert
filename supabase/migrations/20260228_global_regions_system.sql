-- ============================================================================
-- Global Multi-Region Failover & Auto-Healing System
-- MVP Foundation: Database Schema
-- ============================================================================

-- 1. GLOBAL REGIONS TABLE
-- Region registry with configuration, priorities, and failover policies
CREATE TABLE IF NOT EXISTS public.global_regions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    continent TEXT NOT NULL CHECK (continent IN ('Asia', 'EU', 'US', 'Other')),
    endpoint TEXT NOT NULL,
    priority INTEGER NOT NULL DEFAULT 100,
    weight INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    replica_of TEXT REFERENCES public.global_regions(region_code),
    compliance_zone TEXT NOT NULL DEFAULT 'GLOBAL'
        CHECK (compliance_zone IN ('GDPR', 'CCPA', 'LGPD', 'PDPA', 'POPIA', 'GLOBAL')),
    failover_policy JSONB NOT NULL DEFAULT '{}',
    latency_threshold_ms INTEGER NOT NULL DEFAULT 200,
    geo_lat NUMERIC(10, 6),
    geo_lng NUMERIC(10, 6),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. REGION HEALTH METRICS TABLE
-- Real-time health data collected every 10 seconds
CREATE TABLE IF NOT EXISTS public.region_health_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_code TEXT NOT NULL REFERENCES public.global_regions(region_code) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'healthy'
        CHECK (status IN ('healthy', 'degraded', 'offline', 'unknown')),
    latency_ms NUMERIC(10, 2) NOT NULL DEFAULT 0,
    error_rate NUMERIC(5, 4) NOT NULL DEFAULT 0,
    throughput_rps NUMERIC(10, 2) NOT NULL DEFAULT 0,
    cpu_usage NUMERIC(5, 2) NOT NULL DEFAULT 0,
    memory_usage NUMERIC(5, 2) NOT NULL DEFAULT 0,
    disk_usage NUMERIC(5, 2) NOT NULL DEFAULT 0,
    network_in_mbps NUMERIC(10, 2) NOT NULL DEFAULT 0,
    network_out_mbps NUMERIC(10, 2) NOT NULL DEFAULT 0,
    active_connections INTEGER NOT NULL DEFAULT 0,
    health_score NUMERIC(5, 2) NOT NULL DEFAULT 100,
    anomaly_detected BOOLEAN NOT NULL DEFAULT false,
    anomaly_details JSONB,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for efficient time-series queries
CREATE INDEX IF NOT EXISTS idx_region_health_metrics_region_time
    ON public.region_health_metrics(region_code, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_region_health_metrics_status
    ON public.region_health_metrics(status, recorded_at DESC);

-- 3. FAILOVER EVENTS TABLE
-- Audit trail for all failover events
CREATE TABLE IF NOT EXISTS public.failover_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_region TEXT NOT NULL REFERENCES public.global_regions(region_code),
    target_region TEXT REFERENCES public.global_regions(region_code),
    event_type TEXT NOT NULL
        CHECK (event_type IN ('failover_initiated', 'failover_completed', 'failover_failed',
                              'recovery_initiated', 'recovery_completed', 'manual_override')),
    trigger_reason TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'critical'
        CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status TEXT NOT NULL DEFAULT 'initiated'
        CHECK (status IN ('initiated', 'in_progress', 'completed', 'failed', 'rolled_back')),
    affected_tenants JSONB NOT NULL DEFAULT '[]',
    traffic_shifted_percent NUMERIC(5, 2),
    rto_achieved_seconds INTEGER,
    rpo_achieved_seconds INTEGER,
    recovery_actions JSONB NOT NULL DEFAULT '[]',
    error_details TEXT,
    initiated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    initiated_by TEXT NOT NULL DEFAULT 'system'
);

-- Index for audit queries
CREATE INDEX IF NOT EXISTS idx_failover_events_source_region
    ON public.failover_events(source_region, initiated_at DESC);
CREATE INDEX IF NOT EXISTS idx_failover_events_status
    ON public.failover_events(status, initiated_at DESC);

-- 4. DEPLOYMENT TRACKING TABLE
-- Deployment status across regions
CREATE TABLE IF NOT EXISTS public.deployment_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deployment_id TEXT NOT NULL,
    region_code TEXT NOT NULL REFERENCES public.global_regions(region_code),
    version TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'deploying', 'deployed', 'failed', 'rolled_back', 'canary')),
    replicas_desired INTEGER NOT NULL DEFAULT 1,
    replicas_ready INTEGER NOT NULL DEFAULT 0,
    health_check_status TEXT DEFAULT 'unknown'
        CHECK (health_check_status IN ('healthy', 'unhealthy', 'unknown')),
    canary_traffic_percent NUMERIC(5, 2) DEFAULT 0,
    deployment_config JSONB NOT NULL DEFAULT '{}',
    rollback_version TEXT,
    error_message TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(deployment_id, region_code)
);

-- Index for deployment status queries
CREATE INDEX IF NOT EXISTS idx_deployment_tracking_region_status
    ON public.deployment_tracking(region_code, status, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_deployment_tracking_deployment_id
    ON public.deployment_tracking(deployment_id, started_at DESC);

-- ============================================================================
-- SEED DEFAULT REGIONS
-- ============================================================================

INSERT INTO public.global_regions
    (region_code, name, continent, endpoint, priority, weight, is_active, is_primary,
     compliance_zone, latency_threshold_ms, geo_lat, geo_lng, failover_policy)
VALUES
    ('us-east-1',    'US East (Virginia)',       'US',    'us-east-1.softwarevala.io',     10, 10, true,  true,  'CCPA',   100,  37.9267,  -77.0144, '{"autoFailover": true, "threshold": 3, "cooldownSeconds": 300}'),
    ('us-west-2',    'US West (Oregon)',          'US',    'us-west-2.softwarevala.io',     20, 8,  true,  false, 'CCPA',   120,  45.8696, -119.6881, '{"autoFailover": true, "threshold": 3, "cooldownSeconds": 300}'),
    ('eu-west-1',    'EU West (Ireland)',         'EU',    'eu-west-1.softwarevala.io',     10, 10, true,  true,  'GDPR',   80,   53.3498,  -6.2603,  '{"autoFailover": true, "threshold": 3, "cooldownSeconds": 300}'),
    ('eu-central-1', 'EU Central (Frankfurt)',    'EU',    'eu-central-1.softwarevala.io',  20, 8,  true,  false, 'GDPR',   80,   50.1109,   8.6821,  '{"autoFailover": true, "threshold": 3, "cooldownSeconds": 300}'),
    ('ap-south-1',   'Asia Pacific (Mumbai)',     'Asia',  'ap-south-1.softwarevala.io',    10, 10, true,  true,  'PDPA',   120,  19.0760,  72.8777,  '{"autoFailover": true, "threshold": 3, "cooldownSeconds": 300}'),
    ('ap-southeast-1','Asia Pacific (Singapore)', 'Asia',  'ap-southeast-1.softwarevala.io', 20, 8, true, false, 'PDPA',   120,   1.3521, 103.8198,  '{"autoFailover": true, "threshold": 3, "cooldownSeconds": 300}'),
    ('ap-northeast-1','Asia Pacific (Tokyo)',     'Asia',  'ap-northeast-1.softwarevala.io', 30, 6, true, false, 'PDPA',   150,  35.6895, 139.6917,  '{"autoFailover": true, "threshold": 3, "cooldownSeconds": 300}'),
    ('me-south-1',   'Middle East (Bahrain)',     'Other', 'me-south-1.softwarevala.io',    10, 6,  true,  true,  'GLOBAL', 150,  26.0667,  50.5577,  '{"autoFailover": true, "threshold": 3, "cooldownSeconds": 300}'),
    ('sa-east-1',    'South America (São Paulo)', 'Other', 'sa-east-1.softwarevala.io',     10, 6,  true,  true,  'LGPD',   150, -23.5558, -46.6396,  '{"autoFailover": true, "threshold": 3, "cooldownSeconds": 300}'),
    ('af-south-1',   'Africa (Cape Town)',        'Other', 'af-south-1.softwarevala.io',    20, 4,  true,  false, 'POPIA',  200, -33.9249,  18.4241,  '{"autoFailover": true, "threshold": 3, "cooldownSeconds": 300}')
ON CONFLICT (region_code) DO NOTHING;

-- Update replica relationships
UPDATE public.global_regions SET replica_of = 'us-east-1'    WHERE region_code = 'us-west-2';
UPDATE public.global_regions SET replica_of = 'eu-west-1'    WHERE region_code = 'eu-central-1';
UPDATE public.global_regions SET replica_of = 'ap-south-1'   WHERE region_code = 'ap-southeast-1';
UPDATE public.global_regions SET replica_of = 'ap-south-1'   WHERE region_code = 'ap-northeast-1';
UPDATE public.global_regions SET replica_of = 'eu-west-1'    WHERE region_code = 'af-south-1';

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.global_regions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.region_health_metrics  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.failover_events        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployment_tracking    ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role full access on global_regions"
    ON public.global_regions FOR ALL
    TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on region_health_metrics"
    ON public.region_health_metrics FOR ALL
    TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on failover_events"
    ON public.failover_events FOR ALL
    TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on deployment_tracking"
    ON public.deployment_tracking FOR ALL
    TO service_role USING (true) WITH CHECK (true);

-- Allow authenticated users read access
CREATE POLICY "Authenticated users read global_regions"
    ON public.global_regions FOR SELECT
    TO authenticated USING (true);

CREATE POLICY "Authenticated users read region_health_metrics"
    ON public.region_health_metrics FOR SELECT
    TO authenticated USING (true);

CREATE POLICY "Authenticated users read failover_events"
    ON public.failover_events FOR SELECT
    TO authenticated USING (true);

CREATE POLICY "Authenticated users read deployment_tracking"
    ON public.deployment_tracking FOR SELECT
    TO authenticated USING (true);

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================

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
        SELECT 1 FROM pg_trigger
        WHERE tgname = 'trg_global_regions_updated_at'
    ) THEN
        CREATE TRIGGER trg_global_regions_updated_at
            BEFORE UPDATE ON public.global_regions
            FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgname = 'trg_deployment_tracking_updated_at'
    ) THEN
        CREATE TRIGGER trg_deployment_tracking_updated_at
            BEFORE UPDATE ON public.deployment_tracking
            FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;
