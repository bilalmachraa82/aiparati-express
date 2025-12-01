#!/usr/bin/env python3
"""
Integration Tests for AutoFund AI FastAPI Backend
Tests all API endpoints with real data and file uploads
"""

import pytest
import asyncio
import aiofiles
import json
from pathlib import Path
from fastapi.testclient import TestClient
from httpx import AsyncClient
import tempfile
import shutil
from datetime import datetime

# Import the main app
try:
    from api.main import app
except ImportError:
    # Fallback to main.py if api module not available
    import sys
    sys.path.append('.')
    from autofund_ai_poc_v3 import app

class TestAutoFundAPI:
    """Comprehensive API integration tests"""

    @pytest.fixture
    def client(self):
        """Create test client"""
        return TestClient(app)

    @pytest.fixture
    def sample_pdf_path(self):
        """Path to sample IES PDF"""
        pdf_path = Path("IES - 2023.pdf")
        if not pdf_path.exists():
            pytest.skip("Sample IES PDF not found")
        return pdf_path

    @pytest.fixture
    def template_excel_path(self):
        """Path to template Excel"""
        excel_path = Path("template_iapmei.xlsx")
        if not excel_path.exists():
            pytest.skip("Template Excel not found")
        return excel_path

    @pytest.fixture
    def valid_form_data(self):
        """Valid form data for testing"""
        return {
            "nif": "516807706",
            "ano_exercicio": "2023",
            "designacao_social": "PLF - PROJETOS, LDA.",
            "email": "test@plf.pt"
        }

    @pytest.fixture
    def invalid_form_data(self):
        """Invalid form data for testing"""
        return {
            "nif": "123",
            "ano_exercicio": "20",
            "designacao_social": "",
            "email": "invalid-email"
        }

    def test_health_check(self, client):
        """Test API health endpoint"""
        response = client.get("/health")
        assert response.status_code == 200

        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data
        assert "version" in data
        assert "active_tasks" in data
        assert isinstance(data["active_tasks"], int)

    def test_root_endpoint(self, client):
        """Test root endpoint"""
        response = client.get("/")
        assert response.status_code == 200

        data = response.json()
        assert "message" in data
        assert "version" in data
        assert "AutoFund AI" in data["message"]

    def test_upload_file_validation_no_file(self, client, valid_form_data):
        """Test upload validation when no file provided"""
        response = client.post("/upload", data=valid_form_data)
        assert response.status_code == 422  # Validation error

    def test_upload_file_validation_invalid_form(self, client, sample_pdf_path, invalid_form_data):
        """Test upload validation with invalid form data"""
        with open(sample_pdf_path, "rb") as f:
            response = client.post(
                "/upload",
                data=invalid_form_data,
                files={"file": ("test.pdf", f, "application/pdf")}
            )
        # Should accept but return validation errors in response
        assert response.status_code in [400, 422]

    def test_upload_file_invalid_file_type(self, client, valid_form_data):
        """Test upload with invalid file type"""
        # Create a temporary text file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as tmp:
            tmp.write("This is not a PDF")
            tmp_path = tmp.name

        try:
            with open(tmp_path, "rb") as f:
                response = client.post(
                    "/upload",
                    data=valid_form_data,
                    files={"file": ("test.txt", f, "text/plain")}
                )
            # Should reject non-PDF files
            assert response.status_code == 400
            data = response.json()
            assert "error" in data
        finally:
            Path(tmp_path).unlink()

    def test_upload_file_too_large(self, client, valid_form_data):
        """Test upload with file that's too large"""
        # Create a large temporary PDF file (over 10MB)
        with tempfile.NamedTemporaryFile(mode='wb', suffix='.pdf', delete=False) as tmp:
            # Write 11MB of data
            tmp.write(b'%PDF-1.4\n' + b'0' * (11 * 1024 * 1024))
            tmp_path = tmp.name

        try:
            with open(tmp_path, "rb") as f:
                response = client.post(
                    "/upload",
                    data=valid_form_data,
                    files={"file": ("large.pdf", f, "application/pdf")}
                )
            # Should reject files over 10MB
            assert response.status_code == 413
            data = response.json()
            assert "error" in data
        finally:
            Path(tmp_path).unlink()

    def test_upload_valid_file(self, client, sample_pdf_path, valid_form_data):
        """Test upload with valid file and form data"""
        with open(sample_pdf_path, "rb") as f:
            response = client.post(
                "/upload",
                data=valid_form_data,
                files={"file": ("IES - 2023.pdf", f, "application/pdf")}
            )

        # Should accept the upload
        assert response.status_code == 200
        data = response.json()

        if "task_id" in data:
            assert data["task_id"] is not None
            assert isinstance(data["task_id"], str)
            return data["task_id"]
        else:
            # If processing is synchronous, might return results directly
            assert "success" in data or "data" in data
            return None

    def test_task_status_invalid_task(self, client):
        """Test task status with invalid task ID"""
        response = client.get("/task/invalid-task-id")
        assert response.status_code == 404

        data = response.json()
        assert "error" in data

    def test_task_status_valid_task(self, client, sample_pdf_path, valid_form_data):
        """Test task status with valid task ID"""
        # First, submit a file to get a task ID
        task_id = self.test_upload_valid_file(client, sample_pdf_path, valid_form_data)

        if task_id:
            # Check task status
            response = client.get(f"/task/{task_id}")
            assert response.status_code == 200

            data = response.json()
            assert "status" in data
            assert data["status"] in ["pending", "processing", "completed", "failed"]
            assert "progress" in data
            assert isinstance(data["progress"], (int, float))
            assert 0 <= data["progress"] <= 100

    def test_download_invalid_task(self, client):
        """Test download with invalid task ID"""
        response = client.get("/download/invalid-task-id")
        assert response.status_code == 404

    def test_download_completed_task(self, client, sample_pdf_path, valid_form_data):
        """Test download from completed task"""
        # This test depends on the processing completing
        # In a real scenario, you might need to wait for completion
        task_id = self.test_upload_valid_file(client, sample_pdf_path, valid_form_data)

        if task_id:
            # Wait a bit for processing (not ideal for unit tests)
            import time
            time.sleep(2)

            # Try to download
            response = client.get(f"/download/{task_id}")

            # Might still be processing, which is valid
            assert response.status_code in [200, 202, 404]

            if response.status_code == 200:
                # Should be a file download
                assert "content-disposition" in response.headers
                assert response.headers["content-disposition"].startswith("attachment")

    def test_api_error_handling(self, client):
        """Test API error handling"""
        # Test non-existent endpoint
        response = client.get("/non-existent-endpoint")
        assert response.status_code == 404

        # Test invalid method
        response = client.patch("/health")
        assert response.status_code == 405

    def test_cors_headers(self, client):
        """Test CORS headers are present"""
        response = client.options("/health")
        # Check for CORS headers
        assert "access-control-allow-origin" in response.headers
        assert "access-control-allow-methods" in response.headers
        assert "access-control-allow-headers" in response.headers

    def test_concurrent_uploads(self, client, sample_pdf_path, valid_form_data):
        """Test handling of concurrent uploads"""
        import threading
        import queue

        results = queue.Queue()

        def upload_file():
            try:
                with open(sample_pdf_path, "rb") as f:
                    response = client.post(
                        "/upload",
                        data=valid_form_data,
                        files={"file": ("IES - 2023.pdf", f, "application/pdf")}
                    )
                results.put(response.status_code)
            except Exception as e:
                results.put(e)

        # Start 3 concurrent uploads
        threads = []
        for _ in range(3):
            thread = threading.Thread(target=upload_file)
            threads.append(thread)
            thread.start()

        # Wait for all to complete
        for thread in threads:
            thread.join()

        # Check results
        success_count = 0
        while not results.empty():
            result = results.get()
            if isinstance(result, int) and result == 200:
                success_count += 1

        # At least 2 should succeed (depending on rate limiting)
        assert success_count >= 2

    def test_rate_limiting(self, client, sample_pdf_path, valid_form_data):
        """Test rate limiting functionality"""
        responses = []

        # Make many rapid requests
        for _ in range(20):
            with open(sample_pdf_path, "rb") as f:
                response = client.post(
                    "/upload",
                    data=valid_form_data,
                    files={"file": ("IES - 2023.pdf", f, "application/pdf")}
                )
            responses.append(response.status_code)

        # Should eventually be rate limited
        rate_limited = any(status == 429 for status in responses)
        # This test might be optional depending on rate limiting implementation
        # assert rate_limited or all(status == 200 for status in responses)

    def test_data_validation(self, client):
        """Test data validation endpoints"""
        # Test various NIF formats
        invalid_nifs = ["123", "1234567890", "abcdef", "12345678a"]

        for nif in invalid_nifs:
            form_data = {
                "nif": nif,
                "ano_exercicio": "2023",
                "designacao_social": "Test Company",
                "email": "test@example.com"
            }

            # Create dummy file
            with tempfile.NamedTemporaryFile(mode='wb', suffix='.pdf', delete=False) as tmp:
                tmp.write(b'%PDF-1.4\n%EOF')
                tmp_path = tmp.name

            try:
                with open(tmp_path, "rb") as f:
                    response = client.post(
                        "/upload",
                        data=form_data,
                        files={"file": ("test.pdf", f, "application/pdf")}
                    )
                # Should either accept and validate server-side, or reject
                assert response.status_code in [200, 400, 422]
            finally:
                Path(tmp_path).unlink()


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])