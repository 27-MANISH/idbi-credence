/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Company, VerificationStatus } from '@/types';
import { mockCompanies } from '@/lib/mockCompanies';
import type { QueueItem } from '@/lib/api';

interface OfficerState {
  companies: Company[];
  selectedCompanyId: string | null;
  queueFetchedAt: number | null; // epoch ms — used to throttle re-fetches
  filters: {
    status: string;
    industry: string;
    search: string;
  };
  setSelectedCompanyId: (id: string | null) => void;
  updateCompany: (company: Company) => void;
  setFilters: (filters: Partial<OfficerState['filters']>) => void;
  addCompany: (company: Company) => void;
  /** Replace the entire company list (used after a successful API queue fetch) */
  setCompanies: (companies: Company[]) => void;
  /**
   * Merge real API queue items into the local store.
   * Items that already exist (by ID) are updated; new ones are prepended.
   * Mock-only entries are preserved so the UI never goes empty.
   */
  mergeFromQueue: (items: QueueItem[]) => void;
  approveCompany: (id: string, notes: string) => void;
  rejectCompany: (id: string, notes: string) => void;
  referCompany: (id: string, notes: string) => void;
  reset: () => void;
}

/** Map a QueueItem from the API into the local Company shape */
function queueItemToCompany(item: QueueItem): Company {
  const { loan, profile, score } = item;

  // Decide trust score: prefer API overall_score (0-100), fall back to 70
  const trustScore = score
    ? Math.round(score.overall_score > 100 ? (score.overall_score - 300) / 6 : score.overall_score)
    : 70;

  return {
    id: loan.id,
    name: profile.name ?? 'Unknown Company',
    gstin: profile.gstin ?? '',
    pan: 'AAACK4821D', // not returned by API — keep placeholder
    cin: 'U00000MH2000PLC000000',
    industry: profile.type ?? 'General',
    turnover: loan.amount / 1_00_00_000, // INR → Crores
    loanAmount: loan.amount / 1_00_00_000,
    existingBank: '',
    purpose: loan.loan_type,
    trustScore,
    status: (loan.status === 'APPROVED'
      ? 'Verified'
      : loan.status === 'REJECTED'
      ? 'Contradictions Detected'
      : 'Under Review') as VerificationStatus,
    decision: (loan.status as Company['decision']) ?? 'PENDING',
    grade: score?.grade ?? 'B',
    verifiedAt: loan.decided_at
      ? new Date(loan.decided_at).toISOString().slice(0, 16).replace('T', ' ')
      : undefined,
    reviewerNotes: '',
    aiSummary: score?.explanation ?? undefined,
    metrics: [
      {
        year: 'FY26',
        turnover: loan.amount / 1_00_00_000,
        ebitda: (loan.amount / 1_00_00_000) * 0.14,
        pat: (loan.amount / 1_00_00_000) * 0.07,
        debtEquity: 0.88,
        dscr: 1.76,
        currentRatio: 1.52,
      },
    ],
    documents: [],
    auditLogs: [],
    lastUpdated: loan.created_at,
  };
}

export const useOfficerStore = create<OfficerState>()(
  persist(
    (set, get) => ({
      companies: mockCompanies,
      selectedCompanyId: null,
      queueFetchedAt: null,
      filters: {
        status: 'ALL',
        industry: 'ALL',
        search: '',
      },

      setSelectedCompanyId: (id) => set({ selectedCompanyId: id }),

      updateCompany: (updatedCompany) =>
        set((state) => ({
          companies: state.companies.map((c) =>
            c.id === updatedCompany.id ? updatedCompany : c
          ),
        })),

      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),

      addCompany: (newCompany) =>
        set((state) => ({
          companies: [newCompany, ...state.companies],
        })),

      setCompanies: (companies) =>
        set({ companies, queueFetchedAt: Date.now() }),

      mergeFromQueue: (items: QueueItem[]) => {
        const mapped = items.map(queueItemToCompany);
        set((state) => {
          const existingIds = new Set(state.companies.map((c) => c.id));
          const newItems = mapped.filter((m) => !existingIds.has(m.id));
          const merged = state.companies.map((c) => {
            const fresh = mapped.find((m) => m.id === c.id);
            return fresh ? { ...c, ...fresh } : c;
          });
          return {
            companies: [...newItems, ...merged],
            queueFetchedAt: Date.now(),
          };
        });
      },

      approveCompany: (id, notes) =>
        set((state) => ({
          companies: state.companies.map((c) =>
            c.id === id
              ? {
                  ...c,
                  decision: 'APPROVED',
                  status: 'Verified' as VerificationStatus,
                  reviewerNotes: notes,
                  verifiedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
                }
              : c
          ),
        })),

      rejectCompany: (id, notes) =>
        set((state) => ({
          companies: state.companies.map((c) =>
            c.id === id
              ? {
                  ...c,
                  decision: 'REJECTED',
                  status: 'Contradictions Detected' as VerificationStatus,
                  reviewerNotes: notes,
                }
              : c
          ),
        })),

      referCompany: (id, notes) =>
        set((state) => ({
          companies: state.companies.map((c) =>
            c.id === id
              ? {
                  ...c,
                  decision: 'REFERRED',
                  status: 'Under Review' as VerificationStatus,
                  reviewerNotes: notes,
                }
              : c
          ),
        })),

      reset: () =>
        set({
          companies: mockCompanies,
          selectedCompanyId: null,
          queueFetchedAt: null,
          filters: {
            status: 'ALL',
            industry: 'ALL',
            search: '',
          },
        }),
    }),
    {
      name: 'credence-officer-storage',
    }
  )
);
