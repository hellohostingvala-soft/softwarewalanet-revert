// Ledger Service
// double-entry (debit/credit) + chart_of_accounts + journal_entries immutable

import clockIdService from '../micro/clockIdService';

type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
type EntryType = 'debit' | 'credit';

interface ChartOfAccount {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  parentId?: string;
  currency: string;
  active: boolean;
  createdAt: number;
}

interface JournalEntry {
  id: string;
  entryNumber: string;
  date: number;
  description: string;
  referenceId?: string;
  referenceType?: string;
  lines: JournalLine[];
  totalDebit: number;
  totalCredit: number;
  status: 'draft' | 'posted' | 'voided';
  postedAt?: number;
  createdBy: string;
  createdAt: number;
  immutable: boolean;
}

interface JournalLine {
  id: string;
  accountId: string;
  entryId: string;
  type: EntryType;
  amount: number;
  currency: string;
  description?: string;
}

interface LedgerBalance {
  accountId: string;
  currency: string;
  debitBalance: number;
  creditBalance: number;
  netBalance: number;
  lastUpdated: number;
}

class LedgerService {
  private chartOfAccounts: Map<string, ChartOfAccount>;
  private journalEntries: Map<string, JournalEntry>;
  private ledgerBalances: Map<string, LedgerBalance>;
  private entrySequence: number;

  constructor() {
    this.chartOfAccounts = new Map();
    this.journalEntries = new Map();
    this.ledgerBalances = new Map();
    this.entrySequence = 1;
    this.initializeDefaultChartOfAccounts();
  }

  /**
   * Initialize default chart of accounts
   */
  private initializeDefaultChartOfAccounts(): void {
    const now = Date.now();
    const defaultAccounts: ChartOfAccount[] = [
      // Assets
      { id: 'acc_001', code: '1000', name: 'Cash', type: 'asset', currency: 'USD', active: true, createdAt: now },
      { id: 'acc_002', code: '1100', name: 'Accounts Receivable', type: 'asset', currency: 'USD', active: true, createdAt: now },
      { id: 'acc_003', code: '1200', name: 'Inventory', type: 'asset', currency: 'USD', active: true, createdAt: now },
      // Liabilities
      { id: 'acc_004', code: '2000', name: 'Accounts Payable', type: 'liability', currency: 'USD', active: true, createdAt: now },
      { id: 'acc_005', code: '2100', name: 'Deferred Revenue', type: 'liability', currency: 'USD', active: true, createdAt: now },
      // Equity
      { id: 'acc_006', code: '3000', name: 'Owner Equity', type: 'equity', currency: 'USD', active: true, createdAt: now },
      // Revenue
      { id: 'acc_007', code: '4000', name: 'Sales Revenue', type: 'revenue', currency: 'USD', active: true, createdAt: now },
      { id: 'acc_008', code: '4100', name: 'Service Revenue', type: 'revenue', currency: 'USD', active: true, createdAt: now },
      // Expenses
      { id: 'acc_009', code: '5000', name: 'Cost of Goods Sold', type: 'expense', currency: 'USD', active: true, createdAt: now },
      { id: 'acc_010', code: '5100', name: 'Operating Expenses', type: 'expense', currency: 'USD', active: true, createdAt: now },
    ];

    defaultAccounts.forEach(account => {
      this.chartOfAccounts.set(account.id, account);
      this.ledgerBalances.set(account.id, {
        accountId: account.id,
        currency: account.currency,
        debitBalance: 0,
        creditBalance: 0,
        netBalance: 0,
        lastUpdated: now,
      });
    });
  }

  /**
   * Create chart of account
   */
  createAccount(account: Omit<ChartOfAccount, 'id' | 'createdAt'>): ChartOfAccount {
    const newAccount: ChartOfAccount = {
      ...account,
      id: clockIdService.generateId(),
      createdAt: Date.now(),
    };

    this.chartOfAccounts.set(newAccount.id, newAccount);
    this.ledgerBalances.set(newAccount.id, {
      accountId: newAccount.id,
      currency: newAccount.currency,
      debitBalance: 0,
      creditBalance: 0,
      netBalance: 0,
      lastUpdated: Date.now(),
    });

    console.log(`[Ledger] Created account ${newAccount.code} - ${newAccount.name}`);
    return newAccount;
  }

  /**
   * Get account by code
   */
  getAccountByCode(code: string): ChartOfAccount | null {
    return Array.from(this.chartOfAccounts.values()).find(acc => acc.code === code) || null;
  }

  /**
   * Create journal entry (double-entry)
   */
  createJournalEntry(
    description: string,
    lines: Array<{ accountId: string; type: EntryType; amount: number; description?: string }>,
    referenceId?: string,
    referenceType?: string,
    createdBy: string = 'system'
  ): { success: boolean; entryId?: string; error?: string } {
    // Validate double-entry: total debits must equal total credits
    const totalDebit = lines.filter(l => l.type === 'debit').reduce((sum, l) => sum + l.amount, 0);
    const totalCredit = lines.filter(l => l.type === 'credit').reduce((sum, l) => sum + l.amount, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return { success: false, error: `Debits (${totalDebit}) do not equal credits (${totalCredit})` };
    }

    // Validate accounts exist
    for (const line of lines) {
      if (!this.chartOfAccounts.has(line.accountId)) {
        return { success: false, error: `Account ${line.accountId} not found` };
      }
    }

    const entryNumber = `JE${this.entrySequence.toString().padStart(6, '0')}`;
    this.entrySequence++;

    const journalLines: JournalLine[] = lines.map(line => ({
      id: clockIdService.generateId(),
      accountId: line.accountId,
      entryId: '', // Will be set after entry creation
      type: line.type,
      amount: line.amount,
      currency: this.chartOfAccounts.get(line.accountId)!.currency,
      description: line.description,
    }));

    const journalEntry: JournalEntry = {
      id: clockIdService.generateId(),
      entryNumber,
      date: Date.now(),
      description,
      referenceId,
      referenceType,
      lines: journalLines,
      totalDebit,
      totalCredit,
      status: 'draft',
      createdBy,
      createdAt: Date.now(),
      immutable: false,
    };

    // Set entryId in lines
    journalLines.forEach(line => line.entryId = journalEntry.id);

    this.journalEntries.set(journalEntry.id, journalEntry);

    console.log(`[Ledger] Created journal entry ${entryNumber}`);
    return { success: true, entryId: journalEntry.id };
  }

  /**
   * Post journal entry (immutable after posting)
   */
  postJournalEntry(entryId: string): { success: boolean; error?: string } {
    const entry = this.journalEntries.get(entryId);
    if (!entry) {
      return { success: false, error: 'Journal entry not found' };
    }

    if (entry.status === 'posted') {
      return { success: false, error: 'Entry already posted' };
    }

    // Update ledger balances
    for (const line of entry.lines) {
      const balance = this.ledgerBalances.get(line.accountId);
      if (!balance) continue;

      if (line.type === 'debit') {
        balance.debitBalance += line.amount;
      } else {
        balance.creditBalance += line.amount;
      }

      // Calculate net balance based on account type
      const account = this.chartOfAccounts.get(line.accountId);
      if (account) {
        if (account.type === 'asset' || account.type === 'expense') {
          balance.netBalance = balance.debitBalance - balance.creditBalance;
        } else {
          balance.netBalance = balance.creditBalance - balance.debitBalance;
        }
      }

      balance.lastUpdated = Date.now();
      this.ledgerBalances.set(line.accountId, balance);
    }

    // Mark as posted and immutable
    entry.status = 'posted';
    entry.postedAt = Date.now();
    entry.immutable = true;
    this.journalEntries.set(entryId, entry);

    console.log(`[Ledger] Posted journal entry ${entry.entryNumber}`);
    return { success: true };
  }

  /**
   * Void journal entry (create reversing entry)
   */
  voidJournalEntry(entryId: string, reason: string, createdBy: string): { success: boolean; reversalEntryId?: string; error?: string } {
    const entry = this.journalEntries.get(entryId);
    if (!entry) {
      return { success: false, error: 'Journal entry not found' };
    }

    if (entry.status !== 'posted') {
      return { success: false, error: 'Only posted entries can be voided' };
    }

    // Create reversing entry
    const reversingLines = entry.lines.map(line => ({
      accountId: line.accountId,
      type: line.type === 'debit' ? 'credit' : 'debit' as EntryType,
      amount: line.amount,
      description: `Reversal of ${line.description || entry.entryNumber}`,
    }));

    const result = this.createJournalEntry(
      `Void of ${entry.entryNumber}: ${reason}`,
      reversingLines,
      entryId,
      'void',
      createdBy
    );

    if (!result.success) {
      return result;
    }

    // Post the reversing entry
    this.postJournalEntry(result.entryId!);

    // Mark original as voided
    entry.status = 'voided';
    this.journalEntries.set(entryId, entry);

    console.log(`[Ledger] Voided journal entry ${entry.entryNumber}`);
    return { success: true, reversalEntryId: result.entryId };
  }

  /**
   * Get journal entry
   */
  getJournalEntry(entryId: string): JournalEntry | null {
    return this.journalEntries.get(entryId) || null;
  }

  /**
   * Get journal entries by reference
   */
  getJournalEntriesByReference(referenceId: string, referenceType?: string): JournalEntry[] {
    return Array.from(this.journalEntries.values()).filter(entry => {
      if (entry.referenceId !== referenceId) return false;
      if (referenceType && entry.referenceType !== referenceType) return false;
      return true;
    });
  }

  /**
   * Get ledger balance for account
   */
  getLedgerBalance(accountId: string): LedgerBalance | null {
    return this.ledgerBalances.get(accountId) || null;
  }

  /**
   * Get all ledger balances
   */
  getAllLedgerBalances(): LedgerBalance[] {
    return Array.from(this.ledgerBalances.values());
  }

  /**
   * Get chart of accounts
   */
  getChartOfAccounts(): ChartOfAccount[] {
    return Array.from(this.chartOfAccounts.values()).filter(acc => acc.active);
  }

  /**
   * Get trial balance
   */
  getTrialBalance(): {
    totalDebits: number;
    totalCredits: number;
    isBalanced: boolean;
    accounts: Array<{ accountId: string; accountName: string; debit: number; credit: number; net: number }>;
  } {
    const accounts: Array<{ accountId: string; accountName: string; debit: number; credit: number; net: number }> = [];
    let totalDebits = 0;
    let totalCredits = 0;

    for (const [accountId, balance] of this.ledgerBalances.entries()) {
      const account = this.chartOfAccounts.get(accountId);
      if (!account || !account.active) continue;

      accounts.push({
        accountId,
        accountName: account.name,
        debit: balance.debitBalance,
        credit: balance.creditBalance,
        net: balance.netBalance,
      });

      totalDebits += balance.debitBalance;
      totalCredits += balance.creditBalance;
    }

    const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

    return {
      totalDebits,
      totalCredits,
      isBalanced,
      accounts,
    };
  }

  /**
   * Get journal entry stats
   */
  getJournalEntryStats(): {
    total: number;
    draft: number;
    posted: number;
    voided: number;
  } {
    let draft = 0;
    let posted = 0;
    let voided = 0;

    for (const entry of this.journalEntries.values()) {
      switch (entry.status) {
        case 'draft':
          draft++;
          break;
        case 'posted':
          posted++;
          break;
        case 'voided':
          voided++;
          break;
      }
    }

    return {
      total: this.journalEntries.size,
      draft,
      posted,
      voided,
    };
  }
}

const ledgerService = new LedgerService();

export default ledgerService;
export { LedgerService };
export type { ChartOfAccount, JournalEntry, JournalLine, LedgerBalance, AccountType, EntryType };
