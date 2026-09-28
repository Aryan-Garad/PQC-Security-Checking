import React, { useState, useEffect } from 'react';
import { Cpu, Zap, CheckCircle2, Sliders, ArrowDownRight, Activity } from 'lucide-react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

export default function QuantumBenchmark() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchBenchmark = async (recalculate = false) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/quantum/optimize?recalculate=${recalculate}`);
      setData(res.data);
    } catch (err) {
      console.error('Quantum optimization error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBenchmark(false);
  }, []);

  if (!data) {
    return (
      <div className="glass-panel p-5 mb-6 text-center text-xs text-slate-400">
        Loading Quantum-Inspired Evolutionary Algorithm (QIEA) benchmark...
      </div>
    );
  }

  const baseline = data.baseline_metrics;
  const qiea = data.quantum_inspired_metrics;

  const chartData = [
    { metric: 'Accuracy', Baseline: Math.round(baseline.accuracy * 100), QIEA: Math.round(qiea.accuracy * 100) },
    { metric: 'Precision', Baseline: Math.round(baseline.precision * 100), QIEA: Math.round(qiea.precision * 100) },
    { metric: 'Recall', Baseline: Math.round(baseline.recall * 100), QIEA: Math.round(qiea.recall * 100) },
    { metric: 'F1-Score', Baseline: Math.round(baseline.f1_score * 100), QIEA: Math.round(qiea.f1_score * 100) },
  ];

  return (
    <div className="glass-panel p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Cpu className="text-purple-400" size={20} />
            Quantum-Inspired Evolutionary Algorithm (QIEA) Feature Selection
          </h2>
          <p className="text-xs text-slate-400">
            Quantum probability rotation on classical hardware optimizing security feature space & detection latency.
          </p>
        </div>
        <button
          onClick={() => fetchBenchmark(true)}
          disabled={loading}
          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md"
        >
          <Zap size={14} className={loading ? 'animate-spin' : ''} />
          <span>Run QIEA Optimization</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        {/* Metric Card 1: Feature Reduction */}
        <div className="glass-card p-3.5 border-l-4 border-purple-500">
          <p className="text-[11px] text-slate-400 font-medium">Feature Space Optimization</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-purple-300">{qiea.feature_count} / {baseline.feature_count}</span>
            <span className="text-xs text-emerald-400 font-mono font-bold flex items-center">
              <ArrowDownRight size={14} /> -{data.feature_reduction_percent}%
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Reduces unnecessary features while maintaining full security detection rate.</p>
        </div>

        {/* Metric Card 2: F1-Score Maintenance */}
        <div className="glass-card p-3.5 border-l-4 border-cyan-500">
          <p className="text-[11px] text-slate-400 font-medium">F1-Score Benchmark</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-cyan-300">{(qiea.f1_score * 100).toFixed(1)}%</span>
            <span className="text-xs text-slate-400 font-mono">vs Baseline {(baseline.f1_score * 100).toFixed(1)}%</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Zero loss in threat classification accuracy after feature reduction.</p>
        </div>

        {/* Metric Card 3: Detection Latency Drop */}
        <div className="glass-card p-3.5 border-l-4 border-emerald-500">
          <p className="text-[11px] text-slate-400 font-medium">Detection Latency Improvement</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-emerald-400">{qiea.latency_ms} ms</span>
            <span className="text-xs text-emerald-400 font-mono">(-{((1 - qiea.latency_ms / baseline.latency_ms) * 100).toFixed(0)}%)</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Faster threat evaluation due to lower computational feature cost.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Recharts Bar Chart Comparison */}
        <div className="glass-card p-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
            Baseline vs Quantum-Inspired Performance Metrics (%)
          </h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="metric" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Baseline" fill="#64748b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="QIEA" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Selected Feature Subset List */}
        <div className="glass-card p-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Optimized Feature Subset (QIEA Selected)</span>
            <span className="text-purple-400 font-mono font-normal text-[11px]">{data.optimized_features.length} Features Active</span>
          </h3>

          <div className="space-y-1.5 mt-3 max-h-44 overflow-y-auto pr-1">
            {data.all_features.map((feat) => {
              const isSelected = data.optimized_features.includes(feat);
              return (
                <div
                  key={feat}
                  className={`p-2 rounded text-xs flex items-center justify-between font-mono ${
                    isSelected ? 'bg-purple-950/60 border border-purple-500/40 text-purple-200' : 'bg-slate-900/40 border border-slate-800 text-slate-500 line-through'
                  }`}
                >
                  <span>{feat}</span>
                  {isSelected ? (
                    <span className="text-[10px] text-purple-400 font-bold flex items-center gap-1">
                      <CheckCircle2 size={12} /> ACTIVE
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-600">EXCLUDED</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
