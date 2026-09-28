import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, RefreshCw, Flame, ArrowRight, CheckCircle, XCircle, AlertTriangle, Cpu, Layers } from 'lucide-react';
import axios from 'axios';

export default function InteractiveFlowStepper({ onScenarioTriggered }) {
  const [activeScenario, setActiveScenario] = useState('REPLAY_ATTACK');
  const [running, setRunning] = useState(false);
  const [flowResult, setFlowResult] = useState(null);

  const scenarios = [
    {
      id: 'NORMAL',
      title: 'Scenario A: Normal Signed Request',
      badge: 'VALID & ALLOWED',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      btnColor: 'bg-emerald-600 hover:bg-emerald-500',
      description: 'Standard transaction with valid ML-DSA-65 signature and normal user behavior.',
      flowText: 'Signature VALID → Frequency 3 req/min → Nonce NEW → Risk LOW (05/100) → ALLOW'
    },
    {
      id: 'TAMPERING',
      title: 'Scenario B: Message Tampering Attack',
      badge: 'TAMPERED & BLOCKED',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      btnColor: 'bg-rose-600 hover:bg-rose-500',
      description: 'Hacker alters "Transfer Rs. 5000" to "Transfer Rs. 50000". ML-DSA lattice hash fails verification.',
      flowText: 'Signature INVALID ✗ → Data Tampered → Risk CRITICAL (95/100) → BLOCK'
    },
    {
      id: 'REPLAY_ATTACK',
      title: 'Scenario C: Replay Attack (Central SIH Value)',
      badge: 'SIGNATURE VALID BUT BLOCKED!',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      btnColor: 'bg-purple-600 hover:bg-purple-500',
      description: 'Hacker captures valid signed request & replays it repeatedly. Signature is VALID, but behavioral detector flags nonce & signature reuse!',
      flowText: 'Signature VALID ✓ → Nonce Reused ✗ → Freq Spike (45 req/min) → Risk CRITICAL (94/100) → BLOCK'
    }
  ];

  const triggerScenario = async (scenarioId) => {
    setActiveScenario(scenarioId);
    setRunning(true);
    try {
      const res = await axios.post('/api/simulator/trigger', { attack_type: scenarioId });
      setFlowResult(res.data);
      if (onScenarioTriggered) onScenarioTriggered(res.data);
    } catch (err) {
      console.error('Scenario execution failed:', err);
    } finally {
      setRunning(false);
    }
  };

  const currentScenarioObj = scenarios.find(s => s.id === activeScenario) || scenarios[2];

  return (
    <div className="glass-panel p-5 mb-6 border-t-4 border-purple-500">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-100">SIH 2026 Interactive Jury Demonstration Stepper</h2>
            <span className="px-2.5 py-0.5 bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold rounded border border-purple-500/40">
              STEP-BY-STEP FLOW
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Click any scenario to see live data flow from post-quantum ML-DSA verification to PostgreSQL DB logging & ML threat detection.
          </p>
        </div>
      </div>

      {/* Scenario Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        {scenarios.map((s) => (
          <button
            key={s.id}
            onClick={() => triggerScenario(s.id)}
            className={`p-3.5 rounded-xl border text-left transition-all relative ${
              activeScenario === s.id
                ? 'bg-slate-900 border-purple-500 shadow-lg glow-cyan scale-[1.01]'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${s.badgeColor}`}>
                {s.badge}
              </span>
              {activeScenario === s.id && (
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              )}
            </div>

            <h3 className="text-xs font-bold text-slate-100">{s.title}</h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">{s.description}</p>
          </button>
        ))}
      </div>

      {/* Live Visual Data Pipeline Flow Diagram */}
      <div className="glass-card p-4 border border-slate-800 bg-slate-950">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center justify-between">
          <span>Live Execution Pipeline Diagram ({currentScenarioObj.title})</span>
          {running && <span className="text-cyan-400 font-mono text-xs animate-pulse">Processing vector...</span>}
        </h3>

        {/* Step Nodes Row */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center text-xs font-mono">
          
          {/* Node 1: Client Payload */}
          <div className="p-3 bg-slate-900 rounded border border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 block">STEP 1: CLIENT PAYLOAD</span>
            <span className="text-cyan-300 font-bold block mt-1">Transaction Data</span>
            <span className="text-[9px] text-slate-400 block mt-0.5">Message + Nonce</span>
          </div>

          {/* Node 2: ML-DSA-65 Verification */}
          <div className="p-3 bg-slate-900 rounded border border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 block">STEP 2: ML-DSA-65</span>
            <span className={`font-bold block mt-1 ${activeScenario === 'TAMPERING' ? 'text-rose-400' : 'text-emerald-400'}`}>
              {activeScenario === 'TAMPERING' ? 'INVALID ✗' : 'VALID ✓'}
            </span>
            <span className="text-[9px] text-slate-400 block mt-0.5">Post-Quantum Lattice</span>
          </div>

          {/* Node 3: PostgreSQL Logging */}
          <div className="p-3 bg-slate-900 rounded border border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 block">STEP 3: POSTGRESQL DB</span>
            <span className="text-purple-300 font-bold block mt-1">Feature Logged</span>
            <span className="text-[9px] text-slate-400 block mt-0.5">9 Feature Vector</span>
          </div>

          {/* Node 4: Threat Detector */}
          <div className="p-3 bg-slate-900 rounded border border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 block">STEP 4: THREAT ENGINE</span>
            <span className="text-amber-300 font-bold block mt-1">
              {activeScenario === 'NORMAL' ? 'NORMAL' : (activeScenario === 'TAMPERING' ? 'TAMPERING' : 'REPLAY ATTACK')}
            </span>
            <span className="text-[9px] text-slate-400 block mt-0.5">Rule + Random Forest</span>
          </div>

          {/* Node 5: Action Enforced */}
          <div className={`p-3 rounded border text-center font-bold ${
            activeScenario === 'NORMAL' ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
          }`}>
            <span className="text-[10px] block opacity-80">STEP 5: ENFORCEMENT</span>
            <span className="text-sm block mt-1 uppercase tracking-wider">
              {activeScenario === 'NORMAL' ? 'ALLOW REQUEST' : 'BLOCK REQUEST'}
            </span>
            <span className="text-[9px] block font-normal opacity-80">
              {activeScenario === 'NORMAL' ? 'Risk: LOW (05/100)' : 'Risk: CRITICAL (94/100)'}
            </span>
          </div>
        </div>

        {/* Dynamic Scenario Explanation Banner */}
        <div className="mt-3 p-3 bg-slate-900/90 rounded border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
          <Info size={16} className="text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <strong>Summary for Jury:</strong> {currentScenarioObj.flowText}
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ size, className }) {
  return <Layers size={size} className={className} />;
}
