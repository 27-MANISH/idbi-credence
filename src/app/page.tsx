import Link from 'next/link';
import {
  Landmark,
  ShieldCheck,
  Cpu,
  Building2,
  ArrowRight,
  BarChart3,
  FileCheck2,
  Lock,
  Activity,
  Users,
} from 'lucide-react';

const personas = [
  {
    id: 'msme',
    title: 'MSME Borrower Portal',
    subtitle: 'For business owners applying for credit',
    description:
      'Submit your financial profile, provide granular DPDP consents, and let our AI agents synthesize a credit health report from your GST, UPI, banking, and EPFO data — in under 4 minutes.',
    href: '/msme/onboarding',
    icon: Building2,
    cta: 'Start Application',
    color: 'var(--primary)',
    features: ['5-step guided wizard', 'DPDP-compliant consents', 'Real-time AI agent sync', 'Instant health card'],
  },
  {
    id: 'officer',
    title: 'Credit Officer Console',
    subtitle: 'For IDBI Bank underwriting desks',
    description:
      'Review the AI-ranked underwriting queue, inspect SHAP explainability reports, examine full audit logs with evidence tags, and record lending decisions with full traceability.',
    href: '/officer/dashboard',
    icon: ShieldCheck,
    cta: 'Open Console',
    color: 'var(--primary)',
    features: ['AI-ranked queue', 'SHAP audit workbench', 'Evidence graph viewer', 'Decision recording'],
  },
  {
    id: 'monitor',
    title: 'Portfolio Monitoring',
    subtitle: 'Post-disbursement risk surveillance',
    description:
      "Track active loan portfolio health in real time. Monitor stress rates, manage watchlist flags, and receive alerts when a borrower's signals deviate from baseline expectations.",
    href: '/officer/monitoring',
    icon: Activity,
    cta: 'View Dashboard',
    color: 'var(--primary)',
    features: ['Stress rate dials', 'Risk tier alerts', 'Watchlist management', 'Score history trends'],
  },
];

const platformStats = [
  { label: 'Funds Analysed', value: '₹24,850+ Cr', icon: BarChart3 },
  { label: 'MSMEs Evaluated', value: '48,000+', icon: Building2 },
  { label: 'Partner Banks', value: '27', icon: Landmark },
  { label: 'Accuracy Rate', value: '99.2%', icon: FileCheck2 },
  { label: 'Active Reviewers', value: '340+', icon: Users },
  { label: 'Avg Processing', value: '< 4 min', icon: Cpu },
];

const dataSources = [
  { label: 'GST Portal', desc: 'GSTR-1, GSTR-3B filing history & compliance' },
  { label: 'OCEN / AA', desc: 'Account Aggregator bank statement flows' },
  { label: 'UPI Rails', desc: 'Transaction velocity & merchant diversity' },
  { label: 'EPFO Registry', desc: 'Payroll stability & headcount trends' },
  { label: 'MCA Registrar', desc: 'Corporate standing & director checks' },
  { label: 'ITR Direct', desc: 'Income Tax Return cross-validation' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        {/* Subtle grid background */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 bg-fin-primary/10 border border-fin-primary/20 text-fin-primary text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
              <Cpu className="h-3 w-3" />
              LangGraph · Multi-Agent AI · OCEN/ULI Compliant
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-fin-text text-center tracking-tight leading-[1.1] mb-5">
            Credence AI
            <br />
            <span style={{ color: 'var(--primary)' }}>Credit Underwriting</span>
            <br />
            Reimagined
          </h1>

          <p className="max-w-2xl mx-auto text-center text-fin-text-muted text-base leading-relaxed mb-10">
            End-to-end MSME credit intelligence platform — from borrower onboarding and DPDP-compliant
            consent collection to AI-generated SHAP explainability reports for bank credit desks.
          </p>

          {/* CTA row */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              href="/msme/onboarding"
              id="hero-msme-cta"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              Apply as MSME
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/officer/dashboard"
              id="hero-officer-cta"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm border border-gray-200/60 text-fin-text bg-fin-surface hover:bg-fin-surface-2 transition-all hover:scale-105"
            >
              Officer Console
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── PLATFORM STATS ── */}
      <section className="border-y border-gray-200/30 bg-fin-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {platformStats.map(stat => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center">
                  <Icon className="h-5 w-5 mx-auto mb-1" style={{ color: 'var(--primary)' }} />
                  <div className="text-xl font-black font-mono text-fin-text">{stat.value}</div>
                  <div className="text-[10px] font-mono text-fin-text-muted mt-0.5">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PERSONA CARDS ── */}
      <section id="persona-hub" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <span className="text-[10px] font-mono font-bold text-fin-text-muted uppercase tracking-widest block mb-2">
            Select Your Role
          </span>
          <h2 className="text-2xl font-black text-fin-text">Choose Your Portal</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {personas.map(p => {
            const Icon = p.icon;
            return (
              <div
                key={p.id}
                className="group relative bg-fin-surface border border-gray-200/40 rounded-2xl p-6 flex flex-col hover:border-fin-primary/40 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
              >
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-white shadow-sm"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="text-[9px] font-mono font-bold text-fin-text-muted uppercase tracking-wider mb-1">
                  {p.subtitle}
                </div>
                <h3 className="text-base font-bold text-fin-text mb-2">{p.title}</h3>
                <p className="text-[11px] text-fin-text-muted leading-relaxed mb-4 flex-1">{p.description}</p>

                {/* Feature chips */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {p.features.map(f => (
                    <span
                      key={f}
                      className="text-[9px] font-mono bg-fin-primary/8 text-fin-primary border border-fin-primary/20 rounded px-1.5 py-0.5"
                    >
                      {f}
                    </span>
                  ))}
                </div>

                <Link
                  href={p.href}
                  id={`persona-${p.id}-cta`}
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  {p.cta}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── DATA SOURCES ── */}
      <section className="bg-fin-surface border-t border-gray-200/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <span className="text-[10px] font-mono font-bold text-fin-text-muted uppercase tracking-widest block mb-2">
              Data Infrastructure
            </span>
            <h2 className="text-xl font-black text-fin-text">
              Connected to India's Official Financial Rails
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {dataSources.map(src => (
              <div
                key={src.label}
                className="bg-fin-surface-2 border border-gray-200/30 rounded-xl p-3 text-center hover:border-fin-primary/30 transition-colors"
              >
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Lock className="h-3 w-3" style={{ color: 'var(--primary)' }} />
                  <span className="text-[10px] font-mono font-bold text-fin-text">{src.label}</span>
                </div>
                <p className="text-[9px] text-fin-text-muted leading-snug">{src.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
