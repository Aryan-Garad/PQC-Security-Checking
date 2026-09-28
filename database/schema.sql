-- PostgreSQL Schema for Quantum-Inspired Cyber Threat Detection Prototype

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'ACTIVE'
);

-- 2. Key Metadata Table (Private keys are NEVER stored in plaintext)
CREATE TABLE IF NOT EXISTS key_metadata (
    key_id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(user_id),
    algorithm VARCHAR(30) DEFAULT 'ML-DSA-65',
    public_key_hex TEXT NOT NULL,
    key_age_days INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Signature Events Table
CREATE TABLE IF NOT EXISTS signature_events (
    event_id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(user_id),
    request_id VARCHAR(64) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    message_digest VARCHAR(64) NOT NULL,
    signature TEXT NOT NULL,
    nonce VARCHAR(64) NOT NULL,
    message_size_bytes INT NOT NULL
);

-- 4. Verification Events Table
CREATE TABLE IF NOT EXISTS verification_events (
    verification_id VARCHAR(64) PRIMARY KEY,
    event_id VARCHAR(64) REFERENCES signature_events(event_id),
    user_id VARCHAR(50) REFERENCES users(user_id),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    signature_valid BOOLEAN NOT NULL,
    verification_time_ms FLOAT NOT NULL
);

-- 5. Central Security Events Table (Stores full feature vector for threat analysis)
CREATE TABLE IF NOT EXISTS security_events (
    event_id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    request_id VARCHAR(64) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    algorithm_variant VARCHAR(30) DEFAULT 'ML-DSA-65',
    signature_valid BOOLEAN NOT NULL,
    verification_time_ms FLOAT NOT NULL,
    message_size_bytes INT NOT NULL,
    request_frequency INT NOT NULL,
    failed_verification_count INT NOT NULL,
    nonce VARCHAR(64) NOT NULL,
    nonce_reused BOOLEAN NOT NULL DEFAULT FALSE,
    signature_reused BOOLEAN NOT NULL DEFAULT FALSE,
    ip_changed BOOLEAN NOT NULL DEFAULT FALSE,
    key_age_days INT NOT NULL DEFAULT 1,
    event_type VARCHAR(50) NOT NULL,
    threat_label VARCHAR(50) NOT NULL DEFAULT 'NORMAL',
    risk_score INT NOT NULL DEFAULT 0
);

-- 6. Threat Detections Table
CREATE TABLE IF NOT EXISTS threat_detections (
    detection_id VARCHAR(64) PRIMARY KEY,
    event_id VARCHAR(64) REFERENCES security_events(event_id),
    user_id VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    detected_threat VARCHAR(50) NOT NULL,
    risk_score INT NOT NULL,
    confidence FLOAT NOT NULL,
    action VARCHAR(20) NOT NULL,
    reasons JSONB NOT NULL,
    feature_mode VARCHAR(30) DEFAULT 'BASELINE'
);
