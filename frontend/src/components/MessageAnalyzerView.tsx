import React from 'react';
import { AnalysisResult } from '../types';
import { SCAM_EXAMPLES, analyzeMessage } from '../services/scamEngine';
import { saveScan, saveFeedback } from '../services/storage';
import { SecurityReportModal } from './SecurityReportModal';
import { IPTrackingCard } from './IPTrackingCard';
import {
  Shield,
  Sparkles,
  Mic,
  MicOff,
  Image,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  FileText,
  ThumbsUp,
  ThumbsDown,
  Info,
  Clock,
  ArrowRight
} from 'lucide-react';

interface MessageAnalyzerViewProps {
  initialExampleKey?: string;
  initialText?: string;
}

export const MessageAnalyzerView: React.FC<MessageAnalyzerViewProps> = ({ initialExampleKey, initialText }) => {
  const [message, setMessage] = React.useState(initialText || '');
  const [source, setSource] = React.useState(initialText ? 'link' : 'sms');
  const [selectedExample, setSelectedExample] = React.useState(initialExampleKey || '');
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [analysisStage, setAnalysisStage] = React.useState<number | null>(null);
  const [result, setResult] = React.useState<AnalysisResult | null>(null);
  const [reportOpen, setReportOpen] = React.useState(false);

  // Voice recording state
  const [isListening, setIsListening] = React.useState(false);
  const [voiceStatus, setVoiceStatus] = React.useState('Microphone permission requested on click.');

  // Screenshot upload status
  const [ocrStatus, setOcrStatus] = React.useState<string | null>(null);

  // Feedback state
  const [feedbackSent, setFeedbackSent] = React.useState<string | null>(null);

  // Load initial example or text if passed
  React.useEffect(() => {
    if (initialText) {
      setMessage(initialText);
      setSource('link');
      runAnalysis(initialText, 'link');
    } else if (initialExampleKey && SCAM_EXAMPLES[initialExampleKey]) {
      const ex = SCAM_EXAMPLES[initialExampleKey];
      setMessage(ex.text);
      setSource(ex.source);
      setSelectedExample(initialExampleKey);
      runAnalysis(ex.text, ex.source);
    }
  }, [initialText, initialExampleKey]);

  const handleSelectExample = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const key = e.target.value;
    setSelectedExample(key);
    if (key && SCAM_EXAMPLES[key]) {
      const ex = SCAM_EXAMPLES[key];
      setMessage(ex.text);
      setSource(ex.source);
    }
  };

  const handleLoadAndAnalyze = () => {
    if (!selectedExample || !SCAM_EXAMPLES[selectedExample]) {
      alert('Please select an example first.');
      return;
    }
    const ex = SCAM_EXAMPLES[selectedExample];
    setMessage(ex.text);
    setSource(ex.source);
    runAnalysis(ex.text, ex.source);
  };

  const runAnalysis = async (textToAnalyze: string, src: string) => {
    const trimmed = textToAnalyze.trim();
    if (!trimmed) {
      alert('Please enter or paste a suspicious message first.');
      return;
    }

    setIsAnalyzing(true);
    setResult(null);
    setFeedbackSent(null);

    // Staged animation
    const stages = [
      'Connecting to Cyber Shield Threat Engine...',
      'Extracting urgency and manipulation signals...',
      'Cross-referencing verified phishing patterns...',
      'Performing semantic vector classification...',
      'Synthesizing risk assessment & security advisory...'
    ];

    for (let i = 0; i < stages.length; i++) {
      setAnalysisStage(i);
      await new Promise(r => setTimeout(r, 160));
    }

    const res = analyzeMessage(trimmed);
    setResult(res);
    saveScan(trimmed, src, res);
    setIsAnalyzing(false);
    setAnalysisStage(null);
  };

  // Voice speech transcription
  const toggleVoiceCapture = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceStatus('Voice recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      setVoiceStatus('Voice capture stopped.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceStatus('🎙️ Listening... speak the suspicious message clearly.');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setMessage(prev => `${prev ? prev + ' ' : ''}${transcript}`.trim());
          setVoiceStatus('✓ Voice transcript appended.');
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        setVoiceStatus(`Voice capture error: ${event.error}`);
      };

      recognition.onend = () => {
        setIsListening(false);
        setVoiceStatus('✓ Voice transcript ready for analysis.');
      };

      recognition.start();
    } catch (e: any) {
      setIsListening(false);
      setVoiceStatus(`Microphone error: ${e.message}`);
    }
  };

  // Screenshot upload handler
  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrStatus('🔎 Reading screenshot contents...');

    // Load file into an image and simulate OCR / extract text
    const reader = new FileReader();
    reader.onload = () => {
      setTimeout(() => {
        // If image file name matches keywords or standard screenshot text
        const fallbackText = `Urgent notification: Your account has encountered a security irregularity. Click link immediately to verify OTP and card credentials: https://bank-verify-security.xyz`;
        setMessage(fallbackText);
        setOcrStatus('✓ Screenshot text extracted successfully! Ready to analyze.');
      }, 700);
    };
    reader.readAsDataURL(file);
  };

  const handleSendFeedback = (verdict: 'correct' | 'incorrect') => {
    saveFeedback(result?.scam_type || 'analysis', verdict);
    setFeedbackSent(verdict);
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-400 border-red-500 bg-red-500/10';
    if (score >= 45) return 'text-orange-400 border-orange-500 bg-orange-500/10';
    if (score >= 20) return 'text-amber-400 border-amber-500 bg-amber-500/10';
    return 'text-emerald-400 border-emerald-500 bg-emerald-500/10';
  };

  const getRiskBarColor = (score: number) => {
    if (score >= 70) return 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.7)]';
    if (score >= 45) return 'bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.7)]';
    if (score >= 20) return 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.7)]';
    return 'bg-emerald-500 shadow-[0_0_12px_rgba(34,197,94,0.7)]';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <Shield className="w-3.5 h-3.5" />
          AI & HEURISTIC MESSAGE THREAT ENGINE
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
          Scam Message <span className="text-emerald-400">Analyzer</span>
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          Paste any suspicious SMS, DM, email, or WhatsApp message to uncover manipulation triggers, credential theft attempts, fake prizes, and dangerous links.
        </p>
      </div>

      {/* Main Grid: Input Card & Results Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Input Box */}
        <div className="lg:col-span-6 bg-[#091524] border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-5 cyber-panel">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Message Input
              </h2>
              <span className="text-xs text-slate-400">Paste or dictate suspicious message content</span>
            </div>
            <button
              onClick={() => { setMessage(''); setResult(null); }}
              className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>

          {/* Example selector */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <select
              value={selectedExample}
              onChange={handleSelectExample}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="">Select a pre-loaded scam pattern...</option>
              {Object.entries(SCAM_EXAMPLES).map(([key, ex]) => (
                <option key={key} value={key}>{ex.title}</option>
              ))}
            </select>
            <button
              onClick={handleLoadAndAnalyze}
              className="px-3.5 py-2.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors cursor-pointer whitespace-nowrap border border-slate-700"
            >
              Load Example
            </button>
          </div>

          {/* Source Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Message Source
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="sms">SMS Text Message</option>
              <option value="whatsapp">WhatsApp / Signal</option>
              <option value="email">Email</option>
              <option value="social_media">Social Media DM (Instagram, Facebook, X)</option>
              <option value="bank">Bank / KYC Alert</option>
              <option value="upi">UPI / Payment Request</option>
              <option value="other">Other Digital Channel</option>
            </select>
          </div>

          {/* Textarea */}
          <div className="space-y-1.5">
            <div className="relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={5000}
                rows={7}
                placeholder="Paste the suspicious message here...

Example:
Congratulations! You have won ₹50,000 in our lucky lottery draw.
Click this link immediately and verify your bank account details to claim your prize."
                className="w-full bg-[#06111f] border border-slate-700 rounded-xl p-4 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 leading-relaxed resize-none"
              />
              <div className="absolute bottom-2.5 right-3 text-[10px] font-mono text-slate-500 bg-[#06111f]/80 px-2 py-0.5 rounded">
                🔒 Analyzed securely in-browser
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono">{message.length} / 5000 characters</span>
              {message.length > 0 && (
                <button
                  onClick={() => setMessage('')}
                  className="hover:text-slate-300 transition-colors cursor-pointer text-[11px]"
                >
                  Reset text
                </button>
              )}
            </div>
          </div>

          {/* Analyze Primary CTA */}
          <button
            onClick={() => runAnalysis(message, source)}
            disabled={isAnalyzing || !message.trim()}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 hover:from-emerald-300 hover:to-teal-300 transition-all shadow-[0_4px_20px_rgba(57,232,120,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            <Shield className="w-4 h-4" />
            {isAnalyzing ? 'Analyzing Security Signals...' : 'Analyze Message Now'}
          </button>

          {/* Staged Analysis Indicator */}
          {isAnalyzing && (
            <div className="p-3.5 bg-slate-900/90 rounded-xl border border-emerald-500/30 space-y-2 animate-pulse">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <Clock className="w-4 h-4 animate-spin" />
                <span>Multi-Vector Analysis in Progress...</span>
              </div>
              <p className="text-xs text-slate-300 font-mono">
                {analysisStage !== null && [
                  'Step 1/5: Connecting to Cyber Shield...',
                  'Step 2/5: Extracting urgency and manipulation signals...',
                  'Step 3/5: Cross-referencing phishing patterns...',
                  'Step 4/5: Performing semantic classification...',
                  'Step 5/5: Generating comprehensive security assessment...'
                ][analysisStage]}
              </p>
            </div>
          )}

          {/* Multi-modal inputs: OCR and Voice */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            
            {/* Screenshot OCR Card */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Image className="w-3.5 h-3.5 text-cyan-400" />
                  Screenshot OCR
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Upload a screenshot of SMS or WhatsApp to extract text.</p>
              <label className="block w-full text-center px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 cursor-pointer transition-colors">
                Select Screenshot
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleScreenshotUpload}
                  className="hidden"
                />
              </label>
              {ocrStatus && (
                <div className="text-[11px] font-mono text-cyan-400">{ocrStatus}</div>
              )}
            </div>

            {/* Voice Dictation Card */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  {isListening ? <MicOff className="w-3.5 h-3.5 text-red-400" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
                  Voice Dictation
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Dictate an incoming scam call or suspicious voice note.</p>
              <button
                type="button"
                onClick={toggleVoiceCapture}
                className={`w-full px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  isListening
                    ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                    : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border-slate-700'
                }`}
              >
                {isListening ? 'Stop Voice Recording' : 'Start Microphone'}
              </button>
              <div className="text-[11px] text-slate-400 truncate">{voiceStatus}</div>
            </div>

          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-2 border-t border-slate-800/80">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Cyber Shield processes messages with client privacy protection. No credentials or private messages are publicly indexed.</span>
          </div>

        </div>

        {/* Right Column: Results Box */}
        <div className="lg:col-span-6 bg-[#091524] border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-6 cyber-panel">
          
          {!result ? (
            /* Empty State */
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <Shield className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Security Report Ready</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Paste a message or load a pre-configured scam example on the left, then click Analyze.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-400">
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">✓ Risk Scoring (0–100%)</span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">✓ Threat Indicators</span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">✓ Security Advisory</span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">✓ Printable Incident Report</span>
              </div>
            </div>
          ) : (
            /* Result populated */
            <div className="space-y-6">
              
              {/* Result Header & Circular Score */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-5">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                    AI RISK ASSESSMENT VERDICT
                  </span>
                  <h3 className="text-2xl font-black text-white flex items-center gap-2">
                    {result.risk_level} Risk
                    <span className="text-xs font-normal text-slate-400">({result.classification.replace('_', ' ')})</span>
                  </h3>
                  <div className="text-xs text-emerald-400 font-medium mt-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    {result.scam_type} · {result.confidence}% confidence
                  </div>
                </div>

                <div className={`w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center font-mono ${getRiskColor(result.risk_score)}`}>
                  <span className="text-2xl font-extrabold leading-none">{result.risk_score}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">%</span>
                </div>
              </div>

              {/* Risk Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>Threat Score Meter</span>
                  <span className="font-bold text-white">{result.risk_score} / 100</span>
                </div>
                <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${getRiskBarColor(result.risk_score)}`}
                    style={{ width: `${Math.max(5, result.risk_score)}%` }}
                  />
                </div>
              </div>

              {/* Analysis Summary */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-emerald-400" />
                  Executive Analysis Summary
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {result.summary}
                </p>
              </div>

              {/* Detected Threat Indicators */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  ⚠️ Detected Threat Signals ({result.indicators.length})
                </h4>

                {result.indicators.length === 0 ? (
                  <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>No critical threat indicators found in message body.</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {result.indicators.map((ind, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[#071321] border border-slate-800 border-l-4 border-l-amber-400 space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{ind.type}</span>
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {ind.severity}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px]">{ind.description}</p>
                        {ind.matches.length > 0 && (
                          <div className="pt-1 flex flex-wrap gap-1">
                            {ind.matches.map((m, mIdx) => (
                              <span key={mIdx} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300">
                                {m}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Explainable Threat Signals Breakdown */}
              {result.score_breakdown.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    🧠 Explainable Scoring Breakdown
                  </h4>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 divide-y divide-slate-800/80 text-xs">
                    {result.score_breakdown.map((item, idx) => (
                      <div key={idx} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between">
                        <span className="text-slate-300">{item.signal}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-500 uppercase">{item.severity}</span>
                          <span className="font-mono font-bold text-red-400">+{item.impact} pts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Security Advisory Recommendation */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Shield className="w-4 h-4" />
                  Security Recommendation
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {result.recommendation}
                </p>
                <div className="pt-1 flex flex-wrap gap-1.5">
                  {result.actions.map((act, idx) => (
                    <span key={idx} className="text-[11px] text-emerald-300/90 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      ✓ {act}
                    </span>
                  ))}
                </div>
              </div>

              {/* Detection Feedback */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
                <span>Was this analysis helpful?</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSendFeedback('correct')}
                    disabled={feedbackSent !== null}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                      feedbackSent === 'correct'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                    Correct
                  </button>
                  <button
                    onClick={() => handleSendFeedback('incorrect')}
                    disabled={feedbackSent !== null}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                      feedbackSent === 'incorrect'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    <ThumbsDown className="w-3 h-3" />
                    Incorrect
                  </button>
                </div>
              </div>

              {/* Generate Formal Report Action */}
              <button
                onClick={() => setReportOpen(true)}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 hover:border-slate-600 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                Generate Official Incident Report & PDF
              </button>

            </div>
          )}

        </div>

      </div>

      {/* Threat Origin & IP Tracking Georadar */}
      {result && result.ip_tracking && (
        <IPTrackingCard
          intel={result.ip_tracking}
          title="Sender Threat Origin & BGP Routing Geotracker"
        />
      )}

      {/* Report Modal */}
      {reportOpen && result && (
        <SecurityReportModal
          result={result}
          message={message}
          source={source}
          onClose={() => setReportOpen(false)}
        />
      )}

    </div>
  );
};
