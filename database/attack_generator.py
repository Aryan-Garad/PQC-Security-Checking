"""
Realistic Security Dataset & Attack Event Generator.
Generates synthetic and live threat events for training ML models and demonstrating attacks.
"""

import time
import os
from datetime import datetime
import random
import uuid
from typing import Dict, Any, List
from crypto.mldsa_core import MLDSA65

# User pool
USERS = [f"U00{i}" for i in range(1, 10)]
IPS = [f"192.168.1.{10+i}" for i in range(10)] + ["10.0.4.55", "185.220.101.5", "45.33.32.156"]

def generate_security_event(attack_type: str = "NORMAL") -> Dict[str, Any]:
    """
    Generates a single security log event based on attack_type.
    """
    event_id = f"EVT-{uuid.uuid4().hex[:12].upper()}"
    user_id = random.choice(USERS)
    request_id = f"REQ-{uuid.uuid4().hex[:8].upper()}"
    ip_address = random.choice(IPS[:5]) # Normal internal/trusted subnet
    
    timestamp = datetime.now().isoformat()
    nonce = os.urandom(16).hex()
    message_size = random.randint(128, 2048)
    verification_time = round(random.uniform(1.2, 4.5), 2)
    key_age = random.randint(1, 45)
    
    # Defaults for NORMAL traffic
    signature_valid = True
    request_frequency = random.randint(1, 5) # Requests per minute
    failed_verification_count = 0
    nonce_reused = False
    signature_reused = False
    ip_changed = False
    event_type = "NORMAL"
    threat_label = "NORMAL"
    risk_score = random.randint(0, 15)

    if attack_type == "TAMPERING":
        signature_valid = False
        event_type = "DATA_TAMPERING_ATTEMPT"
        threat_label = "TAMPERING"
        risk_score = random.randint(85, 99)
        failed_verification_count = random.randint(1, 3)

    elif attack_type == "REPLAY_ATTACK":
        # Signature is cryptographically valid, but nonce & signature are reused!
        signature_valid = True
        nonce_reused = True
        signature_reused = True
        request_frequency = random.randint(25, 100) # High frequency spike
        event_type = "REPLAY_TRANSACTION_ATTEMPT"
        threat_label = "REPLAY_ATTACK"
        risk_score = random.randint(90, 100)

    elif attack_type == "SIGNATURE_FORGERY":
        signature_valid = False
        failed_verification_count = random.randint(8, 25) # Multiple failed attempts
        event_type = "FORGERY_MUTATION_ATTEMPT"
        threat_label = "SIGNATURE_FORGERY"
        risk_score = random.randint(88, 98)

    elif attack_type == "HIGH_FREQUENCY_ANOMALY":
        signature_valid = True
        request_frequency = random.randint(45, 120)
        event_type = "TRAFFIC_SPIKE_ANOMALY"
        threat_label = "BEHAVIORAL_ANOMALY"
        risk_score = random.randint(65, 82)

    elif attack_type == "SUSPICIOUS_IP":
        signature_valid = True
        ip_address = random.choice(IPS[5:]) # Untrusted/external IP
        ip_changed = True
        request_frequency = random.randint(12, 30)
        event_type = "UNRECOGNIZED_IP_BURST"
        threat_label = "SUSPICIOUS_ACTIVITY"
        risk_score = random.randint(60, 78)

    return {
        "event_id": event_id,
        "user_id": user_id,
        "timestamp": timestamp,
        "request_id": request_id,
        "ip_address": ip_address,
        "algorithm_variant": "ML-DSA-65",
        "signature_valid": signature_valid,
        "verification_time_ms": verification_time,
        "message_size_bytes": message_size,
        "request_frequency": request_frequency,
        "failed_verification_count": failed_verification_count,
        "nonce": nonce,
        "nonce_reused": nonce_reused,
        "signature_reused": signature_reused,
        "ip_changed": ip_changed,
        "key_age_days": key_age,
        "event_type": event_type,
        "threat_label": threat_label,
        "risk_score": risk_score
    }

def generate_synthetic_dataset(num_samples: int = 1000) -> List[Dict[str, Any]]:
    """Generates a balanced dataset of security events for training ML models."""
    dataset = []
    types = ["NORMAL"] * 6 + ["TAMPERING", "REPLAY_ATTACK", "SIGNATURE_FORGERY", "HIGH_FREQUENCY_ANOMALY", "SUSPICIOUS_IP"]
    for _ in range(num_samples):
        attack = random.choice(types)
        dataset.append(generate_security_event(attack))
    return dataset
