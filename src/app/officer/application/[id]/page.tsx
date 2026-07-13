'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, AlertCircle, Download, Printer, Share2,
  FileText, CheckCircle2, AlertTriangle, XCircle,
  ChevronDown, ChevronUp, Loader2, Sparkles,
} from 'lucide-react';
import { useOfficerStore } from '@/stores/useOfficerStore';
import { useExplainScore, useUpdateLoan, useGetLoanDetails } from '@/lib/useApi';
import RadarChart from '@/components/RadarChart';
import ExplainabilityPanel from '@/components/ExplainabilityPanel';
import type { VerificationStatus } from '@/types';
import type { ScoreExplainFeature } from '@/lib/api';

const TABS = ['Overview', 'Radar Analysis', 'SHAP Explainability', 'Audit Logs', 'Documents', 'Decision'];

function StatusBadge({ status }: { status: VerificationStatus }) {
  const m: Record<VerificationStatus, { cls: string }> = {
    Verified: { cls: 'bg-fin-success/10 text-fin-success border-fin-success/30' },
    'Under Review': { cls: 'bg-fin-warning/10 text-fin-warning border-fin-warning/30' },
    'Contradictions Detected': { cls: 'bg-fin-error/10 text-fin-error border-fin-error/30' },
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${m[status]?.cls}`}>{status}</span>;
}

export default function ApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { companies, approveCompany, rejectCompany, referCompany, updateCompany } = useOfficerStore();
  const company = companies.find(c => c.id === id);

  const [activeTab, setActiveTab] = useState('Overview');
  const [notes, setNotes] = useState(company?.reviewerNotes ?? '');
  const [decision, setDecision] = useState<string>(company?.decision ?? 'PENDING');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // API hooks
  const { execute: fetchExplain, loading: shapLoading, data: shapData, error: shapError } = useExplainScore();
  const { execute: updateLoan, loading: updateLoading } = useUpdateLoan();
  const { execute: fetchDetails, data: loanDetails } = useGetLoanDetails();

  // Fetch loan details + SHAP when opening the SHAP tab
  useEffect(() => {
    if (activeTab === 'SHAP Explainability' && id && !shapData) {
      // Try fetching by loan/profile ID — backend accepts either
      fetchExplain(id);
    }
  }, [activeTab, id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch full loan details on mount (for audit logs from API)
  useEffect(() => {
    if (id) fetchDetails(id);
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  if (!company) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <AlertCircle className="h-12 w-12 mx-auto text-fin-error mb-4" />
        <h2 className="text-xl font-bold text-fin-text">Application not found</h2>
        <button onClick={() => router.push('/officer/dashboard')} className="mt-4 text-fin-primary text-sm font-mono underline">Back to dashboard</button>
      </div>
    );
  }

  const latestMetric = company.metrics[company.metrics.length - 1];

  const radarDims = [
    { key: 'liquidity', label: 'Liquidity', val: Math.min(100, Math.round(latestMetric.currentRatio * 55)), desc: `Current ratio: ${latestMetric.currentRatio}x` },
    { key: 'profitability', label: 'Profitability', val: Math.min(100, Math.round((latestMetric.ebitda / latestMetric.turnover) * 600)), desc: `EBITDA margin: ${((latestMetric.ebitda / latestMetric.turnover) * 100).toFixed(1)}%` },
    { key: 'growth', label: 'Growth', val: company.trustScore >= 85 ? 90 : company.trustScore >= 65 ? 72 : 45, desc: 'YoY compound turnover expansion' },
    { key: 'stability', label: 'Stability', val: company.trustScore >= 85 ? 88 : company.trustScore >= 65 ? 70 : 40, desc: 'EPFO payroll & workforce stability' },
    { key: 'governance', label: 'Governance', val: company.trustScore >= 85 ? 95 : company.trustScore >= 65 ? 78 : 42, desc: 'MCA filings, no litigation' },
    { key: 'verification', label: 'Verification', val: company.trustScore >= 85 ? 98 : company.trustScore >= 65 ? 80 : 35, desc: 'Cross-registry match accuracy' },
  ];

  // Build SHAP entries: prefer real API data, fall back to computed mock
  const shapEntries: { label: string; contribution: number }[] = shapData?.features
    ? shapData.features.map((f: ScoreExplainFeature) => ({
        label: f.name,
        contribution: Math.round(f.contribution),
      }))
    : [
        { label: 'GST Compliance', contribution: Math.round((company.trustScore - 70) * 2.8) },
        { label: 'UPI Transactions', contribution: Math.round((company.trustScore - 70) * 2.2) },
        { label: 'AA Banking', contribution: Math.round((company.trustScore - 70) * 2.5) },
        { label: 'EPFO Stability', contribution: Math.round((company.trustScore - 70) * 1.8) },
        { label: 'Revenue Growth', contribution: Math.round((company.trustScore - 70) * 2.0) },
      ];

  const shapExplanation = shapData?.risk_report ?? company.aiSummary ??
    `${company.name} presents a ${company.trustScore >= 85 ? 'strong' : company.trustScore >= 65 ? 'moderate' : 'weak'} credit profile.`;

  // Audit logs: prefer API data, fall back to store
  const auditLogs = (loanDetails?.audits?.length ? loanDetails.audits : company.auditLogs) as typeof company.auditLogs;

  // ── Decision handler (API + local store) ──────────────────────────────────
  const handleSaveDecision = async () => {
    setSaving(true);
    try {
      // Call real API first
      const statusMap: Record<string, 'APPROVED' | 'REJECTED' | 'PENDING'> = {
        APPROVED: 'APPROVED',
        REJECTED: 'REJECTED',
        REFERRED: 'PENDING', // backend maps REFERRED as PENDING with note
      };
      await updateLoan(id, {
        status: statusMap[decision] ?? 'PENDING',
        decided_by: 'officer',
      });
    } catch {
      // API offline — proceed with local-only save
    }

    // Always update local store regardless of API outcome
    if (decision === 'APPROVED') approveCompany(company.id, notes);
    else if (decision === 'REJECTED') rejectCompany(company.id, notes);
    else if (decision === 'REFERRED') referCompany(company.id, notes);

    setSaving(false);
    setSaved(true);
    showToast('Decision saved to corporate dossier.');
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDownload = () => {
    const data = JSON.stringify(company, null, 2);
    const a = document.createElement('a');
    a.href = 'data:text/json,' + encodeURIComponent(data);
    a.download = `diligence_${company.name.replace(/\s+/g, '_')}.json`;
    a.click();
    showToast('JSON dossier exported.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-fin-text text-white text-xs font-mono font-semibold px-4 py-3 rounded-xl flex items-center gap-2 shadow-xl animate-bounce">
          <Sparkles className="h-4 w-4 text-fin-primary" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/officer/dashboard')} id="btn-back" className="p-1.5 rounded-lg border border-gray-200/50 hover:bg-fin-surface-2 text-fin-text-muted transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-fin-text">{company.name}</h1>
              <StatusBadge status={company.status} />
            </div>
            <p className="text-[10px] font-mono text-fin-text-muted mt-0.5">CIN: {company.cin} · GSTIN: {company.gstin} · PAN: {company.pan}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold text-fin-text bg-fin-surface border border-gray-200/50 rounded-lg hover:bg-fin-surface-2 transition-all">
            <Printer className="h-3.5 w-3.5" />Print
          </button>
          <button onClick={handleDownload} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold text-fin-text bg-fin-surface border border-gray-200/50 rounded-lg hover:bg-fin-surface-2 transition-all">
            <Download className="h-3.5 w-3.5" />Export JSON
          </button>
          <button onClick={() => { navigator.clipboard.writeText(`${company.name} | Trust: ${company.trustScore}% | Decision: ${company.decision}`); showToast('Copied to clipboard'); }} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold text-white rounded-lg hover:brightness-110 transition-all" style={{ backgroundColor: 'var(--primary)' }}>
            <Share2 className="h-3.5 w-3.5" />Share
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200/40 flex items-center gap-6 mb-6 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab}
            id={`tab-${tab.replace(/\s+/g, '-').toLowerCase()}`}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-[11px] font-mono font-bold uppercase tracking-wide whitespace-nowrap transition-all border-b-2 ${activeTab === tab ? 'text-fin-primary border-fin-primary' : 'text-fin-text-muted border-transparent hover:text-fin-text'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB: Overview */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Trust Score', value: `${company.trustScore}%`, sub: company.trustScore >= 85 ? 'LOW RISK' : company.trustScore >= 65 ? 'MED RISK' : 'HIGH RISK' },
              { label: 'Turnover', value: `₹${company.turnover} Cr`, sub: `FY${latestMetric.year}` },
              { label: 'EBITDA', value: `₹${latestMetric.ebitda.toFixed(2)} Cr`, sub: `${((latestMetric.ebitda / latestMetric.turnover) * 100).toFixed(1)}% margin` },
              { label: 'PAT', value: `₹${latestMetric.pat.toFixed(2)} Cr`, sub: 'After tax profit' },
              { label: 'DSCR', value: `${latestMetric.dscr.toFixed(2)}x`, sub: latestMetric.dscr >= 1.5 ? '✓ Strong coverage' : '⚠ Moderate' },
              { label: 'Current Ratio', value: `${latestMetric.currentRatio.toFixed(2)}x`, sub: latestMetric.currentRatio >= 1.33 ? '✓ Healthy' : '⚠ Below threshold' },
              { label: 'D/E Ratio', value: `${latestMetric.debtEquity.toFixed(2)}x`, sub: 'Leverage metric' },
              { label: 'Loan Ask', value: `₹${company.loanAmount} Cr`, sub: company.purpose.slice(0, 30) },
              { label: 'Industry', value: company.industry, sub: company.existingBank || '—' },
            ].map(card => (
              <div key={card.label} className="bg-fin-surface border border-gray-200/40 rounded-xl p-3">
                <div className="text-[9px] font-mono font-bold text-fin-text-muted uppercase">{card.label}</div>
                <div className="text-lg font-black font-mono text-fin-text mt-1">{card.value}</div>
                <div className="text-[9px] text-fin-text-muted mt-0.5">{card.sub}</div>
              </div>
            ))}
          </div>
          <div className="bg-fin-surface border border-gray-200/40 rounded-2xl p-4">
            <h3 className="text-xs font-bold text-fin-text mb-4">Financial Trajectory</h3>
            <div className="space-y-3">
              {['turnover', 'ebitda', 'pat'].map(key => (
                <div key={key}>
                  <div className="flex justify-between text-[9px] font-mono text-fin-text-muted mb-1">
                    <span className="uppercase font-bold">{key}</span>
                    <span>₹{(latestMetric as any)[key].toFixed(2)} Cr</span>
                  </div>
                  <div className="flex gap-1 items-end h-8">
                    {company.metrics.map((m, i) => {
                      const vals = company.metrics.map(x => (x as any)[key]);
                      const max = Math.max(...vals);
                      const pct = ((m as any)[key] / max) * 100;
                      return (
                        <div key={m.year} className="flex-1 flex flex-col items-center gap-0.5">
                          <div className="w-full rounded-sm transition-all" style={{ height: `${pct}%`, backgroundColor: 'var(--primary)', opacity: 0.6 + i * 0.2 }} />
                          <span className="text-[8px] font-mono text-fin-text-muted">{m.year}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: Radar Analysis */}
      {activeTab === 'Radar Analysis' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-fin-surface border border-gray-200/40 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-fin-text mb-4">AI Risk Radar Alignment</h3>
            <RadarChart dimensions={radarDims} isFlagged={company.status === 'Contradictions Detected'} />
          </div>
          <div className="bg-fin-surface border border-gray-200/40 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-fin-text mb-4">Dimension Scores</h3>
            {radarDims.map(d => (
              <div key={d.key}>
                <div className="flex justify-between text-[11px] font-mono mb-1">
                  <span className="font-bold text-fin-text">{d.label}</span>
                  <span className="text-fin-text-muted">{d.val}%</span>
                </div>
                <div className="h-2 bg-fin-surface-2 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${d.val}%`, backgroundColor: d.val >= 80 ? 'var(--success)' : d.val >= 60 ? 'var(--warning)' : 'var(--error)' }} />
                </div>
                <p className="text-[10px] text-fin-text-muted mt-0.5">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: SHAP Explainability — real API with loading state */}
      {activeTab === 'SHAP Explainability' && (
        <div className="max-w-2xl">
          {shapLoading && (
            <div className="flex items-center gap-3 text-fin-text-muted text-sm font-mono mb-4 animate-pulse">
              <Loader2 className="h-4 w-4 animate-spin" />
              Fetching SHAP explanations from LangGraph…
            </div>
          )}
          {shapError && !shapLoading && (
            <div className="flex items-center gap-2 mb-4 text-fin-warning text-[11px] font-mono bg-fin-warning/10 border border-fin-warning/20 rounded-xl px-4 py-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Backend unavailable — showing locally computed contributions.
            </div>
          )}
          {shapData && (
            <div className="mb-3 flex flex-wrap gap-2">
              {shapData.strengths?.map((s: string, i: number) => (
                <span key={i} className="text-[10px] font-mono px-2 py-1 rounded-full bg-fin-success/10 text-fin-success border border-fin-success/20">✓ {s}</span>
              ))}
              {shapData.weaknesses?.map((w: string, i: number) => (
                <span key={i} className="text-[10px] font-mono px-2 py-1 rounded-full bg-fin-error/10 text-fin-error border border-fin-error/20">⚠ {w}</span>
              ))}
            </div>
          )}
          <ExplainabilityPanel
            overallScore={300 + Math.round(company.trustScore * 6)}
            baseline={600}
            entries={shapEntries}
            explanation={shapExplanation}
          />
          {shapData?.recommendations && shapData.recommendations.length > 0 && (
            <div className="mt-4 bg-fin-surface border border-gray-200/40 rounded-xl p-4">
              <h4 className="text-[11px] font-mono font-bold text-fin-text-muted uppercase mb-2">AI Recommendations</h4>
              <ul className="space-y-1">
                {shapData.recommendations.map((r: string, i: number) => (
                  <li key={i} className="text-[11px] text-fin-text font-mono flex gap-2">
                    <span className="text-fin-primary shrink-0">→</span>{r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* TAB: Audit Logs */}
      {activeTab === 'Audit Logs' && (
        <div className="space-y-3">
          {auditLogs.length === 0 && (
            <div className="py-10 text-center text-fin-text-muted text-sm font-mono">No audit logs available.</div>
          )}
          {auditLogs.map(log => {
            const isExpanded = expandedLog === log.id;
            const Icon = log.type === 'success' ? CheckCircle2 : log.type === 'warning' ? AlertTriangle : AlertCircle;
            const color = log.type === 'success' ? 'var(--success)' : log.type === 'warning' ? 'var(--warning)' : 'var(--error)';
            return (
              <div key={log.id} className="bg-fin-surface border border-gray-200/40 rounded-xl overflow-hidden">
                <button
                  id={`log-${log.id}`}
                  onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-fin-surface-2 transition-colors text-left"
                >
                  <Icon className="h-4 w-4 shrink-0" style={{ color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-fin-text">{log.message}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ backgroundColor: `${color}18`, color }}>{log.category}</span>
                    </div>
                    <div className="text-[10px] font-mono text-fin-text-muted mt-0.5">{log.source}</div>
                  </div>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-fin-text-muted shrink-0" /> : <ChevronDown className="h-4 w-4 text-fin-text-muted shrink-0" />}
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-200/30 bg-fin-surface-2">
                    <p className="text-[11px] text-fin-text-muted leading-relaxed pt-3">{log.evidence}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB: Documents */}
      {activeTab === 'Documents' && (
        <div className="space-y-2">
          {company.documents.length === 0 && (
            <div className="py-10 text-center text-fin-text-muted text-sm font-mono">No documents attached.</div>
          )}
          {company.documents.map((doc, i) => {
            const statusColor: Record<string, string> = { Verified: 'text-fin-success', Extracted: 'text-fin-primary', Warning: 'text-fin-warning', Pending: 'text-fin-text-muted', Uploading: 'text-fin-text-muted' };
            return (
              <div key={i} className="flex items-center gap-3 bg-fin-surface border border-gray-200/40 rounded-xl px-4 py-3">
                <FileText className="h-4 w-4 text-fin-text-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-fin-text truncate">{doc.name}</div>
                  <div className="text-[10px] font-mono text-fin-text-muted">{doc.fileName ?? 'No file'} {doc.fileSize ? `· ${doc.fileSize}` : ''}</div>
                </div>
                <span className={`text-[10px] font-mono font-bold ${statusColor[doc.status] ?? 'text-fin-text-muted'}`}>{doc.status}</span>
                <span className="text-[9px] font-mono text-fin-text-muted">{doc.lastChecked}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB: Decision — wired to real API */}
      {activeTab === 'Decision' && (
        <div className="max-w-xl space-y-5">
          <h3 className="text-sm font-bold text-fin-text">Record Lending Decision</h3>

          <div className="grid grid-cols-3 gap-2">
            {(['APPROVED', 'REFERRED', 'REJECTED'] as const).map(d => (
              <button
                key={d}
                id={`decision-${d.toLowerCase()}`}
                onClick={() => setDecision(d)}
                className={`py-3 rounded-xl text-xs font-bold border-2 transition-all ${
                  decision === d
                    ? d === 'APPROVED' ? 'border-fin-success bg-fin-success/10 text-fin-success'
                      : d === 'REJECTED' ? 'border-fin-error bg-fin-error/10 text-fin-error'
                      : 'border-fin-warning bg-fin-warning/10 text-fin-warning'
                    : 'border-gray-200/50 text-fin-text-muted hover:border-gray-300'
                }`}
              >
                {d === 'APPROVED' ? '✓ APPROVE' : d === 'REJECTED' ? '✗ REJECT' : '→ REFER'}
              </button>
            ))}
          </div>

          <div>
            <label className="text-[11px] font-mono font-bold text-fin-text-muted uppercase block mb-1">Reviewer Notes</label>
            <textarea
              id="field-notes"
              rows={5}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add your underwriting notes, conditions, or escalation rationale…"
              className="w-full bg-fin-surface-2 border border-gray-200/50 rounded-lg px-3 py-2 text-sm text-fin-text font-mono resize-none focus:outline-none focus:ring-1 focus:ring-fin-primary"
            />
          </div>

          <button
            id="btn-save-decision"
            onClick={handleSaveDecision}
            disabled={saving || updateLoading || decision === 'PENDING'}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl disabled:opacity-50 hover:brightness-110 transition-all"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {(saving || updateLoading) ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle2 className="h-4 w-4" /> : null}
            {(saving || updateLoading) ? 'Saving…' : saved ? 'Saved!' : 'Save Decision'}
          </button>
        </div>
      )}
    </div>
  );
}
