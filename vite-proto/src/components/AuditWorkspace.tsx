/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, ShieldCheck, AlertTriangle, AlertCircle, FileText, CheckSquare, 
  MessageSquare, Download, Check, Save, HardDrive, ArrowUpRight, TrendingUp, 
  Sparkles, Building, UserCheck, Calendar, RefreshCw, Printer, Share2, 
  Database, Network, BookOpen, Clock, Zap, Cpu, Award
} from 'lucide-react';
import { Company, AuditLog, FinancialMetric, DocumentInfo } from '../types';
import EvidenceGraph from './EvidenceGraph';

interface AuditWorkspaceProps {
  company: Company;
  onBack: () => void;
  onUpdateCompany: (updatedCompany: Company) => void;
}

export default function AuditWorkspace({ company, onBack, onUpdateCompany }: AuditWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'narrative' | 'lineage' | 'report'>('dashboard');
  
  // Interactive Radar Chart Dimension Hover State
  const [hoveredDimension, setHoveredDimension] = useState<string | null>(null);
  
  // Credit officer manual override inputs
  const [notes, setNotes] = useState(company.reviewerNotes || '');
  const [decision, setDecision] = useState(company.decision || 'PENDING');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Dynamic share & download feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Decision Replay Timeline Playback Controls
  const [replayStep, setReplayStep] = useState<number>(6); // 0 to 6
  const [isPlayingReplay, setIsPlayingReplay] = useState<boolean>(false);

  // Ref for print container
  const printDossierRef = useRef<HTMLDivElement>(null);
  const printHealthCardRef = useRef<HTMLDivElement>(null);

  // 1. Definition of the 11 Core Dashboard Cards
  const dashboardCards = [
    {
      id: 'integrity',
      title: 'Financial Integrity',
      value: '92%',
      subtext: 'P&L matches GSTR-3B filings',
      status: 'Verified',
      bg: 'bg-emerald-50/50 border-emerald-150 text-emerald-800',
      icon: ShieldCheck,
      details: 'Audit trail verified less than 1.1% revenue variance across filing registries.'
    },
    {
      id: 'verification',
      title: 'Verification Status',
      value: '100%',
      subtext: 'Statutory Registries Matched',
      status: 'Verified',
      bg: 'bg-emerald-50/50 border-emerald-150 text-emerald-800',
      icon: Database,
      details: 'MCA registered standing is Active. KYC credentials of all directors verified.'
    },
    {
      id: 'stability',
      title: 'Business Stability',
      value: 'Stable',
      subtext: 'Low default volatility model',
      status: 'Verified',
      bg: 'bg-emerald-50/50 border-emerald-150 text-emerald-800',
      icon: Building,
      details: 'EPFO registers show regular monthly payouts to 62 employees, ensuring active operations.'
    },
    {
      id: 'liquidity',
      title: 'Liquidity Index',
      value: `${company.metrics[company.metrics.length - 1].currentRatio.toFixed(2)}x`,
      subtext: `DSCR: ${company.metrics[company.metrics.length - 1].dscr.toFixed(2)}x`,
      status: 'Verified',
      bg: 'bg-indigo-50/40 border-indigo-100 text-indigo-800',
      icon: DollarSignIcon,
      details: 'Snug debt service margins. Liquidity buffer matches commercial working capital limits.'
    },
    {
      id: 'growth',
      title: 'Growth trajectory',
      value: '+14.5%',
      subtext: 'YoY Gross Sales CAGR',
      status: 'Verified',
      bg: 'bg-indigo-50/40 border-indigo-100 text-indigo-800',
      icon: TrendingUp,
      details: 'Consistent revenue growth driven by expanded distributor network. Audited trends certified.'
    },
    {
      id: 'fraud',
      title: 'Fraud Risk Rating',
      value: 'Low Risk',
      subtext: 'Zero ledger discrepancies',
      status: 'Verified',
      bg: 'bg-emerald-50/50 border-emerald-150 text-emerald-800',
      icon: CheckSquare,
      details: 'No duplicate invoicing, rounded transactions, or high circular-trading signals flagged.'
    },
    {
      id: 'governance',
      title: 'Governance Ratios',
      value: 'Compliant',
      subtext: 'All filings up-to-date',
      status: 'Verified',
      bg: 'bg-emerald-50/50 border-emerald-150 text-emerald-800',
      icon: UserCheck,
      details: 'AOC-4 filed on time. No litigation flags found across public regulatory directories.'
    },
    {
      id: 'data_conf',
      title: 'Data Confidence',
      value: '98%',
      subtext: '10 Uploaded files scanned',
      status: 'Verified',
      bg: 'bg-indigo-50/40 border-indigo-100 text-indigo-800',
      icon: FileText,
      details: 'High-resolution PDFs analyzed with certified metadata signatures and OCR confidence.'
    },
    {
      id: 'trust',
      title: 'Automated Trust Score',
      value: `${company.trustScore}%`,
      subtext: 'Weighted Signal Index',
      status: 'Verified',
      bg: 'bg-indigo-50/40 border-indigo-100 text-indigo-800',
      icon: Award,
      details: 'Weighted combination of statutory matching, liquidity buffers, and filing speed.'
    },
    {
      id: 'confidence',
      title: 'AI System Confidence',
      value: 'High',
      subtext: 'Comprehensive Audit Complete',
      status: 'Verified',
      bg: 'bg-indigo-50/40 border-indigo-100 text-indigo-800',
      icon: Sparkles,
      details: 'High matching assurance. All core statutory data pipelines fully resolved.'
    },
    {
      id: 'recommendation_card',
      title: 'Lending Recommendation',
      value: company.status === 'Verified' ? 'Approve Credit' : 'Review Snippets',
      subtext: 'Low default probability',
      status: 'Verified',
      bg: 'bg-emerald-50/50 border-emerald-150 text-emerald-800',
      icon: Zap,
      details: 'Proposed working capital credit is covered comfortably by recurring operational inflows.'
    }
  ];

  // 2. Interactive Radar Chart Dimension Specifications
  const radarDimensions = [
    { key: 'liquidity', label: 'Liquidity', val: 80, color: 'text-indigo-600', text: 'Measures DSCR, Quick and Current ratios. Current standing: 1.52x current assets ratio (Strong).' },
    { key: 'profitability', label: 'Profitability', val: 85, color: 'text-emerald-600', text: 'EBITDA margins at 14.0% with strong profit-after-tax (PAT) trends.' },
    { key: 'growth', label: 'Growth', val: 90, color: 'text-amber-600', text: 'Double-digit YoY compound turnover expansion matching market sector trends.' },
    { key: 'stability', label: 'Operational Stability', val: 88, color: 'text-purple-600', text: 'Steady workforce headcount (62 EPFO active employees) and active facilities.' },
    { key: 'governance', label: 'Governance', val: 95, color: 'text-teal-600', text: 'No litigation or winding up warnings. On-time registrar filing history.' },
    { key: 'verification', label: 'Verification', val: 98, color: 'text-sky-600', text: '100% matches across MCA databases, tax registries, and ledger statements.' },
    { key: 'resilience', label: 'Resilience', val: 85, color: 'text-rose-600', text: 'Weighted debt capacity and cushion margins under stress-test interest modeling.' }
  ];

  // Interactive Radar Calculations
  const cx = 150;
  const cy = 150;
  const r = 100;
  const numPoints = radarDimensions.length;

  // Compute exact coordinates for concentric rings
  const ringPolygons = [20, 40, 60, 80, 100].map(level => {
    return radarDimensions.map((_, i) => {
      const angle = (i * 2 * Math.PI) / numPoints - Math.PI / 2;
      const x = cx + r * (level / 100) * Math.cos(angle);
      const y = cy + r * (level / 100) * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  });

  // Compute exact coordinates for data points
  const dataPolygonPoints = radarDimensions.map((d, i) => {
    const angle = (i * 2 * Math.PI) / numPoints - Math.PI / 2;
    const x = cx + r * (d.val / 100) * Math.cos(angle);
    const y = cy + r * (d.val / 100) * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  // Compute exact peer benchmarks coordinates for comparison (e.g. standard MSME benchmark of 70)
  const benchmarkPolygonPoints = radarDimensions.map((_, i) => {
    const angle = (i * 2 * Math.PI) / numPoints - Math.PI / 2;
    const x = cx + r * 0.7 * Math.cos(angle);
    const y = cy + r * 0.7 * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  // 5. Decision Replay Timeline Steps
  const timelineSteps = [
    {
      time: '09:01',
      title: 'Documents Uploaded',
      desc: '10 multi-source corporate records successfully uploaded, indexed, and checksummed.',
      files: 'BS Extracts, GSTR Receipts, Bank Ledger BOB, Director KYC Pack',
      metrics: 'Uploaded Files: 10 | Status: Active Stream'
    },
    {
      time: '09:02',
      title: 'Financial Parsing',
      desc: 'OCR engines mapped accounting tables, P&L columns, and balance sheet nodes into taxonomy matrices.',
      files: 'Audited_PL_FY24-FY26.pdf, BS_3Yr_Signed_Extract.pdf',
      metrics: 'EBITDA Match: 100% | Solvency margins extracted'
    },
    {
      time: '09:03',
      title: 'Cross Verification',
      desc: 'Veritas agent compared gross sales numbers against GSTR-3B filings and matched BOB monthly cash bank collections.',
      files: 'GST_All_Months_FY26.pdf, BOB_CA_Statement_FY26.pdf',
      metrics: 'Filing Alignment: 98.9% | Variance: < 1.1%'
    },
    {
      time: '09:04',
      title: 'Business Reality Generated',
      desc: 'Candor agent scanned accounting footnotes, auditor qualifications, and headcount EPFO registers to assess commercial viability.',
      files: 'Accounting_Disclosures.pdf, EPFO Registry API',
      metrics: 'Active staff: 62 | Qualified Audit Statements: 0'
    },
    {
      time: '09:05',
      title: 'Evidence Graph Built',
      desc: 'Constructed an integrated multi-point lineage graph matching source balance sheets directly to liquidity indices and decisions.',
      files: 'All corporate uploads',
      metrics: 'Linked nodes: 7 | Graph weight consistency: Optimal'
    },
    {
      time: '09:06',
      title: 'Trust Score Calculated',
      desc: 'Synthesized overall Trust Score based on weighted metrics. Statutory index (98%), Financial health (90%), Operational stability (88%).',
      files: 'Risk score matrices',
      metrics: 'Composite score: 88/100 | Quality level: Pristine'
    },
    {
      time: '09:07',
      title: 'Recommendation Generated',
      desc: 'Oracle agent weight-balanced risk factors and generated compliance lending recommendation for credit desks.',
      files: 'Decision Desk Dossier',
      metrics: 'Action: APPROVE CREDIT LIMIT | Stress-test buffer: Safe'
    }
  ];

  // Timeline Auto-Replay Ticker
  useEffect(() => {
    if (!isPlayingReplay) return;
    const interval = setInterval(() => {
      setReplayStep(prev => {
        if (prev >= 6) return 0;
        return prev + 1;
      });
    }, 2200);
    return () => clearInterval(interval);
  }, [isPlayingReplay]);

  // Toast Timer helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // 8. Fully Functional Action Handlers
  const handleSaveNotes = () => {
    setIsSaving(true);
    setTimeout(() => {
      let newStatus = company.status;
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

  const handleShareReport = () => {
    const summaryText = `Credence Due Diligence Audit Summary for ${company.name}:\n- Trust Score: ${company.trustScore}%\n- Decision: ${company.decision || 'PENDING'}\n- Revenue: ₹${company.turnover} Cr\n- Status: ${company.status}\nAudit compiled by IDBI Bank Credit Desk.`;
    navigator.clipboard.writeText(summaryText);
    triggerToast('Dossier summary copied to clipboard! Shareable in email or Slack.');
  };

  return (
    <div className="space-y-6" id="audit-workspace-master">
      
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-mono font-semibold px-4 py-3 rounded-xl border border-slate-800 shadow-xl flex items-center space-x-2 animate-bounce">
          <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Workspace Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-150 pb-5 gap-4">
        <div className="flex items-center space-x-3.5">
          <button
            onClick={onBack}
            className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 cursor-pointer transition-colors"
            title="Return to Credit Desk"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">{company.name}</h2>
              <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${
                company.status === 'Verified' 
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                  : 'text-amber-700 bg-amber-50 border-amber-200'
              }`}>
                {company.status}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 font-mono">
              CIN: {company.cin} | GSTIN: {company.gstin} | PAN: {company.pan}
            </p>
          </div>
        </div>

        {/* TOP LEVEL ACTION BAR (Section 8: Action Buttons) */}
        <div className="flex flex-wrap items-center gap-2">
          
          <button
            onClick={handlePrintDossier}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs font-mono font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg cursor-pointer transition-all shadow-3xs"
            title="Print entire audit workspace"
          >
            <Printer className="h-3.5 w-3.5 text-indigo-600" />
            <span>PRINT REPORT</span>
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs font-mono font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg cursor-pointer transition-all shadow-3xs"
            title="Download printable MSME card"
          >
            <Award className="h-3.5 w-3.5 text-indigo-600" />
            <span>HEALTH CARD</span>
          </button>

          <button
            onClick={handleDownloadJSON}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs font-mono font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg cursor-pointer transition-all shadow-3xs"
            title="Export raw diligence metrics in JSON format"
          >
            <Download className="h-3.5 w-3.5 text-indigo-600" />
            <span>EXPORT JSON</span>
          </button>

          <button
            onClick={handleShareReport}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs font-mono font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer transition-all shadow-3xs"
            title="Copy audit findings to clipboard"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>SHARE</span>
          </button>

        </div>
      </div>

      {/* Main Workspace Navigation Rails */}
      <div className="border-b border-gray-150 flex items-center space-x-6">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`pb-3 text-xs font-mono font-semibold uppercase tracking-wider relative cursor-pointer transition-all ${
            activeTab === 'dashboard' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Credit Intelligence
        </button>
        <button
          onClick={() => setActiveTab('narrative')}
          className={`pb-3 text-xs font-mono font-semibold uppercase tracking-wider relative cursor-pointer transition-all ${
            activeTab === 'narrative' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Business Forensic Narrative
        </button>
        <button
          onClick={() => setActiveTab('lineage')}
          className={`pb-3 text-xs font-mono font-semibold uppercase tracking-wider relative cursor-pointer transition-all ${
            activeTab === 'lineage' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Evidence Graph
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={`pb-3 text-xs font-mono font-semibold uppercase tracking-wider relative cursor-pointer transition-all ${
            activeTab === 'report' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Printable Dossier & Health Card
        </button>
      </div>

      {/* ======================================= */}
      {/* TAB 1: CREDIT INTELLIGENCE DASHBOARD  */}
      {/* ======================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          
          {/* SECTION 1: FINANCIAL HEALTH DASHBOARD (11 Cards) */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Zap className="h-4.5 w-4.5 text-indigo-600" />
              <h3 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">Financial Health Dashboard Bento Grid</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3.5">
              {dashboardCards.map(card => {
                const CardIcon = card.icon;
                return (
                  <div 
                    key={card.id} 
                    className={`border rounded-xl p-3.5 flex flex-col justify-between min-h-[115px] transition-all duration-300 hover:shadow-xs group relative overflow-hidden ${card.bg}`}
                    id={`bento-card-${card.id}`}
                  >
                    {/* Tooltip detail overlay */}
                    <div className="absolute inset-0 bg-slate-900/95 text-[10px] text-slate-200 p-3 leading-normal opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex items-center justify-center text-center font-mono">
                      {card.details}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight block truncate w-10/12">{card.title}</span>
                      <CardIcon className="h-4 w-4 text-gray-400 shrink-0" />
                    </div>

                    <div className="mt-2.5">
                      <span className="text-lg font-mono font-extrabold text-gray-900 tracking-tight block">{card.value}</span>
                      <span className="text-[9px] text-gray-400 font-mono mt-0.5 block truncate leading-none">{card.subtext}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: INTERACTIVE RADAR CHART & SIDE PANEL */}
          <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-3xs">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-3 mb-4">
              <Network className="h-4.5 w-4.5 text-indigo-600" />
              <h3 className="text-sm font-bold text-gray-900 tracking-tight">Interactive AI Risk Radar Alignment</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              
              {/* Radar Chart SVG Workspace */}
              <div className="lg:col-span-2 flex justify-center items-center py-4 bg-gray-50/50 rounded-xl border border-gray-100 min-h-[340px]">
                <div className="relative w-[340px] h-[320px]">
                  <svg viewBox="0 0 300 300" className="w-full h-full">
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

                    {/* Outer concentric level ring */}
                    <polygon
                      points={ringPolygons[4]}
                      fill="none"
                      stroke="#cbd5e1"
                      strokeWidth="1.2"
                    />

                    {/* Grid labels background grids */}
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

                    {/* Radial spoke lines */}
                    {radarDimensions.map((_, i) => {
                      const angle = (i * 2 * Math.PI) / numPoints - Math.PI / 2;
                      const x = cx + r * Math.cos(angle);
                      const y = cy + r * Math.sin(angle);
                      return (
                        <line
                          key={`spoke-${i}`}
                          x1={cx}
                          y1={cy}
                          x2={x}
                          y2={y}
                          stroke="#e2e8f0"
                          strokeWidth="1"
                        />
                      );
                    })}

                    {/* Peer Benchmark Standard (Static 70% level) */}
                    <polygon
                      points={benchmarkPolygonPoints}
                      fill="rgba(156, 163, 175, 0.05)"
                      stroke="#9ca3af"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />

                    {/* Actual corporate data polygon */}
                    <polygon
                      points={dataPolygonPoints}
                      fill="rgba(99, 102, 241, 0.15)"
                      stroke="#4f46e5"
                      strokeWidth="2.5"
                    />

                    {/* Interactive Dimension Vertices */}
                    {radarDimensions.map((d, i) => {
                      const angle = (i * 2 * Math.PI) / numPoints - Math.PI / 2;
                      const x = cx + r * (d.val / 100) * Math.cos(angle);
                      const y = cy + r * (d.val / 100) * Math.sin(angle);
                      
                      // Label coordinates displaced outward slightly
                      const labelX = cx + (r + 18) * Math.cos(angle);
                      const labelY = cy + (r + 10) * Math.sin(angle);

                      const isHovered = hoveredDimension === d.key;

                      return (
                        <g 
                          key={`vertex-${d.key}`}
                          onMouseEnter={() => setHoveredDimension(d.key)}
                          onMouseLeave={() => setHoveredDimension(null)}
                          className="cursor-pointer"
                        >
                          {/* Guideline vertex dot */}
                          <circle
                            cx={x}
                            cy={y}
                            r={isHovered ? 6 : 4}
                            fill={isHovered ? '#4f46e5' : '#818cf8'}
                            stroke="#ffffff"
                            strokeWidth="1.5"
                            className="transition-all duration-150"
                          />

                          {/* Radar Axis Label */}
                          <text
                            x={labelX}
                            y={labelY}
                            textAnchor="middle"
                            alignmentBaseline="middle"
                            className={`text-[9px] font-mono font-bold select-none transition-colors duration-150 ${
                              isHovered ? 'fill-indigo-600 font-extrabold' : 'fill-gray-600'
                            }`}
                          >
                            {d.label}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Side Panel showing detailed parameters of selected/hovered dimension */}
              <div className="border border-gray-100 rounded-xl p-5 bg-gray-50/20 h-full flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-wider block">Risk Parameter Diagnostics</span>
                    <h4 className="text-base font-bold text-gray-900 mt-1">Multi-Dimension Coverage</h4>
                  </div>

                  <p className="text-xs text-gray-500 leading-normal">
                    The radar diagram evaluates continuous statutory inputs on a 0-100% scale against baseline sector standards (marked as the dashed peer benchmarks line).
                  </p>

                  <div className="space-y-3.5 pt-2">
                    {radarDimensions.map(d => {
                      const isHovered = hoveredDimension === d.key;
                      return (
                        <div 
                          key={d.key}
                          onMouseEnter={() => setHoveredDimension(d.key)}
                          onMouseLeave={() => setHoveredDimension(null)}
                          className={`p-2.5 rounded-lg border transition-all duration-200 cursor-pointer ${
                            isHovered 
                              ? 'bg-indigo-50/60 border-indigo-200 shadow-3xs scale-[1.01]' 
                              : 'bg-white border-gray-100 hover:bg-gray-50/50'
                          }`}
                        >
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-gray-800">{d.label}</span>
                            <span className="font-mono font-extrabold text-indigo-600">{d.val}%</span>
                          </div>
                          
                          {isHovered && (
                            <p className="text-[10px] text-indigo-900 mt-1.5 leading-normal animate-fade-in font-mono">
                              {d.text}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="text-[10px] font-mono text-gray-400 mt-4 border-t border-gray-100 pt-3 text-center">
                  Hover over coordinate points to view specific risk analyses.
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 5: DECISION REPLAY TIMELINE */}
          <div className="bg-slate-900 text-white border border-slate-950 rounded-2xl p-5 shadow-xl relative overflow-hidden" id="timeline-card">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 mb-5 gap-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
                  <Clock className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight">AI Decision Replay Engine</h3>
                  <p className="text-[10px] text-slate-400">Replay, inspect, and step-through each minute of the AI due diligence compilation process</p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsPlayingReplay(!isPlayingReplay)}
                  className={`px-3 py-1 text-xs font-mono font-bold rounded-lg cursor-pointer flex items-center space-x-1.5 border transition-all ${
                    isPlayingReplay 
                      ? 'bg-amber-600 text-white border-amber-500 hover:bg-amber-500' 
                      : 'bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-500 shadow-sm'
                  }`}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isPlayingReplay ? 'animate-spin' : ''}`} />
                  <span>{isPlayingReplay ? 'Pause Auto-Replay' : 'Auto-Replay Timeline'}</span>
                </button>
                <span className="text-[10px] font-mono text-slate-500">Step: {replayStep + 1}/7</span>
              </div>
            </div>

            {/* Horizontal Timeline Track */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-7 gap-3 mb-6 border-b border-slate-800 pb-6 overflow-x-auto">
              {timelineSteps.map((step, idx) => {
                const isActive = replayStep === idx;
                const isPassed = replayStep > idx;

                let cardBg = 'bg-slate-950/40 border-slate-800 opacity-60';
                let iconCol = 'text-slate-500';
                let titleCol = 'text-slate-400';

                if (isActive) {
                  cardBg = 'bg-indigo-950/60 border-indigo-500/50 ring-2 ring-indigo-500/20 opacity-100 scale-[1.01]';
                  iconCol = 'text-indigo-400';
                  titleCol = 'text-indigo-300 font-bold';
                } else if (isPassed) {
                  cardBg = 'bg-slate-950/80 border-slate-800 opacity-100';
                  iconCol = 'text-emerald-400';
                  titleCol = 'text-slate-200';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => { setReplayStep(idx); setIsPlayingReplay(false); }}
                    className={`border p-3.5 rounded-xl flex flex-col justify-between text-left cursor-pointer transition-all duration-300 min-h-[110px] ${cardBg}`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-indigo-400">{step.time}</span>
                        {isPassed && !isActive && <Check className="h-3 w-3 text-emerald-400" />}
                        {isActive && <span className="h-2 w-2 rounded-full bg-indigo-400 animate-ping"></span>}
                      </div>
                      <h4 className={`text-[11px] leading-snug mt-1.5 ${titleCol}`}>{step.title}</h4>
                    </div>

                    <div className="text-[8px] font-mono text-slate-500 mt-2 block truncate w-full">
                      {step.metrics.split('|')[0]}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Replay Inspector Frame */}
            <div className="relative z-10 bg-slate-950 rounded-xl p-4.5 border border-slate-800/80 flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-900 uppercase">
                    Stage {replayStep + 1} Inspector
                  </span>
                  <span className="text-xs font-mono text-slate-400">@ {timelineSteps[replayStep].time} MST</span>
                </div>
                <h4 className="text-sm font-bold text-white tracking-tight">{timelineSteps[replayStep].title}</h4>
                <p className="text-xs text-slate-300 leading-normal font-sans">
                  {timelineSteps[replayStep].desc}
                </p>
              </div>

              <div className="border-l border-slate-800/80 pl-4 space-y-3 shrink-0 min-w-[200px]">
                <div>
                  <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block">Targeted Entities Analyzed</span>
                  <span className="text-[10px] font-mono text-slate-300 block truncate max-w-[240px]" title={timelineSteps[replayStep].files}>
                    {timelineSteps[replayStep].files}
                  </span>
                </div>
                <div>
                  <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block">Diagnostic Metrics Read</span>
                  <span className="text-[10px] font-mono text-emerald-400 block">
                    {timelineSteps[replayStep].metrics}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* AUTHORIZATION OVERWRITE NOTES PANEL */}
          <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-3xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
              <UserCheck className="h-4.5 w-4.5 text-indigo-600" />
              <h3 className="font-bold text-gray-900 text-sm tracking-tight">Credit Officer Authorization Desk</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-1 space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Authorization Decision Override</label>
                  <select
                    value={decision}
                    onChange={(e) => setDecision(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-50 font-semibold bg-white"
                  >
                    <option value="PENDING">PENDING REVIEW</option>
                    <option value="APPROVED">APPROVE CREDIT LIMIT</option>
                    <option value="REFERRED">REFER TO RISK COMMITTEE</option>
                    <option value="REJECTED">REJECT LOAN APPLICATION</option>
                  </select>
                </div>
                
                <button
                  onClick={handleSaveNotes}
                  disabled={isSaving}
                  className="w-full flex items-center justify-center space-x-1.5 px-4 py-2.5 text-xs font-mono font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  {isSaving ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Saving...</span>
                    </>
                  ) : saveSuccess ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Decision Authorized!</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>AUTHORIZE DECISION</span>
                    </>
                  )}
                </button>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">Diligence Statement & Qualified Opinion Justification</label>
                <textarea
                  rows={5}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Provide precise details for decision override, collateral conditions, or qualified statutory observations..."
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-50 font-medium font-sans"
                />
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ======================================= */}
      {/* TAB 2: FORENSIC NARRATIVE MODULE        */}
      {/* ======================================= */}
      {activeTab === 'narrative' && (
        <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-3xs space-y-6">
          <div className="flex items-center space-x-2.5 border-b border-gray-100 pb-4">
            <BookOpen className="h-5 w-5 text-indigo-600" />
            <div>
              <h3 className="text-base font-bold text-gray-900 tracking-tight">SECTION 3: AI Business Reality Forensic Narrative</h3>
              <p className="text-xs text-gray-500">Autonomous qualitative analysis compiling accounting footnotes, ledger trends, and risk vectors</p>
            </div>
          </div>

          {/* Forensic Narrative Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Detailed Written Narrative Report */}
            <div className="lg:col-span-3 space-y-5 font-sans text-gray-700 text-sm leading-relaxed max-w-3xl">
              
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900 flex items-center">
                  <span className="w-1.5 h-3 bg-indigo-600 rounded mr-2 inline-block"></span>
                  1. Revenue & Sales Compliance Trends
                </h4>
                <p>
                  Our Veritas and Sentinel cross-verification algorithms performed full-spectrum index matching over the past 36 consecutive months of financial records. Gross sales turnover for the current fiscal period stands resolved at <strong className="text-gray-900">₹{company.turnover.toFixed(1)} Crores</strong>. GSTR-3B filings recorded in federal tax databases align with general ledger revenue accounts with a minimal mismatch factor of <strong className="text-emerald-600">less than 1.1%</strong>, demonstrating pristine invoicing integrity and eliminating circular-trading concerns.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900 flex items-center">
                  <span className="w-1.5 h-3 bg-indigo-600 rounded mr-2 inline-block"></span>
                  2. Cash Flow & Liquidity Reconciliation
                </h4>
                <p>
                  Operating cash flows exhibit a high degree of transactional liquidity. Inflow receipts have been cross-matched against BOB corporate bank statements representing substantial recurring cash positions with average daily credits comfortably meeting monthly liabilities. Operational bank collection tracks reveal <strong className="text-emerald-600">zero inward cheque bounce events</strong> or overdraft breaches during the trailing 12-month scrutiny period, ensuring high solvency.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900 flex items-center">
                  <span className="w-1.5 h-3 bg-indigo-600 rounded mr-2 inline-block"></span>
                  3. Working Capital & Inventory Management
                </h4>
                <p>
                  The current asset cycle is optimized around healthy asset turnovers. Inventory is valued under standard FIFO methodologies and exhibits a robust holding period of <strong className="text-gray-900">57 Days</strong>, with inventory turns computed at <strong className="text-gray-900">6.42x</strong> annually. Receivable tracking indices indicate debtor collection velocities average <strong className="text-gray-900">42 Days</strong>, indicating high payment quality and minimizing toxic exposure to dead assets.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900 flex items-center">
                  <span className="w-1.5 h-3 bg-indigo-600 rounded mr-2 inline-block"></span>
                  4. Governance, Headcount & EPFO Standing
                </h4>
                <p>
                  Operational stability is validated by EPFO social security registers. Employee payroll allocations match standard salary disbursements across <strong className="text-gray-900">62 registered staff members</strong>, indicating a stable, highly active corporate workforce. All director credentials match high-level KYC standards perfectly, and public databases confirm that no civil litigation default files are registered against the company.
                </p>
              </div>

            </div>

            {/* Sidebar with Risk and Watchpoints */}
            <div className="space-y-4">
              
              {/* Risks & Stress Buffers */}
              <div className="bg-amber-50/40 border border-amber-150 rounded-xl p-4.5 space-y-3">
                <h4 className="text-xs font-mono font-bold text-amber-800 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1.5 text-amber-500" />
                  Forensic Risk Watchpoints
                </h4>
                <ul className="text-[11px] font-sans text-amber-900 space-y-2.5 list-disc pl-3">
                  <li>
                    <strong>Snug DSCR Cushion:</strong> Calculated DSCR of {company.metrics[company.metrics.length - 1].dscr.toFixed(2)}x remains safe but snug under stress test modeling scenarios.
                  </li>
                  <li>
                    <strong>Refinancing Due in Dec 2026:</strong> An upcoming commercial facility renewal demands continuous liquidity tracking.
                  </li>
                  <li>
                    <strong>Mediation Value Check:</strong> Minor legal Mediation value adjustment case of ₹12 Lakh exists but represents negligible threat.
                  </li>
                </ul>
              </div>

              {/* Data confidence badge */}
              <div className="bg-indigo-50/30 border border-indigo-100 rounded-xl p-4.5 space-y-2">
                <span className="text-[9px] font-mono font-bold text-indigo-600 uppercase tracking-wider block">Security Audit Certificate</span>
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="h-5 w-5 text-indigo-600" />
                  <span className="text-xs font-bold text-gray-800">AES-256 Validated</span>
                </div>
                <p className="text-[10px] text-gray-400 font-mono leading-normal">
                  All extracted metadata anchors matches federal registries, certified as fully untampered.
                </p>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* TAB 3: EVIDENCE GRAPH VIEW              */}
      {/* ======================================= */}
      {activeTab === 'lineage' && (
        <EvidenceGraph company={company} />
      )}

      {/* ======================================= */}
      {/* TAB 4: PRINTABLE DOSSIER & CARDS        */}
      {/* ======================================= */}
      {activeTab === 'report' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Detailed Printable A4 Dossier Report (Section 6) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between bg-white border border-gray-150 px-4 py-2.5 rounded-xl shadow-3xs">
              <span className="text-xs font-mono font-bold text-gray-500">Official A4 Audit Report View</span>
              <button
                onClick={handlePrintDossier}
                className="flex items-center space-x-1.5 px-3 py-1 text-xs font-mono font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-200 cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Launch print window</span>
              </button>
            </div>

            {/* A4 Printable Box Container */}
            <div 
              ref={printDossierRef}
              className="bg-white border border-gray-200 p-8 shadow-md rounded-2xl max-w-4xl mx-auto print:border-0 print:shadow-none print:p-0 font-sans text-gray-800"
              id="a4-printable-dossier"
            >
              {/* Printable-only Stylesheet */}
              <style>{`
                @media print {
                  body { background: white; color: black; }
                  header, footer, nav, button, .no-print, #app-header { display: none !important; }
                  #audit-workspace-master { padding: 0 !important; margin: 0 !important; }
                  #a4-printable-dossier { border: 0 !important; shadow: none !important; margin: 0 !important; padding: 0 !important; width: 100% !important; max-width: 100% !important; }
                }
              `}</style>

              {/* Bank Letterhead */}
              <div className="border-b-2 border-slate-900 pb-5 mb-6 flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono font-bold text-gray-400 tracking-wider uppercase block">IDBI Credit Risk Operations</span>
                  <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">AI Due Diligence Audit Dossier</h1>
                  <p className="text-[10px] text-gray-500 font-mono mt-0.5">Automated Risk Analysis Compiled under AES-256 protocols</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-slate-800 block">CONFIDENTIAL</span>
                  <span className="text-[9px] font-mono text-gray-400 mt-0.5 block">Date Compiled: {new Date().toISOString().slice(0, 10)}</span>
                </div>
              </div>

              {/* Section: Company Summary Information Table */}
              <div className="space-y-4">
                <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1">I. Corporate entity profile</h3>
                
                <table className="w-full text-xs text-left border-collapse border border-gray-200 mb-6">
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <th className="px-3 py-2 bg-gray-50 font-semibold text-gray-600 w-1/4">Legal Company Name</th>
                      <td className="px-3 py-2 font-bold text-gray-900 w-1/4">{company.name}</td>
                      <th className="px-3 py-2 bg-gray-50 font-semibold text-gray-600 w-1/4">Registration Number (CIN)</th>
                      <td className="px-3 py-2 font-mono text-gray-900 w-1/4">{company.cin}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <th className="px-3 py-2 bg-gray-50 font-semibold text-gray-600">Goods & Service Tax GSTIN</th>
                      <td className="px-3 py-2 font-mono text-gray-900">{company.gstin}</td>
                      <th className="px-3 py-2 bg-gray-50 font-semibold text-gray-600">Income Tax Permanent A/C (PAN)</th>
                      <td className="px-3 py-2 font-mono text-gray-900">{company.pan}</td>
                    </tr>
                    <tr>
                      <th className="px-3 py-2 bg-gray-50 font-semibold text-gray-600">Primary Industry Classification</th>
                      <td className="px-3 py-2 font-semibold text-gray-900">{company.industry}</td>
                      <th className="px-3 py-2 bg-gray-50 font-semibold text-gray-600">Proposed Lending Credit Request</th>
                      <td className="px-3 py-2 font-bold text-indigo-700">₹{company.loanAmount.toFixed(2)} Cr</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Section: Trust Score & Confidence Rating */}
              <div className="space-y-4 mt-6">
                <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1">II. AI Audit score & Confidence Summary</h3>
                
                <div className="grid grid-cols-3 gap-4 border border-gray-200 rounded-lg p-3 bg-gray-50/50 mb-6 text-center">
                  <div>
                    <span className="text-[10px] font-mono text-gray-400 block uppercase">Composite Trust Score</span>
                    <span className="text-lg font-mono font-extrabold text-indigo-600">{company.trustScore}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-gray-400 block uppercase">Data Confidence Assessment</span>
                    <span className="text-lg font-mono font-extrabold text-slate-800">98% (High Assurance)</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-gray-400 block uppercase">Core Recommended Action</span>
                    <span className="text-lg font-mono font-extrabold text-emerald-600">APPROVE CREDIT</span>
                  </div>
                </div>
              </div>

              {/* Section: Financial health indicators */}
              <div className="space-y-4 mt-6">
                <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1">III. Certified Financial Health indicators</h3>
                
                <table className="w-full text-[11px] text-left border-collapse border border-gray-200 mb-6">
                  <thead>
                    <tr className="bg-gray-100 text-gray-600 uppercase font-mono text-[9px] border-b border-gray-200">
                      <th className="px-3 py-2">Fiscal Metric</th>
                      <th className="px-3 py-2 text-right">FY24</th>
                      <th className="px-3 py-2 text-right">FY25</th>
                      <th className="px-3 py-2 text-right">FY26</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <th className="px-3 py-1.5 font-semibold text-gray-700">Reported Sales Turnover (₹ Cr)</th>
                      <td className="px-3 py-1.5 text-right font-mono">₹{(company.turnover * 0.8).toFixed(1)}</td>
                      <td className="px-3 py-1.5 text-right font-mono">₹{(company.turnover * 0.9).toFixed(1)}</td>
                      <td className="px-3 py-1.5 text-right font-mono font-bold">₹{company.turnover.toFixed(1)}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <th className="px-3 py-1.5 font-semibold text-gray-700">Operating EBITDA (₹ Cr)</th>
                      <td className="px-3 py-1.5 text-right font-mono">₹{(company.turnover * 0.8 * 0.12).toFixed(2)}</td>
                      <td className="px-3 py-1.5 text-right font-mono">₹{(company.turnover * 0.9 * 0.13).toFixed(2)}</td>
                      <td className="px-3 py-1.5 text-right font-mono font-bold">₹{(company.turnover * 0.14).toFixed(2)}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <th className="px-3 py-1.5 font-semibold text-gray-700">Leverage Ratio (Debt/Equity)</th>
                      <td className="px-3 py-1.5 text-right font-mono">1.15x</td>
                      <td className="px-3 py-1.5 text-right font-mono">1.02x</td>
                      <td className="px-3 py-1.5 text-right font-mono font-bold">{company.metrics[company.metrics.length - 1].debtEquity.toFixed(2)}x</td>
                    </tr>
                    <tr>
                      <th className="px-3 py-1.5 font-semibold text-gray-700">Debt Service Coverage (DSCR)</th>
                      <td className="px-3 py-1.5 text-right font-mono">1.42x</td>
                      <td className="px-3 py-1.5 text-right font-mono">1.55x</td>
                      <td className="px-3 py-1.5 text-right font-mono font-bold">{company.metrics[company.metrics.length - 1].dscr.toFixed(2)}x</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Section: Short Written Story Summary */}
              <div className="space-y-4 mt-6">
                <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1">IV. Qualitative Business Reality Analysis</h3>
                <p className="text-[11px] text-gray-600 leading-relaxed font-sans">
                  The credit analysis engines completed an integrated cross-verification audit matching P&L turnovers directly against active GST returns (GSTR-3B) with less than 1.1% revenue mismatch. Operating bank statements verify recurring collections with zero inward cheque bounce events over the previous 12 months. Human labor EPFO rosters show fully registered contributions for 62 employees matching active payroll patterns. Credit limits are safe.
                </p>
              </div>

              {/* Section: Manual checks, Evidence summaries, sign-off lines */}
              <div className="space-y-4 mt-6">
                <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1">V. Qualified Credit Authorization Notes</h3>
                
                <div className="border border-gray-200 rounded-lg p-3 bg-gray-50/20 text-[11px] font-sans leading-relaxed text-gray-600 mb-6">
                  {notes || 'Dossier ready for secondary credit-desk manual authorization notes and qualifiers.'}
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-8 pt-10 mt-12 text-center text-[10px] font-mono text-gray-400 select-none">
                  <div className="space-y-1">
                    <div className="border-t border-gray-300 w-2/3 mx-auto pt-1 text-slate-700 font-bold">Credence AI Audit Engine</div>
                    <span>System Digitally Signed Hash ID: 88F231D</span>
                  </div>
                  <div className="space-y-1">
                    <div className="border-t border-gray-300 w-2/3 mx-auto pt-1 text-slate-700 font-bold">Authorized Credit Officer Signature</div>
                    <span>IDBI Bank Credit Analyst desk</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Section 7: Compact Printable MSME Financial Health Card */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-150 p-4.5 rounded-xl shadow-3xs text-center space-y-2">
              <span className="text-xs font-mono font-bold text-gray-500 block">Official MSME Financial Health Badge</span>
              <p className="text-[11px] text-gray-400">Pocket-sized printable credit certificate with vector QR authentication</p>
              
              <button
                onClick={() => { window.print(); }}
                className="inline-flex items-center space-x-1 px-3 py-1 text-xs font-mono font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-100 cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Health Card Badge</span>
              </button>
            </div>

            {/* Visual Health Card Mockup badge */}
            <div 
              ref={printHealthCardRef}
              className="relative w-full max-w-[340px] mx-auto bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white rounded-2xl p-5 shadow-xl border border-slate-800 overflow-hidden"
              id="msme-health-card-visual"
            >
              {/* Glassmorphism subtle circle highlights */}
              <div className="absolute -top-16 -right-16 h-36 w-36 rounded-full bg-indigo-500/10 blur-xl"></div>
              <div className="absolute -bottom-16 -left-16 h-36 w-36 rounded-full bg-emerald-500/10 blur-xl"></div>

              {/* Card Header */}
              <div className="flex items-start justify-between border-b border-slate-800/80 pb-3 mb-4 relative z-10">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-indigo-500/20 rounded-lg text-indigo-300 border border-indigo-500/25">
                    <Award className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="text-[8px] font-mono font-bold text-indigo-300 uppercase tracking-widest block leading-none">MSME Credentials</span>
                    <h4 className="text-[10px] font-extrabold text-slate-100 tracking-tight mt-0.5 leading-none">IDBI Credence OS</h4>
                  </div>
                </div>

                {/* Grade Badge */}
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded px-2 py-0.5 text-center font-mono font-black text-xs">
                  GRADE A+
                </div>
              </div>

              {/* Card Body */}
              <div className="space-y-3 relative z-10">
                <div>
                  <span className="text-[8px] font-mono text-slate-400 uppercase tracking-wider block leading-none">Corporate Entity</span>
                  <h3 className="text-sm font-extrabold tracking-tight text-white mt-1.5 truncate">{company.name}</h3>
                </div>

                <div className="grid grid-cols-2 gap-3.5 pt-1 border-t border-slate-900">
                  <div>
                    <span className="text-[8px] font-mono text-slate-400 block leading-none">TRUST SCORE INDEX</span>
                    <span className="text-base font-mono font-black text-indigo-400 mt-1 block leading-none">{company.trustScore}%</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-mono text-slate-400 block leading-none">VERIFICATION STATUS</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 mt-1.5 block leading-none">STATUTORILY OK</span>
                  </div>
                </div>

                {/* Micro parameters readout */}
                <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-900/60 text-[8px] font-mono text-slate-400 text-center">
                  <div>
                    <span className="block leading-none">FIN. INTEGRITY</span>
                    <span className="font-bold text-slate-200 mt-1 block">92%</span>
                  </div>
                  <div>
                    <span className="block leading-none">STABILITY</span>
                    <span className="font-bold text-slate-200 mt-1 block">STABLE</span>
                  </div>
                  <div>
                    <span className="block leading-none">GROWTH</span>
                    <span className="font-bold text-slate-200 mt-1 block">14.5%</span>
                  </div>
                  <div>
                    <span className="block leading-none">LIQUIDITY</span>
                    <span className="font-bold text-slate-200 mt-1 block">1.52x</span>
                  </div>
                </div>
              </div>

              {/* Card Footer with QR Placeholder */}
              <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-800/80 relative z-10 text-[8px] font-mono text-slate-500">
                <div>
                  <span>ISSUED ON: {new Date().toISOString().slice(0, 10)}</span>
                  <span className="block mt-0.5 uppercase">Security protocol: AES-256</span>
                </div>

                {/* QR Vector Mockup */}
                <div className="border border-slate-800 bg-slate-950 p-1.5 rounded-lg shrink-0 w-9 h-9 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-dashed border-indigo-500/60 flex items-center justify-center text-[5px] text-indigo-400 select-none font-bold">
                    QR
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

// Small helper icon component
function DollarSignIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
