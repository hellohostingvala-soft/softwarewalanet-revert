import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  DollarSign, 
  AlertTriangle, 
  Activity,
  TrendingUp,
  TrendingDown,
  FileText,
  Server,
  Shield,
  Globe,
  BarChart3,
  Zap,
  Boxes,
  Eye,
  ArrowUpRight
} from 'lucide-react';
import { 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts';
import { Progress } from '@/components/ui/progress';
import {
  useResellerApplications,
  useFranchiseAccounts,
  useJobApplications,
  useDashboardMetrics,
  useDashboardRealtime,
} from '@/hooks/boss-panel/useDashboardData';
import { useBossDashboard } from '@/hooks/boss-panel/useBossDashboard';

// ─── 7D GLASSMORPHISM COLOR PALETTE ───────────────────────────
const GLASS = {
  // Card gradients (vivid 7D depth)
  card1: 'linear-gradient(135deg, hsla(217, 91%, 60%, 0.15) 0%, hsla(255, 92%, 76%, 0.08) 100%)',
  card2: 'linear-gradient(135deg, hsla(160, 84%, 39%, 0.15) 0%, hsla(172, 66%, 50%, 0.08) 100%)',
  card3: 'linear-gradient(135deg, hsla(38, 92%, 50%, 0.15) 0%, hsla(45, 93%, 47%, 0.08) 100%)',
  card4: 'linear-gradient(135deg, hsla(346, 77%, 49%, 0.15) 0%, hsla(330, 80%, 60%, 0.08) 100%)',
  card5: 'linear-gradient(135deg, hsla(262, 83%, 58%, 0.15) 0%, hsla(280, 87%, 65%, 0.08) 100%)',
  card6: 'linear-gradient(135deg, hsla(199, 89%, 48%, 0.15) 0%, hsla(187, 85%, 53%, 0.08) 100%)',
  // Accent colors
  blue:     'hsl(217, 91%, 60%)',
  green:    'hsl(160, 84%, 39%)',
  amber:    'hsl(38, 92%, 50%)',
  red:      'hsl(346, 77%, 49%)',
  purple:   'hsl(262, 83%, 58%)',
  cyan:     'hsl(199, 89%, 48%)',
  // Glass effect
  glassBg:  'hsla(222, 47%, 11%, 0.6)',
  glassBorder: 'hsla(215, 28%, 40%, 0.25)',
  glassHighlight: 'hsla(215, 100%, 90%, 0.06)',
  // Text
  text:     'hsl(210, 40%, 96%)',
  textMuted:'hsl(215, 20%, 65%)',
  textDim:  'hsl(215, 15%, 45%)',
  // Surfaces
  pageBg:   'hsl(222, 47%, 7%)',
  tileBg:   'hsla(222, 47%, 13%, 0.7)',
  tileBorder:'hsla(215, 28%, 30%, 0.3)',
};

// ─── ANIMATION VARIANTS ───────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: { 
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
};

const floatVariants = {
  initial: { y: 0 },
  animate: { 
    y: [-2, 2, -2],
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
  }
};

// ─── 7D GLASS KPI CARD ───────────────────────────────────────
function GlassKPICard({ 
  title, value, unit, trend, trendValue, icon: Icon, gradient, accent, delay = 0
}: { 
  title: string; value: string | number; unit?: string; trend?: 'up' | 'down' | 'neutral'; 
  trendValue?: string; icon: React.ElementType; gradient: string; accent: string; delay?: number;
}) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ 
        scale: 1.03, 
        y: -4,
        boxShadow: `0 20px 60px -10px ${accent}33, 0 0 40px -15px ${accent}22`
      }}
      whileTap={{ scale: 0.98 }}
      className="relative group cursor-pointer overflow-hidden rounded-2xl"
      style={{
        background: gradient,
        backdropFilter: 'blur(24px)',
        border: `1px solid ${GLASS.glassBorder}`,
        minHeight: '140px',
      }}
    >
      {/* Glass reflection */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: GLASS.glassHighlight }}
      />
      {/* Accent glow */}
      <div 
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-700"
        style={{ background: accent }}
      />
      {/* Floating icon */}
      <motion.div
        variants={floatVariants}
        initial="initial"
        animate="animate"
        className="absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: `${accent}20`, border: `1px solid ${accent}30` }}
      >
        <Icon className="w-5 h-5" style={{ color: accent }} />
      </motion.div>
      
      <div className="relative z-10 p-5 flex flex-col justify-between h-full">
        <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: GLASS.textMuted }}>
          {title}
        </span>
        <div className="mt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold tabular-nums tracking-tight" style={{ color: GLASS.text }}>
              {value}
            </span>
            {unit && <span className="text-sm font-medium" style={{ color: GLASS.textMuted }}>{unit}</span>}
          </div>
          {trend && trendValue && (
            <motion.div 
              className="flex items-center gap-1.5 mt-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + delay * 0.1 }}
            >
              {trend === 'up' ? (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: `${GLASS.green}20` }}>
                  <TrendingUp className="w-3 h-3" style={{ color: GLASS.green }} />
                  <span className="text-[11px] font-bold" style={{ color: GLASS.green }}>{trendValue}</span>
                </div>
              ) : trend === 'down' ? (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: `${GLASS.red}20` }}>
                  <TrendingDown className="w-3 h-3" style={{ color: GLASS.red }} />
                  <span className="text-[11px] font-bold" style={{ color: GLASS.red }}>{trendValue}</span>
                </div>
              ) : (
                <span className="text-[11px] font-medium" style={{ color: GLASS.textMuted }}>{trendValue}</span>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── GLASS STATUS BADGE ──────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    approved: { bg: `${GLASS.green}15`, text: GLASS.green, dot: GLASS.green, label: 'Approved' },
    active:   { bg: `${GLASS.green}15`, text: GLASS.green, dot: GLASS.green, label: 'Active' },
    pending:  { bg: `${GLASS.amber}15`, text: GLASS.amber, dot: GLASS.amber, label: 'Pending' },
    rejected: { bg: `${GLASS.red}15`,   text: GLASS.red,   dot: GLASS.red,   label: 'Rejected' },
  };
  const c = config[status] || config.pending;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-sm"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.text}20` }}
    >
      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: c.dot }} />
      {c.label}
    </span>
  );
}

// ─── SECTION HEADER ──────────────────────────────────────────
function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <div className="flex items-center justify-between pb-3" style={{ borderBottom: `1px solid ${GLASS.tileBorder}` }}>
      <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: GLASS.text }}>{title}</h2>
      {count !== undefined && (
        <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold" 
          style={{ background: `${GLASS.blue}20`, color: GLASS.blue, border: `1px solid ${GLASS.blue}30` }}>
          {count}
        </span>
      )}
    </div>
  );
}

// ─── GLASS PANEL ─────────────────────────────────────────────
function GlassPanel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={cardVariants}
      className={`rounded-2xl overflow-hidden ${className}`}
      style={{
        background: GLASS.tileBg,
        backdropFilter: 'blur(20px)',
        border: `1px solid ${GLASS.tileBorder}`,
        boxShadow: '0 8px 32px -8px hsla(222, 47%, 5%, 0.5)',
      }}
    >
      {children}
    </motion.div>
  );
}

// ─── MAIN DASHBOARD ──────────────────────────────────────────
export function BossDashboard() {
  const { data: resellerData, isLoading: rL } = useResellerApplications();
  const { data: franchiseData, isLoading: fL } = useFranchiseAccounts();
  const { data: jobData, isLoading: jL } = useJobApplications();
  const { data: metrics, isLoading: mL } = useDashboardMetrics();
  const { summary, systemHealth, isLoading: sL } = useBossDashboard();
  useDashboardRealtime();

  const loading = rL || fL || jL || mL || sL;
  const fmt = (n: number | undefined) => n?.toLocaleString() ?? '—';

  const revenueData = metrics?.revenueByMonth ?? Array.from({ length: 6 }, (_, i) => ({
    month: ['Jan','Feb','Mar','Apr','May','Jun'][i], revenue: 0, trend: 0
  }));

  const moduleBreakdown = systemHealth?.modules ?? [];
  const activeModules = moduleBreakdown.filter(m => m.status === 'active').length;
  const totalModules = moduleBreakdown.length || 1;

  const pipelineData = [
    { stage: 'Reseller', pending: resellerData?.pending ?? 0, approved: resellerData?.approved ?? 0, rejected: resellerData?.rejected ?? 0, color: GLASS.blue },
    { stage: 'Franchise', pending: franchiseData?.pending ?? 0, approved: franchiseData?.active ?? 0, rejected: 0, color: GLASS.purple },
    { stage: 'Jobs', pending: jobData?.pending ?? 0, approved: jobData?.approved ?? 0, rejected: jobData?.rejected ?? 0, color: GLASS.cyan },
  ];

  const recentApplications = [
    ...(resellerData?.recentApplications ?? []).map(a => ({ ...a, type: 'Reseller' })),
    ...(jobData?.recentApplications ?? []).map(a => ({ ...a, type: a.application_type, status: a.status })),
  ]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);

  return (
    <motion.div 
      className="space-y-6 p-1"
      style={{ color: GLASS.text }}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* ── HEADER ── */}
      <motion.div variants={cardVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: GLASS.text }}>
            Boss Command Center
          </h1>
          <p className="text-xs mt-1 font-medium" style={{ color: GLASS.textMuted }}>
            Enterprise Overview • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
        </div>
        <motion.div 
          className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm"
          style={{ background: `${GLASS.green}12`, border: `1px solid ${GLASS.green}25` }}
          animate={{ boxShadow: ['0 0 15px hsla(160,84%,39%,0.1)', '0 0 25px hsla(160,84%,39%,0.2)', '0 0 15px hsla(160,84%,39%,0.1)'] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: GLASS.green }} />
          <span className="text-xs font-bold" style={{ color: GLASS.green }}>System Online</span>
        </motion.div>
      </motion.div>

      {/* ── KPI CARDS (7D Glass) ── */}
      <motion.div variants={containerVariants} className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <GlassKPICard title="Total Revenue" value={`$${fmt(metrics?.totalRevenue)}`} icon={DollarSign} trend="up" trendValue="+12.4%" gradient={GLASS.card1} accent={GLASS.blue} delay={0} />
        <GlassKPICard title="Active Users" value={fmt(metrics?.activeUsers)} icon={Users} trend="up" trendValue="+8.2%" gradient={GLASS.card2} accent={GLASS.green} delay={1} />
        <GlassKPICard title="New Users (30d)" value={fmt(metrics?.newUsers)} icon={TrendingUp} trend="up" trendValue="+15%" gradient={GLASS.card3} accent={GLASS.amber} delay={2} />
        <GlassKPICard title="Reseller Apps" value={fmt(resellerData?.total)} icon={FileText} trend={resellerData?.pending ? 'up' : 'neutral'} trendValue={`${resellerData?.pending ?? 0} pending`} gradient={GLASS.card4} accent={GLASS.red} delay={3} />
        <GlassKPICard title="Franchise Accts" value={fmt(franchiseData?.total)} icon={Globe} trend="neutral" trendValue={`${franchiseData?.active ?? 0} active`} gradient={GLASS.card5} accent={GLASS.purple} delay={4} />
        <GlassKPICard title="System Health" value={`${summary?.systemHealth ?? 100}%`} icon={Activity} trend="neutral" trendValue={`${activeModules}/${totalModules} modules`} gradient={GLASS.card6} accent={GLASS.cyan} delay={5} />
      </motion.div>

      {/* ── ROW 2: Chart + Pipeline ── */}
      <motion.div variants={containerVariants} className="grid grid-cols-12 gap-4">
        {/* Revenue Chart */}
        <GlassPanel className="col-span-12 lg:col-span-8 p-6">
          <SectionHeader title="Revenue Trend" />
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="glass7dGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={GLASS.blue} stopOpacity={0.35} />
                    <stop offset="50%" stopColor={GLASS.purple} stopOpacity={0.15} />
                    <stop offset="100%" stopColor={GLASS.blue} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="glass7dStroke" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={GLASS.blue} />
                    <stop offset="100%" stopColor={GLASS.purple} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={GLASS.tileBorder} />
                <XAxis dataKey="month" stroke={GLASS.textDim} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke={GLASS.textDim} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: GLASS.glassBg,
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${GLASS.glassBorder}`,
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 8px 32px hsla(222,47%,5%,0.4)',
                    color: GLASS.text,
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="url(#glass7dStroke)" strokeWidth={3} fill="url(#glass7dGrad)" />
                <Area type="monotone" dataKey="trend" stroke={GLASS.textDim} strokeWidth={1.5} fill="none" strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        {/* Pipeline */}
        <GlassPanel className="col-span-12 lg:col-span-4 p-6">
          <SectionHeader title="Application Pipeline" />
          <div className="mt-4 space-y-5">
            {pipelineData.map((p) => {
              const total = p.pending + p.approved + p.rejected || 1;
              return (
                <motion.div key={p.stage} whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 400 }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold" style={{ color: GLASS.text }}>{p.stage}</span>
                    <span className="text-xs font-mono tabular-nums" style={{ color: GLASS.textMuted }}>
                      {p.pending + p.approved + p.rejected}
                    </span>
                  </div>
                  <div className="flex h-2.5 rounded-full overflow-hidden" style={{ background: `${GLASS.tileBorder}` }}>
                    <motion.div 
                      className="h-full rounded-l-full" 
                      style={{ background: GLASS.green }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(p.approved / total) * 100}%` }}
                      transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                    />
                    <motion.div 
                      className="h-full" 
                      style={{ background: GLASS.amber }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(p.pending / total) * 100}%` }}
                      transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                    />
                    {p.rejected > 0 && (
                      <motion.div 
                        className="h-full rounded-r-full" 
                        style={{ background: GLASS.red }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(p.rejected / total) * 100}%` }}
                        transition={{ duration: 1, delay: 0.7, ease: 'easeOut' }}
                      />
                    )}
                  </div>
                  <div className="flex gap-4 mt-1.5">
                    <span className="text-[10px] font-semibold" style={{ color: GLASS.green }}>✓ {p.approved}</span>
                    <span className="text-[10px] font-semibold" style={{ color: GLASS.amber }}>⏳ {p.pending}</span>
                    {p.rejected > 0 && <span className="text-[10px] font-semibold" style={{ color: GLASS.red }}>✕ {p.rejected}</span>}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* System Modules */}
          <div className="mt-6 pt-4" style={{ borderTop: `1px solid ${GLASS.tileBorder}` }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold" style={{ color: GLASS.text }}>System Modules</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${GLASS.green}15`, color: GLASS.green }}>
                {activeModules}/{totalModules}
              </span>
            </div>
            <div className="relative h-2 rounded-full overflow-hidden" style={{ background: GLASS.tileBorder }}>
              <motion.div 
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: `linear-gradient(90deg, ${GLASS.green}, ${GLASS.cyan})` }}
                initial={{ width: 0 }}
                animate={{ width: `${(activeModules / totalModules) * 100}%` }}
                transition={{ duration: 1.5, delay: 0.4, ease: 'easeOut' }}
              />
            </div>
            {moduleBreakdown.length > 0 && (
              <div className="mt-3 max-h-28 overflow-y-auto space-y-1.5">
                {moduleBreakdown.slice(0, 6).map((m, i) => (
                  <motion.div 
                    key={m.name} 
                    className="flex items-center justify-between text-[11px] py-1 px-2 rounded-lg hover:bg-white/5 transition-colors"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * 0.05 }}
                  >
                    <span style={{ color: GLASS.text }}>{m.name}</span>
                    <StatusBadge status={m.status === 'active' ? 'approved' : m.status === 'maintenance' ? 'pending' : 'rejected'} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </GlassPanel>
      </motion.div>

      {/* ── ROW 3: Table + Quick Stats ── */}
      <motion.div variants={containerVariants} className="grid grid-cols-12 gap-4">
        {/* Applications Table */}
        <GlassPanel className="col-span-12 lg:col-span-8">
          <div className="px-6 pt-5 pb-3">
            <SectionHeader title="Recent Applications" count={recentApplications.length} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: 'hsla(222, 47%, 15%, 0.5)' }}>
                  {['Name', 'Type', 'Date', 'Status'].map(h => (
                    <th key={h} className="text-left px-6 py-3 font-bold uppercase tracking-wider" 
                      style={{ color: GLASS.textMuted, borderBottom: `1px solid ${GLASS.tileBorder}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentApplications.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-10" style={{ color: GLASS.textDim }}>No applications found</td>
                  </tr>
                ) : (
                  recentApplications.map((app, i) => (
                    <motion.tr
                      key={app.id}
                      className="group cursor-pointer transition-colors"
                      style={{ borderBottom: `1px solid ${GLASS.tileBorder}` }}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.04 }}
                      whileHover={{ backgroundColor: 'hsla(215, 100%, 60%, 0.05)' }}
                    >
                      <td className="px-6 py-3.5 font-semibold" style={{ color: GLASS.text }}>{app.full_name}</td>
                      <td className="px-6 py-3.5" style={{ color: GLASS.textMuted }}>{app.type}</td>
                      <td className="px-6 py-3.5 tabular-nums font-mono" style={{ color: GLASS.textMuted }}>
                        {new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-3.5"><StatusBadge status={app.status} /></td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </GlassPanel>

        {/* Quick Stat Cards */}
        <motion.div variants={containerVariants} className="col-span-12 lg:col-span-4 space-y-4">
          {/* Alerts */}
          <motion.div
            variants={cardVariants}
            whileHover={{ scale: 1.02, y: -2 }}
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{
              background: (summary?.criticalAlerts ?? 0) > 0 ? GLASS.card4 : GLASS.card2,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${(summary?.criticalAlerts ?? 0) > 0 ? `${GLASS.red}30` : `${GLASS.green}30`}`,
            }}
          >
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-20"
              style={{ background: (summary?.criticalAlerts ?? 0) > 0 ? GLASS.red : GLASS.green }} />
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: GLASS.textMuted }}>Critical Alerts</span>
                <AlertTriangle className="w-4 h-4" style={{ color: (summary?.criticalAlerts ?? 0) > 0 ? GLASS.red : GLASS.textDim }} />
              </div>
              <p className="text-4xl font-black mt-3 tabular-nums" style={{ color: (summary?.criticalAlerts ?? 0) > 0 ? GLASS.red : GLASS.text }}>
                {summary?.criticalAlerts ?? 0}
              </p>
              <p className="text-[11px] mt-1 font-medium" style={{ color: GLASS.textMuted }}>
                {(summary?.criticalAlerts ?? 0) === 0 ? 'All systems nominal' : 'Requires attention'}
              </p>
            </div>
          </motion.div>

          {/* Super Admins */}
          <motion.div
            variants={cardVariants}
            whileHover={{ scale: 1.02, y: -2 }}
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{
              background: GLASS.card5,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${GLASS.purple}30`,
            }}
          >
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-20" style={{ background: GLASS.purple }} />
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: GLASS.textMuted }}>Super Admins</span>
                <Shield className="w-4 h-4" style={{ color: GLASS.purple }} />
              </div>
              <p className="text-4xl font-black mt-3 tabular-nums" style={{ color: GLASS.text }}>{summary?.totalSuperAdmins ?? 0}</p>
              <p className="text-[11px] mt-1 font-medium" style={{ color: GLASS.textMuted }}>Active administrators</p>
            </div>
          </motion.div>

          {/* Revenue Summary */}
          <motion.div
            variants={cardVariants}
            whileHover={{ scale: 1.02, y: -2 }}
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{
              background: GLASS.card1,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${GLASS.blue}30`,
            }}
          >
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-20" style={{ background: GLASS.blue }} />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: GLASS.textMuted }}>Revenue Summary</span>
                <BarChart3 className="w-4 h-4" style={{ color: GLASS.blue }} />
              </div>
              <div className="space-y-2.5">
                {[
                  { label: 'Total Earned', value: `$${fmt(metrics?.totalRevenue)}`, color: GLASS.green },
                  { label: 'Pending', value: String((resellerData?.pending ?? 0) + (jobData?.pending ?? 0)), color: GLASS.amber },
                  { label: 'Approved', value: String((resellerData?.approved ?? 0) + (jobData?.approved ?? 0)), color: GLASS.green },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center">
                    <span className="text-[11px] font-medium" style={{ color: GLASS.textMuted }}>{item.label}</span>
                    <span className="text-sm font-extrabold tabular-nums" style={{ color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Operations */}
          <motion.div
            variants={cardVariants}
            whileHover={{ scale: 1.02, y: -2 }}
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{
              background: GLASS.card6,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${GLASS.cyan}30`,
            }}
          >
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-20" style={{ background: GLASS.cyan }} />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: GLASS.textMuted }}>Operations</span>
                <Zap className="w-4 h-4" style={{ color: GLASS.cyan }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <motion.div 
                  className="text-center p-3 rounded-xl" 
                  style={{ background: 'hsla(222, 47%, 11%, 0.5)', border: `1px solid ${GLASS.tileBorder}` }}
                  whileHover={{ scale: 1.05 }}
                >
                  <p className="text-2xl font-black tabular-nums" style={{ color: GLASS.text }}>{summary?.activeContinents ?? 0}</p>
                  <p className="text-[10px] uppercase font-bold tracking-wider mt-1" style={{ color: GLASS.textMuted }}>Continents</p>
                </motion.div>
                <motion.div 
                  className="text-center p-3 rounded-xl" 
                  style={{ background: 'hsla(222, 47%, 11%, 0.5)', border: `1px solid ${GLASS.tileBorder}` }}
                  whileHover={{ scale: 1.05 }}
                >
                  <p className="text-2xl font-black tabular-nums" style={{ color: GLASS.text }}>{summary?.countriesLive ?? 0}</p>
                  <p className="text-[10px] uppercase font-bold tracking-wider mt-1" style={{ color: GLASS.textMuted }}>Countries</p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
