# Quantum-Inspired Cyber Threat Detection for Digital Signature Security (SIH 2026 Prototype)

A complete, functional cybersecurity prototype for **Smart India Hackathon (SIH) 2026** demonstrating post-quantum digital signature security (**ML-DSA-65 / FIPS 204**), central security data collection with **PostgreSQL**, hybrid **Rule + Machine Learning Threat Detection**, and classical **Quantum-Inspired Evolutionary Algorithm (QIEA)** feature optimization.

---

## 🏛️ System Architecture

```
[ Attack Simulator / User ]
            ↓
    [ React Dashboard (Port 3000) ]
            ↓ REST API
    [ FastAPI Backend (Port 8000) ]
       ├── 1. Cryptographic Core: ML-DSA-65 (FIPS 204 Dilithium3)
       ├── 2. PostgreSQL Security Event Database
       ├── 3. Hybrid Threat Detector (Rule Engine + Scikit-Learn Random Forest/Isolation Forest)
       └── 4. Quantum-Inspired Evolutionary Algorithm (QIEA Feature Selector)
            ↓
   [ Real-Time Live Threat Monitor & Explainable AI Inspector ]
```

---

## 🚀 Key Features & Components

### 1. ML-DSA Asymmetric Key Generator (FIPS 204)
- **Security Category 3 (256-bit quantum security level)**
- **Public Key Display**: Safely exposes public key hex (1952 bytes).
- **Private Key Isolation**: Never exposes private keys in security logs or plaintext database records.
- **Tamper Demonstration**: Digitally signs original transaction (e.g. `"Transfer Rs. 5000"`) and proves that altering even 1 digit to `"Transfer Rs. 50000"` fails verification (`DATA TAMPERED / INVALID SIGNATURE`).

### 2. Security Event Storage (PostgreSQL & Dual SQLite Fallback)
- Central schema tracking `users`, `key_metadata`, `signature_events`, `verification_events`, `security_events`, and `threat_detections`.
- Records feature vectors per request: `user_id`, `timestamp`, `ip_address`, `signature_valid`, `verification_time_ms`, `request_frequency`, `failed_verification_count`, `nonce`, `nonce_reused`, `signature_reused`, `ip_changed`, `key_age_days`, `event_type`, `threat_label`, `risk_score`.

### 3. Hybrid Threat Detection & Explainability
- **Deterministic Rule Engine**: Instantly flags signature tampering, nonce reuse, frequency spikes, and IP shifts.
- **ML Anomaly & Classifier**: Random Forest & Isolation Forest scoring events into `NORMAL`, `TAMPERING`, `SIGNATURE_FORGERY`, `REPLAY_ATTACK`, `BEHAVIORAL_ANOMALY`, and `SUSPICIOUS_ACTIVITY`.
- **Explainable AI (XAI)**: Generates explicit human-readable reasons explaining WHY a request was flagged or blocked.

### 4. Quantum-Inspired Evolutionary Algorithm (QIEA)
- Runs quantum probability amplitude rotation on classical hardware:
  $$|\psi\rangle = \cos\theta |0\rangle + \sin\theta |1\rangle$$
- Optimizes security feature selection to reduce computational cost & latency while maintaining 100% detection recall.
- Provides side-by-side empirical performance benchmarks (Baseline vs Quantum-Inspired).

---

## 🛠️ Quickstart Guide

### Prerequisites
- Python 3.10+
- Node.js v18+ & npm

### 1. Install Dependencies
```bash
# Python dependencies
pip install -r requirements.txt

# Frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Run Tests
```bash
python -m pytest tests/
```

### 3. Start Application
```bash
python start_demo.py
```
- **Backend API**: `http://localhost:8000`
- **Interactive Dashboard**: `http://localhost:3000`

---

## 🎬 SIH 2026 Demonstration Walkthrough

### DEMO 1: Valid ML-DSA Transaction
1. Open Dashboard -> Navigate to **ML-DSA Playground**.
2. Click **Generate ML-DSA-65 Keypair**.
3. Click **Sign Message with ML-DSA-65**.
4. Result: `Signature VALID ✓` → Enforced Action: `ALLOW` → Risk: `LOW`.

### DEMO 2: Message Tampering Detection
1. In **ML-DSA Playground**, click **Run Tamper Demonstration**.
2. Original message `"Transfer Rs. 5000"` verifies as `VALID`.
3. Tampered message `"Transfer Rs. 50000"` fails verification: `DATA TAMPERED / INVALID SIGNATURE` → Enforced Action: `BLOCK`.

### DEMO 3: Replay Attack (Central Value Proposition)
1. On the **Attack Simulator**, click `[ Replay Attack ]`.
2. Notice: The ML-DSA signature remains **cryptographically valid**, BUT the behavioral detector identifies:
   - `Nonce reused`
   - `Signature vector reused`
   - `Abnormal request frequency spike`
3. System classifies event as `REPLAY_ATTACK` → Risk: `CRITICAL (94/100)` → Enforced Action: `BLOCK`.
4. Demonstrates why post-quantum digital signatures alone are insufficient without behavioral cyber-threat detection!

### DEMO 4: Quantum-Inspired QIEA Benchmark
1. Scroll to **Quantum-Inspired Evolutionary Algorithm** panel.
2. Click **Run QIEA Optimization**.
3. View the side-by-side bar chart showing feature space reduction (from 9 to 6 features) and latency drop with zero loss in F1 accuracy score.
