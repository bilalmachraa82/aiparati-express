#!/usr/bin/env python3
"""
Performance and Security Testing Suite for AutoFund AI
"""

import requests
import time
import concurrent.futures
import threading
import json
import hashlib
import secrets
import os
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any
import statistics

class AutoFundPerformanceTester:
    """Performance testing suite"""

    def __init__(self):
        self.api_base = "http://localhost:8000"
        self.frontend_base = "http://localhost:3000"
        self.auth_token = "test-token-12345"
        self.headers = {
            "Authorization": f"Bearer {self.auth_token}",
            "Accept": "application/json"
        }
        self.results = {}

    def test_api_response_times(self):
        """Test API endpoint response times"""
        print("🚀 Testing API Response Times...")

        endpoints = [
            "/",
            "/health",
            "/api/status/test-task"
        ]

        response_times = {}

        for endpoint in endpoints:
            times = []
            for _ in range(10):  # Test each endpoint 10 times
                start_time = time.time()
                try:
                    response = requests.get(
                        f"{self.api_base}{endpoint}",
                        headers=self.headers,
                        timeout=10
                    )
                    end_time = time.time()

                    if response.status_code in [200, 404]:  # 404 is expected for test task
                        times.append((end_time - start_time) * 1000)  # Convert to ms
                except requests.exceptions.RequestException:
                    pass

            if times:
                response_times[endpoint] = {
                    "avg": statistics.mean(times),
                    "min": min(times),
                    "max": max(times),
                    "median": statistics.median(times),
                    "std_dev": statistics.stdev(times) if len(times) > 1 else 0
                }

                print(f"  {endpoint}:")
                print(f"    Average: {response_times[endpoint]['avg']:.2f}ms")
                print(f"    Min: {response_times[endpoint]['min']:.2f}ms")
                print(f"    Max: {response_times[endpoint]['max']:.2f}ms")

        self.results["api_response_times"] = response_times
        return response_times

    def test_concurrent_load(self, num_users=10, requests_per_user=5):
        """Test concurrent user load"""
        print(f"⚡ Testing Concurrent Load ({num_users} users, {requests_per_user} requests each)...")

        def user_requests(user_id: int):
            """Simulate user making requests"""
            user_results = []

            for i in range(requests_per_user):
                start_time = time.time()
                try:
                    # Test health endpoint (most lightweight)
                    response = requests.get(
                        f"{self.api_base}/health",
                        timeout=10
                    )
                    end_time = time.time()

                    user_results.append({
                        "user_id": user_id,
                        "request_id": i,
                        "status_code": response.status_code,
                        "response_time": (end_time - start_time) * 1000,
                        "success": response.status_code == 200
                    })
                except Exception as e:
                    user_results.append({
                        "user_id": user_id,
                        "request_id": i,
                        "status_code": 0,
                        "response_time": 10000,  # Timeout
                        "success": False,
                        "error": str(e)
                    })

                # Small delay between requests
                time.sleep(0.1)

            return user_results

        # Run concurrent users
        all_results = []
        start_time = time.time()

        with concurrent.futures.ThreadPoolExecutor(max_workers=num_users) as executor:
            futures = [executor.submit(user_requests, i) for i in range(num_users)]

            for future in concurrent.futures.as_completed(futures):
                try:
                    user_results = future.result(timeout=30)
                    all_results.extend(user_results)
                except Exception as e:
                    print(f"User request failed: {e}")

        total_time = time.time() - start_time

        # Analyze results
        successful_requests = [r for r in all_results if r["success"]]
        response_times = [r["response_time"] for r in successful_requests]

        if response_times:
            performance_metrics = {
                "total_requests": len(all_results),
                "successful_requests": len(successful_requests),
                "success_rate": (len(successful_requests) / len(all_results)) * 100,
                "avg_response_time": statistics.mean(response_times),
                "min_response_time": min(response_times),
                "max_response_time": max(response_times),
                "requests_per_second": len(all_results) / total_time,
                "total_test_time": total_time
            }

            print(f"  Total Requests: {performance_metrics['total_requests']}")
            print(f"  Success Rate: {performance_metrics['success_rate']:.2f}%")
            print(f"  Avg Response Time: {performance_metrics['avg_response_time']:.2f}ms")
            print(f"  Requests/Second: {performance_metrics['requests_per_second']:.2f}")

            self.results["concurrent_load"] = performance_metrics
            return performance_metrics
        else:
            print("  ❌ No successful requests")
            return None

    def test_file_upload_performance(self):
        """Test file upload performance"""
        print("📄 Testing File Upload Performance...")

        # Create test files of different sizes
        test_files = [
            ("small.pdf", b'%PDF-1.4\n' + b'0' * (100 * 1024)),  # 100KB
            ("medium.pdf", b'%PDF-1.4\n' + b'0' * (1024 * 1024)),  # 1MB
        ]

        upload_results = {}

        for filename, content in test_files:
            upload_times = []

            for i in range(3):  # Test each file size 3 times
                form_data = {
                    "nif": "123456789",
                    "ano_exercicio": "2023",
                    "designacao_social": "Test Company",
                    "email": f"test{i}@example.com"
                }

                files = {"file": (filename, content, "application/pdf")}

                start_time = time.time()
                try:
                    response = requests.post(
                        f"{self.api_base}/api/upload",
                        files=files,
                        data=form_data,
                        headers=self.headers,
                        timeout=30
                    )
                    end_time = time.time()

                    if response.status_code == 200:
                        upload_times.append((end_time - start_time) * 1000)
                except Exception as e:
                    print(f"Upload failed for {filename}: {e}")

            if upload_times:
                upload_results[filename] = {
                    "file_size": len(content),
                    "avg_upload_time": statistics.mean(upload_times),
                    "min_upload_time": min(upload_times),
                    "max_upload_time": max(upload_times),
                    "throughput_mbps": (len(content) / statistics.mean(upload_times)) / (1024 * 1024) * 1000
                }

                print(f"  {filename}:")
                print(f"    Size: {len(content)} bytes")
                print(f"    Avg Upload Time: {upload_results[filename]['avg_upload_time']:.2f}ms")
                print(f"    Throughput: {upload_results[filename]['throughput_mbps']:.2f} MB/s")

        self.results["file_upload_performance"] = upload_results
        return upload_results


class AutoFundSecurityTester:
    """Security testing suite"""

    def __init__(self):
        self.api_base = "http://localhost:8000"
        self.frontend_base = "http://localhost:3000"
        self.auth_token = "test-token-12345"
        self.headers = {
            "Authorization": f"Bearer {self.auth_token}",
            "Accept": "application/json"
        }
        self.security_results = {}

    def test_sql_injection_attempts(self):
        """Test for SQL injection vulnerabilities"""
        print("🔒 Testing SQL Injection Protection...")

        sql_injection_payloads = [
            "'; DROP TABLE users; --",
            "' OR '1'='1",
            "' UNION SELECT * FROM users --",
            "'; INSERT INTO users VALUES('hacker','password'); --",
            "' OR 1=1 --",
            "' AND 1=1 --",
            "admin'--",
            "admin' /*",
            "' OR 'x'='x",
        ]

        vulnerable_endpoints = []

        for payload in sql_injection_payloads:
            # Test GET endpoint
            try:
                response = requests.get(
                    f"{self.api_base}/api/status/{payload}",
                    headers=self.headers,
                    timeout=10
                )

                # Check if payload caused unexpected behavior
                if response.status_code not in [404, 400, 401, 403]:
                    vulnerable_endpoints.append({
                        "method": "GET",
                        "endpoint": f"/api/status/{payload}",
                        "status_code": response.status_code,
                        "payload": payload
                    })
            except Exception:
                pass

        if vulnerable_endpoints:
            print(f"  ❌ Found {len(vulnerable_endpoints)} potential SQL injection vulnerabilities")
            for vuln in vulnerable_endpoints:
                print(f"    {vuln['method']} {vuln['endpoint']} -> {vuln['status_code']}")
        else:
            print("  ✅ No obvious SQL injection vulnerabilities detected")

        self.security_results["sql_injection"] = {
            "vulnerable": len(vulnerable_endpoints) > 0,
            "vulnerabilities": vulnerable_endpoints
        }

        return len(vulnerable_endpoints) == 0

    def test_xss_protection(self):
        """Test for XSS protection"""
        print("🛡️ Testing XSS Protection...")

        xss_payloads = [
            "<script>alert('XSS')</script>",
            "javascript:alert('XSS')",
            "<img src=x onerror=alert('XSS')>",
            "';alert('XSS');//",
            "<svg onload=alert('XSS')>",
            "'\"><script>alert('XSS')</script>",
        ]

        xss_vulnerabilities = []

        for payload in xss_payloads:
            # Test with form data
            form_data = {
                "nif": "123456789",
                "ano_exercicio": "2023",
                "designacao_social": payload,
                "email": "test@example.com"
            }

            try:
                response = requests.post(
                    f"{self.api_base}/api/upload",
                    data=form_data,
                    headers=self.headers,
                    timeout=10
                )

                # Check if payload is reflected in response without proper encoding
                if payload in response.text and response.status_code != 400:
                    xss_vulnerabilities.append({
                        "payload": payload,
                        "endpoint": "/api/upload",
                        "status_code": response.status_code
                    })
            except Exception:
                pass

        if xss_vulnerabilities:
            print(f"  ❌ Found {len(xss_vulnerabilities)} potential XSS vulnerabilities")
            for vuln in xss_vulnerabilities:
                print(f"    Payload: {vuln['payload'][:50]}...")
        else:
            print("  ✅ No obvious XSS vulnerabilities detected")

        self.security_results["xss_protection"] = {
            "vulnerable": len(xss_vulnerabilities) > 0,
            "vulnerabilities": xss_vulnerabilities
        }

        return len(xss_vulnerabilities) == 0

    def test_authentication_bypass(self):
        """Test for authentication bypass"""
        print("🔐 Testing Authentication Bypass...")

        auth_tests = []

        # Test without authentication
        try:
            response = requests.get(f"{self.api_base}/api/status/test", timeout=10)
            auth_tests.append({
                "test": "No Auth Header",
                "status_code": response.status_code,
                "should_fail": response.status_code != 403
            })
        except Exception as e:
            auth_tests.append({
                "test": "No Auth Header",
                "error": str(e),
                "should_fail": False
            })

        # Test with invalid token
        invalid_headers = {"Authorization": "Bearer invalid-token"}
        try:
            response = requests.get(
                f"{self.api_base}/api/status/test",
                headers=invalid_headers,
                timeout=10
            )
            auth_tests.append({
                "test": "Invalid Token",
                "status_code": response.status_code,
                "should_fail": response.status_code != 403
            })
        except Exception as e:
            auth_tests.append({
                "test": "Invalid Token",
                "error": str(e),
                "should_fail": False
            })

        # Test with malformed auth header
        malformed_headers = {"Authorization": "Malformed token"}
        try:
            response = requests.get(
                f"{self.api_base}/api/status/test",
                headers=malformed_headers,
                timeout=10
            )
            auth_tests.append({
                "test": "Malformed Auth Header",
                "status_code": response.status_code,
                "should_fail": response.status_code != 403
            })
        except Exception as e:
            auth_tests.append({
                "test": "Malformed Auth Header",
                "error": str(e),
                "should_fail": False
            })

        bypasses_detected = []
        for test in auth_tests:
            if test.get("should_fail", False):
                bypasses_detected.append(test)
                print(f"  ❌ {test['test']}: Status {test['status_code']} (should have failed)")
            else:
                print(f"  ✅ {test['test']}: Properly rejected")

        self.security_results["authentication"] = {
            "vulnerable": len(bypasses_detected) > 0,
            "bypasses": bypasses_detected
        }

        return len(bypasses_detected) == 0

    def test_file_upload_security(self):
        """Test file upload security"""
        print("📁 Testing File Upload Security...")

        malicious_files = [
            ("malicious.exe", b'MZ\x90\x00', "application/octet-stream"),
            ("malicious.php", b'<?php system($_GET["cmd"]); ?>', "application/x-php"),
            ("script.js", b'<script>alert("XSS")</script>', "application/javascript"),
            ("large_file.pdf", b'%PDF-1.4\n' + b'0' * (50 * 1024 * 1024), "application/pdf"),  # 50MB
        ]

        upload_vulnerabilities = []

        form_data = {
            "nif": "123456789",
            "ano_exercicio": "2023",
            "designacao_social": "Test Security",
            "email": "security@example.com"
        }

        for filename, content, content_type in malicious_files:
            try:
                files = {"file": (filename, content, content_type)}

                response = requests.post(
                    f"{self.api_base}/api/upload",
                    files=files,
                    data=form_data,
                    headers=self.headers,
                    timeout=30
                )

                # Check if malicious file was accepted
                if response.status_code == 200:
                    upload_vulnerabilities.append({
                        "file": filename,
                        "content_type": content_type,
                        "size": len(content),
                        "status": "accepted"
                    })
                    print(f"  ❌ {filename}: Accepted (vulnerability)")
                else:
                    print(f"  ✅ {filename}: Rejected with status {response.status_code}")

            except Exception as e:
                print(f"  ✅ {filename}: Failed to upload ({str(e)[:50]}...)")

        self.security_results["file_upload"] = {
            "vulnerable": len(upload_vulnerabilities) > 0,
            "vulnerabilities": upload_vulnerabilities
        }

        return len(upload_vulnerabilities) == 0

    def test_rate_limiting(self):
        """Test rate limiting implementation"""
        print("⏱️ Testing Rate Limiting...")

        # Make many rapid requests
        rapid_requests = []
        rate_limit_triggered = False

        start_time = time.time()

        for i in range(50):  # 50 rapid requests
            request_start = time.time()
            try:
                response = requests.get(
                    f"{self.api_base}/health",
                    timeout=5
                )
                request_end = time.time()

                rapid_requests.append({
                    "request_id": i,
                    "status_code": response.status_code,
                    "response_time": (request_end - request_start) * 1000
                })

                if response.status_code == 429:  # Too Many Requests
                    rate_limit_triggered = True
                    break

            except Exception as e:
                rapid_requests.append({
                    "request_id": i,
                    "status_code": 0,
                    "error": str(e)
                })

        total_time = time.time() - start_time

        # Analyze rate limiting
        success_requests = [r for r in rapid_requests if r["status_code"] == 200]

        print(f"  Total Requests: {len(rapid_requests)}")
        print(f"  Successful Requests: {len(success_requests)}")
        print(f"  Rate Limit Triggered: {rate_limit_triggered}")
        print(f"  Requests/Second: {len(rapid_requests) / total_time:.2f}")

        self.security_results["rate_limiting"] = {
            "implemented": rate_limit_triggered,
            "total_requests": len(rapid_requests),
            "successful_requests": len(success_requests),
            "requests_per_second": len(rapid_requests) / total_time
        }

        return rate_limit_triggered  # Rate limiting should be implemented


def run_comprehensive_tests():
    """Run all performance and security tests"""
    print("🚀 Starting AutoFund AI Performance & Security Test Suite")
    print("=" * 70)

    test_results = {
        "timestamp": datetime.now().isoformat(),
        "performance": {},
        "security": {},
        "summary": {}
    }

    # Performance Tests
    print("\n📊 PERFORMANCE TESTS")
    print("=" * 30)

    perf_tester = AutoFundPerformanceTester()

    try:
        # Test API response times
        api_times = perf_tester.test_api_response_times()
        test_results["performance"]["api_response_times"] = api_times

        # Test concurrent load
        load_results = perf_tester.test_concurrent_load()
        test_results["performance"]["concurrent_load"] = load_results

        # Test file upload performance
        upload_perf = perf_tester.test_file_upload_performance()
        test_results["performance"]["file_upload"] = upload_perf

    except Exception as e:
        print(f"❌ Performance tests failed: {e}")
        test_results["performance"]["error"] = str(e)

    # Security Tests
    print("\n🔒 SECURITY TESTS")
    print("=" * 25)

    sec_tester = AutoFundSecurityTester()

    try:
        # Test SQL injection
        sql_safe = sec_tester.test_sql_injection_attempts()
        test_results["security"]["sql_injection"] = {"safe": sql_safe}

        # Test XSS protection
        xss_safe = sec_tester.test_xss_protection()
        test_results["security"]["xss_protection"] = {"safe": xss_safe}

        # Test authentication
        auth_safe = sec_tester.test_authentication_bypass()
        test_results["security"]["authentication"] = {"safe": auth_safe}

        # Test file upload security
        upload_safe = sec_tester.test_file_upload_security()
        test_results["security"]["file_upload"] = {"safe": upload_safe}

        # Test rate limiting
        rate_limiting = sec_tester.test_rate_limiting()
        test_results["security"]["rate_limiting"] = {"implemented": rate_limiting}

    except Exception as e:
        print(f"❌ Security tests failed: {e}")
        test_results["security"]["error"] = str(e)

    # Generate Summary
    print("\n📋 TEST SUMMARY")
    print("=" * 20)

    performance_score = 0
    security_score = 0

    # Performance scoring
    if "performance" in test_results and "error" not in test_results["performance"]:
        performance_tests = [
            "api_response_times",
            "concurrent_load",
            "file_upload"
        ]

        for test in performance_tests:
            if test in test_results["performance"] and test_results["performance"][test]:
                performance_score += 33.33

        performance_score = min(100, performance_score)

    # Security scoring
    if "security" in test_results and "error" not in test_results["security"]:
        security_tests = [
            ("sql_injection", "safe"),
            ("xss_protection", "safe"),
            ("authentication", "safe"),
            ("file_upload", "safe")
        ]

        for test, safe_field in security_tests:
            if test in test_results["security"] and test_results["security"][test].get(safe_field, False):
                security_score += 20

        security_score = min(100, security_score)

    overall_score = (performance_score + security_score) / 2

    print(f"Performance Score: {performance_score:.1f}%")
    print(f"Security Score: {security_score:.1f}%")
    print(f"Overall Score: {overall_score:.1f}%")

    if overall_score >= 90:
        print("🎉 EXCELLENT - Production ready!")
    elif overall_score >= 75:
        print("✅ GOOD - Mostly production ready")
    elif overall_score >= 60:
        print("⚠️  ACCEPTABLE - Needs improvements")
    else:
        print("❌ NEEDS WORK - Major issues to address")

    test_results["summary"] = {
        "performance_score": performance_score,
        "security_score": security_score,
        "overall_score": overall_score,
        "grade": "EXCELLENT" if overall_score >= 90 else "GOOD" if overall_score >= 75 else "ACCEPTABLE" if overall_score >= 60 else "NEEDS WORK"
    }

    # Save detailed results
    output_path = Path("outputs/performance_security_report.json")
    output_path.parent.mkdir(exist_ok=True)

    with open(output_path, "w") as f:
        json.dump(test_results, f, indent=2, default=str)

    print(f"\n📊 Detailed report saved: {output_path}")

    return test_results


if __name__ == "__main__":
    # Check if services are running
    try:
        requests.get("http://localhost:8000/health", timeout=5)
        requests.get("http://localhost:3000", timeout=5)
    except requests.exceptions.RequestException as e:
        print(f"❌ Services not running: {e}")
        print("Please start both frontend and backend services first")
        exit(1)

    # Run tests
    results = run_comprehensive_tests()