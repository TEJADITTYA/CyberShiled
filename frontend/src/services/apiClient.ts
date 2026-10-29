/**
 * Cyber Shield API Client
 * Connects the React frontend (running via npm) to the Flask Python backend (running on port 5000)
 * with transparent fallback to local TypeScript threat engines.
 */

import { URLCheckResult, IPTrackingIntel, AnalysisResult } from '../types';
import { analyzeURLAsync } from './urlEngine';
import { fetchRealTimeIPIntel } from './ipTrackerEngine';
import { analyzeMessage } from './scamEngine';

const BACKEND_BASE = '/api';

export interface BackendStatus {
  connected: boolean;
  service?: string;
  backend?: string;
  checkedAt: string;
}

/**
 * Checks if the Python Flask backend is running on /api/health
 */
export async function checkFlaskBackendHealth(): Promise<BackendStatus> {
  const ts = new Date().toLocaleTimeString();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const resp = await fetch(`${BACKEND_BASE}/health`, { signal: controller.signal });
    clearTimeout(timeout);

    if (resp.ok) {
      const data = await resp.json();
      return {
        connected: true,
        service: data.service || 'Cyber Shield Flask Security Engine',
        backend: data.backend || 'Flask (Python 3)',
        checkedAt: ts
      };
    }
  } catch (err) {
    // Flask backend not running or proxy unreachable
  }

  return {
    connected: false,
    service: 'Local Client-Side Security Shield',
    backend: 'Client Engine (Start Flask via: python backend/app.py)',
    checkedAt: ts
  };
}

/**
 * Scans a URL through the Flask backend or falls back to async TypeScript scanner
 */
export async function scanURLWithFlask(url: string): Promise<URLCheckResult> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const resp = await fetch(`${BACKEND_BASE}/scan/url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (resp.ok) {
      const data = await resp.json();
      // If backend succeeded, enrich with live GeoIP
      const liveIntel = await fetchRealTimeIPIntel(data.domain || url, { isScam: data.risk_score >= 25 });
      return {
        url: data.url,
        domain: data.domain,
        risk_score: data.risk_score,
        risk_level: data.risk_level,
        status: data.status,
        reasons: data.reasons,
        checks: data.checks,
        reputation: data.reputation,
        ip_tracking: liveIntel
      };
    }
  } catch (err) {
    // Fall back to client-side async scanner
  }

  return analyzeURLAsync(url);
}

/**
 * Scans an IP or domain target
 */
export async function scanIPWithFlask(query: string): Promise<IPTrackingIntel> {
  return fetchRealTimeIPIntel(query);
}

/**
 * Scans an SMS or message text
 */
export function scanMessageWithFlask(text: string, sender?: string): AnalysisResult {
  return analyzeMessage(sender ? `[From: ${sender}] ${text}` : text);
}
