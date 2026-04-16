// Tax Engine Service
// GST split (CGST/SGST/IGST) + region-based rules + HSN/SAC code per product

interface TaxRegion {
  id: string;
  countryCode: string;
  stateCode: string;
  regionName: string;
  taxType: 'CGST_SGST' | 'IGST';
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  effectiveFrom: number;
  effectiveTo?: number;
}

interface TaxCalculationResult {
  subtotal: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
  grandTotal: number;
  taxType: 'CGST_SGST' | 'IGST';
  taxRate: number;
}

interface ProductTaxConfig {
  productId: string;
  hsnSac: string;
  defaultTaxRate: number;
  exempt: boolean;
}

class TaxEngineService {
  private taxRegions: Map<string, TaxRegion>;
  private productTaxConfigs: Map<string, ProductTaxConfig>;

  constructor() {
    this.taxRegions = new Map();
    this.productTaxConfigs = new Map();
    this.initializeDefaultTaxRegions();
  }

  /**
   * Initialize default tax regions for India GST
   */
  private initializeDefaultTaxRegions(): void {
    const defaultRegions: TaxRegion[] = [
      {
        id: 'IN-KA',
        countryCode: 'IN',
        stateCode: 'KA',
        regionName: 'Karnataka',
        taxType: 'CGST_SGST',
        cgstRate: 9,
        sgstRate: 9,
        igstRate: 0,
        effectiveFrom: Date.now(),
      },
      {
        id: 'IN-MH',
        countryCode: 'IN',
        stateCode: 'MH',
        regionName: 'Maharashtra',
        taxType: 'CGST_SGST',
        cgstRate: 9,
        sgstRate: 9,
        igstRate: 0,
        effectiveFrom: Date.now(),
      },
      {
        id: 'IN-DL',
        countryCode: 'IN',
        stateCode: 'DL',
        regionName: 'Delhi',
        taxType: 'CGST_SGST',
        cgstRate: 9,
        sgstRate: 9,
        igstRate: 0,
        effectiveFrom: Date.now(),
      },
      {
        id: 'IN-OTHER',
        countryCode: 'IN',
        stateCode: 'OT',
        regionName: 'Other States (Inter-state)',
        taxType: 'IGST',
        cgstRate: 0,
        sgstRate: 0,
        igstRate: 18,
        effectiveFrom: Date.now(),
      },
    ];

    defaultRegions.forEach(region => {
      this.taxRegions.set(region.id, region);
    });
  }

  /**
   * Add tax region
   */
  addTaxRegion(region: TaxRegion): void {
    this.taxRegions.set(region.id, region);
  }

  /**
   * Get tax region by state code
   */
  getTaxRegion(countryCode: string, stateCode: string): TaxRegion | null {
    const key = `${countryCode}-${stateCode}`;
    return this.taxRegions.get(key) || null;
  }

  /**
   * Get active tax region (considering effective dates)
   */
  getActiveTaxRegion(countryCode: string, stateCode: string): TaxRegion | null {
    const now = Date.now();
    const key = `${countryCode}-${stateCode}`;
    
    for (const region of this.taxRegions.values()) {
      if (region.countryCode === countryCode && region.stateCode === stateCode) {
        if (now >= region.effectiveFrom && (!region.effectiveTo || now < region.effectiveTo)) {
          return region;
        }
      }
    }

    return null;
  }

  /**
   * Calculate tax for invoice items
   */
  calculateTax(
    items: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
    }>,
    buyerStateCode: string,
    sellerStateCode: string,
    countryCode: string = 'IN'
  ): TaxCalculationResult {
    const taxRegion = this.getActiveTaxRegion(countryCode, buyerStateCode);
    
    if (!taxRegion) {
      throw new Error(`Tax region not found for ${countryCode}-${buyerStateCode}`);
    }

    let subtotal = 0;
    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    for (const item of items) {
      const productConfig = this.productTaxConfigs.get(item.productId);
      const taxRate = productConfig?.exempt ? 0 : (productConfig?.defaultTaxRate || taxRegion.igstRate || taxRegion.cgstRate + taxRegion.sgstRate);
      
      const lineSubtotal = item.quantity * item.unitPrice;
      subtotal += lineSubtotal;

      if (taxRegion.taxType === 'CGST_SGST') {
        cgstAmount += lineSubtotal * (taxRegion.cgstRate / 100);
        sgstAmount += lineSubtotal * (taxRegion.sgstRate / 100);
      } else {
        igstAmount += lineSubtotal * (taxRegion.igstRate / 100);
      }
    }

    const totalTax = cgstAmount + sgstAmount + igstAmount;
    const grandTotal = subtotal + totalTax;
    const effectiveTaxRate = taxRegion.taxType === 'CGST_SGST' 
      ? taxRegion.cgstRate + taxRegion.sgstRate 
      : taxRegion.igstRate;

    return {
      subtotal,
      cgstAmount: this.roundToPrecision(cgstAmount, 2),
      sgstAmount: this.roundToPrecision(sgstAmount, 2),
      igstAmount: this.roundToPrecision(igstAmount, 2),
      totalTax: this.roundToPrecision(totalTax, 2),
      grandTotal: this.roundToPrecision(grandTotal, 2),
      taxType: taxRegion.taxType,
      taxRate: effectiveTaxRate,
    };
  }

  /**
   * Calculate tax for single item
   */
  calculateItemTax(
    productId: string,
    quantity: number,
    unitPrice: number,
    buyerStateCode: string,
    sellerStateCode: string,
    countryCode: string = 'IN'
  ): {
    subtotal: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    taxAmount: number;
    lineTotal: number;
    taxRate: number;
    taxType: 'CGST_SGST' | 'IGST';
  } {
    const taxRegion = this.getActiveTaxRegion(countryCode, buyerStateCode);
    
    if (!taxRegion) {
      throw new Error(`Tax region not found for ${countryCode}-${buyerStateCode}`);
    }

    const productConfig = this.productTaxConfigs.get(productId);
    const taxRate = productConfig?.exempt ? 0 : (productConfig?.defaultTaxRate || taxRegion.igstRate || taxRegion.cgstRate + taxRegion.sgstRate);
    
    const subtotal = quantity * unitPrice;
    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    if (taxRegion.taxType === 'CGST_SGST') {
      cgstAmount = subtotal * (taxRegion.cgstRate / 100);
      sgstAmount = subtotal * (taxRegion.sgstRate / 100);
    } else {
      igstAmount = subtotal * (taxRegion.igstRate / 100);
    }

    const taxAmount = cgstAmount + sgstAmount + igstAmount;
    const lineTotal = subtotal + taxAmount;
    const effectiveTaxRate = taxRegion.taxType === 'CGST_SGST' 
      ? taxRegion.cgstRate + taxRegion.sgstRate 
      : taxRegion.igstRate;

    return {
      subtotal,
      cgstAmount: this.roundToPrecision(cgstAmount, 2),
      sgstAmount: this.roundToPrecision(sgstAmount, 2),
      igstAmount: this.roundToPrecision(igstAmount, 2),
      taxAmount: this.roundToPrecision(taxAmount, 2),
      lineTotal: this.roundToPrecision(lineTotal, 2),
      taxRate: effectiveTaxRate,
      taxType: taxRegion.taxType,
    };
  }

  /**
   * Set product tax configuration
   */
  setProductTaxConfig(config: ProductTaxConfig): void {
    this.productTaxConfigs.set(config.productId, config);
  }

  /**
   * Get product tax configuration
   */
  getProductTaxConfig(productId: string): ProductTaxConfig | null {
    return this.productTaxConfigs.get(productId) || null;
  }

  /**
   * Validate HSN/SAC code
   */
  validateHSNSAC(code: string): { valid: boolean; type?: 'HSN' | 'SAC' | null } {
    // HSN codes are 4, 6, or 8 digits
    const hsnPattern = /^\d{4}$|^\d{6}$|^\d{8}$/;
    if (hsnPattern.test(code)) {
      return { valid: true, type: 'HSN' };
    }

    // SAC codes are typically 4-8 digits
    const sacPattern = /^\d{4}$|^\d{6}$|^\d{8}$/;
    if (sacPattern.test(code)) {
      return { valid: true, type: 'SAC' };
    }

    return { valid: true, type: null };
  }

  /**
   * Determine tax type based on buyer and seller states
   */
  determineTaxType(buyerStateCode: string, sellerStateCode: string): 'CGST_SGST' | 'IGST' {
    if (buyerStateCode === sellerStateCode) {
      return 'CGST_SGST';
    }
    return 'IGST';
  }

  /**
   * Round to precision
   */
  private roundToPrecision(value: number, precision: number): number {
    const multiplier = Math.pow(10, precision);
    return Math.round(value * multiplier) / multiplier;
  }

  /**
   * Get all tax regions
   */
  getAllTaxRegions(): TaxRegion[] {
    return Array.from(this.taxRegions.values());
  }

  /**
   * Remove expired tax regions
   */
  cleanupExpiredTaxRegions(): number {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, region] of this.taxRegions.entries()) {
      if (region.effectiveTo && now > region.effectiveTo) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.taxRegions.delete(key));

    if (keysToDelete.length > 0) {
      console.log(`[TaxEngine] Cleaned up ${keysToDelete.length} expired tax regions`);
    }

    return keysToDelete.length;
  }

  /**
   * Get tax summary for invoice
   */
  getTaxSummary(
    items: Array<{
      cgstAmount: number;
      sgstAmount: number;
      igstAmount: number;
    }>
  ): {
    totalCGST: number;
    totalSGST: number;
    totalIGST: number;
    totalTax: number;
  } {
    const totalCGST = items.reduce((sum, item) => sum + item.cgstAmount, 0);
    const totalSGST = items.reduce((sum, item) => sum + item.sgstAmount, 0);
    const totalIGST = items.reduce((sum, item) => sum + item.igstAmount, 0);
    const totalTax = totalCGST + totalSGST + totalIGST;

    return {
      totalCGST: this.roundToPrecision(totalCGST, 2),
      totalSGST: this.roundToPrecision(totalSGST, 2),
      totalIGST: this.roundToPrecision(totalIGST, 2),
      totalTax: this.roundToPrecision(totalTax, 2),
    };
  }
}

// Singleton instance
const taxEngineService = new TaxEngineService();

export default taxEngineService;
export { TaxEngineService };
export type { TaxRegion, TaxCalculationResult, ProductTaxConfig };
