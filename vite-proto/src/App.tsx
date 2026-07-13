/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { mockCompanies as baselineCompanies } from './data/mockCompanies';
import { Company, DocumentInfo } from './types';
import Dashboard from './components/Dashboard';
import NewDiligenceWizard from './components/NewDiligenceWizard';
import AgentSimulator from './components/AgentSimulator';
import CompanyProfile from './components/CompanyProfile';
import { Landmark, ShieldAlert, Cpu, CheckCircle2, CircleDot, User, HelpCircle } from 'lucide-react';

export default function App() {
  const [companies, setCompanies] = useState<Company[]>(baselineCompanies);
  const [activePage, setActivePage] = useState<'dashboard' | 'wizard' | 'simulator' | 'workspace'>('dashboard');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  
  // Temporary state for the company currently undergoing simulator audit
  const [pendingCompanyName, setPendingCompanyName] = useState('');
  const [pendingCompanyData, setPendingCompanyData] = useState<any>(null);

  // Quick action to add a newly simulated company to the active list
  const handleSimulationFinished = () => {
    if (!pendingCompanyData) return;

    const tTurnover = parseFloat(pendingCompanyData.turnover) || 25.0;
    const tLoan = parseFloat(pendingCompanyData.loanAmount) || 3.0;

    // Generate realistic historical financial metrics based on the user's input
    const generatedMetrics = [
      {
        year: 'FY24',
        turnover: parseFloat((tTurnover * 0.8).toFixed(1)),
        ebitda: parseFloat((tTurnover * 0.8 * 0.12).toFixed(2)),
        pat: parseFloat((tTurnover * 0.8 * 0.06).toFixed(2)),
        debtEquity: 1.15,
        dscr: 1.42,
        currentRatio: 1.35
      },
      {
        year: 'FY25',
        turnover: parseFloat((tTurnover * 0.9).toFixed(1)),
        ebitda: parseFloat((tTurnover * 0.9 * 0.13).toFixed(2)),
        pat: parseFloat((tTurnover * 0.9 * 0.065).toFixed(2)),
        debtEquity: 1.02,
        dscr: 1.55,
        currentRatio: 1.42
      },
      {
        year: 'FY26',
        turnover: tTurnover,
        ebitda: parseFloat((tTurnover * 0.14).toFixed(2)),
        pat: parseFloat((tTurnover * 0.07).toFixed(2)),
        debtEquity: 0.88,
        dscr: 1.76,
        currentRatio: 1.52
      }
    ];

    // Build the finalized company dossier structure
    const newCompany: Company = {
      id: `comp-${Date.now()}`,
      name: pendingCompanyData.companyName,
      gstin: pendingCompanyData.gstin || '27AAACK4821D1Z4',
      pan: pendingCompanyData.pan || 'AAACK4821D',
      cin: pendingCompanyData.cin || 'U27200MH2015PLC261542',
      industry: pendingCompanyData.industry || 'Manufacturing',
      turnover: tTurnover,
      loanAmount: tLoan,
      existingBank: pendingCompanyData.existingBank || 'None',
      purpose: pendingCompanyData.purpose || 'General working capital requirements',
      trustScore: 88,
      status: 'Under Review',
      verifiedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      decision: 'PENDING',
      reviewerNotes: 'AI audit completed with 88% overall confidence rating. Matching margins found on GSTR-3B filings against audited general ledger revenue streams. Debt service limits are safe. Ready for secondary manual sign-off.',
      metrics: generatedMetrics,
      documents: [
        { name: 'Balance Sheet (3 years)', category: 'Mandatory', uploaded: true, status: 'Verified', fileName: 'BS_3Yr_Signed_Extract.pdf', fileSize: '5.2 MB', lastChecked: 'Just Now' },
        { name: 'Profit & Loss Statement', category: 'Mandatory', uploaded: true, status: 'Verified', fileName: 'Audited_PL_FY24-FY26.pdf', fileSize: '3.1 MB', lastChecked: 'Just Now' },
        { name: 'Cash Flow Statement', category: 'Mandatory', uploaded: true, status: 'Verified', fileName: 'CashFlow_Statement_Reconciled.pdf', fileSize: '2.0 MB', lastChecked: 'Just Now' },
        { name: 'GST Returns (GSTR-1 & 3B)', category: 'Mandatory', uploaded: true, status: 'Verified', fileName: 'GST_All_Months_FY26.pdf', fileSize: '14.2 MB', lastChecked: 'Just Now' },
        { name: 'Bank Statements (12 months)', category: 'Mandatory', uploaded: true, status: 'Verified', fileName: 'BOB_CA_Statement_FY26.pdf', fileSize: '28.5 MB', lastChecked: 'Just Now' },
        { name: 'Income Tax Returns (ITR-6)', category: 'Mandatory', uploaded: true, status: 'Verified', fileName: 'ITR6_Receipt.pdf', fileSize: '4.8 MB', lastChecked: 'Just Now' },
        { name: 'Auditor Report', category: 'Mandatory', uploaded: true, status: 'Verified', fileName: 'Auditors_Report.pdf', fileSize: '1.2 MB', lastChecked: 'Just Now' },
        { name: 'Notes to Accounts', category: 'Mandatory', uploaded: true, status: 'Verified', fileName: 'Accounting_Disclosures.pdf', fileSize: '6.1 MB', lastChecked: 'Just Now' },
        { name: 'Existing Loan Details', category: 'Mandatory', uploaded: true, status: 'Verified', fileName: 'Baroda_Term_Sanction.pdf', fileSize: '1.9 MB', lastChecked: 'Just Now' },
        { name: 'Directors KYC & PAN', category: 'Mandatory', uploaded: true, status: 'Verified', fileName: 'KYC_Pack_Directors.pdf', fileSize: '3.2 MB', lastChecked: 'Just Now' }
      ],
      auditLogs: [
        { id: `log-${Date.now()}-1`, type: 'success', category: 'Revenue Integrity', message: 'GST sales trace well with P&L billing cycle.', evidence: `GSTR-3B total tax matched reported turnover of ₹${tTurnover} Cr with high validation standards (less than 1.1% variance).`, source: 'GST API Integration' },
        { id: `log-${Date.now()}-2`, type: 'success', category: 'Corporation Standing', message: 'MCA Registrar confirms Active Registration.', evidence: 'No active winding up filings or disqualified director warnings found on MCA corporate registry scans.', source: 'MCA Registrar DB Check' },
        { id: `log-${Date.now()}-3`, type: 'success', category: 'EPF Compliance', message: 'EPFO staffing numbers verified.', evidence: 'Regular monthly EPF challenges align perfectly with active salary disbursements.', source: 'EPFO Direct Integration' },
        { id: `log-${Date.now()}-4`, type: 'warning', category: 'Financial Leverage', message: 'Moderate interest coverage ratio noted.', evidence: 'Calculated EBITDA coverage buffer remains snug at 1.76x under current proposed term amortization tables.', source: 'Balance Sheet Debt Amortization' }
      ]
    };

    setCompanies(prev => [newCompany, ...prev]);
    setSelectedCompany(newCompany);
    setActivePage('workspace');
  };

  const handleStartAnalysis = (formData: any) => {
    setPendingCompanyName(formData.companyName);
    setPendingCompanyData(formData);
    setActivePage('simulator');
  };

  const handleUpdateCompany = (updatedCompany: Company) => {
    setCompanies(prev => prev.map(c => c.id === updatedCompany.id ? updatedCompany : c));
    setSelectedCompany(updatedCompany);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800">
      
      {/* Top Professional Public & Banking Platform Navigation Header */}
      <header className="bg-white border-b border-gray-150 sticky top-0 z-40 shadow-3xs" id="app-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => { setActivePage('dashboard'); setSelectedCompany(null); }}>
            <div className="p-2 bg-indigo-600 rounded-lg text-white flex items-center justify-center">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <span className="font-mono text-[9px] font-bold text-indigo-600 tracking-wider block uppercase">MSME ASSURANCE SYSTEM</span>
              <h1 className="text-base font-black text-gray-900 tracking-tight flex items-center">
                Credence<span className="text-indigo-600 ml-1.5 font-mono text-[10px] font-bold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">AI Platform</span>
              </h1>
            </div>
          </div>

          {/* Desktop Platform Category Badges */}
          <div className="hidden md:flex items-center space-x-6 text-xs font-semibold text-gray-500">
            <span className="flex items-center space-x-1 hover:text-indigo-600 cursor-pointer" onClick={() => { setActivePage('dashboard'); setTimeout(() => { document.getElementById('persona-hub')?.scrollIntoView({ behavior: 'smooth' }); }, 100); }}>
              <span>For MSME Owners</span>
            </span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center space-x-1 hover:text-indigo-600 cursor-pointer" onClick={() => { setActivePage('dashboard'); setTimeout(() => { document.getElementById('explore-msmes-section')?.scrollIntoView({ behavior: 'smooth' }); }, 100); }}>
              <span>For Credit Officers</span>
            </span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center space-x-1 hover:text-indigo-600 cursor-pointer" onClick={() => { setActivePage('dashboard'); setTimeout(() => { document.getElementById('persona-hub')?.scrollIntoView({ behavior: 'smooth' }); }, 100); }}>
              <span>For Investors</span>
            </span>
          </div>

          {/* Integrated Bank Auditor Active Node Session */}
          <div className="flex items-center space-x-3 bg-gray-50 px-3 py-1 rounded-xl border border-gray-150">
            <div className="p-1 bg-indigo-50 rounded-lg">
              <User className="h-3.5 w-3.5 text-indigo-600" />
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-[9px] font-mono font-bold text-emerald-600 uppercase block leading-none flex items-center">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1 inline-block animate-pulse"></span>
                IDBI Reviewer Node
              </span>
              <span className="text-[11px] font-bold text-gray-700 mt-0.5 block leading-none">shashankckotagi@gmail.com</span>
            </div>
          </div>
        </div>
      </header>

      {/* Primary Workstation frame */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activePage === 'dashboard' && (
          <Dashboard
            companies={companies}
            onSelectCompany={(company) => {
              setSelectedCompany(company);
              setActivePage('workspace');
            }}
            onNavigateToWizard={() => {
              setActivePage('wizard');
            }}
          />
        )}

        {activePage === 'wizard' && (
          <NewDiligenceWizard
            onBack={() => setActivePage('dashboard')}
            onStartAnalysis={handleStartAnalysis}
          />
        )}

        {activePage === 'simulator' && (
          <AgentSimulator
            companyName={pendingCompanyName}
            onSimulationComplete={handleSimulationFinished}
          />
        )}

        {activePage === 'workspace' && selectedCompany && (
          <CompanyProfile
            company={selectedCompany}
            onBack={() => {
              setSelectedCompany(null);
              setActivePage('dashboard');
            }}
            onUpdateCompany={handleUpdateCompany}
          />
        )}
      </main>

      {/* Institutional Legal Footer */}
      <footer className="bg-white border-t border-gray-150 py-5 text-center text-xs text-gray-400 font-mono mt-12 animate-fade-in" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>© 2026 Credence AI. Verified against national bank nodes, federal GSTR registries and Registrar of Companies (MCA).</span>
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span>
              Credence Statutory Node Operational
            </span>
            <span>AES-256 Certified</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
