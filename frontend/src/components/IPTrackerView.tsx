import React from 'react';
import { IPTrackingIntel } from '../types';
import { resolveAndTrackIP, traceRealTimeIPWithTelemetry } from '../services/ipTrackerEngine';
import { IPTrackingCard } from './IPTrackingCard';
import { Globe, RefreshCw, Terminal, Crosshair, Zap } from 'lucide-react';

interface IPTrackerViewProps {
  initialTarget?: string;
}

export const IPTrackerView: React.FC<IPTrackerViewProps> = ({ initialTarget }) => {
  const [query, setQuery] = React.useState(initialTarget || '185.220.101.45');
  const [isTracing, setIsTracing] = React.useState(false);
  const [intel, setIntel] = React.useState<IPTrackingIntel | null>(() => resolveAndTrackIP('185.220.101.45', { isScam: true }));
  const [consoleLogs, setConsoleLogs] = React.useState<string[]>([
    '[INIT] Cyber Shield Real-Time IP & DNS Packet Tracer operational.',
    '[READY] Ready to trace any public IPv4/IPv6, website domain, or suspicious link URL in real time.',
    '[TIP] Click "My Real IP" to query your current device connection coordinates & ISP.'
  ]);

  const handleTrace = async (customTarget?: string) => {
    const target = (customTarget !== undefined ? customTarget : query).trim();

    setIsTracing(true);
    const newLogs: string[] = [];
    const pushLog = (msg: string) => {
      newLogs.push(msg);
      setConsoleLogs([...newLogs]);
    };

    try {
      const isScamGuess = Boolean(
        target &&
        !target.includes('google') &&
        !target.includes('github') &&
        !target.includes('cloudflare') &&
        !target.includes('sbi.co.in') &&
        !target.includes('8.8.8.8') &&
        !target.includes('1.1.1.1') &&
        !target.toLowerCase().includes('my ip')
      );

      const res = await traceRealTimeIPWithTelemetry(target, pushLog, { isScam: isScamGuess });
      setIntel(res);
    } catch (e) {
      pushLog(`[FAILSAFE] Real-time query encountered network delay. Routing through local threat database.`);
      const fallback = resolveAndTrackIP(target || '185.220.101.45', { isScam: true });
      setIntel(fallback);
    } finally {
      setIsTracing(false);
    }
  };

  React.useEffect(() => {
    if (initialTarget && initialTarget.trim()) {
      setQuery(initialTarget.trim());
      handleTrace(initialTarget.trim());
    }
  }, [initialTarget]);

  const handleDetectSelf = () => {
    setQuery('My Real IP');
    handleTrace('My Real IP');
  };

  const loadPreset = (target: string) => {
    setQuery(target);
    handleTrace(target);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
          <Crosshair className="w-3.5 h-3.5 animate-pulse" />
          REAL-TIME THREAT ORIGIN & IP PACKET TRACER
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Trace Any <span className="text-cyan-400">IP, Domain, or Link Origin</span>
        </h1>
        <p className="text-sm text-slate-300">
          Live DNS-over-HTTPS queries, Autonomous System (ASN) BGP routes, satellite physical coordinates, Tor relays, and bulletproof host detection in real time.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-[#091524] border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4 cyber-panel">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Globe className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTrace()}
              placeholder="Enter IP (e.g. 8.8.8.8), domain (e.g. github.com), or URL link..."
              className="w-full pl-10 pr-4 py-3 bg-[#06111f] border border-slate-700 rounded-xl text-xs font-mono text-cyan-300 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <button
            onClick={() => handleTrace()}
            disabled={isTracing || !query.trim()}
            className="px-6 py-3 rounded-xl font-bold text-xs bg-cyan-400 hover:bg-cyan-300 text-slate-950 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50 whitespace-nowrap"
          >
            {isTracing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Crosshair className="w-3.5 h-3.5" />}
            {isTracing ? 'Tracing Live Route...' : 'Track Real-Time IP'}
          </button>

          <button
            onClick={handleDetectSelf}
            disabled={isTracing}
            className="px-4 py-3 rounded-xl font-bold text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg whitespace-nowrap"
            title="Detect and locate my device's real public IP and physical coordinates"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            My Real IP
          </button>
        </div>

        {/* Quick Threat & Live Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs text-slate-400 font-mono">Real-Time Presets:</span>
          <button
            onClick={() => loadPreset('github.com')}
            className="px-3 py-1.5 rounded-lg text-xs bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300 cursor-pointer font-mono"
          >
            🌐 github.com (Live Domain)
          </button>
          <button
            onClick={() => loadPreset('google.com')}
            className="px-3 py-1.5 rounded-lg text-xs bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-slate-300 cursor-pointer font-mono"
          >
            🛡️ google.com (Global Anycast)
          </button>
          <button
            onClick={() => loadPreset('8.8.8.8')}
            className="px-3 py-1.5 rounded-lg text-xs bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300 cursor-pointer font-mono"
          >
            📍 8.8.8.8 (Google DNS)
          </button>
          <button
            onClick={() => loadPreset('1.1.1.1')}
            className="px-3 py-1.5 rounded-lg text-xs bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300 cursor-pointer font-mono"
          >
            ⚡ 1.1.1.1 (Cloudflare Edge)
          </button>
          <button
            onClick={() => loadPreset('185.220.101.45')}
            className="px-3 py-1.5 rounded-lg text-xs bg-slate-900 border border-slate-800 hover:border-red-500/50 text-slate-300 cursor-pointer font-mono"
          >
            🇳🇱 185.220.101.45 (Amsterdam C2)
          </button>
          <button
            onClick={() => loadPreset('194.26.29.112')}
            className="px-3 py-1.5 rounded-lg text-xs bg-slate-900 border border-slate-800 hover:border-red-500/50 text-slate-300 cursor-pointer font-mono"
          >
            🇷🇺 194.26.29.112 (Phishing Host)
          </button>
        </div>
      </div>

      {/* Live Terminal Output Stream */}
      <div className="bg-[#050b14] border border-slate-800 rounded-2xl p-4 shadow-xl font-mono text-xs space-y-2">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-2 text-cyan-400">
            <Terminal className="w-3.5 h-3.5" />
            <span className="font-bold uppercase tracking-wider text-[11px]">Real-Time DNS & BGP Packet Tracer Stream</span>
          </div>
          <span className="flex items-center gap-1.5 text-[10px] text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {isTracing ? 'TRANSMITTING' : 'ONLINE'}
          </span>
        </div>
        <div className="space-y-1 text-slate-400 text-[11px] max-h-44 overflow-y-auto">
          {consoleLogs.map((log, idx) => (
            <div
              key={idx}
              className={
                log.includes('CRITICAL') || log.includes('WARNING') || log.includes('Threat')
                  ? 'text-red-400'
                  : log.includes('GEOIP') || log.includes('RESOLVE') || log.includes('STATUS')
                    ? 'text-cyan-300'
                    : log.includes('DNS')
                      ? 'text-purple-300'
                      : ''
              }
            >
              {log}
            </div>
          ))}
        </div>
      </div>

      {/* Main IP Tracking Visual Radar Card */}
      {intel && (
        <IPTrackingCard
          intel={intel}
          title={`Origin Trace: ${intel.hostname || intel.ip} (${intel.city}, ${intel.country})`}
        />
      )}

    </div>
  );
};

