'use client';

import React, { useState } from 'react';
import {
  Activity, AlertTriangle, AlertCircle, ShieldCheck,
  Eye, EyeOff, Bell, BellOff, ChevronRight, BarChart3, X,
} from 'lucide-react';
import { useMonitoringStore } from '@/stores/useMonitoringStore';
import TrendChart from '@/components/TrendChart';
import Link from 'next/link';

const RISK_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  LOW:      { bg: 'bg-fin-success/10', text: 'text-fin-success', border: 'border-fin-success/30' },
  MEDIUM:   { bg: 'bg-fin-warning/10', text: 'text-fin-warning', border: 'border-fin-warning/30' },
  HIGH:     { bg: 'bg-fin-error/10', text: 'text-fin-error', border: 'border-fin-error/50' },
  CRITICAL: { bg: 'bg-fin-error/20', text: 'text-fin-error', border: 'border-fin-error/60' },
};

function StressDial({ value, label }: { value: number; label: string }) {
  const pct = Math.min(100, Math.max(0, value));
  const color = pct < 40 ? 'var(--success)' : pct < 70 ? 'var(--warning)' : 'var(--error)';
  const circumference = 2 * Math.PI * 28;
  const dashOffset = circumference * (1 - pct / 100);
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16">
        <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
          <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(148,163,184,0.2)" strokeWidth="5" />
          <circle cx="32" cy="32" r="28" fill="none" stroke={color} strokeWidth="5"
            strokeDasharray={circumference} strokeDashoffset={dashOffset} strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-black font-mono" style={{ color }}>{pct}%</span>
        </div>
      </div>
      <span className="text-[9px] font-mono text-fin-text-muted text-center leading-tight max-w-[64px] truncate">{label}</span>
    </div>
  );
}

export default function MonitoringPage() {
  const { loans, toggleWatchlist, dismissAlert } = useMonitoringStore();
  const [showWatchlistOnly, setShowWatchlistOnly] = useState(false);
  const [riskFilter, setRiskFilter] = useState<string>('ALL');

  const filteredLoans = loans.filter(loan => {
    if (showWatchlistOnly && !loan.inWatchlist) return false;
    if (riskFilter !== 'ALL' && loan.riskTier !== riskFilter) return false;
    return true;
  });

  const totalExposure = loans.reduce((a, b) => a + b.loanAmount, 0);
  const avgStress = loans.length ? (loans.reduce((a, b) => a + b.stressRate, 0) / loans.length).toFixed(1) : '0';
  const watchlistCount = loans.filter(l => l.inWatchlist).length;
  const criticalCount = loans.filter(l => l.riskTier === 'CRITICAL' || l.riskTier === 'HIGH').length;

  // Aggregate all alerts across loans
  const allAlerts = loans.flatMap(loan => loan.alerts.map(a => ({ ...a, companyName: loan.companyName, loanId: loan.id })));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-fin-text">Portfolio Monitoring</h1>
          <p className="text-[12px] text-fin-text-muted mt-0.5">Post-disbursement risk surveillance · Real-time signals</p>
        </div>
        <span className="text-[10px] font-mono text-fin-text-muted flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-fin-success animate-pulse inline-block" />
          Live monitoring active
        </span>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Exposure', value: `₹${totalExposure.toFixed(1)} Cr`, icon: BarChart3, sub: `${loans.length} active loans` },
          { label: 'Avg Stress Rate', value: `${avgStress}%`, icon: Activity, sub: 'Portfolio mean' },
          { label: 'Watchlisted', value: watchlistCount, icon: Eye, sub: 'Flagged accounts' },
          { label: 'At Risk', value: criticalCount, icon: AlertTriangle, sub: 'High / Critical tier' },
        ].map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-fin-surface border border-gray-200/40 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-mono font-bold text-fin-text-muted uppercase">{card.label}</span>
                <Icon className="h-3.5 w-3.5 text-fin-text-muted" />
              </div>
              <div className="text-xl font-black font-mono text-fin-text">{card.value}</div>
              <div className="text-[9px] text-fin-text-muted mt-0.5">{card.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Stress dials */}
      <div className="bg-fin-surface border border-gray-200/40 rounded-2xl p-5 mb-6">
        <h3 className="text-sm font-bold text-fin-text mb-4">Portfolio Stress Rate Overview</h3>
        <div className="flex gap-4 flex-wrap">
          {loans.map(loan => (
            <StressDial key={loan.id} value={loan.stressRate} label={loan.companyName.split(' ')[0]} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Loan cards */}
        <div className="lg:col-span-2 space-y-3">
          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="toggle-watchlist-only"
              onClick={() => setShowWatchlistOnly(!showWatchlistOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all ${showWatchlistOnly ? 'border-fin-primary text-fin-primary bg-fin-primary/10' : 'border-gray-200/50 text-fin-text-muted hover:border-gray-300'}`}
            >
              {showWatchlistOnly ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              Watchlist Only
            </button>
            {(['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map(tier => (
              <button
                key={tier}
                id={`filter-tier-${tier.toLowerCase()}`}
                onClick={() => setRiskFilter(tier)}
                className={`px-2.5 py-1.5 text-[10px] font-mono font-bold rounded-lg border transition-all ${riskFilter === tier ? 'border-fin-primary text-fin-primary bg-fin-primary/10' : 'border-gray-200/50 text-fin-text-muted hover:border-gray-300'}`}
              >
                {tier}
              </button>
            ))}
            <span className="text-[10px] font-mono text-fin-text-muted ml-auto">{filteredLoans.length} of {loans.length} shown</span>
          </div>

          {filteredLoans.length === 0 && (
            <div className="py-10 text-center text-fin-text-muted text-sm">No loans match current filters.</div>
          )}

          {filteredLoans.map(loan => {
            const riskStyle = RISK_COLORS[loan.riskTier] ?? RISK_COLORS.MEDIUM;
            const trendData = loan.scoreHistory.map(s => ({ label: s.month, value: s.score }));
            const currentScore = loan.scoreHistory[loan.scoreHistory.length - 1]?.score ?? 0;

            return (
              <div key={loan.id} className={`bg-fin-surface border ${riskStyle.border} rounded-2xl p-4 space-y-3`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-fin-text truncate">{loan.companyName}</h3>
                      <span className={`text-[9px] font-mono font-bold border px-1.5 py-0.5 rounded ${riskStyle.bg} ${riskStyle.text} ${riskStyle.border}`}>
                        {loan.riskTier} RISK
                      </span>
                      {loan.inWatchlist && (
                        <span className="text-[9px] font-mono font-bold text-fin-warning bg-fin-warning/10 border border-fin-warning/30 px-1.5 py-0.5 rounded">
                          ⚠ WATCHLIST
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-mono text-fin-text-muted mt-0.5">
                      ₹{loan.loanAmount} Cr · {loan.industry} · {loan.interestRate}% p.a. · EMI {loan.nextEmiDate}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      id={`watchlist-toggle-${loan.id}`}
                      onClick={() => toggleWatchlist(loan.id)}
                      title={loan.inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                      className="p-1.5 rounded-lg border border-gray-200/50 hover:bg-fin-surface-2 transition-colors"
                    >
                      {loan.inWatchlist
                        ? <BellOff className="h-3.5 w-3.5 text-fin-warning" />
                        : <Bell className="h-3.5 w-3.5 text-fin-text-muted" />}
                    </button>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Stress Rate', value: `${loan.stressRate}%`, bad: loan.stressRate > 60 },
                    { label: 'Current Score', value: currentScore, bad: currentScore < 65 },
                    { label: 'Outstanding', value: `₹${loan.outstandingAmount} Cr`, bad: false },
                  ].map(m => (
                    <div key={m.label} className="bg-fin-surface-2 rounded-lg px-2.5 py-2">
                      <div className="text-[8px] font-mono text-fin-text-muted">{m.label}</div>
                      <div className="text-sm font-black font-mono" style={{ color: m.bad ? 'var(--error)' : 'var(--success)' }}>
                        {m.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Score trend */}
                <div>
                  <p className="text-[9px] font-mono text-fin-text-muted mb-1">Score Trend</p>
                  <TrendChart
                    data={trendData}
                    height={60}
                    strokeColor={loan.riskTier === 'LOW' ? 'var(--success)' : loan.riskTier === 'MEDIUM' ? 'var(--warning)' : 'var(--error)'}
                  />
                </div>

                {/* Per-loan alerts */}
                {loan.alerts.length > 0 && (
                  <div className="space-y-1.5 pt-1 border-t border-gray-200/30">
                    {loan.alerts.map(alert => {
                      const Icon = alert.type === 'danger' ? AlertCircle : AlertTriangle;
                      const color = alert.type === 'danger' ? 'var(--error)' : 'var(--warning)';
                      return (
                        <div key={alert.id} className="flex items-center gap-2 text-[10px] font-mono text-fin-text-muted">
                          <Icon className="h-3 w-3 shrink-0" style={{ color }} />
                          <span className="flex-1 truncate">{alert.message}</span>
                          <button
                            id={`dismiss-${loan.id}-${alert.id}`}
                            onClick={() => dismissAlert(loan.id, alert.id)}
                            className="shrink-0 hover:text-fin-error transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Alerts sidebar */}
        <div className="bg-fin-surface border border-gray-200/40 rounded-2xl p-4 h-fit">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-fin-text">All Active Alerts</h3>
            <span className="text-[10px] font-mono bg-fin-error/10 text-fin-error border border-fin-error/30 px-1.5 py-0.5 rounded font-bold">
              {allAlerts.length}
            </span>
          </div>

          {allAlerts.length === 0 && (
            <div className="text-center py-6">
              <ShieldCheck className="h-8 w-8 mx-auto text-fin-success mb-2" />
              <p className="text-[11px] text-fin-text-muted">All clear — no active alerts</p>
            </div>
          )}

          <div className="space-y-2">
            {allAlerts.map(alert => {
              const Icon = alert.type === 'danger' ? AlertCircle : AlertTriangle;
              const color = alert.type === 'danger' ? 'var(--error)' : 'var(--warning)';
              return (
                <div key={alert.id} className="bg-fin-surface-2 rounded-xl p-3 border border-gray-200/30">
                  <div className="flex items-start gap-2">
                    <Icon className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-fin-text truncate">{alert.companyName}</p>
                      <p className="text-[9px] font-mono text-fin-primary mb-0.5">{alert.category}</p>
                      <p className="text-[10px] text-fin-text-muted leading-snug">{alert.message}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[9px] font-mono text-fin-text-muted">{alert.date}</span>
                        <button
                          id={`sidebar-dismiss-${alert.id}`}
                          onClick={() => dismissAlert(alert.loanId, alert.id)}
                          className="text-[9px] font-mono font-bold text-fin-text-muted hover:text-fin-error transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
