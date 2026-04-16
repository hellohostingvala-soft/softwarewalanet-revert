// Dispute System Service
// order/payment dispute, resolution workflow + logs

type DisputeType = 'order' | 'payment' | 'product' | 'service' | 'commission';
type DisputeStatus = 'open' | 'under_review' | 'investigating' | 'resolved' | 'rejected' | 'escalated';
type DisputePriority = 'low' | 'medium' | 'high' | 'critical';

interface DisputeLog {
  id: string;
  disputeId: string;
  action: string;
  description: string;
  performedBy: string;
  performedAt: number;
  metadata?: any;
}

interface Dispute {
  id: string;
  franchiseId: string;
  orderId?: string;
  paymentId?: string;
  type: DisputeType;
  status: DisputeStatus;
  priority: DisputePriority;
  title: string;
  description: string;
  amount?: number;
  evidence?: string[];
  createdAt: number;
  updatedAt: number;
  createdBy: string;
  assignedTo?: string;
  resolvedAt?: number;
  resolution?: string;
  rejectionReason?: string;
  logs: DisputeLog[];
}

class DisputeSystemService {
  private disputes: Map<string, Dispute>;

  constructor() {
    this.disputes = new Map();
  }

  /**
   * Create dispute
   */
  createDispute(
    franchiseId: string,
    type: DisputeType,
    title: string,
    description: string,
    createdBy: string,
    orderId?: string,
    paymentId?: string,
    amount?: number,
    evidence?: string[]
  ): Dispute {
    const dispute: Dispute = {
      id: crypto.randomUUID(),
      franchiseId,
      orderId,
      paymentId,
      type,
      status: 'open',
      priority: this.calculatePriority(type, amount),
      title,
      description,
      amount,
      evidence: evidence || [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy,
      logs: [],
    };

    // Add creation log
    this.addLog(dispute.id, 'created', 'Dispute created', createdBy);

    this.disputes.set(dispute.id, dispute);
    console.log(`[Dispute] Created ${type} dispute ${dispute.id} for franchise ${franchiseId}`);
    return dispute;
  }

  /**
   * Calculate priority based on type and amount
   */
  private calculatePriority(type: DisputeType, amount?: number): DisputePriority {
    if (type === 'payment' && amount && amount > 10000) {
      return 'critical';
    }
    if (type === 'payment' && amount && amount > 5000) {
      return 'high';
    }
    if (type === 'order') {
      return 'high';
    }
    if (amount && amount > 1000) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Get dispute by ID
   */
  getDispute(disputeId: string): Dispute | null {
    return this.disputes.get(disputeId) || null;
  }

  /**
   * Get disputes by franchise
   */
  getDisputesByFranchise(franchiseId: string): Dispute[] {
    return Array.from(this.disputes.values()).filter(d => d.franchiseId === franchiseId);
  }

  /**
   * Get disputes by status
   */
  getDisputesByStatus(status: DisputeStatus): Dispute[] {
    return Array.from(this.disputes.values()).filter(d => d.status === status);
  }

  /**
   * Get disputes by type
   */
  getDisputesByType(type: DisputeType): Dispute[] {
    return Array.from(this.disputes.values()).filter(d => d.type === type);
  }

  /**
   * Update dispute status
   */
  updateDisputeStatus(
    disputeId: string,
    status: DisputeStatus,
    updatedBy: string,
    reason?: string
  ): Dispute {
    const dispute = this.disputes.get(disputeId);
    if (!dispute) {
      throw new Error('Dispute not found');
    }

    dispute.status = status;
    dispute.updatedAt = Date.now();

    if (status === 'resolved') {
      dispute.resolvedAt = Date.now();
    }

    if (status === 'rejected') {
      dispute.rejectionReason = reason;
    }

    this.addLog(dispute.id, 'status_updated', `Status changed to ${status}`, updatedBy, { reason });
    this.disputes.set(disputeId, dispute);

    console.log(`[Dispute] Updated dispute ${disputeId} status to ${status}`);
    return dispute;
  }

  /**
   * Assign dispute
   */
  assignDispute(disputeId: string, assignedTo: string, assignedBy: string): Dispute {
    const dispute = this.disputes.get(disputeId);
    if (!dispute) {
      throw new Error('Dispute not found');
    }

    dispute.assignedTo = assignedTo;
    dispute.updatedAt = Date.now();
    dispute.status = 'under_review';

    this.addLog(dispute.id, 'assigned', `Assigned to ${assignedTo}`, assignedBy);
    this.disputes.set(disputeId, dispute);

    console.log(`[Dispute] Assigned dispute ${disputeId} to ${assignedTo}`);
    return dispute;
  }

  /**
   * Resolve dispute
   */
  resolveDispute(disputeId: string, resolution: string, resolvedBy: string): Dispute {
    const dispute = this.disputes.get(disputeId);
    if (!dispute) {
      throw new Error('Dispute not found');
    }

    dispute.status = 'resolved';
    dispute.resolution = resolution;
    dispute.resolvedAt = Date.now();
    dispute.updatedAt = Date.now();

    this.addLog(dispute.id, 'resolved', resolution, resolvedBy);
    this.disputes.set(disputeId, dispute);

    console.log(`[Dispute] Resolved dispute ${disputeId}: ${resolution}`);
    return dispute;
  }

  /**
   * Reject dispute
   */
  rejectDispute(disputeId: string, reason: string, rejectedBy: string): Dispute {
    const dispute = this.disputes.get(disputeId);
    if (!dispute) {
      throw new Error('Dispute not found');
    }

    dispute.status = 'rejected';
    dispute.rejectionReason = reason;
    dispute.updatedAt = Date.now();

    this.addLog(dispute.id, 'rejected', reason, rejectedBy);
    this.disputes.set(disputeId, dispute);

    console.log(`[Dispute] Rejected dispute ${disputeId}: ${reason}`);
    return dispute;
  }

  /**
   * Escalate dispute
   */
  escalateDispute(disputeId: string, reason: string, escalatedBy: string): Dispute {
    const dispute = this.disputes.get(disputeId);
    if (!dispute) {
      throw new Error('Dispute not found');
    }

    dispute.status = 'escalated';
    dispute.priority = 'critical';
    dispute.updatedAt = Date.now();

    this.addLog(dispute.id, 'escalated', reason, escalatedBy);
    this.disputes.set(disputeId, dispute);

    console.log(`[Dispute] Escalated dispute ${disputeId}: ${reason}`);
    return dispute;
  }

  /**
   * Add evidence to dispute
   */
  addEvidence(disputeId: string, evidenceUrl: string, addedBy: string): Dispute {
    const dispute = this.disputes.get(disputeId);
    if (!dispute) {
      throw new Error('Dispute not found');
    }

    if (!dispute.evidence) {
      dispute.evidence = [];
    }
    dispute.evidence.push(evidenceUrl);
    dispute.updatedAt = Date.now();

    this.addLog(dispute.id, 'evidence_added', `Added evidence: ${evidenceUrl}`, addedBy);
    this.disputes.set(disputeId, dispute);

    console.log(`[Dispute] Added evidence to dispute ${disputeId}`);
    return dispute;
  }

  /**
   * Add log to dispute
   */
  private addLog(
    disputeId: string,
    action: string,
    description: string,
    performedBy: string,
    metadata?: any
  ): void {
    const dispute = this.disputes.get(disputeId);
    if (!dispute) return;

    const log: DisputeLog = {
      id: crypto.randomUUID(),
      disputeId,
      action,
      description,
      performedBy,
      performedAt: Date.now(),
      metadata,
    };

    dispute.logs.push(log);
  }

  /**
   * Get dispute logs
   */
  getDisputeLogs(disputeId: string): DisputeLog[] {
    const dispute = this.disputes.get(disputeId);
    if (!dispute) return [];
    return dispute.logs;
  }

  /**
   * Update dispute priority
   */
  updateDisputePriority(disputeId: string, priority: DisputePriority, updatedBy: string): Dispute {
    const dispute = this.disputes.get(disputeId);
    if (!dispute) {
      throw new Error('Dispute not found');
    }

    dispute.priority = priority;
    dispute.updatedAt = Date.now();

    this.addLog(dispute.id, 'priority_updated', `Priority changed to ${priority}`, updatedBy);
    this.disputes.set(disputeId, dispute);

    console.log(`[Dispute] Updated dispute ${disputeId} priority to ${priority}`);
    return dispute;
  }

  /**
   * Get open disputes
   */
  getOpenDisputes(): Dispute[] {
    return Array.from(this.disputes.values()).filter(d => d.status === 'open' || d.status === 'under_review');
  }

  /**
   * Get critical disputes
   */
  getCriticalDisputes(): Dispute[] {
    return Array.from(this.disputes.values()).filter(d => d.priority === 'critical' && d.status !== 'resolved');
  }

  /**
   * Get dispute stats
   */
  getDisputeStats(franchiseId?: string): {
    total: number;
    open: number;
    underReview: number;
    investigating: number;
    resolved: number;
    rejected: number;
    escalated: number;
    totalAmount: number;
  } {
    const disputes = franchiseId
      ? Array.from(this.disputes.values()).filter(d => d.franchiseId === franchiseId)
      : Array.from(this.disputes.values());

    const stats = {
      total: disputes.length,
      open: 0,
      underReview: 0,
      investigating: 0,
      resolved: 0,
      rejected: 0,
      escalated: 0,
      totalAmount: 0,
    };

    for (const dispute of disputes) {
      stats[dispute.status]++;
      if (dispute.amount) {
        stats.totalAmount += dispute.amount;
      }
    }

    return stats;
  }

  /**
   * Get disputes by time range
   */
  getDisputesByTimeRange(startDate: number, endDate: number): Dispute[] {
    return Array.from(this.disputes.values()).filter(
      d => d.createdAt >= startDate && d.createdAt <= endDate
    );
  }

  /**
   * Delete dispute
   */
  deleteDispute(disputeId: string): boolean {
    const dispute = this.disputes.get(disputeId);
    if (!dispute) return false;

    this.disputes.delete(disputeId);
    console.log(`[Dispute] Deleted dispute ${disputeId}`);
    return true;
  }

  /**
   * Cleanup old resolved disputes (older than 2 years)
   */
  cleanupOldDisputes(): number {
    const now = Date.now();
    const cutoff = now - (2 * 365 * 24 * 60 * 60 * 1000);
    let deletedCount = 0;

    for (const [id, dispute] of this.disputes.entries()) {
      if (dispute.status === 'resolved' && dispute.resolvedAt && dispute.resolvedAt < cutoff) {
        this.disputes.delete(id);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      console.log(`[Dispute] Cleaned up ${deletedCount} old resolved disputes`);
    }

    return deletedCount;
  }
}

const disputeSystemService = new DisputeSystemService();

// Auto-cleanup old disputes quarterly
setInterval(() => {
  disputeSystemService.cleanupOldDisputes();
}, 90 * 24 * 60 * 60 * 1000);

export default disputeSystemService;
export { DisputeSystemService };
export type { Dispute, DisputeLog, DisputeType, DisputeStatus, DisputePriority };
