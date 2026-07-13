/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MonitoredLoan {
  id: string;
  companyName: string;
  industry: string;
  loanAmount: number; // in Crores
  outstandingAmount: number; // in Crores
  disbursedDate: string;
  interestRate: number; // percentage
  nextEmiDate: string;
  stressRate: number; // 0 - 100%
  riskTier: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  inWatchlist: boolean;
  scoreHistory: { month: string; score: number }[];
  alerts: {
    id: string;
    type: 'warning' | 'danger' | 'info';
    category: string;
    message: string;
    date: string;
  }[];
}

interface MonitoringState {
  loans: MonitoredLoan[];
  filters: {
    riskTier: string;
    industry: string;
    search: string;
    watchlistOnly: boolean;
  };
  setFilters: (filters: Partial<MonitoringState['filters']>) => void;
  toggleWatchlist: (id: string) => void;
  dismissAlert: (loanId: string, alertId: string) => void;
  addAlert: (loanId: string, alert: Omit<MonitoredLoan['alerts'][0], 'id' | 'date'>) => void;
  updateLoanStress: (id: string, stressRate: number) => void;
  reset: () => void;
}

const mockMonitoringLoans: MonitoredLoan[] = [
  {
    id: 'comp-1',
    companyName: 'Vardhman Agro-Textiles Pvt Ltd',
    industry: 'Textiles & Garments',
    loanAmount: 3.50,
    outstandingAmount: 3.25,
    disbursedDate: '2026-01-15',
    interestRate: 8.85,
    nextEmiDate: '2026-08-05',
    stressRate: 12,
    riskTier: 'LOW',
    inWatchlist: false,
    scoreHistory: [
      { month: 'Feb', score: 92 },
      { month: 'Mar', score: 93 },
      { month: 'Apr', score: 93 },
      { month: 'May', score: 94 },
      { month: 'Jun', score: 94 },
      { month: 'Jul', score: 94 }
    ],
    alerts: []
  },
  {
    id: 'comp-3',
    companyName: 'Apex Healthcare Diagnostics',
    industry: 'Healthcare & Pharma',
    loanAmount: 4.50,
    outstandingAmount: 4.30,
    disbursedDate: '2026-02-10',
    interestRate: 9.15,
    nextEmiDate: '2026-08-10',
    stressRate: 35,
    riskTier: 'MEDIUM',
    inWatchlist: false,
    scoreHistory: [
      { month: 'Feb', score: 85 },
      { month: 'Mar', score: 86 },
      { month: 'Apr', score: 84 },
      { month: 'May', score: 85 },
      { month: 'Jun', score: 83 },
      { month: 'Jul', score: 82 }
    ],
    alerts: [
      {
        id: 'alert-3-1',
        type: 'warning',
        category: 'UPI Volume',
        message: 'UPI inbound collections declined by 14.5% month-on-month.',
        date: '2026-07-12'
      }
    ]
  },
  {
    id: 'comp-4',
    companyName: 'Zephyr Wind Engineering',
    industry: 'Heavy Engineering',
    loanAmount: 6.00,
    outstandingAmount: 5.80,
    disbursedDate: '2025-11-20',
    interestRate: 9.50,
    nextEmiDate: '2026-08-01',
    stressRate: 78,
    riskTier: 'HIGH',
    inWatchlist: true,
    scoreHistory: [
      { month: 'Feb', score: 70 },
      { month: 'Mar', score: 68 },
      { month: 'Apr', score: 65 },
      { month: 'May', score: 60 },
      { month: 'Jun', score: 58 },
      { month: 'Jul', score: 55 }
    ],
    alerts: [
      {
        id: 'alert-4-1',
        type: 'danger',
        category: 'GST Delay',
        message: 'GSTR-3B filing for June 2026 is delayed by 18 days.',
        date: '2026-07-10'
      },
      {
        id: 'alert-4-2',
        type: 'warning',
        category: 'EPFO Compliance',
        message: 'EPFO contribution count decreased by 22% (headcount down from 84 to 65).',
        date: '2026-07-08'
      }
    ]
  },
  {
    id: 'comp-5',
    companyName: 'Narmada Organic Foods',
    industry: 'Agro-processing & Food',
    loanAmount: 1.80,
    outstandingAmount: 1.65,
    disbursedDate: '2026-03-01',
    interestRate: 8.75,
    nextEmiDate: '2026-08-05',
    stressRate: 20,
    riskTier: 'LOW',
    inWatchlist: false,
    scoreHistory: [
      { month: 'Mar', score: 78 },
      { month: 'Apr', score: 79 },
      { month: 'May', score: 81 },
      { month: 'Jun', score: 82 },
      { month: 'Jul', score: 82 }
    ],
    alerts: []
  },
  {
    id: 'comp-6',
    companyName: 'Matrix Smart Solutions',
    industry: 'IT & Software Services',
    loanAmount: 2.50,
    outstandingAmount: 2.38,
    disbursedDate: '2025-09-10',
    interestRate: 9.00,
    nextEmiDate: '2026-08-10',
    stressRate: 88,
    riskTier: 'CRITICAL',
    inWatchlist: true,
    scoreHistory: [
      { month: 'Feb', score: 62 },
      { month: 'Mar', score: 58 },
      { month: 'Apr', score: 52 },
      { month: 'May', score: 48 },
      { month: 'Jun', score: 45 },
      { month: 'Jul', score: 41 }
    ],
    alerts: [
      {
        id: 'alert-6-1',
        type: 'danger',
        category: 'Account Balance',
        message: 'Average Monthly Balance (AMB) dropped below loan EMI requirement.',
        date: '2026-07-11'
      },
      {
        id: 'alert-6-2',
        type: 'danger',
        category: 'Cheque Bounce',
        message: '3 cheque bounces recorded in current account statements within the last 30 days.',
        date: '2026-07-05'
      }
    ]
  }
];

export const useMonitoringStore = create<MonitoringState>()(
  persist(
    (set) => ({
      loans: mockMonitoringLoans,
      filters: {
        riskTier: 'ALL',
        industry: 'ALL',
        search: '',
        watchlistOnly: false,
      },
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),
      toggleWatchlist: (id) =>
        set((state) => ({
          loans: state.loans.map((loan) =>
            loan.id === id ? { ...loan, inWatchlist: !loan.inWatchlist } : loan
          ),
        })),
      dismissAlert: (loanId, alertId) =>
        set((state) => ({
          loans: state.loans.map((loan) =>
            loan.id === loanId
              ? {
                  ...loan,
                  alerts: loan.alerts.filter((a) => a.id !== alertId),
                  // Recalculate stressRate slightly down when an alert is dismissed
                  stressRate: Math.max(0, loan.stressRate - 5)
                }
              : loan
          ),
        })),
      addAlert: (loanId, alert) =>
        set((state) => ({
          loans: state.loans.map((loan) =>
            loan.id === loanId
              ? {
                  ...loan,
                  alerts: [
                    ...loan.alerts,
                    {
                      ...alert,
                      id: `alert-${Date.now()}`,
                      date: new Date().toISOString().slice(0, 10)
                    }
                  ],
                  // Increase stress rate with a new alert
                  stressRate: Math.min(100, loan.stressRate + 15)
                }
              : loan
          ),
        })),
      updateLoanStress: (id, stressRate) =>
        set((state) => ({
          loans: state.loans.map((loan) => {
            if (loan.id !== id) return loan;
            
            let riskTier: MonitoredLoan['riskTier'] = 'LOW';
            if (stressRate >= 75) riskTier = 'CRITICAL';
            else if (stressRate >= 50) riskTier = 'HIGH';
            else if (stressRate >= 25) riskTier = 'MEDIUM';

            return {
              ...loan,
              stressRate,
              riskTier
            };
          })
        })),
      reset: () =>
        set({
          loans: mockMonitoringLoans,
          filters: {
            riskTier: 'ALL',
            industry: 'ALL',
            search: '',
            watchlistOnly: false,
          },
        }),
    }),
    {
      name: 'credence-monitoring-storage',
    }
  )
);
