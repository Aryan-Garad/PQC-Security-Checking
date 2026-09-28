"""
Single-command launcher script for SIH 2026 Prototype.
Launches FastAPI backend (Port 8000) and Vite React Frontend (Port 3000).
"""

import os
import sys
import subprocess
import time

def main():
    print("=" * 70)
    print("QUANTUM-INSPIRED CYBER THREAT DETECTION (SIH 2026 PROTOTYPE)")
    print("=" * 70)
    
    project_root = os.path.abspath(os.path.dirname(__file__))
    frontend_dir = os.path.join(project_root, "frontend")
    
    # 1. Verify Frontend Dependencies
    node_modules = os.path.join(frontend_dir, "node_modules")
    if not os.path.exists(node_modules):
        print("\n[1/2] Installing Frontend npm dependencies...")
        subprocess.run("npm install", shell=True, cwd=frontend_dir)
    else:
        print("\n[1/2] Frontend dependencies verified.")

    print("\n[2/2] Starting Backend & Frontend servers...")
    print("      - Backend REST API: http://127.0.0.1:8000")
    print("      - Frontend Dashboard: http://localhost:3000")
    print("=" * 70)

    # Launch FastAPI uvicorn server
    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "backend.main:app", "--host", "127.0.0.1", "--port", "8000", "--reload"],
        cwd=project_root
    )

    # Give backend 1.5 seconds to bind port 8000 before starting frontend
    time.sleep(1.5)

    # Launch Vite frontend server
    frontend_proc = subprocess.Popen(
        "npm run dev",
        shell=True,
        cwd=frontend_dir
    )

    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\nStopping servers...")
        backend_proc.terminate()
        frontend_proc.terminate()

if __name__ == "__main__":
    main()
