import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Cpu, Activity, Database, Lock, RefreshCw, Eye } from 'lucide-react';
import axios from 'axios';

import InteractiveFlowStepper from './components/InteractiveFlowStepper';
import DatasetInfoBanner from './components/DatasetInfoBanner';
import DashboardStats from './components/DashboardStats';
import AttackSimulator from './components/AttackSimulator';
import LiveThreatMonitor from './components/LiveThreatMonitor';
import MldsaPlayground from './components/MldsaPlayground';
import QuantumBenchmark from './components/QuantumBenchmark';
import ThreatExplainModal from './components/ThreatExplainModal';
import DatabaseViewerModal from './components/DatabaseViewerModal';

export default function App() {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedInspectEvent, setSelectedInspectEvent] = useState(null);
  const [showDatabaseModal, setShowDatabaseModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const statsRes = await axios.get('/api/dashboard/stats');
      setStats(statsRes.data);

      const eventsRes = await axios.get('/api/events?limit=30');
      setEvents(eventsRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 4000); // Live poll every 4s
    return () => clearInterval(interval);
  }, []);

  const handleScenarioTriggered = (result) => {
    fetchDashboardData();
    if (result && result.event) {
      setSelectedInspectEvent({
        ...result.event,
        reasons: result.reasons
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header Bar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl text-black shadow-lg glow-cyan">
            <Shield size={24} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-white tracking-wide">QUANTUM-INSPIRED CYBER THREAT DETECTION</h1>
              <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold rounded border border-cyan-500/30">
                SIH 2026 PROTOTYPE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Post-Quantum ML-DSA-65 Digital Signature Security & Hybrid QIEA Behavioral Analytics</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Interactive Database Browser Trigger */}
          <button
            onClick={() => setShowDatabaseModal(true)}
            className="flex items-center gap-2 text-xs font-mono text-cyan-300 bg-slate-800/90 hover:bg-slate-700 px-3.5 py-1.5 rounded-lg border border-cyan-500/40 transition-all shadow-md active:scale-95 cursor-pointer"
            title="Click to open raw PostgreSQL Database Browser"
          >
            <Database size={15} className="text-cyan-400" />
            <span className="font-bold">PostgreSQL Event DB</span>
            <span className="px-1.5 py-0.2 bg-cyan-500/20 text-[10px] rounded text-cyan-300">View Data</span>
          </button>

          <button
            onClick={fetchDashboardData}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
            title="Refresh Stream"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-cyan-400' : ''} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        
        {/* 1. SIH 2026 Interactive Demonstration Stepper (Top Scenario Walkthrough) */}
        <InteractiveFlowStepper onScenarioTriggered={handleScenarioTriggered} />

        {/* 2. Active Security Dataset Info Banner & 9-Feature Dictionary */}
        <DatasetInfoBanner stats={stats} />

        {/* 3. Hero Stats Grid */}
        <DashboardStats stats={stats} />

        {/* 4. Live Attack Simulator Console */}
        <AttackSimulator onAttackTriggered={handleScenarioTriggered} />

        {/* 5. ML-DSA Playground & Tamper Demo */}
        <MldsaPlayground />

        {/* 6. Quantum-Inspired QIEA Optimization Panel */}
        <QuantumBenchmark />

        {/* 7. Live Threat Monitor Table */}
        <LiveThreatMonitor events={events} onSelectInspect={(evt) => setSelectedInspectEvent(evt)} />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/50 py-4 text-center text-xs text-slate-500 font-mono flex items-center justify-center gap-3">
        <span>SIH 2026 Cybersecurity Prototype | ML-DSA-65 (FIPS 204) + Quantum-Inspired Evolutionary Algorithm (QIEA)</span>
        <button
          onClick={() => setShowDatabaseModal(true)}
          className="text-cyan-400 hover:underline font-bold"
        >
          [ Open PostgreSQL Database Inspector ]
        </button>
      </footer>

      {/* Explainability Modal */}
      {selectedInspectEvent && (
        <ThreatExplainModal
          event={selectedInspectEvent}
          onClose={() => setSelectedInspectEvent(null)}
        />
      )}

      {/* Interactive PostgreSQL Database Inspector Modal */}
      {showDatabaseModal && (
        <DatabaseViewerModal
          onClose={() => setShowDatabaseModal(false)}
        />
      )}
    </div>
  );
}
