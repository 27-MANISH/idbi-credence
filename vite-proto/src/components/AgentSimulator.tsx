/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, Shield, RefreshCw, CheckCircle2, AlertTriangle, XCircle,
  ArrowRight, Loader2, Play, Pause, FastForward, Cpu, Sparkles, 
  Search, Database, FileText, Globe, Scale, BookOpen, AlertCircle,
  Fingerprint, Activity, Clock
} from 'lucide-react';

interface AgentSimulatorProps {
  companyName: string;
  onSimulationComplete: () => void;
}

export default function AgentSimulator({ companyName, onSimulationComplete }: AgentSimulatorProps) {
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1); // 1x, 2x, 5x, 15x
  const [logs, setLogs] = useState<string[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // 1. Documents configuration
  const initialDocs = [
    { id: 'doc-1', name: 'Audited P&L Statement (3 Years)', file: 'Audited_PL_FY24-FY26.pdf', size: '3.1 MB', target: 8, status: 'idle' },
    { id: 'doc-2', name: 'Signed Balance Sheet Extracts', file: 'BS_3Yr_Signed_Extract.pdf', size: '5.2 MB', target: 14, status: 'idle' },
    { id: 'doc-3', name: 'Consolidated Cash Flow Statements', file: 'CashFlow_Statement_Reconciled.pdf', size: '2.0 MB', target: 18, status: 'idle' },
    { id: 'doc-4', name: 'GST Returns (GSTR-1 & GSTR-3B)', file: 'GST_All_Months_FY26.pdf', size: '14.2 MB', target: 22, status: 'idle' },
    { id: 'doc-5', name: 'Bank Statement Ledger (12 Months)', file: 'BOB_CA_Statement_FY26.pdf', size: '28.5 MB', target: 25, status: 'idle' }
  ];

  // 2. Agents configuration
  const agentSpecs = [
    {
      id: 'sentinel',
      name: 'Sentinel',
      title: 'Financial Integrity Agent',
      icon: Shield,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
      progressColor: 'bg-indigo-600',
      startPct: 25,
      endPct: 55,
      idleStatus: 'Waiting for Document Parsing...',
      stages: [
        { upTo: 35, text: 'Reading Financial Statements...' },
        { upTo: 48, text: 'Extracting EBITDA & PAT Trends...' },
        { upTo: 55, text: 'Calculating Financial Health Ratios...' },
        { upTo: 100, text: 'Ready: Financial Integrity Assessed' }
      ]
    },
    {
      id: 'veritas',
      name: 'Veritas',
      title: 'Cross Verification Agent',
      icon: Fingerprint,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      progressColor: 'bg-emerald-600',
      startPct: 30,
      endPct: 62,
      idleStatus: 'Waiting for Sentinel Signals...',
      stages: [
        { upTo: 40, text: 'Comparing GSTR-3B with General Ledger...' },
        { upTo: 52, text: 'Verifying Invoiced Sales Matches...' },
        { upTo: 62, text: 'Cross-checking Bank Ledger Debits...' },
        { upTo: 100, text: 'Ready: Cross-Claims Verified' }
      ]
    },
    {
      id: 'candor',
      name: 'Candor',
      title: 'Business Reality Agent',
      icon: BookOpen,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
      progressColor: 'bg-amber-600',
      startPct: 35,
      endPct: 67,
      idleStatus: 'Waiting for Statement Extraction...',
      stages: [
        { upTo: 45, text: 'Parsing Accounting Notes disclosures...' },
        { upTo: 58, text: 'Reading Auditor Qualified Opinions...' },
        { upTo: 67, text: 'Synthesizing Management Business Narrative...' },
        { upTo: 100, text: 'Ready: Corporate Story Synthesized' }
      ]
    },
    {
      id: 'oracle',
      name: 'Oracle',
      title: 'Decision Intelligence Agent',
      icon: Sparkles,
      color: 'text-rose-600 bg-rose-50 border-rose-100',
      progressColor: 'bg-rose-600',
      startPct: 45,
      endPct: 70,
      idleStatus: 'Waiting for Agent Sign-offs...',
      stages: [
        { upTo: 55, text: 'Aggregating Multi-Agent Signal Weights...' },
        { upTo: 65, text: 'Constructing Credit Risk Matrices...' },
        { upTo: 70, text: 'Formulating final loan compliance recommendation...' },
        { upTo: 100, text: 'Ready: Credit Recommendation Generated' }
      ]
    }
  ];

  // 3. Online Verification Checkpoints
  const onlineCheckpoints = [
    {
      id: 'mca',
      name: 'Searching MCA Database',
      icon: Database,
      startPct: 70,
      endPct: 75,
      status: 'idle', // 'idle' | 'searching' | 'Verified' | 'Needs Manual Review' | 'Contradicted'
      output: 'Active standing. CIN: U27200MH2015PLC261542. Registered capital: ₹5.0 Cr. Paid-up capital: ₹4.8 Cr. Directors\' KYC fully validated.'
    },
    {
      id: 'gst',
      name: 'Searching GST Records',
      icon: FileText,
      startPct: 73,
      endPct: 79,
      status: 'idle',
      output: 'Active registration status. GSTIN: 27AAACK4821D1Z4. High compliance score. Regular filing history for the past 36 consecutive tax periods.'
    },
    {
      id: 'news',
      name: 'Searching News Sources',
      icon: Globe,
      startPct: 77,
      endPct: 83,
      status: 'idle',
      output: 'Found press release regarding a resolved labor dispute with a subcontracted manufacturing team in Dec 2025. Standard resolution complete.'
    },
    {
      id: 'litigation',
      name: 'Searching Litigation Records',
      icon: Scale,
      startPct: 80,
      endPct: 87,
      status: 'idle',
      output: '1 active commercial contract value adjustment case under mediation in Mumbai High Court. Total value low (₹12 Lakh). No statutory defaults.'
    },
    {
      id: 'regulatory',
      name: 'Searching Regulatory Databases',
      icon: Shield,
      startPct: 84,
      endPct: 91,
      status: 'idle',
      output: 'Zero defaults found across major credit bureaus (CIBIL: 785/900). EPF contributions paid-to-date for 62 employees. No statutory liens.'
    },
    {
      id: 'prev-filings',
      name: 'Searching Previous Filings',
      icon: Clock,
      startPct: 88,
      endPct: 95,
      status: 'idle',
      output: 'Audited statements for FY24 and FY25 verified. Signatures certified. Internal growth margins match historical registry disclosures perfectly.'
    }
  ];

  // System Logs Timeline mapped to progress values
  const logMoments = [
    { pct: 1, text: `[SYSTEM] [BOOTSTRAP] Initiating Credence Dual-Engine Due Diligence workflow for '${companyName}'...` },
    { pct: 3, text: '[SYSTEM] [DEEP_PARSE] Loading PDF scanning matrices into memory vault...' },
    { pct: 5, text: '[OCR] Calibrating text-alignment anchors & bounding boxes...' },
    { pct: 8, text: '[SUCCESS] Balance Sheet Parsed: Extracted 38 structural nodes from PDF scans.' },
    { pct: 12, text: '[OCR] Reconciling ledger account names with Standard Accounting taxonomy...' },
    { pct: 14, text: '[SUCCESS] Cash Flow Analysed: Operating cash flows reconcile with reported operating income.' },
    { pct: 18, text: '[INFO] Inventory Growth Detected: Checked 14.2% YoY increase in raw material stocks.' },
    { pct: 21, text: '[SUCCESS] GST Records Compared: GSTR-3B tax returns match reported general ledger revenues.' },
    { pct: 24, text: '[SUCCESS] Bank Statement Parsed: Indexed 12-month transaction volumes from BOB Corporate Account.' },
    { pct: 25, text: '[SYSTEM] [AGENT_BOOT] Document Parsing completed. Handing over to Autonomous AI Agents.' },
    { pct: 27, text: '[AGENT: Sentinel] Activating Financial Statements parser...' },
    { pct: 30, text: '[AGENT: Veritas] Booting GSTR/ledger cross-reconciliation thread...' },
    { pct: 33, text: '[AGENT: Candor] Reading Accounting Disclosures and Auditor Reports...' },
    { pct: 36, text: '[SUCCESS] Historical Filing Found: Matched directors KYC with MCA corporate filing history.' },
    { pct: 40, text: '[AGENT: Sentinel] Calculating EBITDA, operating margins, and profit ratios...' },
    { pct: 43, text: '[AGENT: Veritas] Cross-referencing monthly bank statement deposits with GSTR-1 invoices...' },
    { pct: 47, text: '[AGENT: Candor] Extracting auditor qualified opinions. Flagged: 0 qualifications found.' },
    { pct: 51, text: '[AGENT: Oracle] Monitoring multi-agent audit streams...' },
    { pct: 55, text: '[SUCCESS] Financial Ratios Calculated: DSCR 1.76x, Debt/Equity 0.88x, Current Ratio 1.52x computed.' },
    { pct: 59, text: '[AGENT: Veritas] Verifying cash collections against trade receivables registers...' },
    { pct: 63, text: '[AGENT: Candor] Formulating company scale & operational risk narrative...' },
    { pct: 67, text: '[SUCCESS] Evidence Graph Updated: Linked 62 relational validation points.' },
    { pct: 70, text: '[SYSTEM] [ONLINE_SCRAPE] Autonomous Agent analysis concluded. Beginning deep public database verification.' },
    { pct: 72, text: '[ONLINE] Querying MCA Corporate Directory using company CIN...' },
    { pct: 75, text: '[SUCCESS] MCA Search Complete: Active standing, registered directors matched.' },
    { pct: 77, text: '[ONLINE] Querying GSTIN tax history registry...' },
    { pct: 80, text: '[SUCCESS] GST Search Complete: Regular 3-year filing history verified. No default flags.' },
    { pct: 82, text: '[ONLINE] Executing semantic search over 1,200 financial news & industry outlets...' },
    { pct: 85, text: '[SUCCESS] News Scraping Complete: Found minor trademark contract dispute in Dec 2025.' },
    { pct: 87, text: '[ONLINE] Querying litigation databases & district court registers...' },
    { pct: 89, text: '[SUCCESS] Litigation Search Complete: Trademark contract case resolved. No severe credit liability.' },
    { pct: 90, text: '[INFO] Trust Score Recalculated: Current metrics yields 88% credit compliance standing.' },
    { pct: 92, text: '[ONLINE] Scanning EPFO, CIBIL, and regulatory default rosters...' },
    { pct: 94, text: '[SUCCESS] Regulatory Scans Complete: Standard commercial standing. Zero default files found.' },
    { pct: 96, text: '[SUCCESS] Decision Draft Created: Generated credit-officer dashboard recommendation.' },
    { pct: 98, text: '[SYSTEM] Compiling final Credence Due Diligence Audit Dossier...' },
    { pct: 100, text: '[SUCCESS] System Audit Concluded. Due Diligence workspace generated with 88% Trust Score.' }
  ];

  // Core ticker loop
  useEffect(() => {
    if (!isPlaying) return;

    const tickInterval = 65; // base ms per tick
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        
        // Progress speed based on active phase to make it feel cinematic
        let increment = 1;
        if (prev < 25) {
          increment = 0.8; // Document parsing is detailed
        } else if (prev < 70) {
          increment = 0.5; // Agent reasoning is complex and slow
        } else if (prev < 95) {
          increment = 0.7; // Web search is snappy but steady
        } else {
          increment = 1.2; // Fast wrap up
        }

        const nextProgress = Math.min(100, prev + increment * speedMultiplier);
        return parseFloat(nextProgress.toFixed(1));
      });

      setElapsedTime(prev => prev + (tickInterval / 1000) * speedMultiplier);
    }, tickInterval);

    return () => clearInterval(interval);
  }, [isPlaying, speedMultiplier]);

  // Feed logs depending on progress
  useEffect(() => {
    const activeLogs = logMoments
      .filter(m => m.pct <= progress)
      .map(m => m.text);
    
    // Add custom dynamic logs for exact progress points so the terminal always scrolls beautifully
    setLogs(activeLogs);
  }, [progress]);

  // Scroll terminal to bottom when logs update
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Quick helper to skip or control simulation
  const handleSkip = () => {
    setProgress(100);
  };

  const handleSpeedChange = () => {
    if (speedMultiplier === 1) setSpeedMultiplier(2);
    else if (speedMultiplier === 2) setSpeedMultiplier(4);
    else if (speedMultiplier === 4) setSpeedMultiplier(10);
    else setSpeedMultiplier(1);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6" id="agent-simulation-container">
      
      {/* Simulation Header Cockpit */}
      <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-xl p-6 relative overflow-hidden">
        {/* Futuristic Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl animate-pulse">
              <Cpu className="h-7 w-7 text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30 uppercase tracking-wider">
                  Live Engine Pipeline
                </span>
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
              </div>
              <h2 className="text-xl font-bold tracking-tight mt-1">Executing Real-Time AI Due Diligence</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Parsing structures, cross-verifying registries, and weight-balancing signals for <strong className="text-white">{companyName}</strong>
              </p>
            </div>
          </div>

          {/* Interactive Control Deck */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Elapsed Time Counter */}
            <div className="bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center space-x-2">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-[11px] font-mono text-slate-300">Elapsed:</span>
              <span className="text-[11px] font-mono font-bold text-indigo-400">{elapsedTime.toFixed(1)}s</span>
            </div>

            {/* Speed Multiplier Button */}
            <button
              onClick={handleSpeedChange}
              className="bg-slate-950/80 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center space-x-2 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
              title="Speed up simulation time"
            >
              <FastForward className="h-3.5 w-3.5 text-amber-400" />
              <span>{speedMultiplier}x Speed</span>
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-slate-950/80 hover:bg-slate-800 p-1.5 rounded-lg border border-slate-800 text-slate-300 transition-colors cursor-pointer"
              title={isPlaying ? 'Pause simulation' : 'Resume simulation'}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 text-emerald-400" />}
            </button>

            {/* Skip Button */}
            <button
              onClick={handleSkip}
              className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors cursor-pointer shadow-sm flex items-center space-x-1"
            >
              <span>Instant Finish</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            {/* Huge numeric readout */}
            <div className="bg-indigo-950/50 px-4 py-1.5 rounded-lg border border-indigo-500/20 text-center min-w-[70px]">
              <span className="text-xl font-mono font-bold text-indigo-300">{progress}%</span>
            </div>
          </div>
        </div>

        {/* Global Progress Track */}
        <div className="mt-6 relative">
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div 
              className="bg-indigo-500 h-full rounded-full transition-all duration-100 ease-out shadow-[0_0_8px_rgba(99,102,241,0.5)]" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Sequential Phase Steps */}
          <div className="grid grid-cols-4 text-center mt-2.5 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            <div className={progress >= 25 ? 'text-indigo-300 font-bold' : 'text-slate-500'}>
              01. Doc Parsing
            </div>
            <div className={progress >= 70 ? 'text-indigo-300 font-bold' : progress >= 25 ? 'text-slate-300' : 'text-slate-500'}>
              02. AI Agent Audit
            </div>
            <div className={progress >= 95 ? 'text-indigo-300 font-bold' : progress >= 70 ? 'text-slate-300' : 'text-slate-500'}>
              03. Online Scrapes
            </div>
            <div className={progress >= 100 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
              04. Dossier Done
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns - Steps & Agent Cockpits */}
        <div className="lg:col-span-2 space-y-6">

          {/* STEP 1: DOCUMENT PARSING WORKSPACE */}
          <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-2xs relative overflow-hidden" id="parsing-workspace-card">
            {/* Soft scan background overlay if actively parsing */}
            {progress < 25 && (
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500/20 via-indigo-500 to-indigo-500/20 animate-[pulse_2s_infinite]"></div>
            )}
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <div className="flex items-center space-x-2.5">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-indigo-50 text-indigo-600 font-mono text-xs font-bold border border-indigo-100">1</span>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 tracking-tight">Step 1: Document Parsing & Matrix Alignment</h3>
                  <p className="text-[11px] text-gray-500">Scanning uploaded source files for semantic cell variables & metadata</p>
                </div>
              </div>
              
              {/* Dynamic Status Badging */}
              {progress >= 25 ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> PARSING COMPLETE
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 animate-pulse">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" /> ACTIVE EXTRACTOR
                </span>
              )}
            </div>

            {/* Document Cards List */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {initialDocs.map(doc => {
                const isParsed = progress >= doc.target;
                const isCurrent = progress < doc.target && (progress >= doc.target - 5 || (doc.id === 'doc-1' && progress > 0));
                
                let cardStyles = 'border-gray-100 bg-gray-50/50 opacity-60';
                let textStyles = 'text-gray-400';
                let progressWidth = 'w-0';

                if (isParsed) {
                  cardStyles = 'border-emerald-200 bg-emerald-50/10 opacity-100';
                  textStyles = 'text-gray-700';
                  progressWidth = 'w-full';
                } else if (isCurrent) {
                  cardStyles = 'border-indigo-200 bg-indigo-50/10 opacity-100 ring-2 ring-indigo-50';
                  textStyles = 'text-gray-900 font-medium';
                  // Map progress inside parsing step to progress bar
                  const percentage = Math.min(100, Math.max(0, ((progress - (doc.target - 5)) / 5) * 100));
                  progressWidth = `${percentage}%`;
                }

                return (
                  <div key={doc.id} className={`border p-3 rounded-xl flex flex-col justify-between min-h-[105px] transition-all duration-300 relative overflow-hidden ${cardStyles}`}>
                    {/* Laser scanning line overlay for currently processing doc */}
                    {isCurrent && (
                      <div className="absolute inset-x-0 h-0.5 bg-indigo-500 shadow-[0_0_5px_#6366f1] animate-[bounce_2s_infinite]"></div>
                    )}
                    
                    <div className="space-y-1">
                      <div className="flex items-start justify-between">
                        <FileText className={`h-4 w-4 ${isParsed ? 'text-emerald-600' : isCurrent ? 'text-indigo-600' : 'text-gray-300'}`} />
                        {isParsed && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                        {isCurrent && <Loader2 className="h-3.5 w-3.5 text-indigo-600 animate-spin" />}
                      </div>
                      <h4 className={`text-[10px] leading-tight font-semibold line-clamp-2 mt-1 ${textStyles}`}>{doc.name}</h4>
                    </div>

                    <div className="mt-2">
                      <div className="flex items-center justify-between text-[8px] font-mono text-gray-400">
                        <span>{doc.file.slice(0, 11)}...</span>
                        <span>{doc.size}</span>
                      </div>
                      
                      {/* Mini custom progress indicator */}
                      <div className="w-full bg-gray-150 h-1 rounded-full mt-1 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-100 ${isParsed ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                          style={{ width: progressWidth }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 2: AUTONOMOUS AI AGENTS WORKSPACE */}
          <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-2xs" id="agents-workspace-card">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <div className="flex items-center space-x-2.5">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-indigo-50 text-indigo-600 font-mono text-xs font-bold border border-indigo-100">2</span>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 tracking-tight">Step 2: Initializing Autonomous AI Agents</h3>
                  <p className="text-[11px] text-gray-500">Four professional agents reading statements, running checks, and modeling risks</p>
                </div>
              </div>

              {/* Badging */}
              {progress >= 70 ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> ANALYSIS CONCLUDED
                </span>
              ) : progress >= 25 ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 animate-pulse">
                  <Activity className="h-3 w-3 mr-1 animate-pulse" /> AGENTS WORKING
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-gray-100 text-gray-500 border border-gray-200">
                  AWAITING AGENT START
                </span>
              )}
            </div>

            {/* 4 Agent Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agentSpecs.map(agent => {
                const AgentIcon = agent.icon;
                const hasStarted = progress >= agent.startPct;
                const isFinished = progress >= agent.endPct;
                const isActive = hasStarted && !isFinished;

                // Calculate Agent's local progress (0 to 100%)
                let localProgress = 0;
                if (isFinished) {
                  localProgress = 100;
                } else if (isActive) {
                  const range = agent.endPct - agent.startPct;
                  const currentOffset = progress - agent.startPct;
                  localProgress = Math.round((currentOffset / range) * 100);
                }

                // Determine active text based on progress
                let statusText = agent.idleStatus;
                if (isActive) {
                  const matchingStage = agent.stages.find(s => progress <= s.upTo);
                  statusText = matchingStage ? matchingStage.text : agent.stages[agent.stages.length - 1].text;
                } else if (isFinished) {
                  statusText = agent.stages[agent.stages.length - 1].text;
                }

                let cardStyle = 'border-gray-100 bg-gray-50/30 opacity-60';
                let iconStyle = 'text-gray-400 bg-gray-100 border-gray-250';
                
                if (isFinished) {
                  cardStyle = 'border-emerald-200 bg-emerald-50/5 opacity-100 shadow-3xs';
                  iconStyle = 'text-emerald-600 bg-emerald-50 border-emerald-100';
                } else if (isActive) {
                  cardStyle = 'border-indigo-200 bg-indigo-50/5 opacity-100 shadow-sm ring-2 ring-indigo-500/5';
                  iconStyle = agent.color;
                }

                return (
                  <div key={agent.id} className={`border rounded-xl p-4 transition-all duration-300 relative ${cardStyle}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2.5 rounded-lg border ${iconStyle}`}>
                          <AgentIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-gray-900 tracking-tight">{agent.name}</h4>
                          <p className="text-[10px] font-mono text-gray-500">{agent.title}</p>
                        </div>
                      </div>

                      {/* Right top status */}
                      {isFinished ? (
                        <span className="flex h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 items-center justify-center">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </span>
                      ) : isActive ? (
                        <div className="flex items-center space-x-1.5 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping"></span>
                          <span className="text-[9px] font-mono font-bold text-indigo-700 uppercase">RUNNING</span>
                        </div>
                      ) : (
                        <span className="text-[9px] font-mono text-gray-400 uppercase">STANDBY</span>
                      )}
                    </div>

                    {/* Agent Status Statement */}
                    <div className="mt-3.5 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className={`font-medium ${isActive ? 'text-indigo-600' : isFinished ? 'text-gray-700' : 'text-gray-400'}`}>
                          {statusText}
                        </span>
                        <span className="font-mono text-xs font-bold text-gray-700">{localProgress}%</span>
                      </div>

                      {/* Agent local progress bar */}
                      <div className="w-full bg-gray-150 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-100 ${isFinished ? 'bg-emerald-500' : agent.progressColor}`}
                          style={{ width: `${localProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 3: LIVE ONLINE VERIFICATION GRID */}
          <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-2xs" id="online-verification-card">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <div className="flex items-center space-x-2.5">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-indigo-50 text-indigo-600 font-mono text-xs font-bold border border-indigo-100">3</span>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 tracking-tight">Step 3: Deep Online Database Registry Scrapes</h3>
                  <p className="text-[11px] text-gray-500">Live checks querying statutory regulatory bodies, litigation indexes, and news registries</p>
                </div>
              </div>

              {/* Status Indicator */}
              {progress >= 95 ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> CHECKS COMPLETED
                </span>
              ) : progress >= 70 ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                  <Search className="h-3 w-3 mr-1 animate-pulse" /> SCANNING WEBSITES
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-gray-100 text-gray-500 border border-gray-200">
                  AWAITING LIVE SCRAPE
                </span>
              )}
            </div>

            {/* Scrapers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {onlineCheckpoints.map(check => {
                const CheckIcon = check.icon;
                const hasStarted = progress >= check.startPct;
                const isResolved = progress >= check.endPct;
                
                // Assign status
                let resolvedStatus = 'idle';
                let cardStyle = 'border-gray-100 bg-gray-50/30 opacity-60';
                let iconStyle = 'text-gray-400 bg-gray-100';

                if (isResolved) {
                  // Specific realistic outputs
                  if (check.id === 'news' || check.id === 'litigation') {
                    resolvedStatus = 'Needs Manual Review';
                    cardStyle = 'border-amber-200 bg-amber-50/5 opacity-100 shadow-3xs';
                    iconStyle = 'text-amber-600 bg-amber-50 border-amber-100';
                  } else {
                    resolvedStatus = 'Verified';
                    cardStyle = 'border-emerald-200 bg-emerald-50/5 opacity-100 shadow-3xs';
                    iconStyle = 'text-emerald-600 bg-emerald-50 border-emerald-100';
                  }
                } else if (hasStarted) {
                  resolvedStatus = 'searching';
                  cardStyle = 'border-indigo-200 bg-indigo-50/10 opacity-100 ring-2 ring-indigo-50';
                  iconStyle = 'text-indigo-600 bg-indigo-50 border-indigo-100';
                }

                return (
                  <div key={check.id} className={`border rounded-xl p-3.5 flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${cardStyle}`}>
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className={`p-1.5 rounded-md border ${iconStyle}`}>
                            <CheckIcon className="h-4 w-4" />
                          </div>
                          <span className="text-xs font-bold text-gray-900 tracking-tight">{check.name}</span>
                        </div>

                        {/* Status Badging */}
                        {resolvedStatus === 'Verified' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="h-2.5 w-2.5 mr-1" /> VERIFIED
                          </span>
                        )}
                        {resolvedStatus === 'Needs Manual Review' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-100 text-amber-800">
                            <AlertTriangle className="h-2.5 w-2.5 mr-1" /> REVIEW REQUIRED
                          </span>
                        )}
                        {resolvedStatus === 'searching' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-indigo-100 text-indigo-800 animate-pulse">
                            <Loader2 className="h-2.5 w-2.5 mr-1 animate-spin" /> SEARCHING
                          </span>
                        )}
                        {resolvedStatus === 'idle' && (
                          <span className="text-[9px] font-mono text-gray-400 font-semibold tracking-wider">AWAITING</span>
                        )}
                      </div>

                      {/* Mocked Output Data Details */}
                      <div className="mt-3 bg-gray-50/80 p-2 rounded-lg border border-gray-100">
                        {resolvedStatus === 'idle' ? (
                          <p className="text-[10px] font-mono text-gray-400 italic">No query established yet.</p>
                        ) : resolvedStatus === 'searching' ? (
                          <div className="flex items-center space-x-2 py-1.5">
                            <Loader2 className="h-3 w-3 text-indigo-500 animate-spin" />
                            <p className="text-[10px] font-mono text-indigo-500 animate-pulse">Connecting API and fetching registry index...</p>
                          </div>
                        ) : (
                          <p className="text-[10px] font-mono text-gray-600 leading-normal">
                            {check.output}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column - Execution Logs Terminal */}
        <div className="lg:col-span-1 flex flex-col min-h-[400px]">
          <div className="bg-slate-900 border border-slate-950 rounded-2xl overflow-hidden shadow-xl flex-1 flex flex-col h-full">
            {/* Terminal Tab Header */}
            <div className="px-4 py-3 bg-slate-950 flex items-center justify-between border-b border-slate-950">
              <div className="flex items-center space-x-2">
                <Terminal className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-mono font-semibold text-slate-300">credence_engine_runtime.log</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-bold">STREAMING</span>
              </div>
            </div>

            {/* Logs Window */}
            <div className="p-4 flex-1 overflow-y-auto font-mono text-[11px] space-y-2 bg-slate-950/40 text-slate-300 h-[500px]">
              {logs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500 italic">
                  Initializing compilation logs...
                </div>
              ) : (
                logs.map((log, index) => {
                  let textClass = 'text-slate-300';
                  
                  if (log.includes('[SUCCESS]')) {
                    textClass = 'text-emerald-400 font-semibold';
                  } else if (log.includes('[WARNING]') || log.includes('REVIEW REQUIRED')) {
                    textClass = 'text-amber-400 font-semibold';
                  } else if (log.includes('[ERROR]') || log.includes('CONTRADICTED')) {
                    textClass = 'text-rose-400 font-semibold';
                  } else if (log.includes('[AGENT:')) {
                    textClass = 'text-indigo-300';
                  } else if (log.includes('[ONLINE]')) {
                    textClass = 'text-cyan-300';
                  }

                  return (
                    <div key={index} className={`leading-relaxed border-l-2 pl-2 border-slate-800 hover:border-indigo-500/50 transition-colors ${textClass}`}>
                      <span className="text-slate-500 mr-1 text-[10px]">[{new Date().toISOString().slice(11, 19)}]</span>
                      {log}
                    </div>
                  );
                })
              )}
              <div ref={terminalEndRef} />
            </div>

            {/* Terminal Footer status readouts */}
            <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-900 text-[10px] font-mono text-slate-500 flex justify-between">
              <span>Lines: {logs.length}</span>
              <span>Memory Buffer: OK</span>
            </div>
          </div>
        </div>

      </div>

      {/* STEP 4: COMPILING DOSSIER AND FINAL SIGN-OFF */}
      {progress === 100 && (
        <div className="p-6 border border-emerald-100 rounded-2xl bg-emerald-50/20 text-center space-y-4 shadow-sm animate-fade-in" id="simulation-completed-banner">
          <div className="inline-flex p-3 bg-emerald-100/60 rounded-full text-emerald-600 mx-auto">
            <Shield className="h-8 w-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-gray-900">Credence AI Compilation Complete</h3>
            <p className="text-sm text-gray-500 max-w-2xl mx-auto">
              IDBI Credence has integrated all uploaded artifacts, scanned public registries, and compiled a Trust Score of <strong className="text-indigo-600 text-base font-bold">88%</strong> for {companyName}.
            </p>
          </div>

          <div className="max-w-md mx-auto grid grid-cols-3 gap-4 py-2 border-y border-gray-100 my-2">
            <div>
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wide block">Trust Assessment</span>
              <span className="text-lg font-bold text-emerald-600 font-mono">88 / 100</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wide block">Data Points Scanned</span>
              <span className="text-lg font-bold text-gray-800 font-mono">62 Nodes</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wide block">Verification Index</span>
              <span className="text-lg font-bold text-gray-800 font-mono">High Quality</span>
            </div>
          </div>

          <button
            onClick={onSimulationComplete}
            className="inline-flex items-center space-x-2 px-8 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition-colors cursor-pointer shadow-sm font-sans"
          >
            <span>Enter Audit Workspace</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
