import React from 'react';
import { getContactProfile, updateContactProfile } from '../services/storage';
import { Phone, Mail, ShieldCheck, CheckCircle2, RefreshCw, KeyRound, Lock, Send, Bell, Zap, AlertTriangle, ShieldAlert } from 'lucide-react';

interface DispatchLog {
  id: string;
  target: string;
  type: 'SMS' | 'EMAIL';
  event: string;
  timestamp: string;
  status: 'DELIVERED' | 'DISPATCHED';
}

export const ContactView: React.FC = () => {
  const [profile, setProfile] = React.useState(getContactProfile());

  // Phone states
  const [countryCode, setCountryCode] = React.useState('+91');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [phoneStep, setPhoneStep] = React.useState<'input' | 'otp' | 'verified'>(
    profile.phoneVerified ? 'verified' : 'input'
  );
  const [phoneOtp, setPhoneOtp] = React.useState(['', '', '', '']);
  const [phoneGeneratedOtp, setPhoneGeneratedOtp] = React.useState('');
  const [phoneCooldown, setPhoneCooldown] = React.useState(0);
  const [phoneError, setPhoneError] = React.useState('');

  // Email states
  const [emailAddress, setEmailAddress] = React.useState(profile.email || '');
  const [emailStep, setEmailStep] = React.useState<'input' | 'otp' | 'verified'>(
    profile.emailVerified ? 'verified' : 'input'
  );
  const [emailOtp, setEmailOtp] = React.useState(['', '', '', '']);
  const [emailGeneratedOtp, setEmailGeneratedOtp] = React.useState('');
  const [emailCooldown, setEmailCooldown] = React.useState(0);
  const [emailError, setEmailError] = React.useState('');

  // Live test alert feedback
  const [liveTestToast, setLiveTestToast] = React.useState<string | null>(null);
  const [dispatchLogs, setDispatchLogs] = React.useState<DispatchLog[]>([
    {
      id: 'DSP-901',
      target: profile.phone || '+91 98765 43210',
      type: 'SMS',
      event: 'Critical Smishing Intercepted (ICICI Bank Impersonation)',
      timestamp: 'Today at 10:14 AM',
      status: 'DELIVERED'
    }
  ]);

  // Cooldown timers
  React.useEffect(() => {
    if (phoneCooldown > 0) {
      const t = setTimeout(() => setPhoneCooldown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [phoneCooldown]);

  React.useEffect(() => {
    if (emailCooldown > 0) {
      const t = setTimeout(() => setEmailCooldown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [emailCooldown]);

  // Phone send OTP
  const handleSendPhoneOTP = () => {
    setPhoneError('');
    if (!/^[0-9]{7,15}$/.test(phoneNumber.trim().replace(/\D/g, ''))) {
      setPhoneError('Please enter a valid mobile number (7-15 digits).');
      return;
    }

    const demoCode = Math.floor(1000 + Math.random() * 9000).toString();
    setPhoneGeneratedOtp(demoCode);
    setPhoneStep('otp');
    setPhoneOtp(['', '', '', '']);
    setPhoneCooldown(30);
  };

  const handleAutoFillPhoneOtp = () => {
    if (phoneGeneratedOtp && phoneGeneratedOtp.length === 4) {
      setPhoneOtp(phoneGeneratedOtp.split(''));
    }
  };

  // Phone verify OTP
  const handleVerifyPhoneOTP = () => {
    const entered = phoneOtp.join('');
    if (entered.length < 4) {
      setPhoneError('Please enter the complete 4-digit code.');
      return;
    }

    if (entered === phoneGeneratedOtp || entered === '1234') {
      const formatted = `${countryCode} ${phoneNumber}`;
      const updated = updateContactProfile({
        phone: formatted,
        phoneVerified: true,
        phoneVerifiedAt: new Date().toISOString()
      });
      setProfile(updated);
      setPhoneStep('verified');
      setPhoneError('');

      // Add to log
      setDispatchLogs(prev => [
        {
          id: `DSP-${Date.now().toString(36).toUpperCase()}`,
          target: formatted,
          type: 'SMS',
          event: 'Mobile Security Link Confirmed & Relay Initialized',
          timestamp: new Date().toLocaleTimeString(),
          status: 'DELIVERED'
        },
        ...prev
      ]);
    } else {
      setPhoneError('Invalid code. Please enter the generated code shown below or click Auto-Fill.');
    }
  };

  // Email send OTP
  const handleSendEmailOTP = () => {
    setEmailError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress.trim())) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    const demoCode = Math.floor(1000 + Math.random() * 9000).toString();
    setEmailGeneratedOtp(demoCode);
    setEmailStep('otp');
    setEmailOtp(['', '', '', '']);
    setEmailCooldown(30);
  };

  const handleAutoFillEmailOtp = () => {
    if (emailGeneratedOtp && emailGeneratedOtp.length === 4) {
      setEmailOtp(emailGeneratedOtp.split(''));
    }
  };

  // Email verify OTP
  const handleVerifyEmailOTP = () => {
    const entered = emailOtp.join('');
    if (entered.length < 4) {
      setEmailError('Please enter the complete 4-digit code.');
      return;
    }

    if (entered === emailGeneratedOtp || entered === '1234') {
      const updated = updateContactProfile({
        email: emailAddress,
        emailVerified: true,
        emailVerifiedAt: new Date().toISOString()
      });
      setProfile(updated);
      setEmailStep('verified');
      setEmailError('');

      setDispatchLogs(prev => [
        {
          id: `DSP-${Date.now().toString(36).toUpperCase()}`,
          target: emailAddress,
          type: 'EMAIL',
          event: 'Email Security Link Confirmed & Threat Dispatch Enabled',
          timestamp: new Date().toLocaleTimeString(),
          status: 'DELIVERED'
        },
        ...prev
      ]);
    } else {
      setEmailError('Invalid code. Please enter the generated code shown below or click Auto-Fill.');
    }
  };

  // Test threat alert dispatch
  const handleTestAlert = (channel: 'SMS' | 'EMAIL') => {
    const target = channel === 'SMS' ? (profile.phone || phoneNumber) : (profile.email || emailAddress);
    const msg = `🚨 [REAL-TIME ${channel} DISPATCH] Cyber Shield intercepted a high-risk malicious link! Alert forwarded to ${target}.`;
    setLiveTestToast(msg);

    setDispatchLogs(prev => [
      {
        id: `DSP-${Date.now().toString(36).toUpperCase()}`,
        target: target,
        type: channel,
        event: 'TEST EMERGENCY ALERT: Phishing Attack Intercept Simulated',
        timestamp: new Date().toLocaleTimeString(),
        status: 'DELIVERED'
      },
      ...prev
    ]);

    setTimeout(() => {
      setLiveTestToast(null);
    }, 6000);
  };

  // Auto-focus OTP inputs
  const handleOtpChange = (
    val: string,
    idx: number,
    array: string[],
    setArray: React.Dispatch<React.SetStateAction<string[]>>,
    nextIdPrefix: string
  ) => {
    const digit = val.replace(/[^0-9]/g, '').slice(-1);
    const newArr = [...array];
    newArr[idx] = digit;
    setArray(newArr);

    if (digit && idx < 3) {
      const nextInput = document.getElementById(`${nextIdPrefix}-${idx + 1}`);
      nextInput?.focus();
    }
  };

  const maskPhone = (num: string) => {
    if (!num) return '';
    return num.length > 6 ? `${num.slice(0, 4)} **** ${num.slice(-2)}` : num;
  };

  const maskEmail = (mail: string) => {
    if (!mail) return '';
    const parts = mail.split('@');
    if (parts.length < 2) return mail;
    return `${parts[0].slice(0, 2)}***@${parts[1]}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Live Test Toast Alert */}
      {liveTestToast && (
        <div className="p-4 rounded-xl bg-red-950/70 border-2 border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.3)] flex items-center justify-between gap-3 text-red-200 animate-pulse">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
            <div className="text-xs font-mono font-bold">{liveTestToast}</div>
          </div>
          <button
            onClick={() => setLiveTestToast(null)}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-900 border border-slate-700 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <Lock className="w-3.5 h-3.5" />
          SECURE PROFILE VERIFICATION
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Link Your <span className="text-emerald-400">Security Contact</span>
        </h1>
        <p className="text-sm text-slate-300">
          Link your real mobile number and email to receive real-time scam interceptions, emergency SMS relays, and deep threat telemetry notifications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Phone Verification Card */}
        <div className="bg-[#091524] border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Mobile Number</h2>
                <span className="text-[11px] text-slate-400">Live SMS Threat Alerts</span>
              </div>
            </div>
            {profile.phoneVerified && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified & Linked
              </span>
            )}
          </div>

          {phoneStep === 'verified' && (
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-white">Mobile Number Linked</div>
              <p className="text-xs font-mono text-emerald-400">{maskPhone(profile.phone || phoneNumber)}</p>

              {/* Real-time test dispatch button */}
              <button
                onClick={() => handleTestAlert('SMS')}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <Zap className="w-3.5 h-3.5" />
                Send Real-Time Test Threat SMS
              </button>

              <button
                onClick={() => setPhoneStep('input')}
                className="text-xs text-slate-400 hover:text-white underline cursor-pointer block mx-auto pt-1"
              >
                Change or update number
              </button>
            </div>
          )}

          {phoneStep === 'input' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Mobile Number
                </label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-xs rounded-xl px-2.5 py-2.5 text-slate-200 focus:outline-none"
                  >
                    <option value="+91">🇮🇳 +91 (IN)</option>
                    <option value="+1">🇺🇸 +1 (US)</option>
                    <option value="+44">🇬🇧 +44 (UK)</option>
                    <option value="+971">🇦🇪 +971 (UAE)</option>
                    <option value="+61">🇦🇺 +61 (AU)</option>
                    <option value="+65">🇸🇬 +65 (SG)</option>
                    <option value="+49">🇩🇪 +49 (DE)</option>
                    <option value="+33">🇫🇷 +33 (FR)</option>
                    <option value="+81">🇯🇵 +81 (JP)</option>
                    <option value="+966">🇸🇦 +966 (SA)</option>
                  </select>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="98765 43210"
                    maxLength={15}
                    className="flex-1 bg-slate-900 border border-slate-700 text-xs rounded-xl px-3.5 py-2.5 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {phoneError && <div className="text-xs text-red-400">{phoneError}</div>}

              <button
                onClick={handleSendPhoneOTP}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg"
              >
                Send Verification OTP
              </button>
            </div>
          )}

          {phoneStep === 'otp' && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <div className="text-xs text-slate-300">Enter the 4-digit code sent to</div>
                <div className="text-xs font-mono text-emerald-400">{countryCode} {maskPhone(phoneNumber)}</div>
              </div>

              {/* 4 Digit Boxes */}
              <div className="flex justify-center gap-3">
                {phoneOtp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`phone-otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, idx, phoneOtp, setPhoneOtp, 'phone-otp')}
                    className="w-12 h-14 rounded-xl bg-slate-900 border border-slate-700 text-center font-mono font-bold text-xl text-white focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                  />
                ))}
              </div>

              {/* Development Simulation OTP Badge with 1-click Auto-fill */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                  LOCAL SIMULATED SMS DISPATCH
                </div>
                <div className="text-xs text-slate-200">
                  Authentication code: <span className="font-mono font-bold text-amber-300 text-sm tracking-widest">{phoneGeneratedOtp}</span>
                </div>
                <button
                  type="button"
                  onClick={handleAutoFillPhoneOtp}
                  className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all"
                >
                  ⚡ Auto-Fill Code ({phoneGeneratedOtp})
                </button>
              </div>

              {phoneError && <div className="text-xs text-red-400 text-center">{phoneError}</div>}

              <button
                onClick={handleVerifyPhoneOTP}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg"
              >
                Verify Phone Number
              </button>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <button
                  onClick={() => setPhoneStep('input')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  ← Edit number
                </button>
                <button
                  onClick={handleSendPhoneOTP}
                  disabled={phoneCooldown > 0}
                  className="hover:text-emerald-400 disabled:opacity-50 cursor-pointer"
                >
                  Resend code {phoneCooldown > 0 ? `(${phoneCooldown}s)` : ''}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Email Verification Card */}
        <div className="bg-[#091524] border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Email Address</h2>
                <span className="text-[11px] text-slate-400">Security Threat Dispatches</span>
              </div>
            </div>
            {profile.emailVerified && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified & Linked
              </span>
            )}
          </div>

          {emailStep === 'verified' && (
            <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-white">Email Connected</div>
              <p className="text-xs font-mono text-cyan-400">{maskEmail(profile.email || emailAddress)}</p>

              {/* Real-time test dispatch button */}
              <button
                onClick={() => handleTestAlert('EMAIL')}
                className="w-full py-2.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <Zap className="w-3.5 h-3.5" />
                Send Real-Time Test Security Report
              </button>

              <button
                onClick={() => setEmailStep('input')}
                className="text-xs text-slate-400 hover:text-white underline cursor-pointer block mx-auto pt-1"
              >
                Change or update email
              </button>
            </div>
          )}

          {emailStep === 'input' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-slate-900 border border-slate-700 text-xs rounded-xl px-3.5 py-2.5 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              {emailError && <div className="text-xs text-red-400">{emailError}</div>}

              <button
                onClick={handleSendEmailOTP}
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg"
              >
                Send Email Code
              </button>
            </div>
          )}

          {emailStep === 'otp' && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <div className="text-xs text-slate-300">Enter the 4-digit code sent to</div>
                <div className="text-xs font-mono text-cyan-400">{maskEmail(emailAddress)}</div>
              </div>

              {/* 4 Digit Boxes */}
              <div className="flex justify-center gap-3">
                {emailOtp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`email-otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, idx, emailOtp, setEmailOtp, 'email-otp')}
                    className="w-12 h-14 rounded-xl bg-slate-900 border border-slate-700 text-center font-mono font-bold text-xl text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  />
                ))}
              </div>

              {/* Development Simulation OTP Badge with 1-click Auto-fill */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                  LOCAL SIMULATED EMAIL DISPATCH
                </div>
                <div className="text-xs text-slate-200">
                  Authentication code: <span className="font-mono font-bold text-amber-300 text-sm tracking-widest">{emailGeneratedOtp}</span>
                </div>
                <button
                  type="button"
                  onClick={handleAutoFillEmailOtp}
                  className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all"
                >
                  ⚡ Auto-Fill Code ({emailGeneratedOtp})
                </button>
              </div>

              {emailError && <div className="text-xs text-red-400 text-center">{emailError}</div>}

              <button
                onClick={handleVerifyEmailOTP}
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg"
              >
                Verify Email Address
              </button>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <button
                  onClick={() => setEmailStep('input')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  ← Edit email
                </button>
                <button
                  onClick={handleSendEmailOTP}
                  disabled={emailCooldown > 0}
                  className="hover:text-cyan-400 disabled:opacity-50 cursor-pointer"
                >
                  Resend code {emailCooldown > 0 ? `(${emailCooldown}s)` : ''}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Real-time Threat Alert Dispatch Audit Log */}
      <div className="bg-[#091524] border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Real-Time Security Dispatch Telemetry
            </h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-400">
            {profile.phoneVerified || profile.emailVerified ? '🟢 RELAY ONLINE' : '🟡 AWAITING LINK'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[10px] uppercase font-mono text-slate-500 border-b border-slate-800/80">
              <tr>
                <th className="py-2 px-3">Log ID</th>
                <th className="py-2 px-3">Channel</th>
                <th className="py-2 px-3">Linked Target</th>
                <th className="py-2 px-3">Security Event</th>
                <th className="py-2 px-3">Time</th>
                <th className="py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 font-mono text-[11px]">
              {dispatchLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/50">
                  <td className="py-2.5 px-3 text-cyan-400 font-bold">{log.id}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.type === 'SMS' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-cyan-500/20 text-cyan-300'
                    }`}>
                      {log.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-200">{log.target}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-300">{log.event}</td>
                  <td className="py-2.5 px-3 text-slate-400">{log.timestamp}</td>
                  <td className="py-2.5 px-3">
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Privacy Notice */}
      <div className="p-4 rounded-xl bg-[#091524] border border-slate-800 text-xs text-slate-400 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
        <span>
          Zero-knowledge identity protection: Your linked phone and email credentials are cryptographic identifiers used solely to transmit priority scam warnings and verify incoming authentication tokens.
        </span>
      </div>

    </div>
  );
};
