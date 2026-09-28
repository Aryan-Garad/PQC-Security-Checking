import React from 'react';
import { ShieldCheck, ShieldAlert, Activity, AlertTriangle, Lock } from 'lucide-react';

export default function DashboardStats({ stats }) {
  const counters = stats?.counters || {
    total_requests: 0,
    valid_signatures: 0,
    invalid_signatures: 0,
    threats_detected: 0,
    blocked_requests: 0
  };

  const riskLevel = stats?.system_risk_level || 'LOW';

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      {/* Counter 1: Total Requests */}
      <div className="glass-panel p-4 flex items-center justify-between border-l-4 border-cyan-500">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Total Requests</p>
          <p className="text-2xl font-bold text-slate-100 mt-1">{counters.total_requests}</p>
        </div>
        <div className="p-3 bg-cyan-500/10 rounded-lg text-cyan-400">
          <Activity size={24} />
        </div>
      </div>

      {/* Counter 2: Valid ML-DSA Signatures */}
      <div className="glass-panel p-4 flex items-center justify-between border-l-4 border-emerald-500">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">ML-DSA Valid</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{counters.valid_signatures}</p>
        </div>
        <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
          <ShieldCheck size={24} />
        </div>
      </div>

      {/* Counter 3: Invalid / Tampered */}
      <div className="glass-panel p-4 flex items-center justify-between border-l-4 border-rose-500">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Invalid / Tampered</p>
          <p className="text-2xl font-bold text-rose-400 mt-1">{counters.invalid_signatures}</p>
        </div>
        <div className="p-3 bg-rose-500/10 rounded-lg text-rose-400">
          <AlertTriangle size={24} />
        </div>
      </div>

      {/* Counter 4: Threats Detected */}
      <div className="glass-panel p-4 flex items-center justify-between border-l-4 border-purple-500">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Threats Flagged</p>
          <p className="text-2xl font-bold text-purple-400 mt-1">{counters.threats_detected}</p>
        </div>
        <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
          <ShieldAlert size={24} />
        </div>
      </div>

      {/* Counter 5: System Action / Blocked */}
      <div className="glass-panel p-4 flex items-center justify-between border-l-4 border-amber-500">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Requests Blocked</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{counters.blocked_requests}</p>
        </div>
        <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400">
          <Lock size={24} />
        </div>
      </div>
    </div>
  );
}
