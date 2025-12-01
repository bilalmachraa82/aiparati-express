#!/usr/bin/env python3
"""
AutoFund AI - Production Backend Test Script
Quick validation of the production backend implementation
"""

import asyncio
import os
import sys
import json
from pathlib import Path

# Add api directory to path
sys.path.append(str(Path(__file__).parent / "api"))

def test_imports():
    """Test if all production modules can be imported"""
    print("🔍 Testing imports...")

    try:
        # Configuration
        from config import settings, validate_settings
        print("✅ Configuration module imported")

        # Models
        from models import User, Task, FinancialData, AnalysisResult
        print("✅ Database models imported")

        # Database
        from database import get_async_db, create_tables_async
        print("✅ Database module imported")

        # Redis
        from redis_client import redis_manager
        print("✅ Redis client imported")

        # Authentication
        from auth import JWTManager, PasswordManager
        print("✅ Authentication module imported")

        # Services
        from services import TaskService, ProcessingService
        print("✅ Service layer imported")

        # Schemas
        from schemas import TaskResponse, UserResponse
        print("✅ API schemas imported")

        # Routes
        from routes import router
        print("✅ API routes imported")

        print("✅ All imports successful!")
        return True

    except Exception as e:
        print(f"❌ Import failed: {e}")
        return False


def test_configuration():
    """Test configuration validation"""
    print("\n⚙️ Testing configuration...")

    try:
        from config import settings, validate_settings

        print(f"📊 App Name: {settings.app_name}")
        print(f"🔧 Environment: {settings.environment}")
        print(f"🧪 Mock Mode: {settings.mock_mode}")
        print(f"📝 Log Level: {settings.log_level}")
        print(f"💾 Database URL: {settings.database_url}")
        print(f"🔴 Redis URL: {settings.redis_url}")

        # Validate settings
        validate_settings()
        print("✅ Configuration validation passed!")

        return True

    except Exception as e:
        print(f"❌ Configuration test failed: {e}")
        return False


def test_database_models():
    """Test database model relationships"""
    print("\n🗄️ Testing database models...")

    try:
        from models import User, Task, FinancialData, AnalysisResult, GeneratedFile
        from sqlalchemy import create_engine
        from sqlalchemy.orm import sessionmaker

        # Create in-memory database for testing
        engine = create_engine("sqlite:///:memory:")
        from models import Base
        Base.metadata.create_all(engine)

        Session = sessionmaker(bind=engine)
        session = Session()

        # Test model creation
        user = User(
            email="test@example.com",
            is_active=True,
            is_premium=False
        )
        session.add(user)
        session.commit()

        task = Task(
            id="test-task-123",
            user_id=user.id,
            original_filename="test.pdf",
            file_path="/tmp/test.pdf",
            file_size=1024,
            nif="123456789",
            ano_exercicio="2023",
            designacao_social="Test Company"
        )
        session.add(task)
        session.commit()

        print("✅ Database models created successfully!")
        print(f"👤 User ID: {user.id}")
        print(f"📋 Task ID: {task.id}")

        session.close()
        return True

    except Exception as e:
        print(f"❌ Database model test failed: {e}")
        return False


def test_authentication():
    """Test authentication functionality"""
    print("\n🔐 Testing authentication...")

    try:
        from auth import JWTManager, PasswordManager

        # Test password management
        password = "test123Password!"
        hashed = PasswordManager.get_password_hash(password)
        verified = PasswordManager.verify_password(password, hashed)

        assert verified, "Password verification failed"
        print("✅ Password hashing/verification works!")

        # Test JWT tokens
        token_data = {"sub": 1, "email": "test@example.com"}
        access_token = JWTManager.create_access_token(token_data)
        refresh_token = JWTManager.create_refresh_token(token_data)

        access_payload = JWTManager.verify_token(access_token, "access")
        refresh_payload = JWTManager.verify_token(refresh_token, "refresh")

        assert access_payload is not None, "Access token verification failed"
        assert refresh_payload is not None, "Refresh token verification failed"
        assert access_payload.user_id == 1, "Access token payload mismatch"

        print("✅ JWT token generation/verification works!")
        print(f"🔑 Access Token: {access_token[:50]}...")
        print(f"🔄 Refresh Token: {refresh_token[:50]}...")

        return True

    except Exception as e:
        print(f"❌ Authentication test failed: {e}")
        return False


def test_schemas():
    """Test Pydantic schemas"""
    print("\n📝 Testing Pydantic schemas...")

    try:
        from schemas import TaskCreate, TaskResponse, UserResponse

        # Test task creation schema
        task_data = {
            "nif": "123456789",
            "ano_exercicio": "2023",
            "designacao_social": "Test Company",
            "email": "test@example.com",
            "context": "Test context"
        }

        task = TaskCreate(**task_data)
        print("✅ TaskCreate schema validation works!")

        # Test user response schema
        user_data = {
            "id": 1,
            "email": "test@example.com",
            "is_active": True,
            "is_premium": False,
            "created_at": "2023-01-01T00:00:00"
        }

        user = UserResponse(**user_data)
        print("✅ UserResponse schema validation works!")

        return True

    except Exception as e:
        print(f"❌ Schema validation test failed: {e}")
        return False


def test_file_service():
    """Test file service functionality"""
    print("\n📁 Testing file service...")

    try:
        from services import FileService
        import tempfile
        import os

        # Create temporary test file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.pdf', delete=False) as f:
            f.write("test content")
            temp_file = f.name

        # Test file validation
        FileService.validate_file("test.pdf", 1024)
        print("✅ File validation works!")

        # Test file hashing
        file_hash = FileService.get_file_hash(temp_file)
        assert len(file_hash) == 64, "SHA-256 hash should be 64 characters"
        print("✅ File hashing works!")

        # Clean up
        os.unlink(temp_file)
        return True

    except Exception as e:
        print(f"❌ File service test failed: {e}")
        return False


def main():
    """Run all tests"""
    print("🚀 AutoFund AI Production Backend Test Suite")
    print("=" * 50)

    tests = [
        test_imports,
        test_configuration,
        test_database_models,
        test_authentication,
        test_schemas,
        test_file_service
    ]

    passed = 0
    total = len(tests)

    for test in tests:
        if test():
            passed += 1

    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} passed")

    if passed == total:
        print("🎉 All tests passed! Production backend is ready!")
        return 0
    else:
        print("❌ Some tests failed. Please fix issues before deploying.")
        return 1


if __name__ == "__main__":
    exit(main())