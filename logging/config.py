"""
AutoFund AI - Structured Logging Configuration
Provides JSON-structured logging with correlation IDs and proper formatting
"""

import json
import logging
import sys
import time
import uuid
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Any, Dict, Optional

from pythonjsonlogger import jsonlogger


class LogLevel(str, Enum):
    """Log levels with numeric values for filtering"""
    CRITICAL = "CRITICAL"
    ERROR = "ERROR"
    WARNING = "WARNING"
    INFO = "INFO"
    DEBUG = "DEBUG"


class StructuredLogger:
    """
    Structured logger that outputs JSON logs with correlation IDs
    """

    def __init__(
        self,
        name: str,
        level: str = "INFO",
        log_file: Optional[str] = None,
        service_name: str = "autofund-api",
        environment: str = "production",
    ):
        self.name = name
        self.service_name = service_name
        self.environment = environment
        self.logger = logging.getLogger(name)
        self.logger.setLevel(getattr(logging, level.upper()))

        # Clear existing handlers
        self.logger.handlers.clear()

        # Create formatter
        formatter = jsonlogger.JsonFormatter(
            fmt="%(asctime)s %(name)s %(levelname)s %(message)s %(filename)s %(lineno)d",
            datefmt="%Y-%m-%dT%H:%M:%S.%fZ",
        )

        # Console handler
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(formatter)
        self.logger.addHandler(console_handler)

        # File handler if specified
        if log_file:
            log_path = Path(log_file)
            log_path.parent.mkdir(parents=True, exist_ok=True)

            file_handler = logging.FileHandler(log_file)
            file_handler.setFormatter(formatter)
            self.logger.addHandler(file_handler)

    def _log(
        self,
        level: str,
        message: str,
        extra: Optional[Dict[str, Any]] = None,
        exc_info: Optional[bool] = None,
    ):
        """Internal logging method with structured data"""
        log_data = {
            "service": self.service_name,
            "environment": self.environment,
            "correlation_id": getattr(self, "_correlation_id", str(uuid.uuid4())),
            "timestamp": datetime.utcnow().isoformat() + "Z",
        }

        if extra:
            log_data.update(extra)

        getattr(self.logger, level.lower())(message, extra={"extra": log_data}, exc_info=exc_info)

    def debug(self, message: str, **kwargs):
        """Log debug message"""
        self._log(LogLevel.DEBUG, message, kwargs)

    def info(self, message: str, **kwargs):
        """Log info message"""
        self._log(LogLevel.INFO, message, kwargs)

    def warning(self, message: str, **kwargs):
        """Log warning message"""
        self._log(LogLevel.WARNING, message, kwargs)

    def error(self, message: str, exc_info: bool = True, **kwargs):
        """Log error message"""
        self._log(LogLevel.ERROR, message, kwargs, exc_info=exc_info)

    def critical(self, message: str, exc_info: bool = True, **kwargs):
        """Log critical message"""
        self._log(LogLevel.CRITICAL, message, kwargs, exc_info=exc_info)

    def set_correlation_id(self, correlation_id: str):
        """Set correlation ID for request tracing"""
        self._correlation_id = correlation_id

    def log_request(
        self,
        method: str,
        path: str,
        status_code: int,
        duration_ms: float,
        user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ):
        """Log HTTP request with details"""
        self.info(
            "HTTP Request",
            event_type="http_request",
            method=method,
            path=path,
            status_code=status_code,
            duration_ms=duration_ms,
            user_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent,
        )

    def log_api_call(
        self,
        api_name: str,
        operation: str,
        duration_ms: float,
        tokens_used: Optional[int] = None,
        cost_usd: Optional[float] = None,
        success: bool = True,
        error_message: Optional[str] = None,
    ):
        """Log external API call (e.g., Claude AI)"""
        self.info(
            "External API Call",
            event_type="api_call",
            api_name=api_name,
            operation=operation,
            duration_ms=duration_ms,
            tokens_used=tokens_used,
            cost_usd=cost_usd,
            success=success,
            error_message=error_message,
        )

    def log_file_operation(
        self,
        operation: str,
        file_type: str,
        file_size: int,
        duration_ms: float,
        success: bool = True,
        error_message: Optional[str] = None,
    ):
        """Log file operation (upload/download/processing)"""
        self.info(
            "File Operation",
            event_type="file_operation",
            operation=operation,
            file_type=file_type,
            file_size_bytes=file_size,
            duration_ms=duration_ms,
            success=success,
            error_message=error_message,
        )

    def log_database_query(
        self,
        query_type: str,
        table: str,
        duration_ms: float,
        rows_affected: Optional[int] = None,
        success: bool = True,
        error_message: Optional[str] = None,
    ):
        """Log database query"""
        self.info(
            "Database Query",
            event_type="database_query",
            query_type=query_type,
            table=table,
            duration_ms=duration_ms,
            rows_affected=rows_affected,
            success=success,
            error_message=error_message,
        )

    def log_security_event(
        self,
        event_type: str,
        user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ):
        """Log security-related events"""
        self.warning(
            "Security Event",
            event_type="security_event",
            security_event_type=event_type,
            user_id=user_id,
            ip_address=ip_address,
            details=details or {},
        )

    def log_business_event(
        self,
        event_type: str,
        user_id: Optional[str] = None,
        company_nif: Optional[str] = None,
        value_eur: Optional[float] = None,
        details: Optional[Dict[str, Any]] = None,
    ):
        """Log business events for analytics"""
        self.info(
            "Business Event",
            event_type="business_event",
            business_event_type=event_type,
            user_id=user_id,
            company_nif=company_nif,
            value_eur=value_eur,
            details=details or {},
        )


class LogMiddleware:
    """
    FastAPI middleware for automatic request logging
    """

    def __init__(self, app, logger: StructuredLogger):
        self.app = app
        self.logger = logger

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        start_time = time.time()
        correlation_id = str(uuid.uuid4())

        # Get request details
        method = scope.get("method", "")
        path = scope.get("path", "")
        headers = dict(scope.get("headers", []))
        user_agent = headers.get(b"user-agent", b"").decode()
        client = scope.get("client", [""])[0]

        # Set correlation ID in logger
        self.logger.set_correlation_id(correlation_id)

        # Log request start
        self.logger.info(
            "Request started",
            event_type="request_start",
            correlation_id=correlation_id,
            method=method,
            path=path,
            user_agent=user_agent,
            ip_address=client,
        )

        # Wrap send to capture response
        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                status_code = message.get("status", 200)
                duration_ms = (time.time() - start_time) * 1000

                # Log request completion
                self.logger.log_request(
                    method=method,
                    path=path,
                    status_code=status_code,
                    duration_ms=duration_ms,
                    ip_address=client,
                    user_agent=user_agent,
                )

            await send(message)

        await self.app(scope, receive, send_wrapper)


# Singleton logger instance
_logger_instance = None


def get_logger(
    name: Optional[str] = None,
    level: str = "INFO",
    log_file: Optional[str] = None,
    service_name: str = "autofund-api",
    environment: str = "production",
) -> StructuredLogger:
    """Get or create a logger instance"""
    global _logger_instance

    if _logger_instance is None:
        _logger_instance = StructuredLogger(
            name=name or "autofund",
            level=level,
            log_file=log_file,
            service_name=service_name,
            environment=environment,
        )

    return _logger_instance


# Configure root logger
def configure_logging(
    level: str = "INFO",
    log_file: Optional[str] = None,
    service_name: str = "autofund-api",
    environment: str = "production",
):
    """Configure logging for the application"""
    global _logger_instance
    _logger_instance = StructuredLogger(
        name="autofund",
        level=level,
        log_file=log_file,
        service_name=service_name,
        environment=environment,
    )
    return _logger_instance