'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Filter, ShieldCheck, AlertTriangle, AlertCircle,
  Building2, TrendingUp, ChevronRight, BarChart3, Users, Coins,
  FileCheck2, RefreshCw, ArrowUpDown, Plus, Activity,
} from 'lucide-react';
import { useOfficerStore } from '@/stores/useOfficerStore';
import type { Company, VerificationStatus } from '@/types';
import Link from 'next/link';

function StatusBadge({ status }: { status: VerificationStatus }) {
  const map: Record<VerificationStatus, { cls: string; Icon: any; label: string }> = {
    Verified: { cls: 'bg-fin-success/10 text-fin-success border-fin-success/30', Icon: ShieldCheck, label: 'Verified' },
    'Under Review': { cls: 'bg-fin-warning/10 text-fin-warning border-fin-warning/30', Icon: AlertTriangle, label: 'Under Review' },
    'Contradictions Detected': { cls: 'bg-fin-error/10 text-fin-error border-fin-error/30', Icon: AlertCircle, label: 'Contradictions' },
  };
  const { cls, Icon, label } = map[status] ?? map['Under Review'];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${cls}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

function DecisionBadge({ decision }: { decision?: string }) {
  if (!decision) return null;
  const map: Record<string, string> = {
    APPROVED: 'bg-fin-success/10 text-fin-success border-fin-success/30',
    REJECTED: 'bg-fin-error/10 text-fin-error border-fin-error/30',
    REFERRED: 'bg-fin-warning/10 text-fin-warning border-fin-warning/30',
    PENDING: 'bg-fin-primary/10 text-fin-primary border-fin-primary/30',
  };
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border ${map[decision] ?? map.PENDING}`}>
      {decision}
    </span>
  );
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 85 ? 'var(--success)' : score >= 65 ? 'var(--warning)' : 'var(--error)';
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-10 h-10">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(148,163,184,0.2)" strokeWidth="3" />
          <circle cx="18" cy="18" r="15" fill="none" stroke={color} strokeWidth="3" strokeDasharray={`${(score / 100) * 94.25} 94.25`} strokeLinecap="round" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black font-mono" style={{ color }}>{score}</span>
      </div>
      <span className="text-[8px] font-mono text-fin-text-muted mt-0.5">Trust</span>
    </div>
  );
}

const ANALYTICS = [
  { label: 'Total Applications', getValue: (c: Company[]) => c.length, icon: Building2, sub: 'All time' },
  { label: 'Pending Review', getValue: (c: Company[]) => c.filter(x => x.decision === 'PENDING').length, icon: RefreshCw, sub: 'Awaiting action' },
  { label: 'Approved', getValue: (c: Company[]) => c.filter(x => x.decision === 'APPROVED').length, icon: ShieldCheck, sub: 'This cycle' },
  { label: 'Avg Trust Score', getValue: (c: Company[]) => (c.reduce((a, b) => a + b.trustScore, 0) / c.length).toFixed(1), icon: BarChart3, sub: 'Platform avg' },
  { label: 'Total Capital', getValue: (c: Company[]) => `₹${c.reduce((a, b) => a + b.loanAmount, 0).toFixed(0)} Cr`, icon: Coins, sub: 'Under assessment' },
  { label: 'Contradictions', getValue: (c: Company[]) => c.filter(x => x.status === 'Contradictions Detected').length, icon: AlertTriangle, sub: 'Require attention' },
];

export default function OfficerDashboardPage() {
  const router = useRouter();
  const { companies, filters, setFilters, setSelectedCompanyId } = useOfficerStore();

  const industries = Array.from(new Set(companies.map(c => c.industry)));

  const filtered = companies.filter(c => {
    const s = filters.search.toLowerCase();
    const matchSearch = !s || c.name.toLowerCase().includes(s) || c.gstin.toLowerCase().includes(s) || c.industry.toLowerCase().includes(s);
    const matchStatus = filters.status === 'ALL' || c.status === filters.status;
    const matchIndustry = filters.industry === 'ALL' || c.industry === filters.industry;
    return matchSearch && matchStatus && matchIndustry;
  });

  const sorted = [...filtered].sort((a, b) => b.trustScore - a.trustScore);

  const getInitials = (name: string) => name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  const industryColor = (ind: string) => {
    const map: Record<string, string> = { Textiles: 'bg-rose-50 text-rose-700', Logistics: 'bg-blue-50 text-blue-700', Healthcare: 'bg-teal-50 text-teal-700', Engineering: 'bg-orange-50 text-orange-700', Technology: 'bg-indigo-50 text-indigo-700', Agriculture: 'bg-emerald-50 text-emerald-700' };
    return map[ind] ?? 'bg-slate-50 text-slate-700';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-fin-text">Credit Officer Console</h1>
          <p className="text-[12px] text-fin-text-muted mt-0.5">AI-ranked underwriting queue · IDBI Bank Credit Desk</p>
        </div>
        <Link
          href="/msme/onboarding"
          id="btn-new-application"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white rounded-xl hover:brightness-110 transition-all"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <Plus className="h-4 w-4" />
          New Application
        </Link>
      </div>

      {/* Analytics bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {ANALYTICS.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-fin-surface border border-gray-200/40 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-mono font-bold text-fin-text-muted uppercase truncate">{card.label}</span>
                <Icon className="h-3.5 w-3.5 text-fin-text-muted shrink-0" />
              </div>
              <div className="text-xl font-black font-mono text-fin-text">{card.getValue(companies)}</div>
              <div className="text-[9px] text-fin-text-muted mt-0.5">{card.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-fin-surface border border-gray-200/40 rounded-xl p-3 mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-fin-text-muted" />
          <input
            id="filter-search"
            value={filters.search}
            onChange={e => setFilters({ search: e.target.value })}
            placeholder="Search company, GSTIN…"
            className="w-full bg-fin-surface-2 border border-gray-200/40 rounded-lg pl-8 pr-3 py-2 text-xs text-fin-text font-mono placeholder:text-fin-text-muted/50 focus:outline-none focus:ring-1 focus:ring-fin-primary"
          />
        </div>
        <select
          id="filter-status"
          value={filters.status}
          onChange={e => setFilters({ status: e.target.value })}
          className="bg-fin-surface-2 border border-gray-200/40 rounded-lg px-3 py-2 text-xs text-fin-text font-mono focus:outline-none focus:ring-1 focus:ring-fin-primary"
        >
          <option value="ALL">All Statuses</option>
          <option value="Under Review">Under Review</option>
          <option value="Verified">Verified</option>
          <option value="Contradictions Detected">Contradictions</option>
        </select>
        <select
          id="filter-industry"
          value={filters.industry}
          onChange={e => setFilters({ industry: e.target.value })}
          className="bg-fin-surface-2 border border-gray-200/40 rounded-lg px-3 py-2 text-xs text-fin-text font-mono focus:outline-none focus:ring-1 focus:ring-fin-primary"
        >
          <option value="ALL">All Industries</option>
          {industries.map(i => <option key={i} value={i}>{i}</option>)}
        </select>
        <span className="text-[10px] font-mono text-fin-text-muted ml-auto">{sorted.length} of {companies.length} shown</span>
      </div>

      {/* Company queue table */}
      <div className="bg-fin-surface border border-gray-200/40 rounded-2xl overflow-hidden shadow-sm">
        <div className="hidden lg:grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-4 px-5 py-3 border-b border-gray-200/30 text-[9px] font-mono font-bold text-fin-text-muted uppercase tracking-wider">
          <span className="w-8" />
          <span>Company</span>
          <span>Industry</span>
          <span>Turnover</span>
          <span>Loan Ask</span>
          <span>Status</span>
          <span>Decision</span>
        </div>

        {sorted.length === 0 && (
          <div className="py-16 text-center">
            <Building2 className="h-8 w-8 mx-auto text-fin-text-muted mb-3 opacity-40" />
            <p className="text-sm text-fin-text-muted">No applications match your filters.</p>
          </div>
        )}

        <div className="divide-y divide-gray-200/30">
          {sorted.map(company => (
            <div
              key={company.id}
              id={`company-row-${company.id}`}
              onClick={() => { setSelectedCompanyId(company.id); router.push(`/officer/application/${company.id}`); }}
              className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-3 lg:gap-4 items-center px-5 py-4 cursor-pointer hover:bg-fin-surface-2 transition-colors group"
            >
              {/* Avatar + score */}
              <div className="flex items-center gap-3 lg:block">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg font-black text-xs text-white flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--primary)' }}>
                    {getInitials(company.name)}
                  </div>
                  <ScoreRing score={company.trustScore} />
                </div>
              </div>

              {/* Name */}
              <div className="min-w-0">
                <div className="font-bold text-sm text-fin-text truncate group-hover:text-fin-primary transition-colors">{company.name}</div>
                <div className="text-[10px] font-mono text-fin-text-muted truncate">{company.gstin}</div>
              </div>

              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${industryColor(company.industry)}`}>{company.industry}</span>
              <span className="text-xs font-mono font-bold text-fin-text">₹{company.turnover} Cr</span>
              <span className="text-xs font-mono text-fin-text-muted">₹{company.loanAmount} Cr</span>
              <StatusBadge status={company.status} />
              <DecisionBadge decision={company.decision} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
