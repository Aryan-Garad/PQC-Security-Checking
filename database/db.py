"""
Database Connection Manager & Event Persistence.
Supports PostgreSQL (default) with SQLite fallback for offline/local execution.
"""

import os
import json
import sqlite3
from typing import Dict, Any, List
from datetime import datetime

class DatabaseManager:
    def __init__(self, db_url: str = None):
        self.db_url = db_url or os.environ.get("DATABASE_URL", "sqlite:///./security_events.db")
        self.is_sqlite = "sqlite" in self.db_url
        self.init_db()

    def get_connection(self):
        if self.is_sqlite:
            conn = sqlite3.connect("security_events.db", check_same_thread=False)
            conn.row_factory = sqlite3.Row
            return conn
        else:
            import psycopg2
            return psycopg2.connect(self.db_url)

    def init_db(self):
        """Initializes database schema."""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        if self.is_sqlite:
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS security_events (
                event_id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                request_id TEXT NOT NULL,
                ip_address TEXT NOT NULL,
                algorithm_variant TEXT DEFAULT 'ML-DSA-65',
                signature_valid INTEGER NOT NULL,
                verification_time_ms REAL NOT NULL,
                message_size_bytes INTEGER NOT NULL,
                request_frequency INTEGER NOT NULL,
                failed_verification_count INTEGER NOT NULL,
                nonce TEXT NOT NULL,
                nonce_reused INTEGER NOT NULL,
                signature_reused INTEGER NOT NULL,
                ip_changed INTEGER NOT NULL,
                key_age_days INTEGER NOT NULL,
                event_type TEXT NOT NULL,
                threat_label TEXT NOT NULL,
                risk_score INTEGER NOT NULL
            );
            """)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS threat_detections (
                detection_id TEXT PRIMARY KEY,
                event_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                detected_threat TEXT NOT NULL,
                risk_score INTEGER NOT NULL,
                confidence REAL NOT NULL,
                action TEXT NOT NULL,
                reasons TEXT NOT NULL,
                feature_mode TEXT DEFAULT 'BASELINE'
            );
            """)
            conn.commit()
        else:
            schema_path = os.path.join(os.path.dirname(__file__), "schema.sql")
            with open(schema_path, "r") as f:
                cursor.execute(f.read())
            conn.commit()
        conn.close()

    def log_security_event(self, event: Dict[str, Any]):
        """Persists a security log into the database."""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        if self.is_sqlite:
            cursor.execute("""
            INSERT OR REPLACE INTO security_events (
                event_id, user_id, timestamp, request_id, ip_address, algorithm_variant,
                signature_valid, verification_time_ms, message_size_bytes, request_frequency,
                failed_verification_count, nonce, nonce_reused, signature_reused, ip_changed,
                key_age_days, event_type, threat_label, risk_score
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                event["event_id"], event["user_id"], str(event["timestamp"]), event["request_id"],
                event["ip_address"], event.get("algorithm_variant", "ML-DSA-65"),
                1 if event["signature_valid"] else 0, event["verification_time_ms"], event["message_size_bytes"],
                event["request_frequency"], event["failed_verification_count"], event["nonce"],
                1 if event["nonce_reused"] else 0, 1 if event["signature_reused"] else 0,
                1 if event["ip_changed"] else 0, event["key_age_days"], event["event_type"],
                event.get("threat_label", "NORMAL"), event.get("risk_score", 0)
            ))
        else:
            cursor.execute("""
            INSERT INTO security_events (
                event_id, user_id, timestamp, request_id, ip_address, algorithm_variant,
                signature_valid, verification_time_ms, message_size_bytes, request_frequency,
                failed_verification_count, nonce, nonce_reused, signature_reused, ip_changed,
                key_age_days, event_type, threat_label, risk_score
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (event_id) DO NOTHING
            """, (
                event["event_id"], event["user_id"], str(event["timestamp"]), event["request_id"],
                event["ip_address"], event.get("algorithm_variant", "ML-DSA-65"),
                event["signature_valid"], event["verification_time_ms"], event["message_size_bytes"],
                event["request_frequency"], event["failed_verification_count"], event["nonce"],
                event["nonce_reused"], event["signature_reused"], event["ip_changed"],
                event["key_age_days"], event["event_type"], event.get("threat_label", "NORMAL"),
                event.get("risk_score", 0)
            ))
        conn.commit()
        conn.close()

    def log_threat_detection(self, detection: Dict[str, Any]):
        """Persists a threat detection result."""
        conn = self.get_connection()
        cursor = conn.cursor()
        reasons_json = json.dumps(detection["reasons"])
        
        if self.is_sqlite:
            cursor.execute("""
            INSERT OR REPLACE INTO threat_detections (
                detection_id, event_id, user_id, timestamp, detected_threat,
                risk_score, confidence, action, reasons, feature_mode
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                detection["detection_id"], detection["event_id"], detection["user_id"],
                str(detection["timestamp"]), detection["threat"], detection["risk_score"],
                detection["confidence"], detection["action"], reasons_json,
                detection.get("feature_mode", "BASELINE")
            ))
        else:
            cursor.execute("""
            INSERT INTO threat_detections (
                detection_id, event_id, user_id, timestamp, detected_threat,
                risk_score, confidence, action, reasons, feature_mode
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                detection["detection_id"], detection["event_id"], detection["user_id"],
                str(detection["timestamp"]), detection["threat"], detection["risk_score"],
                detection["confidence"], detection["action"], reasons_json,
                detection.get("feature_mode", "BASELINE")
            ))
        conn.commit()
        conn.close()

    def get_recent_events(self, limit: int = 50) -> List[Dict[str, Any]]:
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM security_events ORDER BY timestamp DESC LIMIT ?", (limit,) if self.is_sqlite else (limit,))
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]

    def get_dashboard_summary(self) -> Dict[str, Any]:
        """Calculates aggregated metrics for dashboard."""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM security_events")
        total_requests = cursor.fetchone()[0] or 0
        
        cursor.execute("SELECT COUNT(*) FROM security_events WHERE signature_valid = 1 OR signature_valid = TRUE")
        valid_signatures = cursor.fetchone()[0] or 0
        
        invalid_signatures = total_requests - valid_signatures
        
        cursor.execute("SELECT COUNT(*) FROM threat_detections WHERE detected_threat != 'NORMAL'")
        threats_detected = cursor.fetchone()[0] or 0
        
        cursor.execute("SELECT COUNT(*) FROM threat_detections WHERE action = 'BLOCK'")
        blocked_requests = cursor.fetchone()[0] or 0
        
        conn.close()
        return {
            "total_requests": total_requests,
            "valid_signatures": valid_signatures,
            "invalid_signatures": invalid_signatures,
            "threats_detected": threats_detected,
            "blocked_requests": blocked_requests
        }

db_manager = DatabaseManager()