import React from 'react';
import { NavTab } from './Navbar';
import { Shield, ArrowRight, Sparkles, CheckCircle2, Cpu, Database, Eye, Lock } from 'lucide-react';

interface HowItWorksViewProps {
  onNavigate: (tab: NavTab) => void;
}

export const HowItWorksView: React.FC<HowItWorksViewProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <Cpu className="w-3.5 h-3.5" />
          SYSTEM ARCHITECTURE & METHODOLOGY
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          How Cyber Shield <span className="text-emerald-400">Protects You</span>
        </h1>
        <p className="text-sm text-slate-300">
          A multi-layered defense pipeline combining rule-based heuristic indicators, URL structural decomposition, and real-time threat intelligence.
        </p>
      </div>

      {/* 3 Step Sequence */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="p-6 rounded-2xl bg-[#091524] border border-slate-800 space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-mono font-bold text-xl">
            01
          </div>
          <h3 className="text-base font-bold text-white">Payload Ingestion</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Suspicious inputs are ingested across multiple modalities: SMS text, email copy, voice audio transcriptions, screenshot OCR, or QR camera streams.
          </p>
          <div className="pt-2 text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Client-Side Privacy Preservation
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#091524] border border-slate-800 space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center font-mono font-bold text-xl">
            02
          </div>
          <h3 className="text-base font-bold text-white">Multi-Vector Analysis</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            The threat engine evaluates urgency keywords, brand impersonation vectors, credential exfiltration requests, and cross-references URLs against PhishTank & URLhaus feeds.
          </p>
          <div className="pt-2 text-[11px] font-mono text-teal-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Weighted Explainable Scoring
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#091524] border border-slate-800 space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-mono font-bold text-xl">
            03
          </div>
          <h3 className="text-base font-bold text-white">Actionable Advisory</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Outputs a calibrated 0–100% Risk Score, detected threat category, explainable signal breakdown, blocking malicious redirects and providing an official PDF report.
          </p>
          <div className="pt-2 text-[11px] font-mono text-cyan-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verifiable Security Certificate
          </div>
        </div>

      </div>

      {/* Deep Architecture Card */}
      <div className="p-8 rounded-3xl bg-[#091524] border border-slate-800 space-y-6 shadow-2xl">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-400" />
          Threat Engine Component Pipeline
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <strong className="text-emerald-400 block font-mono">1. Lexical Classifier</strong>
            <p className="text-slate-400">
              Scans message bodies for 120+ known social engineering phrases across bank KYC, UPI, OTP theft, and fake jobs.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <strong className="text-teal-400 block font-mono">2. URL Deobfuscator</strong>
            <p className="text-slate-400">
              Inspects redirect shorteners, suspicious TLDs (.xyz, .top), direct IP addresses, and brand typosquatting.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <strong className="text-cyan-400 block font-mono">3. QR & UPI Guard</strong>
            <p className="text-slate-400">
              Deconstructs UPI strings to expose hidden deduction amounts and verify payee virtual payment addresses.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <strong className="text-purple-400 block font-mono">4. Live SMS Gateway</strong>
            <p className="text-slate-400">
              Ingests real-time Twilio webhooks, masking phone numbers and evaluating incoming threats on arrival.
            </p>
          </div>
        </div>

        <div className="pt-4 text-center">
          <button
            onClick={() => onNavigate('analyzer')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs bg-emerald-400 text-slate-950 hover:bg-emerald-300 transition-all cursor-pointer shadow-lg"
          >
            Launch Message Analyzer <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
