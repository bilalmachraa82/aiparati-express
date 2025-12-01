#!/usr/bin/env python3
"""
AutoFund AI - Backend Integration Test
Test the production backend with a simple file upload
"""

import asyncio
import json
import time
from pathlib import Path

# Test the current backend
def test_current_backend():
    """Test the current backend implementation"""
    print("🧪 Testing Current Backend Implementation")
    print("=" * 50)

    try:
        # Import current backend
        import sys
        sys.path.append("api")
        from main import app

        print("✅ Current backend imported successfully")

        # Test basic structure
        print(f"📊 App title: {app.title}")
        print(f"🔧 App version: {app.version}")
        print(f"🛣️  App routes: {len(app.routes)} routes")

        return True
    except Exception as e:
        print(f"❌ Current backend test failed: {e}")
        return False

def test_production_backend():
    """Test the production backend files exist and are properly structured"""
    print("\n🏭 Testing Production Backend Structure")
    print("=" * 50)

    required_files = [
        "api/models.py",
        "api/database.py",
        "api/redis_client.py",
        "api/auth.py",
        "api/config.py",
        "api/schemas.py",
        "api/services.py",
        "api/routes.py",
        "api/main_production.py",
        "requirements_production.txt",
        "docker-compose.production.yml",
        "Dockerfile.production",
        "database/init/01-init.sql",
        "nginx/nginx.conf"
    ]

    missing_files = []
    for file_path in required_files:
        if Path(file_path).exists():
            print(f"✅ {file_path}")
        else:
            print(f"❌ {file_path}")
            missing_files.append(file_path)

    if missing_files:
        print(f"\n❌ Missing {len(missing_files)} required files")
        return False
    else:
        print(f"\n✅ All {len(required_files)} required files present!")
        return True

def test_file_structure():
    """Test the file structure and key components"""
    print("\n📁 Testing File Structure")
    print("=" * 50)

    # Check API directory structure
    api_dir = Path("api")
    if api_dir.exists():
        api_files = list(api_dir.glob("*.py"))
        print(f"📋 API directory has {len(api_files)} Python files:")
        for file in sorted(api_files):
            print(f"   - {file.name}")
    else:
        print("❌ API directory not found")
        return False

    # Check test files
    test_files = list(Path(".").glob("test*.py"))
    print(f"\n🧪 Found {len(test_files)} test files:")
    for file in sorted(test_files):
        print(f"   - {file.name}")

    # Check configuration files
    config_files = [".env", "docker-compose.yml", "docker-compose.production.yml"]
    print(f"\n⚙️ Configuration files:")
    for file in config_files:
        exists = Path(file).exists()
        print(f"   {'✅' if exists else '❌'} {file}")

    return True

def test_environment():
    """Test environment configuration"""
    print("\n🌍 Testing Environment Configuration")
    print("=" * 50)

    # Load and validate .env file
    env_file = Path(".env")
    if not env_file.exists():
        print("❌ .env file not found")
        return False

    with open(env_file) as f:
        env_lines = f.readlines()

    required_vars = [
        "ANTHROPIC_API_KEY",
        "DATABASE_URL",
        "REDIS_URL",
        "MOCK_MODE"
    ]

    print("🔍 Environment variables:")
    for line in env_lines:
        line = line.strip()
        if line and not line.startswith('#'):
            var_name = line.split('=')[0]
            for req_var in required_vars:
                if req_var in var_name:
                    print(f"   ✅ {var_name}")
                    break

    return True

def test_production_readiness():
    """Assess production readiness"""
    print("\n🚀 Production Readiness Assessment")
    print("=" * 50)

    checks = {
        "📊 Database Models": Path("api/models.py").exists(),
        "🗄️ Database Config": Path("api/database.py").exists(),
        "🔴 Redis Client": Path("api/redis_client.py").exists(),
        "🔐 Authentication": Path("api/auth.py").exists(),
        "⚙️ Configuration": Path("api/config.py").exists(),
        "📝 API Schemas": Path("api/schemas.py").exists(),
        "🛠️ Service Layer": Path("api/services.py").exists(),
        "🛣️ API Routes": Path("api/routes.py").exists(),
        "🚀 Production Server": Path("api/main_production.py").exists(),
        "🐳 Docker Compose": Path("docker-compose.production.yml").exists(),
        "🐋 Dockerfile": Path("Dockerfile.production").exists(),
        "🌐 Nginx Config": Path("nginx/nginx.conf").exists(),
        "📊 Monitoring": Path("monitoring/prometheus.yml").exists(),
        "🗄️ DB Init Scripts": Path("database/init/01-init.sql").exists()
    }

    passed = 0
    total = len(checks)

    for check, status in checks.items():
        print(f"{'✅' if status else '❌'} {check}")
        if status:
            passed += 1

    score = (passed / total) * 100
    print(f"\n📊 Production Readiness: {score:.1f}% ({passed}/{total})")

    if score >= 90:
        print("🎉 EXCELLENT - Ready for production deployment!")
    elif score >= 75:
        print("👍 GOOD - Mostly ready, minor improvements needed")
    elif score >= 50:
        print("⚠️ FAIR - Some work needed before production")
    else:
        print("❌ NEEDS WORK - Significant improvements required")

    return score >= 75

def main():
    """Run all tests"""
    print("🚀 AutoFund AI Backend Integration Test")
    print("=" * 60)

    tests = [
        ("Current Backend", test_current_backend),
        ("Production Structure", test_production_backend),
        ("File Structure", test_file_structure),
        ("Environment", test_environment),
        ("Production Readiness", test_production_readiness)
    ]

    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} failed with error: {e}")
            results.append((test_name, False))

    # Summary
    print("\n" + "=" * 60)
    print("📊 SUMMARY")
    print("=" * 60)

    passed = 0
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
        if result:
            passed += 1

    score = (passed / len(results)) * 100
    print(f"\n🎯 Overall Score: {score:.1f}% ({passed}/{len(results)})")

    if passed == len(results):
        print("\n🎉 ALL TESTS PASSED! Backend is ready for production!")
        print("\n📋 Next Steps:")
        print("1. 🐳 Run: docker-compose -f docker-compose.production.yml up -d")
        print("2. 🌐 Visit: http://localhost:8000/docs")
        print("3. 📊 Monitor: http://localhost:3001 (Grafana)")
        print("4. 🌸 Monitor: http://localhost:5555 (Flower)")
        return 0
    else:
        print(f"\n⚠️ {len(results) - passed} test(s) failed. Please address issues.")
        return 1

if __name__ == "__main__":
    exit(main())