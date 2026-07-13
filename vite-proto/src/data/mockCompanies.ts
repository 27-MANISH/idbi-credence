/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Company } from '../types';

export const mockCompanies: Company[] = [
  {
    id: 'comp-1',
    name: 'Vardhman Agro-Textiles Pvt Ltd',
    gstin: '03AAAAV1234A1Z5',
    pan: 'AAAAV1234A',
    cin: 'U17111PB2012PTC036123',
    industry: 'Textiles & Garments',
    turnover: 24.5,
    loanAmount: 3.50,
    existingBank: 'State Bank of India',
    purpose: 'Working Capital & Cotton Inventory Procurement',
    trustScore: 94,
    status: 'Verified',
    verifiedAt: '2026-07-10 14:32',
    decision: 'APPROVED',
    location: 'Ludhiana, Punjab',
    grade: 'A+',
    aiSummary: 'Excellent compliance with 99.1% GSTR matching. Solid margins and conservative debt levels make it a pristine credit profile.',
    lastUpdated: '10 Jul 2026',
    reviewerNotes: 'Strong financials. GST returns match 3-year audit logs with 99.1% precision. No active litigation found. Cash flows are stable, and the debt-to-equity ratio remains conservative at 0.8x. Highly recommended for working capital sanction.',
    metrics: [
      { year: 'FY24', turnover: 19.2, ebitda: 2.1, pat: 1.1, debtEquity: 0.92, dscr: 1.82, currentRatio: 1.45 },
      { year: 'FY25', turnover: 22.1, ebitda: 2.5, pat: 1.3, debtEquity: 0.85, dscr: 1.91, currentRatio: 1.52 },
      { year: 'FY26', turnover: 24.5, ebitda: 2.9, pat: 1.6, debtEquity: 0.78, dscr: 2.10, currentRatio: 1.60 }
    ],
    documents: [
      { name: 'Balance Sheet (3 years)', category: 'Mandatory', uploaded: true, status: 'Verified', fileName: 'Audited_BS_FY24-FY26.pdf', fileSize: '4.8 MB', lastChecked: '10 Jul 2026', extractedData: { 'Equity Capital': '₹5.2 Cr', 'Long-term Borrowings': '₹4.1 Cr', 'Net Fixed Assets': '₹7.8 Cr' } },
      { name: 'Profit & Loss Statement', category: 'Mandatory', uploaded: true, status: 'Verified', fileName: 'Audited_PL_FY24-FY26.pdf', fileSize: '3.2 MB', lastChecked: '10 Jul 2026', extractedData: { 'Gross Margin': '18.4%', 'Depreciation': '₹45L', 'Tax Provision': '₹52L' } },
      { name: 'GST Returns (GSTR-1 & 3B)', category: 'Mandatory', uploaded: true, status: 'Verified', fileName: 'Consolidated_GST_FY26.pdf', fileSize: '12.4 MB', lastChecked: '10 Jul 2026', extractedData: { 'GST Sales Summary': '₹24.32 Cr', 'Active Registrations': '1 State' } },
      { name: 'Bank Statements (12 months)', category: 'Mandatory', uploaded: true, status: 'Verified', fileName: 'SBI_CA_Statement_FY26.pdf', fileSize: '18.9 MB', lastChecked: '10 Jul 2026', extractedData: { 'Avg Monthly Balance': '₹38.5L', 'Inward Cleared Chqs': '412', 'Bounces': '0' } },
      { name: 'Income Tax Returns (ITR-6)', category: 'Mandatory', uploaded: true, status: 'Verified', fileName: 'ITR6_FY24-FY25.pdf', fileSize: '5.1 MB', lastChecked: '10 Jul 2026', extractedData: { 'Assessed Taxable Income': '₹1.55 Cr', 'Tax Paid': '₹50.4L' } }
    ],
    auditLogs: [
      { id: 'log-1-1', type: 'success', category: 'Revenue Integrity', message: 'GST Sales & P&L Turnover match exactly.', evidence: 'GSTR-1 Filed Sales: ₹24.32 Cr vs. P&L Net Sales: ₹24.50 Cr (0.7% variance holds within standard non-taxable scrap adjustments).', source: 'GST Consolidated & Audited P&L' }
    ]
  },
  {
    id: 'comp-2',
    name: 'Kalyan Logistics & Warehousing Ltd',
    gstin: '27AABCK5562K2Z3',
    pan: 'AABCK5562K',
    cin: 'U60231MH2016PLC281452',
    industry: 'Logistics & Supply Chain',
    turnover: 18.2,
    loanAmount: 2.00,
    existingBank: 'HDFC Bank Ltd',
    purpose: 'Expansion of Cold Chain Fleet (Multi-Axle Reefers)',
    trustScore: 76,
    status: 'Under Review',
    decision: 'PENDING',
    location: 'Navi Mumbai, Maharashtra',
    grade: 'B+',
    aiSummary: 'Stable operational logistics but showing high Cash Credit limits utilization and a minor historical MCA delay.',
    lastUpdated: '08 Jul 2026',
    reviewerNotes: 'Moderate business performance. There is an MCA compliance delay warning due to late filing of form AOC-4 for FY25. Debt service coverage is tight in FY26 (1.21x) due to recent term loans taken for warehousing equipment.',
    metrics: [
      { year: 'FY24', turnover: 14.5, ebitda: 1.6, pat: 0.8, debtEquity: 1.10, dscr: 1.45, currentRatio: 1.25 },
      { year: 'FY25', turnover: 16.8, ebitda: 1.8, pat: 0.9, debtEquity: 1.35, dscr: 1.30, currentRatio: 1.18 },
      { year: 'FY26', turnover: 18.2, ebitda: 1.9, pat: 0.8, debtEquity: 1.55, dscr: 1.21, currentRatio: 1.12 }
    ],
    documents: [
      { name: 'Balance Sheet (3 years)', category: 'Mandatory', uploaded: true, status: 'Verified', fileName: 'BS_Kalyan_Logistics.pdf', fileSize: '5.1 MB', lastChecked: '08 Jul 2026' },
      { name: 'Profit & Loss Statement', category: 'Mandatory', uploaded: true, status: 'Verified', fileName: 'PL_Kalyan_Logistics.pdf', fileSize: '3.0 MB', lastChecked: '08 Jul 2026' },
      { name: 'GST Returns (GSTR-1 & 3B)', category: 'Mandatory', uploaded: true, status: 'Verified', fileName: 'GST_All_Months_FY26.pdf', fileSize: '15.2 MB', lastChecked: '08 Jul 2026' }
    ],
    auditLogs: [
      { id: 'log-2-1', type: 'success', category: 'Revenue Integrity', message: 'GST sales trace well with P&L billing cycle.', evidence: 'FY26 GSTR-3B total taxable value aligns at ₹18.05 Cr against audited sales of ₹18.20 Cr.', source: 'GST vs P&L' }
    ]
  },
  {
    id: 'comp-3',
    name: 'Apex Healthcare & Pharma Distributors',
    gstin: '09AAACA9911D1Z1',
    pan: 'AAACA9911D',
    cin: 'U24232UP2019PTC114922',
    industry: 'Healthcare & Pharmaceuticals',
    turnover: 42.1,
    loanAmount: 6.50,
    existingBank: 'Axis Bank Ltd',
    purpose: 'Bulk API Raw Materials Inventory Finance',
    trustScore: 42,
    status: 'Contradictions Detected',
    decision: 'REJECTED',
    location: 'Lucknow, Uttar Pradesh',
    grade: 'D',
    aiSummary: 'Severe revenue contradictions flagged between GSTR-1 filings and P&L statements. Outstanding cheque bounces indicate liquidity distress.',
    lastUpdated: '09 Jul 2026',
    reviewerNotes: 'Severe accounting inconsistencies flagged. GSTR-1 declared sales are ₹31.2 Cr, but the company claimed ₹42.1 Cr turnover in the audited P&L Statement - a massive unexplained difference of ₹10.9 Cr (representing 25.8% inflated sales). High fraud risk warning.',
    metrics: [
      { year: 'FY24', turnover: 32.5, ebitda: 3.4, pat: 1.8, debtEquity: 1.82, dscr: 1.65, currentRatio: 1.15 },
      { year: 'FY25', turnover: 38.0, ebitda: 3.9, pat: 1.9, debtEquity: 2.10, dscr: 1.32, currentRatio: 1.05 },
      { year: 'FY26', turnover: 42.1, ebitda: 4.2, pat: 2.1, debtEquity: 2.45, dscr: 1.12, currentRatio: 0.94 }
    ],
    documents: [
      { name: 'Balance Sheet (3 years)', category: 'Mandatory', uploaded: true, status: 'Warning', fileName: 'APEX_BS_FY24-FY26.pdf', fileSize: '6.4 MB', lastChecked: '09 Jul 2026' },
      { name: 'Profit & Loss Statement', category: 'Mandatory', uploaded: true, status: 'Warning', fileName: 'APEX_PL_FY24-FY26.pdf', fileSize: '4.2 MB', lastChecked: '09 Jul 2026' }
    ],
    auditLogs: [
      { id: 'log-3-1', type: 'contradiction', category: 'Revenue Inflation', message: 'Massive Turnover Inconsistency between GST & P&L.', evidence: 'FY26 GSTR-1 Consolidated Sales filed: ₹31.20 Cr vs Audited P&L reported Sales: ₹42.10 Cr.', source: 'GST API vs Audited P&L' }
    ]
  },
  {
    id: 'comp-4',
    name: 'Hindustan Precision Alloys Pvt Ltd',
    gstin: '08AAAAC2241G1Z9',
    pan: 'AAAAC2241G',
    cin: 'U27100RJ2018PTC061245',
    industry: 'Engineering & Heavy Metallurgy',
    turnover: 35.0,
    loanAmount: 5.00,
    existingBank: 'Bank of Baroda',
    purpose: 'CNC Machinery Import & Factory Shed Modernization',
    trustScore: 68,
    status: 'Under Review',
    decision: 'REFERRED',
    location: 'Jaipur, Rajasthan',
    grade: 'B',
    aiSummary: 'Asset-heavy precision engineering. Rising leverage and snug debt service coverage require collateral-backed risk overrides.',
    lastUpdated: '11 Jul 2026',
    reviewerNotes: 'Asset-heavy business with solid infrastructure, but experiencing high leverage. Debt-to-Equity sits at 1.95x in FY26, climbing from 1.1x in FY24. DSCR is currently 1.16x, close to safety limits.',
    metrics: [
      { year: 'FY24', turnover: 28.5, ebitda: 3.1, pat: 1.2, debtEquity: 1.10, dscr: 1.55, currentRatio: 1.22 },
      { year: 'FY25', turnover: 32.0, ebitda: 3.4, pat: 1.1, debtEquity: 1.58, dscr: 1.28, currentRatio: 1.15 },
      { year: 'FY26', turnover: 35.0, ebitda: 3.6, pat: 0.9, debtEquity: 1.95, dscr: 1.16, currentRatio: 1.08 }
    ],
    documents: [
      { name: 'Balance Sheet (3 years)', category: 'Mandatory', uploaded: true, status: 'Verified', fileName: 'HPA_BalanceSheet_Signed.pdf', fileSize: '8.2 MB', lastChecked: '11 Jul 2026' }
    ],
    auditLogs: [
      { id: 'log-4-1', type: 'success', category: 'Revenue Traceability', message: 'GST filings match reported sales with high integrity.', evidence: 'FY26 GSTR-1 Sales matches reported P&L sales within 0.5%.', source: 'GST API vs P&L Accounts' }
    ]
  },
  {
    id: 'comp-5',
    name: 'ABC Manufacturing Co.',
    gstin: '24AAACB9012G1Z3',
    pan: 'AAACB9012G',
    cin: 'U28111GJ2015PTC085112',
    industry: 'Heavy Manufacturing',
    turnover: 28.4,
    loanAmount: 4.00,
    existingBank: 'State Bank of India',
    purpose: 'Automated Casting Line Procurement and Scaling',
    trustScore: 91,
    status: 'Verified',
    verifiedAt: '2026-07-12 09:15',
    decision: 'APPROVED',
    location: 'Ahmedabad, Gujarat',
    grade: 'A',
    aiSummary: 'Consistent production ledger. High turnover with zero tax deviations, verified labor payouts, and strong cash reserves.',
    lastUpdated: '12 Jul 2026',
    reviewerNotes: 'Highly consistent heavy manufacturing provider. Reconciled 100% of GST invoices directly with trade ledger books. No compliance warnings flagged on MCA registry sweeps. Recommended for prompt approval.',
    metrics: [
      { year: 'FY24', turnover: 22.1, ebitda: 2.5, pat: 1.2, debtEquity: 0.95, dscr: 1.70, currentRatio: 1.38 },
      { year: 'FY25', turnover: 25.6, ebitda: 2.9, pat: 1.5, debtEquity: 0.88, dscr: 1.82, currentRatio: 1.45 },
      { year: 'FY26', turnover: 28.4, ebitda: 3.4, pat: 1.8, debtEquity: 0.72, dscr: 2.05, currentRatio: 1.51 }
    ],
    documents: [
      { name: 'Balance Sheet (3 years)', category: 'Mandatory', uploaded: true, status: 'Verified', fileName: 'ABC_BS_Final.pdf', fileSize: '4.5 MB', lastChecked: '12 Jul 2026' }
    ],
    auditLogs: [
      { id: 'log-5-1', type: 'success', category: 'Revenue Verification', message: 'Spotless match against bank credits.', evidence: 'Inward current account credits show perfect alignment with declared quarterly GSTR returns.', source: 'Bank API Integrations' }
    ]
  },
  {
    id: 'comp-6',
    name: 'Green Agro Industries',
    gstin: '27AAACG5512B1Z8',
    pan: 'AAACG5512B',
    cin: 'U01111MH2018PTC301245',
    industry: 'Agri-tech & Food Processing',
    turnover: 14.8,
    loanAmount: 1.80,
    existingBank: 'Bank of Baroda',
    purpose: 'Cold Storage Warehouse & Fruit Packing Sorting Lines',
    trustScore: 88,
    status: 'Verified',
    verifiedAt: '2026-07-11 11:24',
    decision: 'APPROVED',
    location: 'Pune, Maharashtra',
    grade: 'A-',
    aiSummary: 'Organic processing facility with robust regional supply contracts. Spotless direct bank inflows reconciliation.',
    lastUpdated: '11 Jul 2026',
    reviewerNotes: 'Excellent performance in agricultural cold chain storage. Financial files are clean, GSTR reporting is flawless, and current assets completely back the requested working capital limit.',
    metrics: [
      { year: 'FY24', turnover: 11.2, ebitda: 1.2, pat: 0.6, debtEquity: 0.75, dscr: 1.95, currentRatio: 1.50 },
      { year: 'FY25', turnover: 13.1, ebitda: 1.4, pat: 0.7, debtEquity: 0.80, dscr: 1.85, currentRatio: 1.42 },
      { year: 'FY26', turnover: 14.8, ebitda: 1.7, pat: 0.9, debtEquity: 0.68, dscr: 2.10, currentRatio: 1.55 }
    ],
    documents: [
      { name: 'Balance Sheet (3 years)', category: 'Mandatory', uploaded: true, status: 'Verified', fileName: 'GreenAgro_BS.pdf', fileSize: '3.9 MB', lastChecked: '11 Jul 2026' }
    ],
    auditLogs: [
      { id: 'log-6-1', type: 'success', category: 'Compliance Audit', message: 'No outstanding tax dues verified.', evidence: 'Direct income tax and corporate filings trace with no historical arrears or recovery proceedings.', source: 'ITD Database Link' }
    ]
  },
  {
    id: 'comp-7',
    name: 'TechNova Solutions Pvt Ltd',
    gstin: '29AAACT1024C1Z0',
    pan: 'AAACT1024C',
    cin: 'U72200KA2020PTC135412',
    industry: 'Technology Services',
    turnover: 32.2,
    loanAmount: 2.50,
    existingBank: 'ICICI Bank Ltd',
    purpose: 'R&D Lab Capitalization & Enterprise Cloud Infrastructure',
    trustScore: 96,
    status: 'Verified',
    verifiedAt: '2026-07-12 08:30',
    decision: 'APPROVED',
    location: 'Bengaluru, Karnataka',
    grade: 'A+',
    aiSummary: 'SaaS-based enterprise solutions. Zero-debt capital structure, exceptionally high liquidity ratios, and spotless compliance history.',
    lastUpdated: '12 Jul 2026',
    reviewerNotes: 'Software vendor displaying pristine balance sheet health. Highly liquid with short-term cash reserves of ₹4.8 Cr. Low asset-leverage and excellent service multipliers. Highly approved.',
    metrics: [
      { year: 'FY24', turnover: 24.0, ebitda: 3.6, pat: 2.1, debtEquity: 0.15, dscr: 4.50, currentRatio: 2.20 },
      { year: 'FY25', turnover: 28.5, ebitda: 4.5, pat: 2.8, debtEquity: 0.12, dscr: 5.12, currentRatio: 2.45 },
      { year: 'FY26', turnover: 32.2, ebitda: 5.4, pat: 3.5, debtEquity: 0.08, dscr: 6.50, currentRatio: 2.80 }
    ],
    documents: [
      { name: 'Balance Sheet (3 years)', category: 'Mandatory', uploaded: true, status: 'Verified', fileName: 'TechNova_BS_3Yr.pdf', fileSize: '4.1 MB', lastChecked: '12 Jul 2026' }
    ],
    auditLogs: [
      { id: 'log-7-1', type: 'success', category: 'EPFO Matching', message: 'Salary payouts and EPF logs verify team strength.', evidence: 'Consistent monthly remittances for 124 software engineers verified.', source: 'EPFO Central Registry' }
    ]
  },
  {
    id: 'comp-8',
    name: 'Sunrise Textiles Ltd',
    gstin: '33AAACS1102A1Z1',
    pan: 'AAACS1102A',
    cin: 'U17111TZ2014PLC021452',
    industry: 'Textiles & Garments',
    turnover: 21.0,
    loanAmount: 3.20,
    existingBank: 'Canara Bank',
    purpose: 'High-speed Weaving Loom Acquisition & Solar Energy Offset',
    trustScore: 64,
    status: 'Under Review',
    decision: 'PENDING',
    location: 'Coimbatore, Tamil Nadu',
    grade: 'B-',
    aiSummary: 'Steady textile manufacturer, but liquidity is tightly squeezed by slow retail collections and elevated trade debtor days.',
    lastUpdated: '07 Jul 2026',
    reviewerNotes: 'Operations are stable but current ratio is tight at 1.05x. Working capital cycle has lengthened to 112 days. Requires review of the debtor aging list to verify invoice liquidity.',
    metrics: [
      { year: 'FY24', turnover: 18.5, ebitda: 2.1, pat: 0.9, debtEquity: 1.15, dscr: 1.45, currentRatio: 1.18 },
      { year: 'FY25', turnover: 19.8, ebitda: 2.2, pat: 0.8, debtEquity: 1.28, dscr: 1.35, currentRatio: 1.10 },
      { year: 'FY26', turnover: 21.0, ebitda: 2.3, pat: 0.7, debtEquity: 1.42, dscr: 1.22, currentRatio: 1.05 }
    ],
    documents: [
      { name: 'Balance Sheet (3 years)', category: 'Mandatory', uploaded: true, status: 'Verified', fileName: 'Sunrise_BS_FY26.pdf', fileSize: '5.6 MB', lastChecked: '07 Jul 2026' }
    ],
    auditLogs: [
      { id: 'log-8-1', type: 'warning', category: 'Debtor Concentration', message: 'Receivables stretch exceeds sector averages.', evidence: 'Outstanding bills over 90 days represent 42% of active book assets.', source: 'Receivables Aging Audit' }
    ]
  },
  {
    id: 'comp-9',
    name: 'Prime Logistics Hub',
    gstin: '33AAACP5524K1Z4',
    pan: 'AAACP5524K',
    cin: 'U63090TN2017PTC115421',
    industry: 'Logistics & Supply Chain',
    turnover: 19.5,
    loanAmount: 2.80,
    existingBank: 'Axis Bank Ltd',
    purpose: 'Distribution Hub Automation & Cargo Van Fleet',
    trustScore: 82,
    status: 'Verified',
    verifiedAt: '2026-07-12 04:12',
    decision: 'APPROVED',
    location: 'Chennai, Tamil Nadu',
    grade: 'B+',
    aiSummary: 'Consistent warehousing handler. Moderate cash reserves offset by outstanding regional supply chains and stable EPF registers.',
    lastUpdated: '12 Jul 2026',
    reviewerNotes: 'Highly structured logistics partner. MCA filings are complete and current, GST tax records match trade accounts, and debt-service metrics hold within reasonable bank guidelines.',
    metrics: [
      { year: 'FY24', turnover: 15.2, ebitda: 1.8, pat: 0.8, debtEquity: 1.05, dscr: 1.62, currentRatio: 1.28 },
      { year: 'FY25', turnover: 17.4, ebitda: 2.1, pat: 1.0, debtEquity: 0.98, dscr: 1.70, currentRatio: 1.32 },
      { year: 'FY26', turnover: 19.5, ebitda: 2.4, pat: 1.2, debtEquity: 0.92, dscr: 1.80, currentRatio: 1.40 }
    ],
    documents: [
      { name: 'Balance Sheet (3 years)', category: 'Mandatory', uploaded: true, status: 'Verified', fileName: 'PrimeLogistics_BS_FY26.pdf', fileSize: '4.8 MB', lastChecked: '12 Jul 2026' }
    ],
    auditLogs: [
      { id: 'log-9-1', type: 'success', category: 'Tax Compliance', message: 'Direct GSTR matching confirms no variance.', evidence: 'GST returns align directly with current account trade invoice clearings.', source: 'GST Audit Nodes' }
    ]
  },
  {
    id: 'comp-10',
    name: 'Nova Healthcare Systems',
    gstin: '19AAACN8821D1Z2',
    pan: 'AAACN8821D',
    cin: 'U85110WB2019PTC228412',
    industry: 'Healthcare & Pharmaceuticals',
    turnover: 11.2,
    loanAmount: 1.50,
    existingBank: 'HDFC Bank Ltd',
    purpose: 'Advanced Medical Diagnostics Equipment Leasing',
    trustScore: 89,
    status: 'Verified',
    verifiedAt: '2026-07-10 16:45',
    decision: 'APPROVED',
    location: 'Kolkata, West Bengal',
    grade: 'A',
    aiSummary: 'Robust medical service operator. Strong current ratio and zero recorded cheque returns. Reconciled tax receipts.',
    lastUpdated: '10 Jul 2026',
    reviewerNotes: 'Diagnostic clinic displaying strong liquidity and steady institutional billings. Receivables collections trace directly with zero inward cheque returns. Pristine standing.',
    metrics: [
      { year: 'FY24', turnover: 8.5, ebitda: 1.1, pat: 0.5, debtEquity: 0.80, dscr: 1.90, currentRatio: 1.42 },
      { year: 'FY25', turnover: 10.0, ebitda: 1.3, pat: 0.6, debtEquity: 0.72, dscr: 2.05, currentRatio: 1.50 },
      { year: 'FY26', turnover: 11.2, ebitda: 1.5, pat: 0.8, debtEquity: 0.62, dscr: 2.25, currentRatio: 1.62 }
    ],
    documents: [
      { name: 'Balance Sheet (3 years)', category: 'Mandatory', uploaded: true, status: 'Verified', fileName: 'NovaHealth_BS.pdf', fileSize: '3.5 MB', lastChecked: '10 Jul 2026' }
    ],
    auditLogs: [
      { id: 'log-10-1', type: 'success', category: 'Liquidity Health', message: 'Spotless current account transactions history.', evidence: 'No returned outward items, average ledger balances hold robust margins.', source: 'HDFC Bank Integration' }
    ]
  },
  {
    id: 'comp-11',
    name: 'Saraswati Food Processing',
    gstin: '23AAACS9011K1Z2',
    pan: 'AAACS9011K',
    cin: 'U15311MP2017PTC042152',
    industry: 'Agri-tech & Food Processing',
    turnover: 9.6,
    loanAmount: 1.20,
    existingBank: 'Union Bank of India',
    purpose: 'Milling Equipment Upgrades & Flour Storage Silos',
    trustScore: 58,
    status: 'Under Review',
    decision: 'PENDING',
    location: 'Indore, Madhya Pradesh',
    grade: 'C+',
    aiSummary: 'Medium capacity grain processor. Elevating leverage and minor delays in monthly GST filings, but stable fixed asset cover.',
    lastUpdated: '05 Jul 2026',
    reviewerNotes: 'Saraswati shows sound regional supply networks but moderate accounting backlog. MCA filings for FY25 were uploaded with late charges. Leverage has increased, but real-estate plant collateral offers sound coverage.',
    metrics: [
      { year: 'FY24', turnover: 7.8, ebitda: 0.85, pat: 0.35, debtEquity: 1.25, dscr: 1.40, currentRatio: 1.20 },
      { year: 'FY25', turnover: 8.8, ebitda: 0.92, pat: 0.38, debtEquity: 1.48, dscr: 1.32, currentRatio: 1.15 },
      { year: 'FY26', turnover: 9.6, ebitda: 1.05, pat: 0.42, debtEquity: 1.72, dscr: 1.22, currentRatio: 1.10 }
    ],
    documents: [
      { name: 'Balance Sheet (3 years)', category: 'Mandatory', uploaded: true, status: 'Verified', fileName: 'Saraswati_BS.pdf', fileSize: '4.2 MB', lastChecked: '05 Jul 2026' }
    ],
    auditLogs: [
      { id: 'log-11-1', type: 'warning', category: 'Late Filings', message: 'Delayed quarterly GST return submissions.', evidence: 'GSTR-3B filings for Q3 FY26 were submitted 24 days past due date, incurring standard late fees.', source: 'GSTN Portal Audit' }
    ]
  },
  {
    id: 'comp-12',
    name: 'Ganga Engineering Works',
    gstin: '09AAACG1124M1Z9',
    pan: 'AAACG1124M',
    cin: 'U28910UP2016PTC081242',
    industry: 'Engineering & Heavy Metallurgy',
    turnover: 15.4,
    loanAmount: 2.20,
    existingBank: 'Punjab National Bank',
    purpose: 'Forging Press Installation & Working Capital Expansion',
    trustScore: 71,
    status: 'Under Review',
    decision: 'PENDING',
    location: 'Kanpur, Uttar Pradesh',
    grade: 'B',
    aiSummary: 'Metal fabrication contractor. Strong order bookings but currently under close review due to increasing collection periods.',
    lastUpdated: '11 Jul 2026',
    reviewerNotes: 'Steady industrial engineering supplier with reliable state power contracts. Receivables collection is sluggish (94 days). DSCR remains positive at 1.38x. High collateral offset available.',
    metrics: [
      { year: 'FY24', turnover: 12.0, ebitda: 1.35, pat: 0.52, debtEquity: 1.02, dscr: 1.50, currentRatio: 1.28 },
      { year: 'FY25', turnover: 14.2, ebitda: 1.58, pat: 0.62, debtEquity: 1.12, dscr: 1.42, currentRatio: 1.24 },
      { year: 'FY26', turnover: 15.4, ebitda: 1.75, pat: 0.68, debtEquity: 1.25, dscr: 1.38, currentRatio: 1.20 }
    ],
    documents: [
      { name: 'Balance Sheet (3 years)', category: 'Mandatory', uploaded: true, status: 'Verified', fileName: 'Ganga_BS_FY26.pdf', fileSize: '5.2 MB', lastChecked: '11 Jul 2026' }
    ],
    auditLogs: [
      { id: 'log-12-1', type: 'warning', category: 'Debtor Slowdown', message: 'Extended average collection days registered.', evidence: 'Average debtor collection period has risen from 72 days in FY24 to 94 days in FY26, impacting working capital flow.', source: 'Trade Accounts Receivable Aging' }
    ]
  }
];
