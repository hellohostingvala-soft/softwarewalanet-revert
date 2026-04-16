// Commission Engine Service
// reseller % per product, franchise margin per region, auto calc on order

interface ProductCommission {
  productId: string;
  productName: string;
  resellerPercentage: number; // % of product price
  baseMargin: number; // base margin amount
}

interface RegionMargin {
  regionId: string;
  regionName: string;
  marginMultiplier: number; // multiplier for franchise margin
  additionalBonus: number; // additional bonus amount
}

interface CommissionCalculation {
  orderId: string;
  franchiseId: string;
  productId: string;
  productPrice: number;
  resellerCommission: number;
  franchiseMargin: number;
  totalPayout: number;
  calculatedAt: number;
}

class CommissionEngineService {
  private productCommissions: Map<string, ProductCommission>;
  private regionMargins: Map<string, RegionMargin>;
  private commissionHistory: Map<string, CommissionCalculation>;

  constructor() {
    this.productCommissions = new Map();
    this.regionMargins = new Map();
    this.commissionHistory = new Map();
  }

  /**
   * Set product commission
   */
  setProductCommission(
    productId: string,
    productName: string,
    resellerPercentage: number,
    baseMargin: number
  ): ProductCommission {
    const commission: ProductCommission = {
      productId,
      productName,
      resellerPercentage,
      baseMargin,
    };

    this.productCommissions.set(productId, commission);
    console.log(`[Commission] Set commission for ${productName}: ${resellerPercentage}% reseller, ${baseMargin} base margin`);
    return commission;
  }

  /**
   * Set region margin
   */
  setRegionMargin(
    regionId: string,
    regionName: string,
    marginMultiplier: number,
    additionalBonus: number
  ): RegionMargin {
    const margin: RegionMargin = {
      regionId,
      regionName,
      marginMultiplier,
      additionalBonus,
    };

    this.regionMargins.set(regionId, margin);
    console.log(`[Commission] Set margin for ${regionName}: ${marginMultiplier}x multiplier, ${additionalBonus} bonus`);
    return margin;
  }

  /**
   * Calculate commission for order
   */
  calculateCommission(
    orderId: string,
    franchiseId: string,
    regionId: string,
    productId: string,
    productPrice: number
  ): CommissionCalculation {
    const productCommission = this.productCommissions.get(productId);
    if (!productCommission) {
      throw new Error(`Product commission not found for ${productId}`);
    }

    const regionMargin = this.regionMargins.get(regionId);
    if (!regionMargin) {
      throw new Error(`Region margin not found for ${regionId}`);
    }

    // Calculate reseller commission
    const resellerCommission = (productPrice * productCommission.resellerPercentage) / 100;

    // Calculate franchise margin with region multiplier
    const franchiseMargin = (productCommission.baseMargin * regionMargin.marginMultiplier) + regionMargin.additionalBonus;

    // Total payout
    const totalPayout = resellerCommission + franchiseMargin;

    const calculation: CommissionCalculation = {
      orderId,
      franchiseId,
      productId,
      productPrice,
      resellerCommission,
      franchiseMargin,
      totalPayout,
      calculatedAt: Date.now(),
    };

    this.commissionHistory.set(calculation.orderId, calculation);
    console.log(`[Commission] Calculated for order ${orderId}: ₹${resellerCommission.toFixed(2)} reseller, ₹${franchiseMargin.toFixed(2)} franchise`);
    return calculation;
  }

  /**
   * Calculate commission for multiple products in order
   */
  calculateOrderCommission(
    orderId: string,
    franchiseId: string,
    regionId: string,
    items: Array<{ productId: string; quantity: number; price: number }>
  ): CommissionCalculation[] {
    const calculations: CommissionCalculation[] = [];

    for (const item of items) {
      const calculation = this.calculateCommission(
        orderId,
        franchiseId,
        regionId,
        item.productId,
        item.price * item.quantity
      );
      calculations.push(calculation);
    }

    return calculations;
  }

  /**
   * Get total commission for order
   */
  getOrderTotalCommission(orderId: string): {
    totalResellerCommission: number;
    totalFranchiseMargin: number;
    totalPayout: number;
  } {
    const calculations = Array.from(this.commissionHistory.values()).filter(c => c.orderId === orderId);

    const totalResellerCommission = calculations.reduce((sum, c) => sum + c.resellerCommission, 0);
    const totalFranchiseMargin = calculations.reduce((sum, c) => sum + c.franchiseMargin, 0);
    const totalPayout = totalResellerCommission + totalFranchiseMargin;

    return {
      totalResellerCommission,
      totalFranchiseMargin,
      totalPayout,
    };
  }

  /**
   * Get franchise commission summary
   */
  getFranchiseCommissionSummary(franchiseId: string, startDate?: number, endDate?: number): {
    totalOrders: number;
    totalResellerCommission: number;
    totalFranchiseMargin: number;
    totalPayout: number;
  } {
    let calculations = Array.from(this.commissionHistory.values()).filter(c => c.franchiseId === franchiseId);

    if (startDate) {
      calculations = calculations.filter(c => c.calculatedAt >= startDate);
    }

    if (endDate) {
      calculations = calculations.filter(c => c.calculatedAt <= endDate);
    }

    const totalOrders = new Set(calculations.map(c => c.orderId)).size;
    const totalResellerCommission = calculations.reduce((sum, c) => sum + c.resellerCommission, 0);
    const totalFranchiseMargin = calculations.reduce((sum, c) => sum + c.franchiseMargin, 0);
    const totalPayout = totalResellerCommission + totalFranchiseMargin;

    return {
      totalOrders,
      totalResellerCommission,
      totalFranchiseMargin,
      totalPayout,
    };
  }

  /**
   * Get product commission
   */
  getProductCommission(productId: string): ProductCommission | null {
    return this.productCommissions.get(productId) || null;
  }

  /**
   * Get region margin
   */
  getRegionMargin(regionId: string): RegionMargin | null {
    return this.regionMargins.get(regionId) || null;
  }

  /**
   * Get commission calculation by order
   */
  getCommissionCalculation(orderId: string): CommissionCalculation[] {
    return Array.from(this.commissionHistory.values()).filter(c => c.orderId === orderId);
  }

  /**
   * Update product commission
   */
  updateProductCommission(
    productId: string,
    resellerPercentage: number,
    baseMargin: number
  ): ProductCommission | null {
    const commission = this.productCommissions.get(productId);
    if (!commission) return null;

    commission.resellerPercentage = resellerPercentage;
    commission.baseMargin = baseMargin;
    this.productCommissions.set(productId, commission);

    console.log(`[Commission] Updated commission for ${commission.productName}`);
    return commission;
  }

  /**
   * Update region margin
   */
  updateRegionMargin(
    regionId: string,
    marginMultiplier: number,
    additionalBonus: number
  ): RegionMargin | null {
    const margin = this.regionMargins.get(regionId);
    if (!margin) return null;

    margin.marginMultiplier = marginMultiplier;
    margin.additionalBonus = additionalBonus;
    this.regionMargins.set(regionId, margin);

    console.log(`[Commission] Updated margin for ${margin.regionName}`);
    return margin;
  }

  /**
   * Delete product commission
   */
  deleteProductCommission(productId: string): boolean {
    const commission = this.productCommissions.get(productId);
    if (!commission) return false;

    this.productCommissions.delete(productId);
    console.log(`[Commission] Deleted commission for ${commission.productName}`);
    return true;
  }

  /**
   * Delete region margin
   */
  deleteRegionMargin(regionId: string): boolean {
    const margin = this.regionMargins.get(regionId);
    if (!margin) return false;

    this.regionMargins.delete(regionId);
    console.log(`[Commission] Deleted margin for ${margin.regionName}`);
    return true;
  }

  /**
   * Get commission stats
   */
  getCommissionStats(): {
    totalCalculations: number;
    totalPayout: number;
    averageCommission: number;
  } {
    const calculations = Array.from(this.commissionHistory.values());
    const totalPayout = calculations.reduce((sum, c) => sum + c.totalPayout, 0);
    const averageCommission = calculations.length > 0 ? totalPayout / calculations.length : 0;

    return {
      totalCalculations: calculations.length,
      totalPayout,
      averageCommission,
    };
  }

  /**
   * Cleanup old commission history (older than 1 year)
   */
  cleanupOldCommissionHistory(): number {
    const now = Date.now();
    const cutoff = now - (365 * 24 * 60 * 60 * 1000);
    let deletedCount = 0;

    for (const [orderId, calculation] of this.commissionHistory.entries()) {
      if (calculation.calculatedAt < cutoff) {
        this.commissionHistory.delete(orderId);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      console.log(`[Commission] Cleaned up ${deletedCount} old commission calculations`);
    }

    return deletedCount;
  }
}

const commissionEngineService = new CommissionEngineService();

// Auto-cleanup old commission history monthly
setInterval(() => {
  commissionEngineService.cleanupOldCommissionHistory();
}, 30 * 24 * 60 * 60 * 1000);

export default commissionEngineService;
export { CommissionEngineService };
export type { ProductCommission, RegionMargin, CommissionCalculation };
