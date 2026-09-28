import React, { useState } from 'react';
import { Database, Info, Layers, Cpu, ArrowRight, HelpCircle, CheckCircle2 } from 'lucide-react';

export default function DatasetInfoBanner({ stats }) {
  const [showFeatureGuide, setShowFeatureGuide] = useState(false);

  const featuresList = [
    { name: "signature_valid", type: "Boolean", desc: "Is the ML-DSA-65 lattice signature mathematically valid?" },
    { name: "request_frequency", type: "Integer", desc: "Number of requests per minute from client (Baseline: 1-5)" },
    { name: "nonce_reused", type: "Boolean", desc: "Has this exact cryptographic nonce been seen in DB before?" },
    { name: "signature_reused", type: "Boolean", desc: "Has this exact signature vector been replayed?" },
    { name: "failed_verification_count", type: "Integer", desc: "Consecutive failed verification attempts recorded for user" },
    { name: "ip_changed", type: "Boolean", desc: "Has the request origin IP shifted to an unrecognized subnet?" },
    { name: "verification_time_ms", type: "Float", desc: "Cryptographic signature verification latency in milliseconds" },
    { name: "message_size_bytes", type: "Integer", desc: "Payload size in bytes of the digital transaction" },
    { name: "key_age_days", type: "Integer", desc: "Age of the active ML-DSA public key pair" }
  ];

  return (
    <div className="glass-panel p-5 mb-6 border-l-4 border-cyan-400 bg-slate-900/90">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left Side: Active Dataset Info */}
        <div className="flex items-start gap-3">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20 shrink-0">
            <Database size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-extrabold text-slate-100 uppercase tracking-wider">
                ACTIVE SECURITY DATASET & DATA SOURCE
              </h2>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold rounded border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 size={10} /> 1,200 Active Security Logs Loaded
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              <strong>Source Data:</strong> Live PostgreSQL Stream + 9-Dimensional Security Feature Vectors generated using NIST FIPS 204 ML-DSA-65 standards.
            </p>
          </div>
        </div>

        {/* Right Side: Feature Vector Guide Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowFeatureGuide(!showFeatureGuide)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono font-bold rounded-lg border border-cyan-500/30 flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Layers size={14} className="text-cyan-400" />
            <span>{showFeatureGuide ? "Hide Feature Dictionary" : "Inspect 9 ML Features Used"}</span>
          </button>
        </div>
      </div>

      {/* Expandable 9-Feature Dictionary Drawer */}
      {showFeatureGuide && (
        <div className="mt-4 pt-4 border-t border-slate-800 animate-in fade-in duration-200">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <HelpCircle size={14} className="text-purple-400" />
            What Data Are We Feeding Into The Threat Detector & QIEA Optimizer?
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {featuresList.map((f) => (
              <div key={f.name} className="p-2.5 bg-slate-950 rounded border border-slate-800 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-cyan-300 text-[11px]">{f.name}</span>
                  <span className="text-[9px] font-mono bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30">{f.type}</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
