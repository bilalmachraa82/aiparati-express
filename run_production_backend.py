#!/usr/bin/env python3
"""
AutoFund AI - Production Backend Runner
Quick script to start the production backend for testing
"""

import os
import sys
import subprocess
import time
from pathlib import Path

def check_dependencies():
    """Check if required dependencies are installed"""
    print("🔍 Checking dependencies...")

    required_packages = [
        "fastapi",
        "uvicorn",
        "sqlalchemy",
        "pydantic",
        "redis"
    ]

    missing = []
    for package in required_packages:
        try:
            __import__(package)
            print(f"✅ {package}")
        except ImportError:
            print(f"❌ {package}")
            missing.append(package)

    if missing:
        print(f"\n❌ Missing packages: {', '.join(missing)}")
        print("Please install with: pip install -r requirements_production.txt")
        return False

    print("✅ All dependencies satisfied!")
    return True

def check_environment():
    """Check environment configuration"""
    print("\n⚙️ Checking environment...")

    env_file = Path(".env")
    if not env_file.exists():
        print("❌ .env file not found")
        return False

    # Load and check key variables
    with open(env_file) as f:
        env_content = f.read()

    required_vars = ["MOCK_MODE", "DATABASE_URL", "REDIS_URL"]
    for var in required_vars:
        if var in env_content:
            print(f"✅ {var} configured")
        else:
            print(f"❌ {var} missing")
            return False

    print("✅ Environment configured!")
    return True

def create_directories():
    """Create required directories"""
    print("\n📁 Creating directories...")

    directories = ["uploads", "outputs", "logs"]
    for dir_name in directories:
        Path(dir_name).mkdir(exist_ok=True)
        print(f"✅ {dir_name}/")

def start_backend():
    """Start the production backend"""
    print("\n🚀 Starting production backend...")
    print("=" * 50)

    # Set environment for production mode
    env = os.environ.copy()
    env["PYTHONPATH"] = str(Path.cwd())
    env["ENVIRONMENT"] = "development"  # Start in development mode for testing

    # Start the backend
    try:
        print("🌐 Starting FastAPI server...")
        print("📚 API Documentation: http://localhost:8000/docs")
        print("🔧 Health Check: http://localhost:8000/api/system/health")
        print("⏹️ Press Ctrl+C to stop")

        # Use uvicorn to run the production backend
        cmd = [
            sys.executable, "-m", "uvicorn",
            "api.main_production:app",
            "--host", "0.0.0.0",
            "--port", "8000",
            "--reload"  # Enable reload for development
        ]

        subprocess.run(cmd, env=env, check=True)

    except KeyboardInterrupt:
        print("\n👋 Backend stopped gracefully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to start backend: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

    return True

def run_tests():
    """Run quick integration tests"""
    print("\n🧪 Running quick integration tests...")

    try:
        # Test import
        from api.models import User, Task
        print("✅ Models imported")

        # Test database
        from api.database import get_async_db
        print("✅ Database functions available")

        # Test config
        from api.config import settings
        print(f"✅ Configuration loaded: {settings.app_name}")

        # Test auth
        from api.auth import JWTManager
        print("✅ Authentication system ready")

        return True

    except Exception as e:
        print(f"❌ Integration test failed: {e}")
        return False

def main():
    """Main runner function"""
    print("🚀 AutoFund AI Production Backend Runner")
    print("=" * 50)

    # Check dependencies
    if not check_dependencies():
        return 1

    # Check environment
    if not check_environment():
        return 1

    # Create directories
    create_directories()

    # Run tests
    if not run_tests():
        print("⚠️ Tests failed, but continuing...")

    # Start backend
    print("\n🎯 Ready to start production backend!")
    response = input("Start the backend server? (y/N): ")

    if response.lower() in ['y', 'yes']:
        return 0 if start_backend() else 1
    else:
        print("👋 Backend not started. Run this script again when ready.")
        return 0

if __name__ == "__main__":
    exit(main())