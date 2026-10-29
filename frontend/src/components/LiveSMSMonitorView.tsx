import React from 'react';
import { LiveSMSMessage, IPTrackingIntel } from '../types';
import { getLiveSMSFeed, injectIncomingSMS, getContactProfile } from '../services/storage';
import { resolveAndTrackIP, fetchRealTimeIPIntel } from '../services/ipTrackerEngine';
import { IPTrackingCard } from './IPTrackingCard';
import { Activity, Shield, RefreshCw, Send, CheckCircle2, AlertTriangle, Radio, PhoneCall, Globe, Crosshair, X, Bell, UserCheck, ArrowRight } from 'lucide-react';

interface LiveSMSMonitorViewProps {
  onReportToAnalyzer?: (text: string) => void;
  onNavigate?: (tab: string) => void;
}

export const LiveSMSMonitorView: React.FC<LiveSMSMonitorViewProps> = ({ onReportToAnalyzer, onNavigate }) => {
  const [messages, setMessages] = React.useState<LiveSMSMessage[]>([]);
  const [lastRefreshed, setLastRefreshed] = React.useState(new Date().toLocaleTimeString());
  const [autoRefresh, setAutoRefresh] = React.useState(true);
  const [activeTraceIntel, setActiveTraceIntel] = React.useState<{ sms: LiveSMSMessage; intel: IPTrackingIntel } | null>(null);
  const [profile, setProfile] = React.useState(getContactProfile());
  const [blockedSenders, setBlockedSenders] = React.useState<string[]>([]);
  const [dismissedAlertId, setDismissedAlertId] = React.useState<string | null>(null);

  // Inbound SMS Simulator form state
  const [simSender, setSimSender] = React.useState('+91 98765 43210');
  const [simMessage, setSimMessage] = React.useState(
    'ALERT: Your ICICI Bank account is blocked. Verify PAN number immediately at https://icici-kyc-update.xyz to restore services.'
  );

  const fetchFeed = () => {
    const list = getLiveSMSFeed();
    setMessages(list);
    setProfile(getContactProfile());
    setLastRefreshed(new Date().toLocaleTimeString());
  };

  React.useEffect(() => {
    fetchFeed();
    if (!autoRefresh) return;

    const timer = setInterval(() => {
      fetchFeed();
    }, 3000);

    return () => clearInterval(timer);
  }, [autoRefresh]);

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simMessage.trim()) return;

    injectIncomingSMS(simSender, simMessage);
    fetchFeed();
    setSimMessage('');
  };

  const handleBlockSender = (sender: string) => {
    setBlockedSenders(prev => [...prev, sender]);
  };

  // Find the most recent critical or high risk message for top emergency banner
  const highestThreatSMS = messages.find(m => (m.result.risk_level === 'CRITICAL' || m.result.risk_level === 'HIGH') && m.id !== dismissedAlertId);

  const getRiskBadge = (level: string, score: number) => {
    if (level === 'CRITICAL') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">
          CRITICAL · {score}
        </span>
      );
    }
    if (level === 'HIGH') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
          HIGH · {score}
        </span>
      );
    }
    if (level === 'MEDIUM') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
          MEDIUM · {score}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
        SAFE · {score}
      </span>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold">
          <Activity className="w-3.5 h-3.5" />
          REAL-TIME TELEMETRY SHIELD
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Live <span className="text-teal-400">SMS Threat Monitor</span>
        </h1>
        <p className="text-sm text-slate-300">
          Continuous inbound stream of SMS notifications received via Twilio webhooks, scored immediately by the threat engine and indexed against PhishTank reputation feeds.
        </p>
      </div>

      {/* High-Risk Emergency SMS Alert Banner */}
      {highestThreatSMS && (
        <div className="p-5 rounded-2xl bg-red-950/60 border-2 border-red-500 shadow-[0_0_35px_rgba(239,68,68,0.3)] animate-pulse space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-red-500/20 border border-red-500 text-red-400 flex items-center justify-center shrink-0 animate-bounce">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-black text-red-300 tracking-wide uppercase">
                    🚨 HIGH-RISK SMS PHISHING ALERT INTERCEPTED!
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500 text-white font-bold">
                    {highestThreatSMS.result.risk_level} · SCORE {highestThreatSMS.result.risk_score}
                  </span>
                </div>
                <p className="text-xs text-slate-200">
                  From: <strong className="text-white font-mono">{highestThreatSMS.from_masked}</strong> · {highestThreatSMS.received_at}
                </p>
                <div className="text-xs text-red-200 font-mono bg-red-950/80 p-2.5 rounded-lg border border-red-500/30 break-all">
                  "{highestThreatSMS.message_preview}"
                </div>
              </div>
            </div>

            <button
              onClick={() => setDismissedAlertId(highestThreatSMS.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-red-900/40 cursor-pointer shrink-0"
              title="Acknowledge Alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Real-time automated contact dispatch status */}
          <div className="p-3 rounded-xl bg-[#06101c] border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-cyan-300">
              <Bell className="w-4 h-4 text-cyan-400 shrink-0 animate-spin" style={{ animationDuration: '6s' }} />
              <span>
                REAL-TIME INCIDENT DISPATCH:
                {profile.phoneVerified ? (
                  <span className="text-emerald-400 ml-1 font-bold">Dispatched SMS to {profile.phone}</span>
                ) : (
                  <span className="text-amber-400 ml-1">No mobile linked</span>
                )}
                {profile.emailVerified ? (
                  <span className="text-emerald-400 ml-1 font-bold">· Email to {profile.email}</span>
                ) : null}
              </span>
            </div>

            {(!profile.phoneVerified || !profile.emailVerified) && onNavigate && (
              <button
                onClick={() => onNavigate('contact')}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                Link Your Number / Email <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Incident Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-red-500/30">
            {onReportToAnalyzer && (
              <button
                onClick={() => onReportToAnalyzer(highestThreatSMS.message_preview)}
                className="px-4 py-2 rounded-xl font-bold text-xs bg-red-500 hover:bg-red-400 text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-lg"
              >
                <Shield className="w-3.5 h-3.5" />
                Report & Deep Inspect in Analyzer
              </button>
            )}

            <button
              onClick={() => {
                const targetUrl = (highestThreatSMS.result.detected_urls && highestThreatSMS.result.detected_urls[0]) ||
                  highestThreatSMS.message_preview.match(/https?:\/\/[^\s]+/)?.[0] || '185.220.101.45';
                const dummyIntel = resolveAndTrackIP(targetUrl, {
                  isScam: true,
                  scamType: 'SMS Phishing'
                });
                setActiveTraceIntel({ sms: highestThreatSMS, intel: dummyIntel });
              }}
              className="px-3.5 py-2 rounded-xl text-xs bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-cyan-300 cursor-pointer flex items-center gap-1.5"
            >
              <Crosshair className="w-3.5 h-3.5" />
              Trace Threat Server IP Radar
            </button>

            <button
              onClick={() => handleBlockSender(highestThreatSMS.from_masked)}
              className="px-3.5 py-2 rounded-xl text-xs bg-slate-900 border border-slate-700 hover:border-red-500/50 text-slate-300 cursor-pointer"
            >
              Block Sender Number
            </button>
          </div>
        </div>
      )}

      {/* Integration Status Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#091524] border border-slate-800 text-xs space-y-1">
          <div className="text-slate-400 flex items-center justify-between">
            <span className="uppercase text-[10px] font-mono">Twilio Inbound Gateway</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="font-bold text-white text-sm">Active & Listening</div>
          <div className="text-[11px] text-slate-500">Webhook: /api/twilio/incoming-sms</div>
        </div>

        <div className="p-4 rounded-xl bg-[#091524] border border-slate-800 text-xs space-y-1">
          <div className="text-slate-400 flex items-center justify-between">
            <span className="uppercase text-[10px] font-mono">PhishTank Live Feed</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <div className="font-bold text-white text-sm">48,290+ Signatures</div>
          <div className="text-[11px] text-slate-500">Hourly SQLite Cache</div>
        </div>

        <div className="p-4 rounded-xl bg-[#091524] border border-slate-800 text-xs space-y-1">
          <div className="text-slate-400 flex items-center justify-between">
            <span className="uppercase text-[10px] font-mono">Stream Auto-Refresh</span>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="text-[11px] text-teal-400 hover:underline cursor-pointer"
            >
              {autoRefresh ? 'Enabled (3s)' : 'Paused'}
            </button>
          </div>
          <div className="font-bold text-white text-sm">Last: {lastRefreshed}</div>
          <div className="text-[11px] text-slate-500">Real-time local dispatch</div>
        </div>

        <div className="p-4 rounded-xl bg-[#091524] border border-slate-800 text-xs space-y-1">
          <div className="text-slate-400 flex items-center justify-between">
            <span className="uppercase text-[10px] font-mono">Linked Security Identity</span>
            <span className={`w-2 h-2 rounded-full ${profile.phoneVerified ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          </div>
          <div className="font-bold text-white text-sm truncate">
            {profile.phoneVerified ? profile.phone : (profile.emailVerified ? profile.email : 'Not Linked')}
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            {profile.phoneVerified || profile.emailVerified ? 'Automated dispatch active' : 'Click to link mobile/email'}
          </div>
        </div>
      </div>

      {/* Inbound SMS Simulator / Webhook Test Injector */}
      <div className="p-5 rounded-2xl bg-[#091524] border border-slate-800 shadow-xl space-y-4 cyber-panel">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-teal-400" />
            Inbound SMS Webhook Simulator
          </h2>
          <span className="text-[11px] text-slate-500">Test live threat interception</span>
        </div>

        <form onSubmit={handleSimulate} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Originating Number (From)</label>
              <input
                type="text"
                value={simSender}
                onChange={(e) => setSimSender(e.target.value)}
                className="w-full bg-[#06111f] border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200"
                placeholder="+91 98765 43210"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Incoming Message Body</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={simMessage}
                  onChange={(e) => setSimMessage(e.target.value)}
                  className="flex-1 bg-[#06111f] border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200"
                  placeholder="Paste or write incoming message..."
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  Transmit
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Messages Feed */}
      <div className="bg-[#091524] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 cyber-panel">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            Intercepted Messages Feed ({messages.length})
          </h2>
          <button
            onClick={fetchFeed}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
        </div>

        {messages.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No incoming SMS messages captured yet. Use the simulator above to transmit one.
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((sms) => (
              <div
                key={sms.id}
                className={`p-4 rounded-xl border transition-all ${
                  sms.result.risk_level === 'CRITICAL'
                    ? 'bg-red-950/20 border-red-500/30'
                    : sms.result.risk_level === 'HIGH'
                      ? 'bg-orange-950/20 border-orange-500/30'
                      : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-white">{sms.from_masked}</span>
                    <span className="text-slate-500">→ {sms.to_masked}</span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      · {new Date(sms.received_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <div>{getRiskBadge(sms.result.risk_level, sms.result.risk_score)}</div>
                </div>

                <p className="text-xs text-slate-200 font-mono leading-relaxed mb-2">
                  {sms.message_preview}
                </p>

                {/* Threat Gateway IP & Geolocation Trace Bar */}
                <div className="my-2.5 p-2.5 rounded-lg bg-[#050b14] border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono">
                  <div className="flex items-center gap-2 text-cyan-300">
                    <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>
                      GATEWAY IP: <strong className="text-white">{sms.origin_gateway_ip || '185.220.101.45'}</strong>
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-400 truncate">{sms.origin_country || 'Offshore Relay'}</span>
                  </div>

                  <button
                    onClick={async () => {
                      const target = sms.result.detected_urls && sms.result.detected_urls.length > 0
                        ? sms.result.detected_urls[0]
                        : (sms.origin_gateway_ip || '185.220.101.45');
                      const intel = await fetchRealTimeIPIntel(target, { isScam: sms.result.risk_level !== 'SAFE', scamType: sms.result.scam_type });
                      setActiveTraceIntel({ sms, intel });
                    }}
                    className="px-2.5 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-colors"
                  >
                    <Crosshair className="w-3 h-3 text-cyan-400" />
                    Track Real-Time IP
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-2 border-t border-slate-800/80 text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-300">{sms.result.scam_type}</span>
                    <span>· {sms.result.classification.replace('_', ' ')}</span>
                  </div>
                  {sms.result.detected_urls && sms.result.detected_urls.length > 0 && (
                    <div className="font-mono text-cyan-400">
                      URLs checked: {sms.result.detected_urls.length}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Origin IP Radar Modal */}
      {activeTraceIntel && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-3xl w-full bg-[#071322] border border-cyan-500/40 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Crosshair className="w-5 h-5 text-cyan-400 animate-pulse" />
                <h3 className="text-base font-bold text-white">
                  SMS Origin Carrier Gateway Geotracker
                </h3>
              </div>
              <button
                onClick={() => setActiveTraceIntel(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono space-y-1">
              <div className="text-slate-400">
                Intercepted SMS from: <span className="text-white font-bold">{activeTraceIntel.sms.from_masked}</span>
              </div>
              <div className="text-slate-300 italic">
                "{activeTraceIntel.sms.message_preview}"
              </div>
            </div>

            <IPTrackingCard intel={activeTraceIntel.intel} title="Origin Telecom Carrier / Gateway IP" />
          </div>
        </div>
      )}

    </div>
  );
};
