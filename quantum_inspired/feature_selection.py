"""
Quantum-Inspired Feature Selection Benchmark Runner.
Executes live comparisons between full feature set and QIEA-selected subset.
"""

from typing import Dict, Any
from quantum_inspired.qiea import QIEAFeatureSelector

class FeatureOptimizer:
    _cached_result: Dict[str, Any] = None

    @classmethod
    def get_comparison(cls, force_recalculate: bool = False) -> Dict[str, Any]:
        """
        Runs QIEA feature selection or returns cached benchmark.
        """
        if cls._cached_result is None or force_recalculate:
            selector = QIEAFeatureSelector(pop_size=12, max_generations=15)
            cls._cached_result = selector.run_optimization()
        return cls._cached_result
