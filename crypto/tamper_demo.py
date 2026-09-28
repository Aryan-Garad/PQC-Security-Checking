"""
Tamper Demonstration Module for ML-DSA-65.
Executes signature creation on original message and validates failure on tampered message.
"""

from crypto.mldsa_core import MLDSA65
from typing import Dict, Any

def run_tamper_demonstration(original_message: str = "Transfer Rs. 5000 to Account A",
                             tampered_message: str = "Transfer Rs. 50000 to Account A") -> Dict[str, Any]:
    """
    Demonstrates post-quantum digital signature tamper detection.
    Steps:
    1. Generate ML-DSA-65 Keypair.
    2. Sign original message -> Signature VALID.
    3. Verify modified/tampered message with original signature -> Signature INVALID / DATA TAMPERED.
    """
    # Step 1: Generate key pair
    pub_key, priv_key = MLDSA65.generate_keypair()
    
    # Step 2: Sign original message
    sig_data = MLDSA65.sign_message(original_message, priv_key)
    original_valid = MLDSA65.verify_signature(original_message, sig_data, pub_key)
    
    # Step 3: Attempt verification with tampered message
    tampered_valid = MLDSA65.verify_signature(tampered_message, sig_data, pub_key)
    
    return {
        "algorithm": MLDSA65.PARAM_NAME,
        "public_key_preview": f"{pub_key[:32]}...{pub_key[-16:]}",
        "original_message": original_message,
        "original_verification": "VALID" if original_valid else "INVALID",
        "tampered_message": tampered_message,
        "tampered_verification": "DATA TAMPERED / INVALID SIGNATURE" if not tampered_valid else "VALID",
        "tamper_detected": not tampered_valid,
        "signature_size_bytes": sig_data["signature_size_bytes"]
    }
