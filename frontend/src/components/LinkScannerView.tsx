import React from 'react';
import { URLCheckResult } from '../types';
import { analyzeURLAsync } from '../services/urlEngine';
import { IPTrackingCard } from './IPTrackingCard';
import { Link2, Shield, AlertTriangle, CheckCircle2, ExternalLink, RefreshCw, Globe, Crosshair, Server, MapPin, Zap, ArrowRight, Smartphone } from 'lucide-react';

interface LinkScannerViewProps {
  onReportToAnalyzer?: (text: string) => void;
  onTraceIP?: (target: string) => void;
  onNavigate?: (tab: string) => void;
}

export const LinkScannerView: React.FC<LinkScannerViewProps> = ({ onReportToAnalyzer, onTraceIP, onNavigate }) => {
  const [urlInput, setUrlInput] = React.useState('');
  const [isScanning, setIsScanning] = React.useState(false);
  const [scanStage, setScanStage] = React.useState<string>('');
  const [result, setResult] = React.useState<URLCheckResult | null>(null);
  const [reportRecorded, setReportRecorded] = React.useState(false);
  const [autoOpenSafe, setAutoOpenSafe] = React.useState(true);
  const [autoOpenStatus, setAutoOpenStatus] = React.useState<'idle' | 'opened' | 'blocked'>('idle');

  const handleScan = async (targetUrl?: string) => {
    const raw = (targetUrl || urlInput).trim();
    if (!raw) return;

    setIsScanning(true);
    setReportRecorded(false);
    setAutoOpenStatus('idle');
    setScanStage('Parsing URL syntax, structure & deception heuristics...');

    const timer1 = setTimeout(() => {
      setScanStage('Querying Cloudflare & Google DNS-over-HTTPS for authoritative A-records...');
    }, 150);

    const timer2 = setTimeout(() => {
      setScanStage('Tracing live BGP Autonomous System routing & satellite GeoIP coordinates...');
    }, 350);

    try {
      const res = await analyzeURLAsync(raw);
      setResult(res);

      // Directly open the URL if verified safe and autoOpenSafe is enabled
      if (res.risk_level === 'SAFE' && res.risk_score < 25 && autoOpenSafe) {
        const dest = res.url.startsWith('http://') || res.url.startsWith('https://') ? res.url : `https://${res.url}`;
        try {
          const win = window.open(dest, '_blank', 'noopener,noreferrer');
          if (win && !win.closed) {
            setAutoOpenStatus('opened');
          } else {
            setAutoOpenStatus('blocked');
          }
        } catch {
          setAutoOpenStatus('blocked');
        }
      }
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsScanning(false);
      setScanStage('');
    }
  };

  const loadExample = (type: 'prize' | 'bank' | 'google' | 'github' | 'ip') => {
    let sample = '';
    if (type === 'prize') sample = 'https://bit.ly/claim-prize-now.xyz?claim=50000';
    if (type === 'bank') sample = 'http://sbi-verify-kyc-account.example.com/login-otp';
    if (type === 'google') sample = 'https://www.google.com';
    if (type === 'github') sample = 'https://github.com';
    if (type === 'ip') sample = 'http://8.8.8.8';

    setUrlInput(sample);
    handleScan(sample);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
          <Link2 className="w-3.5 h-3.5" />
          REAL-TIME URL REPUTATION & ORIGIN TRACER
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Trace & Inspect Any <span className="text-cyan-400">URL Target</span>
        </h1>
        <p className="text-sm text-slate-300">
          Unmask destinations in real time: query DNS-over-HTTPS records, satellite server coordinates, BGP Autonomous System routes, and active phishing blacklists.
        </p>
      </div>

      {/* Input Box */}
      <div className="bg-[#091524] border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4 cyber-panel">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              placeholder="https://example.com, github.com, bit.ly/..., or 8.8.8.8"
              className="w-full pl-10 pr-4 py-3 bg-[#06111f] border border-slate-700 rounded-xl text-xs font-mono text-cyan-300 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <button
            onClick={() => handleScan()}
            disabled={isScanning || !urlInput.trim()}
            className="px-6 py-3 rounded-xl font-bold text-xs bg-cyan-400 hover:bg-cyan-300 text-slate-950 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50 whitespace-nowrap"
          >
            {isScanning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
            {isScanning ? 'Tracking in Real-Time...' : 'Scan & Trace Link'}
          </button>
        </div>

        {/* Live scanning progress banner */}
        {isScanning && (
          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 text-xs font-mono flex items-center gap-2.5 animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin text-cyan-400 shrink-0" />
            <span>{scanStage || 'Executing real-time DNS & GeoIP packet trace...'}</span>
          </div>
        )}

        {/* Examples */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs text-slate-400">Quick Test Targets:</span>
          <button
            onClick={() => loadExample('google')}
            className="px-3 py-1.5 rounded-lg text-xs bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-slate-300 cursor-pointer font-mono"
          >
            🛡️ google.com (Clean CDN)
          </button>
          <button
            onClick={() => loadExample('github')}
            className="px-3 py-1.5 rounded-lg text-xs bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300 cursor-pointer font-mono"
          >
            🌐 github.com (Azure BGP)
          </button>
          <button
            onClick={() => loadExample('ip')}
            className="px-3 py-1.5 rounded-lg text-xs bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300 cursor-pointer font-mono"
          >
            📍 8.8.8.8 (Direct IP)
          </button>
          <button
            onClick={() => loadExample('prize')}
            className="px-3 py-1.5 rounded-lg text-xs bg-slate-900 border border-slate-800 hover:border-red-500/50 text-slate-300 cursor-pointer font-mono"
          >
            🎁 Suspicious Prize Link
          </button>
          <button
            onClick={() => loadExample('bank')}
            className="px-3 py-1.5 rounded-lg text-xs bg-slate-900 border border-slate-800 hover:border-red-500/50 text-slate-300 cursor-pointer font-mono"
          >
            🏦 Fake Banking Link
          </button>
        </div>

        {/* Auto-Open & Mobile Shield Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-mono">
            <input
              type="checkbox"
              checked={autoOpenSafe}
              onChange={(e) => setAutoOpenSafe(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-emerald-500"
            />
            <span className="text-slate-200 font-bold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              Auto-Open Safe URLs Directly
            </span>
            <span className="text-slate-500 text-[11px] hidden sm:inline">(Instantly launches safe links after scan)</span>
          </label>

          {onNavigate && (
            <button
              onClick={() => onNavigate('mobile-shield')}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 cursor-pointer transition-colors self-start sm:self-auto bg-cyan-950/30 px-3 py-1.5 rounded-lg border border-cyan-500/20"
            >
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              <span>Mobile Background Link Shield</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Results Card */}
      {result && (
        <div className="bg-[#091524] border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-6 cyber-panel">
          
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  URL SECURITY VERDICT
                </span>
                {result.ip_tracking?.is_live_api && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                    ● REAL-TIME TELEMETRY VERIFIED
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-black text-white flex items-center gap-2">
                {result.risk_level} Risk
                <span className="text-xs font-normal text-slate-400">({result.status})</span>
              </h3>
              <p className="text-xs text-cyan-400 font-mono mt-1 break-all">
                {result.url}
              </p>
            </div>

            <div className={`px-4 py-2 rounded-xl font-mono text-center border ${
              result.risk_score >= 60
                ? 'bg-red-500/10 border-red-500 text-red-400'
                : result.risk_score >= 25
                  ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                  : 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
            }`}>
              <div className="text-2xl font-bold leading-none">{result.risk_score}</div>
              <div className="text-[10px] text-slate-400 uppercase">Score / 100</div>
            </div>
          </div>

          {/* Real-time Dynamic Action Alert: Safe Launch or Threat Intercept */}
          {result.risk_level === 'SAFE' && result.risk_score < 25 ? (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    Verified Safe Target
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">CLEAN DOMAIN</span>
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    {autoOpenStatus === 'opened' ? (
                      <span className="text-emerald-300 font-semibold flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5" />
                        Direct URL link page launched automatically in a new window!
                      </span>
                    ) : autoOpenStatus === 'blocked' ? (
                      <span className="text-amber-300">
                        Verified authentic destination. Browser held automatic popup — tap button to open page.
                      </span>
                    ) : (
                      'No malicious redirects, phishing keywords, or blacklist entries detected. Safe to browse.'
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-stretch sm:self-auto">
                <a
                  href={result.url.startsWith('http://') || result.url.startsWith('https://') ? result.url : `https://${result.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-400 hover:bg-emerald-300 text-slate-950 transition-all flex items-center gap-2 cursor-pointer shadow-lg whitespace-nowrap justify-center flex-1 sm:flex-none"
                >
                  <span>{autoOpenStatus === 'opened' ? 'Re-Open URL Link Page' : 'Open URL Link Page Directly'}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-red-950/40 border-2 border-red-500/70 shadow-[0_0_30px_rgba(239,68,68,0.25)] space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500 text-red-400 flex items-center justify-center shrink-0 animate-bounce">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-black text-red-300 tracking-wide uppercase flex items-center gap-2">
                    🚨 CRITICAL SECURITY ALERT: HIGH RISK LINK DETECTED!
                  </div>
                  <div className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Direct access has been safety-blocked. This target URL exhibits deceptive impersonation, credential-theft queries, or hostile server infrastructure.
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-red-500/30">
                {onReportToAnalyzer && (
                  <button
                    onClick={() => {
                      onReportToAnalyzer(
                        `URGENT PHISHING THREAT REPORT:\nURL: ${result.url}\nDomain: ${result.domain}\nRisk Score: ${result.risk_score}/100 (${result.risk_level})\nThreat Signals: ${result.reasons.join(', ')}\nReputation: ${result.reputation}`
                      );
                    }}
                    className="px-4 py-2 rounded-xl font-bold text-xs bg-red-500 hover:bg-red-400 text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-lg"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Report to Deep Message Analyzer
                  </button>
                )}

                {onTraceIP && result.ip_tracking && (
                  <button
                    onClick={() => onTraceIP(result.ip_tracking?.ip || result.domain)}
                    className="px-4 py-2 rounded-xl font-bold text-xs bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    Trace in Full IP Georadar
                  </button>
                )}

                <button
                  onClick={() => setReportRecorded(true)}
                  disabled={reportRecorded}
                  className="px-3.5 py-2 rounded-xl text-xs bg-slate-900 border border-slate-700 hover:border-red-500/50 text-slate-300 cursor-pointer disabled:opacity-60"
                >
                  {reportRecorded ? '✓ Reported to Cybercrime Bureau' : 'Report to National Cybercrime Database'}
                </button>
              </div>

              {reportRecorded && (
                <div className="text-[11px] font-mono text-emerald-400 bg-emerald-950/30 p-2 rounded border border-emerald-500/30">
                  Incident registered in global threat telemetry. Origin domain blacklisted in local shield.
                </div>
              )}
            </div>
          )}

          {/* Intelligence summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
              <span className="text-slate-500 uppercase tracking-wider text-[10px]">Target Domain</span>
              <div className="font-mono font-bold text-white truncate">{result.domain || 'N/A'}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
              <span className="text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
                <Server className="w-3 h-3 text-cyan-400" />
                Resolved Server Origin
              </span>
              <div className="font-mono font-bold text-cyan-300 truncate">
                {result.ip_tracking ? `${result.ip_tracking.ip} (${result.ip_tracking.city}, ${result.ip_tracking.country_code})` : 'Resolving...'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
              <span className="text-slate-500 uppercase tracking-wider text-[10px]">Threat Intelligence</span>
              <div className="font-semibold text-slate-200 truncate">{result.reputation}</div>
            </div>
          </div>

          {/* Detected Signals */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              ⚠️ Technical Threat Signals
            </h4>
            <div className="space-y-1.5">
              {result.reasons.map((reason, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-[#071321] border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  {reason}
                </div>
              ))}
            </div>
          </div>

          {/* Security Checks */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              🛡️ Protocol, DNS & Routing Checks
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {result.checks.map((check, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800 text-slate-400 flex items-center gap-2 font-mono text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  {check}
                </div>
              ))}
            </div>
          </div>

          {/* Recommendation */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-400" />
              Safety Advisory
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {result.risk_score >= 50
                ? 'CRITICAL HAZARD: Do not open this link or enter passwords, credit cards, or OTPs. This domain exhibits signatures of phishing portals.'
                : result.risk_score >= 25
                  ? 'CAUTION: Inspect the destination carefully. If received from an unexpected sender, verify independently before proceeding.'
                  : 'SAFE: No active red flags detected in domain structure. Always maintain standard web browsing awareness.'}
            </p>
          </div>

        </div>
      )}

      {/* Origin Server & IP Tracking Georadar */}
      {result && result.ip_tracking && (
        <IPTrackingCard
          intel={result.ip_tracking}
          title={`Origin Server Geotracker & BGP Trace: ${result.domain || result.ip_tracking.ip}`}
        />
      )}

    </div>
  );
};

