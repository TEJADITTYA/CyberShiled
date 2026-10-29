import { QRCheckResult, RiskLevel } from '../types';
import { analyzeURL, analyzeURLAsync } from './urlEngine';

export function parseAndEvaluateQR(content: string): QRCheckResult {
  const trimmed = (content || '').trim();

  // Check UPI scheme
  if (/^upi:\/\/pay\b/i.test(trimmed)) {
    const reasons: string[] = [];
    let score = 0;

    let pa = '';
    let pn = '';
    let am = '';

    try {
      const qIndex = trimmed.indexOf('?');
      if (qIndex !== -1) {
        const params = new URLSearchParams(trimmed.slice(qIndex + 1));
        pa = params.get('pa') || '';
        pn = params.get('pn') || '';
        am = params.get('am') || '';
      }
    } catch {
      score += 25;
      reasons.push('Malformed UPI payment payload parameters');
    }

    if (!pa) {
      score += 30;
      reasons.push('Missing Payee Virtual Payment Address (VPA / UPI ID)');
    }

    // Check for suspicious terms in payee name or note
    const lower = trimmed.toLowerCase();
    const suspiciousPayeeWords = ['refund', 'prize', 'winner', 'cashback', 'verify', 'kyc', 'lottery', 'reward', 'support'];
    const matchedWords = suspiciousPayeeWords.filter(w => lower.includes(w));
    if (matchedWords.length > 0) {
      score += 45;
      reasons.push(`Fraudulent incentive keywords in payment parameters: ${matchedWords.join(', ')}`);
    }

    // Impersonating bank or government in payee name without official domain
    if (/(bank|sbi|official|police|government|income tax)/i.test(pn) && !/\.(bank|gov|nic)\b/i.test(pa)) {
      score += 35;
      reasons.push('Authority impersonation: Payee name claims official status but UPI address is non-institutional');
    }

    score = Math.min(100, score);
    let riskLevel: RiskLevel = 'SAFE';
    if (score >= 65) riskLevel = 'CRITICAL';
    else if (score >= 40) riskLevel = 'HIGH';
    else if (score >= 20) riskLevel = 'MEDIUM';
    else if (score > 0) riskLevel = 'LOW';

    return {
      kind: 'upi',
      raw: trimmed,
      risk_score: score,
      risk_level: riskLevel,
      reasons: reasons.length > 0 ? reasons : ['Verified standard merchant / peer UPI payment format'],
      details: {
        payment_address: pa || 'Unknown',
        payee_name: pn || 'Unnamed Payee',
        amount: am ? `₹${am}` : 'Variable Amount'
      }
    };
  }

  // Check URL scheme
  if (/^(https?:\/\/|www\.)/i.test(trimmed)) {
    const urlAnalysis = analyzeURL(trimmed);
    return {
      kind: 'url',
      raw: trimmed,
      risk_score: urlAnalysis.risk_score,
      risk_level: urlAnalysis.risk_level,
      reasons: urlAnalysis.reasons,
      details: {
        domain: urlAnalysis.domain
      }
    };
  }

  // Plain text QR
  const reasons: string[] = [];
  let score = 0;
  const lower = trimmed.toLowerCase();
  const scamWords = ['otp', 'password', 'pin', 'send money', 'urgent', 'winner', 'account blocked', 'claim'];
  const hits = scamWords.filter(w => lower.includes(w));
  if (hits.length > 0) {
    score += Math.min(60, hits.length * 20);
    reasons.push(`Sensory pressure and credential keywords found: ${hits.join(', ')}`);
  }

  return {
    kind: 'text',
    raw: trimmed,
    risk_score: score,
    risk_level: score >= 50 ? 'HIGH' : score >= 20 ? 'MEDIUM' : 'SAFE',
    reasons: reasons.length > 0 ? reasons : ['Plain text barcode - no executable links or payment schemas']
  };
}

/**
 * Real-time asynchronous QR evaluation that traces destination URLs in real-time
 */
export async function parseAndEvaluateQRAsync(content: string): Promise<QRCheckResult> {
  const syncRes = parseAndEvaluateQR(content);
  if (syncRes.kind === 'url') {
    const urlAnalysis = await analyzeURLAsync(syncRes.raw);
    return {
      kind: 'url',
      raw: syncRes.raw,
      risk_score: urlAnalysis.risk_score,
      risk_level: urlAnalysis.risk_level,
      reasons: urlAnalysis.reasons,
      details: {
        domain: urlAnalysis.domain
      },
      ip_tracking: urlAnalysis.ip_tracking
    };
  }
  return syncRes;
}

