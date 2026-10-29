import React from 'react';
import { Shield, Sparkles, Menu, X, Server } from 'lucide-react';
import { BackendModal } from './BackendModal';

export type NavTab =
  | 'home'
  | 'analyzer'
  | 'link-scanner'
  | 'mobile-shield'
  | 'qr-scanner'
  | 'sms-monitor'
  | 'ip-tracker'
  | 'dashboard'
  | 'history'
  | 'contact'
  | 'learning'
  | 'how-it-works';

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onSelectTab }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [backendModalOpen, setBackendModalOpen] = React.useState(false);

  const mainLinks: Array<{ id: NavTab; label: string }> = [
    { id: 'home', label: 'Home' },
    { id: 'analyzer', label: 'Analyzer' },
    { id: 'link-scanner', label: 'Link Scanner' },
    { id: 'mobile-shield', label: 'Mobile Guard' },
    { id: 'ip-tracker', label: 'IP Radar' },
    { id: 'qr-scanner', label: 'QR Scanner' },
    { id: 'sms-monitor', label: 'Live SMS' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'history', label: 'History' },
    { id: 'contact', label: 'Link Contact' },
    { id: 'learning', label: 'Learning Center' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#050c17]/90 backdrop-blur-md border-b border-emerald-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => { onSelectTab('home'); setMobileMenuOpen(false); }}
          className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:border-emerald-400 transition-colors shadow-[0_0_15px_rgba(57,232,120,0.15)]">
            <Shield className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Cyber<span className="text-emerald-400 font-extrabold ml-1">Shield</span>
          </span>
        </button>

        {/* Zone 2: Navigation Links (single line, no wrapping) */}
        <nav className="hidden xl:flex items-center gap-6 text-sm font-medium text-slate-300">
          {mainLinks.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`transition-colors whitespace-nowrap cursor-pointer relative py-1 ${
                  isActive
                    ? 'text-emerald-400 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-[0_0_8px_rgba(57,232,120,0.8)]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action + Mobile Hamburger */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setBackendModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono font-bold text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 rounded-lg hover:bg-cyan-900/50 hover:border-cyan-400 transition-all cursor-pointer whitespace-nowrap shadow-sm"
            title="Inspect Flask Backend & npm execution details"
          >
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Flask Backend</span>
            <span className="sm:hidden">API</span>
          </button>

          <button
            onClick={() => onSelectTab('analyzer')}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-lg hover:from-emerald-300 hover:to-teal-300 transition-all shadow-[0_4px_18px_rgba(57,232,120,0.3)] whitespace-nowrap cursor-pointer hover:-translate-y-0.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Analyze Message
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 text-slate-400 hover:text-white rounded-lg border border-slate-800 bg-slate-900/60"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#071322] border-b border-slate-800 px-4 pt-3 pb-5 space-y-1">
          {mainLinks.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 space-y-2">
            <button
              onClick={() => {
                setBackendModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full text-center px-4 py-2 text-xs font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 rounded-lg"
            >
              Inspect Flask Backend Architecture
            </button>
            <button
              onClick={() => {
                onSelectTab('analyzer');
                setMobileMenuOpen(false);
              }}
              className="w-full text-center px-4 py-2.5 text-xs font-bold text-slate-950 bg-emerald-400 rounded-lg shadow-lg"
            >
              Analyze Message Now
            </button>
          </div>
        </div>
      )}

      {/* Backend Architecture & Flask Modal */}
      <BackendModal
        isOpen={backendModalOpen}
        onClose={() => setBackendModalOpen(false)}
      />
    </header>
  );
};
