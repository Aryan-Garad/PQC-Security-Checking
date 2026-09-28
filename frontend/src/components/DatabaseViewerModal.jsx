import React, { useState, useEffect } from 'react';
import { X, Database, Table, RefreshCw, FileText, Code, CheckCircle, ShieldAlert } from 'lucide-react';
import axios from 'axios';

export default function DatabaseViewerModal({ onClose }) {
  const [activeTable, setActiveTable] = useState('security_events');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const fetchTableData = async (tableName) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/database/raw?table=${tableName}&limit=30`);
      setData(res.data);
      setSelectedRow(null);
    } catch (err) {
      console.error('Database fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTableData(activeTable);
  }, [activeTable]);

  const tables = [
    { id: 'security_events', label: 'Security Events Log' },
    { id: 'threat_detections', label: 'Threat Detections' },
    { id: 'key_metadata', label: 'Key Metadata (No PrivKeys)' },
    { id: 'users', label: 'Registered Users' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-5xl h-[85vh] p-6 relative border border-slate-700 shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/30">
              <Database size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-slate-100">PostgreSQL Central Security Database Browser</h3>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold rounded border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle size={10} /> CONNECTED
                </span>
              </div>
              <p className="text-xs text-slate-400">Direct query inspection interface for SIH jury demonstration.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchTableData(activeTable)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1 font-mono transition-colors"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin text-cyan-400' : ''} /> Refresh
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Table Selector Tabs */}
        <div className="flex gap-2 border-b border-slate-800 pb-3 mb-4 overflow-x-auto">
          {tables.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTable(t.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all ${
                activeTable === t.id
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Table size={14} />
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden">
          
          {/* Table Data View */}
          <div className="md:col-span-2 glass-card p-3 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-mono text-cyan-400 font-bold">
                SELECT * FROM {activeTable} LIMIT 30;
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {data?.rows ? `${data.rows.length} rows returned` : 'Loading...'}
              </span>
            </div>

            <div className="flex-1 overflow-auto border border-slate-800 rounded bg-slate-950/80">
              {loading ? (
                <div className="p-8 text-center text-xs text-cyan-400 font-mono animate-pulse">
                  Querying PostgreSQL Database...
                </div>
              ) : !data?.rows || data.rows.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No database rows found in table '{activeTable}'. Trigger an attack to generate data.
                </div>
              ) : (
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 sticky top-0">
                    <tr>
                      {Object.keys(data.rows[0]).slice(0, 5).map((col) => (
                        <th key={col} className="p-2 text-[11px] uppercase tracking-wider">{col}</th>
                      ))}
                      <th className="p-2 text-right">Raw JSON</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {data.rows.map((row, idx) => (
                      <tr
                        key={idx}
                        onClick={() => setSelectedRow(row)}
                        className={`hover:bg-cyan-500/10 cursor-pointer transition-colors ${
                          selectedRow === row ? 'bg-cyan-500/20 text-cyan-200' : 'text-slate-300'
                        }`}
                      >
                        {Object.values(row).slice(0, 5).map((val, vIdx) => (
                          <td key={vIdx} className="p-2 truncate max-w-[120px]">
                            {typeof val === 'boolean' ? (val ? 'TRUE' : 'FALSE') : String(val)}
                          </td>
                        ))}
                        <td className="p-2 text-right text-cyan-400">
                          <Code size={12} className="inline" /> Inspect
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Raw JSON Record Inspector */}
          <div className="glass-card p-3 flex flex-col overflow-hidden">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Code size={14} className="text-purple-400" />
              Raw Database Record Inspector
            </h4>

            {selectedRow ? (
              <div className="flex-1 overflow-auto bg-slate-950 p-3 rounded border border-slate-800 font-mono text-[11px] text-cyan-300">
                <pre className="whitespace-pre-wrap break-all">
                  {JSON.stringify(selectedRow, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="flex-1 p-4 bg-slate-950/40 rounded border border-dashed border-slate-800 flex flex-col items-center justify-center text-center text-xs text-slate-500">
                <FileText size={24} className="mb-2 text-slate-600" />
                Select any database row on the left to inspect its raw SQL column values and payload.
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-500">
          <span>Schema Security Constraint: Private keys are NEVER stored in plaintext.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded text-xs transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
