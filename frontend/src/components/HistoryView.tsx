import React from 'react';
import { ScanRecord, AnalysisResult } from '../types';
import { getScanHistory, clearScanHistory } from '../services/storage';
import { SecurityReportModal } from './SecurityReportModal';
import { History, Trash2, Search, AlertTriangle, ShieldCheck, FileText, Calendar, Filter } from 'lucide-react';

interface HistoryViewProps {
  onAnalyzeNew: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onAnalyzeNew }) => {
  const [history, setHistory] = React.useState<ScanRecord[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [riskFilter, setRiskFilter] = React.useState<string>('all');
  const [selectedScan, setSelectedScan] = React.useState<ScanRecord | null>(null);

  const load = () => {
    setHistory(getScanHistory());
  };

  React.useEffect(() => {
    load();
  }, []);

  const handleClear = () => {
    if (window.confirm('Are you sure you want to permanently clear all scan records?')) {
      clearScanHistory();
      setHistory([]);
    }
  };

  const filteredHistory = history.filter(item => {
    const matchesSearch =
      item.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.result.scam_type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = riskFilter === 'all' || item.risk === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const getRiskBadge = (risk: string, score: number) => {
    if (risk === 'CRITICAL') {
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-red-500/15 text-red-400 border border-red-500/30">
          CRITICAL · {score}%
        </span>
      );
    }
    if (risk === 'HIGH') {
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-orange-500/15 text-orange-400 border border-orange-500/30">
          HIGH · {score}%
        </span>
      );
    }
    if (risk === 'MEDIUM') {
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
          MEDIUM · {score}%
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
        SAFE · {score}%
      </span>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold mb-2">
            <History className="w-3.5 h-3.5" />
            LOCAL SCAN LOGS
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Security <span className="text-purple-400">Scan History</span>
          </h1>
          <p className="text-xs text-slate-400">
            Audit and review previous scam message assessments and threat ratings.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClear}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear All History
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by keyword, domain, or threat category..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#091524] border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500 hidden sm:block" />
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-[#091524] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-purple-400"
          >
            <option value="all">All Risk Levels</option>
            <option value="CRITICAL">Critical Risk</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="SAFE">Safe Messages</option>
          </select>
        </div>
      </div>

      {/* List */}
      {filteredHistory.length === 0 ? (
        <div className="p-12 text-center bg-[#091524] border border-slate-800 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <History className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-base">No Scan Records Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {history.length === 0
              ? 'Analyze a suspicious message to automatically generate your first incident log.'
              : 'No scans match your current search and filter criteria.'}
          </p>
          <button
            onClick={onAnalyzeNew}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-400 text-slate-950 hover:bg-emerald-300 transition-colors inline-block cursor-pointer shadow-md"
          >
            Analyze a Message Now →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((scan) => (
            <div
              key={scan.id}
              className="p-5 rounded-2xl bg-[#091524] border border-slate-800 hover:border-slate-700 transition-all space-y-3 shadow-lg"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono font-bold text-slate-300">{scan.id}</span>
                  <span className="text-slate-500">·</span>
                  <span className="font-semibold text-white">{scan.result.scam_type}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-[11px] text-slate-400 uppercase font-mono">{scan.source}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3" />
                    {scan.date}
                  </span>
                  {getRiskBadge(scan.risk, scan.result.risk_score)}
                </div>
              </div>

              <p className="text-xs text-slate-300 font-mono line-clamp-2 leading-relaxed">
                {scan.message}
              </p>

              <div className="flex items-center justify-between pt-1 text-xs">
                <div className="text-[11px] text-slate-400">
                  {scan.result.indicators.length} threat signal(s) flagged
                </div>
                <button
                  onClick={() => setSelectedScan(scan)}
                  className="inline-flex items-center gap-1.5 font-bold text-xs text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  View Incident Report
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Incident Report Modal */}
      {selectedScan && (
        <SecurityReportModal
          result={selectedScan.result}
          message={selectedScan.message}
          source={selectedScan.source}
          onClose={() => setSelectedScan(null)}
        />
      )}

    </div>
  );
};
