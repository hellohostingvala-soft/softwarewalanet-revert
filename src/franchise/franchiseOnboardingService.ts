// Franchise Onboarding Service
// KYC (PAN/GST/bank), approval flow → control-panel, status states (pending/verified/rejected)

type KYCStatus = 'pending' | 'submitted' | 'under_review' | 'verified' | 'rejected';
type KYCDocumentType = 'pan' | 'gst' | 'bank' | 'aadhaar' | 'company_registration';

interface KYCDocument {
  id: string;
  franchiseId: string;
  documentType: KYCDocumentType;
  documentNumber: string;
  documentUrl: string;
  uploadedAt: number;
  verifiedAt?: number;
  status: KYCStatus;
  rejectionReason?: string;
}

interface KYCSubmission {
  id: string;
  franchiseId: string;
  status: KYCStatus;
  documents: KYCDocument[];
  submittedAt: number;
  verifiedAt?: number;
  verifiedBy?: string;
  rejectionReason?: string;
}

class FranchiseOnboardingService {
  private kycSubmissions: Map<string, KYCSubmission>;
  private documents: Map<string, KYCDocument>;

  constructor() {
    this.kycSubmissions = new Map();
    this.documents = new Map();
  }

  /**
   * Create KYC submission
   */
  createKYCSubmission(franchiseId: string): KYCSubmission {
    const submission: KYCSubmission = {
      id: crypto.randomUUID(),
      franchiseId,
      status: 'pending',
      documents: [],
      submittedAt: Date.now(),
    };

    this.kycSubmissions.set(submission.id, submission);
    console.log(`[Onboarding] Created KYC submission for franchise ${franchiseId}`);
    return submission;
  }

  /**
   * Upload KYC document
   */
  uploadDocument(
    submissionId: string,
    documentType: KYCDocumentType,
    documentNumber: string,
    documentUrl: string
  ): KYCDocument {
    const submission = this.kycSubmissions.get(submissionId);
    if (!submission) {
      throw new Error('KYC submission not found');
    }

    const document: KYCDocument = {
      id: crypto.randomUUID(),
      franchiseId: submission.franchiseId,
      documentType,
      documentNumber,
      documentUrl,
      uploadedAt: Date.now(),
      status: 'pending',
    };

    this.documents.set(document.id, document);
    submission.documents.push(document);
    this.kycSubmissions.set(submissionId, submission);

    console.log(`[Onboarding] Uploaded ${documentType} document for submission ${submissionId}`);
    return document;
  }

  /**
   * Submit KYC for review
   */
  submitKYC(submissionId: string): KYCSubmission {
    const submission = this.kycSubmissions.get(submissionId);
    if (!submission) {
      throw new Error('KYC submission not found');
    }

    // Validate required documents
    const requiredDocs: KYCDocumentType[] = ['pan', 'gst', 'bank'];
    const uploadedTypes = submission.documents.map(d => d.documentType);
    const missingDocs = requiredDocs.filter(type => !uploadedTypes.includes(type));

    if (missingDocs.length > 0) {
      throw new Error(`Missing required documents: ${missingDocs.join(', ')}`);
    }

    submission.status = 'submitted';
    submission.submittedAt = Date.now();
    this.kycSubmissions.set(submissionId, submission);

    // Trigger approval flow → control-panel
    this.triggerApprovalFlow(submission);

    console.log(`[Onboarding] Submitted KYC ${submissionId} for review`);
    return submission;
  }

  /**
   * Trigger approval flow to control-panel
   */
  private triggerApprovalFlow(submission: KYCSubmission): void {
    // In production, this would call control-panel API
    console.log(`[Onboarding] Triggered approval flow for submission ${submission.id} to control-panel`);
  }

  /**
   * Verify KYC document
   */
  verifyDocument(documentId: string, verifiedBy: string): KYCDocument {
    const document = this.documents.get(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    document.status = 'verified';
    document.verifiedAt = Date.now();
    this.documents.set(documentId, document);

    // Check if all documents are verified
    this.checkSubmissionStatus(document.franchiseId);

    console.log(`[Onboarding] Verified document ${documentId}`);
    return document;
  }

  /**
   * Reject KYC document
   */
  rejectDocument(documentId: string, reason: string, verifiedBy: string): KYCDocument {
    const document = this.documents.get(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    document.status = 'rejected';
    document.rejectionReason = reason;
    this.documents.set(documentId, document);

    // Update submission status
    const submission = this.getSubmissionByFranchise(document.franchiseId);
    if (submission) {
      submission.status = 'rejected';
      submission.rejectionReason = reason;
      submission.verifiedBy = verifiedBy;
      this.kycSubmissions.set(submission.id, submission);
    }

    console.log(`[Onboarding] Rejected document ${documentId}: ${reason}`);
    return document;
  }

  /**
   * Check submission status
   */
  private checkSubmissionStatus(franchiseId: string): void {
    const submission = this.getSubmissionByFranchise(franchiseId);
    if (!submission) return;

    const allVerified = submission.documents.every(d => d.status === 'verified');
    const anyRejected = submission.documents.some(d => d.status === 'rejected');

    if (anyRejected) {
      submission.status = 'rejected';
    } else if (allVerified) {
      submission.status = 'verified';
      submission.verifiedAt = Date.now();
    } else {
      submission.status = 'under_review';
    }

    this.kycSubmissions.set(submission.id, submission);
  }

  /**
   * Get submission by franchise
   */
  getSubmissionByFranchise(franchiseId: string): KYCSubmission | null {
    return Array.from(this.kycSubmissions.values()).find(s => s.franchiseId === franchiseId) || null;
  }

  /**
   * Get submission by ID
   */
  getSubmission(submissionId: string): KYCSubmission | null {
    return this.kycSubmissions.get(submissionId) || null;
  }

  /**
   * Get document by ID
   */
  getDocument(documentId: string): KYCDocument | null {
    return this.documents.get(documentId) || null;
  }

  /**
   * Get all pending submissions
   */
  getPendingSubmissions(): KYCSubmission[] {
    return Array.from(this.kycSubmissions.values()).filter(
      s => s.status === 'submitted' || s.status === 'under_review'
    );
  }

  /**
   * Get all verified submissions
   */
  getVerifiedSubmissions(): KYCSubmission[] {
    return Array.from(this.kycSubmissions.values()).filter(s => s.status === 'verified');
  }

  /**
   * Get all rejected submissions
   */
  getRejectedSubmissions(): KYCSubmission[] {
    return Array.from(this.kycSubmissions.values()).filter(s => s.status === 'rejected');
  }

  /**
   * Re-submit KYC after rejection
   */
  resubmitKYC(submissionId: string): KYCSubmission {
    const submission = this.kycSubmissions.get(submissionId);
    if (!submission) {
      throw new Error('KYC submission not found');
    }

    // Reset rejected documents
    submission.documents.forEach(doc => {
      if (doc.status === 'rejected') {
        doc.status = 'pending';
        doc.rejectionReason = undefined;
        this.documents.set(doc.id, doc);
      }
    });

    submission.status = 'pending';
    submission.rejectionReason = undefined;
    submission.verifiedBy = undefined;
    this.kycSubmissions.set(submissionId, submission);

    console.log(`[Onboarding] Re-submitted KYC ${submissionId}`);
    return submission;
  }

  /**
   * Get KYC stats
   */
  getKYCStats(): {
    total: number;
    pending: number;
    submitted: number;
    underReview: number;
    verified: number;
    rejected: number;
  } {
    const stats = {
      total: this.kycSubmissions.size,
      pending: 0,
      submitted: 0,
      underReview: 0,
      verified: 0,
      rejected: 0,
    };

    for (const submission of this.kycSubmissions.values()) {
      stats[submission.status]++;
    }

    return stats;
  }

  /**
   * Delete submission
   */
  deleteSubmission(submissionId: string): boolean {
    const submission = this.kycSubmissions.get(submissionId);
    if (!submission) return false;

    // Delete all documents
    submission.documents.forEach(doc => {
      this.documents.delete(doc.id);
    });

    this.kycSubmissions.delete(submissionId);
    console.log(`[Onboarding] Deleted KYC submission ${submissionId}`);
    return true;
  }
}

const franchiseOnboardingService = new FranchiseOnboardingService();

export default franchiseOnboardingService;
export { FranchiseOnboardingService };
export type { KYCSubmission, KYCDocument, KYCStatus, KYCDocumentType };
