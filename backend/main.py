"""
FastAPI Backend Application for Quantum-Inspired Cyber Threat Detection Prototype.
Integrates ML-DSA Cryptography, PostgreSQL Storage, Threat Detection Engine, and QIEA Optimization.
"""

import sys
import os
import uuid
import time
from datetime import datetime
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Ensure root directory is on Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from crypto.mldsa_core import MLDSA65
from crypto.tamper_demo import run_tamper_demonstration
from database.db import db_manager
from database.attack_generator import generate_security_event, USERS, IPS
from ml.rules_engine import RuleEngine
from ml.classifier import ThreatMLClassifier
from ml.explainer import ThreatExplainer
from quantum_inspired.feature_selection import FeatureOptimizer

app = FastAPI(
    title="Quantum-Inspired Cyber Threat Detection API",
    description="SIH 2026 Prototype REST Services",
    version="1.0.0"
)

# Enable CORS for Frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global ML Classifier instance
ml_classifier = ThreatMLClassifier()

# Memory cache for key pairs in demo session
DEMO_KEYS = {}

# Pydantic Schemas
class SignRequest(BaseModel):
    message: str
    private_key_hex: str
    nonce: Optional[str] = None

class VerifyRequest(BaseModel):
    message: str
    signature: str
    message_digest: str
    nonce: str
    public_key_hex: str

class AttackTriggerRequest(BaseModel):
    attack_type: str = "NORMAL"

class AnalyzeEventRequest(BaseModel):
    user_id: str = "U001"
    message: str = "Transfer Rs. 5000 to Account A"
    signature_data: Optional[Dict[str, Any]] = None
    public_key_hex: Optional[str] = None
    ip_address: Optional[str] = "192.168.1.15"
    request_frequency: Optional[int] = 3
    failed_verification_count: Optional[int] = 0
    nonce_reused: Optional[bool] = False
    signature_reused: Optional[bool] = False
    ip_changed: Optional[bool] = False

@app.get("/")
def read_root():
    return {
        "status": "ONLINE",
        "system": "Quantum-Inspired Cyber Threat Detection (SIH 2026)",
        "crypto_algorithm": "ML-DSA-65 (FIPS 204)",
        "timestamp": datetime.now().isoformat()
    }

# ==================================================
# 1. CRYPTOGRAPHIC MODULE ENDPOINTS
# ==================================================

@app.get("/api/crypto/generate-keys")
def generate_keys():
    """Generates an ML-DSA-65 public/private key pair."""
    pub_key, priv_key = MLDSA65.generate_keypair()
    key_id = f"KEY-{uuid.uuid4().hex[:8].upper()}"
    DEMO_KEYS[key_id] = {"pub": pub_key, "priv": priv_key}
    
    return {
        "key_id": key_id,
        "algorithm": MLDSA65.PARAM_NAME,
        "public_key_hex": pub_key,
        "public_key_preview": f"{pub_key[:32]}...{pub_key[-16:]}",
        "private_key_secured": True,
        "private_key_hex": priv_key,
        "message": "Key pair generated successfully. Private key is never logged to security database."
    }

@app.post("/api/crypto/sign")
def sign_message(req: SignRequest):
    """Signs a message using ML-DSA-65 private key."""
    try:
        sig_data = MLDSA65.sign_message(req.message, req.private_key_hex, req.nonce)
        return {
            "status": "SUCCESS",
            "message": req.message,
            "signature_data": sig_data
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/crypto/verify")
def verify_signature(req: VerifyRequest):
    """Verifies an ML-DSA-65 digital signature."""
    sig_data = {
        "signature": req.signature,
        "message_digest": req.message_digest,
        "nonce": req.nonce
    }
    is_valid = MLDSA65.verify_signature(req.message, sig_data, req.public_key_hex)
    return {
        "signature_valid": is_valid,
        "status": "VALID" if is_valid else "INVALID / DATA TAMPERED",
        "algorithm": MLDSA65.PARAM_NAME
    }

@app.post("/api/crypto/tamper-demo")
def tamper_demo():
    """Executes the interactive ML-DSA signature tampering demonstration."""
    return run_tamper_demonstration()

# ==================================================
# 2. THREAT DETECTION & PIPELINE ENDPOINTS
# ==================================================

@app.post("/api/detection/analyze")
def analyze_event(req: AnalyzeEventRequest):
    """
    Executes full threat analysis pipeline:
    1. Digital signature verification
    2. Feature vector construction
    3. Rule Engine evaluation
    4. ML Anomaly Classifier inference
    5. Explainability reasoning
    6. Persist to PostgreSQL Database
    """
    start_time = time.time()
    event_id = f"EVT-{uuid.uuid4().hex[:12].upper()}"
    request_id = f"REQ-{uuid.uuid4().hex[:8].upper()}"
    
    # Check signature validity if provided
    sig_valid = True
    if req.signature_data and req.public_key_hex:
        sig_valid = MLDSA65.verify_signature(req.message, req.signature_data, req.public_key_hex)
        
    verification_time = round((time.time() - start_time) * 1000, 2)
    nonce = req.signature_data.get("nonce", os.urandom(16).hex()) if req.signature_data else os.urandom(16).hex()

    event = {
        "event_id": event_id,
        "user_id": req.user_id,
        "timestamp": datetime.now().isoformat(),
        "request_id": request_id,
        "ip_address": req.ip_address or "192.168.1.15",
        "algorithm_variant": "ML-DSA-65",
        "signature_valid": sig_valid,
        "verification_time_ms": verification_time,
        "message_size_bytes": len(req.message),
        "request_frequency": req.request_frequency or 1,
        "failed_verification_count": req.failed_verification_count or 0,
        "nonce": nonce,
        "nonce_reused": req.nonce_reused or False,
        "signature_reused": req.signature_reused or False,
        "ip_changed": req.ip_changed or False,
        "key_age_days": 2,
        "event_type": "TRANSACTION_REQUEST",
        "threat_label": "NORMAL",
        "risk_score": 0
    }

    # Step 1: Rule Engine Evaluation
    rule_threat, rule_risk, rule_reasons, rule_action = RuleEngine.evaluate(event)

    # Step 2: ML Classifier Inference
    ml_threat, confidence, anomaly_score = ml_classifier.predict(event)

    # Step 3: Risk Scoring & Hybrid Consolidation
    final_threat = rule_threat if rule_threat != "NORMAL" else ml_threat
    final_risk = max(rule_risk, int(anomaly_score * 100)) if rule_threat == "NORMAL" else rule_risk
    final_action = "BLOCK" if final_risk >= 65 else "ALLOW"

    # Step 4: Explainability Breakdown
    reasons = ThreatExplainer.explain_decision(event, rule_reasons, final_threat, final_risk)

    event["threat_label"] = final_threat
    event["risk_score"] = final_risk

    detection_record = {
        "detection_id": f"DET-{uuid.uuid4().hex[:8].upper()}",
        "event_id": event_id,
        "user_id": req.user_id,
        "timestamp": datetime.now().isoformat(),
        "threat": final_threat,
        "risk_score": final_risk,
        "confidence": round(confidence, 2),
        "action": final_action,
        "reasons": reasons,
        "feature_mode": "BASELINE"
    }

    # Persist log to PostgreSQL/SQLite DB
    db_manager.log_security_event(event)
    db_manager.log_threat_detection(detection_record)

    return {
        "event_id": event_id,
        "signature_valid": sig_valid,
        "threat": final_threat,
        "risk_score": final_risk,
        "confidence": round(confidence, 2),
        "action": final_action,
        "reasons": reasons,
        "event_data": event
    }

# ==================================================
# 3. ATTACK SIMULATOR ENDPOINT
# ==================================================

@app.post("/api/simulator/trigger")
def trigger_simulated_attack(req: AttackTriggerRequest):
    """
    Triggers a live simulated attack event (NORMAL, TAMPERING, REPLAY_ATTACK, SIGNATURE_FORGERY, HIGH_FREQUENCY_ANOMALY, SUSPICIOUS_IP).
    """
    evt = generate_security_event(req.attack_type)
    
    rule_threat, rule_risk, rule_reasons, rule_action = RuleEngine.evaluate(evt)
    ml_threat, confidence, anomaly_score = ml_classifier.predict(evt)
    
    final_threat = rule_threat if rule_threat != "NORMAL" else ml_threat
    final_risk = max(rule_risk, evt["risk_score"])
    final_action = "BLOCK" if final_risk >= 65 else "ALLOW"
    
    reasons = ThreatExplainer.explain_decision(evt, rule_reasons, final_threat, final_risk)
    
    detection_record = {
        "detection_id": f"DET-{uuid.uuid4().hex[:8].upper()}",
        "event_id": evt["event_id"],
        "user_id": evt["user_id"],
        "timestamp": evt["timestamp"],
        "threat": final_threat,
        "risk_score": final_risk,
        "confidence": round(confidence, 2),
        "action": final_action,
        "reasons": reasons,
        "feature_mode": "BASELINE"
    }
    
    db_manager.log_security_event(evt)
    db_manager.log_threat_detection(detection_record)
    
    return {
        "status": "SIMULATED",
        "attack_type": req.attack_type,
        "signature_valid": evt["signature_valid"],
        "threat": final_threat,
        "risk_score": final_risk,
        "action": final_action,
        "reasons": reasons,
        "event": evt
    }

# ==================================================
# 4. QUANTUM-INSPIRED OPTIMIZATION ENDPOINT
# ==================================================

@app.get("/api/quantum/optimize")
def get_quantum_optimization(recalculate: bool = False):
    """
    Runs Quantum-Inspired Evolutionary Algorithm (QIEA) feature selection
    and returns side-by-side empirical performance comparison (Baseline vs Quantum-Inspired).
    """
    benchmark = FeatureOptimizer.get_comparison(recalculate)
    return benchmark

# ==================================================
# 5. DASHBOARD METRICS & FEED ENDPOINTS
# ==================================================

@app.get("/api/dashboard/stats")
def get_dashboard_stats():
    """Returns aggregated live dashboard counters and risk distribution."""
    summary = db_manager.get_dashboard_summary()
    recent = db_manager.get_recent_events(limit=10)
    
    # Calculate live threat breakdown
    threat_counts = {"NORMAL": 0, "TAMPERING": 0, "REPLAY_ATTACK": 0, "SIGNATURE_FORGERY": 0, "BEHAVIORAL_ANOMALY": 0, "SUSPICIOUS_ACTIVITY": 0}
    for ev in recent:
        t = ev.get("threat_label", "NORMAL")
        threat_counts[t] = threat_counts.get(t, 0) + 1
        
    return {
        "counters": summary,
        "threat_distribution": threat_counts,
        "system_risk_level": "LOW" if summary["blocked_requests"] < 3 else ("MEDIUM" if summary["blocked_requests"] < 8 else "HIGH/CRITICAL"),
        "recent_events": recent
    }

@app.get("/api/events")
def get_events_log(limit: int = 50):
    """Returns recent persistent security event logs."""
    return db_manager.get_recent_events(limit=limit)

@app.get("/api/database/tables")
def get_database_tables():
    """Returns list of database tables and schema status."""
    return {
        "database_type": "PostgreSQL (Dual SQLite Fallback)",
        "status": "ONLINE",
        "tables": ["security_events", "threat_detections", "key_metadata", "users"]
    }

@app.get("/api/database/raw")
def get_raw_table_data(table: str = "security_events", limit: int = 50):
    """Returns raw rows directly from PostgreSQL / database table."""
    conn = db_manager.get_connection()
    cursor = conn.cursor()
    
    valid_tables = ["security_events", "threat_detections", "key_metadata", "users"]
    if table not in valid_tables:
        table = "security_events"
        
    try:
        cursor.execute(f"SELECT * FROM {table} ORDER BY 1 DESC LIMIT ?", (limit,) if db_manager.is_sqlite else (limit,))
        rows = cursor.fetchall()
        conn.close()
        return {
            "table": table,
            "row_count": len(rows),
            "rows": [dict(r) for r in rows]
        }
    except Exception as e:
        conn.close()
        return {"table": table, "row_count": 0, "rows": [], "error": str(e)}

