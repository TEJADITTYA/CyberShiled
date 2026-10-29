import React from 'react';
import { BookOpen, Shield, AlertTriangle, Lock, CreditCard, Link2, Briefcase, Package, UserCheck, CheckCircle2 } from 'lucide-react';

export const LearningCenterView: React.FC = () => {
  const guides = [
    {
      icon: <Lock className="w-5 h-5 text-emerald-400" />,
      title: 'OTP & Authentication Hygiene',
      subtitle: 'Never share codes under any circumstance',
      points: [
        'No bank manager or support staff will EVER ask for your 6-digit OTP, ATM PIN, or CVV.',
        'Legitimate OTP messages state: "DO NOT SHARE THIS OTP WITH ANYONE, INCLUDING BANK OFFICIALS".',
        'If a caller says "share OTP to cancel unauthorized payment", hanging up and checking your banking app directly is the safest response.'
      ]
    },
    {
      icon: <CreditCard className="w-5 h-5 text-cyan-400" />,
      title: 'UPI & QR Code Rules',
      subtitle: 'Entering your UPI PIN always sends money',
      points: [
        'Entering your UPI PIN is ONLY required to DEDUCT money from your account. You NEVER enter a PIN to receive funds or cashback.',
        'Beware of OLX/Marketplace buyers claiming: "I am sending you a QR code to pay advance; scan it to receive money in your account".',
        'Always check the Payee Name shown on the confirmation screen before entering a PIN.'
      ]
    },
    {
      icon: <Link2 className="w-5 h-5 text-purple-400" />,
      title: 'Spotting Phishing Links',
      subtitle: 'Verify domain anatomy before clicking',
      points: [
        'Check the primary domain: sbi-verify.xyz or hdfc-kyc.top are NOT official bank websites.',
        'Shortened links (bit.ly, tinyurl, t.co) conceal the true destination. Paste them into Cyber Shield’s Link Scanner first.',
        'Look out for deceptive typosquatting like netfIix.com (with an uppercase i instead of lowercase L) or go0gle.com.'
      ]
    },
    {
      icon: <Briefcase className="w-5 h-5 text-amber-400" />,
      title: 'Fake Work-From-Home Jobs',
      subtitle: 'Legitimate employers never demand upfront fees',
      points: [
        'Any job asking for "registration fee", "training kit fee", or "courier charges" is a recruitment scam.',
        'Task scams: "Like YouTube videos or post reviews to earn ₹5,000 daily". You will be asked to deposit funds into a fake VIP portal.',
        'Always verify company recruiters through official corporate email addresses, not Telegram or WhatsApp numbers.'
      ]
    },
    {
      icon: <Package className="w-5 h-5 text-orange-400" />,
      title: 'Courier & Delivery Scams',
      subtitle: 'Fake parcel redelivery fees',
      points: [
        'Postal services (India Post, FedEx, BlueDart) do not send SMS threatening parcel destruction unless you pay ₹35 in 2 hours.',
        'Links in such messages lead to cloned payment gateways designed to harvest your credit card number, expiry, and CVV.',
        'Track packages only using tracking numbers on official carrier websites.'
      ]
    },
    {
      icon: <UserCheck className="w-5 h-5 text-teal-400" />,
      title: 'Social Media Impersonation',
      subtitle: 'Account copyright & emergency requests',
      points: [
        'Instagram or Facebook support never threatens account deletion via direct messages or WhatsApp.',
        'If a friend or relative DMs you asking for urgent money because of an "emergency hospital bill", call their verified voice number first.',
        'Never scan a QR code sent by someone on Instagram to "verify your account badge".'
      ]
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          CYBER SAFETY GUIDEBOOK
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Fraud Awareness & <span className="text-emerald-400">Defense Strategies</span>
        </h1>
        <p className="text-sm text-slate-300">
          Learn how modern social engineers deceive victims and master simple behavioral habits to keep yourself and your family secure.
        </p>
      </div>

      {/* Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guides.map((guide, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-[#091524] border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                  {guide.icon}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{guide.title}</h3>
                  <span className="text-xs text-slate-400">{guide.subtitle}</span>
                </div>
              </div>

              <ul className="space-y-2 pt-2 text-xs text-slate-300">
                {guide.points.map((pt, pIdx) => (
                  <li key={pIdx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-emerald-400 shrink-0 font-bold">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Emergency Action Plan */}
      <div className="p-6 rounded-2xl bg-[#091524] border border-red-500/30 space-y-3 shadow-xl">
        <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
          <AlertTriangle className="w-5 h-5" />
          Already Clicked or Transferred Money? Emergency Steps
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300 pt-2">
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1">
            <strong className="text-white block">1. Freeze Cards & UPI</strong>
            <p className="text-slate-400">Call your bank’s 24/7 emergency toll-free number immediately to block compromised accounts.</p>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1">
            <strong className="text-white block">2. Report to Cybercrime</strong>
            <p className="text-slate-400">File a complaint promptly on the national cybercrime portal or call emergency fraud helpline 1930.</p>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1">
            <strong className="text-white block">3. Reset Passwords</strong>
            <p className="text-slate-400">Change passwords and revoke active sessions on email, social media, and banking apps.</p>
          </div>
        </div>
      </div>

    </div>
  );
};
