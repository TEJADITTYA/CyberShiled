import React from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { MessageAnalyzerView } from './components/MessageAnalyzerView';
import { LinkScannerView } from './components/LinkScannerView';
import { MobileShieldView } from './components/MobileShieldView';
import { QRScannerView } from './components/QRScannerView';
import { LiveSMSMonitorView } from './components/LiveSMSMonitorView';
import { IPTrackerView } from './components/IPTrackerView';
import { DashboardView } from './components/DashboardView';
import { HistoryView } from './components/HistoryView';
import { ContactView } from './components/ContactView';
import { LearningCenterView } from './components/LearningCenterView';
import { HowItWorksView } from './components/HowItWorksView';
import { CyberBackground } from './components/CyberBackground';
import { Shield, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = React.useState<NavTab>('home');
  const [analyzerPreset, setAnalyzerPreset] = React.useState<string | undefined>(undefined);
  const [analyzerInitialText, setAnalyzerInitialText] = React.useState<string | undefined>(undefined);
  const [ipTrackerTarget, setIpTrackerTarget] = React.useState<string | undefined>(undefined);

  // Scroll to top on tab switch
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const handleQuickAnalyze = (sampleKey: string) => {
    setAnalyzerPreset(sampleKey);
    setAnalyzerInitialText(undefined);
    setActiveTab('analyzer');
  };

  const handleReportToAnalyzer = (text: string) => {
    setAnalyzerInitialText(text);
    setAnalyzerPreset(undefined);
    setActiveTab('analyzer');
  };

  const handleTraceInIPTracker = (target: string) => {
    setIpTrackerTarget(target);
    setActiveTab('ip-tracker');
  };

  return (
    <div className="min-h-screen bg-[#050b14] text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300 relative">
      {/* Cyber background overlay, moving grid, scan rings, and particles */}
      <CyberBackground />
      
      {/* Top Bar */}
      <Navbar activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 relative z-10">
        {activeTab === 'home' && (
          <HomeView
            onNavigate={setActiveTab}
            onQuickAnalyze={handleQuickAnalyze}
          />
        )}

        {activeTab === 'analyzer' && (
          <MessageAnalyzerView
            initialExampleKey={analyzerPreset}
            initialText={analyzerInitialText}
          />
        )}

        {activeTab === 'link-scanner' && (
          <LinkScannerView
            onReportToAnalyzer={handleReportToAnalyzer}
            onTraceIP={handleTraceInIPTracker}
            onNavigate={(tab) => setActiveTab(tab as NavTab)}
          />
        )}

        {activeTab === 'mobile-shield' && (
          <MobileShieldView
            onNavigate={(tab) => setActiveTab(tab as NavTab)}
            onTraceIP={handleTraceInIPTracker}
            onReportToAnalyzer={handleReportToAnalyzer}
          />
        )}

        {activeTab === 'qr-scanner' && (
          <QRScannerView
            onReportToAnalyzer={handleReportToAnalyzer}
            onTraceIP={handleTraceInIPTracker}
          />
        )}

        {activeTab === 'sms-monitor' && (
          <LiveSMSMonitorView
            onReportToAnalyzer={handleReportToAnalyzer}
            onNavigate={(tab) => setActiveTab(tab as NavTab)}
          />
        )}

        {activeTab === 'ip-tracker' && (
          <IPTrackerView initialTarget={ipTrackerTarget} />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView onNavigate={setActiveTab} />
        )}

        {activeTab === 'history' && (
          <HistoryView onAnalyzeNew={() => setActiveTab('analyzer')} />
        )}

        {activeTab === 'contact' && (
          <ContactView />
        )}

        {activeTab === 'learning' && (
          <LearningCenterView />
        )}

        {activeTab === 'how-it-works' && (
          <HowItWorksView onNavigate={setActiveTab} />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-slate-800/80 bg-[#040810] py-10 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Shield className="w-4 h-4" />
            </div>
            <span className="font-bold text-white text-sm tracking-tight">
              Cyber<span className="text-emerald-400">Shield</span>
            </span>
            <span className="text-slate-500 ml-2">· Real-Time Social Engineering & Scam Defense</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400">
            <button onClick={() => setActiveTab('home')} className="hover:text-white transition-colors cursor-pointer">
              Home
            </button>
            <button onClick={() => setActiveTab('analyzer')} className="hover:text-white transition-colors cursor-pointer">
              Analyzer
            </button>
            <button onClick={() => setActiveTab('link-scanner')} className="hover:text-white transition-colors cursor-pointer">
              Link Scanner
            </button>
            <button onClick={() => setActiveTab('qr-scanner')} className="hover:text-white transition-colors cursor-pointer">
              QR Scanner
            </button>
            <button onClick={() => setActiveTab('sms-monitor')} className="hover:text-white transition-colors cursor-pointer">
              Live SMS
            </button>
            <button onClick={() => setActiveTab('dashboard')} className="hover:text-white transition-colors cursor-pointer">
              Dashboard
            </button>
            <button onClick={() => setActiveTab('learning')} className="hover:text-white transition-colors cursor-pointer">
              Safety Guidebook
            </button>
            <button onClick={() => setActiveTab('how-it-works')} className="hover:text-white transition-colors cursor-pointer">
              How It Works
            </button>
          </div>

          <div className="text-slate-500 font-mono text-[11px]">
            © {new Date().getFullYear()} Cyber Shield · All Rights Reserved
          </div>
        </div>
      </footer>

    </div>
  );
}
