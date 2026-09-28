import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Eye } from 'lucide-react';

export default function LiveThreatMonitor({ events, onSelectInspect }) {
  const getRiskBadge = (score) => {
    if (score >= 81) return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    if (score >= 61) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    if (score >= 31) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  };

  const getActionBadge = (action) => {
    return action === 'BLOCK'
      ? 'bg-rose-600 text-white font-bold'
      : 'bg-emerald-600/80 text-white font-medium';
  };

  return (
    <div className="glass-panel p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <ShieldAlert className="text-cyan-400" size={20} />
          Live Security Threat Monitor
        </h2>
        <span className="text-xs text-slate-400 font-mono">Real-time Stream</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-700/60 text-slate-400 uppercase tracking-wider font-semibold">
              <th className="pb-3 px-3">User ID</th>
              <th className="pb-3 px-3">IP Address</th>
              <th className="pb-3 px-3">ML-DSA Signature</th>
              <th className="pb-3 px-3">Risk Score</th>
              <th className="pb-3 px-3">Threat Category</th>
              <th className="pb-3 px-3">Decision</th>
              <th className="pb-3 px-3 text-right">Explainability</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {events.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-6 text-center text-slate-500">
                  No security events logged yet. Use the Attack Simulator above to generate events.
                </td>
              </tr>
            ) : (
              events.map((evt) => (
                <tr key={evt.event_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-200">{evt.user_id}</td>
                  <td className="py-3 px-3 font-mono text-slate-400">{evt.ip_address}</td>
                  <td className="py-3 px-3">
                    {evt.signature_valid ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-mono font-medium">
                        <ShieldCheck size={14} /> VALID
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-400 font-mono font-medium">
                        <AlertTriangle size={14} /> INVALID
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded border text-xs font-mono font-bold ${getRiskBadge(evt.risk_score)}`}>
                      {String(evt.risk_score).padStart(2, '0')}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-200">{evt.threat_label}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-xs tracking-wider uppercase font-mono ${getActionBadge(evt.risk_score >= 65 ? 'BLOCK' : 'ALLOW')}`}>
                      {evt.risk_score >= 65 ? 'BLOCK' : 'ALLOW'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onSelectInspect(evt)}
                      className="px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded text-xs font-medium inline-flex items-center gap-1 border border-cyan-500/30 transition-colors"
                    >
                      <Eye size={12} /> Why?
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
