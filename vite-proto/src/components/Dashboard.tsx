/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Search, Plus, Filter, ArrowUpRight, ShieldCheck, AlertTriangle, AlertCircle, 
  Building2, ClipboardList, ChevronRight, Sparkles, Award, Upload, Database, 
  Layers, FileCheck2, Activity, ArrowRight, CheckCircle2, TrendingUp, Users,
  Coins, FileSpreadsheet, Building, Briefcase, BarChart3, HelpCircle, MapPin, 
  Calendar, ArrowUpDown, RefreshCw
} from 'lucide-react';
import { motion } from 'motion/react';
import { Company, VerificationStatus } from '../types';

interface DashboardProps {
  companies: Company[];
  onSelectCompany: (company: Company) => void;
  onNavigateToWizard: () => void;
}

export default function Dashboard({ companies, onSelectCompany, onNavigateToWizard }: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('ALL');
  const [selectedTrustScoreFilter, setSelectedTrustScoreFilter] = useState<string>('ALL');
  const [selectedLocationFilter, setSelectedLocationFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('NEWEST');
  const [activePersona, setActivePersona] = useState<'msme' | 'bank' | 'investor'>('msme');

  // Stats calculation
  const totalAnalyzed = 142 + companies.length - 4; // Adding baseline mock count offset
  const averageTrustScore = (companies.reduce((acc, curr) => acc + curr.trustScore, 0) / companies.length).toFixed(1);
  const totalReports = 389 + companies.length - 4;
  const pendingReviews = companies.filter(c => c.decision === 'PENDING').length;

  // Filter unique industries
  const industries = Array.from(new Set(companies.map(c => c.industry)));

  // Filter unique locations (State-based)
  const locations = Array.from(new Set(companies.map(c => {
    if (!c.location) return 'Other';
    const parts = c.location.split(',');
    return parts[parts.length - 1].trim();
  }))).filter(Boolean);

  // Filtered companies
  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          company.gstin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          company.cin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (company.location && company.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          company.industry.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'ALL' || company.status === selectedStatus;
    const matchesIndustry = selectedIndustry === 'ALL' || company.industry === selectedIndustry;

    let matchesTrust = true;
    if (selectedTrustScoreFilter === 'EXCELLENT') {
      matchesTrust = company.trustScore >= 90;
    } else if (selectedTrustScoreFilter === 'GOOD') {
      matchesTrust = company.trustScore >= 75 && company.trustScore < 90;
    } else if (selectedTrustScoreFilter === 'NEEDS_REVIEW') {
      matchesTrust = company.trustScore < 75;
    }

    let matchesLocation = true;
    if (selectedLocationFilter !== 'ALL') {
      const state = company.location ? company.location.split(',').pop()?.trim() : '';
      matchesLocation = state === selectedLocationFilter;
    }

    return matchesSearch && matchesStatus && matchesIndustry && matchesTrust && matchesLocation;
  });

  // Safe date parser helper
  const getSortValue = (company: Company) => {
    const dateStr = company.lastUpdated || company.verifiedAt || '';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 0 : d.getTime();
  };

  // Sorted companies
  const sortedCompanies = [...filteredCompanies].sort((a, b) => {
    if (sortBy === 'HIGHEST_TRUST') {
      return b.trustScore - a.trustScore;
    }
    if (sortBy === 'HIGHEST_REVENUE') {
      return b.turnover - a.turnover;
    }
    // Sort by Newest or Recently Updated (using date parse value)
    return getSortValue(b) - getSortValue(a);
  });

  const getCompanyInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getIndustryTheme = (industry: string) => {
    const ind = industry.toLowerCase();
    if (ind.includes('textile') || ind.includes('garment')) {
      return 'bg-rose-50 text-rose-700 border-rose-100';
    }
    if (ind.includes('logistics') || ind.includes('chain')) {
      return 'bg-blue-50 text-blue-700 border-blue-100';
    }
    if (ind.includes('health') || ind.includes('pharm')) {
      return 'bg-teal-50 text-teal-700 border-teal-100';
    }
    if (ind.includes('engineer') || ind.includes('metal') || ind.includes('heavy')) {
      return 'bg-orange-50 text-orange-700 border-orange-100';
    }
    if (ind.includes('tech') || ind.includes('software') || ind.includes('solutions')) {
      return 'bg-indigo-50 text-indigo-700 border-indigo-100';
    }
    if (ind.includes('agri') || ind.includes('food')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    }
    return 'bg-slate-50 text-slate-700 border-slate-150';
  };

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-100">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 mr-1" />
            Verified
          </span>
        );
      case 'Under Review':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-100">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 mr-1" />
            Under Review
          </span>
        );
      case 'Contradictions Detected':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-800 border border-red-100">
            <AlertCircle className="h-3.5 w-3.5 text-red-600 mr-1" />
            Contradictions
          </span>
        );
      default:
        return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-700 bg-emerald-50 border-emerald-100';
    if (score >= 60) return 'text-amber-700 bg-amber-50 border-amber-100';
    return 'text-red-700 bg-red-50 border-red-100';
  };

  const handleScrollToExplore = () => {
    const el = document.getElementById('explore-msmes-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Platform statistics array
  const statsList = [
    {
      id: 'funds',
      value: '₹24,850+ Cr',
      label: 'Funds Analysed',
      icon: Coins,
      description: 'Capital flow verified across digital lending pipelines'
    },
    {
      id: 'evaluated',
      value: '48,000+',
      label: 'MSMEs Evaluated',
      icon: Building,
      description: 'Active credit readiness dossiers compiled and indexed'
    },
    {
      id: 'banks',
      value: '27',
      label: 'Partner Banks',
      icon: Building2,
      description: 'National and private banking credit desks linked'
    },
    {
      id: 'docs',
      value: '1.8 Million+',
      label: 'Financial Documents Processed',
      icon: FileSpreadsheet,
      description: 'Secure GST filings, ledger extractions and audit extracts'
    },
    {
      id: 'accuracy',
      value: '99.2%',
      label: 'Financial Verification Accuracy',
      icon: ShieldCheck,
      description: 'Absolute parity matched with federal tax & corporate registries'
    },
    {
      id: 'cards',
      value: '18,500+',
      label: 'Health Cards Generated',
      icon: Award,
      description: 'Official verified corporate rating cards authorized'
    }
  ];

  // How It Works Steps
  const howItWorksSteps = [
    {
      step: '01',
      title: 'Upload Financial Documents',
      icon: Upload,
      description: 'Securely upload 3-year Balance Sheets, P&L statements, tax receipts, and 12-month bank ledger files.'
    },
    {
      step: '02',
      title: 'AI Financial Verification',
      icon: Database,
      description: 'Our specialized Veritas and Sentinel agents parse, cross-reconcile, and verify statements against federal databases.'
    },
    {
      step: '03',
      title: 'Generate Financial Health Card',
      icon: Award,
      description: 'Instant synthesis of verified business trust scores, debt amortization schedules, and liquidity trends.'
    },
    {
      step: '04',
      title: 'Share with Banks',
      icon: ArrowUpRight,
      description: 'Download bank-ready, AES-256 certified A4 dossiers to instantly back your commercial loan application.'
    }
  ];

  // Why MSME Credence Features
  const whyCredenceFeatures = [
    {
      title: 'AI Due Diligence',
      icon: Sparkles,
      description: 'Simultaneous multi-agent auditing matches physical accounts, social security EPFO rolls, and MCA records.'
    },
    {
      title: 'Financial Health Card',
      icon: Award,
      description: 'Portable, certified index condensing liquidity ratios, solvency indicators, and growth metrics.'
    },
    {
      title: 'Evidence-backed Verification',
      icon: ShieldCheck,
      description: 'Zero manual estimation. Every ratio is tied directly to verified digital registry extractions with complete confidence.'
    },
    {
      title: 'Dependency Graph',
      icon: Layers,
      description: 'Interactive trace lineage showing precisely how raw balance sheets flow into corporate credit determinations.'
    },
    {
      title: 'Bank-ready Reports',
      icon: FileCheck2,
      description: 'Beautifully formatted, formal A4 due-diligence dossiers fully compatible with commercial underwriting requirements.'
    },
    {
      title: 'Decision Explainability',
      icon: Activity,
      description: 'Audit trails mapped through clear temporal milestones, giving credit officers absolute structural clarity.'
    }
  ];

  return (
    <div className="space-y-16" id="dashboard-landing">
      
      {/* 1. PREMIUM HERO SECTION */}
      <section className="relative bg-white border border-gray-150 rounded-3xl p-8 sm:p-12 lg:p-16 shadow-3xs overflow-hidden" id="premium-hero">
        {/* Subtle decorative grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#6366f108_1px,transparent_1px),linear-gradient(to_bottom,#6366f108_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50/30 rounded-full blur-3xl -z-10 -translate-y-12 translate-x-12"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono text-indigo-700 bg-indigo-50 border border-indigo-100">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600 animate-pulse" />
            <span>AI-POWERED MSME CREDIT ASSURANCE PLATFORM</span>
          </span>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-950 tracking-tight leading-none">
            Know Your MSME's <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-800">Financial Health</span> Before the Bank Does.
          </h1>
          
          <p className="text-sm sm:text-base text-gray-500 leading-relaxed max-w-3xl mx-auto font-medium">
            India's AI-powered Financial Health Platform helping MSMEs understand their lending readiness and helping financial institutions make evidence-driven decisions.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onNavigateToWizard}
              className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl cursor-pointer shadow-md transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center space-x-2"
              id="hero-primary-cta"
            >
              <Award className="h-4.5 w-4.5" />
              <span>Generate My MSME Health Card</span>
            </button>
            
            <button
              onClick={handleScrollToExplore}
              className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 active:bg-gray-100 rounded-xl cursor-pointer shadow-3xs transition-all duration-200 flex items-center justify-center space-x-2"
              id="hero-secondary-cta"
            >
              <Search className="h-4.5 w-4.5 text-indigo-600" />
              <span>Explore Companies</span>
            </button>
          </div>

          {/* User Role Quick Anchors */}
          <div className="pt-8 border-t border-gray-100/80 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-gray-400">
            <span className="font-mono text-[10px] uppercase tracking-wider">Explore Custom Features For:</span>
            <button 
              onClick={() => { setActivePersona('msme'); handleScrollToExplore(); }} 
              className={`hover:text-indigo-600 cursor-pointer flex items-center space-x-1 ${activePersona === 'msme' ? 'text-indigo-600' : ''}`}
            >
              <Briefcase className="h-3.5 w-3.5" />
              <span>MSME Owners</span>
            </button>
            <span className="text-gray-200">•</span>
            <button 
              onClick={() => { setActivePersona('bank'); handleScrollToExplore(); }} 
              className={`hover:text-indigo-600 cursor-pointer flex items-center space-x-1 ${activePersona === 'bank' ? 'text-indigo-600' : ''}`}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>Lending Banks</span>
            </button>
            <span className="text-gray-200">•</span>
            <button 
              onClick={() => { setActivePersona('investor'); handleScrollToExplore(); }} 
              className={`hover:text-indigo-600 cursor-pointer flex items-center space-x-1 ${activePersona === 'investor' ? 'text-indigo-600' : ''}`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Private Investors</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. TRUSTED BY SECTION */}
      <section className="space-y-4 text-center max-w-7xl mx-auto px-4" id="trusted-by-section">
        <h3 className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-widest">
          Trusted by Financial Institutions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {['IDBI', 'SBI', 'HDFC', 'ICICI', 'Axis', 'Bank of Baroda', 'Canara', 'Union Bank'].map((bank, index) => (
            <div 
              key={index}
              className="bg-white border border-gray-150 py-3.5 px-4 rounded-xl flex items-center justify-center shadow-3xs hover:border-indigo-300 hover:shadow-2xs transition-all duration-300 group cursor-default"
            >
              <span className="text-xs font-black tracking-wider text-gray-400 group-hover:text-indigo-600 transition-colors uppercase font-sans">
                {bank}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 2. PLATFORM STATISTICS SECTION */}
      <section className="space-y-6 max-w-7xl mx-auto px-4" id="platform-statistics">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-150 pb-4">
          <div>
            <h3 className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-wider block">Real-time Platform Activity</h3>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight mt-0.5">Credence Network Statistics</h2>
          </div>
          <p className="text-xs text-gray-500 font-mono">
            Audited dynamically against live ledger connections
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {statsList.map(stat => {
            const StatIcon = stat.icon;
            return (
              <div 
                key={stat.id} 
                className="bg-white border border-gray-150 rounded-2xl p-5 flex flex-col justify-between hover:shadow-xs hover:border-indigo-200 transition-all duration-300 group relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">{stat.label}</span>
                  <div className="p-1.5 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                    <StatIcon className="h-4 w-4 text-indigo-600" />
                  </div>
                </div>

                <div className="mt-4">
                  <span className="text-2xl font-mono font-extrabold text-gray-950 tracking-tight block">
                    {stat.value}
                  </span>
                  <p className="text-[10px] text-gray-400 mt-1 leading-normal">
                    {stat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="bg-gray-50/50 border border-gray-150 rounded-3xl p-8 sm:p-10 max-w-7xl mx-auto px-4 space-y-8" id="how-it-works">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-widest block">Streamlined Onboarding</span>
          <h2 className="text-2xl font-bold text-gray-950 tracking-tight">How the Verification Pipeline Works</h2>
          <p className="text-xs text-gray-500 font-medium">
            Go from unverified raw accounting disclosures to a high-fidelity credit health rating in four straightforward actions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {howItWorksSteps.map((step, index) => {
            const StepIcon = step.icon;
            return (
              <div key={index} className="bg-white border border-gray-150 rounded-2xl p-5 relative space-y-4 hover:shadow-xs transition-shadow">
                {/* Step badge */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                    STEP {step.step}
                  </span>
                  <div className="p-2 bg-gray-50 rounded-xl">
                    <StepIcon className="h-4.5 w-4.5 text-indigo-600" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-gray-900 tracking-tight leading-snug">{step.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">{step.description}</p>
                </div>

                {/* Arrow Connector on desktop */}
                {index < 3 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-3.5 -translate-y-1/2 z-20 bg-white border border-gray-150 p-1 rounded-full text-indigo-500 shadow-3xs">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. WHY MSME CREDENCE */}
      <section className="max-w-7xl mx-auto px-4 space-y-8" id="why-msme-credence">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-widest block">Core Platform Capabilities</span>
          <h2 className="text-2xl font-bold text-gray-950 tracking-tight">Why Financial Teams Trust Credence</h2>
          <p className="text-xs text-gray-500 font-medium">
            Built using multi-source cryptographic audits to ensure flawless transactional parity and speed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {whyCredenceFeatures.map((feat, index) => {
            const FeatIcon = feat.icon;
            return (
              <div 
                key={index} 
                className="bg-white border border-gray-150 hover:border-indigo-300 rounded-2xl p-5 space-y-3 transition-all duration-300 hover:shadow-xs group"
              >
                <div className="p-2.5 bg-indigo-50/50 group-hover:bg-indigo-50 rounded-xl w-fit transition-colors">
                  <FeatIcon className="h-5 w-5 text-indigo-600" />
                </div>
                
                <h4 className="text-sm font-bold text-gray-900 tracking-tight">{feat.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* INTERACTIVE PERSONA BENEFITS HUB (MSME Owners, Banks, Investors) */}
      <section className="bg-white border border-gray-150 rounded-3xl p-6 sm:p-8 max-w-7xl mx-auto px-4 space-y-6 shadow-3xs" id="persona-hub">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 gap-4">
          <div>
            <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-widest block">Custom Value Propositions</span>
            <h2 className="text-lg font-bold text-gray-950 tracking-tight mt-0.5">Who We Serve</h2>
          </div>

          {/* Persona Swapper */}
          <div className="flex bg-gray-50 border border-gray-150 p-1 rounded-xl w-fit shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setActivePersona('msme')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                activePersona === 'msme' ? 'bg-white text-indigo-600 shadow-3xs border border-gray-150' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              For MSME Owners
            </button>
            <button
              onClick={() => setActivePersona('bank')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                activePersona === 'bank' ? 'bg-white text-indigo-600 shadow-3xs border border-gray-150' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              For Banks
            </button>
            <button
              onClick={() => setActivePersona('investor')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                activePersona === 'investor' ? 'bg-white text-indigo-600 shadow-3xs border border-gray-150' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              For Investors
            </button>
          </div>
        </div>

        {/* Dynamic Persona Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          
          <div className="lg:col-span-2 space-y-4">
            {activePersona === 'msme' && (
              <div className="space-y-4 animate-fade-in">
                <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded uppercase">Verify Credit Readiness</span>
                <h3 className="text-xl font-bold text-gray-950 tracking-tight leading-snug">Optimize Your Business Financial Profile Offline Before Underwriting</h3>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  MSME owners use our secure wizard to drag-and-drop their balance sheets, GSTIN files, and bank ledgers. The AI builds a complete local simulation, identifies and flags any potential structural accounting discrepancies, and certifies your real-time debt-service capabilities.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span className="text-xs font-bold text-gray-800">No Hard Credit Pulls</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span className="text-xs font-bold text-gray-800">Identify Discrepancies Early</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span className="text-xs font-bold text-gray-800">Generate Shareable PDF Codes</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span className="text-xs font-bold text-gray-800">Verify Tax Return Matching</span>
                  </div>
                </div>
              </div>
            )}

            {activePersona === 'bank' && (
              <div className="space-y-4 animate-fade-in">
                <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded uppercase">Underwrite with Deep Assurance</span>
                <h3 className="text-xl font-bold text-gray-950 tracking-tight leading-snug">Slash MSME Turnaround Times From Weeks to Seconds</h3>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  Banking credit desks leverage Credence to run automatic forensic audits. Our multi-agent architecture verifies gross turnovers against government GSTR records, screens for duplicate invoices, checks EPFO rolls for stable employment rosters, and provides qualified evidence graphs.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span className="text-xs font-bold text-gray-800">99.2% Forensic Accuracy</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span className="text-xs font-bold text-gray-800">Interactive Lineage Graphs</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span className="text-xs font-bold text-gray-800">Printable Credit Committee Dossier</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span className="text-xs font-bold text-gray-800">Custom Risk Override Notes</span>
                  </div>
                </div>
              </div>
            )}

            {activePersona === 'investor' && (
              <div className="space-y-4 animate-fade-in">
                <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded uppercase">Capital Allocation</span>
                <h3 className="text-xl font-bold text-gray-950 tracking-tight leading-snug">Identify Verified High-Resilience Growth Targets</h3>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  Investors can browse through recently evaluated companies in our secure health directory, monitoring key leverage points, YoY compound sales trajectories, and verified trust scores. Deploy capital into assets backed by continuous tax compliance.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span className="text-xs font-bold text-gray-800">Monitor Solvency Volatilities</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span className="text-xs font-bold text-gray-800">Verified FIFO Inventory valuations</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span className="text-xs font-bold text-gray-800">Continuous EBITDA Coverage</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span className="text-xs font-bold text-gray-800">Secure AES JSON Extractions</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-50 border border-gray-150 p-5 rounded-2xl space-y-4">
            <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest block">Quick Action</span>
            <h4 className="text-sm font-bold text-gray-900 tracking-tight">Ready to verify or monitor credit?</h4>
            <p className="text-xs text-gray-500 leading-normal">
              Join thousands of Indian enterprises and underwriting institutions optimizing credit flow.
            </p>
            <div className="space-y-2 pt-1">
              <button
                onClick={onNavigateToWizard}
                className="w-full py-2 px-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer flex items-center justify-center space-x-2"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Initiate Diligence Profile</span>
              </button>
              <button
                onClick={handleScrollToExplore}
                className="w-full py-2 px-3 text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer flex items-center justify-center space-x-2"
              >
                <Search className="h-3.5 w-3.5 text-indigo-600" />
                <span>Browse Evaluated Directory</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ======================================= */}
      {/* 7. EXPLORE VERIFIED MSMES SECTION       */}
      {/* ======================================= */}
      <section className="space-y-6 pt-4 scroll-mt-20 max-w-7xl mx-auto px-4" id="explore-msmes-section">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-150 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
              <span className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-wider block">Explore Verified MSMEs</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-950 tracking-tight mt-1">Explore Verified MSMEs</h2>
            <p className="text-xs text-gray-500 mt-1 leading-normal font-medium">
              Sovereign credit hub containing deep audited ledger profiles, risk indices and real-time loan underwriting statuses.
            </p>
          </div>
          
          <div className="flex items-center space-x-3 text-right">
            <div className="hidden sm:block">
              <span className="text-[9px] font-mono font-bold text-gray-400 block uppercase">Manual review backlog</span>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 font-mono mt-0.5 inline-block">
                {pendingReviews} Pending Signoffs
              </span>
            </div>
          </div>
        </div>

        {/* Directory Stats Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-150 p-4 rounded-xl flex items-center justify-between shadow-3xs">
            <div>
              <span className="text-[10px] font-mono text-gray-400 block uppercase">Active Database Count</span>
              <span className="text-xl font-mono font-extrabold text-gray-900 mt-1 block">{companies.length} MSMEs Listed</span>
            </div>
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Building className="h-5 w-5 text-indigo-600" />
            </div>
          </div>

          <div className="bg-white border border-gray-150 p-4 rounded-xl flex items-center justify-between shadow-3xs">
            <div>
              <span className="text-[10px] font-mono text-gray-400 block uppercase">Average Verification Rating</span>
              <span className="text-xl font-mono font-extrabold text-gray-900 mt-1 block">{averageTrustScore}% Trust</span>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
            </div>
          </div>

          <div className="bg-white border border-gray-150 p-4 rounded-xl flex items-center justify-between shadow-3xs">
            <div>
              <span className="text-[10px] font-mono text-gray-400 block uppercase">Total Dossiers Processed</span>
              <span className="text-xl font-mono font-extrabold text-gray-900 mt-1 block">{totalReports} Reports</span>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <FileSpreadsheet className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Filters and Search Bar Dashboard */}
        <div className="bg-white border border-gray-150 rounded-2xl p-4 shadow-3xs flex flex-col xl:flex-row items-center justify-between gap-4">
          {/* Left search */}
          <div className="relative w-full xl:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by company name, PAN, CIN, GSTIN, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-50 font-sans bg-gray-50/35"
            />
          </div>

          {/* Right Filters List */}
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-start xl:justify-end">
            
            {/* Industry filter */}
            <div className="flex items-center space-x-1.5 border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white shadow-3xs">
              <span className="text-[10px] font-bold text-gray-400 font-mono uppercase">Industry:</span>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="text-xs font-bold text-gray-700 bg-transparent border-0 focus:ring-0 p-0 pr-6 cursor-pointer"
              >
                <option value="ALL">All Industries</option>
                {industries.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            {/* Trust Score filter */}
            <div className="flex items-center space-x-1.5 border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white shadow-3xs">
              <span className="text-[10px] font-bold text-gray-400 font-mono uppercase">Trust Score:</span>
              <select
                value={selectedTrustScoreFilter}
                onChange={(e) => setSelectedTrustScoreFilter(e.target.value)}
                className="text-xs font-bold text-gray-700 bg-transparent border-0 focus:ring-0 p-0 pr-6 cursor-pointer"
              >
                <option value="ALL">All Scores</option>
                <option value="EXCELLENT">90%+ (Excellent)</option>
                <option value="GOOD">75% - 89% (Good)</option>
                <option value="NEEDS_REVIEW">&lt; 75% (Needs Review)</option>
              </select>
            </div>

            {/* Location filter */}
            <div className="flex items-center space-x-1.5 border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white shadow-3xs">
              <span className="text-[10px] font-bold text-gray-400 font-mono uppercase">Location:</span>
              <select
                value={selectedLocationFilter}
                onChange={(e) => setSelectedLocationFilter(e.target.value)}
                className="text-xs font-bold text-gray-700 bg-transparent border-0 focus:ring-0 p-0 pr-6 cursor-pointer"
              >
                <option value="ALL">All Regions</option>
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Sort options */}
            <div className="flex items-center space-x-1.5 border border-gray-200 rounded-lg px-2.5 py-1.5 bg-indigo-50/50 border-indigo-100 shadow-3xs">
              <ArrowUpDown className="h-3.5 w-3.5 text-indigo-600 mr-0.5" />
              <span className="text-[10px] font-bold text-indigo-700 font-mono uppercase">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-black text-indigo-900 bg-transparent border-0 focus:ring-0 p-0 pr-6 cursor-pointer"
              >
                <option value="NEWEST">Newest Listed</option>
                <option value="HIGHEST_TRUST">Highest Trust</option>
                <option value="HIGHEST_REVENUE">Highest Revenue</option>
                <option value="RECENTLY_UPDATED">Recently Updated</option>
              </select>
            </div>

          </div>
        </div>

        {/* Interactive Responsive Grid Cards */}
        <div className="space-y-6">
          {sortedCompanies.length === 0 ? (
            <div className="bg-white border border-gray-150 rounded-2xl p-16 text-center text-gray-400 font-medium shadow-3xs flex flex-col items-center justify-center space-y-3">
              <HelpCircle className="h-10 w-10 text-gray-300 animate-bounce" />
              <div>
                <p className="text-gray-700 font-bold">No verified candidates match these criteria.</p>
                <p className="text-xs text-gray-400 mt-1">Try resetting selected filters or adjusting search parameters.</p>
              </div>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedStatus('ALL');
                  setSelectedIndustry('ALL');
                  setSelectedTrustScoreFilter('ALL');
                  setSelectedLocationFilter('ALL');
                  setSortBy('NEWEST');
                }}
                className="mt-2 py-1.5 px-3.5 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedCompanies.map((company) => {
                const isUnderReview = company.status === 'Under Review';
                const isContradicted = company.status === 'Contradictions Detected';
                const isVerified = company.status === 'Verified';

                return (
                  <motion.div
                    key={company.id}
                    onClick={() => onSelectCompany(company)}
                    className="relative bg-white border border-gray-150 rounded-2xl p-6 flex flex-col justify-between shadow-3xs hover:border-indigo-300 hover:shadow-xs transition-all duration-300 group cursor-pointer"
                    whileHover={{ y: -5, boxShadow: '0 12px 24px -10px rgba(99, 102, 241, 0.12)' }}
                    layout
                  >
                    <div>
                      {/* Card Top: Industry Pill & Risk Status Badge */}
                      <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-3.5 mb-4">
                        <span className="text-[10px] font-black text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md uppercase tracking-wider font-mono">
                          {company.industry}
                        </span>
                        {getStatusBadge(company.status)}
                      </div>

                      {/* Card Middle: Logo, Name, Location */}
                      <div className="flex items-start space-x-3">
                        {/* Company Logo Placeholder */}
                        <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-mono font-black text-sm uppercase shrink-0 border shadow-3xs ${getIndustryTheme(company.industry)}`}>
                          {getCompanyInitials(company.name)}
                        </div>

                        {/* Identity text */}
                        <div className="space-y-1">
                          <h3 className="font-bold text-gray-950 text-sm leading-tight tracking-tight group-hover:text-indigo-600 transition-colors duration-200">
                            {company.name}
                          </h3>
                          <div className="flex items-center text-[10px] text-gray-400 font-mono">
                            <span className="bg-gray-100 text-gray-500 px-1 py-0.2 rounded font-extrabold mr-1.5 uppercase text-[8px]">GSTIN</span>
                            {company.gstin}
                          </div>
                          {company.location && (
                            <div className="flex items-center text-xs text-gray-500 leading-none pt-0.5">
                              <MapPin className="h-3.5 w-3.5 text-gray-400 mr-1 shrink-0" />
                              <span className="font-medium">{company.location}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Stat Grid (Turnover, Loan Amount, Grade) */}
                      <div className="grid grid-cols-3 gap-2 bg-gray-50/50 border border-gray-150 rounded-xl p-3.5 mt-4 text-center">
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-mono font-bold text-gray-400 block uppercase tracking-wider">Turnover</span>
                          <span className="text-xs font-extrabold text-gray-900 block font-mono">
                            ₹{company.turnover.toFixed(1)} Cr
                          </span>
                        </div>
                        <div className="space-y-0.5 border-x border-gray-150">
                          <span className="text-[9px] font-mono font-bold text-gray-400 block uppercase tracking-wider">Loan Req.</span>
                          <span className="text-xs font-extrabold text-indigo-700 block font-mono">
                            ₹{company.loanAmount.toFixed(1)} Cr
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-mono font-bold text-gray-400 block uppercase tracking-wider">Health Grade</span>
                          <span className="text-xs font-black text-emerald-700 block font-sans">
                            {company.grade || 'A'}
                          </span>
                        </div>
                      </div>

                      {/* Trust Score Percentage Pill */}
                      <div className="mt-4 flex items-center justify-between border-b border-gray-100 pb-3">
                        <span className="text-xs font-bold text-gray-500 flex items-center">
                          <Sparkles className="h-3.5 w-3.5 text-indigo-500 mr-1 shrink-0" />
                          <span>AI Trust Score</span>
                        </span>
                        <span className={`inline-flex items-center font-mono font-extrabold text-xs px-2.5 py-0.5 rounded-full border shadow-3xs ${getScoreColor(company.trustScore)}`}>
                          {company.trustScore}%
                        </span>
                      </div>

                      {/* Short AI Summary */}
                      {company.aiSummary && (
                        <div className="bg-indigo-50/20 border border-indigo-50 p-3.5 rounded-xl text-[11px] text-gray-600 leading-relaxed font-medium mt-3.5 relative overflow-hidden group-hover:bg-indigo-50/30 transition-colors">
                          <Sparkles className="h-3.5 w-3.5 text-indigo-500 absolute -top-1.5 -right-1.5 bg-white rounded-full p-0.5 border border-indigo-100 shadow-3xs" />
                          <span className="line-clamp-3 italic">"{company.aiSummary}"</span>
                        </div>
                      )}
                    </div>

                    {/* Card Footer: Last Updated and Action Button */}
                    <div className="border-t border-gray-100 pt-4 mt-5 flex items-center justify-between">
                      <div className="flex items-center text-[10px] text-gray-400 font-mono">
                        <Calendar className="h-3.5 w-3.5 text-gray-400 mr-1" />
                        <span>Updated: {company.lastUpdated || 'Recently'}</span>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCompany(company);
                        }}
                        className="py-1.5 px-3 text-xs font-extrabold text-indigo-600 bg-white border border-indigo-100 hover:border-indigo-500 hover:bg-indigo-50 active:bg-indigo-100 rounded-lg cursor-pointer transition-all duration-200 flex items-center space-x-1 shadow-3xs"
                      >
                        <span>View Profile</span>
                        <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
