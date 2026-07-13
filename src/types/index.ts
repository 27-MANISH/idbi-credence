/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type VerificationStatus = 'Verified' | 'Under Review' | 'Contradictions Detected';
export type DocStatus = 'Extracted' | 'Verified' | 'Warning' | 'Pending' | 'Uploading';

export interface DocumentInfo {
  name: string;
  category: string;
  mandatory?: boolean;
  uploaded: boolean;
  status: DocStatus;
  fileName?: string;
  fileSize?: string;
  lastChecked?: string;
  extractedData?: {
    [key: string]: string | number;
  };
}

export interface FinancialMetric {
  year: string;
  turnover: number; // in Crores
  ebitda: number;   // in Crores
  pat: number;      // in Crores
  debtEquity: number;
  dscr: number;
  currentRatio: number;
}

export interface AuditLog {
  id: string;
  type: 'success' | 'warning' | 'contradiction';
  category: string;
  message: string;
  evidence: string;
  source: string;
  docLink?: string;
}

export interface Company {
  id: string;
  name: string;
  gstin: string;
  pan: string;
  cin: string;
  industry: string;
  turnover: number;     // in Crores
  loanAmount: number;   // in Crores
  existingBank: string;
  purpose: string;
  trustScore: number;   // 0 - 100
  status: VerificationStatus;
  verifiedAt?: string;
  metrics: FinancialMetric[];
  documents: DocumentInfo[];
  auditLogs: AuditLog[];
  reviewerNotes?: string;
  decision?: 'PENDING' | 'APPROVED' | 'REFERRED' | 'REJECTED';
  location?: string;
  grade?: string;
  aiSummary?: string;
  lastUpdated?: string;
}

export interface AgentRunState {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  output?: string;
  progress: number;
  logs: string[];
}
