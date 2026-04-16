// Proration Service
// Mid-cycle upgrade/downgrade calc + time-based credit/debit

interface ProrationCalculation {
  subscriptionId: string;
  oldPlanPrice: number;
  newPlanPrice: number;
  cycleStart: number;
  cycleEnd: number;
  changeDate: number;
  daysInCycle: number;
  daysUsed: number;
  daysRemaining: number;
  creditAmount: number;
  debitAmount: number;
  netAdjustment: number;
  currency: string;
}

class ProrationService {
  /**
   * Calculate proration for mid-cycle plan change
   */
  calculateProration(
    subscriptionId: string,
    oldPlanPrice: number,
    newPlanPrice: number,
    cycleStart: number,
    cycleEnd: number,
    changeDate: number,
    currency: string = 'USD',
    precision: number = 2
  ): ProrationCalculation {
    const cycleDuration = cycleEnd - cycleStart;
    const daysInCycle = Math.ceil(cycleDuration / (24 * 60 * 60 * 1000));
    const daysUsed = Math.ceil((changeDate - cycleStart) / (24 * 60 * 60 * 1000));
    const daysRemaining = daysInCycle - daysUsed;

    // Calculate credit for unused portion of old plan
    const creditAmount = this.roundToPrecision(
      (oldPlanPrice * daysRemaining) / daysInCycle,
      precision
    );

    // Calculate debit for remaining portion of new plan
    const debitAmount = this.roundToPrecision(
      (newPlanPrice * daysRemaining) / daysInCycle,
      precision
    );

    const netAdjustment = this.roundToPrecision(debitAmount - creditAmount, precision);

    return {
      subscriptionId,
      oldPlanPrice,
      newPlanPrice,
      cycleStart,
      cycleEnd,
      changeDate,
      daysInCycle,
      daysUsed,
      daysRemaining,
      creditAmount,
      debitAmount,
      netAdjustment,
      currency,
    };
  }

  /**
   * Calculate time-based credit for downgrade
   */
  calculateDowngradeCredit(
    subscriptionId: string,
    currentPlanPrice: number,
    cycleStart: number,
    cycleEnd: number,
    changeDate: number,
    currency: string = 'USD',
    precision: number = 2
  ): {
    creditAmount: number;
    daysRemaining: number;
    proratedDailyRate: number;
  } {
    const cycleDuration = cycleEnd - cycleStart;
    const daysInCycle = Math.ceil(cycleDuration / (24 * 60 * 60 * 1000));
    const daysRemaining = Math.ceil((cycleEnd - changeDate) / (24 * 60 * 60 * 1000));

    const proratedDailyRate = this.roundToPrecision(
      currentPlanPrice / daysInCycle,
      precision
    );

    const creditAmount = this.roundToPrecision(
      proratedDailyRate * daysRemaining,
      precision
    );

    return {
      creditAmount,
      daysRemaining,
      proratedDailyRate,
    };
  }

  /**
   * Calculate time-based debit for upgrade
   */
  calculateUpgradeDebit(
    subscriptionId: string,
    newPlanPrice: number,
    cycleStart: number,
    cycleEnd: number,
    changeDate: number,
    currency: string = 'USD',
    precision: number = 2
  ): {
    debitAmount: number;
    daysRemaining: number;
    proratedDailyRate: number;
  } {
    const cycleDuration = cycleEnd - cycleStart;
    const daysInCycle = Math.ceil(cycleDuration / (24 * 60 * 60 * 1000));
    const daysRemaining = Math.ceil((cycleEnd - changeDate) / (24 * 60 * 60 * 1000));

    const proratedDailyRate = this.roundToPrecision(
      newPlanPrice / daysInCycle,
      precision
    );

    const debitAmount = this.roundToPrecision(
      proratedDailyRate * daysRemaining,
      precision
    );

    return {
      debitAmount,
      daysRemaining,
      proratedDailyRate,
    };
  }

  /**
   * Calculate partial period charge
   */
  calculatePartialPeriodCharge(
    planPrice: number,
    days: number,
    totalDaysInPeriod: number,
    precision: number = 2
  ): number {
    return this.roundToPrecision(
      (planPrice * days) / totalDaysInPeriod,
      precision
    );
  }

  /**
   * Round to precision
   */
  private roundToPrecision(value: number, precision: number): number {
    const multiplier = Math.pow(10, precision);
    return Math.round(value * multiplier) / multiplier;
  }

  /**
   * Get proration summary
   */
  getProrationSummary(calculation: ProrationCalculation): string {
    const { oldPlanPrice, newPlanPrice, daysRemaining, creditAmount, debitAmount, netAdjustment } = calculation;

    if (newPlanPrice > oldPlanPrice) {
      return `Upgrade: Credit ${creditAmount} for unused portion of old plan, Debit ${debitAmount} for new plan. Net charge: ${netAdjustment}`;
    } else if (newPlanPrice < oldPlanPrice) {
      return `Downgrade: Credit ${creditAmount} for unused portion of old plan. Net credit: ${Math.abs(netAdjustment)}`;
    } else {
      return `Plan change at same price. No adjustment needed.`;
    }
  }
}

const prorationService = new ProrationService();

export default prorationService;
export { ProrationService };
export type { ProrationCalculation };
