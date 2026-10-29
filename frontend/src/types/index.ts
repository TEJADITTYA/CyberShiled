export type RiskLevel = 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ThreatIndicator {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  matches: string[];
}

export interface ScoreBreakdownItem {
  signal: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  impact: number;
  evidence: string[];
}

export interface TracerouteHop {
  hop: number;
  ip: string;
  location: string;
  latency_ms: number;
  status: 'FAST' | 'ROUTING' | 'PROXY' | 'TARGET';
}

export interface IPTrackingIntel {
  ip: string;
  hostname: string;
  country: string;
  country_code: string;
  city: string;
  region?: string;
  postal?: string;
  timezone?: string;
  latitude: number;
  longitude: number;
  map_point_label?: string;
  flag_emoji?: string;
  query_target?: string;
  is_live_api?: boolean;
  dns_resolution_provider?: string;
  dns_latency_ms?: number;
  asn: string;
  isp: string;
  organization: string;
  hosting_type: 'Datacenter' | 'Residential' | 'VPN / Proxy' | 'Tor Exit Relay' | 'Bulletproof Server' | 'Cloud CDN';
  abuse_confidence_score: number;
  total_abuse_reports: number;
  open_ports: number[];
  traceroute_hops: TracerouteHop[];
  ssl_issuer?: string;
  threat_cluster?: string;
  connection_protocol?: string;
  dns_server?: string;
}

export interface AnalysisResult {
  risk_score: number;
  risk_level: RiskLevel;
  risk_class: string;
  classification: 'SAFE' | 'NEEDS_REVIEW' | 'LIKELY_SCAM';
  scam_type: string;
  confidence: number;
  summary: string;
  indicators: ThreatIndicator[];
  score_breakdown: ScoreBreakdownItem[];
  urls: string[];
  suspicious_urls?: Array<{
    url: string;
    domain: string;
    reasons: string[];
  }>;
  ip_tracking?: IPTrackingIntel;
  recommendation: string;
  actions: string[];
  analysis_mode: string;
}

export interface ScanRecord {
  id: string;
  message: string;
  source: string;
  risk: RiskLevel;
  date: string;
  result: AnalysisResult;
}

export interface URLCheckResult {
  url: string;
  domain: string;
  risk_score: number;
  risk_level: RiskLevel;
  status: 'SAFE' | 'REVIEW' | 'SUSPICIOUS' | 'INVALID';
  reasons: string[];
  checks: string[];
  reputation: string;
  threat_intelligence?: {
    phishtank?: { configured: boolean; listed: boolean; target?: string };
    urlhaus?: { configured: boolean; listed: boolean; threat?: string };
  };
  ip_tracking?: IPTrackingIntel;
}

export interface QRCheckResult {
  kind: 'url' | 'upi' | 'text';
  raw: string;
  risk_score: number;
  risk_level: RiskLevel;
  reasons: string[];
  details?: {
    domain?: string;
    payment_address?: string;
    payee_name?: string;
    amount?: string;
  };
  ip_tracking?: IPTrackingIntel;
}

export interface LiveSMSMessage {
  id: string;
  from_masked: string;
  to_masked: string;
  message_preview: string;
  received_at: string;
  origin_gateway_ip?: string;
  origin_country?: string;
  origin_carrier?: string;
  result: {
    risk_level: RiskLevel;
    risk_score: number;
    classification: string;
    scam_type: string;
    detected_urls?: string[];
    ip_tracking?: IPTrackingIntel;
  };
}

export interface ContactProfile {
  phone?: string;
  phoneVerified: boolean;
  phoneVerifiedAt?: string;
  email?: string;
  emailVerified: boolean;
  emailVerifiedAt?: string;
}
