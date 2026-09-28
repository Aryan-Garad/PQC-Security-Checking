import React, { useState } from 'react';
import { Play, Flame, RefreshCw, FileCode, Radio, AlertOctagon } from 'lucide-react';
import axios from 'axios';

export default function AttackSimulator({ onAttackTriggered }) {
  const [loading, setLoading] = useState(false);
  const [lastSimResult, setLastSimResult] = useState(null);

  const attacks = [
    { label: 'Normal Request', type: 'NORMAL', color: 'bg-emerald-600 hover:bg-emerald-500', icon: Play },
    { label: 'Tampering Attack', type: 'TAMPERING', color: 'bg-rose-600 hover:bg-rose-500', icon: Flame },
    { label: 'Replay Attack', type: 'REPLAY_ATTACK', color: 'bg-purple-600 hover:bg-purple-500', icon: RefreshCw },
    { label: 'Signature Forgery', type: 'SIGNATURE_FORGERY', color: 'bg-amber-600 hover:bg-amber-500', icon: FileCode },
    { label: 'Abnormal Frequency', type: 'HIGH_FREQUENCY_ANOMALY', color: 'bg-cyan-600 hover:bg-cyan-500', icon: Radio },
    { label: 'Suspicious IP Change', type: 'SUSPICIOUS_IP', color: 'bg-indigo-600 hover:bg-indigo-500', icon: AlertOctagon },
  ];

  const triggerAttack = async (attackType) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/simulator/trigger', { attack_type: attackType });
      setLastSimResult(res.data);
      if (onAttackTriggered) onAttackTriggered(res.data);
    } catch (err) {
      console.error("Attack simulation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Flame className="text-rose-500" size={20} />
            SIH 2026 Live Threat & Attack Simulator
          </h2>
          <p className="text-xs text-slate-400">Trigger real-time attacks to test post-quantum signature verification and behavioral threat detection.</p>
        </div>
        {loading && <span className="text-xs font-mono text-cyan-400 animate-pulse">Running pipeline...</span>}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {attacks.map((atk) => {
          const IconComponent = atk.icon;
          return (
            <button
              key={atk.type}
              onClick={() => triggerAttack(atk.type)}
              disabled={loading}
              className={`${atk.color} text-white font-medium py-2.5 px-3 rounded-lg text-xs flex flex-col items-center justify-center gap-1.5 transition-all shadow-lg hover:shadow-cyan-500/10 active:scale-95 disabled:opacity-50`}
            >
              <IconComponent size={16} />
              <span>{atk.label}</span>
            </button>
          );
        })}
      </div>

      {/* Replay Attack Highlight Banner */}
      {lastSimResult && lastSimResult.attack_type === 'REPLAY_ATTACK' && (
        <div className="mt-4 p-3 bg-purple-950/80 border border-purple-500/40 rounded-lg flex items-start justify-between">
          <div>
            <span className="px-2 py-0.5 bg-purple-500 text-white font-mono text-xs font-bold rounded">
              SIH CENTRAL DEMONSTRATION HIGHLIGHT
            </span>
            <p className="text-xs text-purple-200 mt-1">
              <strong>Signature Status:</strong> ML-DSA VALID ✓ | <strong>Detector Decision:</strong> REPLAY ATTACK (Risk: {lastSimResult.risk_score}) → <strong>BLOCK</strong>
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Proves why standard digital signatures alone are insufficient without quantum-inspired behavioral threat detection!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
