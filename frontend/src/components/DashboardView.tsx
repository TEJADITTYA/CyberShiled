import React from 'react';
import { NavTab } from './Navbar';
import { getScanHistory } from '../services/storage';
import { Shield, AlertTriangle, ShieldCheck, Search, Activity, Link2, QrCode, ArrowRight, BarChart3, CheckCircle2 } from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: NavTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const history = React.useMemo(() => getScanHistory(), []);

  const totalScans = history.length;
  const scamsDetected = history.filter(h => h.risk === 'CRITICAL' || h.risk === 'HIGH' || h.risk === 'MEDIUM').length;
  const highRisk = history.filter(h => h.risk === 'CRITICAL' || h.risk === 'HIGH').length;
  const safeCount = history.filter(h => h.risk === 'SAFE' || h.risk === 'LOW').length;

  // Category counts
  const categoryCounts: Record<string, number> = {};
  history.forEach(item => {
    const type = item.result?.scam_type || 'General Suspicious Activity';
    categoryCounts[type] = (categoryCounts[type] || 0) + 1;
  });

  const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            SECURITY OPERATIONS CENTER
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Security <span className="text-emerald-400">Dashboard</span>
          </h1>
          <p className="text-xs text-slate-400">
            Real-time analytics on monitored messages, detected fraud vectors, and local telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          Shield Protection Active
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-[#091524] border border-slate-800 flex items-center gap-4 shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center shrink-0">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Total Scans</div>
            <div className="text-2xl font-black font-mono text-white tabular-nums">{totalScans}</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#091524] border border-slate-800 flex items-center gap-4 shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Scams Detected</div>
            <div className="text-2xl font-black font-mono text-red-400 tabular-nums">{scamsDetected}</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#091524] border border-slate-800 flex items-center gap-4 shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">High / Critical Risk</div>
            <div className="text-2xl font-black font-mono text-orange-400 tabular-nums">{highRisk}</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#091524] border border-slate-800 flex items-center gap-4 shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Verified Safe</div>
            <div className="text-2xl font-black font-mono text-emerald-400 tabular-nums">{safeCount}</div>
          </div>
        </div>

      </div>

      {/* Threat Intelligence Frequency Distribution */}
      <div className="bg-[#091524] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              Threat Intelligence Spectrum
            </h2>
            <span className="text-xs text-slate-400">Most frequently detected threat categories in your records</span>
          </div>
          <span className="text-xs font-mono text-slate-400">{sortedCategories.length} Categories</span>
        </div>

        {sortedCategories.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 space-y-2">
            <p>No scans recorded yet to populate threat telemetry.</p>
            <button
              onClick={() => onNavigate('analyzer')}
              className="text-emerald-400 hover:underline font-semibold"
            >
              Analyze your first message →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedCategories.map(([category, count]) => {
              const percentage = Math.round((count / Math.max(1, totalScans)) * 100);
              return (
                <div key={category} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-200">{category}</span>
                    <span className="font-mono text-emerald-400 font-bold">{count} ({percentage}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Security Tools */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Instant Security Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate('analyzer')}
            className="p-5 rounded-xl bg-[#091524] border border-slate-800 hover:border-emerald-500/40 text-left transition-all cursor-pointer group shadow-lg"
          >
            <div className="text-2xl mb-2">🧠</div>
            <h3 className="font-bold text-white text-sm mb-1 group-hover:text-emerald-400 transition-colors">
              Message Analyzer
            </h3>
            <p className="text-xs text-slate-400">
              Paste suspicious messages, SMS, emails, or job offers.
            </p>
          </button>

          <button
            onClick={() => onNavigate('link-scanner')}
            className="p-5 rounded-xl bg-[#091524] border border-slate-800 hover:border-cyan-500/40 text-left transition-all cursor-pointer group shadow-lg"
          >
            <div className="text-2xl mb-2">🔗</div>
            <h3 className="font-bold text-white text-sm mb-1 group-hover:text-cyan-400 transition-colors">
              Link Scanner
            </h3>
            <p className="text-xs text-slate-400">
              Verify URLs for cloaked redirects and IP address hosts.
            </p>
          </button>

          <button
            onClick={() => onNavigate('history')}
            className="p-5 rounded-xl bg-[#091524] border border-slate-800 hover:border-purple-500/40 text-left transition-all cursor-pointer group shadow-lg"
          >
            <div className="text-2xl mb-2">📜</div>
            <h3 className="font-bold text-white text-sm mb-1 group-hover:text-purple-400 transition-colors">
              Scan History
            </h3>
            <p className="text-xs text-slate-400">
              Review and audit your prior security scans and reports.
            </p>
          </button>
        </div>
      </div>

      {/* Cyber Safety Reminders */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/30 to-[#071321] border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <Shield className="w-5 h-5" />
            Golden Rules of Digital Safety
          </div>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Never share OTPs, passwords, or UPI PINs. Entering a UPI PIN always sends money, never receives it. Always verify unsolicited sender phone numbers independently.
          </p>
        </div>
        <button
          onClick={() => onNavigate('learning')}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-400 text-slate-950 hover:bg-emerald-300 transition-all shrink-0 cursor-pointer shadow-lg"
        >
          Open Safety Guidebook →
        </button>
      </div>

    </div>
  );
};
