'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ShapEntry {
  label: string;
  contribution: number; // Positive or negative delta from 600 baseline
}

interface ExplainabilityPanelProps {
  overallScore: number;
  baseline?: number;
  entries: ShapEntry[];
  explanation?: string;
}

export default function ExplainabilityPanel({
  overallScore,
  baseline = 600,
  entries,
  explanation,
}: ExplainabilityPanelProps) {
  const maxAbs = Math.max(...entries.map(e => Math.abs(e.contribution)), 1);

  const sorted = [...entries].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

  return (
    <div className="bg-fin-surface border border-gray-200/40 rounded-2xl p-5 space-y-5">
      {/* Header */}
      <div>
        <span className="text-[10px] font-mono font-bold text-fin-primary uppercase tracking-wider block">
          SHAP Explainability
        </span>
        <h3 className="text-sm font-bold text-fin-text mt-0.5">Score Contribution Breakdown</h3>
        <p className="text-[11px] text-fin-text-muted mt-1 leading-relaxed">
          Each dimension's contribution is measured relative to a baseline of{' '}
          <span className="font-mono font-bold text-fin-text">{baseline}</span>. Positive bars push
          the final score up; negative bars pull it down.
        </p>
      </div>

      {/* Score summary */}
      <div className="flex items-center gap-3 bg-fin-surface-2 rounded-xl p-3 border border-gray-200/30">
        <div className="text-center">
          <div className="text-[9px] font-mono text-fin-text-muted">Baseline</div>
          <div className="text-lg font-black font-mono text-fin-text-muted">{baseline}</div>
        </div>
        <div className="flex-1 text-center text-fin-text-muted font-mono text-sm">→</div>
        <div className="text-center">
          <div className="text-[9px] font-mono text-fin-text-muted">Final Score</div>
          <div
            className="text-lg font-black font-mono"
            style={{ color: overallScore >= 750 ? 'var(--success)' : overallScore >= 600 ? 'var(--warning)' : 'var(--error)' }}
          >
            {overallScore}
          </div>
        </div>
        <div className="text-center">
          <div className="text-[9px] font-mono text-fin-text-muted">Net Δ</div>
          <div
            className="text-lg font-black font-mono"
            style={{ color: overallScore - baseline >= 0 ? 'var(--success)' : 'var(--error)' }}
          >
            {overallScore - baseline >= 0 ? '+' : ''}
            {overallScore - baseline}
          </div>
        </div>
      </div>

      {/* SHAP bars */}
      <div className="space-y-3">
        {sorted.map((entry, i) => {
          const isPos = entry.contribution >= 0;
          const barWidth = (Math.abs(entry.contribution) / maxAbs) * 100;
          const Icon = isPos ? TrendingUp : entry.contribution < 0 ? TrendingDown : Minus;

          return (
            <div key={`shap-${i}`} className="group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <Icon
                    className="h-3 w-3 shrink-0"
                    style={{ color: isPos ? 'var(--success)' : 'var(--error)' }}
                  />
                  <span className="text-[11px] font-mono text-fin-text">{entry.label}</span>
                </div>
                <span
                  className="text-[11px] font-mono font-bold"
                  style={{ color: isPos ? 'var(--success)' : 'var(--error)' }}
                >
                  {isPos ? '+' : ''}
                  {entry.contribution}
                </span>
              </div>

              {/* Bar track — centered at 50% */}
              <div className="relative h-2 bg-fin-surface-2 rounded-full overflow-hidden">
                {isPos ? (
                  <div
                    className="absolute top-0 left-1/2 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${barWidth / 2}%`,
                      backgroundColor: 'var(--success)',
                      opacity: 0.8,
                    }}
                  />
                ) : (
                  <div
                    className="absolute top-0 h-full rounded-full transition-all duration-500"
                    style={{
                      right: '50%',
                      width: `${barWidth / 2}%`,
                      backgroundColor: 'var(--error)',
                      opacity: 0.8,
                    }}
                  />
                )}
                {/* Center line */}
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gray-300/60" />
              </div>
            </div>
          );
        })}
      </div>

      {/* LLM explanation */}
      {explanation && (
        <div className="bg-fin-primary/5 border border-fin-primary/20 rounded-xl p-3.5">
          <span className="text-[9px] font-mono font-bold text-fin-primary uppercase tracking-wider block mb-1.5">
            AI Narrative
          </span>
          <p className="text-[11px] text-fin-text-muted leading-relaxed">{explanation}</p>
        </div>
      )}
    </div>
  );
}
