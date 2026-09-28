import React from 'react';
import { X, ShieldAlert, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

export default function ThreatExplainModal({ event, onClose }) {
  if (!event) return null;

  const getRiskColor = (score) => {
    if (score >= 81) return 'text-rose-400 border-rose-500/40 bg-rose-950/60';
    if (score >= 61) return 'text-amber-400 border-amber-500/40 bg-amber-950/60';
    return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/60';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-2xl p-6 relative border border-slate-700 shadow-2xl animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4 border-b border-slate-800 pb-3">
          <div className="p-3 bg-rose-500/20 text-rose-400 rounded-lg">
            <ShieldAlert size={26} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">Why Was This Request Evaluated as Malicious / Blocked?</h3>
            <p className="text-xs text-slate-400 font-mono">Event ID: {event.event_id} | User: {event.user_id}</p>
          </div>
        </div>

        {/* Risk & Action Header Banner */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className={`p-3 rounded border font-mono ${getRiskColor(event.risk_score)}`}>
            <span className="text-[10px] text-slate-400 block uppercase">Calculated Risk Score</span>
            <span className="text-2xl font-bold">{event.risk_score} / 100</span>
          </div>

          <div className="p-3 bg-slate-900 border border-slate-800 rounded font-mono">
            <span className="text-[10px] text-slate-400 block uppercase">Threat Category</span>
            <span className="text-sm font-bold text-purple-300 mt-1 block">{event.threat_label}</span>
          </div>

          <div className="p-3 bg-slate-900 border border-slate-800 rounded font-mono">
            <span className="text-[10px] text-slate-400 block uppercase">Enforced Security Action</span>
            <span className={`text-sm font-bold mt-1 block ${event.risk_score >= 65 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {event.risk_score >= 65 ? 'BLOCK REQUEST ✖' : 'ALLOW REQUEST ✓'}
            </span>
          </div>
        </div>

        {/* Explainability Reasons Breakdown */}
        <div className="mb-5">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <FileText size={14} className="text-cyan-400" />
            Explainable AI (XAI) Security Audit Findings:
          </h4>
          <div className="space-y-2">
            {event.reasons && event.reasons.length > 0 ? (
              event.reasons.map((reason, idx) => (
                <div key={idx} className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg text-xs flex items-start gap-2.5">
                  <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-slate-200 leading-relaxed font-mono">{reason}</span>
                </div>
              ))
            ) : (
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-400">
                Standard request policy passed without rule violations.
              </div>
            )}
          </div>
        </div>

        {/* Feature Vector Context */}
        <div className="glass-card p-3 font-mono text-xs">
          <span className="text-[10px] text-slate-500 uppercase block mb-1">Key Feature Snapshot:</span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
            <div><span className="text-slate-500">Sig Valid:</span> <span className={event.signature_valid ? 'text-emerald-400' : 'text-rose-400 font-bold'}>{event.signature_valid ? 'TRUE' : 'FALSE'}</span></div>
            <div><span className="text-slate-500">Req Freq:</span> <span className="text-cyan-300">{event.request_frequency} req/min</span></div>
            <div><span className="text-slate-500">Nonce Reused:</span> <span className={event.nonce_reused ? 'text-rose-400 font-bold' : 'text-slate-400'}>{event.nonce_reused ? 'TRUE' : 'FALSE'}</span></div>
            <div><span className="text-slate-500">IP Changed:</span> <span className={event.ip_changed ? 'text-amber-400' : 'text-slate-400'}>{event.ip_changed ? 'TRUE' : 'FALSE'}</span></div>
          </div>
        </div>

        <div className="mt-5 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-xs transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
