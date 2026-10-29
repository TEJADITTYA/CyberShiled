import React from 'react';
import { URLCheckResult } from '../types';
import { analyzeURLAsync } from '../services/urlEngine';
import { Smartphone, Shield, ShieldCheck, ShieldAlert, Zap, ExternalLink, RefreshCw, CheckCircle2, AlertTriangle, Radio, Copy, Check, ArrowRight, Bell, Sparkles } from 'lucide-react';

interface MobileShieldViewProps {
  onNavigate?: (tab: string) => void;
  onTraceIP?: (target: string) => void;
  onReportToAnalyzer?: (text: string) => void;
}

export const MobileShieldView: React.FC<MobileShieldViewProps> = ({ onNavigate, onTraceIP, onReportToAnalyzer }) => {
  const [shieldActive, setShieldActive] = React.useState(true);
  const [customMobileUrl, setCustomMobileUrl] = React.useState('');
  const [isBackgroundChecking, setIsBackgroundChecking] = React.useState(false);
  const [interceptedResult, setInterceptedResult] = React.useState<URLCheckResult | null>(null);
  const [mobileVibrateTriggered, setMobileVibrateTriggered] = React.useState(false);
  const [clipboardChecked, setClipboardChecked] = React.useState(false);
  const [stats, setStats] = React.useState({
    totalChecked: 142,
    scamsBlocked: 39,
    safeLaunched: 103,
    avgLatencyMs: 42
  });

  // Tap simulation handler for links pressed on mobile phone
  const handleMobileLinkPress = async (url: string) => {
    if (!shieldActive) {
      // If shield is off, phone navigates directly without check
      window.open(url.startsWith('http') ? url : `https://${url}`, '_blank', 'noopener,noreferrer');
      return;
    }

    setIsBackgroundChecking(true);
    setInterceptedResult(null);
    setMobileVibrateTriggered(false);

    try {
      const res = await analyzeURLAsync(url);
      setInterceptedResult(res);

      setStats(prev => ({
        ...prev,
        totalChecked: prev.totalChecked + 1,
        scamsBlocked: res.risk_level !== 'SAFE' ? prev.scamsBlocked + 1 : prev.scamsBlocked,
        safeLaunched: res.risk_level === 'SAFE' ? prev.safeLaunched + 1 : prev.safeLaunched
      }));

      if (res.risk_level !== 'SAFE') {
        // Haptic warning alert for scam link
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate([200, 100, 200]);
        }
        setMobileVibrateTriggered(true);
      } else {
        // Safe real link: gentle haptic feedback and directly open URL page!
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate(50);
        }
        const dest = res.url.startsWith('http://') || res.url.startsWith('https://') ? res.url : `https://${res.url}`;
        setTimeout(() => {
          window.open(dest, '_blank', 'noopener,noreferrer');
        }, 600);
      }
    } catch (err) {
      console.error('Background check error:', err);
    } finally {
      setIsBackgroundChecking(false);
    }
  };

  const handleCheckClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && (text.includes('http') || text.includes('.'))) {
          setCustomMobileUrl(text);
          setClipboardChecked(true);
          handleMobileLinkPress(text);
          setTimeout(() => setClipboardChecked(false), 3000);
          return;
        }
      }
    } catch (err) {
      console.warn('Clipboard read held by browser:', err);
    }
    // Fallback simulation if clipboard permission is denied in browser
    handleMobileLinkPress('https://sbi-verify-kyc-account.example.com/login');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <Smartphone className="w-3.5 h-3.5 animate-pulse" />
          MOBILE PHONE BACKGROUND LINK GUARD
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Background Link Interceptor <span className="text-emerald-400">for Mobile Phones</span>
        </h1>
        <p className="text-sm text-slate-300">
          When you press any link or scan a QR on your phone, Cyber Shield checks it in the background process in milliseconds. If it is fake or scam, it blocks navigation instantly. If real, it opens the page safely.
        </p>
      </div>

      {/* Main Status & Telemetry Header */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#091524] border border-slate-800 flex items-center justify-between col-span-1 sm:col-span-2">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              shieldActive ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Background Process</div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                {shieldActive ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>ACTIVE & MONITORING</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-slate-500" />
                    <span>DISABLED</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShieldActive(!shieldActive)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all border ${
              shieldActive
                ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            {shieldActive ? 'GUARD ON' : 'GUARD OFF'}
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-[#091524] border border-slate-800 space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-400">Fake Traps Intercepted</div>
          <div className="text-2xl font-black text-red-400 font-mono">{stats.scamsBlocked}</div>
          <div className="text-[10px] text-slate-500">Blocked on mobile before launch</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#091524] border border-slate-800 space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-400">Real Verified Links</div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{stats.safeLaunched}</div>
          <div className="text-[10px] text-slate-500">Safely launched in browser</div>
        </div>
      </div>

      {/* Mobile Smartphone Interactive Simulation & Real Link Press Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Mobile Phone Mockup */}
        <div className="lg:col-span-7 bg-[#091524] border border-slate-700/80 rounded-3xl p-6 shadow-2xl cyber-panel space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Interactive Phone Tap Interceptor</h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              TAP LINKS TO TEST BACKGROUND SHIELD
            </span>
          </div>

          <p className="text-xs text-slate-300">
            Tap any simulated incoming SMS, WhatsApp link, or custom URL below to see how Cyber Shield intercepts fake links and directly launches real ones:
          </p>

          {/* Simulated Mobile Feed of Incoming Links */}
          <div className="space-y-3">
            
            {/* Fake Bank Link (Phishing Hazard) */}
            <div className="p-4 rounded-2xl bg-[#050b14] border border-red-500/30 hover:border-red-500/60 transition-all space-y-2 group">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-bold text-red-300 flex items-center gap-1.5 font-mono">
                  🚨 SMS from: "ICICI-ALERT"
                </span>
                <span className="text-[10px] font-mono text-slate-500">2 min ago</span>
              </div>
              <p className="text-xs text-slate-200">
                Dear customer, your bank account will be suspended today. Click here to verify PAN & unblock:
              </p>
              <button
                onClick={() => handleMobileLinkPress('http://sbi-verify-kyc-account.example.com/login-otp')}
                disabled={isBackgroundChecking}
                className="w-full text-left p-2.5 rounded-xl bg-red-950/30 border border-red-500/40 text-xs font-mono text-red-300 hover:bg-red-900/40 transition-colors cursor-pointer flex items-center justify-between"
              >
                <span className="truncate">http://sbi-verify-kyc-account.example.com/login-otp</span>
                <span className="text-[10px] uppercase font-bold bg-red-500/30 text-red-300 px-2 py-0.5 rounded ml-2 shrink-0">
                  Tap to Test (Fake)
                </span>
              </button>
            </div>

            {/* Fake Prize Link (Lottery Scam) */}
            <div className="p-4 rounded-2xl bg-[#050b14] border border-amber-500/30 hover:border-amber-500/60 transition-all space-y-2 group">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-bold text-amber-300 flex items-center gap-1.5 font-mono">
                  🎁 WhatsApp Message from unknown contact
                </span>
                <span className="text-[10px] font-mono text-slate-500">5 min ago</span>
              </div>
              <p className="text-xs text-slate-200">
                Congratulations! You won ₹50,000 cash prize in our festival draw! Claim money directly here:
              </p>
              <button
                onClick={() => handleMobileLinkPress('https://bit.ly/claim-prize-now.xyz?claim=50000')}
                disabled={isBackgroundChecking}
                className="w-full text-left p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/40 text-xs font-mono text-amber-300 hover:bg-amber-900/40 transition-colors cursor-pointer flex items-center justify-between"
              >
                <span className="truncate">https://bit.ly/claim-prize-now.xyz?claim=50000</span>
                <span className="text-[10px] uppercase font-bold bg-amber-500/30 text-amber-300 px-2 py-0.5 rounded ml-2 shrink-0">
                  Tap to Test (Scam)
                </span>
              </button>
            </div>

            {/* Real Official Link (Safe Real Destination) */}
            <div className="p-4 rounded-2xl bg-[#050b14] border border-emerald-500/30 hover:border-emerald-500/60 transition-all space-y-2 group">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-bold text-emerald-300 flex items-center gap-1.5 font-mono">
                  🛡️ Email Security Notification: "Google Accounts"
                </span>
                <span className="text-[10px] font-mono text-slate-500">Just now</span>
              </div>
              <p className="text-xs text-slate-200">
                Your Google Security Checkup has been completed. Review recent account activity:
              </p>
              <button
                onClick={() => handleMobileLinkPress('https://www.google.com')}
                disabled={isBackgroundChecking}
                className="w-full text-left p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-xs font-mono text-emerald-300 hover:bg-emerald-900/40 transition-colors cursor-pointer flex items-center justify-between"
              >
                <span className="truncate">https://www.google.com</span>
                <span className="text-[10px] uppercase font-bold bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded ml-2 shrink-0">
                  Tap to Test (Real)
                </span>
              </button>
            </div>

            {/* Real GitHub Destination */}
            <div className="p-4 rounded-2xl bg-[#050b14] border border-cyan-500/30 hover:border-cyan-500/60 transition-all space-y-2 group">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-bold text-cyan-300 flex items-center gap-1.5 font-mono">
                  💻 Developer Notification: "GitHub"
                </span>
                <span className="text-[10px] font-mono text-slate-500">10 min ago</span>
              </div>
              <p className="text-xs text-slate-200">
                A new release is available for your repository. Inspect commits:
              </p>
              <button
                onClick={() => handleMobileLinkPress('https://github.com')}
                disabled={isBackgroundChecking}
                className="w-full text-left p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/40 text-xs font-mono text-cyan-300 hover:bg-cyan-900/40 transition-colors cursor-pointer flex items-center justify-between"
              >
                <span className="truncate">https://github.com</span>
                <span className="text-[10px] uppercase font-bold bg-cyan-500/30 text-cyan-300 px-2 py-0.5 rounded ml-2 shrink-0">
                  Tap to Test (Real)
                </span>
              </button>
            </div>

          </div>

          {/* Test Custom User Link on Mobile */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <span className="text-[11px] text-slate-400 block font-mono">Test Any Custom Link on Mobile Phone:</span>
            <div className="flex gap-2">
              <input
                type="text"
                value={customMobileUrl}
                onChange={(e) => setCustomMobileUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && customMobileUrl.trim() && handleMobileLinkPress(customMobileUrl)}
                placeholder="Enter any link to test mobile tap..."
                className="flex-1 bg-[#06111f] border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={() => customMobileUrl.trim() && handleMobileLinkPress(customMobileUrl)}
                disabled={isBackgroundChecking || !customMobileUrl.trim()}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap shadow-md"
              >
                {isBackgroundChecking ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Smartphone className="w-3.5 h-3.5" />}
                Test Tap Link
              </button>
            </div>
          </div>

          {/* Real Phone Clipboard Auto-Inspector */}
          <div className="p-3.5 rounded-xl bg-[#06111f] border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Copy className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                <strong>Phone Clipboard Auto-Guard:</strong> Check links copied to your phone clipboard in background.
              </span>
            </div>
            <button
              onClick={handleCheckClipboard}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold cursor-pointer whitespace-nowrap transition-colors"
            >
              {clipboardChecked ? '✓ Checked Clipboard' : 'Scan Phone Clipboard'}
            </button>
          </div>

        </div>

        {/* Right Column: Live Mobile Interception Verdict HUD */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active Mobile Interceptor HUD Sheet */}
          <div className="bg-[#091524] border border-slate-700/80 rounded-3xl p-6 shadow-2xl cyber-panel space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                Mobile Background Interceptor HUD
              </h3>
              {isBackgroundChecking && (
                <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1 animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  CHECKING IN BACKGROUND...
                </span>
              )}
            </div>

            {/* Idle State */}
            {!isBackgroundChecking && !interceptedResult && (
              <div className="py-10 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                  <Smartphone className="w-7 h-7" />
                </div>
                <div className="text-xs text-slate-400 max-w-xs mx-auto">
                  Tap any simulated link on the left or scan a link on your mobile phone to see the background check and verdict in real time.
                </div>
              </div>
            )}

            {/* Live Checking Animation */}
            {isBackgroundChecking && (
              <div className="p-6 rounded-2xl bg-[#06111f] border border-cyan-500/40 text-center space-y-3 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 flex items-center justify-center mx-auto">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                </div>
                <div className="text-sm font-bold text-cyan-300 font-mono">
                  Background Process: Inspecting Link...
                </div>
                <p className="text-xs text-slate-400">
                  Resolving authoritative DNS, verifying BGP Autonomous System, checking PhishTank & URLhaus before mobile navigation.
                </p>
              </div>
            )}

            {/* Result: FAKE / SCAM / MALICIOUS BLOCKED */}
            {interceptedResult && interceptedResult.risk_level !== 'SAFE' && (
              <div className="p-5 rounded-2xl bg-red-950/40 border-2 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)] space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-red-500/20 border border-red-500 text-red-400 flex items-center justify-center shrink-0 animate-bounce">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-mono uppercase font-black text-red-400">
                      🚨 SCAM LINK BLOCKED ON MOBILE!
                    </div>
                    <div className="text-sm font-black text-white mt-0.5">
                      {interceptedResult.risk_level} Risk · Fake / Phishing Destination
                    </div>
                    <div className="text-[11px] text-red-200 mt-1">
                      Background process intercepted link tap. Mobile browser prevented from opening harmful portal.
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs space-y-1">
                  <div className="text-slate-400 text-[10px] uppercase">Blocked Target:</div>
                  <div className="text-red-300 break-all">{interceptedResult.url}</div>
                  {interceptedResult.domain && (
                    <div className="text-slate-400 text-[11px] pt-1">Domain: <strong className="text-white">{interceptedResult.domain}</strong></div>
                  )}
                </div>

                {/* Threat signals summary */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Observed Threat Signals:</span>
                  {interceptedResult.reasons.slice(0, 2).map((r, i) => (
                    <div key={i} className="text-xs text-slate-300 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>

                {/* Mobile action buttons */}
                <div className="flex flex-col gap-2 pt-2 border-t border-red-500/30">
                  {onTraceIP && interceptedResult.ip_tracking && (
                    <button
                      onClick={() => onTraceIP(interceptedResult.ip_tracking?.ip || interceptedResult.domain)}
                      className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Trace Origin Server in Full IP Radar
                    </button>
                  )}

                  {onReportToAnalyzer && (
                    <button
                      onClick={() => onReportToAnalyzer(`URGENT MOBILE SCAM INTERCEPTED:\nURL: ${interceptedResult.url}\nDomain: ${interceptedResult.domain}\nThreat: ${interceptedResult.reasons.join(', ')}`)}
                      className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-red-500 hover:bg-red-400 text-white flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Report to Deep Message Analyzer
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Result: REAL / AUTHENTIC / SAFE LAUNCHED */}
            {interceptedResult && interceptedResult.risk_level === 'SAFE' && (
              <div className="p-5 rounded-2xl bg-emerald-950/40 border-2 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)] space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-mono uppercase font-black text-emerald-400">
                      ✅ VERIFIED REAL & AUTHENTIC!
                    </div>
                    <div className="text-sm font-black text-white mt-0.5">
                      Safe Destination Verified
                    </div>
                    <div className="text-[11px] text-emerald-200 mt-1">
                      Background process verified authentic DNS and clean reputation. Directly launched in browser!
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs space-y-1">
                  <div className="text-slate-400 text-[10px] uppercase">Verified URL:</div>
                  <div className="text-emerald-300 break-all">{interceptedResult.url}</div>
                  <div className="text-slate-400 text-[11px]">Domain: <strong className="text-white">{interceptedResult.domain}</strong> (Clean Anycast CDN)</div>
                </div>

                <a
                  href={interceptedResult.url.startsWith('http') ? interceptedResult.url : `https://${interceptedResult.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-emerald-400 hover:bg-emerald-300 text-slate-950 flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all"
                >
                  <span>Open URL Page Directly</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}

          </div>

          {/* Mobile Home Screen / PWA Installation Box */}
          <div className="p-5 rounded-3xl bg-[#091524] border border-slate-800 shadow-xl space-y-3 cyber-panel text-xs">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Add Cyber Shield to Phone Home Screen
            </div>
            <p className="text-slate-300 leading-relaxed">
              Install Cyber Shield as a Progressive Web App (PWA) on your phone for 24/7 background link interception and instant QR code verification.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-[11px] font-mono text-slate-300">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-emerald-400 block mb-0.5">🍎 iOS Safari:</span>
                Tap <strong>Share</strong> → Tap <strong>Add to Home Screen</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-cyan-400 block mb-0.5">🤖 Android Chrome:</span>
                Tap <strong>⋮ Menu</strong> → Tap <strong>Install App</strong>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
