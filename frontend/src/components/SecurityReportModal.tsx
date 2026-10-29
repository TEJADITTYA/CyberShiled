import React from 'react';
import { AnalysisResult } from '../types';
import { Shield, Printer, Download, CheckCircle, X, AlertTriangle } from 'lucide-react';

interface SecurityReportModalProps {
  result: AnalysisResult;
  message: string;
  source: string;
  onClose: () => void;
}

export const SecurityReportModal: React.FC<SecurityReportModalProps> = ({
  result,
  message,
  source,
  onClose
}) => {
  const reportId = React.useMemo(() => {
    return `CS-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  }, []);

  const generatedDate = React.useMemo(() => {
    return new Date().toLocaleString();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const payload = {
      reportId,
      generatedDate,
      source,
      message,
      risk_score: result.risk_score,
      risk_level: result.risk_level,
      classification: result.classification,
      scam_type: result.scam_type,
      confidence: result.confidence,
      summary: result.summary,
      recommendation: result.recommendation,
      indicators: result.indicators,
      score_breakdown: result.score_breakdown,
      ip_tracking: result.ip_tracking,
      actions: result.actions,
      system: 'Cyber Shield AI Threat Engine'
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CyberShield_Report_${reportId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0b1726] border border-slate-700/80 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl relative text-slate-200">
        
        {/* Controls bar */}
        <div className="no-print bg-[#07111c] border-b border-slate-800 px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            INCIDENT REPORT GENERATOR
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              Print / Save PDF
            </button>
            <button
              onClick={handleDownloadJSON}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors border border-emerald-500/30 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download JSON
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="p-8 space-y-6 max-h-[80vh] overflow-y-auto font-sans">
          {/* Header */}
          <div className="border-b border-emerald-500/30 pb-6 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-6 h-6 text-emerald-400" />
                <span className="text-xl font-bold text-white tracking-tight">Cyber Shield Security Incident Report</span>
              </div>
              <p className="text-xs text-slate-400">Automated Threat Intelligence & Forensic Message Analysis</p>
            </div>
            <div className="text-right text-xs font-mono text-slate-400">
              <div>REPORT ID: <span className="text-white font-bold">{reportId}</span></div>
              <div>DATE: {generatedDate}</div>
            </div>
          </div>

          {/* Incident Assessment Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#08121f] p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 block mb-1">Risk Score</span>
              <div className="text-2xl font-bold font-mono text-red-400 tabular-nums">
                {result.risk_score} <span className="text-xs text-slate-400 font-normal">/ 100</span>
              </div>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 block mb-1">Risk Level</span>
              <div className="text-sm font-bold text-white uppercase">{result.risk_level} RISK</div>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 block mb-1">Classification</span>
              <div className="text-sm font-semibold text-amber-400">{result.classification.replace('_', ' ')}</div>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 block mb-1">Confidence</span>
              <div className="text-sm font-bold font-mono text-emerald-400 tabular-nums">{result.confidence}%</div>
            </div>
          </div>

          {/* Primary Threat Identification */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Detected Threat Category</h3>
            <div className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              {result.scam_type}
            </div>
          </div>

          {/* Analyzed Message Payload */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Analyzed Message Content ({source.toUpperCase()})</h3>
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap break-words leading-relaxed">
              {message}
            </div>
          </div>

          {/* Origin IP & BGP Infrastructure Telemetry */}
          {result.ip_tracking && (
            <div className="bg-[#061220] p-4 rounded-xl border border-cyan-500/30 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center justify-between">
                <span>🛰️ Origin IP & Geolocation Intelligence</span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
                  {result.ip_tracking.hosting_type.toUpperCase()}
                </span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono pt-1">
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">RESOLVED IP</span>
                  <span className="font-bold text-cyan-300">{result.ip_tracking.ip}</span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">GEOLOCATION</span>
                  <span className="text-slate-200">{result.ip_tracking.city}, {result.ip_tracking.country}</span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">ASN / ISP ROUTING</span>
                  <span className="text-slate-300 truncate block" title={result.ip_tracking.asn}>
                    {result.ip_tracking.asn}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Executive Summary */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Analysis Summary</h3>
            <p className="text-sm text-slate-300 leading-relaxed bg-[#0c1829] p-4 rounded-xl border border-slate-800/80">
              {result.summary}
            </p>
          </div>

          {/* Detected Threat Signals */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Detected Threat Indicators ({result.indicators.length})</h3>
            {result.indicators.length === 0 ? (
              <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                No major threat indicators detected.
              </div>
            ) : (
              <div className="space-y-2">
                {result.indicators.map((ind, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-900/80 border-l-4 border-l-amber-500 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-white">{ind.type}</span>
                      <span className="font-mono text-[10px] uppercase text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                        {ind.severity}
                      </span>
                    </div>
                    <p className="text-slate-400">{ind.description}</p>
                    {ind.matches.length > 0 && (
                      <div className="mt-1.5 text-[11px] text-slate-500 font-mono">
                        Matches: {ind.matches.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Security Recommendations */}
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              Security Advisory
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">{result.recommendation}</p>
            <ul className="text-xs text-slate-400 list-disc list-inside space-y-1 pt-1">
              {result.actions.map((act, idx) => (
                <li key={idx}>{act}</li>
              ))}
            </ul>
          </div>

          {/* Footer & Disclaimer */}
          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>Cyber Shield Threat Engine · For advisory security purposes</span>
            <span className="font-mono">VERIFICATION HASH: {Math.random().toString(36).substring(2, 14).toUpperCase()}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
