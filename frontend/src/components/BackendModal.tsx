import React from 'react';
import { checkFlaskBackendHealth, BackendStatus } from '../services/apiClient';
import { Server, CheckCircle2, AlertCircle, RefreshCw, Terminal, Copy, Check, X, ExternalLink, Zap } from 'lucide-react';

interface BackendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackendModal: React.FC<BackendModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = React.useState<BackendStatus | null>(null);
  const [checking, setChecking] = React.useState(false);
  const [copiedCmd, setCopiedCmd] = React.useState<string | null>(null);

  const testHealth = async () => {
    setChecking(true);
    const res = await checkFlaskBackendHealth();
    setStatus(res);
    setChecking(false);
  };

  React.useEffect(() => {
    if (isOpen) {
      testHealth();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#071322] border border-cyan-500/40 rounded-3xl p-6 shadow-2xl space-y-6 cyber-panel max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Full-Stack Architecture & Flask Backend
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                Frontend via npm · Backend via Flask (Python)
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Backend Connection Status */}
        <div className="p-4 rounded-2xl bg-[#050b14] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 uppercase text-[10px]">Backend Engine:</span>
              <span className={`px-2 py-0.5 rounded font-bold border flex items-center gap-1.5 ${
                status?.connected
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
              }`}>
                <span className={`w-2 h-2 rounded-full ${status?.connected ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'}`} />
                {status?.connected ? 'FLASK API CONNECTED' : 'HYBRID CLIENT & API READY'}
              </span>
            </div>
            <div className="text-slate-300 text-[11px]">
              {status?.service || 'Checking backend status...'}
            </div>
          </div>

          <button
            onClick={testHealth}
            disabled={checking}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
            Re-Check Health
          </button>
        </div>

        {/* How to Run: Frontend & Backend Commands */}
        <div className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            Execution Commands
          </div>

          {/* Frontend Command Box */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                1. Frontend (Run via npm)
              </span>
              <button
                onClick={() => copyToClipboard('npm run dev', 'npm-dev')}
                className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] font-mono cursor-pointer"
              >
                {copiedCmd === 'npm-dev' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCmd === 'npm-dev' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="p-2.5 rounded-xl bg-[#050b14] border border-slate-800 font-mono text-xs text-emerald-300 flex items-center justify-between">
              <code>npm run dev</code>
              <span className="text-[10px] text-slate-500">Starts Vite on port 3000</span>
            </div>
          </div>

          {/* Flask Backend Command Box */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2 font-mono">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                2. Flask Backend (Python)
              </span>
              <button
                onClick={() => copyToClipboard('python3 backend/app.py', 'flask-cmd')}
                className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] font-mono cursor-pointer"
              >
                {copiedCmd === 'flask-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCmd === 'flask-cmd' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="p-2.5 rounded-xl bg-[#050b14] border border-slate-800 font-mono text-xs text-cyan-300 flex items-center justify-between">
              <code>python3 backend/app.py</code>
              <span className="text-[10px] text-slate-500">Starts Flask on port 5000</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Or use npm script: <code className="text-cyan-300">npm run backend:flask</code>
            </p>
          </div>
        </div>

        {/* REST API Endpoints Overview */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
            Flask REST API Endpoints:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
              <strong className="text-emerald-400">POST</strong> /api/scan/url
              <div className="text-[10px] text-slate-500">DNS & phishing URL scan</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
              <strong className="text-cyan-400">POST</strong> /api/scan/ip
              <div className="text-[10px] text-slate-500">BGP ASN & GeoIP tracking</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
              <strong className="text-purple-400">POST</strong> /api/scan/message
              <div className="text-[10px] text-slate-500">SMS & smishing detection</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
              <strong className="text-amber-400">GET</strong> /api/threats/feed
              <div className="text-[10px] text-slate-500">Live cyber threat stream</div>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
          >
            Close Architecture Panel
          </button>
        </div>

      </div>
    </div>
  );
};
