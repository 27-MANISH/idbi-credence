/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, ShieldCheck, AlertTriangle, AlertCircle, FileText, CheckSquare, 
  Download, Check, Save, ArrowUpRight, TrendingUp, Sparkles, Building, 
  UserCheck, Calendar, Printer, Share2, Database, Network, Clock, Zap, 
  Award, Briefcase, MapPin, Users, Coins, Percent, FileCheck2, ArrowRight,
  Info, BarChart3, HelpCircle, ChevronRight, Layout, Activity, BookOpen
} from 'lucide-react';
import { motion } from 'motion/react';
import { Company, AuditLog, FinancialMetric, DocumentInfo, VerificationStatus } from '../types';

interface CompanyProfileProps {
  company: Company;
  onBack: () => void;
  onUpdateCompany: (updatedCompany: Company) => void;
}

export default function CompanyProfile({ company, onBack, onUpdateCompany }: CompanyProfileProps) {
  // Navigation active tab (Default is complete single-page overview)
  const [activeSubView, setActiveSubView] = useState<'overview' | 'lineage'>('overview');
  
  // Interactive states
  const [selectedDependencyNode, setSelectedDependencyNode] = useState<string>('revenue');
  const [selectedEvidenceNode, setSelectedEvidenceNode] = useState<string>('statements');
  const [hoveredRadarDimension, setHoveredRadarDimension] = useState<string | null>(null);
  
  // Credit officer decision inputs
  const [notes, setNotes] = useState(company.reviewerNotes || '');
  const [decision, setDecision] = useState(company.decision || 'PENDING');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Safe metrics retrieval
  const latestMetric = company.metrics[company.metrics.length - 1] || {
    turnover: company.turnover,
    ebitda: company.turnover * 0.12,
    pat: company.turnover * 0.06,
    debtEquity: 1.1,
    dscr: 1.5,
    currentRatio: 1.4,
    year: 'FY26'
  };

  // Mocked details matching corporate profiles
  const foundedYears: Record<string, string> = {
    'comp-1': '2012',
    'comp-2': '2016',
    'comp-3': '2019',
    'comp-4': '2018',
    'comp-5': '2015',
    'comp-6': '2018',
    'comp-7': '2020',
    'comp-8': '2014',
    'comp-9': '2017',
    'comp-10': '2019',
    'comp-11': '2017',
    'comp-12': '2016'
  };
  const foundedYear = foundedYears[company.id] || '2016';

  const employeeCounts: Record<string, string> = {
    'comp-1': '158 (Verified via EPFO)',
    'comp-2': '94 (Verified via EPFO)',
    'comp-3': '112 (Unverified - EPFO discrepancies)',
    'comp-4': '145 (Verified via EPFO)',
    'comp-5': '124 (Verified via EPFO)',
    'comp-6': '68 (Verified via EPFO)',
    'comp-7': '182 (Verified via EPFO)',
    'comp-8': '110 (Verified via EPFO)',
    'comp-9': '85 (Verified via EPFO)',
    'comp-10': '54 (Verified via EPFO)',
    'comp-11': '42 (Verified via EPFO)',
    'comp-12': '76 (Verified via EPFO)'
  };
  const employeeCount = employeeCounts[company.id] || '85 (Verified via EPFO)';

  // Detailed Business Narrative builder based on company data & context
  const getBusinessNarrative = () => {
    const yearsTrend = company.metrics.map(m => m.turnover);
    const initialTurnover = yearsTrend[0] || 0;
    const finalTurnover = yearsTrend[yearsTrend.length - 1] || 0;
    const growthPercent = initialTurnover > 0 ? (((finalTurnover - initialTurnover) / initialTurnover) * 100).toFixed(1) : '15.4';
    
    const dscrValue = latestMetric.dscr.toFixed(2);
    const crValue = latestMetric.currentRatio.toFixed(2);
    const deValue = latestMetric.debtEquity.toFixed(2);

    // Baseline narratives customized for high-fidelity mock list
    if (company.id === 'comp-1') {
      return {
        revenueGrowth: `Strong CAGR of ${growthPercent}% over the past 3 years, climbing from ₹${initialTurnover} Cr to ₹${finalTurnover} Cr. Revenue patterns are backed 100% by digital GSTR-1 ledgers.`,
        cashFlow: "Excellent liquidity cycles. 12-month current account sweeps from State Bank of India reveal high average daily balances and absolutely zero returned or unpaid inward clearings.",
        inventory: "Optimized inventory lifecycle. Holding periods remain consistent at 57 days under FIFO valuation rules. Raw cotton materials show robust collateral buffer margins.",
        debt: `Highly conservative capitalization. Debt-to-Equity has declined sequentially from 0.92x in FY24 to ${deValue}x, indicating deliberate deleveraging and equity accumulation.`,
        workingCapital: `Healthy and responsive working capital. Debtors collection cycle is short at 41 days. Current ratio of ${crValue}x provides ample short-term operational buffer.`,
        strengths: ["Flawless 99.1% GSTR-to-audit compliance", "Conservative capitalization and strong equity base", "Pristine transactional ledger history across top tier accounts"],
        weaknesses: ["Exposure to high raw cotton price fluctuations", "Concentration of warehousing assets in a single manufacturing zone"],
        readiness: `Extremely High. With a DSCR of ${dscrValue}x and perfect regulatory compliance records, Vardhman Agro-Textiles is prime candidate for low-interest commercial underwriting.`
      };
    }
    if (company.id === 'comp-3') {
      return {
        revenueGrowth: `Severe financial mismatch detected. Reported turnover shows a jump to ₹${finalTurnover} Cr in audited balance sheets, but Consolidated GSTR-1 filings show only ₹31.20 Cr, leaving a massive ₹10.90 Cr (25.8% variance) entirely unexplained.`,
        cashFlow: "Highly stressed cash cycles. Direct bank ledger sweep flags 14 independent cheque bounce events over the past 12 months, indicating severe intra-month overdraft pressure.",
        inventory: "Abnormally long inventory cycles averaging 112 days. High risk of obsolete chemical raw material stock inflating reported asset valuations on balance sheets.",
        debt: `Rising and alarming leverage. Debt-to-Equity has surged to ${deValue}x as of FY26. Interest service coverage is extremely thin at ${dscrValue}x, failing critical safety limits.`,
        workingCapital: `Severely squeezed. Current ratio has breached the safety minimum, falling to ${crValue}x. Outstanding debtor receivables are stretched past 120 days.`,
        strengths: ["Active regional distributor contracts with state cooperatives", "Good physical lab infrastructures and asset base"],
        weaknesses: ["Massive 25.8% revenue inflation mismatch between tax registry & audited ledger", "14 major cash credit account cheque returns", "Severe Debt-to-Equity gearing levels"],
        readiness: "Rejected. High forensic fraud risk due to direct billing inflation. Unfit for standard banking loans without deep manual forensic reconciliation and collateral overhaul."
      };
    }
    
    // Generic high-fidelity structured fallback
    return {
      revenueGrowth: `Consistent operational expansion representing a ${growthPercent}% revenue increase across the analyzed timeline. All key invoice cycles are validated through real-time GSTN pipeline reconciliations.`,
      cashFlow: `Stable net operating cash flows. Daily ledger sweeps reveal clean transaction balances with a low frequency of returns, maintaining positive current account buffers.`,
      inventory: "Sustained inventory cycles aligned with sector benchmarks. Current stock holdings are fully audited with no outstanding impairment observations.",
      debt: `Leverage metrics are managed responsibly with a Debt-to-Equity ratio of ${deValue}x. Operational cash flows fully cover debt obligations with a DSCR of ${dscrValue}x.`,
      workingCapital: `Healthy current ratios of ${crValue}x. The working capital cycle is balanced with steady debtor recoveries offsetting payable timelines.`,
      strengths: ["Strong regulatory alignment and up-to-date filings", "Favorable cash-to-revenue conversion ratio", "Stable workforce headcount backed by verified EPFO rolls"],
      weaknesses: ["Moderately snug interest service coverage under potential high-interest stress scenarios", "Slight geographic customer concentration"],
      readiness: company.status === 'Verified' 
        ? `High. The enterprise displays sound liquidity and absolute transparency in its tax disclosures, making it highly eligible for the proposed working capital facility.`
        : `Moderate. While core business operations are stable, the company requires final manual risk clearance to address pending compliance checklists.`
    };
  };

  const narrative = getBusinessNarrative();

  // Radar Dimensions
  const radarDimensions = [
    { key: 'liquidity', label: 'Liquidity', val: company.id === 'comp-3' ? 35 : 82, color: 'text-blue-600', desc: 'Measures DSCR, current & quick ratio safety factors.', formula: 'Current Assets / Current Liabilities' },
    { key: 'growth', label: 'Growth', val: company.id === 'comp-3' ? 55 : 85, color: 'text-indigo-600', desc: 'Sustained compound annual revenue & EBITDA trajectories.', formula: 'YoY Gross Sales CAGR' },
    { key: 'governance', label: 'Governance', val: company.id === 'comp-3' ? 40 : 92, color: 'text-purple-600', desc: 'On-time MCA fillings, clean corporate audit report notes, zero litigation.', formula: 'ROC & Filing Delay Audits' },
    { key: 'profitability', label: 'Profitability', val: company.id === 'comp-3' ? 45 : 80, color: 'text-emerald-600', desc: 'EBITDA and PAT conversion efficiency on gross turnovers.', formula: 'EBITDA / Gross Revenue' },
    { key: 'stability', label: 'Stability', val: company.id === 'comp-3' ? 38 : 88, color: 'text-teal-600', desc: 'Operational consistency, regular EPFO employee contributions.', formula: 'EPF Remittance Parity' },
    { key: 'verification', label: 'Verification', val: company.id === 'comp-3' ? 25 : 98, color: 'text-sky-600', desc: 'Precision of ledger match against federal tax/corporate registries.', formula: 'GST sales vs P&L match' }
  ];

  // Custom Radar calculation
  const cx = 140;
  const cy = 140;
  const r = 90;
  const numPoints = radarDimensions.length;

  const getCoordinates = (val: number, i: number) => {
    const angle = (i * 2 * Math.PI) / numPoints - Math.PI / 2;
    const x = cx + r * (val / 100) * Math.cos(angle);
    const y = cy + r * (val / 100) * Math.sin(angle);
    return { x, y };
  };

  const ringPolygons = [20, 40, 60, 80, 100].map(level => {
    return radarDimensions.map((_, i) => {
      const { x, y } = getCoordinates(level, i);
      return `${x},${y}`;
    }).join(' ');
  });

  const dataPolygonPoints = radarDimensions.map((d, i) => {
    const { x, y } = getCoordinates(d.val, i);
    return `${x},${y}`;
  }).join(' ');

  const benchmarkPolygonPoints = radarDimensions.map((_, i) => {
    const { x, y } = getCoordinates(70, i); // Sector average is set at 70%
    return `${x},${y}`;
  }).join(' ');


  // FINANCIAL DEPENDENCY NODE SPECIFICATIONS
  const dependencyNodes: Record<string, {
    label: string;
    value: string;
    status: 'Verified' | 'Warning' | 'Contradicted';
    source: string;
    formula: string;
    description: string;
    traceData: Record<string, string>;
  }> = {
    revenue: {
      label: 'Gross Revenue',
      value: `₹${company.turnover.toFixed(2)} Cr`,
      status: company.status === 'Contradictions Detected' ? 'Contradicted' : 'Verified',
      source: 'Consolidated GSTR-1, GSTR-3B & Audited P&L Account',
      formula: 'Sum of taxable sales invoices cleared through GST Portal matching trade books.',
      description: 'The foundation of Credit capacity. Verified continuously against public central registries and monthly bank credits.',
      traceData: {
        'Audited P&L Sales': `₹${company.turnover.toFixed(2)} Cr`,
        'GST Declared Sales': company.id === 'comp-3' ? '₹31.20 Cr (Mismatch!)' : `₹${(company.turnover * 0.99).toFixed(2)} Cr`,
        'Reconciliation Margin': company.id === 'comp-3' ? '25.8% (Unresolved)' : '0.8% (Pristine)',
        'Audit Note': company.id === 'comp-3' ? 'CRITICAL: Severe turnover mismatch' : 'Verified against monthly statutory filings'
      }
    },
    profit: {
      label: 'Operating Profit (EBITDA)',
      value: `₹${latestMetric.ebitda.toFixed(2)} Cr`,
      status: company.id === 'comp-3' ? 'Warning' : 'Verified',
      source: 'Audited P&L, Section IV Depreciation schedules',
      formula: 'Revenue - Cost of Goods Sold - Operational expenses + Depreciation',
      description: 'Measures cash-generating capacity from primary business activities before financial charges.',
      traceData: {
        'Operating Margins': `${((latestMetric.ebitda / latestMetric.turnover) * 100).toFixed(1)}%`,
        'PAT Profit after Tax': `₹${latestMetric.pat.toFixed(2)} Cr`,
        'Direct Labor Costs': 'Verified via EPFO EPF payments',
        'Audit Note': 'Operating cash conversion matches sector averages.'
      }
    },
    cashflow: {
      label: 'Net Cash Flow',
      value: company.id === 'comp-3' ? 'Negative/Stressed' : '₹38.5L Avg Balance',
      status: company.id === 'comp-3' ? 'Contradicted' : 'Verified',
      source: '12-Month Current Account Sweep, bank statements',
      formula: 'Daily Bank Ledger balance summation / Month',
      description: 'Reflects genuine liquidity. Eliminates fictitious sales bookings by verifying actual banking settlement receipts.',
      traceData: {
        'Primary Bank': company.existingBank || 'State Bank of India',
        'Cheque Bounces': company.id === 'comp-3' ? '14 instances' : '0 instances',
        'Average Balance': company.id === 'comp-3' ? '₹2.4 Lakhs (Insufficient)' : '₹38.5 Lakhs (Strong)',
        'Unmatched Bank Credits': company.id === 'comp-3' ? '₹11.2 Cr' : 'Nil'
      }
    },
    workingcapital: {
      label: 'Working Capital',
      value: `₹${(company.turnover * 0.18).toFixed(1)} Cr Headroom`,
      status: company.id === 'comp-3' ? 'Warning' : 'Verified',
      source: 'Audited Balance Sheet (Short-term Assets & Liabilities)',
      formula: 'Current Assets - Current Liabilities',
      description: 'Measures the enterprise\'s immediate operational liquidity margin to run active factory production.',
      traceData: {
        'Debtors collection days': company.id === 'comp-3' ? '122 Days (Critical)' : '41 Days (Excellent)',
        'Creditors payment days': '49 Days',
        'Net Cash Cycle': company.id === 'comp-3' ? '112 Days' : '49 Days',
        'Inventory holding time': company.id === 'comp-3' ? '112 Days' : '57 Days'
      }
    },
    liquidity: {
      label: 'Liquidity (Current Ratio)',
      value: `${latestMetric.currentRatio.toFixed(2)}x`,
      status: company.id === 'comp-3' ? 'Contradicted' : 'Verified',
      source: 'Balance Sheet schedule III',
      formula: 'Current Assets / Current Liabilities',
      description: 'Short-term debt-paying capacity. Ratios above 1.33x represent high stability for commercial credit lines.',
      traceData: {
        'Current Ratio': `${latestMetric.currentRatio.toFixed(2)}x`,
        'DSCR Coverage': `${latestMetric.dscr.toFixed(2)}x`,
        'Quick ratio': company.id === 'comp-3' ? '0.72x' : '1.18x',
        'Benchmark Standard': '1.33x minimum acceptable limit'
      }
    },
    trustscore: {
      label: 'Composite Trust Score',
      value: `${company.trustScore}%`,
      status: company.trustScore >= 85 ? 'Verified' : (company.trustScore >= 60 ? 'Warning' : 'Contradicted'),
      source: 'Multi-agent weighted assurance index',
      formula: 'Weighted average (Statutory match: 40%, Liquidity: 30%, Stability: 20%, Governance: 10%)',
      description: 'Single metric representing credit safety, transactional integrity, and statutory compliance.',
      traceData: {
        'Statutory matching': company.id === 'comp-3' ? '24%' : '98%',
        'Liquidity standing': company.id === 'comp-3' ? '35%' : '88%',
        'EPFO staffing check': company.id === 'comp-3' ? 'Unverified' : '100% verified compliance',
        'Risk status': company.status
      }
    }
  };


  // EVIDENCE GRAPH NODE SPECIFICATIONS
  const evidenceNodes: Record<string, {
    label: string;
    subtitle: string;
    evidenceLogs: { label: string; value: string; status: 'Verified' | 'Warning' | 'Contradicted' }[];
    observations: string[];
    recommendation: string;
  }> = {
    statements: {
      label: 'Financial Statements',
      subtitle: 'Raw Disclosures Verified',
      evidenceLogs: [
        { label: 'Audited Balance Sheets', value: '3 Fiscal Years Verified', status: 'Verified' },
        { label: 'Profit & Loss Statement', value: 'Matched with Auditor notes', status: 'Verified' },
        { label: 'GSTR-3B Tax filings', value: company.id === 'comp-3' ? 'Mismatch identified' : '100% filing frequency', status: company.id === 'comp-3' ? 'Contradicted' : 'Verified' },
        { label: 'SBI Bank sweeps', value: company.id === 'comp-3' ? '14 Cheque bounces' : 'Zero balances issues', status: company.id === 'comp-3' ? 'Contradicted' : 'Verified' }
      ],
      observations: [
        'Direct JSON imports from national central registries ensure zero manipulation of files.',
        company.id === 'comp-3' 
          ? 'CRITICAL Mismatch: GSTR-3B filings reveal declared revenues are far below reported audited revenues.'
          : 'High OCR precision. Metadata confirms the PDFs are legally signed, unaltered, and genuine.'
      ],
      recommendation: company.id === 'comp-3' ? 'Flag immediately for secondary review' : 'Source documents verified with 100% confidence.'
    },
    ratios: {
      label: 'Extracted Ratios',
      subtitle: 'Underwriting safety ratios',
      evidenceLogs: [
        { label: 'Current ratio', value: `${latestMetric.currentRatio.toFixed(2)}x`, status: company.id === 'comp-3' ? 'Contradicted' : 'Verified' },
        { label: 'DSCR buffer', value: `${latestMetric.dscr.toFixed(2)}x`, status: company.id === 'comp-3' ? 'Contradicted' : 'Verified' },
        { label: 'Debt/Equity gearing', value: `${latestMetric.debtEquity.toFixed(2)}x`, status: company.id === 'comp-3' ? 'Warning' : 'Verified' }
      ],
      observations: [
        `Debt service capacity is calculated at ${latestMetric.dscr.toFixed(2)}x based on operating cash flow interest amortization tables.`,
        company.id === 'comp-3'
          ? 'Ratios are highly stressed. Debt-to-equity is critical and DSCR fails banking underwriting benchmarks.'
          : 'Debt service coverage matches standard commercial lending guidelines comfortably.'
      ],
      recommendation: company.id === 'comp-3' ? 'Decline standard risk-tier credit limit' : 'Approve optimal interest rate margins'
    },
    observations: {
      label: 'Regulatory Audit Observations',
      subtitle: 'Filing compliance & records',
      evidenceLogs: [
        { label: 'MCA standing', value: 'Active registration', status: 'Verified' },
        { label: 'Late AOC-4 fees', value: company.id === 'comp-3' ? 'Delayed multiple filings' : 'Nil', status: company.id === 'comp-3' ? 'Warning' : 'Verified' },
        { label: 'Litigation records', value: 'No winding up warnings found', status: 'Verified' },
        { label: 'EPFO staffing status', value: employeeCount, status: 'Verified' }
      ],
      observations: [
        'Staffing numbers are cross-audited against corporate EPFO payments, proving active business.',
        company.id === 'comp-3'
          ? 'Late fees on MCA files suggest high administrative delays and internal governance weaknesses.'
          : 'Governance is clean. Company displays pristine regulatory standing and filings timeline.'
      ],
      recommendation: company.id === 'comp-3' ? 'Governance override referral' : 'Proceed with standard rating cards'
    },
    recommendationNode: {
      label: 'Lending Recommendation',
      subtitle: 'Credit Desk Determination',
      evidenceLogs: [
        { label: 'Lending Decision', value: company.id === 'comp-3' ? 'REJECTED' : 'APPROVED', status: company.id === 'comp-3' ? 'Contradicted' : 'Verified' },
        { label: 'Trust Category', value: company.grade || 'A', status: 'Verified' },
        { label: 'Override Risk Tag', value: company.id === 'comp-3' ? 'High Risk - Discrepancies' : 'Low to Medium Risk', status: company.id === 'comp-3' ? 'Contradicted' : 'Verified' }
      ],
      observations: [
        company.id === 'comp-3'
          ? 'Credit proposal rejected due to systematic accounting discrepancies and high default indicators.'
          : `Recommend approving credit limit of ₹${company.loanAmount.toFixed(2)} Cr with favorable loan-to-value coverage ratios.`
      ],
      recommendation: company.id === 'comp-3' ? 'Reject application immediately' : 'Disburse loan limits through central banking system'
    }
  };

  // Actions
  const handleSaveNotes = () => {
    setIsSaving(true);
    setTimeout(() => {
      let newStatus: VerificationStatus = company.status;
      if (decision === 'APPROVED') newStatus = 'Verified';
      else if (decision === 'REJECTED') newStatus = 'Contradictions Detected';
      else if (decision === 'REFERRED') newStatus = 'Under Review';

      onUpdateCompany({
        ...company,
        reviewerNotes: notes,
        decision: decision as any,
        status: newStatus
      });
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      triggerToast('Lending decision authorized and written to corporate dossier.');
    }, 600);
  };

  const handlePrintDossier = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(company, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `diligence_report_${company.name.toLowerCase().replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerToast('Dossier JSON exported and downloaded.');
  };

  const handleDownloadCard = () => {
    // Generate simple metadata export representation of health card
    const cardData = {
      companyName: company.name,
      trustScore: `${company.trustScore}%`,
      grade: company.grade || 'A',
      industry: company.industry,
      turnover: `₹${company.turnover} Cr`,
      loanAmount: `₹${company.loanAmount} Cr`,
      status: company.status,
      radarDimensions
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cardData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `financial_health_card_${company.name.toLowerCase().replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerToast('Financial Health Card data downloaded successfully!');
  };

  const handleDownloadDiligenceReport = () => {
    // Format formal TXT report
    const reportText = `
========================================================================
CREDENCE AI - FORMAL DUE DILIGENCE UNDERWRITING DOSSIER
========================================================================
Company Name    : ${company.name}
Industry        : ${company.industry}
Location        : ${company.location || 'N/A'}
GSTIN           : ${company.gstin}
CIN             : ${company.cin}
PAN             : ${company.pan}
Founded         : ${foundedYear}
Employees       : ${employeeCount}
Annual Turnover : ₹${company.turnover.toFixed(2)} Cr
Loan Request    : ₹${company.loanAmount.toFixed(2)} Cr
Health Grade    : ${company.grade || 'A'}
AI Trust Score  : ${company.trustScore}%
Verification    : ${company.status}
------------------------------------------------------------------------
BUSINESS AUDIT FORENSIC NARRATIVE
------------------------------------------------------------------------
Revenue Growth:
${narrative.revenueGrowth}

Cash Flow Summary:
${narrative.cashFlow}

Inventory Status:
${narrative.inventory}

Debt & Leverage:
${narrative.debt}

Working Capital Status:
${narrative.workingCapital}

Business Strengths:
${narrative.strengths.map(s => `- ${s}`).join('\n')}

Business Weaknesses:
${narrative.weaknesses.map(w => `- ${w}`).join('\n')}

Lending Readiness Outcome:
${narrative.readiness}
------------------------------------------------------------------------
HISTORICAL FINANCIAL METRICS
${company.metrics.map(m => `
[${m.year}]
  Turnover     : ₹${m.turnover.toFixed(2)} Cr
  EBITDA       : ₹${m.ebitda.toFixed(2)} Cr
  PAT Profit   : ₹${m.pat.toFixed(2)} Cr
  Debt/Equity  : ${m.debtEquity.toFixed(2)}x
  DSCR         : ${m.dscr.toFixed(2)}x
  Current Ratio: ${m.currentRatio.toFixed(2)}x`).join('\n')}
========================================================================
Compiled dynamically against live bank nodes. Certified by Credence AI.
    `;
    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(reportText);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `diligence_report_${company.name.toLowerCase().replace(/\s+/g, '_')}.txt`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerToast('Due Diligence Report downloaded successfully!');
  };

  const handleShareReport = () => {
    const summaryText = `Credence Due Diligence Audit Summary for ${company.name}:\n- Trust Score: ${company.trustScore}%\n- Rating Grade: ${company.grade || 'A'}\n- Revenue: ₹${company.turnover} Cr\n- Status: ${company.status}\nAudit authorized by IDBI Bank Credit Desk.`;
    navigator.clipboard.writeText(summaryText);
    triggerToast('Dossier summary copied to clipboard! Shareable in email or Slack.');
  };

  return (
    <div className="space-y-8" id="company-profile-root">
      
      {/* Dynamic Toast Messages */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-mono font-semibold px-4 py-3 rounded-xl border border-slate-800 shadow-xl flex items-center space-x-2 animate-bounce">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* BACK BUTTON AND UTILITY BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 pb-5" id="profile-action-bar">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500 cursor-pointer transition-colors"
            title="Return to Dashboard"
            id="back-to-directory"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                DILIGENCE NODE #{company.id.toUpperCase()}
              </span>
              <span className="text-xs text-gray-400 font-mono">| Updated {company.lastUpdated || 'Recently'}</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mt-0.5">Enterprise Diligence Profile</h1>
          </div>
        </div>

        {/* TOP LEVEL ACTION HANDLERS */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrintDossier}
            className="flex items-center space-x-1 px-3 py-2 text-xs font-mono font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl cursor-pointer transition-all shadow-3xs"
            title="Print entire audit workspace"
          >
            <Printer className="h-3.5 w-3.5 text-indigo-600" />
            <span>PRINT DOSSIER</span>
          </button>

          <button
            onClick={handleDownloadJSON}
            className="flex items-center space-x-1 px-3 py-2 text-xs font-mono font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl cursor-pointer transition-all shadow-3xs"
            title="Export raw diligence metrics in JSON format"
          >
            <Download className="h-3.5 w-3.5 text-indigo-600" />
            <span>EXPORT JSON</span>
          </button>

          <button
            onClick={handleShareReport}
            className="flex items-center space-x-1 px-3 py-2 text-xs font-mono font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer transition-all shadow-3xs"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>SHARE</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. COMPANY HEADER SECTION                                 */}
      {/* ========================================================= */}
      <section className="bg-white border border-gray-150 rounded-2xl p-6 sm:p-8 shadow-3xs" id="company-profile-header">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Identity Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md uppercase tracking-wider font-mono">
                  {company.industry}
                </span>
                {company.status === 'Verified' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-100">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 mr-1 shrink-0" />
                    Verified Active operations
                  </span>
                )}
                {company.status === 'Under Review' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-100">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600 mr-1 shrink-0" />
                    Under Review
                  </span>
                )}
                {company.status === 'Contradictions Detected' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-800 border border-red-100 animate-pulse">
                    <AlertCircle className="h-3.5 w-3.5 text-red-600 mr-1 shrink-0" />
                    Contradictions Flagged
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight leading-none">
                {company.name}
              </h2>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs font-medium text-gray-500">
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-400 mr-1 shrink-0" />
                  {company.location || 'India'}
                </span>
                <span className="text-gray-200">•</span>
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-1 shrink-0" />
                  Founded: <strong className="text-gray-700 ml-1 font-mono">{foundedYear}</strong>
                </span>
                <span className="text-gray-200">•</span>
                <span className="flex items-center">
                  <Users className="h-4 w-4 text-gray-400 mr-1 shrink-0" />
                  Staff: <strong className="text-gray-700 ml-1 font-mono">{employeeCount}</strong>
                </span>
              </div>
            </div>

            {/* Corporate ID details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/50 border border-gray-150 rounded-xl p-4 font-mono text-[11px] text-gray-500">
              <div className="space-y-1">
                <span className="text-gray-400 block font-bold uppercase text-[9px] tracking-wider">GST Registration (GSTIN)</span>
                <span className="text-gray-900 font-bold block">{company.gstin}</span>
              </div>
              <div className="space-y-1">
                <span className="text-gray-400 block font-bold uppercase text-[9px] tracking-wider">Corporate Identity No (CIN)</span>
                <span className="text-gray-900 font-bold block">{company.cin}</span>
              </div>
            </div>

            {/* Turnover and Loan values */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-gray-150 rounded-xl p-4 bg-white shadow-3xs">
                <span className="text-[10px] font-mono font-bold text-gray-400 block uppercase">Annual Revenue (FY26)</span>
                <span className="text-xl font-mono font-black text-gray-950 mt-1 block">₹{company.turnover.toFixed(2)} Cr</span>
              </div>
              <div className="border border-gray-150 rounded-xl p-4 bg-indigo-50/20 border-indigo-100 shadow-3xs">
                <span className="text-[10px] font-mono font-bold text-indigo-700 block uppercase">Loan Requirement</span>
                <span className="text-xl font-mono font-black text-indigo-800 mt-1 block">₹{company.loanAmount.toFixed(2)} Cr</span>
              </div>
            </div>
          </div>

          {/* Large Scoring Badges column */}
          <div className="bg-gray-50/50 border border-gray-150 rounded-2xl p-6 flex flex-col justify-between h-full space-y-6">
            
            <div className="flex items-center justify-between border-b border-gray-150 pb-4">
              <div>
                <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest block">Core Grade</span>
                <span className="text-xs font-bold text-gray-500 block mt-0.5">Financial Health Category</span>
              </div>
              <div className={`h-14 w-14 rounded-full flex items-center justify-center font-sans font-black text-xl border shadow-xs ${
                company.status === 'Verified' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                company.status === 'Under Review' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                'bg-red-50 text-red-800 border-red-200 animate-pulse'
              }`}>
                {company.grade || 'A'}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                <span className="flex items-center">
                  <Sparkles className="h-4 w-4 text-indigo-500 mr-1 shrink-0 animate-pulse" />
                  Composite Trust score
                </span>
                <span className="font-mono">{company.trustScore}%</span>
              </div>
              
              {/* Score bar */}
              <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden border border-gray-300">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    company.trustScore >= 85 ? 'bg-emerald-600' :
                    company.trustScore >= 60 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${company.trustScore}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
                <span>0% Unfit</span>
                <span>Sector Benchmark: 70%</span>
                <span>100% Prime</span>
              </div>
            </div>

            <div className="bg-white border border-gray-150 p-3.5 rounded-xl text-[11px] leading-relaxed font-medium text-gray-600 relative overflow-hidden">
              <span className="text-[9px] font-mono font-bold text-indigo-600 uppercase tracking-wider block">AI Audit Status</span>
              <p className="mt-1 font-semibold text-gray-700">
                {company.status === 'Verified' ? 'Cryptographic matching successful. Low risk metrics detected.' :
                 company.status === 'Under Review' ? 'Checklists completed. Awaiting credit committee decision.' :
                 'Discrepancies identified on sales records. High variance detected.'}
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* TWO-COLUMN GRID FOR RADAR, HEALTH CARD, NARRATIVE, GRAPH */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* LEFT TWO-THIRDS PANEL */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* ========================================================= */}
          {/* 3. BUSINESS NARRATIVE SECTION                             */}
          {/* ========================================================= */}
          <section className="bg-white border border-gray-150 rounded-2xl p-6 sm:p-8 shadow-3xs space-y-6" id="business-narrative-section">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
              <BookOpen className="h-4.5 w-4.5 text-indigo-600" />
              <h3 className="text-sm font-bold text-gray-950 tracking-tight">AI Forensics & Business Narrative</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">Revenue & Sales Trajectory</span>
                  <p className="text-xs text-gray-600 leading-relaxed font-medium">{narrative.revenueGrowth}</p>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">Cash Flow Liquidity Analysis</span>
                  <p className="text-xs text-gray-600 leading-relaxed font-medium">{narrative.cashFlow}</p>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">Inventory Ledger Auditing</span>
                  <p className="text-xs text-gray-600 leading-relaxed font-medium">{narrative.inventory}</p>
                </div>
              </div>

              <div className="space-y-4 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">Debt Amortization & Leverage</span>
                  <p className="text-xs text-gray-600 leading-relaxed font-medium">{narrative.debt}</p>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">Working Capital Health</span>
                  <p className="text-xs text-gray-600 leading-relaxed font-medium">{narrative.workingCapital}</p>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">Overall Lending Readiness</span>
                  <p className="text-xs text-indigo-900 bg-indigo-50/40 p-3 border border-indigo-50 rounded-xl leading-relaxed font-bold">{narrative.readiness}</p>
                </div>
              </div>
            </div>

            {/* Strengths and Weaknesses bento-box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div className="bg-emerald-50/30 border border-emerald-100 p-4 rounded-xl space-y-2">
                <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase tracking-wider flex items-center">
                  <CheckSquare className="h-3.5 w-3.5 text-emerald-600 mr-1.5 shrink-0" />
                  Key Business Strengths
                </span>
                <ul className="space-y-1.5">
                  {narrative.strengths.map((s, idx) => (
                    <li key={idx} className="text-xs text-gray-700 flex items-start space-x-1.5 font-medium leading-tight">
                      <span className="text-emerald-500 font-extrabold shrink-0">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-rose-50/20 border border-rose-100 p-4 rounded-xl space-y-2">
                <span className="text-[10px] font-mono font-bold text-rose-800 uppercase tracking-wider flex items-center">
                  <AlertCircle className="h-3.5 w-3.5 text-rose-600 mr-1.5 shrink-0" />
                  Key Risk Factors & Weaknesses
                </span>
                <ul className="space-y-1.5">
                  {narrative.weaknesses.map((w, idx) => (
                    <li key={idx} className="text-xs text-gray-700 flex items-start space-x-1.5 font-medium leading-tight">
                      <span className="text-rose-400 font-extrabold shrink-0">•</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* 4. FINANCIAL TIMELINE SECTION                              */}
          {/* ========================================================= */}
          <section className="bg-white border border-gray-150 rounded-2xl p-6 sm:p-8 shadow-3xs space-y-6" id="financial-timeline-section">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4.5 w-4.5 text-indigo-600" />
                <h3 className="text-sm font-bold text-gray-950 tracking-tight">Financial Timeline Growth metrics</h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">3-Year Audited Records</span>
            </div>

            {/* Visual Mini Chart bars comparing turnovers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {company.metrics.map((m, idx) => {
                // Percentage scale based on top turnover
                const maxTurnover = Math.max(...company.metrics.map(me => me.turnover));
                const barPercent = maxTurnover > 0 ? (m.turnover / maxTurnover) * 100 : 80;

                return (
                  <div key={idx} className="border border-gray-150 bg-gray-50/40 p-4 rounded-xl flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-gray-950 font-mono bg-white px-2.5 py-1 border border-gray-200 rounded-lg shadow-3xs">{m.year}</span>
                      <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">Turnover Ledger</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-mono font-black text-gray-900">₹{m.turnover.toFixed(1)} Cr</span>
                        {idx > 0 && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-mono">
                            +{(((m.turnover - company.metrics[idx-1].turnover) / company.metrics[idx-1].turnover) * 100).toFixed(0)}% YoY
                          </span>
                        )}
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${barPercent}%` }}></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Timeline Tabular Data */}
            <div className="overflow-x-auto border border-gray-150 rounded-xl shadow-3xs bg-white">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-150 font-mono text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="p-3.5">Fiscal Period</th>
                    <th className="p-3.5 text-right">Revenue (Turnover)</th>
                    <th className="p-3.5 text-right">Operating EBITDA</th>
                    <th className="p-3.5 text-right">Profit after Tax</th>
                    <th className="p-3.5 text-right">D/E Ratio</th>
                    <th className="p-3.5 text-right">DSCR Buffer</th>
                    <th className="p-3.5 text-right">Current Ratio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono">
                  {company.metrics.map((m, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-3.5 font-bold text-gray-950">{m.year}</td>
                      <td className="p-3.5 text-right font-bold text-gray-900">₹{m.turnover.toFixed(2)} Cr</td>
                      <td className="p-3.5 text-right font-bold text-gray-900">₹{m.ebitda.toFixed(2)} Cr</td>
                      <td className="p-3.5 text-right text-gray-600">₹{m.pat.toFixed(2)} Cr</td>
                      <td className="p-3.5 text-right font-bold text-gray-700">{m.debtEquity.toFixed(2)}x</td>
                      <td className="p-3.5 text-right font-bold text-indigo-700">{m.dscr.toFixed(2)}x</td>
                      <td className="p-3.5 text-right font-bold text-emerald-800">{m.currentRatio.toFixed(2)}x</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ========================================================= */}
          {/* 5. INTERACTIVE RADAR CHART SECTION                        */}
          {/* ========================================================= */}
          <section className="bg-white border border-gray-150 rounded-2xl p-6 sm:p-8 shadow-3xs space-y-6" id="interactive-radar-section">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
              <BarChart3 className="h-4.5 w-4.5 text-indigo-600" />
              <h3 className="text-sm font-bold text-gray-950 tracking-tight">Interactive AI Credit Risk Radar Alignment</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              
              {/* Radar Chart SVG Workspace */}
              <div className="flex justify-center items-center py-4 bg-gray-50/40 rounded-xl border border-gray-150 min-h-[300px]">
                <div className="relative w-[300px] h-[280px]">
                  <svg viewBox="0 0 280 280" className="w-full h-full">
                    {/* Concentric rings guidelines */}
                    {ringPolygons.map((pts, idx) => (
                      <polygon
                        key={`ring-${idx}`}
                        points={pts}
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="1"
                        strokeDasharray="3,3"
                      />
                    ))}

                    {/* Outer concentric boundary ring */}
                    <polygon
                      points={ringPolygons[4]}
                      fill="none"
                      stroke="#cbd5e1"
                      strokeWidth="1.2"
                    />

                    {/* Scale label markers */}
                    {[20, 40, 60, 80, 100].map((level, idx) => (
                      <text
                        key={`level-label-${idx}`}
                        x={cx + 4}
                        y={cy - (r * level) / 100 + 3}
                        className="text-[8px] font-mono fill-gray-400 select-none font-bold"
                      >
                        {level}%
                      </text>
                    ))}

                    {/* Radial spoke vectors */}
                    {radarDimensions.map((dim, i) => {
                      const angle = (i * 2 * Math.PI) / numPoints - Math.PI / 2;
                      const x = cx + r * Math.cos(angle);
                      const y = cy + r * Math.sin(angle);
                      const isHovered = hoveredRadarDimension === dim.key;

                      return (
                        <g key={`spoke-${i}`}>
                          <line
                            x1={cx}
                            y1={cy}
                            x2={x}
                            y2={y}
                            stroke={isHovered ? '#6366f1' : '#e2e8f0'}
                            strokeWidth={isHovered ? '1.5' : '1'}
                          />
                          {/* Vertices indicator handles */}
                          <text
                            x={cx + (r + 14) * Math.cos(angle)}
                            y={cy + (r + 10) * Math.sin(angle)}
                            textAnchor="middle"
                            className={`text-[9px] font-mono font-bold select-none cursor-pointer transition-colors duration-200 ${
                              isHovered ? 'fill-indigo-600 scale-105 font-black' : 'fill-gray-500'
                            }`}
                            onMouseEnter={() => setHoveredRadarDimension(dim.key)}
                            onMouseLeave={() => setHoveredRadarDimension(null)}
                          >
                            {dim.label}
                          </text>
                        </g>
                      );
                    })}

                    {/* Peer Benchmark Guideline */}
                    <polygon
                      points={benchmarkPolygonPoints}
                      fill="rgba(156, 163, 175, 0.04)"
                      stroke="#9ca3af"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />

                    {/* Actual corporate data alignment polygon */}
                    <polygon
                      points={dataPolygonPoints}
                      fill={company.id === 'comp-3' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.15)'}
                      stroke={company.id === 'comp-3' ? '#ef4444' : '#4f46e5'}
                      strokeWidth="2.2"
                      className="transition-all duration-300"
                    />

                    {/* Data vertex point indicator circles */}
                    {radarDimensions.map((d, i) => {
                      const { x, y } = getCoordinates(d.val, i);
                      const isHovered = hoveredRadarDimension === d.key;

                      return (
                        <circle
                          key={`pt-${i}`}
                          cx={x}
                          cy={y}
                          r={isHovered ? 5.5 : 3.5}
                          className="cursor-pointer transition-all duration-200"
                          fill={company.id === 'comp-3' ? '#ef4444' : '#4f46e5'}
                          stroke="white"
                          strokeWidth="1"
                          onMouseEnter={() => setHoveredRadarDimension(d.key)}
                          onMouseLeave={() => setHoveredRadarDimension(null)}
                        />
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Dynamic Information sidecar */}
              <div className="space-y-4">
                <div className="bg-gray-50 border border-gray-150 p-4 rounded-xl space-y-3 min-h-[160px] flex flex-col justify-between">
                  {hoveredRadarDimension ? (
                    (() => {
                      const activeDim = radarDimensions.find(rd => rd.key === hoveredRadarDimension)!;
                      return (
                        <div className="space-y-2 animate-fade-in">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-wider">{activeDim.label} Axis</span>
                            <span className="text-xs font-mono font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                              Score: {activeDim.val}%
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-gray-900 leading-snug">{activeDim.desc}</h4>
                          <div className="pt-1.5 border-t border-gray-200/80">
                            <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest block">Audit Formula</span>
                            <span className="text-[10px] font-mono text-gray-700 font-semibold">{activeDim.formula}</span>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="space-y-2 flex flex-col justify-center items-center h-full text-center text-gray-400 py-6">
                      <Info className="h-6 w-6 text-gray-300 animate-pulse" />
                      <p className="text-xs font-medium">Hover over any axis node or metric label on the radar chart to inspect calculation formulas and audited parity margins.</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="border border-gray-150 rounded-xl p-3 bg-white text-center">
                    <span className="text-[10px] font-mono font-bold text-gray-400 block uppercase">Sector Average</span>
                    <span className="text-sm font-mono font-extrabold text-gray-600 mt-1 block">70% Standard</span>
                  </div>
                  <div className="border border-gray-150 rounded-xl p-3 bg-indigo-50/20 border-indigo-100 text-center">
                    <span className="text-[10px] font-mono font-bold text-indigo-700 block uppercase">Diligence Parity</span>
                    <span className="text-sm font-mono font-extrabold text-indigo-800 mt-1 block">
                      {company.id === 'comp-3' ? 'Deficient' : 'Pristine'}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </section>

        </div>

        {/* RIGHT COLUMN SIDE PANEL (Financial Health Card, dependency graph, evidence, decision) */}
        <div className="space-y-8">
          
          {/* ========================================================= */}
          {/* 2. FINANCIAL HEALTH CARD                                   */}
          {/* ========================================================= */}
          <section className="bg-white border border-gray-150 rounded-2xl p-6 shadow-3xs space-y-4" id="financial-health-card-section">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
              <Award className="h-4.5 w-4.5 text-indigo-600" />
              <h3 className="text-sm font-bold text-gray-950 tracking-tight">Financial Health Card</h3>
            </div>

            {/* Bloomberg-like indices grid */}
            <div className="space-y-2.5">
              {[
                { label: 'Financial Integrity', value: company.id === 'comp-3' ? 'Deficient (25% Var)' : '99.1% Parity', status: company.id === 'comp-3' ? 'Contradicted' : 'Verified' },
                { label: 'Liquidity index', value: `${latestMetric.currentRatio.toFixed(2)}x (Stable)`, status: company.id === 'comp-3' ? 'Contradicted' : 'Verified' },
                { label: 'Growth Multiplier', value: company.id === 'comp-3' ? 'Unreliable / Lagging' : 'High Trajectory', status: company.id === 'comp-3' ? 'Warning' : 'Verified' },
                { label: 'Business Stability', value: company.id === 'comp-3' ? 'Medium-to-Low' : 'Stable Ops (EPFO)', status: company.id === 'comp-3' ? 'Warning' : 'Verified' },
                { label: 'Governance compliance', value: company.id === 'comp-3' ? 'Administrative delays' : 'Compliant AOC-4', status: company.id === 'comp-3' ? 'Warning' : 'Verified' },
                { label: 'Verification Parity', value: '100% statutory match', status: 'Verified' },
                { label: 'Fraud Risk Rating', value: company.id === 'comp-3' ? 'HIGH FRAUD RISK' : 'LOW RISK', status: company.id === 'comp-3' ? 'Contradicted' : 'Verified' },
                { label: 'Overall Trust Score', value: `${company.trustScore}/100`, status: company.trustScore >= 85 ? 'Verified' : 'Warning' },
                { label: 'Confidence Score', value: company.id === 'comp-3' ? 'Moderate' : '96% confidence level', status: company.id === 'comp-3' ? 'Warning' : 'Verified' }
              ].map((row, idx) => (
                <div key={idx} className="flex items-center justify-between py-1.5 border-b border-gray-100 text-xs">
                  <span className="text-gray-500 font-semibold">{row.label}</span>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-mono font-bold text-gray-900">{row.value}</span>
                    {row.status === 'Verified' && <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />}
                    {row.status === 'Warning' && <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />}
                    {row.status === 'Contradicted' && <AlertCircle className="h-3.5 w-3.5 text-red-600 animate-pulse" />}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ========================================================= */}
          {/* 8. DOWNLOAD & REPORT UTILITY PANEL                        */}
          {/* ========================================================= */}
          <section className="bg-white border border-gray-150 rounded-2xl p-6 shadow-3xs space-y-4" id="download-utility-panel">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
              <Download className="h-4.5 w-4.5 text-indigo-600" />
              <h3 className="text-sm font-bold text-gray-950 tracking-tight">Export & Underwriting Dossiers</h3>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={handleDownloadCard}
                className="w-full py-2 px-4 text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors flex items-center justify-between group shadow-3xs"
              >
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-indigo-500" />
                  <span>Download Financial Health Card</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={handleDownloadDiligenceReport}
                className="w-full py-2 px-4 text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors flex items-center justify-between group shadow-3xs"
              >
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-indigo-500" />
                  <span>Download Due Diligence Report</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={handlePrintDossier}
                className="w-full py-2 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer transition-colors flex items-center justify-between shadow-3xs"
              >
                <div className="flex items-center space-x-2">
                  <Printer className="h-4 w-4" />
                  <span>Print Formal A4 Credit Dossier</span>
                </div>
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </section>

          {/* ========================================================= */}
          {/* CREDIT OFFICER REGULATOR ACTION DESK                      */}
          {/* ========================================================= */}
          <section className="bg-white border border-gray-150 rounded-2xl p-6 shadow-3xs space-y-4" id="credit-officer-panel">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
              <Zap className="h-4.5 w-4.5 text-indigo-600" />
              <h3 className="text-sm font-bold text-gray-950 tracking-tight">Credit Committee Action Desk</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">Authorized Decision</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 'APPROVED', label: 'Approve', color: 'border-emerald-200 text-emerald-800 bg-emerald-50/50' },
                    { val: 'REFERRED', label: 'Refer', color: 'border-amber-200 text-amber-800 bg-amber-50/50' },
                    { val: 'REJECTED', label: 'Reject', color: 'border-red-200 text-red-800 bg-red-50/50' }
                  ].map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => setDecision(opt.val as any)}
                      className={`py-1.5 px-2 text-xs font-bold border rounded-lg cursor-pointer text-center transition-all ${
                        decision === opt.val 
                          ? `${opt.color} ring-2 ring-indigo-50 border-indigo-600`
                          : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">Committee Reviewer Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Insert custom underwriting observation reports, litigation waivers or collateral coverage updates."
                  rows={4}
                  className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-50 font-sans leading-relaxed"
                />
              </div>

              <button
                onClick={handleSaveNotes}
                disabled={isSaving}
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-gray-950 hover:bg-gray-900 active:bg-black disabled:bg-gray-300 rounded-xl cursor-pointer flex items-center justify-center space-x-2 shadow-3xs transition-all"
              >
                {isSaving ? (
                  <span className="animate-spin text-white">•</span>
                ) : saveSuccess ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>{saveSuccess ? 'Decision Saved' : 'Authorize & Commit Note'}</span>
              </button>
            </div>
          </section>

        </div>

      </div>

      {/* ========================================================= */}
      {/* 6. FINANCIAL DEPENDENCY GRAPH SECTION                     */}
      {/* ========================================================= */}
      <section className="bg-white border border-gray-150 rounded-2xl p-6 sm:p-8 shadow-3xs space-y-6" id="dependency-graph-section">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Network className="h-4.5 w-4.5 text-indigo-600 animate-pulse" />
              <h3 className="text-sm font-bold text-gray-950 tracking-tight">Financial Dependency & Reconciliation Graph</h3>
            </div>
            <p className="text-xs text-gray-500 mt-1 font-medium leading-normal">
              Click any node in the credit pipeline to trace its audit logs, underlying formulas, and primary source documents.
            </p>
          </div>
          <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest bg-gray-100 border border-gray-200 px-2 py-0.5 rounded h-fit shrink-0">
            Interactive Lineage Trace
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Interactive Flow Diagram */}
          <div className="lg:col-span-2 bg-gray-50/40 border border-gray-150 p-6 rounded-2xl min-h-[380px] flex flex-col justify-center relative overflow-hidden">
            
            {/* Visual Flow diagram lines and nodes */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2 relative z-10 w-full">
              
              {[
                { key: 'revenue', label: '1. Revenue', icon: Coins },
                { key: 'profit', label: '2. Profit', icon: Percent },
                { key: 'cashflow', label: '3. Cash Flow', icon: Activity },
                { key: 'workingcapital', label: '4. Working Cap', icon: Briefcase },
                { key: 'liquidity', label: '5. Liquidity', icon: FileCheck2 },
                { key: 'trustscore', label: '6. Trust Score', icon: Award }
              ].map((node, idx, arr) => {
                const nodeData = dependencyNodes[node.key]!;
                const isSelected = selectedDependencyNode === node.key;
                const NodeIcon = node.icon;

                return (
                  <React.Fragment key={node.key}>
                    <motion.div
                      onClick={() => setSelectedDependencyNode(node.key)}
                      className={`p-4 bg-white border rounded-xl flex flex-col justify-between w-full md:w-36 min-h-[105px] cursor-pointer shadow-3xs transition-all duration-300 relative group select-none ${
                        isSelected 
                          ? 'border-indigo-600 ring-2 ring-indigo-50 scale-105 shadow-xs' 
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                      whileHover={{ y: -3 }}
                    >
                      {/* Active point indicator */}
                      {isSelected && (
                        <span className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 bg-indigo-600 rounded-full flex items-center justify-center border-2 border-white shadow-3xs">
                          <Check className="h-2 w-2 text-white" />
                        </span>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-400 font-mono uppercase tracking-tight">{node.label}</span>
                        <NodeIcon className={`h-4 w-4 ${isSelected ? 'text-indigo-600' : 'text-gray-400'}`} />
                      </div>

                      <div className="mt-2.5 space-y-0.5">
                        <span className="text-xs font-mono font-extrabold text-gray-900 block truncate">{nodeData.value}</span>
                        <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[8px] font-bold ${
                          nodeData.status === 'Verified' ? 'bg-emerald-50 text-emerald-800' :
                          nodeData.status === 'Warning' ? 'bg-amber-50 text-amber-800' :
                          'bg-red-50 text-red-800 animate-pulse'
                        }`}>
                          {nodeData.status}
                        </span>
                      </div>
                    </motion.div>

                    {/* Arrow Connector between nodes on desktop */}
                    {idx < arr.length - 1 && (
                      <div className="hidden md:flex text-gray-300 shrink-0 select-none animate-pulse">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Explanatory subtitle */}
            <p className="text-[10px] text-gray-400 font-mono text-center mt-8 leading-relaxed max-w-lg mx-auto">
              Our automated credit system trace matches physical files sequentially: verifying gross turnover first, scanning margin structures, sweeping liquid cash flows, and computing asset leverage to formulate the composite score.
            </p>
          </div>

          {/* Interactive details Node pane */}
          <div className="bg-gray-50 border border-gray-150 rounded-2xl p-6 min-h-[380px] flex flex-col justify-between">
            {(() => {
              const activeData = dependencyNodes[selectedDependencyNode]!;
              return (
                <div className="space-y-4 animate-fade-in flex flex-col justify-between h-full">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-150 pb-2.5">
                      <div>
                        <span className="text-[9px] font-mono font-bold text-indigo-600 uppercase tracking-wider block">Calculated Attribute</span>
                        <h4 className="text-sm font-bold text-gray-950 tracking-tight leading-none mt-0.5">{activeData.label}</h4>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                        activeData.status === 'Verified' ? 'bg-emerald-50 text-emerald-800' :
                        activeData.status === 'Warning' ? 'bg-amber-50 text-amber-800' :
                        'bg-red-50 text-red-800'
                      }`}>
                        {activeData.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest block">Value & Limit</span>
                      <span className="text-lg font-mono font-black text-gray-950 block">{activeData.value}</span>
                    </div>

                    <div className="space-y-1 bg-white border border-gray-150 p-3 rounded-xl">
                      <span className="text-[9px] font-mono font-bold text-indigo-700 uppercase block leading-none">Reconciliation Formula</span>
                      <p className="text-[10px] font-mono text-gray-700 font-semibold leading-relaxed pt-1">{activeData.formula}</p>
                    </div>

                    <p className="text-xs text-gray-500 leading-relaxed font-medium">{activeData.description}</p>

                    {/* Trace database list */}
                    <div className="space-y-1.5 pt-2 border-t border-gray-200">
                      <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest block mb-1">Direct Audit Log Trace</span>
                      {Object.entries(activeData.traceData).map(([k, v]) => (
                        <div key={k} className="flex justify-between items-center text-[10px] font-mono py-0.5">
                          <span className="text-gray-400">{k}:</span>
                          <span className="text-gray-900 font-bold">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200 text-[10px] text-gray-400 leading-normal font-mono flex items-start space-x-1.5">
                    <Database className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                    <div>
                      <span>Evidence Source Document:</span>
                      <span className="text-gray-700 font-bold block truncate max-w-[210px]">{activeData.source}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. EVIDENCE GRAPH SECTION                                 */}
      {/* ========================================================= */}
      <section className="bg-white border border-gray-150 rounded-2xl p-6 sm:p-8 shadow-3xs space-y-6" id="evidence-graph-section">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <FileCheck2 className="h-4.5 w-4.5 text-indigo-600" />
              <h3 className="text-sm font-bold text-gray-950 tracking-tight">Continuous Evidence Audit Trail Graph</h3>
            </div>
            <p className="text-xs text-gray-500 mt-1 font-medium leading-normal">
              Detailed tracking mapping raw financial statement extractions through ratios, observations, score index, and central decisions.
            </p>
          </div>
          <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest bg-gray-100 border border-gray-200 px-2 py-0.5 rounded h-fit shrink-0">
            Audit Trail Nodes
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          
          {[
            { key: 'statements', label: 'A. Source Uploads', desc: 'Financial Statements' },
            { key: 'ratios', label: 'B. Financial Ratios', desc: 'Solvency & Liquidity' },
            { key: 'observations', label: 'C. Audit Logs', desc: 'Observations & Registries' },
            { key: 'recommendationNode', label: 'D. Recommendation', desc: 'Credit Determination' }
          ].map((item) => {
            const isSelected = selectedEvidenceNode === item.key;
            const nodeData = evidenceNodes[item.key]!;

            return (
              <div 
                key={item.key}
                onClick={() => setSelectedEvidenceNode(item.key)}
                className={`bg-white border rounded-xl p-4 cursor-pointer transition-all duration-300 relative select-none ${
                  isSelected 
                    ? 'border-indigo-600 ring-2 ring-indigo-50 shadow-xs' 
                    : 'border-gray-200 hover:border-indigo-200'
                }`}
              >
                <span className="text-[10px] font-mono font-bold text-gray-400 block uppercase">{item.label}</span>
                <h4 className="text-xs font-bold text-gray-900 mt-1">{item.desc}</h4>
                <p className="text-[10px] text-gray-400 mt-0.5 leading-none font-mono truncate">{nodeData.subtitle}</p>

                {/* Little checkbox status */}
                <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[10px] font-mono font-bold">
                  <span className="text-indigo-600">Trace Logs: {nodeData.evidenceLogs.length}</span>
                  <CheckSquare className="h-3.5 w-3.5 text-emerald-600" />
                </div>
              </div>
            );
          })}

        </div>

        {/* Selected Evidence Node Details display */}
        <div className="bg-gray-50 border border-gray-150 rounded-2xl p-6">
          {(() => {
            const activeNode = evidenceNodes[selectedEvidenceNode]!;
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                
                {/* Left side checklist */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 border-b border-gray-150 pb-2">
                    <span className="h-2 w-2 bg-indigo-500 rounded-full"></span>
                    <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">Cryptographic Logs Matching</h4>
                  </div>

                  <div className="space-y-2.5">
                    {activeNode.evidenceLogs.map((log, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white border border-gray-150 p-2.5 rounded-xl text-xs shadow-3xs">
                        <span className="text-gray-500 font-semibold">{log.label}</span>
                        <div className="flex items-center space-x-1.5 font-mono">
                          <span className="text-gray-900 font-extrabold">{log.value}</span>
                          {log.status === 'Verified' ? (
                            <ShieldCheck className="h-4 w-4 text-emerald-600" />
                          ) : log.status === 'Warning' ? (
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500 animate-pulse" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right side textual observations */}
                <div className="space-y-4 border-t md:border-t-0 md:border-l border-gray-150 pt-4 md:pt-0 md:pl-6 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 border-b border-gray-150 pb-2">
                      <span className="h-2 w-2 bg-indigo-500 rounded-full"></span>
                      <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">AI Forensic Observations</h4>
                    </div>

                    <ul className="space-y-2">
                      {activeNode.observations.map((obs, idx) => (
                        <li key={idx} className="text-xs text-gray-600 leading-relaxed font-medium flex items-start space-x-2">
                          <span className="text-indigo-500 font-extrabold shrink-0">•</span>
                          <span>{obs}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-indigo-50/30 border border-indigo-100 p-3.5 rounded-xl space-y-1 mt-4">
                    <span className="text-[9px] font-mono font-bold text-indigo-700 uppercase tracking-widest block leading-none">Decision recommendation</span>
                    <p className="text-xs font-bold text-indigo-900 leading-tight">{activeNode.recommendation}</p>
                  </div>
                </div>

              </div>
            );
          })()}
        </div>
      </section>

    </div>
  );
}
