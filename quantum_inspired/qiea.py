"""
Quantum-Inspired Evolutionary Algorithm (QIEA) for Security Feature Selection.
Executes quantum probability amplitude rotation on classical hardware to find optimal feature subsets.
"""

import numpy as np
import math
import random
from typing import List, Tuple, Dict, Any
from ml.classifier import FEATURE_NAMES, ThreatMLClassifier
from database.attack_generator import generate_synthetic_dataset
from ml.evaluator import Evaluator

class QIEAFeatureSelector:
    """
    Quantum-Inspired Evolutionary Algorithm (QIEA) Implementation.
    Uses Q-bit representation [cos(theta), sin(theta)]^T and Quantum Rotation Gates.
    """

    def __init__(self, pop_size: int = 15, max_generations: int = 20, rotation_angle: float = 0.05 * math.pi):
        self.pop_size = pop_size
        self.max_generations = max_generations
        self.rotation_angle = rotation_angle
        self.num_features = len(FEATURE_NAMES)
        self.classifier = ThreatMLClassifier()
        self.dataset = generate_synthetic_dataset(500)

    def initialize_qbits(self) -> np.ndarray:
        """Initialize Q-bit angles to pi/4 (50% probability amplitude for 0 and 1)."""
        return np.full((self.pop_size, self.num_features), math.pi / 4.0)

    def measure_qbits(self, qbit_angles: np.ndarray) -> np.ndarray:
        """Observes binary feature selection state based on |beta|^2 = sin^2(theta)."""
        pop = np.zeros((self.pop_size, self.num_features), dtype=int)
        for i in range(self.pop_size):
            for j in range(self.num_features):
                prob_one = math.sin(qbit_angles[i, j]) ** 2
                pop[i, j] = 1 if random.random() < prob_one else 0
            # Ensure at least 1 feature is selected
            if np.sum(pop[i]) == 0:
                pop[i, random.randint(0, self.num_features - 1)] = 1
        return pop

    def calculate_fitness(self, binary_chromosome: np.ndarray) -> float:
        """
        Fitness Function:
        Fitness = 0.40 * F1 + 0.30 * Recall + 0.20 * Precision - 0.10 * FPR - 0.10 * (Selected_Features / Total_Features)
        """
        selected_indices = np.where(binary_chromosome == 1)[0]
        selected_features = [FEATURE_NAMES[idx] for idx in selected_indices]
        
        metrics = Evaluator.evaluate_detector(self.dataset, self.classifier, selected_features)
        
        f1 = metrics["f1_score"]
        rec = metrics["recall"]
        prec = metrics["precision"]
        fpr = metrics["false_positive_rate"]
        feat_ratio = len(selected_features) / self.num_features
        
        fitness = (0.40 * f1) + (0.30 * rec) + (0.20 * prec) - (0.10 * fpr) - (0.10 * feat_ratio)
        return float(fitness)

    def update_quantum_gates(self, qbit_angles: np.ndarray, current_pop: np.ndarray,
                             fitnesses: np.ndarray, best_chromosome: np.ndarray) -> np.ndarray:
        """
        Updates Q-bit angles using Quantum Rotation Gate based on comparative fitness with best individual.
        """
        updated_angles = qbit_angles.copy()
        for i in range(self.pop_size):
            for j in range(self.num_features):
                x_ij = current_pop[i, j]
                b_j = best_chromosome[j]
                
                # Determine rotation direction delta_theta
                if x_ij == 0 and b_j == 1:
                    delta_theta = self.rotation_angle
                elif x_ij == 1 and b_j == 0:
                    delta_theta = -self.rotation_angle
                else:
                    delta_theta = 0.0
                    
                # Apply rotation gate: theta' = theta + delta_theta
                new_angle = updated_angles[i, j] + delta_theta
                # Clamp angles to range [0.01 * pi/2, 0.99 * pi/2] to prevent premature convergence
                new_angle = max(0.01 * (math.pi / 2), min(0.99 * (math.pi / 2), new_angle))
                updated_angles[i, j] = new_angle
                
        return updated_angles

    def run_optimization(self) -> Dict[str, Any]:
        """
        Executes full QIEA optimization loop.
        Returns:
            Dictionary containing best features, baseline metrics, and QIEA metrics.
        """
        qbit_angles = self.initialize_qbits()
        best_fitness = -1.0
        best_chromosome = np.ones(self.num_features, dtype=int)
        
        history = []

        for gen in range(self.max_generations):
            binary_pop = self.measure_qbits(qbit_angles)
            fitnesses = np.array([self.calculate_fitness(ind) for ind in binary_pop])
            
            gen_best_idx = np.argmax(fitnesses)
            if fitnesses[gen_best_idx] > best_fitness:
                best_fitness = fitnesses[gen_best_idx]
                best_chromosome = binary_pop[gen_best_idx].copy()
                
            history.append({
                "generation": gen + 1,
                "best_fitness": round(best_fitness, 4),
                "selected_feature_count": int(np.sum(best_chromosome))
            })
            
            qbit_angles = self.update_quantum_gates(qbit_angles, binary_pop, fitnesses, best_chromosome)

        # Selected features subset
        selected_indices = np.where(best_chromosome == 1)[0]
        optimized_features = [FEATURE_NAMES[i] for i in selected_indices]

        # Evaluate Baseline (All features) vs Quantum-Inspired (Optimized subset)
        baseline_metrics = Evaluator.evaluate_detector(self.dataset, self.classifier, FEATURE_NAMES)
        qiea_metrics = Evaluator.evaluate_detector(self.dataset, self.classifier, optimized_features)

        return {
            "all_features": FEATURE_NAMES,
            "optimized_features": optimized_features,
            "baseline_metrics": baseline_metrics,
            "quantum_inspired_metrics": qiea_metrics,
            "convergence_history": history,
            "feature_reduction_percent": round((1.0 - (len(optimized_features) / len(FEATURE_NAMES))) * 100.0, 1)
        }
