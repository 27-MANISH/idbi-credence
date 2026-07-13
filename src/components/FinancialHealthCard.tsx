'use client';

import React from 'react';
import { ShieldCheck, TrendingUp, AlertTriangle, AlertCircle, Award } from 'lucide-react';

interface FinancialHealthCardProps {
  companyName: string;
  gstin: string;
  pan?: string;
  trustScore: number; // 0-100 mapped to 300-900 CRS
  grade?: string;
  status: string;
  turnover: number;
  loanAmount: number;
  industry: string;
  decision?: string;
  dimensionScores?: {
    gst?: number;
    upi?: number;
    banking?: number;
    epfo?: number;
    growth?: number;
  };
  compact?: boolean;
}

function mapScoreToCRS(score: number): number {
  // Maps 0-100 trust score to 300-900 CRS range
  return Math.round(300 + (score / 100) * 600);
}

function getGrade(score: number): string {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B+';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C';
  return 'D';
}

function getScoreColor(score: number) {
  if (score >= 85) return { bg: 'bg-fin-success/10', text: 'text-fin-success', border: 'border-fin-success/30' };
  if (score >= 65) return { bg: 'bg-fin-warning/10', text: 'text-fin-warning', border: 'border-fin-warning/30' };
  return { bg: 'bg-fin-error/10', text: 'text-fin-error', border: 'border-fin-error/30' };
}

function getRiskBand(score: number): string {
  if (score >= 85) return 'LOW RISK';
  if (score >= 70) return 'MEDIUM-LOW RISK';
  if (score >= 55) return 'MEDIUM RISK';
  if (score >= 40) return 'MEDIUM-HIGH RISK';
  return 'HIGH RISK';
}

export default function FinancialHealthCard({
  companyName,
  gstin,
  pan,
  trustScore,
  status,
  turnover,
  loanAmount,
  industry,
  decision,
  dimensionScores,
  compact = false,
}: FinancialHealthCardProps) {
  const crs = mapScoreToCRS(trustScore);
  const grade = getGrade(trustScore);
  const { bg, text, border } = getScoreColor(trustScore);
  const riskBand = getRiskBand(trustScore);

  const dims = [
    { label: 'GST Compliance', key: 'gst', val: dimensionScores?.gst ?? 0 },
    { label: 'UPI Transaction', key: 'upi', val: dimensionScores?.upi ?? 0 },
    { label: 'AA Banking', key: 'banking', val: dimensionScores?.banking ?? 0 },
    { label: 'EPFO Stability', key: 'epfo', val: dimensionScores?.epfo ?? 0 },
    { label: 'Growth Index', key: 'growth', val: dimensionScores?.growth ?? 0 },
  ].filter(d => d.val > 0);

  const StatusIcon =
    status === 'Verified'
      ? ShieldCheck
      : status === 'Under Review'
      ? AlertTriangle
      : AlertCircle;

  const statusColor =
    status === 'Verified'
      ? 'text-fin-success'
      : status === 'Under Review'
      ? 'text-fin-warning'
      : 'text-fin-error';

  const decisionBadge: Record<string, string> = {
    APPROVED: 'bg-fin-success/10 text-fin-success border-fin-success/30',
    REJECTED: 'bg-fin-error/10 text-fin-error border-fin-error/30',
    REFERRED: 'bg-fin-warning/10 text-fin-warning border-fin-warning/30',
    PENDING: 'bg-fin-primary/10 text-fin-primary border-fin-primary/30',
  };

  return (
    <div
      className={`bg-fin-surface border ${border} rounded-2xl overflow-hidden shadow-sm ${
        compact ? 'p-4' : 'p-5'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-fin-text text-sm truncate">{companyName}</h3>
          <p className="text-[10px] font-mono text-fin-text-muted mt-0.5 truncate">
            GSTIN: {gstin}
          </p>
          <span className="text-[9px] font-mono bg-fin-surface-2 text-fin-text-muted px-1.5 py-0.5 rounded border border-gray-200/30 mt-1 inline-block">
            {industry}
          </span>
        </div>

        {/* Score badge */}
        <div className={`flex-shrink-0 ${bg} border ${border} rounded-xl px-3 py-2 text-center min-w-[72px]`}>
          <div className={`text-2xl font-black font-mono ${text}`}>{grade}</div>
          <div className={`text-[9px] font-mono font-bold ${text} mt-0.5`}>{crs}</div>
          <div className="text-[8px] font-mono text-fin-text-muted">CRS SCORE</div>
        </div>
      </div>

      {/* Risk band */}
      <div className={`text-[9px] font-mono font-bold ${text} uppercase tracking-wider mb-3 flex items-center gap-1`}>
        <Award className="h-3 w-3" />
        {riskBand}
      </div>

      {/* Trust score bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] font-mono text-fin-text-muted">Trust Score</span>
          <span className={`text-[10px] font-mono font-bold ${text}`}>{trustScore}%</span>
        </div>
        <div className="w-full h-1.5 bg-fin-surface-2 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500`}
            style={{
              width: `${trustScore}%`,
              backgroundColor: trustScore >= 85 ? 'var(--success)' : trustScore >= 65 ? 'var(--warning)' : 'var(--error)',
            }}
          />
        </div>
      </div>

      {/* Dimension scores (only if data available) */}
      {dims.length > 0 && !compact && (
        <div className="space-y-1.5 mb-4">
          {dims.map(d => (
            <div key={d.key} className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-fin-text-muted w-24 shrink-0">{d.label}</span>
              <div className="flex-1 h-1 bg-fin-surface-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${d.val}%`,
                    backgroundColor: d.val >= 80 ? 'var(--success)' : d.val >= 60 ? 'var(--warning)' : 'var(--error)',
                  }}
                />
              </div>
              <span className="text-[9px] font-mono text-fin-text-muted w-7 text-right shrink-0">{d.val}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Key financials */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-fin-surface-2 rounded-lg px-2.5 py-2">
          <div className="text-[9px] font-mono text-fin-text-muted">Turnover</div>
          <div className="text-sm font-black font-mono text-fin-text">₹{turnover} Cr</div>
        </div>
        <div className="bg-fin-surface-2 rounded-lg px-2.5 py-2">
          <div className="text-[9px] font-mono text-fin-text-muted">Loan Ask</div>
          <div className="text-sm font-black font-mono text-fin-text">₹{loanAmount} Cr</div>
        </div>
      </div>

      {/* Status row */}
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-1 ${statusColor}`}>
          <StatusIcon className="h-3.5 w-3.5" />
          <span className="text-[10px] font-mono font-semibold">{status}</span>
        </div>

        {decision && (
          <span className={`text-[9px] font-mono font-bold uppercase border rounded px-1.5 py-0.5 ${decisionBadge[decision] ?? decisionBadge.PENDING}`}>
            {decision}
          </span>
        )}
      </div>
    </div>
  );
}
