import { AnalysisResult, ThreatIndicator, ScoreBreakdownItem, RiskLevel } from '../types';
import { resolveAndTrackIP } from './ipTrackerEngine';

export const SCAM_EXAMPLES: Record<string, { title: string; text: string; source: string }> = {
  prize: {
    title: '🎁 Prize / Lottery Scam',
    source: 'sms',
    text: `Congratulations! 🎉 You have been selected as the lucky winner of ₹50,000 in our international lottery promotion.

To claim your prize immediately, submit your OTP, Aadhaar, and UPI ID to our verification center:
https://bit.ly/claim-reward-today

Hurry! This cash reward expires within 24 hours.`
  },
  bank: {
    title: '🏦 Bank / KYC Scam',
    source: 'bank',
    text: `URGENT NOTICE: Your SBI Bank account will be blocked and debit card suspended today due to incomplete KYC verification.

Update your KYC details immediately by clicking the secure portal below:
https://sbi-verify-kyc-account.example.com

Enter your account number, ATM PIN, and 6-digit OTP to unfreeze your account.`
  },
  upi: {
    title: '💳 UPI / Payment Scam',
    source: 'upi',
    text: `Alert: A UPI payment request of ₹24,999 has been initiated from your account.

If you did not authorize this transaction, contact our fraud support immediately at +91-9876543210.

Share the cancellation OTP sent to your registered mobile number to reverse the transaction.`
  },
  otp: {
    title: '🔐 OTP Scam',
    source: 'sms',
    text: `Dear Customer, your mobile banking security certificate has expired.

To prevent permanent account suspension, please share the 6-digit OTP sent to your phone with our verified support executive. This request must be completed within 10 minutes.`
  },
  job: {
    title: '💼 Fake Job Scam',
    source: 'social_media',
    text: `Congratulations! Your resume has been shortlisted for a prestigious work-from-home data entry position.

Earn ₹4,500 daily by working only 2 hours from your phone. No prior experience required.
To activate your corporate portal and employee ID, pay a refundable registration fee of ₹2,499 via UPI.`
  },
  delivery: {
    title: '📦 Delivery Scam',
    source: 'sms',
    text: `India Post: Your delivery package #IN-889211 could not be dispatched due to an incomplete street address.

Please update your address and pay a ₹35 redelivery verification fee here:
https://ind-post-delivery-update.xyz

Failure to update within 2 hours will cause your package to be returned to the international warehouse.`
  },
  investment: {
    title: '📈 Investment Scam',
    source: 'whatsapp',
    text: `Exclusive VIP Investment Group!
Invest ₹5,000 today and receive guaranteed ₹35,000 within 72 hours.
Our proprietary AI crypto algorithmic trading system has a 100% win rate.
Limited slots remaining! Transfer funds to our verified UPI ID now to lock in your guaranteed profits.`
  },
  tech: {
    title: '👨‍💻 Tech Support Scam',
    source: 'email',
    text: `CRITICAL ALERT: Windows Defender has detected Trojan.Spyware.Banker on your computer.
Your personal passwords, banking logins, and private photos have been compromised.
Call Microsoft Certified Technical Support immediately at 1800-419-0922. Do NOT reboot your PC.`
  },
  loan: {
    title: '💰 Pre-Approved Loan Scam',
    source: 'sms',
    text: `Congratulations! Your instant personal loan of ₹5,00,000 has been APPROVED with 0% interest for 6 months!
Disbursement directly to your bank account within 10 minutes.
Pay a mandatory documentation processing fee of ₹3,499 at:
https://fast-cash-quickloan.xyz`
  },
  social: {
    title: '📱 Social Media Impersonation',
    source: 'social_media',
    text: `Official Instagram Security Warning:
We have received a copyright infringement complaint against your profile. Your account will be permanently deactivated within 24 hours.
If this is a mistake, verify your identity immediately:
https://instagram-security-verify.click
Enter your username, password, and 2FA SMS code to appeal.`
  }
};

const URGENCY_KEYWORDS = [
  'urgent', 'immediately', 'act now', 'hurry', 'quickly', 'limited time',
  'last chance', 'expires today', 'within 24 hours', 'do it now', 'within 10 minutes',
  'suspended today', 'within 2 hours', 'expires in'
];

const IMPERSONATION_KEYWORDS = [
  'official', 'support team', 'customer care', 'customer support', 'bank manager',
  'bank support', 'instagram support', 'facebook support', 'whatsapp support',
  'government', 'police', 'admin', 'security team', 'microsoft security', 'windows defender',
  'india post', 'sbi', 'hdfc', 'icici', 'income tax'
];

const FINANCIAL_KEYWORDS = [
  'send money', 'transfer money', 'bank account', 'credit card', 'debit card',
  'upi', 'payment', 'pay now', 'refund', 'cash', 'loan', 'processing fee',
  'registration fee', 'joining fee', 'refundable fee', 'processing charges'
];

const CREDENTIAL_KEYWORDS = [
  'password', 'otp', 'one time password', 'pin', 'cvv', 'verification code',
  'security code', 'login details', 'username', 'account password', 'atm pin', '2fa'
];

const PRIZE_KEYWORDS = [
  'winner', 'won', 'lottery', 'prize', 'reward', 'congratulations', 'free gift',
  'cash prize', 'lucky winner', 'shortlisted'
];

const INVESTMENT_KEYWORDS = [
  'investment', 'guaranteed profit', 'double your money', 'trading', 'crypto',
  'bitcoin', 'forex', 'guaranteed return', 'passive income', 'high return', '100% win rate'
];

const JOB_SCAM_KEYWORDS = [
  'work from home', 'part time job', 'earn money', 'easy money', 'job opportunity',
  'earn daily', 'daily income', 'data entry position'
];

const THREAT_KEYWORDS = [
  'account will be blocked', 'account suspended', 'legal action', 'police complaint',
  'arrest', 'account will be deleted', 'account will be closed', 'verify immediately',
  'permanently deactivated', 'compromised'
];

const SHORTENER_DOMAINS = [
  'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'cutt.ly', 'is.gd', 'shorturl.at'
];

export function analyzeMessage(message: string): AnalysisResult {
  const clean = (message || '').trim();
  const lower = clean.toLowerCase();

  let score = 0;
  const indicators: ThreatIndicator[] = [];

  // Urgency check
  const urgencyHits = URGENCY_KEYWORDS.filter(k => lower.includes(k));
  if (urgencyHits.length > 0) {
    const impact = Math.min(urgencyHits.length * 10, 20);
    score += impact;
    indicators.push({
      type: 'Urgency & Pressure Tactic',
      severity: 'medium',
      description: 'The message attempts to panic the recipient into acting quickly without thinking.',
      matches: urgencyHits
    });
  }

  // Impersonation check
  const impersonationHits = IMPERSONATION_KEYWORDS.filter(k => lower.includes(k));
  if (impersonationHits.length > 0) {
    const impact = Math.min(impersonationHits.length * 10, 22);
    score += impact;
    indicators.push({
      type: 'Authority / Brand Impersonation',
      severity: 'high',
      description: 'The sender claims to represent a trusted bank, technical authority, or public agency.',
      matches: impersonationHits
    });
  }

  // Credential & OTP
  const credentialHits = CREDENTIAL_KEYWORDS.filter(k => lower.includes(k));
  if (credentialHits.length > 0) {
    const impact = Math.min(credentialHits.length * 15, 30);
    score += impact;
    indicators.push({
      type: 'Credential / OTP Exfiltration',
      severity: 'critical',
      description: 'The message explicitly solicits sensitive authentication codes, passwords, or PINs.',
      matches: credentialHits
    });
  }

  // Financial / Payment
  const financialHits = FINANCIAL_KEYWORDS.filter(k => lower.includes(k));
  if (financialHits.length > 0) {
    const impact = Math.min(financialHits.length * 8, 20);
    score += impact;
    indicators.push({
      type: 'Financial / Payment Request',
      severity: 'high',
      description: 'The message includes money transfer requests, UPI addresses, or advance fee demands.',
      matches: financialHits
    });
  }

  // Prize / Lottery
  const prizeHits = PRIZE_KEYWORDS.filter(k => lower.includes(k));
  if (prizeHits.length > 0) {
    const impact = Math.min(prizeHits.length * 8, 20);
    score += impact;
    indicators.push({
      type: 'Fake Prize / Reward Trap',
      severity: 'high',
      description: 'The message uses unexpected winnings or lottery claims as bait.',
      matches: prizeHits
    });
  }

  // Investment
  const investmentHits = INVESTMENT_KEYWORDS.filter(k => lower.includes(k));
  if (investmentHits.length > 0) {
    const impact = Math.min(investmentHits.length * 10, 22);
    score += impact;
    indicators.push({
      type: 'High-Yield Investment Fraud',
      severity: 'high',
      description: 'Promises unrealistic guaranteed returns or automated high-frequency trading profits.',
      matches: investmentHits
    });
  }

  // Job Scam
  const jobHits = JOB_SCAM_KEYWORDS.filter(k => lower.includes(k));
  if (jobHits.length > 0) {
    const impact = Math.min(jobHits.length * 8, 18);
    score += impact;
    indicators.push({
      type: 'Employment / Work-From-Home Scam',
      severity: 'medium',
      description: 'Offers high daily income with minimal work, often leading to upfront fee extortion.',
      matches: jobHits
    });
  }

  // Threats / Account manipulation
  const threatHits = THREAT_KEYWORDS.filter(k => lower.includes(k));
  if (threatHits.length > 0) {
    const impact = Math.min(threatHits.length * 12, 25);
    score += impact;
    indicators.push({
      type: 'Account Deactivation Threat',
      severity: 'high',
      description: 'Coercive threats of law enforcement action, account suspension, or arrest.',
      matches: threatHits
    });
  }

  // URLs extraction & analysis
  const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
  const urls = clean.match(urlPattern) || [];
  const suspiciousUrls: Array<{ url: string; domain: string; reasons: string[] }> = [];

  urls.forEach(rawUrl => {
    const reasons: string[] = [];
    let domain = '';
    try {
      const parsed = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
      domain = parsed.hostname.toLowerCase();

      if (SHORTENER_DOMAINS.some(sd => domain.includes(sd))) {
        reasons.push('URL shortener masking destination');
      }
      if (domain.endsWith('.xyz') || domain.endsWith('.top') || domain.endsWith('.click') || domain.endsWith('.win')) {
        reasons.push('High-risk, disposable top-level domain');
      }
      if (domain.includes('-verify') || domain.includes('-kyc') || domain.includes('-security')) {
        reasons.push('Deceptive security keywords in domain');
      }
      if (rawUrl.includes('@')) {
        reasons.push('URL contains deceptive userinfo (@)');
      }
      if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(domain)) {
        reasons.push('URL directs straight to an IP address');
      }
    } catch {
      reasons.push('Malformed URL syntax');
    }

    if (reasons.length > 0) {
      suspiciousUrls.push({ url: rawUrl, domain, reasons });
    }
  });

  if (urls.length > 0) {
    score += Math.min(urls.length * 5, 15);
    indicators.push({
      type: 'External Link Found',
      severity: 'medium',
      description: 'The message directs the user to an external web destination.',
      matches: urls
    });
  }

  if (suspiciousUrls.length > 0) {
    score += Math.min(suspiciousUrls.length * 15, 30);
    indicators.push({
      type: 'Phishing / Suspicious URL Detected',
      severity: 'critical',
      description: 'Destination URL displays hallmarks of phishing portals and masqueraded domains.',
      matches: suspiciousUrls.map(u => `${u.url} (${u.reasons.join(', ')})`)
    });
  }

  // Cap score
  score = Math.min(score, 100);

  // Determine dominant scam type
  let scamType = 'General Suspicious Activity';
  if (credentialHits.length > 0) scamType = 'OTP / Credential Theft';
  else if (prizeHits.length > 0) scamType = 'Prize / Lottery Scam';
  else if (impersonationHits.length > 0 && financialHits.length > 0) scamType = 'Banking / KYC Impersonation';
  else if (investmentHits.length > 0) scamType = 'Investment Fraud';
  else if (jobHits.length > 0) scamType = 'Fake Job Offer';
  else if (threatHits.length > 0) scamType = 'Account Extortion / Coercion';
  else if (urls.length > 0 && score > 40) scamType = 'Phishing Link Distribution';
  else if (score <= 20) scamType = 'No Threat Detected';

  // Risk Level
  let riskLevel: RiskLevel = 'SAFE';
  let riskClass = 'safe';
  let classification: 'SAFE' | 'NEEDS_REVIEW' | 'LIKELY_SCAM' = 'SAFE';

  if (score >= 75) {
    riskLevel = 'CRITICAL';
    riskClass = 'critical';
    classification = 'LIKELY_SCAM';
  } else if (score >= 50) {
    riskLevel = 'HIGH';
    riskClass = 'high';
    classification = 'LIKELY_SCAM';
  } else if (score >= 30) {
    riskLevel = 'MEDIUM';
    riskClass = 'medium';
    classification = 'NEEDS_REVIEW';
  } else if (score >= 15) {
    riskLevel = 'LOW';
    riskClass = 'low';
    classification = 'NEEDS_REVIEW';
  }

  // Summary
  let summary = '';
  if (score >= 70) {
    summary = `CRITICAL THREAT: This message exhibits ${indicators.length} distinct social engineering vectors including ${indicators.map(i => i.type).slice(0, 3).join(', ')}. Strong likelihood of financial fraud or credential theft.`;
  } else if (score >= 40) {
    summary = `ELEVATED RISK: Suspicious patterns detected. The message employs psychological triggers or unverified links. Independent verification is required prior to taking any action.`;
  } else if (score >= 20) {
    summary = `MODERATE CAUTION: Minor risk signals identified. Exercise standard security diligence and inspect any embedded links.`;
  } else {
    summary = `BENIGN: No prominent scam or social engineering signatures were identified in this message text. Always verify unexpected communications.`;
  }

  // Recommendation
  let recommendation = '';
  if (score >= 50) {
    recommendation = 'DO NOT click embedded links, do NOT share any OTP or payment credentials, and report/block the sender immediately. Contact official institutions only via verified physical documents or official websites.';
  } else if (score >= 20) {
    recommendation = 'Proceed with heightened vigilance. Contact the sender through a secondary trusted channel before proceeding with any requests.';
  } else {
    recommendation = 'No immediate threats detected. Maintain general security hygiene.';
  }

  // Score breakdown
  const severityWeights: Record<string, number> = { critical: 25, high: 18, medium: 12, low: 5 };
  const scoreBreakdown: ScoreBreakdownItem[] = indicators.map(ind => ({
    signal: ind.type,
    severity: ind.severity.toUpperCase() as ScoreBreakdownItem['severity'],
    impact: severityWeights[ind.severity] || 10,
    evidence: ind.matches
  }));

  const actions = [
    score > 40 ? 'Block the originating phone number, email address, or profile' : 'Verify sender identity independently',
    score > 40 ? 'Never disclose one-time passwords, UPI PINs, or banking cards' : 'Inspect URLs before navigating',
    'Report phishing attempts to national cybercrime reporting agencies'
  ];

  const confidence = score > 60 ? Math.min(98, 75 + indicators.length * 5) : score > 20 ? 82 : 91;

  // Resolve threat origin IP tracking intelligence
  const targetForIP = (urls.length > 0 && urls[0]) ? urls[0] : (message.length > 5 ? message : 'threat-sender-gateway.net');
  const ipTracking = resolveAndTrackIP(targetForIP, { isScam: score >= 25, scamType });

  return {
    risk_score: score,
    risk_level: riskLevel,
    risk_class: riskClass,
    classification,
    scam_type: scamType,
    confidence,
    summary,
    indicators,
    score_breakdown: scoreBreakdown,
    urls,
    suspicious_urls: suspiciousUrls,
    ip_tracking: ipTracking,
    recommendation,
    actions,
    analysis_mode: 'Cyber Shield Multi-Vector Threat Engine'
  };
}
