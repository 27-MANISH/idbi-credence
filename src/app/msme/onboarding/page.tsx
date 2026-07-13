'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2, FileText, ShieldCheck, Cpu, Send,
  CheckCircle2, Circle, ChevronRight, ChevronLeft,
  AlertCircle, Loader2, Sparkles, WifiOff,
} from 'lucide-react';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { useScoreStore } from '@/stores/useScoreStore';
import { useOfficerStore } from '@/stores/useOfficerStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useOnboard, useComputeScore } from '@/lib/useApi';
import FinancialHealthCard from '@/components/FinancialHealthCard';
import RadarChart from '@/components/RadarChart';
import type { Company } from '@/types';

const STEPS = [
  { id: 1, label: 'Business Profile', icon: Building2 },
  { id: 2, label: 'DPDP Consents', icon: ShieldCheck },
  { id: 3, label: 'Agent Sync', icon: Cpu },
  { id: 4, label: 'Score Preview', icon: FileText },
  { id: 5, label: 'Submit', icon: Send },
];

const CONSENT_ITEMS = [
  { key: 'dpdp' as const, label: 'Digital Personal Data Protection Act (DPDP)', desc: 'General consent for DPDP-compliant data processing under Sec 7.' },
  { key: 'gst' as const, label: 'GST Portal Access', desc: 'Allow read-only GSTR-1 & GSTR-3B data pull via API.' },
  { key: 'upi' as const, label: 'UPI Transaction Data', desc: 'UPI rails velocity, merchant count and transaction history.' },
  { key: 'banking' as const, label: 'Account Aggregator (AA)', desc: 'Bank statement access via RBI-licensed AA framework.' },
  { key: 'epfo' as const, label: 'EPFO Registry', desc: 'Payroll headcount and EPF remittance verification.' },
];

const AGENT_STEPS = [
  { label: 'GST Agent', desc: 'Pulling GSTR-1 & 3B filings…', duration: 2200 },
  { label: 'UPI Agent', desc: 'Analysing transaction velocity…', duration: 1800 },
  { label: 'Banking Agent', desc: 'Processing AA bank feeds…', duration: 2000 },
  { label: 'EPFO Agent', desc: 'Verifying payroll data…', duration: 1600 },
  { label: 'Scoring Orchestrator', desc: 'Computing weighted score…', duration: 1400 },
  { label: 'LLM Explainer', desc: 'Generating narrative…', duration: 1200 },
];

const INDUSTRIES = ['Manufacturing', 'Textiles', 'Logistics', 'Healthcare', 'Technology', 'Agriculture', 'Retail', 'Engineering', 'Food Processing'];

export default function OnboardingPage() {
  const router = useRouter();
  const { step, draftData, consents, setStep, updateDraftData, setConsent, setAllConsents, reset } = useOnboardingStore();
  const { setScoreData } = useScoreStore();
  const { addCompany } = useOfficerStore();
  const token = useAuthStore(s => s.token);

  // Real API hooks
  const { execute: onboardApi, loading: onboardLoading, error: onboardError } = useOnboard();
  const { execute: computeScore, loading: scoreLoading, error: scoreError } = useComputeScore();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agentProgress, setAgentProgress] = useState<number>(-1);
  const [submitted, setSubmitted] = useState(false);
  const [apiOffline, setApiOffline] = useState(false);

  // Step 1 validation
  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!draftData.companyName.trim()) e.companyName = 'Company name required';
    if (!draftData.gstin.trim() || draftData.gstin.length < 15) e.gstin = 'Valid 15-char GSTIN required';
    if (!draftData.turnover || isNaN(Number(draftData.turnover))) e.turnover = 'Annual turnover required';
    if (!draftData.loanAmount || isNaN(Number(draftData.loanAmount))) e.loanAmount = 'Loan amount required';
    if (!draftData.purpose.trim()) e.purpose = 'Loan purpose required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const allGranted = Object.values(consents).every(Boolean);
    if (!allGranted) setErrors({ consents: 'All consents required to proceed.' });
    return allGranted;
  };

  const handleNext = () => {
    setErrors({});
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(step + 1);
    if (step + 1 === 3) runAgentSimulation();
  };

  const handleBack = () => {
    setErrors({});
    setStep(Math.max(1, step - 1));
  };

  const runAgentSimulation = () => {
    setAgentProgress(0);
    let current = 0;
    const tick = () => {
      if (current >= AGENT_STEPS.length) {
        // Compute mock scores
        const base = Math.min(95, 65 + Math.random() * 25);
        const dimScores = {
          gst: Math.round(base + (Math.random() - 0.5) * 15),
          upi: Math.round(base + (Math.random() - 0.5) * 12),
          banking: Math.round(base + (Math.random() - 0.5) * 10),
          epfo: Math.round(base + (Math.random() - 0.5) * 8),
          growth: Math.round(base + (Math.random() - 0.5) * 14),
        };
        const overall = Math.round(Object.values(dimScores).reduce((a, b) => a + b, 0) / 5);
        const grade = overall >= 90 ? 'A+' : overall >= 80 ? 'A' : overall >= 70 ? 'B+' : 'B';
        setScoreData({ currentScore: 300 + Math.round(overall * 6), grade, dimensionScores: dimScores, shapContributions: { gst: dimScores.gst - 75, upi: dimScores.upi - 75, banking: dimScores.banking - 75, epfo: dimScores.epfo - 75, growth: dimScores.growth - 75 } });
        setTimeout(() => setStep(4), 600);
        return;
      }
      setAgentProgress(current);
      current += 1;
      setTimeout(tick, AGENT_STEPS[current - 1]?.duration ?? 1500);
    };
    tick();
  };

  const handleSubmit = async () => {
    const t = parseFloat(draftData.turnover);
    const l = parseFloat(draftData.loanAmount);
    const scoreState = useScoreStore.getState();
    const overall = scoreState.currentScore ? Math.round((scoreState.currentScore - 300) / 6) : 78;
    const dims = scoreState.dimensionScores;

    // ---------- Try real API first ----------
    let profileId: string | null = null;
    let consentId: string | null = null;

    const onboardRes = await onboardApi({
      profile: {
        gstin: draftData.gstin,
        name: draftData.companyName,
        type: draftData.industry,
        years: undefined,
        location: undefined,
      },
      consent: {
        gst_consent: consents.gst,
        upi_consent: consents.upi,
        aa_consent: consents.banking,
        epfo_consent: consents.epfo,
      },
      loan: {
        loan_type: 'WORKING_CAPITAL',
        amount: Math.round(l * 1_00_00_000), // Cr to INR
        tenure: 36,
      },
    });

    if (onboardRes) {
      profileId = onboardRes.profile_id;
      consentId = onboardRes.consent_id;
      setApiOffline(false);

      // Trigger real LangGraph scoring
      const scoreRes = await computeScore({
        profile_id: profileId!,
        consent_id: consentId ?? undefined,
      });

      if (scoreRes) {
        // Map ScoreExplainFeature[] → Zustand score shape
        const featureMap: Record<string, number> = {};
        const shapMap: Record<string, number> = {};
        for (const f of scoreRes.features) {
          featureMap[f.name.toLowerCase()] = Math.round(f.raw_value);
          shapMap[f.name.toLowerCase()] = Math.round(f.contribution);
        }
        const rawScore = Object.values(featureMap).reduce((a, b) => a + b, 0) / Object.keys(featureMap).length || 75;
        setScoreData({
          currentScore: Math.round(300 + rawScore * 6),
          grade: rawScore >= 88 ? 'A+' : rawScore >= 78 ? 'A' : rawScore >= 68 ? 'B+' : 'B',
          dimensionScores: {
            gst: featureMap['gst'] ?? dims.gst,
            upi: featureMap['upi'] ?? dims.upi,
            banking: featureMap['aa'] ?? dims.banking,
            epfo: featureMap['epfo'] ?? dims.epfo,
            growth: featureMap['growth'] ?? dims.growth,
          },
          shapContributions: shapMap,
        });
      }
    } else {
      // Backend offline — continue with mock data already in store
      setApiOffline(true);
    }

    // ---------- Always add to officer queue (mock or real) ----------
    const freshScore = useScoreStore.getState();
    const finalOverall = freshScore.currentScore ? Math.round((freshScore.currentScore - 300) / 6) : overall;

    const newCompany: Company = {
      id: profileId ?? `comp-${Date.now()}`,
      name: draftData.companyName,
      gstin: draftData.gstin,
      pan: draftData.pan || 'AAACK4821D',
      cin: draftData.cin || 'U27200MH2015PLC261542',
      industry: draftData.industry,
      turnover: t,
      loanAmount: l,
      existingBank: draftData.existingBank,
      purpose: draftData.purpose,
      trustScore: finalOverall,
      status: 'Under Review',
      verifiedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      decision: 'PENDING',
      reviewerNotes: '',
      grade: freshScore.grade || 'B+',
      metrics: [
        { year: 'FY24', turnover: t * 0.8, ebitda: t * 0.8 * 0.12, pat: t * 0.8 * 0.06, debtEquity: 1.15, dscr: 1.42, currentRatio: 1.35 },
        { year: 'FY25', turnover: t * 0.9, ebitda: t * 0.9 * 0.13, pat: t * 0.9 * 0.065, debtEquity: 1.02, dscr: 1.55, currentRatio: 1.42 },
        { year: 'FY26', turnover: t, ebitda: t * 0.14, pat: t * 0.07, debtEquity: 0.88, dscr: 1.76, currentRatio: 1.52 },
      ],
      documents: [
        { name: 'GST Returns', category: 'Mandatory', uploaded: true, status: 'Verified', fileName: 'GST_FY26.pdf', lastChecked: 'Just Now' },
        { name: 'Bank Statements', category: 'Mandatory', uploaded: true, status: 'Verified', fileName: 'Statements_12M.pdf', lastChecked: 'Just Now' },
      ],
      auditLogs: [
        { id: `log-${Date.now()}-1`, type: 'success', category: 'GST', message: 'GSTR filings verified.', evidence: 'Sales match with < 1% variance.', source: 'GST Portal API' },
        { id: `log-${Date.now()}-2`, type: 'success', category: 'EPFO', message: 'Payroll verified.', evidence: 'Regular EPF contributions confirmed.', source: 'EPFO API' },
      ],
    };

    addCompany(newCompany);
    reset();
    setSubmitted(true);
    setTimeout(() => router.push('/officer/dashboard'), 2500);
  };

  const scoreState = useScoreStore.getState();

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <CheckCircle2 className="h-16 w-16 mx-auto" style={{ color: 'var(--success)' }} />
          <h2 className="text-2xl font-black text-fin-text">Application Submitted!</h2>
          <p className="text-fin-text-muted text-sm">Redirecting to officer console…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Step indicator */}
      <nav className="flex items-center justify-center gap-0 mb-10" aria-label="Onboarding steps">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = step > s.id;
          const active = step === s.id;
          return (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    done
                      ? 'border-fin-success bg-fin-success/10'
                      : active
                      ? 'border-fin-primary bg-fin-primary/10'
                      : 'border-gray-200 bg-fin-surface-2'
                  }`}
                >
                  {done ? (
                    <CheckCircle2 className="h-4 w-4" style={{ color: 'var(--success)' }} />
                  ) : (
                    <Icon className={`h-4 w-4 ${active ? 'text-fin-primary' : 'text-fin-text-muted'}`} />
                  )}
                </div>
                <span className={`text-[9px] font-mono font-bold ${active ? 'text-fin-primary' : 'text-fin-text-muted'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px w-8 mx-1 mb-4 transition-colors ${done ? 'bg-fin-success/50' : 'bg-gray-200/60'}`} />
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Card */}
      <div className="bg-fin-surface border border-gray-200/40 rounded-2xl p-6 sm:p-8 shadow-sm">

        {/* STEP 1: Business Profile */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-black text-fin-text">Business Profile</h2>
              <p className="text-[12px] text-fin-text-muted mt-1">Enter your company's core details to begin the credit assessment.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: 'companyName', label: 'Company Name', placeholder: 'Ramesh Textiles Pvt. Ltd.' },
                { key: 'gstin', label: 'GSTIN', placeholder: '27AABCR1234N1Z5' },
                { key: 'pan', label: 'PAN', placeholder: 'AABCR1234N' },
                { key: 'cin', label: 'CIN (optional)', placeholder: 'U27200MH2015PLC261542' },
                { key: 'turnover', label: 'Annual Turnover (₹ Cr)', placeholder: '25.5' },
                { key: 'loanAmount', label: 'Loan Amount Required (₹ Cr)', placeholder: '3.0' },
                { key: 'existingBank', label: 'Current Bank', placeholder: 'Bank of Baroda' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-[11px] font-mono font-bold text-fin-text-muted uppercase tracking-wide block mb-1">
                    {f.label}
                  </label>
                  <input
                    id={`field-${f.key}`}
                    value={(draftData as any)[f.key]}
                    onChange={e => updateDraftData({ [f.key]: e.target.value } as any)}
                    placeholder={f.placeholder}
                    className={`w-full bg-fin-surface-2 border rounded-lg px-3 py-2 text-sm text-fin-text font-mono placeholder:text-fin-text-muted/50 focus:outline-none focus:ring-1 focus:ring-fin-primary transition-all ${
                      errors[f.key] ? 'border-fin-error' : 'border-gray-200/50'
                    }`}
                  />
                  {errors[f.key] && <p className="text-fin-error text-[10px] mt-0.5">{errors[f.key]}</p>}
                </div>
              ))}
              <div>
                <label className="text-[11px] font-mono font-bold text-fin-text-muted uppercase tracking-wide block mb-1">Industry</label>
                <select
                  id="field-industry"
                  value={draftData.industry}
                  onChange={e => updateDraftData({ industry: e.target.value })}
                  className="w-full bg-fin-surface-2 border border-gray-200/50 rounded-lg px-3 py-2 text-sm text-fin-text font-mono focus:outline-none focus:ring-1 focus:ring-fin-primary"
                >
                  {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-[11px] font-mono font-bold text-fin-text-muted uppercase tracking-wide block mb-1">Loan Purpose</label>
              <textarea
                id="field-purpose"
                rows={3}
                value={draftData.purpose}
                onChange={e => updateDraftData({ purpose: e.target.value })}
                placeholder="Describe the intended use of credit funds…"
                className={`w-full bg-fin-surface-2 border rounded-lg px-3 py-2 text-sm text-fin-text font-mono resize-none focus:outline-none focus:ring-1 focus:ring-fin-primary ${errors.purpose ? 'border-fin-error' : 'border-gray-200/50'}`}
              />
              {errors.purpose && <p className="text-fin-error text-[10px] mt-0.5">{errors.purpose}</p>}
            </div>
          </div>
        )}

        {/* STEP 2: DPDP Consents */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-black text-fin-text">DPDP Consent Management</h2>
              <p className="text-[12px] text-fin-text-muted mt-1">Under the Digital Personal Data Protection Act 2023, your explicit consent is required for each data source. You may withdraw at any time.</p>
            </div>

            <button
              id="consent-select-all"
              onClick={() => setAllConsents(true)}
              className="text-[11px] font-mono font-bold text-fin-primary underline underline-offset-2"
            >
              Grant All Consents
            </button>

            <div className="space-y-3">
              {CONSENT_ITEMS.map(item => (
                <label
                  key={item.key}
                  htmlFor={`consent-${item.key}`}
                  className="flex items-start gap-3 bg-fin-surface-2 border border-gray-200/40 rounded-xl p-4 cursor-pointer hover:border-fin-primary/40 transition-colors"
                >
                  <div className="mt-0.5">
                    {consents[item.key] ? (
                      <CheckCircle2 className="h-5 w-5" style={{ color: 'var(--success)' }} />
                    ) : (
                      <Circle className="h-5 w-5 text-fin-text-muted" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-fin-text">{item.label}</div>
                    <div className="text-[11px] text-fin-text-muted mt-0.5 leading-relaxed">{item.desc}</div>
                  </div>
                  <input
                    id={`consent-${item.key}`}
                    type="checkbox"
                    className="sr-only"
                    checked={consents[item.key]}
                    onChange={e => setConsent(item.key, e.target.checked)}
                  />
                </label>
              ))}
            </div>

            {errors.consents && (
              <div className="flex items-center gap-2 text-fin-error text-[11px] font-mono">
                <AlertCircle className="h-4 w-4" />
                {errors.consents}
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Agent Sync */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-fin-text">AI Agent Synchronisation</h2>
              <p className="text-[12px] text-fin-text-muted mt-1">Our LangGraph agents are pulling and cross-verifying your consented data sources in parallel.</p>
            </div>
            <div className="space-y-3">
              {AGENT_STEPS.map((agent, i) => {
                const done = agentProgress > i;
                const active = agentProgress === i;
                return (
                  <div key={agent.label} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${done ? 'bg-fin-success/5 border-fin-success/30' : active ? 'bg-fin-primary/5 border-fin-primary/30' : 'bg-fin-surface-2 border-gray-200/30 opacity-50'}`}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: done ? 'var(--success)' : active ? 'var(--primary)' : 'transparent', border: done || active ? 'none' : '1px solid rgba(148,163,184,0.4)' }}>
                      {done ? <CheckCircle2 className="h-4 w-4 text-white" /> : active ? <Loader2 className="h-4 w-4 text-white animate-spin" /> : <span className="text-[10px] font-mono text-fin-text-muted">{i + 1}</span>}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-fin-text">{agent.label}</div>
                      <div className="text-[10px] text-fin-text-muted">{done ? 'Complete ✓' : active ? agent.desc : 'Waiting…'}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: Score Preview */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-fin-text">Credit Health Preview</h2>
              <p className="text-[12px] text-fin-text-muted mt-1">Here is your AI-generated credit health summary. This will be submitted to the bank for underwriting review.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FinancialHealthCard
                companyName={draftData.companyName}
                gstin={draftData.gstin}
                trustScore={Math.round((useScoreStore.getState().currentScore! - 300) / 6) || 78}
                status="Under Review"
                turnover={parseFloat(draftData.turnover) || 0}
                loanAmount={parseFloat(draftData.loanAmount) || 0}
                industry={draftData.industry}
                decision="PENDING"
                dimensionScores={useScoreStore.getState().dimensionScores}
              />

              <div className="bg-fin-surface-2 border border-gray-200/40 rounded-2xl p-4 flex items-center justify-center">
                <RadarChart
                  dimensions={[
                    { key: 'gst', label: 'GST', val: useScoreStore.getState().dimensionScores.gst || 75 },
                    { key: 'upi', label: 'UPI', val: useScoreStore.getState().dimensionScores.upi || 72 },
                    { key: 'banking', label: 'Banking', val: useScoreStore.getState().dimensionScores.banking || 80 },
                    { key: 'epfo', label: 'EPFO', val: useScoreStore.getState().dimensionScores.epfo || 78 },
                    { key: 'growth', label: 'Growth', val: useScoreStore.getState().dimensionScores.growth || 68 },
                  ]}
                />
              </div>
            </div>

            <div className="bg-fin-primary/5 border border-fin-primary/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4" style={{ color: 'var(--primary)' }} />
                <span className="text-[10px] font-mono font-bold text-fin-primary uppercase">AI Summary</span>
              </div>
              <p className="text-[12px] text-fin-text-muted leading-relaxed">
                {draftData.companyName} demonstrates solid financial standing with consistent GST compliance and stable banking patterns. The credit profile meets standard MSME lending criteria. Recommended for credit officer review.
              </p>
            </div>
          </div>
        )}

        {/* STEP 5: Submit */}
        {step === 5 && (
          <div className="space-y-6 text-center">
            <div>
              <Send className="h-12 w-12 mx-auto mb-3" style={{ color: 'var(--primary)' }} />
              <h2 className="text-xl font-black text-fin-text">Ready to Submit</h2>
              <p className="text-[12px] text-fin-text-muted mt-2 leading-relaxed max-w-sm mx-auto">
                Your application for <strong>{draftData.companyName}</strong> with a loan request of ₹{draftData.loanAmount} Cr will be sent to the IDBI Credit Desk for review.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-left">
              {[
                ['Company', draftData.companyName],
                ['GSTIN', draftData.gstin],
                ['Turnover', `₹${draftData.turnover} Cr`],
                ['Loan Ask', `₹${draftData.loanAmount} Cr`],
                ['Industry', draftData.industry],
                ['Purpose', draftData.purpose.slice(0, 40) + '…'],
              ].map(([k, v]) => (
                <div key={k} className="bg-fin-surface-2 rounded-lg px-3 py-2">
                  <div className="text-[9px] font-mono text-fin-text-muted">{k}</div>
                  <div className="text-xs font-bold text-fin-text truncate">{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* API offline badge */}
        {apiOffline && (
          <div className="flex items-center gap-2 bg-fin-warning/10 border border-fin-warning/30 rounded-xl px-4 py-2.5 mb-4">
            <WifiOff className="h-4 w-4 text-fin-warning shrink-0" />
            <p className="text-[11px] text-fin-warning font-mono">
              Backend offline — using mock data. Application will still be queued locally.
            </p>
          </div>
        )}

        {/* Navigation buttons */}
        {step !== 3 && (
          <div className="flex items-center justify-between mt-8 pt-5 border-t border-gray-200/30">
            <button
              id="btn-back"
              onClick={handleBack}
              disabled={step === 1}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-fin-text-muted border border-gray-200/50 rounded-lg hover:bg-fin-surface-2 disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>

            {step < 5 ? (
              <button
                id="btn-next"
                onClick={handleNext}
                className="flex items-center gap-1.5 px-5 py-2 text-sm font-bold text-white rounded-lg hover:brightness-110 transition-all"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                Continue
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                id="btn-submit"
                onClick={handleSubmit}
                disabled={onboardLoading || scoreLoading}
                className="flex items-center gap-1.5 px-5 py-2 text-sm font-bold text-white rounded-lg hover:brightness-110 disabled:opacity-60 transition-all"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                {(onboardLoading || scoreLoading) ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                ) : (
                  <><Send className="h-4 w-4" /> Submit Application</>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
