// Revenue Intelligence Service
// cohort LTV, CAC, churn
// product-wise margin heatmap
// dynamic commission optimizer (AI)

type CohortPeriod = 'day' | 'week' | 'month' | 'quarter';
type ChurnReason = 'price' | 'product' | 'support' | 'competition' | 'inactivity';

interface CohortData {
  cohortId: string;
  period: CohortPeriod;
  startDate: number;
  endDate: number;
  userCount: number;
  revenue: number;
  ltv: number;
  cac: number;
  ltvCacRatio: number;
  churnRate: number;
  retentionRate: number;
}

interface MarginData {
  productId: string;
  productName: string;
  revenue: number;
  cost: number;
  margin: number;
  marginPercentage: number;
  region: string;
  period: string;
}

interface MarginHeatmap {
  productId: string;
  productName: string;
  regions: {
    region: string;
    margin: number;
    volume: number;
  }[];
}

interface ChurnAnalysis {
  userId: string;
  churnedAt: number;
  reason: ChurnReason;
  ltvAtChurn: number;
  tenureDays: number;
  lastPurchaseAmount: number;
}

interface CommissionOptimization {
  productId: string;
  currentCommissionRate: number;
  recommendedRate: number;
  expectedRevenueIncrease: number;
  confidence: number; // 0-100
  factors: {
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    weight: number;
  }[];
}

class RevenueIntelligenceService {
  private cohorts: Map<string, CohortData>;
  private margins: Map<string, MarginData>;
  private marginHeatmaps: Map<string, MarginHeatmap>;
  private churnAnalyses: Map<string, ChurnAnalysis>;
  private commissionOptimizations: Map<string, CommissionOptimization>;

  constructor() {
    this.cohorts = new Map();
    this.margins = new Map();
    this.marginHeatmaps = new Map();
    this.churnAnalyses = new Map();
    this.commissionOptimizations = new Map();
  }

  /**
   * Create cohort
   */
  createCohort(
    period: CohortPeriod,
    startDate: number,
    endDate: number,
    userCount: number,
    revenue: number,
    cac: number
  ): CohortData {
    const cohortId = `cohort_${Date.now()}_${period}`;
    const ltv = userCount > 0 ? revenue / userCount : 0;
    const ltvCacRatio = cac > 0 ? ltv / cac : 0;

    const cohort: CohortData = {
      cohortId,
      period,
      startDate,
      endDate,
      userCount,
      revenue,
      ltv,
      cac,
      ltvCacRatio,
      churnRate: 0, // Will be calculated separately
      retentionRate: 100,
    };

    this.cohorts.set(cohortId, cohort);
    console.log(`[RevenueIntelligence] Created cohort ${cohortId}`);
    return cohort;
  }

  /**
   * Calculate churn rate for cohort
   */
  calculateChurnRate(cohortId: string, churnedUsers: number): CohortData {
    const cohort = this.cohorts.get(cohortId);
    if (!cohort) {
      throw new Error('Cohort not found');
    }

    cohort.churnRate = cohort.userCount > 0 ? (churnedUsers / cohort.userCount) * 100 : 0;
    cohort.retentionRate = 100 - cohort.churnRate;
    this.cohorts.set(cohortId, cohort);

    console.log(`[RevenueIntelligence] Calculated churn rate for cohort ${cohortId}: ${cohort.churnRate}%`);
    return cohort;
  }

  /**
   * Get cohort data by period
   */
  getCohortsByPeriod(period: CohortPeriod): CohortData[] {
    return Array.from(this.cohorts.values()).filter(c => c.period === period);
  }

  /**
   * Calculate LTV trend
   */
  calculateLTVTrend(tenantId: string, periods: number = 12): {
    trend: 'increasing' | 'decreasing' | 'stable';
    averageLTV: number;
    growthRate: number;
  } {
    const cohorts = Array.from(this.cohorts.values())
      .filter(c => c.period === 'month')
      .slice(-periods);

    if (cohorts.length < 2) {
      return { trend: 'stable', averageLTV: 0, growthRate: 0 };
    }

    const ltvValues = cohorts.map(c => c.ltv);
    const averageLTV = ltvValues.reduce((sum, ltv) => sum + ltv, 0) / ltvValues.length;
    const firstLTV = ltvValues[0];
    const lastLTV = ltvValues[ltvValues.length - 1];
    const growthRate = firstLTV > 0 ? ((lastLTV - firstLTV) / firstLTV) * 100 : 0;

    let trend: 'increasing' | 'decreasing' | 'stable';
    if (growthRate > 5) {
      trend = 'increasing';
    } else if (growthRate < -5) {
      trend = 'decreasing';
    } else {
      trend = 'stable';
    }

    return { trend, averageLTV, growthRate };
  }

  /**
   * Record margin data
   */
  recordMargin(
    productId: string,
    productName: string,
    revenue: number,
    cost: number,
    region: string,
    period: string
  ): MarginData {
    const margin = revenue - cost;
    const marginPercentage = revenue > 0 ? (margin / revenue) * 100 : 0;

    const marginData: MarginData = {
      productId,
      productName,
      revenue,
      cost,
      margin,
      marginPercentage,
      region,
      period,
    };

    const key = `${productId}_${region}_${period}`;
    this.margins.set(key, marginData);

    console.log(`[RevenueIntelligence] Recorded margin for ${productName} in ${region}: ${marginPercentage}%`);
    return marginData;
  }

  /**
   * Generate margin heatmap
   */
  generateMarginHeatmap(productId: string, productName: string): MarginHeatmap {
    const productMargins = Array.from(this.margins.values()).filter(m => m.productId === productId);
    const regionMap: Map<string, { margin: number; volume: number }> = new Map();

    for (const margin of productMargins) {
      const existing = regionMap.get(margin.region) || { margin: 0, volume: 0 };
      existing.margin += margin.margin;
      existing.volume += margin.revenue;
      regionMap.set(margin.region, existing);
    }

    const heatmap: MarginHeatmap = {
      productId,
      productName,
      regions: Array.from(regionMap.entries()).map(([region, data]) => ({
        region,
        margin: data.margin / (productMargins.filter(m => m.region === region).length || 1),
        volume: data.volume,
      })),
    };

    this.marginHeatmaps.set(productId, heatmap);
    return heatmap;
  }

  /**
   * Get all margin heatmaps
   */
  getAllMarginHeatmaps(): MarginHeatmap[] {
    return Array.from(this.marginHeatmaps.values());
  }

  /**
   * Record churn analysis
   */
  recordChurnAnalysis(
    userId: string,
    reason: ChurnReason,
    ltvAtChurn: number,
    tenureDays: number,
    lastPurchaseAmount: number
  ): ChurnAnalysis {
    const analysis: ChurnAnalysis = {
      userId,
      churnedAt: Date.now(),
      reason,
      ltvAtChurn,
      tenureDays,
      lastPurchaseAmount,
    };

    this.churnAnalyses.set(userId, analysis);

    console.log(`[RevenueIntelligence] Recorded churn analysis for user ${userId}: ${reason}`);
    return analysis;
  }

  /**
   * Get churn statistics
   */
  getChurnStatistics(startDate?: number, endDate?: number): {
    totalChurns: number;
    byReason: Record<ChurnReason, number>;
    averageLTVAtChurn: number;
    averageTenureDays: number;
  } {
    let analyses = Array.from(this.churnAnalyses.values());

    if (startDate) {
      analyses = analyses.filter(a => a.churnedAt >= startDate);
    }

    if (endDate) {
      analyses = analyses.filter(a => a.churnedAt <= endDate);
    }

    const byReason: Record<ChurnReason, number> = {
      price: 0,
      product: 0,
      support: 0,
      competition: 0,
      inactivity: 0,
    };

    for (const analysis of analyses) {
      byReason[analysis.reason]++;
    }

    const averageLTVAtChurn = analyses.length > 0
      ? analyses.reduce((sum, a) => sum + a.ltvAtChurn, 0) / analyses.length
      : 0;

    const averageTenureDays = analyses.length > 0
      ? analyses.reduce((sum, a) => sum + a.tenureDays, 0) / analyses.length
      : 0;

    return {
      totalChurns: analyses.length,
      byReason,
      averageLTVAtChurn,
      averageTenureDays,
    };
  }

  /**
   * Optimize commission rate using AI
   */
  optimizeCommission(
    productId: string,
    productName: string,
    currentRate: number,
    historicalData: {
      salesVolume: number;
      conversionRate: number;
      competitorRate: number;
      marketDemand: number;
    }
  ): CommissionOptimization {
    // AI-based commission optimization (simplified)
    const factors = [];

    // Factor 1: Sales volume impact
    if (historicalData.salesVolume > 1000) {
      factors.push({ factor: 'high_sales_volume', impact: 'positive', weight: 0.3 });
    } else {
      factors.push({ factor: 'low_sales_volume', impact: 'negative', weight: 0.2 });
    }

    // Factor 2: Conversion rate
    if (historicalData.conversionRate > 5) {
      factors.push({ factor: 'high_conversion', impact: 'positive', weight: 0.25 });
    } else {
      factors.push({ factor: 'low_conversion', impact: 'negative', weight: 0.15 });
    }

    // Factor 3: Competitive pressure
    if (historicalData.competitorRate > currentRate) {
      factors.push({ factor: 'competitor_advantage', impact: 'negative', weight: 0.2 });
    } else {
      factors.push({ factor: 'competitive_advantage', impact: 'positive', weight: 0.1 });
    }

    // Factor 4: Market demand
    if (historicalData.marketDemand > 0.7) {
      factors.push({ factor: 'high_demand', impact: 'positive', weight: 0.25 });
    }

    // Calculate recommended rate
    let adjustment = 0;
    for (const factor of factors) {
      if (factor.impact === 'positive') {
        adjustment += factor.weight * 2; // Increase by up to 2%
      } else if (factor.impact === 'negative') {
        adjustment -= factor.weight * 1.5; // Decrease by up to 1.5%
      }
    }

    const recommendedRate = Math.max(5, Math.min(30, currentRate + adjustment));
    const confidence = Math.min(100, factors.length * 20);
    const expectedRevenueIncrease = (recommendedRate - currentRate) / currentRate * 10; // Simplified calculation

    const optimization: CommissionOptimization = {
      productId,
      currentCommissionRate: currentRate,
      recommendedRate,
      expectedRevenueIncrease,
      confidence,
      factors,
    };

    this.commissionOptimizations.set(productId, optimization);

    console.log(`[RevenueIntelligence] Optimized commission for ${productName}: ${currentRate}% → ${recommendedRate}%`);
    return optimization;
  }

  /**
   * Get commission optimization
   */
  getCommissionOptimization(productId: string): CommissionOptimization | null {
    return this.commissionOptimizations.get(productId) || null;
  }

  /**
   * Get revenue intelligence summary
   */
  getRevenueSummary(tenantId: string): {
    totalRevenue: number;
    totalLTV: number;
    totalCAC: number;
    averageLTVCACRatio: number;
    overallChurnRate: number;
    topMarginProducts: { productId: string; productName: string; margin: number }[];
  } {
    const cohorts = Array.from(this.cohorts.values());
    const margins = Array.from(this.marginHeatmaps.values());

    const totalRevenue = cohorts.reduce((sum, c) => sum + c.revenue, 0);
    const totalLTV = cohorts.reduce((sum, c) => sum + (c.ltv * c.userCount), 0);
    const totalCAC = cohorts.reduce((sum, c) => sum + (c.cac * c.userCount), 0);
    const averageLTVCACRatio = cohorts.length > 0
      ? cohorts.reduce((sum, c) => sum + c.ltvCacRatio, 0) / cohorts.length
      : 0;
    const overallChurnRate = cohorts.length > 0
      ? cohorts.reduce((sum, c) => sum + c.churnRate, 0) / cohorts.length
      : 0;

    // Get top margin products
    const productMargins: Map<string, { productName: string; margin: number }> = new Map();
    for (const margin of this.margins.values()) {
      const existing = productMargins.get(margin.productId) || { productName: margin.productName, margin: 0 };
      existing.margin += margin.margin;
      productMargins.set(margin.productId, existing);
    }

    const topMarginProducts = Array.from(productMargins.entries())
      .map(([productId, data]) => ({ productId, productName: data.productName, margin: data.margin }))
      .sort((a, b) => b.margin - a.margin)
      .slice(0, 5);

    return {
      totalRevenue,
      totalLTV,
      totalCAC,
      averageLTVCACRatio,
      overallChurnRate,
      topMarginProducts,
    };
  }

  /**
   * Cleanup old data (older than 2 years)
   */
  cleanupOldData(): number {
    const now = Date.now();
    const cutoff = now - (2 * 365 * 24 * 60 * 60 * 1000);
    let deletedCount = 0;

    // Cleanup old cohorts
    for (const [id, cohort] of this.cohorts.entries()) {
      if (cohort.endDate < cutoff) {
        this.cohorts.delete(id);
        deletedCount++;
      }
    }

    // Cleanup old margin data
    for (const [id, margin] of this.margins.entries()) {
      const periodDate = new Date(margin.period).getTime();
      if (periodDate < cutoff) {
        this.margins.delete(id);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      console.log(`[RevenueIntelligence] Cleaned up ${deletedCount} old data records`);
    }

    return deletedCount;
  }
}

const revenueIntelligenceService = new RevenueIntelligenceService();

// Cleanup old data quarterly
setInterval(() => {
  revenueIntelligenceService.cleanupOldData();
}, 90 * 24 * 60 * 60 * 1000);

export default revenueIntelligenceService;
export { RevenueIntelligenceService };
export type { CohortData, MarginData, MarginHeatmap, ChurnAnalysis, CommissionOptimization };
