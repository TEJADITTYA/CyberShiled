import { ScanRecord, LiveSMSMessage, ContactProfile, AnalysisResult } from '../types';
import { analyzeMessage } from './scamEngine';

const HISTORY_KEY = 'scamDetectHistory';
const PROFILE_KEY = 'cyberShieldContactProfile';
const SMS_FEED_KEY = 'cyberShieldSmsFeed';
const FEEDBACK_KEY = 'cyberShieldFeedback';

const INITIAL_SMS_FEED: LiveSMSMessage[] = [
  {
    id: 'sms-init-1',
    from_masked: '+91 98*** 42109',
    to_masked: '+91 75*** 5506',
    origin_gateway_ip: '194.26.29.112',
    origin_country: 'Russia (Bulletproof VPS)',
    origin_carrier: 'SMPP Aggregator / Offshore Relay',
    message_preview: 'Dear SBI Customer, your YONO account is deactivated. Verify Aadhaar & PAN immediately at: https://sbi-verify-kyc-account.example.com',
    received_at: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    result: {
      risk_level: 'CRITICAL',
      risk_score: 92,
      classification: 'LIKELY_SCAM',
      scam_type: 'Banking / KYC Fraud',
      detected_urls: ['https://sbi-verify-kyc-account.example.com']
    }
  },
  {
    id: 'sms-init-2',
    from_masked: '+91 88*** 19022',
    to_masked: '+91 75*** 5506',
    origin_gateway_ip: '185.220.101.45',
    origin_country: 'Netherlands (Novogara C2)',
    origin_carrier: 'Spoofed International SMS Gateway',
    message_preview: 'Your package #IN-889211 delivery failed. Pay ₹35 redelivery fee at https://ind-post-delivery-update.xyz to avoid parcel return.',
    received_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    result: {
      risk_level: 'HIGH',
      risk_score: 78,
      classification: 'LIKELY_SCAM',
      scam_type: 'Delivery Scam',
      detected_urls: ['https://ind-post-delivery-update.xyz']
    }
  },
  {
    id: 'sms-init-3',
    from_masked: 'VK-HDFCBK',
    to_masked: '+91 75*** 5506',
    origin_gateway_ip: '115.112.223.14',
    origin_country: 'India (Authorized Telecom Gateway)',
    origin_carrier: 'Vodafone Idea DLT Verified Sender',
    message_preview: 'Your salary account has been credited with INR 78,450.00 on 23-09-2026. Avail balance: INR 1,42,109.80. HDFC Bank.',
    received_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    result: {
      risk_level: 'SAFE',
      risk_score: 0,
      classification: 'SAFE',
      scam_type: 'Legitimate Banking SMS',
      detected_urls: []
    }
  },
  {
    id: 'sms-init-4',
    from_masked: '+91 79*** 99182',
    to_masked: '+91 75*** 5506',
    origin_gateway_ip: '45.154.255.89',
    origin_country: 'Panama (Anonymous Tor Node)',
    origin_carrier: 'VoIP Virtual Bulk SMS Sender',
    message_preview: 'Congratulations! You won ₹25,00,000 in Kaun Banega Crorepati lucky draw! Call +919876543210 and share registration code.',
    received_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    result: {
      risk_level: 'CRITICAL',
      risk_score: 88,
      classification: 'LIKELY_SCAM',
      scam_type: 'Prize / Lottery Scam'
    }
  }
];

export function getScanHistory(): ScanRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveScan(message: string, source: string, result: AnalysisResult): ScanRecord {
  const history = getScanHistory();
  const newScan: ScanRecord = {
    id: `SD-${Date.now().toString(36).toUpperCase()}`,
    message,
    source,
    risk: result.risk_level,
    date: new Date().toLocaleString(),
    result
  };

  const updated = [newScan, ...history.filter(s => s.message !== message)].slice(0, 50);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save scan history:', e);
  }
  return newScan;
}

export function clearScanHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (e) {
    console.error('Failed to clear scan history:', e);
  }
}

export function getContactProfile(): ContactProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) {
      return {
        phoneVerified: false,
        emailVerified: false
      };
    }
    return JSON.parse(raw);
  } catch {
    return { phoneVerified: false, emailVerified: false };
  }
}

export function updateContactProfile(profile: Partial<ContactProfile>): ContactProfile {
  const current = getContactProfile();
  const updated = { ...current, ...profile };
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to update contact profile:', e);
  }
  return updated;
}

export function getLiveSMSFeed(): LiveSMSMessage[] {
  try {
    const raw = localStorage.getItem(SMS_FEED_KEY);
    if (!raw) {
      localStorage.setItem(SMS_FEED_KEY, JSON.stringify(INITIAL_SMS_FEED));
      return INITIAL_SMS_FEED;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SMS_FEED;
  }
}

export function injectIncomingSMS(sender: string, text: string): LiveSMSMessage {
  const feed = getLiveSMSFeed();
  const analysis = analyzeMessage(text);

  const cleanSender = sender.trim() || '+91 98765 00000';
  const maskedSender = cleanSender.length > 6
    ? `${cleanSender.slice(0, 4)}***${cleanSender.slice(-4)}`
    : 'Unknown Sender';

  const newSMS: LiveSMSMessage = {
    id: `sms-${Date.now()}`,
    from_masked: maskedSender,
    to_masked: '+91 75*** 5506',
    origin_gateway_ip: analysis.ip_tracking?.ip || '185.220.101.45',
    origin_country: `${analysis.ip_tracking?.city || 'Amsterdam'}, ${analysis.ip_tracking?.country || 'Netherlands'}`,
    origin_carrier: analysis.ip_tracking?.asn || 'VoIP Aggregator / Offshore Gateway',
    message_preview: text.length > 180 ? `${text.slice(0, 180)}…` : text,
    received_at: new Date().toISOString(),
    result: {
      risk_level: analysis.risk_level,
      risk_score: analysis.risk_score,
      classification: analysis.classification,
      scam_type: analysis.scam_type,
      detected_urls: analysis.urls,
      ip_tracking: analysis.ip_tracking
    }
  };

  const updated = [newSMS, ...feed].slice(0, 50);
  try {
    localStorage.setItem(SMS_FEED_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to store SMS feed:', e);
  }

  // Also record to main scan history if high risk
  saveScan(text, 'live_sms', analysis);

  return newSMS;
}

export function saveFeedback(analysisId: string, verdict: 'correct' | 'incorrect'): void {
  try {
    const list = JSON.parse(localStorage.getItem(FEEDBACK_KEY) || '[]');
    list.push({ analysisId, verdict, timestamp: new Date().toISOString() });
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save feedback:', e);
  }
}
