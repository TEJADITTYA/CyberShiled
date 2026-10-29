import React from 'react';
import { IPTrackingIntel } from '../types';
import { Globe, Server, ShieldAlert, Wifi, Navigation, Copy, Check, Terminal, ExternalLink, MapPin, Layers } from 'lucide-react';

interface IPTrackingCardProps {
  intel: IPTrackingIntel;
  title?: string;
}

export const IPTrackingCard: React.FC<IPTrackingCardProps> = ({
  intel,
  title = 'Threat Origin & IP Tracking Intelligence'
}) => {
  const [copied, setCopied] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'radar' | 'satellite'>('radar');

  const handleCopyIP = () => {
    navigator.clipboard.writeText(intel.ip);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Convert lat/long into normalized percentages for SVG map
  const pinX = Math.max(5, Math.min(95, ((intel.longitude + 180) / 360) * 100));
  const pinY = Math.max(8, Math.min(92, ((90 - intel.latitude) / 180) * 100));

  const bboxMinLon = intel.longitude - 0.05;
  const bboxMinLat = intel.latitude - 0.05;
  const bboxMaxLon = intel.longitude + 0.05;
  const bboxMaxLat = intel.latitude + 0.05;
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bboxMinLon}%2C${bboxMinLat}%2C${bboxMaxLon}%2C${bboxMaxLat}&layer=mapnik&marker=${intel.latitude}%2C${intel.longitude}`;
  const osmDirectUrl = `https://www.openstreetmap.org/?mlat=${intel.latitude}&mlon=${intel.longitude}#map=13/${intel.latitude}/${intel.longitude}`;

  return (
    <div className="bg-[#071322] border border-cyan-500/40 rounded-2xl p-5 shadow-2xl relative overflow-hidden cyber-panel space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
            <Globe className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              {title}
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border flex items-center gap-1 ${
                intel.is_live_api 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse' 
                  : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
              }`}>
                {intel.is_live_api ? '● LIVE REAL-TIME DATA' : 'ACTIVE TRACE'}
              </span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              BGP Autonomous System Routing & Precise Geolocation
            </span>
          </div>
        </div>

        {/* View mode toggle & IP Copy */}
        <div className="flex items-center gap-2">
          <div className="flex bg-[#050b14] p-0.5 rounded-lg border border-slate-800 text-[11px] font-mono">
            <button
              onClick={() => setViewMode('radar')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                viewMode === 'radar' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Navigation className="w-3 h-3" /> Radar
            </button>
            <button
              onClick={() => setViewMode('satellite')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                viewMode === 'satellite' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              <MapPin className="w-3 h-3 text-red-400" /> Precise Point Map
            </button>
          </div>

          <div className="flex items-center gap-2 bg-[#050b14] border border-cyan-500/30 px-3 py-1.5 rounded-xl font-mono text-xs">
            <span className="text-slate-400 text-[10px] uppercase">IP:</span>
            <span className="font-bold text-cyan-300">{intel.ip}</span>
            <button
              onClick={handleCopyIP}
              className="p-1 hover:text-cyan-400 text-slate-500 transition-colors cursor-pointer"
              title="Copy IP Address"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* Geolocation Viewport: Radar or OpenStreetMap Pinpoint */}
      {viewMode === 'radar' ? (
        <div className="relative h-52 sm:h-60 rounded-xl bg-[#040810] border border-slate-800 overflow-hidden">
          {/* World Grid Matrix & Radar Sweep */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(41,217,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(41,217,255,0.05)_1px,transparent_1px)] bg-[size:24px_24px]" />
          
          {/* Radar Crosshairs */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-full h-px bg-cyan-500/10" />
            <div className="h-full w-px bg-cyan-500/10 absolute" />
            <div className="w-36 h-36 rounded-full border border-cyan-500/15 absolute" />
            <div className="w-64 h-64 rounded-full border border-cyan-500/10 absolute" />
          </div>

          {/* Radar Sweep Effect */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-72 h-72 rounded-full border-r-2 border-t-2 border-cyan-400/40 animate-radar-sweep opacity-40" />
          </div>

          {/* Continents silhouette stylized guide lines */}
          <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 400 200">
            <path d="M 60,40 Q 90,30 110,60 T 90,120 T 70,160" fill="none" stroke="#29d9ff" strokeWidth="1" strokeDasharray="2,3" />
            <path d="M 180,30 Q 220,20 250,50 T 230,110 T 210,160" fill="none" stroke="#29d9ff" strokeWidth="1" strokeDasharray="2,3" />
            <path d="M 280,40 Q 320,30 350,70 T 320,130" fill="none" stroke="#29d9ff" strokeWidth="1" strokeDasharray="2,3" />
          </svg>

          {/* Target Pinpoint Marker with Pulsing Rings */}
          <div
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-all duration-700"
            style={{ left: `${pinX}%`, top: `${pinY}%` }}
          >
            <div className="relative flex items-center justify-center">
              <div className={`w-10 h-10 rounded-full animate-ping absolute opacity-60 ${
                intel.abuse_confidence_score > 40 ? 'bg-red-500' : 'bg-cyan-400'
              }`} />
              
              <div className={`w-6 h-6 rounded-full border-2 animate-pulse flex items-center justify-center ${
                intel.abuse_confidence_score > 40 ? 'border-red-400 bg-red-950/80 shadow-[0_0_15px_#ef4444]' : 'border-cyan-400 bg-cyan-950/80 shadow-[0_0_15px_#22d3ee]'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  intel.abuse_confidence_score > 40 ? 'bg-red-400' : 'bg-cyan-400'
                }`} />
              </div>

              {/* Target Label Popup */}
              <div className="absolute top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 rounded bg-[#091524]/90 border border-slate-700 text-[10px] font-mono shadow-xl text-white flex items-center gap-1.5 backdrop-blur-md">
                <span className="font-bold text-cyan-400">{intel.city}, {intel.country_code}</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-300 font-bold">{intel.ip}</span>
              </div>
            </div>
          </div>

          {/* Telemetry HUD Overlays in corners */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 text-[10px] font-mono text-cyan-400">
            <div className="flex items-center gap-1.5 bg-[#050b14]/80 px-2 py-0.5 rounded border border-cyan-500/20">
              <Navigation className="w-3 h-3 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
              <span>GEO-POINT: {intel.latitude.toFixed(6)}°N, {intel.longitude.toFixed(6)}°E</span>
            </div>
            <div className="text-slate-300 bg-[#050b14]/80 px-2 py-0.5 rounded border border-slate-800">
              LOCATION: {intel.city}{intel.region ? `, ${intel.region}` : ''}, {intel.country}
            </div>
          </div>

          <div className="absolute top-3 right-3 z-10 text-[10px] font-mono">
            <span className={`px-2 py-0.5 rounded font-bold border ${
              intel.hosting_type === 'Bulletproof Server' || intel.hosting_type === 'Tor Exit Relay'
                ? 'bg-red-950/80 text-red-300 border-red-500/50'
                : intel.hosting_type === 'VPN / Proxy'
                  ? 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                  : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
            }`}>
              {intel.hosting_type.toUpperCase()}
            </span>
          </div>
        </div>
      ) : (
        /* Precise Point Street Map with OpenStreetMap */
        <div className="relative h-64 sm:h-72 rounded-xl bg-slate-900 border border-cyan-500/30 overflow-hidden">
          <iframe
            src={osmEmbedUrl}
            className="w-full h-full border-0"
            title="Real-time OpenStreetMap Target Location"
            loading="lazy"
          />
          <div className="absolute top-2 left-2 z-10 bg-slate-950/90 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono text-cyan-300 backdrop-blur-md shadow-lg flex flex-wrap items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span>POINT: <strong>{intel.latitude.toFixed(6)}°N</strong>, <strong>{intel.longitude.toFixed(6)}°E</strong></span>
            <div className="flex items-center gap-2 ml-1">
              <a
                href={osmDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white flex items-center gap-0.5 underline text-[10px]"
              >
                OpenStreetMap <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${intel.latitude},${intel.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 underline text-[10px]"
              >
                Google Maps <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Clear Point Location Details Card */}
      <div className="p-3.5 rounded-xl bg-[#050e1a] border border-cyan-500/20 text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-200">
          <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            {intel.flag_emoji && <span className="mr-1.5 text-sm">{intel.flag_emoji}</span>}
            PRECISE LOCATION POINT: <strong className="text-white">{intel.city}</strong>
            {intel.region && <span className="text-slate-400">, {intel.region}</span>}
            {intel.postal && <span className="text-slate-400"> [{intel.postal}]</span>}
            <span className="text-slate-300"> · {intel.country}</span>
          </span>
        </div>
        <div className="text-[11px] text-cyan-300 bg-[#040810] px-2.5 py-1 rounded border border-slate-800 flex items-center gap-2">
          <span>GPS: {intel.latitude.toFixed(6)}°, {intel.longitude.toFixed(6)}°</span>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${intel.latitude},${intel.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300"
            title="Open Pinpoint Coordinates in Google Maps"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Grid of Origin & Autonomous System Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
        
        {/* ISP & Autonomous System */}
        <div className="p-3.5 rounded-xl bg-[#050e1a] border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1">
            <Server className="w-3 h-3 text-cyan-400" />
            Autonomous System (BGP ASN)
          </span>
          <div className="font-bold text-white text-xs truncate" title={intel.asn}>
            {intel.asn}
          </div>
          <div className="text-[11px] text-slate-400 truncate" title={intel.organization}>
            Org: {intel.organization}
          </div>
        </div>

        {/* AbuseIPDB Confidence & Threat Reports */}
        <div className="p-3.5 rounded-xl bg-[#050e1a] border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-red-400" />
            Abuse Confidence Score
          </span>
          <div className="flex items-center justify-between">
            <span className={`text-base font-mono font-bold ${
              intel.abuse_confidence_score > 50 ? 'text-red-400' : 'text-emerald-400'
            }`}>
              {intel.abuse_confidence_score}% Confidence
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {intel.total_abuse_reports} reports
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                intel.abuse_confidence_score > 50 ? 'bg-red-500' : 'bg-emerald-400'
              }`}
              style={{ width: `${intel.abuse_confidence_score}%` }}
            />
          </div>
        </div>

        {/* Threat Cluster Tag */}
        <div className="p-3.5 rounded-xl bg-[#050e1a] border border-slate-800 space-y-1 sm:col-span-2 lg:col-span-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1">
            <Terminal className="w-3 h-3 text-purple-400" />
            Threat Cluster Attribution
          </span>
          <div className="font-bold text-purple-300 text-xs truncate">
            {intel.threat_cluster || 'UNCLASSIFIED_NODE'}
          </div>
          <div className="text-[11px] text-slate-400">
            Ports Open: {intel.open_ports.join(', ')}
          </div>
        </div>

      </div>

      {/* Traceroute Multi-Hop Visualizer */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-slate-400 uppercase text-[10px] font-bold flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-cyan-400" />
            LIVE PACKET TRACEROUTE & ROUTING HOPS ({intel.traceroute_hops.length} NODES)
          </span>
          <span className="text-[10px] font-mono text-slate-500">Protocol: ICMP/TCP SYN</span>
        </div>

        <div className="space-y-1.5">
          {intel.traceroute_hops.map((h) => (
            <div
              key={h.hop}
              className={`p-2.5 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 font-mono ${
                h.status === 'TARGET'
                  ? 'bg-red-950/30 border-red-500/40 text-red-300 font-bold'
                  : h.status === 'PROXY'
                    ? 'bg-purple-950/20 border-purple-500/30 text-purple-300'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400">
                  HOP {h.hop}
                </span>
                <span className="text-white">{h.ip}</span>
                <span className="text-slate-500 hidden md:inline">→</span>
                <span className="text-slate-400 text-[11px] truncate max-w-xs">{h.location}</span>
              </div>

              <div className="flex items-center gap-2 text-[11px] self-end sm:self-auto">
                <span className="text-slate-400">{h.latency_ms}ms</span>
                <span className={`px-2 py-0.5 rounded text-[10px] ${
                  h.status === 'TARGET'
                    ? 'bg-red-500/20 text-red-400'
                    : h.status === 'PROXY'
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {h.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
