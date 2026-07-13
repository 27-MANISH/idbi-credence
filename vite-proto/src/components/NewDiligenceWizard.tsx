/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle, Play, RefreshCw, X, ArrowLeft, Layers, ShieldCheck, Database, HelpCircle } from 'lucide-react';
import { Company, DocumentInfo, DocStatus } from '../types';

interface NewDiligenceWizardProps {
  onBack: () => void;
  onStartAnalysis: (formData: any, documents: DocumentInfo[]) => void;
}

export default function NewDiligenceWizard({ onBack, onStartAnalysis }: NewDiligenceWizardProps) {
  // Core form state
  const [formData, setFormData] = useState({
    companyName: '',
    gstin: '',
    pan: '',
    cin: '',
    industry: 'Manufacturing',
    turnover: '',
    loanAmount: '',
    existingBank: 'None',
    purpose: ''
  });

  // Document states
  const initialMandatoryDocs: DocumentInfo[] = [
    { name: 'Balance Sheet (3 years)', category: 'Mandatory', uploaded: false, status: 'Pending' },
    { name: 'Profit & Loss Statement', category: 'Mandatory', uploaded: false, status: 'Pending' },
    { name: 'Cash Flow Statement', category: 'Mandatory', uploaded: false, status: 'Pending' },
    { name: 'GST Returns (GSTR-1 & 3B)', category: 'Mandatory', uploaded: false, status: 'Pending' },
    { name: 'Bank Statements (12 months)', category: 'Mandatory', uploaded: false, status: 'Pending' },
    { name: 'Income Tax Returns (ITR-6)', category: 'Mandatory', uploaded: false, status: 'Pending' },
    { name: 'Auditor Report', category: 'Mandatory', uploaded: false, status: 'Pending' },
    { name: 'Notes to Accounts', category: 'Mandatory', uploaded: false, status: 'Pending' },
    { name: 'Existing Loan Details', category: 'Mandatory', uploaded: false, status: 'Pending' },
    { name: 'Directors KYC & PAN', category: 'Mandatory', uploaded: false, status: 'Pending' }
  ];

  const initialOptionalDocs: DocumentInfo[] = [
    { name: 'MCA filings', category: 'Optional', uploaded: false, status: 'Pending' },
    { name: 'EPFO Returns', category: 'Optional', uploaded: false, status: 'Pending' },
    { name: 'UPI Registers', category: 'Optional', uploaded: false, status: 'Pending' },
    { name: 'Shareholding Pattern', category: 'Optional', uploaded: false, status: 'Pending' }
  ];

  const [documents, setDocuments] = useState<DocumentInfo[]>([
    ...initialMandatoryDocs,
    ...initialOptionalDocs
  ]);

  const [uploadingDocIndex, setUploadingDocIndex] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Pre-fill helper for demonstration
  const handlePreFillDemo = () => {
    setFormData({
      companyName: 'Kothari Heavy Metallurgicals Ltd',
      gstin: '27AAACK4821D1Z4',
      pan: 'AAACK4821D',
      cin: 'U27200MH2015PLC261542',
      industry: 'Engineering & Heavy Metallurgy',
      turnover: '28.4',
      loanAmount: '4.20',
      existingBank: 'Bank of Baroda',
      purpose: 'Term Loan for High-Frequency Induction Smelting Furnace'
    });

    // Populate documents as extracted and verified
    setDocuments(prev => prev.map(doc => {
      if (doc.category === 'Mandatory') {
        const fileNames: { [key: string]: string } = {
          'Balance Sheet (3 years)': 'Kothari_BS_3Yr_Signed.pdf',
          'Profit & Loss Statement': 'Kothari_Audited_PL_FY24-FY26.pdf',
          'Cash Flow Statement': 'Kothari_CashFlow_Reconciliation.pdf',
          'GST Returns (GSTR-1 & 3B)': 'Consolidated_GSTR1_FY26.pdf',
          'Bank Statements (12 months)': 'BOB_CA_Statement_FY26.pdf',
          'Income Tax Returns (ITR-6)': 'ITR6_FY25_Acknowledge.pdf',
          'Auditor Report': 'Auditors_Report_Clean_Opinion.pdf',
          'Notes to Accounts': 'Accounting_Notes_and_Disclosures.pdf',
          'Existing Loan Details': 'BOB_Outstanding_Hypothecation.pdf',
          'Directors KYC & PAN': 'KYC_Pack_Directors.pdf'
        };
        const sizes: { [key: string]: string } = {
          'Balance Sheet (3 years)': '5.4 MB',
          'Profit & Loss Statement': '3.1 MB',
          'Cash Flow Statement': '2.0 MB',
          'GST Returns (GSTR-1 & 3B)': '14.2 MB',
          'Bank Statements (12 months)': '28.5 MB',
          'Income Tax Returns (ITR-6)': '4.8 MB',
          'Auditor Report': '1.2 MB',
          'Notes to Accounts': '6.1 MB',
          'Existing Loan Details': '1.9 MB',
          'Directors KYC & PAN': '3.2 MB'
        };

        return {
          ...doc,
          uploaded: true,
          status: 'Extracted',
          fileName: fileNames[doc.name] || 'demo_file.pdf',
          fileSize: sizes[doc.name] || '2.5 MB',
          lastChecked: 'Just Now',
          extractedData: { 'Checksum': 'SH256-OK', 'Extracted Fields': '12 items' }
        };
      }
      return doc;
    }));
  };

  const handleDocumentSimulateUpload = (index: number) => {
    if (uploadingDocIndex !== null) return; // Prevent multiple concurrent simulation uploads
    
    setUploadingDocIndex(index);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setDocuments(current => {
              const updated = [...current];
              const doc = updated[index];
              const extName = doc.name.toLowerCase().replace(/\s+/g, '_') + '_extracted.pdf';
              updated[index] = {
                ...doc,
                uploaded: true,
                status: 'Extracted',
                fileName: extName,
                fileSize: `${(Math.random() * 8 + 1).toFixed(1)} MB`,
                lastChecked: 'Just Now',
                extractedData: { 'Verification Check': 'Integrity Passed' }
              };
              return updated;
            });
            setUploadingDocIndex(null);
          }, 300);
          return 100;
        }
        return prev + 15;
      });
    }, 80);
  };

  const handleUploadAllMock = () => {
    setDocuments(prev => prev.map((doc, index) => {
      const fileNames: { [key: string]: string } = {
        'Balance Sheet (3 years)': 'BS_FY24-FY26_Audited.pdf',
        'Profit & Loss Statement': 'PL_FY24-FY26_Audited.pdf',
        'Cash Flow Statement': 'CF_Statement_Signed.pdf',
        'GST Returns (GSTR-1 & 3B)': 'GST_Return_Log_FY26.pdf',
        'Bank Statements (12 months)': 'CA_BankStmt_12M_HDFC.pdf',
        'Income Tax Returns (ITR-6)': 'ITR6_Receipt.pdf',
        'Auditor Report': 'Independent_Auditor_Cert.pdf',
        'Notes to Accounts': 'Notes_and_Disclosures.pdf',
        'Existing Loan Details': 'Sanction_Letters_Baroda.pdf',
        'Directors KYC & PAN': 'KYC_Pack_PAN_DIN.pdf',
        'MCA filings': 'MCA_Form_23AC.pdf',
        'EPFO Returns': 'EPF_Form_12_Consolidated.pdf',
        'UPI Registers': 'UPI_Business_Credits_FY26.pdf',
        'Shareholding Pattern': 'Shareholders_Register_FY26.pdf'
      };

      return {
        ...doc,
        uploaded: true,
        status: 'Extracted',
        fileName: fileNames[doc.name] || 'Mock_Extracted_File.pdf',
        fileSize: `${(Math.random() * 5 + 1).toFixed(1)} MB`,
        lastChecked: 'Just Now',
        extractedData: { 'Format': 'PDF Scan', 'Status': 'Ready for Engine' }
      };
    }));
  };

  const handleRemoveFile = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDocuments(current => {
      const updated = [...current];
      updated[index] = {
        ...updated[index],
        uploaded: false,
        status: 'Pending',
        fileName: undefined,
        fileSize: undefined,
        lastChecked: undefined,
        extractedData: undefined
      };
      return updated;
    });
  };

  const handleStartAnalysisClick = () => {
    // Make sure we have form details
    if (!formData.companyName) {
      alert('Please enter at least the Company Name to continue.');
      return;
    }

    // Trigger analysis
    onStartAnalysis(formData, documents);
  };

  return (
    <div className="space-y-6" id="diligence-wizard-module">
      {/* Header and Quick Pre-fill */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Initiate AI Due Diligence Audit</h2>
            <p className="text-xs text-gray-500 mt-0.5">Configure company profile and upload financial artifacts for audit compilation</p>
          </div>
        </div>

        <button
          onClick={handlePreFillDemo}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-mono font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Pre-fill Demo Company Data</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1/3: Company Intake Form */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-3xs space-y-4 h-fit">
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-indigo-600 block border-b border-gray-100 pb-2">
            1. MSME Registration Intake
          </span>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Company Name *</label>
              <input
                type="text"
                placeholder="Vardhman Textiles Ltd"
                value={formData.companyName}
                onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-50 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">GSTIN</label>
                <input
                  type="text"
                  placeholder="27AABCV1234A1Z5"
                  value={formData.gstin}
                  onChange={e => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-50 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">PAN</label>
                <input
                  type="text"
                  placeholder="AABCV1234A"
                  value={formData.pan}
                  onChange={e => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-50 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Corporate CIN</label>
              <input
                type="text"
                placeholder="U17111MH2012PTC036123"
                value={formData.cin}
                onChange={e => setFormData({ ...formData, cin: e.target.value.toUpperCase() })}
                className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-50 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Industry Desk</label>
                <select
                  value={formData.industry}
                  onChange={e => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full text-xs px-2 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-50 font-medium"
                >
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Engineering & Heavy Metallurgy">Engineering & Metallurgy</option>
                  <option value="Logistics & Supply Chain">Logistics & Supply Chain</option>
                  <option value="Healthcare & Pharmaceuticals">Healthcare & Pharma</option>
                  <option value="Textiles & Garments">Textiles & Garments</option>
                  <option value="Agro & Food Processing">Agro & Food Processing</option>
                  <option value="Retail & E-Commerce">Retail & E-Commerce</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Existing Bank</label>
                <input
                  type="text"
                  placeholder="HDFC Bank"
                  value={formData.existingBank}
                  onChange={e => setFormData({ ...formData, existingBank: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-50 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Annual Turnover (₹ Cr)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="24.5"
                  value={formData.turnover}
                  onChange={e => setFormData({ ...formData, turnover: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-50 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Required Facility (₹ Cr)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="3.5"
                  value={formData.loanAmount}
                  onChange={e => setFormData({ ...formData, loanAmount: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-50 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Facility Purpose / Justification</label>
              <textarea
                rows={3}
                placeholder="Describe procurement schedules, debtor cycles, or equipment models..."
                value={formData.purpose}
                onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-50 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Right 2/3: Document Upload Area */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl p-5 shadow-3xs flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-indigo-600">
                2. Audit Artifact Upload Workspace
              </span>
              <button
                type="button"
                onClick={handleUploadAllMock}
                className="text-[10px] font-mono font-bold text-gray-500 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 px-2.5 py-1 rounded border border-gray-200 transition-colors cursor-pointer"
              >
                Simulate Upload All Documents
              </button>
            </div>

            {/* Mandatory Uploads Section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-gray-800 tracking-tight mb-2 flex items-center">
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full mr-2"></span>
                  Mandatory Documents
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {documents.map((doc, index) => {
                    if (doc.category !== 'Mandatory') return null;

                    const isDocUploading = uploadingDocIndex === index;

                    return (
                      <div
                        key={doc.name}
                        onClick={() => !doc.uploaded && handleDocumentSimulateUpload(index)}
                        className={`border rounded-lg p-3 relative cursor-pointer group transition-all duration-200 select-none flex flex-col justify-between min-h-[90px] ${
                          doc.uploaded
                            ? 'bg-emerald-50/20 border-emerald-200 hover:border-emerald-300'
                            : (isDocUploading ? 'bg-indigo-50/10 border-indigo-200' : 'bg-gray-50/50 border-gray-200 hover:border-gray-300 hover:bg-white')
                        }`}
                        id={`upload-card-${index}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-2">
                            <FileText className={`h-4.5 w-4.5 mt-0.5 ${doc.uploaded ? 'text-emerald-600' : 'text-gray-400 group-hover:text-indigo-500'}`} />
                            <div>
                              <h4 className="text-xs font-semibold text-gray-800">{doc.name}</h4>
                              {doc.uploaded ? (
                                <p className="text-[10px] text-gray-500 font-mono truncate max-w-[150px] mt-0.5">
                                  {doc.fileName} ({doc.fileSize})
                                </p>
                              ) : (
                                <p className="text-[9px] text-gray-400 mt-0.5">Drag & drop or Click to upload</p>
                              )}
                            </div>
                          </div>

                          {doc.uploaded ? (
                            <button
                              onClick={(e) => handleRemoveFile(index, e)}
                              className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition-colors"
                              title="Delete artifact"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          ) : (
                            <Upload className="h-3.5 w-3.5 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                          )}
                        </div>

                        {/* Uploading progress overlay or status indicators */}
                        {isDocUploading ? (
                          <div className="mt-2">
                            <div className="w-full bg-indigo-100/50 rounded-full h-1">
                              <div className="bg-indigo-600 h-1 rounded-full transition-all duration-75" style={{ width: `${uploadProgress}%` }}></div>
                            </div>
                            <div className="flex justify-between items-center mt-1 text-[8px] font-mono text-indigo-600 font-medium">
                              <span>OCR Parsing...</span>
                              <span>{uploadProgress}%</span>
                            </div>
                          </div>
                        ) : (
                          doc.uploaded && (
                            <div className="mt-2.5 flex justify-between items-center bg-white px-2 py-1 rounded border border-emerald-100/60 shadow-3xs text-[9px] font-mono text-emerald-700">
                              <span className="font-semibold flex items-center">
                                <CheckCircle2 className="h-3 w-3 text-emerald-500 mr-1" />
                                Extraction Complete
                              </span>
                              <span>100% verified</span>
                            </div>
                          )
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Optional Section */}
              <div className="pt-2">
                <h3 className="text-xs font-bold text-gray-500 tracking-tight mb-2 flex items-center">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                  Optional Integrations / Documents
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {documents.map((doc, index) => {
                    if (doc.category !== 'Optional') return null;

                    const isDocUploading = uploadingDocIndex === index;

                    return (
                      <div
                        key={doc.name}
                        onClick={() => !doc.uploaded && handleDocumentSimulateUpload(index)}
                        className={`border rounded-lg p-2.5 cursor-pointer group transition-all duration-200 select-none flex flex-col justify-between min-h-[72px] ${
                          doc.uploaded
                            ? 'bg-emerald-50/10 border-emerald-100 hover:border-emerald-200'
                            : (isDocUploading ? 'bg-indigo-50/10 border-indigo-200' : 'bg-gray-50/20 border-gray-150 hover:border-gray-250 hover:bg-white')
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-1.5">
                            <Layers className={`h-4 w-4 mt-0.5 ${doc.uploaded ? 'text-emerald-500' : 'text-gray-400 group-hover:text-indigo-400'}`} />
                            <div>
                              <h4 className="text-xs font-medium text-gray-700">{doc.name}</h4>
                              {doc.uploaded ? (
                                <p className="text-[9px] text-gray-500 font-mono truncate max-w-[150px] mt-0.5">
                                  {doc.fileName}
                                </p>
                              ) : (
                                <p className="text-[9px] text-gray-400">Click to connect API</p>
                              )}
                            </div>
                          </div>

                          {doc.uploaded ? (
                            <button
                              onClick={(e) => handleRemoveFile(index, e)}
                              className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-400 rounded transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          ) : (
                            <Upload className="h-3 w-3 text-gray-300 group-hover:text-indigo-400" />
                          )}
                        </div>

                        {isDocUploading && (
                          <div className="mt-1.5">
                            <div className="w-full bg-indigo-100/50 rounded-full h-0.5">
                              <div className="bg-indigo-600 h-0.5 rounded-full transition-all duration-75" style={{ width: `${uploadProgress}%` }}></div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Instructions Panel */}
      <div className="bg-gray-50/80 border border-gray-150 rounded-xl p-5 shadow-3xs mt-6">
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider font-mono mb-3">
          AI Audit Execution Framework & Pipeline Specifications
        </h3>
        
        <p className="text-xs text-gray-600 leading-relaxed mb-4">
          Upon initiation, IDBI Credence triggers its high-performance semantic auditor. It parses accounting balances, cross-reconciles bank transaction streams against multi-state tax logs, detects discrepancies, searches Ministry databases, and creates a cryptographic evidence graph to finalize the corporate risk assessment.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-100 p-3 rounded-lg flex items-start space-x-2 shadow-3xs">
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <span className="text-xs font-semibold text-gray-800">Document Parsing</span>
              <p className="text-[10px] text-gray-400 mt-0.5">OCR layout extraction & financial data alignment</p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 p-3 rounded-lg flex items-start space-x-2 shadow-3xs">
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <span className="text-xs font-semibold text-gray-800">Consistency Ledger</span>
              <p className="text-[10px] text-gray-400 mt-0.5">Cross-check of GST sales to Audited P&L Revenue</p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 p-3 rounded-lg flex items-start space-x-2 shadow-3xs">
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <span className="text-xs font-semibold text-gray-800">Anomaly Radar</span>
              <p className="text-[10px] text-gray-400 mt-0.5">Detecting inflated billing & undisclosed term loans</p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 p-3 rounded-lg flex items-start space-x-2 shadow-3xs">
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <span className="text-xs font-semibold text-gray-800">Public Registrar check</span>
              <p className="text-[10px] text-gray-400 mt-0.5">Live MCA, EPFO & Income Tax portal checks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Execution Call to Action */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleStartAnalysisClick}
          className="w-full md:w-auto flex items-center justify-center space-x-2.5 px-8 py-4 text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition-colors cursor-pointer shadow-md hover:shadow-lg transform active:scale-98"
          id="start-audit-btn"
        >
          <Play className="h-5 w-5 fill-current" />
          <span>START AI DUE DILIGENCE</span>
        </button>
      </div>
    </div>
  );
}
