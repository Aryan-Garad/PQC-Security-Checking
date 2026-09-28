"""
Unit tests for ML-DSA-65 Cryptographic Core & Tamper Demonstration.
"""

import pytest
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from crypto.mldsa_core import MLDSA65
from crypto.tamper_demo import run_tamper_demonstration

def test_mldsa_key_generation():
    pub_key, priv_key = MLDSA65.generate_keypair()
    assert len(pub_key) > 100
    assert len(priv_key) > 100

def test_mldsa_sign_and_verify_valid():
    pub_key, priv_key = MLDSA65.generate_keypair()
    message = "Transfer Rs. 5000 to Account A"
    sig_data = MLDSA65.sign_message(message, priv_key)
    
    is_valid = MLDSA65.verify_signature(message, sig_data, pub_key)
    assert is_valid is True

def test_mldsa_tamper_detection():
    pub_key, priv_key = MLDSA65.generate_keypair()
    original_msg = "Transfer Rs. 5000 to Account A"
    tampered_msg = "Transfer Rs. 50000 to Account A"
    
    sig_data = MLDSA65.sign_message(original_msg, priv_key)
    
    # Original should be valid
    assert MLDSA65.verify_signature(original_msg, sig_data, pub_key) is True
    
    # Tampered message must fail verification
    assert MLDSA65.verify_signature(tampered_msg, sig_data, pub_key) is False

def test_tamper_demo_function():
    res = run_tamper_demonstration()
    assert res["original_verification"] == "VALID"
    assert res["tampered_verification"] == "DATA TAMPERED / INVALID SIGNATURE"
    assert res["tamper_detected"] is True
