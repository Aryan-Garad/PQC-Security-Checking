"""
Unit tests for Quantum-Inspired Evolutionary Algorithm (QIEA).
"""

import pytest
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from quantum_inspired.qiea import QIEAFeatureSelector

def test_qiea_optimization_convergence():
    selector = QIEAFeatureSelector(pop_size=6, max_generations=5)
    results = selector.run_optimization()
    
    assert "baseline_metrics" in results
    assert "quantum_inspired_metrics" in results
    assert len(results["optimized_features"]) > 0
    assert len(results["optimized_features"]) <= len(results["all_features"])
    assert results["feature_reduction_percent"] >= 0.0
