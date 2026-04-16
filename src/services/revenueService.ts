// Revenue Service
// accrual schedule + deferred revenue table + recognition jobs

import ledgerService from './ledgerService';
import clockIdService from '../micro/clockIdService';

interface RevenueSchedule {
  id: string;
  invoiceId: string;
  amount: number;
  currency: string;
  recognitionStartDate: number;
  recognitionEndDate: number;
  recognitionPeriod: 'daily' | 'weekly' | 'monthly';
  totalPeriods: number;
  recognizedAmount: number;
  remainingAmount: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  createdAt: number;
  updatedAt: number;
}

interface DeferredRevenue {
  id: string;
  scheduleId: string;
  periodNumber: number;
  periodStartDate: number;
  periodEndDate: number;
  amount: number;
  currency: string;
  recognized: boolean;
  recognizedAt?: number;
  journalEntryId?: string;
  createdAt: number;
}

class RevenueService {
  private revenueSchedules: Map<string, RevenueSchedule>;
  private deferredRevenue: Map<string, DeferredRevenue[]>;

  constructor() {
    this.revenueSchedules = new Map();
    this.deferredRevenue = new Map();
  }

  /**
   * Create revenue recognition schedule
   */
  createRevenueSchedule(
    invoiceId: string,
    amount: number,
    currency: string,
    recognitionStartDate: number,
    recognitionEndDate: number,
    recognitionPeriod: 'daily' | 'weekly' | 'monthly' = 'monthly'
  ): RevenueSchedule {
    const duration = recognitionEndDate - recognitionStartDate;
    let totalPeriods: number;

    switch (recognitionPeriod) {
      case 'daily':
        totalPeriods = Math.ceil(duration / (24 * 60 * 60 * 1000));
        break;
      case 'weekly':
        totalPeriods = Math.ceil(duration / (7 * 24 * 60 * 60 * 1000));
        break;
      case 'monthly':
        totalPeriods = Math.ceil(duration / (30 * 24 * 60 * 60 * 1000));
        break;
      default:
        totalPeriods = 1;
    }

    const schedule: RevenueSchedule = {
      id: clockIdService.generateId(),
      invoiceId,
      amount,
      currency,
      recognitionStartDate,
      recognitionEndDate,
      recognitionPeriod,
      totalPeriods,
      recognizedAmount: 0,
      remainingAmount: amount,
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.revenueSchedules.set(schedule.id, schedule);

    // Create deferred revenue entries
    const periodDuration = duration / totalPeriods;
    const amountPerPeriod = amount / totalPeriods;

    const deferredEntries: DeferredRevenue[] = [];
    for (let i = 0; i < totalPeriods; i++) {
      const entry: DeferredRevenue = {
        id: clockIdService.generateId(),
        scheduleId: schedule.id,
        periodNumber: i + 1,
        periodStartDate: recognitionStartDate + (i * periodDuration),
        periodEndDate: recognitionStartDate + ((i + 1) * periodDuration),
        amount: amountPerPeriod,
        currency,
        recognized: false,
        createdAt: Date.now(),
      };
      deferredEntries.push(entry);
    }

    this.deferredRevenue.set(schedule.id, deferredEntries);

    console.log(`[Revenue] Created revenue schedule ${schedule.id} for invoice ${invoiceId}`);
    return schedule;
  }

  /**
   * Activate revenue schedule
   */
  activateSchedule(scheduleId: string): { success: boolean; error?: string } {
    const schedule = this.revenueSchedules.get(scheduleId);
    if (!schedule) {
      return { success: false, error: 'Schedule not found' };
    }

    schedule.status = 'active';
    schedule.updatedAt = Date.now();
    this.revenueSchedules.set(scheduleId, schedule);

    console.log(`[Revenue] Activated schedule ${scheduleId}`);
    return { success: true };
  }

  /**
   * Recognize revenue for period
   */
  recognizeRevenue(scheduleId: string, periodNumber?: number): { success: boolean; recognized: number; error?: string } {
    const schedule = this.revenueSchedules.get(scheduleId);
    if (!schedule) {
      return { success: false, recognized: 0, error: 'Schedule not found' };
    }

    if (schedule.status !== 'active') {
      return { success: false, recognized: 0, error: 'Schedule is not active' };
    }

    const entries = this.deferredRevenue.get(scheduleId) || [];
    let recognized = 0;

    const now = Date.now();

    for (const entry of entries) {
      if (entry.recognized) continue;

      if (periodNumber && entry.periodNumber !== periodNumber) continue;

      // Check if period has ended
      if (now < entry.periodEndDate) continue;

      // Create journal entry for revenue recognition
      const journalResult = ledgerService.createJournalEntry(
        `Revenue recognition for period ${entry.periodNumber} of schedule ${scheduleId}`,
        [
          {
            accountId: 'acc_005', // Deferred Revenue
            type: 'debit',
            amount: entry.amount,
            description: 'Recognize deferred revenue',
          },
          {
            accountId: 'acc_007', // Sales Revenue
            type: 'credit',
            amount: entry.amount,
            description: 'Revenue recognized',
          },
        ],
        scheduleId,
        'revenue_recognition'
      );

      if (journalResult.success) {
        ledgerService.postJournalEntry(journalResult.entryId!);
        
        entry.recognized = true;
        entry.recognizedAt = now;
        entry.journalEntryId = journalResult.entryId;
        recognized++;
      }
    }

    // Update schedule
    this.deferredRevenue.set(scheduleId, entries);
    
    const totalRecognized = entries.filter(e => e.recognized).reduce((sum, e) => sum + e.amount, 0);
    schedule.recognizedAmount = totalRecognized;
    schedule.remainingAmount = schedule.amount - totalRecognized;
    schedule.updatedAt = now;

    if (schedule.remainingAmount <= 0.01) {
      schedule.status = 'completed';
    }

    this.revenueSchedules.set(scheduleId, schedule);

    console.log(`[Revenue] Recognized ${recognized} periods for schedule ${scheduleId}`);
    return { success: true, recognized };
  }

  /**
   * Process all pending revenue recognition
   */
  processPendingRecognition(): { processed: number; schedulesProcessed: number } {
    const now = Date.now();
    let processed = 0;
    let schedulesProcessed = 0;

    for (const [scheduleId, schedule] of this.revenueSchedules.entries()) {
      if (schedule.status !== 'active') continue;

      const entries = this.deferredRevenue.get(scheduleId) || [];
      const pendingEntries = entries.filter(e => !e.recognized && now >= e.periodEndDate);

      if (pendingEntries.length > 0) {
        const result = this.recognizeRevenue(scheduleId);
        if (result.success) {
          processed += result.recognized;
          schedulesProcessed++;
        }
      }
    }

    return { processed, schedulesProcessed };
  }

  /**
   * Cancel revenue schedule
   */
  cancelSchedule(scheduleId: string, reason: string): { success: boolean; error?: string } {
    const schedule = this.revenueSchedules.get(scheduleId);
    if (!schedule) {
      return { success: false, error: 'Schedule not found' };
    }

    if (schedule.status === 'completed') {
      return { success: false, error: 'Cannot cancel completed schedule' };
    }

    // Create journal entry to reverse recognized amount
    if (schedule.recognizedAmount > 0) {
      ledgerService.createJournalEntry(
        `Revenue reversal for cancelled schedule ${scheduleId}: ${reason}`,
        [
          {
            accountId: 'acc_007', // Sales Revenue
            type: 'debit',
            amount: schedule.recognizedAmount,
            description: 'Reverse recognized revenue',
          },
          {
            accountId: 'acc_005', // Deferred Revenue
            type: 'credit',
            amount: schedule.recognizedAmount,
            description: 'Revenue reversal',
          },
        ],
        scheduleId,
        'revenue_cancellation'
      );
    }

    schedule.status = 'cancelled';
    schedule.updatedAt = Date.now();
    this.revenueSchedules.set(scheduleId, schedule);

    console.log(`[Revenue] Cancelled schedule ${scheduleId}`);
    return { success: true };
  }

  /**
   * Get revenue schedule by invoice
   */
  getScheduleByInvoice(invoiceId: string): RevenueSchedule | null {
    return Array.from(this.revenueSchedules.values()).find(s => s.invoiceId === invoiceId) || null;
  }

  /**
   * Get deferred revenue entries for schedule
   */
  getDeferredRevenue(scheduleId: string): DeferredRevenue[] {
    return this.deferredRevenue.get(scheduleId) || [];
  }

  /**
   * Get revenue recognition stats
   */
  getRevenueStats(): {
    totalSchedules: number;
    activeSchedules: number;
    completedSchedules: number;
    cancelledSchedules: number;
    totalDeferred: number;
    totalRecognized: number;
    remainingToRecognize: number;
  } {
    let activeSchedules = 0;
    let completedSchedules = 0;
    let cancelledSchedules = 0;
    let totalDeferred = 0;
    let totalRecognized = 0;

    for (const schedule of this.revenueSchedules.values()) {
      switch (schedule.status) {
        case 'active':
          activeSchedules++;
          break;
        case 'completed':
          completedSchedules++;
          break;
        case 'cancelled':
          cancelledSchedules++;
          break;
      }

      totalDeferred += schedule.amount;
      totalRecognized += schedule.recognizedAmount;
    }

    return {
      totalSchedules: this.revenueSchedules.size,
      activeSchedules,
      completedSchedules,
      cancelledSchedules,
      totalDeferred,
      totalRecognized,
      remainingToRecognize: totalDeferred - totalRecognized,
    };
  }
}

const revenueService = new RevenueService();

// Auto-process pending revenue recognition daily
setInterval(() => {
  revenueService.processPendingRecognition();
}, 86400000);

export default revenueService;
export { RevenueService };
export type { RevenueSchedule, DeferredRevenue };
