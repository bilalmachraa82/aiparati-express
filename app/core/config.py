"""
AutoFund AI - Configuration Settings
"""

from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    """Application settings"""

    # API Keys
    anthropic_api_key: str = os.getenv("ANTHROPIC_API_KEY", "")

    # Database
    database_url: str = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/autofund")

    # Redis
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379")

    # File Storage
    upload_dir: str = "uploads"
    output_dir: str = "outputs"
    max_file_size: int = 50 * 1024 * 1024  # 50MB

    # AI Models
    model_extraction: str = "claude-3-5-sonnet-20241022"
    model_analysis: str = "claude-opus-4-20250514"

    # Processing
    timeout_seconds: int = 600  # 10 minutes
    max_concurrent_jobs: int = 10

    # Security
    secret_key: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    access_token_expire_minutes: int = 1440  # 24 hours

    # CORS
    cors_origins: list = ["http://localhost:3000", "http://localhost:8000"]

    # Environment
    environment: str = os.getenv("ENVIRONMENT", "development")
    debug: bool = environment == "development"

    # Monitoring
    sentry_dsn: Optional[str] = os.getenv("SENTRY_DSN")

    class Config:
        env_file = ".env"


# Create global settings instance
settings = Settings()