"""
Threat Detector Evaluator & Metrics Calculator.
Measures and reports Accuracy, Precision, Recall, F1-Score, False Positive Rate (FPR), and Latency.
"""

import time
import numpy as np
from typing import Dict, Any, List
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix
from ml.rules_engine import RuleEngine
from ml.classifier import ThreatMLClassifier

class Evaluator:
    @staticmethod
    def evaluate_detector(dataset: List[Dict[str, Any]], classifier: ThreatMLClassifier, feature_subset: List[str] = None) -> Dict[str, Any]:
        """
        Evaluates hybrid rule + ML detector performance on dataset.
        Returns empirical performance metrics.
        """
        start_time = time.time()
        
        y_true = []
        y_pred = []
        
        for event in dataset:
            actual_label = event.get("threat_label", "NORMAL")
            actual_binary = 0 if actual_label == "NORMAL" else 1
            y_true.append(actual_binary)
            
            # Run Hybrid detection
            rule_threat, rule_risk, _, rule_action = RuleEngine.evaluate(event)
            ml_threat, confidence, _ = classifier.predict(event, feature_subset)
            
            final_threat = rule_threat if rule_threat != "NORMAL" else ml_threat
            pred_binary = 0 if final_threat == "NORMAL" else 1
            y_pred.append(pred_binary)
            
        elapsed_latency_ms = round(((time.time() - start_time) / len(dataset)) * 1000, 3)
        
        acc = float(accuracy_score(y_true, y_pred))
        prec, rec, f1, _ = precision_recall_fscore_support(y_true, y_pred, average='binary', zero_division=0)
        
        # Calculate False Positive Rate (FPR = FP / (FP + TN))
        cm = confusion_matrix(y_true, y_pred, labels=[0, 1])
        tn, fp, fn, tp = cm.ravel() if cm.shape == (2, 2) else (len(y_true), 0, 0, 0)
        fpr = float(fp / (fp + tn)) if (fp + tn) > 0 else 0.0
        
        feature_count = len(feature_subset) if feature_subset else 9
        
        return {
            "accuracy": round(acc, 4),
            "precision": round(float(prec), 4),
            "recall": round(float(rec), 4),
            "f1_score": round(float(f1), 4),
            "false_positive_rate": round(fpr, 4),
            "latency_ms": elapsed_latency_ms,
            "feature_count": feature_count,
            "sample_size": len(dataset)
        }
