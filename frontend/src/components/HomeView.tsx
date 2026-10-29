import React from 'react';
import { NavTab } from './Navbar';
import { Shield, Sparkles, ArrowRight, QrCode, Link2, MessageSquare, AlertTriangle, ShieldCheck, Activity, Eye, FileText, CheckCircle2, Crosshair, Globe, Smartphone } from 'lucide-react';

interface HomeViewProps {
  onNavigate: (tab: NavTab) => void;
  onQuickAnalyze: (sampleKey: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onQuickAnalyze }) => {
  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 overflow-hidden">
        {/* Subtle background radar */}
        <div className="absolute top-1/2 right-10 -translate-y-1/2 w-96 h-96 rounded-full border border-emerald-500/10 pointer-events-none hidden lg:block">
          <div className="absolute inset-8 rounded-full border border-emerald-500/10" />
          <div className="absolute inset-20 rounded-full border border-emerald-500/10" />
          <div className="absolute inset-32 rounded-full border border-emerald-500/10" />
          <div className="absolute inset-0 rounded-full border-t border-emerald-400/40 animate-radar" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                AI-POWERED FRAUD DETECTION
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08]">
                Stop scams <span className="text-emerald-400 underline decoration-emerald-500/40 decoration-wavy">before</span> they compromise you.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
                Cyber Shield evaluates suspicious SMS, emails, WhatsApp messages, payment requests, and URLs in real time to uncover fraud patterns, social engineering, and fake links before you act.
              </p>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate('analyzer')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 hover:from-emerald-300 hover:to-teal-300 shadow-[0_6px_25px_rgba(57,232,120,0.35)] transition-all cursor-pointer hover:-translate-y-0.5"
                >
                  <Sparkles className="w-4 h-4" />
                  Analyze Suspicious Message
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <button
                  onClick={() => onNavigate('link-scanner')}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm bg-slate-900/80 text-slate-200 border border-slate-700 hover:border-emerald-500/50 hover:text-white transition-all cursor-pointer"
                >
                  <Link2 className="w-4 h-4 text-emerald-400" />
                  Scan URL
                </button>

                <button
                  onClick={() => onNavigate('ip-tracker')}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm bg-slate-900/80 text-slate-200 border border-slate-700 hover:border-cyan-500/50 hover:text-white transition-all cursor-pointer"
                >
                  <Crosshair className="w-4 h-4 text-cyan-400" />
                  IP Radar
                </button>

                <button
                  onClick={() => onNavigate('qr-scanner')}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm bg-slate-900/80 text-slate-200 border border-slate-700 hover:border-purple-500/50 hover:text-white transition-all cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-purple-400" />
                  QR Scanner
                </button>

                <button
                  onClick={() => onNavigate('mobile-shield')}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 hover:border-emerald-400 hover:text-white transition-all cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  Mobile Guard
                </button>
              </div>

              {/* Trust Metric Stats */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 max-w-lg">
                <div>
                  <div className="text-2xl font-black text-white font-mono tabular-nums">99.4%</div>
                  <div className="text-xs text-slate-400">Pattern Accuracy</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-emerald-400 font-mono tabular-nums">100+</div>
                  <div className="text-xs text-slate-400">Scam Signatures</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-cyan-400 font-mono tabular-nums">24/7</div>
                  <div className="text-xs text-slate-400">Real-Time Threat Feed</div>
                </div>
              </div>
            </div>

            {/* Right Interactive Mock Telemetry Card with Floating HUD Chips */}
            <div className="lg:col-span-5 relative">
              {/* Floating HUD chips */}
              <div className="absolute -top-4 -right-4 z-20 px-3 py-1.5 rounded-xl bg-[#0c2818]/90 border border-emerald-400/50 text-emerald-300 text-xs font-bold shadow-[0_0_15px_rgba(57,232,120,0.2)] floating-card-hud hidden sm:flex items-center gap-1.5 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                AI Protection Active
              </div>

              <div className="absolute -bottom-4 -left-4 z-20 px-3 py-1.5 rounded-xl bg-[#0b1b30]/90 border border-cyan-400/50 text-cyan-300 text-xs font-bold shadow-[0_0_15px_rgba(41,217,255,0.2)] floating-card-hud hidden sm:flex items-center gap-1.5 backdrop-blur-md" style={{ animationDelay: '-2s' }}>
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                Threats Blocked: 12K+
              </div>

              <div className="bg-[#091524] border border-slate-700/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden cyber-panel">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-mono font-bold text-slate-300">LIVE THREAT INTERCEPTOR</span>
                  </div>
                  <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    MONITORING
                  </span>
                </div>

                {/* Simulated intercepted payload */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">Incoming SMS · Unknown Sender</span>
                    <span className="font-mono text-[10px]">Just now</span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono leading-relaxed">
                    "URGENT: Your SBI Bank account is frozen due to pending KYC. Click link immediately to verify ATM PIN & OTP: https://sbi-verify-kyc.xyz"
                  </p>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-cyan-400 flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      ORIGIN IP: 194.26.29.112 (Moscow, RU)
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/30">
                      AS20860 BULLETPROOF
                    </span>
                  </div>
                </div>

                {/* Animated Cyber Sweep Line */}
                <div className="scan-line mb-4" />

                {/* Threat verdict breakdown */}
                <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/40 flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-red-300">CRITICAL PHISHING INTERCEPTED</div>
                      <div className="text-[11px] text-slate-400">Credential theft & bank impersonation</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold font-mono text-red-400">92%</div>
                    <div className="text-[10px] text-slate-500 uppercase">Risk Level</div>
                  </div>
                </div>

                {/* Detected vectors tags */}
                <div className="flex flex-wrap gap-1.5 text-[11px] font-mono text-slate-400">
                  <span className="px-2 py-1 rounded bg-slate-800/80 text-slate-300">⚠️ Fake KYC Link</span>
                  <span className="px-2 py-1 rounded bg-slate-800/80 text-slate-300">🏦 Brand Spoofing</span>
                  <span className="px-2 py-1 rounded bg-slate-800/80 text-slate-300">🔐 OTP Solicit</span>
                  <span className="px-2 py-1 rounded bg-slate-800/80 text-slate-300">⏰ High Urgency</span>
                </div>

                {/* Quick test buttons */}
                <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Try live analysis:</span>
                  <button
                    onClick={() => onQuickAnalyze('bank')}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    Test this message <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Cyber HUD Threat Intelligence Network Map Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 lg:p-8 rounded-3xl bg-[#08121f]/90 border border-slate-700/80 shadow-2xl relative overflow-hidden cyber-panel">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Main Network Map (7 cols) */}
            <div className="lg:col-span-8 p-5 rounded-2xl bg-[#060e18] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase">
                  THREAT INTELLIGENCE NEURAL GRID
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono font-bold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE
                </span>
              </div>

              {/* Graphical Network Matrix */}
              <div className="relative h-56 rounded-xl bg-gradient-to-b from-[#061522] to-[#040a12] border border-slate-800 overflow-hidden">
                {/* Glowing Nodes */}
                <div className="absolute top-[20%] left-[16%] w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399,0_0_24px_#34d399] animate-pulse" />
                <div className="absolute top-[55%] left-[26%] w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_12px_#38bdf8,0_0_24px_#38bdf8] animate-pulse" style={{ animationDelay: '0.4s' }} />
                <div className="absolute top-[30%] left-[52%] w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399,0_0_24px_#34d399] animate-pulse" style={{ animationDelay: '0.8s' }} />
                <div className="absolute top-[62%] left-[58%] w-3 h-3 rounded-full bg-purple-400 shadow-[0_0_12px_#c084fc,0_0_24px_#c084fc] animate-pulse" style={{ animationDelay: '1.2s' }} />
                <div className="absolute top-[42%] left-[74%] w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_12px_#38bdf8,0_0_24px_#38bdf8] animate-pulse" style={{ animationDelay: '1.6s' }} />
                <div className="absolute top-[18%] left-[82%] w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399,0_0_24px_#34d399] animate-pulse" style={{ animationDelay: '2s' }} />

                {/* Laser Circuit Lines */}
                <div className="absolute top-[25%] left-[18%] w-[32%] h-px bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent rotate-[22deg] shadow-[0_0_8px_#34d399]" />
                <div className="absolute top-[58%] left-[26%] w-[32%] h-px bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent -rotate-[12deg] shadow-[0_0_8px_#38bdf8]" />
                <div className="absolute top-[35%] left-[52%] w-[24%] h-px bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent rotate-[18deg] shadow-[0_0_8px_#34d399]" />
                <div className="absolute top-[62%] left-[56%] w-[22%] h-px bg-gradient-to-r from-transparent via-purple-400/80 to-transparent -rotate-[18deg] shadow-[0_0_8px_#c084fc]" />
                <div className="absolute top-[28%] left-[68%] w-[18%] h-px bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent rotate-[10deg] shadow-[0_0_8px_#38bdf8]" />

                {/* Radar Grid Backdrop */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(52,211,153,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(52,211,153,0.03)_1px,transparent_1px)] bg-[size:24px_24px]" />
              </div>

              {/* Readout Telemetry Row */}
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 block mb-0.5">THREAT SIGNATURES</span>
                  <span className="text-lg font-mono font-black text-white tabular-nums">2,846</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 block mb-0.5">ATTACKS BLOCKED</span>
                  <span className="text-lg font-mono font-black text-emerald-400 tabular-nums">1,982</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 block mb-0.5">RISK INDEX</span>
                  <span className="text-lg font-mono font-black text-cyan-400">Nominal</span>
                </div>
              </div>
            </div>

            {/* Side Panel: Security Grid Signal Levels (4 cols) */}
            <div className="lg:col-span-4 p-5 rounded-2xl bg-[#060e18] border border-slate-800 space-y-4 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase block mb-4">
                  DEFENSE SENSOR LEVELS
                </span>

                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">Phishing Links</span>
                      <span className="font-mono text-emerald-400">94%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(57,232,120,0.6)]" style={{ width: '94%' }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">Impersonation</span>
                      <span className="font-mono text-emerald-400">88%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(57,232,120,0.6)]" style={{ width: '88%' }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">Payment Fraud</span>
                      <span className="font-mono text-emerald-400">91%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(57,232,120,0.6)]" style={{ width: '91%' }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">Fake Lottery / Prize</span>
                      <span className="font-mono text-emerald-400">82%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(57,232,120,0.6)]" style={{ width: '82%' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
                ⚡ Neural heuristic filters update continuously on every incoming message.
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Quick Security Tools Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <button
            onClick={() => onNavigate('analyzer')}
            className="p-5 rounded-2xl bg-[#091524] border border-slate-800 hover:border-emerald-500/40 transition-all text-left group cursor-pointer shadow-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-1">Message Analyzer</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Detect fake prizes, bank KYC scams, OTP fraud, and manipulative SMS or DMs.
            </p>
          </button>

          <button
            onClick={() => onNavigate('link-scanner')}
            className="p-5 rounded-2xl bg-[#091524] border border-slate-800 hover:border-cyan-500/40 transition-all text-left group cursor-pointer shadow-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Link2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-1">URL Link Scanner</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Scan suspicious URLs for shorteners, spoofed domains, and PhishTank blacklist matches.
            </p>
          </button>

          <button
            onClick={() => onNavigate('ip-tracker')}
            className="p-5 rounded-2xl bg-[#091524] border border-slate-800 hover:border-cyan-500/40 transition-all text-left group cursor-pointer shadow-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Crosshair className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-1">IP Threat Radar</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Unmask sender IP coordinates, autonomous system BGP routes, and bulletproof servers.
            </p>
          </button>

          <button
            onClick={() => onNavigate('qr-scanner')}
            className="p-5 rounded-2xl bg-[#091524] border border-slate-800 hover:border-purple-500/40 transition-all text-left group cursor-pointer shadow-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-1">QR Code Scanner</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Scan QR codes with your camera or image. Verify web targets & UPI payments safely.
            </p>
          </button>

          <button
            onClick={() => onNavigate('sms-monitor')}
            className="p-5 rounded-2xl bg-[#091524] border border-slate-800 hover:border-emerald-500/40 transition-all text-left group cursor-pointer shadow-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-1">Live SMS Shield</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time inbound SMS threat feed, automated risk assessment, and live test injector.
            </p>
          </button>
        </div>
      </section>

      {/* Detected Threat Vectors Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">COMPREHENSIVE COVERAGE</div>
          <h2 className="text-3xl font-bold text-white tracking-tight">What does Cyber Shield detect?</h2>
          <p className="text-sm text-slate-400">
            Our multi-vector threat engine evaluates social engineering triggers, manipulative phrasing, and illicit payment requests.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              title: 'Bank & KYC Account Freezes',
              desc: 'Messages threatening immediate deactivation of debit cards, bank accounts, or YONO/NetBanking access.',
              example: 'bank',
              icon: '🏦'
            },
            {
              title: 'UPI & Reverse Payment Scams',
              desc: 'Fraudulent payment requests asking you to enter your UPI PIN or accept unexpected money reversal links.',
              example: 'upi',
              icon: '💳'
            },
            {
              title: 'Fake Prize & Lottery Claims',
              desc: 'Unsolicited lottery wins, cashback prizes, or lucky draw claims that require processing fees to unlock.',
              example: 'prize',
              icon: '🎁'
            },
            {
              title: 'OTP & 2FA Exfiltration',
              desc: 'Social engineering prompts trying to extract single-use verification codes under the guise of security upgrades.',
              example: 'otp',
              icon: '🔐'
            },
            {
              title: 'High-Yield Investment Traps',
              desc: 'Guaranteed daily profit promises, automated crypto trading algorithms, and fake VIP wealth groups.',
              example: 'investment',
              icon: '📈'
            },
            {
              title: 'Courier & Customs Impersonation',
              desc: 'Fake delivery failure notices urging you to pay a nominal re-delivery fee via malicious payment portals.',
              example: 'delivery',
              icon: '📦'
            }
          ].map((item, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-[#091524] border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="text-base font-bold text-white mb-1.5">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80">
                <button
                  onClick={() => onQuickAnalyze(item.example)}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  Load Example & Analyze <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3-Step Workflow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-[#091524] border border-slate-800 rounded-3xl p-8 lg:p-12">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">HOW IT WORKS</span>
            <h2 className="text-3xl font-bold text-white">Three steps to peace of mind</h2>
            <p className="text-xs text-slate-400">Verify suspicious communication before sharing personal data or sending funds.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-black text-xl flex items-center justify-center mx-auto shadow-lg">
                01
              </div>
              <h3 className="font-bold text-white text-base">Paste or Upload</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                Paste the SMS, email text, voice transcript, or upload a screenshot directly into the analyzer.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/30 font-mono font-black text-xl flex items-center justify-center mx-auto shadow-lg">
                02
              </div>
              <h3 className="font-bold text-white text-base">Threat Engine Scan</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                Cyber Shield extracts urgency signals, evaluates embedded URLs, and maps social engineering patterns.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono font-black text-xl flex items-center justify-center mx-auto shadow-lg">
                03
              </div>
              <h3 className="font-bold text-white text-base">Review & Protect</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                Get an instant 0–100% Risk Score, explainable indicators, security advice, and a formal incident report.
              </p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <button
              onClick={() => onNavigate('analyzer')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-emerald-400 text-slate-950 hover:bg-emerald-300 transition-all cursor-pointer shadow-lg"
            >
              Start Analysis Now <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
