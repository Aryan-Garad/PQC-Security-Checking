"""
Deterministic Rule Engine for Cybersecurity Threat Detection.
Evaluates explicit security policy violations and returns threat flag, risk score, and policy reasons.
"""

from typing import Dict, Any, List, Tuple

class RuleEngine:
    """
    Rule-based cybersecurity policy evaluator.
    Rule Evaluation Logic:
    1. Signature Validation Failure -> TAMPERING (Risk: 95)
    2. Nonce Reuse -> REPLAY_ATTACK (Risk: 92)
    3. Signature Reuse + High Frequency -> REPLAY_ATTACK (Risk: 90)
    4. Repeated Failed Verifications -> SIGNATURE_FORGERY (Risk: 88)
    5. Request Frequency Baseline Violation -> BEHAVIORAL_ANOMALY (Risk: 75)
    6. Unrecognized IP Shift -> SUSPICIOUS_ACTIVITY (Risk: 70)
    """

    @staticmethod
    def evaluate(event: Dict[str, Any]) -> Tuple[str, int, List[str], str]:
        """
        Evaluates security event features against security rules.
        Returns:
            (threat_label, risk_score, reasons_list, recommended_action)
        """
        reasons = []
        threat = "NORMAL"
        risk_score = 5
        action = "ALLOW"

        sig_valid = bool(event.get("signature_valid", True))
        nonce_reused = bool(event.get("nonce_reused", False))
        sig_reused = bool(event.get("signature_reused", False))
        req_freq = int(event.get("request_frequency", 1))
        failed_count = int(event.get("failed_verification_count", 0))
        ip_changed = bool(event.get("ip_changed", False))

        # Rule 1: Signature Tampering Check
        if not sig_valid:
            reasons.append("ML-DSA signature cryptographic verification failed (Data modified or invalid key)")
            threat = "TAMPERING"
            risk_score = max(risk_score, 95)
            action = "BLOCK"

        # Rule 2: Nonce Reuse Check (Replay Attack)
        if nonce_reused:
            reasons.append("Cryptographic nonce reuse detected (Replay attack signature vector)")
            threat = "REPLAY_ATTACK"
            risk_score = max(risk_score, 94)
            action = "BLOCK"

        # Rule 3: Signature Reuse & High Frequency Check
        if sig_reused and req_freq > 10:
            reasons.append(f"Identical signature presented {req_freq} times in high-frequency window")
            threat = "REPLAY_ATTACK"
            risk_score = max(risk_score, 90)
            action = "BLOCK"

        # Rule 4: High Verification Failures Check (Forgery)
        if failed_count >= 5:
            reasons.append(f"Excessive signature verification failures ({failed_count} failures recorded for user)")
            if threat == "NORMAL":
                threat = "SIGNATURE_FORGERY"
            risk_score = max(risk_score, 88)
            action = "BLOCK"

        # Rule 5: Request Frequency Spike Check
        if req_freq >= 40:
            reasons.append(f"Abnormal request frequency spike ({req_freq} req/min vs normal baseline 1-5)")
            if threat == "NORMAL":
                threat = "BEHAVIORAL_ANOMALY"
            risk_score = max(risk_score, 78)
            action = "BLOCK"

        # Rule 6: IP Shift Burst
        if ip_changed and req_freq >= 10:
            reasons.append("Suspicious origin IP shift paired with elevated request frequency")
            if threat == "NORMAL":
                threat = "SUSPICIOUS_ACTIVITY"
            risk_score = max(risk_score, 70)
            if risk_score > 75:
                action = "BLOCK"

        if not reasons:
            reasons.append("All security rules satisfied; ML-DSA signature valid and normal behavioral pattern")

        return threat, risk_score, reasons, action
