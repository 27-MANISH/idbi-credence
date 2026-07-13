/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Company, VerificationStatus } from '@/types';
import { mockCompanies } from '@/lib/mockCompanies';

interface OfficerState {
  companies: Company[];
  selectedCompanyId: string | null;
  filters: {
    status: string;
    industry: string;
    search: string;
  };
  setSelectedCompanyId: (id: string | null) => void;
  updateCompany: (company: Company) => void;
  setFilters: (filters: Partial<OfficerState['filters']>) => void;
  addCompany: (company: Company) => void;
  approveCompany: (id: string, notes: string) => void;
  rejectCompany: (id: string, notes: string) => void;
  referCompany: (id: string, notes: string) => void;
  reset: () => void;
}

export const useOfficerStore = create<OfficerState>()(
  persist(
    (set) => ({
      companies: mockCompanies,
      selectedCompanyId: null,
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
