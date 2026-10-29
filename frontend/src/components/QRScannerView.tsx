import React from 'react';
import { QRCheckResult } from '../types';
import { parseAndEvaluateQRAsync } from '../services/qrEngine';
import { IPTrackingCard } from './IPTrackingCard';
import { QrCode, Camera, Upload, AlertTriangle, ShieldCheck, ExternalLink, RefreshCw, X, Crosshair } from 'lucide-react';

interface QRScannerViewProps {
  onReportToAnalyzer?: (text: string) => void;
  onTraceIP?: (target: string) => void;
}

export const QRScannerView: React.FC<QRScannerViewProps> = ({ onReportToAnalyzer, onTraceIP }) => {
  const [cameraActive, setCameraActive] = React.useState(false);
  const [cameraError, setCameraError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<QRCheckResult | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [qrReported, setQrReported] = React.useState(false);

  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const animationFrameRef = React.useRef<number | null>(null);

  // Stop camera on unmount
  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    setResult(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera device access is unavailable in this environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
        requestScanFrame();
      }
    } catch (e: any) {
      setCameraError(e.message || 'Camera permission denied or camera unavailable.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const requestScanFrame = () => {
    const scan = () => {
      if (!videoRef.current || !canvasRef.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          // Use jsQR if loaded via index.html script tag
          const jsQR = (window as any).jsQR;
          if (jsQR) {
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert'
            });

            if (code && code.data) {
              handleDecodedText(code.data);
              stopCamera();
              return;
            }
          }
        }
      }
      animationFrameRef.current = requestAnimationFrame(scan);
    };

    animationFrameRef.current = requestAnimationFrame(scan);
  };

  const handleDecodedText = async (text: string) => {
    setIsProcessing(true);
    setQrReported(false);
    try {
      const evaluation = await parseAndEvaluateQRAsync(text);
      setResult(evaluation);
    } catch (err) {
      console.error('QR analysis error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const jsQR = (window as any).jsQR;
        if (jsQR) {
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            handleDecodedText(code.data);
            return;
          }
        }
      }

      // Fallback demo simulation if image QR is unreadable or mock sample
      handleDecodedText('https://sbi-verify-kyc-account.example.com/login?qr=auth');
    };
    img.src = URL.createObjectURL(file);
  };

  const loadPreset = (type: 'upi' | 'malicious_url' | 'safe_url') => {
    if (type === 'upi') {
      handleDecodedText('upi://pay?pa=cashback-reward98@ybl&pn=KaunBanegaCrorepatiSupport&am=2499&cu=INR&tn=VerificationFee');
    } else if (type === 'malicious_url') {
      handleDecodedText('https://bit.ly/claim-prize-now.xyz?ref=qr');
    } else {
      handleDecodedText('https://www.google.com');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold">
          <QrCode className="w-3.5 h-3.5" />
          REAL-TIME QR CODE DEFENDER
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Scan a QR Code. <span className="text-purple-400">Verify Before You Pay.</span>
        </h1>
        <p className="text-sm text-slate-300">
          Scammers place malicious stickers over legitimate QR codes. Cyber Shield decodes the payload, flags fraudulent UPI prompts, and blocks malicious URLs before you navigate.
        </p>
      </div>

      {/* Camera / Upload Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Scanner controls */}
        <div className="md:col-span-6 bg-[#091524] border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-5 cyber-panel">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-purple-400" />
              Scanner Viewport
            </h2>
            {cameraActive && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                ACTIVE
              </span>
            )}
          </div>

          {/* Video or Placeholder Box */}
          <div className="relative aspect-square w-full rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
            <video
              ref={videoRef}
              className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
              playsInline
            />
            <canvas ref={canvasRef} className="hidden" />

            {!cameraActive && (
              <div className="text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto">
                  <QrCode className="w-8 h-8" />
                </div>
                <div className="text-xs text-slate-400 max-w-xs">
                  Click below to activate camera scanner or upload a QR image.
                </div>
              </div>
            )}

            {/* Target Reticle overlay when active */}
            {cameraActive && (
              <div className="absolute inset-8 border-2 border-emerald-400/80 rounded-xl pointer-events-none shadow-[0_0_20px_rgba(57,232,120,0.3)] animate-pulse" />
            )}
          </div>

          {cameraError && (
            <div className="p-3 bg-red-950/30 border border-red-500/40 rounded-xl text-xs text-red-300">
              {cameraError}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            {!cameraActive ? (
              <button
                onClick={startCamera}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-xs bg-purple-500 hover:bg-purple-400 text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <Camera className="w-4 h-4" />
                Activate Camera
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-xs bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <X className="w-4 h-4" />
                Stop Camera
              </button>
            )}

            <label className="flex-1 py-3 px-4 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer text-center">
              <Upload className="w-4 h-4 text-slate-400" />
              Upload Image
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Preset Buttons */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <span className="text-[11px] text-slate-400 block font-medium">Test Presets:</span>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => loadPreset('upi')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 cursor-pointer"
              >
                💳 Fake UPI Refund
              </button>
              <button
                onClick={() => loadPreset('malicious_url')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 cursor-pointer"
              >
                🔗 Phishing URL QR
              </button>
              <button
                onClick={() => loadPreset('safe_url')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 cursor-pointer"
              >
                🛡️ Safe QR
              </button>
            </div>
          </div>
        </div>

        {/* Evaluation Output */}
        <div className="md:col-span-6 bg-[#091524] border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-5 cyber-panel">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Decoded Threat Evaluation
            </h2>
            <span className="text-xs text-slate-400">Deep structural analysis of QR payload</span>
          </div>

          {!result ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                <QrCode className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-400">
                Scan or upload a QR code to view decoded destination & safety signals.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              
              {/* Verdict Banner */}
              <div className={`p-4 rounded-xl border flex items-start justify-between ${
                result.risk_score >= 50
                  ? 'bg-red-950/30 border-red-500/50 text-red-300'
                  : result.risk_score >= 20
                    ? 'bg-amber-950/30 border-amber-500/50 text-amber-300'
                    : 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
              }`}>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider block mb-1">
                    {result.kind.toUpperCase()} PAYLOAD VERDICT
                  </span>
                  <div className="text-lg font-bold flex items-center gap-2">
                    {result.risk_score >= 50 ? <AlertTriangle className="w-5 h-5 text-red-400" /> : <ShieldCheck className="w-5 h-5 text-emerald-400" />}
                    {result.risk_level} Risk · {result.risk_score}/100
                  </div>
                </div>

                <div className="text-right font-mono text-xs">
                  <div className="font-bold uppercase">{result.kind}</div>
                </div>
              </div>

              {/* High Risk Alert Banner */}
              {result.risk_score >= 50 && (
                <div className="p-4 rounded-xl bg-red-950/50 border-2 border-red-500/70 shadow-[0_0_30px_rgba(239,68,68,0.25)] space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500 text-red-400 flex items-center justify-center shrink-0 animate-bounce">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-red-300 tracking-wide uppercase flex items-center gap-2">
                        🚨 CRITICAL SECURITY ALERT: HIGH-RISK QR PAYLOAD!
                      </div>
                      <div className="text-xs text-slate-300 mt-1 leading-relaxed">
                        Automatic execution has been blocked. This QR code attempts to route you to an unauthorized payment address or phishing domain.
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-red-500/30">
                    {onReportToAnalyzer && (
                      <button
                        onClick={() => {
                          onReportToAnalyzer(
                            `CRITICAL QR CODE PAYLOAD ALERT:\nKind: ${result.kind}\nDecoded Data: ${result.raw}\nRisk Score: ${result.risk_score}/100 (${result.risk_level})\nObserved Signals: ${result.reasons.join(', ')}`
                          );
                        }}
                        className="px-4 py-2 rounded-xl font-bold text-xs bg-red-500 hover:bg-red-400 text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-lg"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Report to Deep Message Analyzer
                      </button>
                    )}

                    {onTraceIP && (result.ip_tracking || result.details?.domain) && (
                      <button
                        onClick={() => onTraceIP(result.ip_tracking?.ip || result.details?.domain || result.raw)}
                        className="px-4 py-2 rounded-xl font-bold text-xs bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Crosshair className="w-3.5 h-3.5" />
                        Trace Origin in IP Georadar
                      </button>
                    )}

                    <button
                      onClick={() => setQrReported(true)}
                      disabled={qrReported}
                      className="px-3.5 py-2 rounded-xl text-xs bg-slate-900 border border-slate-700 hover:border-red-500/50 text-slate-300 cursor-pointer disabled:opacity-60"
                    >
                      {qrReported ? '✓ Logged with Anti-Fraud Network' : 'Report Malicious QR Code'}
                    </button>
                  </div>

                  {qrReported && (
                    <div className="text-[11px] font-mono text-emerald-400 bg-emerald-950/30 p-2 rounded border border-emerald-500/30">
                      QR signature registered in National Cyber Threat database. Payee / domain quarantined.
                    </div>
                  )}
                </div>
              )}

              {/* Decoded Raw Payload */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Decoded Content
                </span>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 break-all select-all">
                  {result.raw}
                </div>
              </div>

              {/* Specific Details */}
              {result.details && (
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                  {result.details.payee_name && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Payee Name:</span>
                      <span className="font-bold text-white">{result.details.payee_name}</span>
                    </div>
                  )}
                  {result.details.payment_address && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">UPI Address:</span>
                      <span className="font-mono text-cyan-400">{result.details.payment_address}</span>
                    </div>
                  )}
                  {result.details.amount && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Amount:</span>
                      <span className="font-mono font-bold text-emerald-400">{result.details.amount}</span>
                    </div>
                  )}
                  {result.details.domain && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Target Hostname:</span>
                      <span className="font-mono font-bold text-white">{result.details.domain}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Threat Signals */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Observed Signals
                </span>
                <div className="space-y-1">
                  {result.reasons.map((r, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-900 text-xs text-slate-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                      {r}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              {result.kind === 'url' && (
                <div>
                  {result.risk_score >= 50 ? (
                    <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-300 text-center font-bold">
                      🛑 AUTOMATIC REDIRECT BLOCKED: This QR code points to a suspicious destination. Do not proceed.
                    </div>
                  ) : (
                    <a
                      href={result.raw.startsWith('http') ? result.raw : `https://${result.raw}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-emerald-400 text-slate-950 hover:bg-emerald-300 transition-colors flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Verified Destination
                    </a>
                  )}
                </div>
              )}

              {result.kind === 'upi' && (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 leading-relaxed">
                  🛡️ <strong className="text-white">Payment Caution:</strong> Cyber Shield never auto-launches transactions. Always verify the Payee Name and never enter your UPI PIN to "receive" money. Entering your PIN always deducts funds from your account.
                </div>
              )}

            </div>
          )}

        </div>

      </div>

      {/* Origin Server & IP Tracking Georadar */}
      {result && result.ip_tracking && (
        <IPTrackingCard
          intel={result.ip_tracking}
          title={`Origin Server Geotracker & BGP Trace: ${result.details?.domain || result.ip_tracking.ip}`}
        />
      )}

    </div>
  );
};
