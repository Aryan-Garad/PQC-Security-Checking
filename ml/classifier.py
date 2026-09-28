"""
Machine Learning Threat Classifier & Anomaly Detector.
Trains Random Forest & Isolation Forest on extracted security features.
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from database.attack_generator import generate_synthetic_dataset

FEATURE_NAMES = [
    "signature_valid",
    "verification_time_ms",
    "message_size_bytes",
    "request_frequency",
    "failed_verification_count",
    "nonce_reused",
    "signature_reused",
    "ip_changed",
    "key_age_days"
]

LABEL_MAPPING = {
    "NORMAL": 0,
    "TAMPERING": 1,
    "SIGNATURE_FORGERY": 2,
    "REPLAY_ATTACK": 3,
    "BEHAVIORAL_ANOMALY": 4,
    "SUSPICIOUS_ACTIVITY": 5
}

INV_LABEL_MAPPING = {v: k for k, v in LABEL_MAPPING.items()}

class ThreatMLClassifier:
    def __init__(self):
        self.rf_model = RandomForestClassifier(n_estimators=50, random_state=42)
        self.iso_forest = IsolationForest(contamination=0.15, random_state=42)
        self.is_trained = False
        self.train_default_model()

    def extract_feature_vector(self, event: Dict[str, Any], feature_subset: List[str] = None) -> np.ndarray:
        """Extracts numerical vector for ML inference (returns 2D array of shape 1xN)."""
        subset = feature_subset or FEATURE_NAMES
        vec = []
        for feat in subset:
            val = event.get(feat, 0)
            if isinstance(val, bool):
                val = 1.0 if val else 0.0
            vec.append(float(val))
        return np.array(vec, dtype=np.float32).reshape(1, -1)

    def train_default_model(self):
        """Generates synthetic dataset and trains the ML classifier."""
        dataset = generate_synthetic_dataset(1200)
        X = []
        y = []
        for evt in dataset:
            X.append(self.extract_feature_vector(evt)[0])
            y.append(LABEL_MAPPING.get(evt.get("threat_label", "NORMAL"), 0))
        
        X = np.array(X, dtype=np.float32)
        y = np.array(y, dtype=int)
        
        self.rf_model.fit(X, y)
        self.iso_forest.fit(X)
        self.is_trained = True

    def predict(self, event: Dict[str, Any], feature_subset: List[str] = None) -> Tuple[str, float, float]:
        """
        Predicts threat class, classification confidence, and anomaly score.
        Returns:
            (predicted_threat_label, confidence, anomaly_score)
        """
        if not self.is_trained:
            self.train_default_model()
            
        feat_vec = self.extract_feature_vector(event, feature_subset)
        
        # If full feature set, run ML model
        if feature_subset is None or set(feature_subset) == set(FEATURE_NAMES):
            probs = self.rf_model.predict_proba(feat_vec)[0]
            pred_idx = np.argmax(probs)
            confidence = float(probs[pred_idx])
            pred_label = INV_LABEL_MAPPING.get(pred_idx, "NORMAL")
            
            # Isolation forest anomaly score (-1 for anomaly, 1 for normal)
            iso_score = float(self.iso_forest.score_samples(feat_vec)[0])
            anomaly_score = round(max(0.0, min(1.0, 1.0 - (iso_score + 0.5))), 2)
            
            return pred_label, confidence, anomaly_score
        else:
            # Subset inference
            full_vec = self.extract_feature_vector(event)
            probs = self.rf_model.predict_proba(full_vec)[0]
            pred_idx = np.argmax(probs)
            confidence = float(probs[pred_idx])
            pred_label = INV_LABEL_MAPPING.get(pred_idx, "NORMAL")
            return pred_label, confidence, 0.5
