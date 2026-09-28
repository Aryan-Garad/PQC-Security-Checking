"""
Unit tests for Rule Engine and Threat Detection.
"""

import pytest
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ml.rules_engine import RuleEngine
from database.attack_generator import generate_security_event

def test_rule_engine_tampering():
    event = generate_security_event("TAMPERING")
    threat, risk, reasons, action = RuleEngine.evaluate(event)
    assert threat == "TAMPERING"
    assert risk >= 85
    assert action == "BLOCK"

def test_rule_engine_replay_attack():
    event = generate_security_event("REPLAY_ATTACK")
    threat, risk, reasons, action = RuleEngine.evaluate(event)
    assert threat == "REPLAY_ATTACK"
    assert risk >= 90
    assert action == "BLOCK"

def test_rule_engine_normal():
    event = generate_security_event("NORMAL")
    threat, risk, reasons, action = RuleEngine.evaluate(event)
    assert threat == "NORMAL"
    assert risk <= 30
    assert action == "ALLOW"
