// Multi-Currency Service
// FX rate snapshot per invoice + rounding bank rules (minor units) + currency display vs settlement

interface FXRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  snapshotAt: number;
  source: string;
}

interface CurrencyConfig {
  code: string;
  symbol: string;
  precision: number;
  minorUnits: number;
  roundingRule: 'half_up' | 'half_down' | 'half_even' | 'half_odd' | 'ceiling' | 'floor';
  displayLocale: string;
  settlementCurrency: string;
}

class MultiCurrencyService {
  private fxRates: Map<string, FXRate[]>;
  private currencyConfigs: Map<string, CurrencyConfig>;

  constructor() {
    this.fxRates = new Map();
    this.currencyConfigs = new Map();
    this.initializeDefaultCurrencies();
    this.initializeDefaultFXRates();
  }

  /**
   * Initialize default currency configurations
   */
  private initializeDefaultCurrencies(): void {
    const defaultCurrencies: CurrencyConfig[] = [
      { code: 'USD', symbol: '$', precision: 2, minorUnits: 100, roundingRule: 'half_up', displayLocale: 'en-US', settlementCurrency: 'USD' },
      { code: 'EUR', symbol: '€', precision: 2, minorUnits: 100, roundingRule: 'half_up', displayLocale: 'de-DE', settlementCurrency: 'EUR' },
      { code: 'GBP', symbol: '£', precision: 2, minorUnits: 100, roundingRule: 'half_up', displayLocale: 'en-GB', settlementCurrency: 'GBP' },
      { code: 'INR', symbol: '₹', precision: 2, minorUnits: 100, roundingRule: 'half_up', displayLocale: 'en-IN', settlementCurrency: 'INR' },
      { code: 'JPY', symbol: '¥', precision: 0, minorUnits: 1, roundingRule: 'half_up', displayLocale: 'ja-JP', settlementCurrency: 'JPY' },
      { code: 'CNY', symbol: '¥', precision: 2, minorUnits: 100, roundingRule: 'half_up', displayLocale: 'zh-CN', settlementCurrency: 'CNY' },
      { code: 'AUD', symbol: 'A$', precision: 2, minorUnits: 100, roundingRule: 'half_up', displayLocale: 'en-AU', settlementCurrency: 'AUD' },
      { code: 'CAD', symbol: 'C$', precision: 2, minorUnits: 100, roundingRule: 'half_up', displayLocale: 'en-CA', settlementCurrency: 'CAD' },
      { code: 'SGD', symbol: 'S$', precision: 2, minorUnits: 100, roundingRule: 'half_up', displayLocale: 'en-SG', settlementCurrency: 'SGD' },
      { code: 'AED', symbol: 'د.إ', precision: 2, minorUnits: 100, roundingRule: 'half_up', displayLocale: 'ar-AE', settlementCurrency: 'AED' },
    ];

    defaultCurrencies.forEach(config => {
      this.currencyConfigs.set(config.code, config);
    });
  }

  /**
   * Initialize default FX rates
   */
  private initializeDefaultFXRates(): void {
    const now = Date.now();
    const defaultRates: FXRate[] = [
      { fromCurrency: 'USD', toCurrency: 'EUR', rate: 0.92, snapshotAt: now, source: 'manual' },
      { fromCurrency: 'USD', toCurrency: 'GBP', rate: 0.79, snapshotAt: now, source: 'manual' },
      { fromCurrency: 'USD', toCurrency: 'INR', rate: 83.50, snapshotAt: now, source: 'manual' },
      { fromCurrency: 'USD', toCurrency: 'JPY', rate: 149.50, snapshotAt: now, source: 'manual' },
      { fromCurrency: 'USD', toCurrency: 'CNY', rate: 7.24, snapshotAt: now, source: 'manual' },
      { fromCurrency: 'USD', toCurrency: 'AUD', rate: 1.53, snapshotAt: now, source: 'manual' },
      { fromCurrency: 'USD', toCurrency: 'CAD', rate: 1.36, snapshotAt: now, source: 'manual' },
      { fromCurrency: 'USD', toCurrency: 'SGD', rate: 1.34, snapshotAt: now, source: 'manual' },
      { fromCurrency: 'USD', toCurrency: 'AED', rate: 3.67, snapshotAt: now, source: 'manual' },
    ];

    defaultRates.forEach(rate => {
      const key = `${rate.fromCurrency}_${rate.toCurrency}`;
      const rates = this.fxRates.get(key) || [];
      rates.push(rate);
      this.fxRates.set(key, rates);
    });
  }

  /**
   * Snapshot FX rate for invoice
   */
  snapshotFXRate(fromCurrency: string, toCurrency: string, rate: number, source: string = 'manual'): FXRate {
    const fxRate: FXRate = {
      fromCurrency,
      toCurrency,
      rate,
      snapshotAt: Date.now(),
      source,
    };

    const key = `${fromCurrency}_${toCurrency}`;
    const rates = this.fxRates.get(key) || [];
    rates.push(fxRate);
    this.fxRates.set(key, rates);

    return fxRate;
  }

  /**
   * Get latest FX rate
   */
  getLatestFXRate(fromCurrency: string, toCurrency: string): FXRate | null {
    const key = `${fromCurrency}_${toCurrency}`;
    const rates = this.fxRates.get(key) || [];
    
    if (rates.length === 0) return null;

    return rates.reduce((latest, current) => {
      return current.snapshotAt > latest.snapshotAt ? current : latest;
    });
  }

  /**
   * Get FX rate at specific timestamp
   */
  getFXRateAt(fromCurrency: string, toCurrency: string, timestamp: number): FXRate | null {
    const key = `${fromCurrency}_${toCurrency}`;
    const rates = this.fxRates.get(key) || [];
    
    // Find rate closest to timestamp
    const closest = rates.reduce((closest, current) => {
      if (current.snapshotAt <= timestamp) {
        return current.snapshotAt > closest.snapshotAt ? current : closest;
      }
      return closest;
    }, rates[0] || null);

    return closest;
  }

  /**
   * Convert currency
   */
  convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    fxRate?: number
  ): { amount: number; rate: number; fromCurrency: string; toCurrency: string } {
    if (fromCurrency === toCurrency) {
      return { amount, rate: 1, fromCurrency, toCurrency };
    }

    const rate = fxRate || this.getLatestFXRate(fromCurrency, toCurrency)?.rate || 1;
    const converted = this.roundToCurrency(amount * rate, toCurrency);

    return { amount: converted, rate, fromCurrency, toCurrency };
  }

  /**
   * Round to currency precision using bank rounding rules
   */
  roundToCurrency(value: number, currencyCode: string): number {
    const config = this.currencyConfigs.get(currencyCode);
    if (!config) {
      return Math.round(value * 100) / 100;
    }

    const multiplier = Math.pow(10, config.precision);
    
    switch (config.roundingRule) {
      case 'half_up':
        return Math.round(value * multiplier) / multiplier;
      case 'half_down':
        return Math.floor((value * multiplier) + 0.5) / multiplier;
      case 'half_even':
        const rounded = Math.round(value * multiplier) / multiplier;
        const remainder = (value * multiplier) % 1;
        if (Math.abs(remainder) === 0.5) {
          return Math.floor(value * multiplier) / multiplier;
        }
        return rounded;
      case 'half_odd':
        const r = Math.round(value * multiplier) / multiplier;
        const rem = (value * multiplier) % 1;
        if (Math.abs(rem) === 0.5) {
          const floor = Math.floor(value * multiplier) / multiplier;
          return floor % 2 === 0 ? floor + (1 / multiplier) : floor;
        }
        return r;
      case 'ceiling':
        return Math.ceil(value * multiplier) / multiplier;
      case 'floor':
        return Math.floor(value * multiplier) / multiplier;
      default:
        return Math.round(value * multiplier) / multiplier;
    }
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number, currencyCode: string): string {
    const config = this.currencyConfigs.get(currencyCode);
    if (!config) {
      return `${currencyCode} ${amount.toFixed(2)}`;
    }

    return new Intl.NumberFormat(config.displayLocale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: config.precision,
      maximumFractionDigits: config.precision,
    }).format(amount);
  }

  /**
   * Get currency config
   */
  getCurrencyConfig(currencyCode: string): CurrencyConfig | null {
    return this.currencyConfigs.get(currencyCode) || null;
  }

  /**
   * Add currency config
   */
  addCurrencyConfig(config: CurrencyConfig): void {
    this.currencyConfigs.set(config.code, config);
  }

  /**
   * Get settlement currency for display currency
   */
  getSettlementCurrency(displayCurrency: string): string {
    const config = this.currencyConfigs.get(displayCurrency);
    return config?.settlementCurrency || displayCurrency;
  }

  /**
   * Convert to settlement currency
   */
  convertToSettlement(amount: number, displayCurrency: string): {
    amount: number;
    displayCurrency: string;
    settlementCurrency: string;
  } {
    const settlementCurrency = this.getSettlementCurrency(displayCurrency);
    
    if (displayCurrency === settlementCurrency) {
      return { amount, displayCurrency, settlementCurrency };
    }

    const conversion = this.convertCurrency(amount, displayCurrency, settlementCurrency);
    
    return {
      amount: conversion.amount,
      displayCurrency,
      settlementCurrency,
    };
  }

  /**
   * Get all supported currencies
   */
  getSupportedCurrencies(): CurrencyConfig[] {
    return Array.from(this.currencyConfigs.values());
  }

  /**
   * Clean up old FX rates (older than 30 days)
   */
  cleanupOldFXRates(): number {
    const now = Date.now();
    const cutoff = now - (30 * 24 * 60 * 60 * 1000);
    let deletedCount = 0;

    for (const [key, rates] of this.fxRates.entries()) {
      const filtered = rates.filter(rate => rate.snapshotAt > cutoff);
      deletedCount += rates.length - filtered.length;
      this.fxRates.set(key, filtered);
    }

    if (deletedCount > 0) {
      console.log(`[MultiCurrency] Cleaned up ${deletedCount} old FX rates`);
    }

    return deletedCount;
  }
}

const multiCurrencyService = new MultiCurrencyService();

// Auto-cleanup old FX rates daily
setInterval(() => {
  multiCurrencyService.cleanupOldFXRates();
}, 86400000);

export default multiCurrencyService;
export { MultiCurrencyService };
export type { FXRate, CurrencyConfig };
