/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileText, TrendingUp, DollarSign, ShieldAlert, CheckCircle2, 
  HelpCircle, Sparkles, Network, ArrowRight, ArrowDown, Info
} from 'lucide-react';
import { Company } from '../types';

interface EvidenceGraphProps {
  company: Company;
}

interface GraphNode {
  id: string;
  label: string;
  category: string;
  icon: any;
  status: 'Verified' | 'Warning' | 'Contradicted';
  summary: string;
  details: Record<string, string>;
  documents: string[];
}

export default function EvidenceGraph({ company }: EvidenceGraphProps) {
  // Set default selected node to 'financial_health'
  const [selectedNodeId, setSelectedNodeId] = useState<string>('financial_health');

  // Define the node chain requested:
  // Balance Sheet -> Inventory -> Working Capital -> Cash Flow -> Financial Health -> Trust Score -> Recommendation
  const nodes: GraphNode[] = [
    {
      id: 'balance_sheet',
      label: 'Balance Sheet',
      category: 'Source Audited Accounts',
      icon: FileText,
      status: 'Verified',
      summary: 'Audited balance sheet extracts for the past 3 fiscal years verified with auditor qualified signatures.',
      details: {
        'Paid-up Capital': '₹4.80 Cr',
        'Tangible Net Worth': `₹${(company.turnover * 0.42).toFixed(2)} Cr`,
        'Total Reserves': `₹${(company.turnover * 0.28).toFixed(2)} Cr`,
        'Auditor Qualification': 'Nil'
      },
      documents: ['BS_3Yr_Signed_Extract.pdf', 'Auditors_Report.pdf']
    },
    {
      id: 'inventory',
      label: 'Inventory',
      category: 'Asset Inspection',
      icon: TrendingUp,
      status: company.id === 'comp-3' ? 'Warning' : 'Verified',
      summary: 'Analysis of inventory holding patterns, raw stock valuations, and shelf-life aging ratios.',
      details: {
        'Closing Stock': `₹${(company.turnover * 0.15).toFixed(2)} Cr`,
        'Inventory Turn Ratio': '6.42x',
        'Average Holding Period': '57 Days',
        'Stock Valuation Method': 'FIFO (Verified)'
      },
      documents: ['Accounting_Disclosures.pdf', 'BS_3Yr_Signed_Extract.pdf']
    },
    {
      id: 'working_capital',
      label: 'Working Capital',
      category: 'Liquidity Buffer',
      icon: DollarSign,
      status: company.id === 'comp-3' ? 'Warning' : 'Verified',
      summary: 'Calculated current assets minus current liabilities to measure immediate operational headroom.',
      details: {
        'Current Ratio': `${company.metrics[company.metrics.length - 1].currentRatio.toFixed(2)}x`,
        'Quick Ratio': '1.18x',
        'Debtor Turn Days': '42 Days',
        'Trade Payable Days': '49 Days'
      },
      documents: ['BS_3Yr_Signed_Extract.pdf', 'Baroda_Term_Sanction.pdf']
    },
    {
      id: 'cash_flow',
      label: 'Cash Flow',
      category: 'Transactional Verification',
      icon: DollarSign,
      status: company.id === 'comp-3' ? 'Contradicted' : 'Verified',
      summary: 'Continuous reconciliation of operating cash inflows against reported bank statement ledgers and GSTR-3B filings.',
      details: {
        'Bank Statement Matches': company.id === 'comp-3' ? '76% Reconciled (Unmatched discrepancies)' : '98.6% Reconciled',
        'Avg Monthly Balance': '₹38.5 Lakhs',
        'Inward Cheque Bounces': company.id === 'comp-3' ? '14 events' : '0 events',
        'GSTR-3B Ledger Match': '98.9% Alignment'
      },
      documents: ['CashFlow_Statement_Reconciled.pdf', 'BOB_CA_Statement_FY26.pdf', 'GST_All_Months_FY26.pdf']
    },
    {
      id: 'financial_health',
      label: 'Financial Health',
      category: 'Credit Analysis Core',
      icon: TrendingUp,
      status: 'Verified',
      summary: 'Synthesized health index balancing debt-service coverage, operating margins, and solvency indexes.',
      details: {
        'EBITDA Margin': `${((company.metrics[company.metrics.length - 1].ebitda / company.metrics[company.metrics.length - 1].turnover) * 100).toFixed(1)}%`,
        'Debt-to-Equity Ratio': `${company.metrics[company.metrics.length - 1].debtEquity.toFixed(2)}x`,
        'Debt Service Coverage (DSCR)': `${company.metrics[company.metrics.length - 1].dscr.toFixed(2)}x`,
        'PAT Margin': `${((company.metrics[company.metrics.length - 1].pat / company.metrics[company.metrics.length - 1].turnover) * 100).toFixed(1)}%`
      },
      documents: ['Audited_PL_FY24-FY26.pdf', 'ITR6_Receipt.pdf']
    },
    {
      id: 'trust_score',
      label: 'Trust Score',
      category: 'AI Composite Signal',
      icon: Network,
      status: company.trustScore >= 85 ? 'Verified' : 'Warning',
      summary: 'Weighted algorithmic reliability score matching regulatory registries and active corporate files.',
      details: {
        'Composite Rating': `${company.trustScore}%`,
        'Filing Integrity Index': 'High (98%)',
        'Statutory Registry Match': '100% Match',
        'EPFO Compliance Status': 'Fully Compliant'
      },
      documents: ['KYC_Pack_Directors.pdf']
    },
    {
      id: 'recommendation',
      label: 'Recommendation',
      category: 'Decision Intelligence',
      icon: Sparkles,
      status: company.decision === 'APPROVED' ? 'Verified' : 'Warning',
      summary: 'Automated lending desk outcome based on financial ratios, integrity signals, and cross-reconciliation ratios.',
      details: {
        'AI Action Outcome': company.status === 'Verified' ? 'Approve Credit Request' : 'Refer to Committee',
        'Interest Leverage Safety': 'Snug Operational Coverage',
        'Risk Rating Weight': 'Low-to-Medium Risk',
        'Monitoring Schedule': 'Quarterly Automatic Auditing'
      },
      documents: []
    }
  ];

  // Map to help get connections
  // We model a strictly sequential chain:
  // balance_sheet -> inventory -> working_capital -> cash_flow -> financial_health -> trust_score -> recommendation
  const nodeOrder = ['balance_sheet', 'inventory', 'working_capital', 'cash_flow', 'financial_health', 'trust_score', 'recommendation'];

  // Check if two nodes are connected in the chain (either direct parents or direct children)
  const isConnected = (nodeAId: string, nodeBId: string) => {
    const idxA = nodeOrder.indexOf(nodeAId);
    const idxB = nodeOrder.indexOf(nodeBId);
    if (idxA === -1 || idxB === -1) return false;
    return Math.abs(idxA - idxB) === 1;
  };

  const selectedIdx = nodeOrder.indexOf(selectedNodeId);
  const selectedNodeObj = nodes.find(n => n.id === selectedNodeId) || nodes[0];

  return (
    <div className="bg-white border border-gray-150 rounded-2xl shadow-3xs overflow-hidden" id="evidence-graph-component">
      
      {/* Header Info Banner */}
      <div className="p-4 bg-indigo-50/40 border-b border-gray-150 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-700">
            <Network className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 tracking-tight">Interactive AI Evidence Lineage Graph</h3>
            <p className="text-[11px] text-gray-500">Trace parameters, upstream sources, and automatic rating dependencies step-by-step</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-[10px] font-mono text-gray-400 bg-white px-2.5 py-1 rounded-md border border-gray-150 shadow-3xs">
          <Info className="h-3 w-3 text-indigo-500" />
          <span>Click any node to inspect highlights & dependencies</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 divide-y xl:divide-y-0 xl:divide-x divide-gray-150">
        
        {/* Left Column: Visual Flowchart Stage (Desktop horizontal, Mobile vertical) */}
        <div className="xl:col-span-2 p-6 bg-gray-50/30 flex flex-col justify-center items-center">
          
          {/* Responsive Node Layout */}
          <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-4xl gap-4 relative py-6">
            
            {nodes.map((node, index) => {
              const NodeIcon = node.icon;
              const isSelected = selectedNodeId === node.id;
              
              // Dependency highlighted state:
              // Highlight selected node, its immediate predecessor, and its immediate successor.
              const isDirectDependency = isSelected || isConnected(selectedNodeId, node.id);
              
              let borderClass = 'border-gray-200 bg-white hover:border-gray-300 shadow-3xs text-gray-700';
              let badgeColor = 'bg-gray-100 text-gray-600 border-gray-200';
              
              if (isSelected) {
                borderClass = 'border-indigo-600 bg-indigo-50/10 text-indigo-900 ring-4 ring-indigo-100 shadow-md';
                badgeColor = 'bg-indigo-600 text-white border-indigo-700';
              } else if (isDirectDependency) {
                borderClass = 'border-indigo-300 bg-white text-gray-900 ring-2 ring-indigo-50 shadow-xs';
                badgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-100';
              } else {
                // Dim non-dependencies slightly to highlight the trace
                borderClass = 'border-gray-150 bg-white opacity-60 text-gray-500';
              }

              let statusDot = 'bg-emerald-500';
              if (node.status === 'Warning') statusDot = 'bg-amber-400';
              if (node.status === 'Contradicted') statusDot = 'bg-rose-500';

              return (
                <React.Fragment key={node.id}>
                  {/* Visual Node Card */}
                  <button
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`flex-1 min-w-[110px] w-full p-3 rounded-xl border flex flex-col items-center text-center transition-all duration-300 cursor-pointer relative ${borderClass}`}
                    id={`graph-node-${node.id}`}
                  >
                    {/* Status Dot badge */}
                    <span className={`absolute top-2 right-2 h-2 w-2 rounded-full ${statusDot}`} title={node.status}></span>
                    
                    <div className="p-2 rounded-lg bg-gray-50 mb-1.5 shrink-0">
                      <NodeIcon className={`h-4.5 w-4.5 ${isSelected ? 'text-indigo-600 animate-pulse' : 'text-gray-500'}`} />
                    </div>
                    
                    <span className="text-[11px] font-bold leading-tight block truncate w-full">{node.label}</span>
                    <span className="text-[9px] text-gray-400 mt-0.5 font-mono tracking-tighter block truncate w-full">{node.category}</span>
                  </button>

                  {/* Sequential connector arrow */}
                  {index < nodes.length - 1 && (
                    <div className="flex items-center justify-center text-gray-300 py-1 md:py-0 shrink-0 select-none">
                      {/* Responsive Directional Arrows */}
                      <ArrowRight className={`hidden md:block h-5 w-5 transition-all duration-300 ${
                        (selectedIdx === index || selectedIdx === index + 1) ? 'text-indigo-500 stroke-[2.5]' : 'text-gray-300'
                      }`} />
                      <ArrowDown className={`block md:hidden h-5 w-5 transition-all duration-300 ${
                        (selectedIdx === index || selectedIdx === index + 1) ? 'text-indigo-500 stroke-[2.5]' : 'text-gray-300'
                      }`} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}

          </div>

          {/* Connected Path Indicator Description */}
          <div className="mt-4 bg-indigo-50/30 border border-indigo-100 rounded-xl px-4 py-3 text-center max-w-2xl w-full">
            <p className="text-xs text-indigo-900 font-medium">
              Active Trace path: <strong className="text-indigo-600 font-semibold uppercase font-mono">{selectedNodeObj.label}</strong> is connected upstream to <span className="font-semibold">{selectedIdx > 0 ? nodes[selectedIdx - 1].label : 'Root Source'}</span> and downstream to <span className="font-semibold">{selectedIdx < nodes.length - 1 ? nodes[selectedIdx + 1].label : 'Decision Desk'}</span>.
            </p>
          </div>
        </div>

        {/* Right Column: Evidence Inspector Panel */}
        <div className="p-6 bg-white flex flex-col justify-between" id="node-evidence-inspector">
          <div>
            {/* Header info */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-widest block">{selectedNodeObj.category}</span>
                <h4 className="text-base font-extrabold text-gray-900 tracking-tight mt-0.5">{selectedNodeObj.label}</h4>
              </div>

              {/* Status Badge */}
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                selectedNodeObj.status === 'Verified' 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                  : selectedNodeObj.status === 'Warning' 
                    ? 'bg-amber-50 text-amber-800 border-amber-200' 
                    : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}>
                {selectedNodeObj.status === 'Verified' && <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" />}
                {selectedNodeObj.status === 'Warning' && <ShieldAlert className="h-3 w-3 mr-1 text-amber-500" />}
                {selectedNodeObj.status === 'Contradicted' && <ShieldAlert className="h-3 w-3 mr-1 text-rose-500" />}
                {selectedNodeObj.status.toUpperCase()}
              </span>
            </div>

            {/* AI Summary Description */}
            <p className="text-xs text-gray-600 leading-normal mb-5">
              {selectedNodeObj.summary}
            </p>

            {/* Parameter Grid Table */}
            <div className="space-y-3 mb-6">
              <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider block border-b border-gray-100 pb-1">Extracted Variables</span>
              
              <div className="divide-y divide-gray-100">
                {Object.entries(selectedNodeObj.details).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center py-2 text-xs">
                    <span className="text-gray-500 font-medium">{key}</span>
                    <span className="text-gray-900 font-mono font-bold bg-gray-50 px-2 py-0.5 rounded border border-gray-150 shadow-3xs">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Associated Uploaded Files Vault references */}
            {selectedNodeObj.documents.length > 0 && (
              <div className="space-y-2">
                <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider block border-b border-gray-100 pb-1">Associated Registry Files</span>
                
                <div className="space-y-1.5">
                  {selectedNodeObj.documents.map(doc => (
                    <div key={doc} className="flex items-center space-x-2 text-[11px] text-gray-700 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100 truncate hover:bg-gray-100 transition-all">
                      <FileText className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span className="truncate font-medium">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Prompt footer */}
          <div className="text-[10px] text-gray-400 font-mono border-t border-gray-100 pt-4 mt-6 text-center">
            Automatic auditing pipeline linked to 62 relational signals.
          </div>
        </div>

      </div>
    </div>
  );
}
