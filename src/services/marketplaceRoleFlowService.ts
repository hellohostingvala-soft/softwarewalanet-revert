// Marketplace to Role Flow Service
// Handles reseller commission and franchise wallet updates

import { creditWallet, debitWallet, getWallet } from './walletService';
import { publishEvent } from './franchiseFlowEngineService';

export interface OrderData {
  orderId: string;
  productId: string;
  amount: number;
  userId: string;
  paymentMethod: 'wallet' | 'payu' | 'bank' | 'binance';
  resellerId?: string;
  franchiseId?: string;
  franchiseLocation?: string;
}

/**
 * Process order and distribute earnings
 */
export async function processOrder(orderData: OrderData): Promise<void> {
  // 1. Create order
  console.log(`[Marketplace Flow] Creating order: ${orderData.orderId}`);

  // 2. Process payment
  if (orderData.paymentMethod === 'wallet') {
    await processWalletPayment(orderData);
  }

  // 3. Check if reseller product
  if (orderData.resellerId) {
    await processResellerCommission(orderData);
  }

  // 4. Check if franchise sale
  if (orderData.franchiseId) {
    await processFranchiseEarnings(orderData);
  }

  // 5. Publish event
  publishEvent({
    eventId: crypto.randomUUID(),
    eventType: 'order_created',
    source: 'service',
    franchiseId: orderData.franchiseId || '',
    userId: orderData.userId,
    data: orderData,
    timestamp: new Date(),
  });
}

/**
 * Process wallet payment
 */
async function processWalletPayment(orderData: OrderData): Promise<void> {
  const wallet = getWallet(orderData.userId);
  if (!wallet) {
    throw new Error('Wallet not found');
  }

  // Deduct amount from user wallet
  debitWallet(
    wallet.id,
    orderData.amount,
    'order',
    orderData.orderId,
    { paymentMethod: 'wallet' }
  );

  console.log(`[Marketplace Flow] Wallet payment processed: ${orderData.amount}`);
}

/**
 * Process reseller commission
 */
async function processResellerCommission(orderData: OrderData): Promise<void> {
  if (!orderData.resellerId) return;

  // Calculate commission (e.g., 10%)
  const commissionRate = 0.10;
  const commissionAmount = orderData.amount * commissionRate;

  // Get reseller wallet
  const resellerWallet = getWallet(orderData.resellerId);
  if (!resellerWallet) {
    console.error(`[Marketplace Flow] Reseller wallet not found: ${orderData.resellerId}`);
    return;
  }

  // Credit commission to reseller wallet
  creditWallet(
    resellerWallet.id,
    commissionAmount,
    'commission',
    orderData.orderId,
    {
      orderId: orderData.orderId,
      productId: orderData.productId,
      commissionRate,
    }
  );

  console.log(`[Marketplace Flow] Reseller commission credited: ${commissionAmount}`);
}

/**
 * Process franchise earnings
 */
async function processFranchiseEarnings(orderData: OrderData): Promise<void> {
  if (!orderData.franchiseId) return;

  // Calculate franchise earnings (e.g., 15%)
  const earningsRate = 0.15;
  const earningsAmount = orderData.amount * earningsRate;

  // Get franchise wallet
  const franchiseWallet = getWallet(orderData.franchiseId);
  if (!franchiseWallet) {
    console.error(`[Marketplace Flow] Franchise wallet not found: ${orderData.franchiseId}`);
    return;
  }

  // Credit earnings to franchise wallet
  creditWallet(
    franchiseWallet.id,
    earningsAmount,
    'order',
    orderData.orderId,
    {
      orderId: orderData.orderId,
      productId: orderData.productId,
      franchiseLocation: orderData.franchiseLocation,
      earningsRate,
    }
  );

  console.log(`[Marketplace Flow] Franchise earnings credited: ${earningsAmount}`);
}

/**
 * Calculate commission based on role
 */
export function calculateCommission(amount: number, role: 'reseller' | 'franchise'): number {
  const rates = {
    reseller: 0.10, // 10%
    franchise: 0.15, // 15%
  };
  return amount * rates[role];
}

/**
 * Get earnings breakdown
 */
export function getEarningsBreakdown(orderAmount: number): {
  platform: number;
  reseller?: number;
  franchise?: number;
} {
  const platformRate = 0.75; // 75% goes to platform
  const platformAmount = orderAmount * platformRate;

  const breakdown: any = {
    platform: platformAmount,
  };

  // If reseller involved
  if (orderAmount * 0.10 > 0) {
    breakdown.reseller = orderAmount * 0.10;
  }

  // If franchise involved
  if (orderAmount * 0.15 > 0) {
    breakdown.franchise = orderAmount * 0.15;
  }

  return breakdown;
}
