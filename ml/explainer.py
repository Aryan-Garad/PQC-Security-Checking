"""
Explainable AI (XAI) Module.
Provides human-readable reasons explaining WHY a request was flagged or blocked.
"""

from typing import Dict, Any, List

class ThreatExplainer:
    @staticmethod
    def explain_decision(event: Dict[str, Any], rule_reasons: List[str], threat: str, risk_score: int) -> List[str]:
        """
        Combines rule findings and feature vector metrics into clear explainable points.
        """
        explanations = list(rule_reasons)
        
        # Add detailed feature metrics context
        if event.get("nonce_reused"):
            explanations.append(f"Feature Alert: Nonce '{event.get('nonce')}' was previously recorded in security log database.")
            
        if event.get("signature_reused"):
            explanations.append("Feature Alert: Identical post-quantum ML-DSA signature vector observed across multiple requests.")
            
        if event.get("request_frequency", 0) > 20:
            explanations.append(f"Behavioral Feature: Request velocity ({event.get('request_frequency')} req/min) exceeds 95th percentile threshold.")
            
        if event.get("failed_verification_count", 0) > 3:
            explanations.append(f"Security Metric: Accumulated failed verifications count = {event.get('failed_verification_count')}.")
            
        if event.get("ip_changed"):
            explanations.append(f"Origin Trace: Client IP shifted from baseline to {event.get('ip_address')}.")
            
        if risk_score >= 81:
            explanations.append(f"Overall Risk Level: CRITICAL ({risk_score}/100) - Policy enforcement: BLOCK")
        elif risk_score >= 61:
            explanations.append(f"Overall Risk Level: HIGH ({risk_score}/100) - Policy enforcement: BLOCK")
        elif risk_score >= 31:
            explanations.append(f"Overall Risk Level: MEDIUM ({risk_score}/100) - Flagged for review")
            
        return list(dict.fromkeys(explanations)) # Deduplicate while preserving order
