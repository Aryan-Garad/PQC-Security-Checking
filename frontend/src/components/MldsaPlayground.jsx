import React, { useState, useEffect } from 'react';
import { Key, FileSignature, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';

export default function MldsaPlayground() {
  const [keys, setKeys] = useState(null);
  const [message, setMessage] = useState('Transfer Rs. 5000 to Account A');
  const [signatureData, setSignatureData] = useState(null);
  const [tamperResult, setTamperResult] = useState(null);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [signing, setSigning] = useState(false);

  const generateKeys = async () => {
    setLoadingKeys(true);
    try {
      const res = await axios.get('/api/crypto/generate-keys');
      setKeys(res.data);
      // Auto sign message when key is generated
      if (message) {
        const sigRes = await axios.post('/api/crypto/sign', {
          message: message,
          private_key_hex: res.data.private_key_hex
        });
        setSignatureData(sigRes.data.signature_data);
      }
      setTamperResult(null);
    } catch (err) {
      console.error('Key generation error:', err);
    } finally {
      setLoadingKeys(false);
    }
  };

  useEffect(() => {
    generateKeys();
  }, []);

  const signMessage = async () => {
    if (!keys) {
      await generateKeys();
      return;
    }
    setSigning(true);
    try {
      const res = await axios.post('/api/crypto/sign', {
        message: message,
        private_key_hex: keys.private_key_hex
      });
      setSignatureData(res.data.signature_data);
      setTamperResult(null);
    } catch (err) {
      console.error('Signing error:', err);
    } finally {
      setSigning(false);
    }
  };

  const runTamperTest = async () => {
    try {
      const res = await axios.post('/api/crypto/tamper-demo');
      setTamperResult(res.data);
    } catch (err) {
      console.error('Tamper demo error:', err);
    }
  };

  return (
    <div className="glass-panel p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Key className="text-cyan-400" size={20} />
            ML-DSA-65 Post-Quantum Key Generator & Tamper Playground
          </h2>
          <p className="text-xs text-slate-400">Generates 256-bit quantum-safe Dilithium keys and verifies digital message integrity.</p>
        </div>
        <button
          onClick={generateKeys}
          disabled={loadingKeys}
          className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
        >
          <RefreshCw size={14} className={loadingKeys ? 'animate-spin' : ''} />
          <span>Generate ML-DSA-65 Keypair</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column: Key Display & Signing */}
        <div className="glass-card p-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <FileSignature size={14} className="text-cyan-400" />
            1. Cryptographic Keypair & Message Signing
          </h3>

          {keys ? (
            <div className="space-y-2 mb-3 text-xs font-mono">
              <div className="bg-slate-950 p-2.5 rounded border border-cyan-500/30">
                <span className="text-cyan-400 block text-[10px] font-bold">PUBLIC KEY (ML-DSA-65 Hex):</span>
                <span className="text-slate-200 break-all text-[11px] font-mono">{keys.public_key_preview}</span>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400 text-[10px]">PRIVATE KEY STATUS:</span>
                <span className="text-emerald-400 font-bold">SECURED (Never exposed in logs) ✓</span>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800 text-center text-xs text-cyan-400 mb-3 animate-pulse">
              Initializing ML-DSA-65 Quantum Keypair...
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[11px] text-slate-300 block font-semibold">Message to Sign:</label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-slate-950 border border-cyan-500/50 rounded px-3 py-2 text-xs text-cyan-200 focus:outline-none focus:border-cyan-400 font-mono font-semibold shadow-inner"
              placeholder="Enter message to sign..."
            />
            <button
              onClick={signMessage}
              disabled={signing}
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded text-xs transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95"
            >
              <FileSignature size={15} /> Sign Message with ML-DSA-65
            </button>
          </div>

          {signatureData && (
            <div className="mt-3 p-3 bg-emerald-950/60 border border-emerald-500/40 rounded text-xs font-mono">
              <div className="flex items-center justify-between mb-1">
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle size={14} /> SIGNATURE GENERATED ✓
                </span>
                <span className="text-slate-400 text-[10px]">{signatureData.signature_size_bytes} bytes</span>
              </div>
              <span className="text-slate-300 break-all text-[11px] block">{signatureData.signature.slice(0, 60)}...</span>
            </div>
          )}
        </div>

        {/* Right Column: Tampering Test */}
        <div className="glass-card p-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <ShieldAlert size={14} className="text-rose-400" />
            2. Live Message Tamper Verification Demo
          </h3>

          <p className="text-xs text-slate-400 mb-3 leading-relaxed">
            Demonstrates how altering even 1 digit invalidates the post-quantum ML-DSA lattice signature hash.
          </p>

          <button
            onClick={runTamperTest}
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded text-xs transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 mb-3"
          >
            <ShieldAlert size={15} /> Run Tamper Demonstration
          </button>

          {tamperResult ? (
            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/40 rounded">
                <span className="text-slate-400 block text-[10px]">ORIGINAL MESSAGE:</span>
                <span className="text-slate-100 font-bold">{tamperResult.original_message}</span>
                <span className="ml-2 text-emerald-400 font-bold">[{tamperResult.original_verification}] ✓</span>
              </div>

              <div className="p-2.5 bg-rose-950/70 border border-rose-500/50 rounded">
                <span className="text-slate-400 block text-[10px]">TAMPERED MESSAGE:</span>
                <span className="text-slate-100 font-bold">{tamperResult.tampered_message}</span>
                <div className="mt-1 text-rose-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1">
                  <ShieldAlert size={14} /> {tamperResult.tampered_verification}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-900/40 rounded border border-dashed border-slate-800 text-center text-xs text-slate-500">
              Click 'Run Tamper Demonstration' to test live signature modification validation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
