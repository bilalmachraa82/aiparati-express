# AutoFund AI Troubleshooting Guide & FAQ

<div align="center">

[![Support](https://img.shields.io/badge/Support-24/7-orange.svg)](mailto:support@autofund.ai)
[![Documentation](https://img.shields.io/badge/Docs-Complete-green.svg)](https://docs.autofund.ai)
[![Community](https://img.shields.io/badge/Community-Discord-blue.svg)](https://discord.gg/autofund)

**🔧 Complete troubleshooting solutions for common issues**

[🆘 Quick Help](#quick-help) • [🐛 Common Issues](#common-issues) • [📚 FAQ](#frequently-asked-questions) • [🛠️ Advanced Debugging](#advanced-debugging)

</div>

---

## 📋 Table of Contents

- [🆘 Quick Help](#-quick-help)
- [🐛 Common Issues](#-common-issues)
  - [Installation & Setup](#installation--setup)
  - [API & Backend Issues](#api--backend-issues)
  - [Frontend Issues](#frontend-issues)
  - [AI Processing Issues](#ai-processing-issues)
  - [File & Storage Issues](#file--storage-issues)
  - [Performance Issues](#performance-issues)
  - [Security Issues](#security-issues)
- [📚 Frequently Asked Questions](#frequently-asked-questions)
- [🛠️ Advanced Debugging](#advanced-debugging)
- [📞 Getting Support](#-getting-support)

---

## 🆘 Quick Help

### Emergency Checklist

If you're experiencing a critical issue, follow these steps:

1. **🔍 Check Service Status**
   ```bash
   curl https://status.autofund.ai
   # Or check locally:
   docker-compose ps
   ```

2. **📋 Check Recent Changes**
   - Did you update any environment variables?
   - Did you change API keys or secrets?
   - Did you modify configuration files?

3. **📝 Collect Error Information**
   ```bash
   # Capture logs
   docker-compose logs --tail=100 api > api-error.log
   docker-compose logs --tail=100 frontend > frontend-error.log
   ```

4. **🔄 Try Basic Recovery**
   ```bash
   docker-compose restart
   docker-compose down && docker-compose up -d
   ```

5. **📞 Contact Support**
   - Email: [support@autofund.ai](mailto:support@autofund.ai)
   - Discord: [Join our support channel](https://discord.gg/autofund)
   - Include logs and error descriptions

### Self-Service Diagnostics

Run this diagnostic script for quick analysis:

```bash
#!/bin/bash
# quick-diagnostic.sh

echo "🔍 AutoFund AI Diagnostic Tool"
echo "================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running"
    exit 1
else
    echo "✅ Docker is running"
fi

# Check if containers are running
echo ""
echo "📦 Container Status:"
docker-compose ps

# Check disk space
echo ""
echo "💾 Disk Usage:"
df -h | head -5

# Check memory usage
echo ""
echo "🧠 Memory Usage:"
free -h

# Check network connectivity
echo ""
echo "🌐 Network Connectivity:"
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend API: Reachable"
else
    echo "❌ Backend API: Not reachable"
fi

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend: Reachable"
else
    echo "❌ Frontend: Not reachable"
fi

echo ""
echo "🔍 Diagnostic complete!"
```

---

## 🐛 Common Issues

### Installation & Setup

#### ❌ Docker Installation Failed

**Problem**: Docker or Docker Compose not installing properly

**Symptoms**:
```bash
docker: command not found
docker-compose: command not found
Permission denied
```

**Solutions**:

1. **Install Docker Properly**
   ```bash
   # Linux/Ubuntu
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER

   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **Add User to Docker Group**
   ```bash
   sudo usermod -aG docker $USER
   newgrp docker
   ```

3. **Start Docker Service**
   ```bash
   sudo systemctl start docker
   sudo systemctl enable docker
   ```

#### ❌ Environment Variables Not Working

**Problem**: Environment variables not being loaded or recognized

**Symptoms**:
```bash
KeyError: 'ANTHROPIC_API_KEY'
Environment variable not found
Authentication failed
```

**Solutions**:

1. **Check .env File**
   ```bash
   # Make sure .env exists
   ls -la .env

   # Check permissions
   chmod 600 .env

   # Verify format (no spaces around =)
   cat .env
   ```

2. **Load Environment Variables**
   ```bash
   # For current session
   export $(cat .env | xargs)

   # For docker-compose
   docker-compose --env-file .env up
   ```

3. **Debug Variable Loading**
   ```bash
   # Print all environment variables
   docker-compose run --rm api printenv | grep ANTHROPIC
   ```

#### ❌ Port Conflicts

**Problem**: Services can't start due to port conflicts

**Symptoms**:
```bash
Port 3000 is already in use
Port 8000 is already in use
Address already in use
```

**Solutions**:

1. **Find Process Using Port**
   ```bash
   # Find what's using the port
   lsof -i :3000
   lsof -i :8000

   # Or with netstat
   netstat -tulpn | grep :3000
   ```

2. **Kill Conflicting Process**
   ```bash
   # Kill the process
   kill -9 <PID>

   # Or stop conflicting service
   sudo systemctl stop nginx  # If nginx is using port 80
   ```

3. **Change Ports in docker-compose.yml**
   ```yaml
   services:
     frontend:
       ports:
         - "3001:3000"  # Use different external port
     backend:
       ports:
         - "8001:8000"  # Use different external port
   ```

---

### API & Backend Issues

#### ❌ API Health Check Failing

**Problem**: Backend API not responding to health checks

**Symptoms**:
```bash
curl: (7) Failed to connect to localhost port 8000: Connection refused
Health check failed
Container restarting repeatedly
```

**Solutions**:

1. **Check Container Logs**
   ```bash
   docker-compose logs api
   docker-compose logs --tail=50 api
   ```

2. **Check Container Status**
   ```bash
   docker-compose ps
   docker inspect autofund_api
   ```

3. **Debug Container Internally**
   ```bash
   # Enter container
   docker-compose exec api bash

   # Check if FastAPI is running
   ps aux | grep uvicorn

   # Test API manually
   curl http://localhost:8000/health
   ```

4. **Common Causes & Fixes**:
   ```bash
   # Missing dependencies
   docker-compose exec api pip install -r requirements.txt

   # Wrong working directory
   WORKDIR /app  # In Dockerfile

   # Python errors - check syntax
   docker-compose exec api python -m py_compile main.py
   ```

#### ❌ Database Connection Failed

**Problem**: Backend can't connect to PostgreSQL

**Symptoms**:
```bash
psycopg2.OperationalError: could not connect to server
Connection refused
FATAL: database "autofund_ai" does not exist
```

**Solutions**:

1. **Check Database Container**
   ```bash
   docker-compose logs postgres
   docker-compose ps postgres
   ```

2. **Test Database Connection**
   ```bash
   # Enter API container
   docker-compose exec api bash

   # Test connection with psql
   psql "postgresql://autofund:password@postgres:5432/autofund_ai"

   # Or test with Python
   python -c "
import psycopg2
try:
    conn = psycopg2.connect('postgresql://autofund:password@postgres:5432/autofund_ai')
    print('✅ Database connection successful')
    conn.close()
except Exception as e:
    print(f'❌ Database connection failed: {e}')
"
   ```

3. **Fix Database Issues**:
   ```bash
   # Restart database
   docker-compose restart postgres

   # Recreate database
   docker-compose down -v
   docker-compose up postgres -d
   sleep 10
   ```

4. **Check Environment Variables**
   ```bash
   # Verify DATABASE_URL format
   docker-compose exec api printenv | grep DATABASE
   # Should be: postgresql://user:password@host:port/database
   ```

#### ❌ Redis Connection Failed

**Problem**: Backend can't connect to Redis

**Symptoms**:
```bash
redis.exceptions.ConnectionError: Error connecting to Redis
Connection refused
Unknown host redis
```

**Solutions**:

1. **Check Redis Container**
   ```bash
   docker-compose logs redis
   docker-compose ps redis
   ```

2. **Test Redis Connection**
   ```bash
   # Test from API container
   docker-compose exec api python -c "
import redis
try:
    r = redis.Redis(host='redis', port=6379, db=0)
    r.ping()
    print('✅ Redis connection successful')
except Exception as e:
    print(f'❌ Redis connection failed: {e}')
"
   ```

3. **Fix Redis Issues**:
   ```bash
   # Restart Redis
   docker-compose restart redis

   # Clear Redis data
   docker-compose exec redis redis-cli FLUSHALL
   ```

---

### Frontend Issues

#### ❌ Frontend Not Loading

**Problem**: React/Next.js frontend not displaying properly

**Symptoms**:
```bash
This page can't be reached
ERR_CONNECTION_REFUSED
White screen
Loading spinner forever
```

**Solutions**:

1. **Check Frontend Container**
   ```bash
   docker-compose logs frontend
   docker-compose ps frontend
   ```

2. **Check Build Process**
   ```bash
   # Rebuild frontend
   docker-compose build --no-cache frontend
   docker-compose up frontend
   ```

3. **Debug Frontend Container**
   ```bash
   # Enter container
   docker-compose exec frontend bash

   # Check if Next.js is running
   ps aux | grep next

   # Check port binding
   netstat -tulpn | grep 3000
   ```

4. **Common Frontend Issues**:
   ```bash
   # Node modules corruption
   docker-compose exec frontend rm -rf node_modules package-lock.json
   docker-compose exec frontend npm install

   # Build errors
   docker-compose exec frontend npm run build
   # Check for errors in output

   # Environment variables
   docker-compose exec frontend printenv | grep NEXT_PUBLIC
   ```

#### ❌ API Connection Errors

**Problem**: Frontend can't connect to backend API

**Symptoms**:
```bash
Network Error
CORS policy error
503 Service Unavailable
Failed to fetch
```

**Solutions**:

1. **Check API URL Configuration**
   ```bash
   # In frontend container
   docker-compose exec frontend printenv | grep API
   # Should match backend container name or host
   ```

2. **Check Network Connectivity**
   ```bash
   # Test from frontend container
   docker-compose exec frontend curl http://api:8000/health
   docker-compose exec frontend curl http://localhost:8000/health
   ```

3. **Fix CORS Issues**:
   ```yaml
   # In docker-compose.yml
   backend:
     environment:
       - CORS_ORIGINS=["http://localhost:3000", "http://localhost:3001"]
   ```

4. **Check Nginx/Proxy Configuration**
   ```bash
   # If using reverse proxy
   docker-compose logs nginx
   curl -H "Host: localhost" http://nginx/api/health
   ```

---

### AI Processing Issues

#### ❌ Claude AI API Errors

**Problem**: Claude API calls failing or returning errors

**Symptoms**:
```bash
anthropic.APIError: Invalid API key
Rate limit exceeded
Internal server error from Claude API
Processing timeout
```

**Solutions**:

1. **Verify API Key**
   ```bash
   # Check environment variable
   docker-compose exec api printenv | grep ANTHROPIC_API_KEY

   # Test API key manually
   curl -X POST https://api.anthropic.com/v1/messages \
     -H "x-api-key: YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model": "claude-3-5-sonnet-20241022", "max_tokens": 10, "messages": [{"role": "user", "content": "Hi"}]}'
   ```

2. **Check API Usage Limits**
   ```bash
   # Monitor rate limiting
   docker-compose logs api | grep "rate limit"
   ```

3. **Handle API Timeouts**
   ```python
   # In Python code, add timeout handling
   import anthropic
   from anthropic import APIConnectionError, APIStatusError

   try:
       client = anthropic.Anthropic(api_key=api_key)
       response = client.messages.create(
           model="claude-3-5-sonnet-20241022",
           max_tokens=4000,
           timeout=120,  # 2 minutes
           messages=[{"role": "user", "content": prompt}]
       )
   except APIConnectionError:
       # Handle network issues
       logger.error("Network connection to Claude API failed")
   except APIStatusError as e:
       # Handle API errors
       logger.error(f"Claude API error: {e}")
   ```

4. **Enable Mock Mode for Testing**
   ```bash
   # Set in .env file
   MOCK_MODE=true

   # Or set in docker-compose
   environment:
     - MOCK_MODE=true
   ```

#### ❌ PDF Processing Errors

**Problem**: IES PDF files not processing correctly

**Symptoms**:
```bash
PDF extraction failed
Invalid PDF format
File size too large
Corrupted PDF
OCR failed
```

**Solutions**:

1. **Validate PDF File**
   ```bash
   # Check file size
   ls -lh IES-2023.pdf
   # Should be less than 10MB

   # Check PDF validity
   file IES-2023.pdf
   # Should show: PDF document, version X.X

   # Try to open with PDF reader
   pdftotext IES-2023.pdf - | head -20
   ```

2. **Debug PDF Processing**
   ```bash
   # Enter API container
   docker-compose exec api bash

   # Test PDF processing manually
   python -c "
from pathlib import Path
pdf_path = Path('/app/uploads/your-file.pdf')
if pdf_path.exists():
    print(f'PDF found: {pdf_path.stat().st_size} bytes')
else:
    print('PDF not found')
"
   ```

3. **Fix Common PDF Issues**:
   ```bash
   # Compress large PDFs
   gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/screen \
      -dNOPAUSE -dQUIET -dBATCH -sOutputFile=compressed.pdf input.pdf

   # Repair corrupted PDFs
   pdftk corrupted.pdf output repaired.pdf
   ```

---

### File & Storage Issues

#### ❌ File Upload Problems

**Problem**: Users can't upload IES files

**Symptoms**:
```bash
File upload failed
Request entity too large
Upload directory not found
Permission denied
```

**Solutions**:

1. **Check Upload Directory**
   ```bash
   # Create upload directory
   mkdir -p uploads outputs
   chmod 755 uploads outputs

   # In container
   docker-compose exec api ls -la /app/uploads
   ```

2. **Check File Size Limits**
   ```yaml
   # In docker-compose.yml
   nginx:
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
   # In nginx.conf
   client_max_body_size 10M;
   ```

3. **Fix Permissions**
   ```bash
   # Set correct permissions
   sudo chown -R $USER:$USER uploads outputs
   chmod 755 uploads outputs
   ```

#### ❌ File Download Issues

**Problem**: Users can't download generated files

**Symptoms**:
```bash
404 Not Found
File not found
Permission denied
Download failed
```

**Solutions**:

1. **Check Output Directory**
   ```bash
   # Check if files exist
   ls -la outputs/

   # Check file permissions
   ls -la outputs/*.xlsx
   ```

2. **Verify File Paths in Database**
   ```bash
   # Enter API container
   docker-compose exec api python -c "
import os
from pathlib import Path
output_dir = Path('/app/outputs')
if output_dir.exists():
    files = list(output_dir.glob('*'))
    print(f'Files in output directory: {len(files)}')
    for f in files:
        print(f'  {f.name}: {f.stat().st_size} bytes')
else:
    print('Output directory does not exist')
"
   ```

---

### Performance Issues

#### ❌ Slow API Response Times

**Problem**: API requests taking too long to respond

**Symptoms**:
```bash
Request timeout
504 Gateway Timeout
Very slow processing
High CPU usage
```

**Solutions**:

1. **Monitor Resource Usage**
   ```bash
   # Check container resource usage
   docker stats

   # Check system resources
   top
   htop
   ```

2. **Optimize Database Queries**
   ```sql
   -- Check slow queries
   SELECT query, mean_time, calls
   FROM pg_stat_statements
   ORDER BY mean_time DESC
   LIMIT 10;
   ```

3. **Add Caching**
   ```python
   # Add Redis caching to API
   import redis
   import json

   redis_client = redis.Redis(host='redis', port=6379, db=0)

   def get_cached_result(task_id):
       cached = redis_client.get(f"result:{task_id}")
       if cached:
           return json.loads(cached)
       return None

   def cache_result(task_id, result, ttl=3600):
       redis_client.setex(f"result:{task_id}", ttl, json.dumps(result))
   ```

4. **Scale Services**
   ```bash
   # Scale API service
   docker-compose up -d --scale api=3

   # Add load balancer
   # Configure Nginx for load balancing
   ```

#### ❌ Memory Leaks

**Problem**: Memory usage increasing continuously

**Symptoms**:
```bash
Out of memory errors
Container restarts
High memory usage
Slow performance
```

**Solutions**:

1. **Monitor Memory Usage**
   ```bash
   # Monitor over time
   watch -n 5 'docker stats --no-stream'

   # Check memory usage in container
   docker-compose exec api cat /proc/meminfo
   ```

2. **Fix Memory Leaks**
   ```python
   # Use context managers for file handling
   with open('file.pdf', 'rb') as f:
       data = f.read()
       # Process data
   # File automatically closed

   # Clear large objects from memory
   del large_object
   import gc
   gc.collect()
   ```

3. **Set Memory Limits**
   ```yaml
   # In docker-compose.yml
   api:
     deploy:
       resources:
         limits:
           memory: 1G
         reservations:
           memory: 512M
   ```

---

### Security Issues

#### ❌ CORS Policy Errors

**Problem**: Frontend blocked by CORS policy

**Symptoms**:
```bash
Access to fetch at 'http://localhost:8000' from origin 'http://localhost:3000'
has been blocked by CORS policy
```

**Solutions**:

1. **Configure CORS in FastAPI**
   ```python
   # In main.py
   from fastapi.middleware.cors import CORSMiddleware

   app.add_middleware(
       CORSMiddleware,
       allow_origins=[
           "http://localhost:3000",
           "https://yourdomain.com",
           "https://www.yourdomain.com"
       ],
       allow_credentials=True,
       allow_methods=["GET", "POST", "PUT", "DELETE"],
       allow_headers=["*"],
   )
   ```

2. **Check Environment Variables**
   ```bash
   # Verify CORS origins configuration
   docker-compose exec api printenv | grep CORS
   ```

#### ❌ JWT Authentication Issues

**Problem**: JWT tokens not working properly

**Symptoms**:
```bash
401 Unauthorized
Invalid token
Token expired
Authentication failed
```

**Solutions**:

1. **Check JWT Configuration**
   ```bash
   # Check JWT secret
   docker-compose exec api printenv | grep JWT

   # Verify token format
   echo "YOUR_JWT_TOKEN" | cut -d. -f2 | base64 -d
   ```

2. **Debug Token Processing**
   ```python
   # Add debugging to authentication
   import jwt
   from datetime import datetime

   try:
       payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
       print(f"Token valid until: {datetime.fromtimestamp(payload['exp'])}")
   except jwt.ExpiredSignatureError:
       print("Token expired")
   except jwt.InvalidTokenError:
       print("Invalid token")
   ```

---

## 📚 Frequently Asked Questions

### General Questions

**Q: How do I reset my admin password?**
```bash
# Access PostgreSQL directly
docker-compose exec postgres psql -U autofund -d autofund_ai
UPDATE users SET password_hash = '$2b$12$...' WHERE email = 'admin@autofund.ai';
```

**Q: How do I update to the latest version?**
```bash
# Pull latest images
docker-compose pull
docker-compose up -d
```

**Q: Can I run AutoFund AI without Docker?**
Yes, but it's not recommended for production. See the manual setup guide in docs/MANUAL_SETUP.md.

**Q: What are the minimum system requirements?**
- CPU: 2 cores
- RAM: 4GB
- Storage: 20GB
- Network: Stable internet connection for Claude API

### API Questions

**Q: How do I increase the file upload limit?**
```yaml
# In docker-compose.yml
nginx:
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf:ro
# In nginx.conf, add:
client_max_body_size 50M;
```

**Q: How do I get my Claude API key?**
1. Visit [console.anthropic.com](https://console.anthropic.com)
2. Create an account or sign in
3. Go to API Keys section
4. Generate a new key
5. Add it to your `.env` file

**Q: Why is my PDF processing taking so long?**
- Large PDF files take longer to process
- Claude API may have rate limits
- Mock mode processes instantly for testing

### Deployment Questions

**Q: How do I backup my data?**
```bash
# Backup database
docker-compose exec postgres pg_dump -U autofund autofund_ai > backup.sql

# Backup files
tar -czf uploads_backup.tar.gz uploads/ outputs/
```

**Q: How do I move to a different server?**
```bash
# Export data
docker-compose exec postgres pg_dump -U autofund autofund_ai > backup.sql
tar -czf data_backup.tar.gz uploads/ outputs/ .env

# Import on new server
tar -xzf data_backup.tar.gz
docker-compose up -d postgres
docker-compose exec postgres psql -U autofund -d autofund_ai < backup.sql
```

### Billing Questions

**Q: How does billing work?**
- Free tier: 5 IES files per month
- Professional: €49/month for 50 files
- Enterprise: Custom pricing

**Q: Can I change my plan?**
Yes, you can upgrade or downgrade your plan at any time from your dashboard.

---

## 🛠️ Advanced Debugging

### Debug Scripts

#### Full System Diagnosis

```bash
#!/bin/bash
# full-diagnosis.sh

echo "🔍 AutoFund AI Full System Diagnosis"
echo "===================================="

# System Information
echo "📊 System Information:"
echo "OS: $(uname -s)"
echo "Kernel: $(uname -r)"
echo "Uptime: $(uptime)"
echo ""

# Docker Information
echo "🐳 Docker Information:"
echo "Docker Version: $(docker --version)"
echo "Docker Compose Version: $(docker-compose --version)"
echo "Docker Status: $(systemctl is-active docker)"
echo ""

# Container Status
echo "📦 Container Status:"
docker-compose ps
echo ""

# Resource Usage
echo "💾 Resource Usage:"
echo "Memory Usage:"
free -h
echo "Disk Usage:"
df -h
echo "CPU Usage:"
top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}'
echo ""

# Network Connectivity
echo "🌐 Network Connectivity:"
echo "Backend Health:"
curl -s http://localhost:8000/health | jq '.status' 2>/dev/null || echo "❌ Backend unreachable"
echo "Frontend Health:"
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200" && echo "✅ Frontend OK" || echo "❌ Frontend unreachable"
echo ""

# Service Logs (last 10 lines each)
echo "📝 Recent Service Logs:"
echo "--- Backend ---"
docker-compose logs --tail=10 api
echo "--- Frontend ---"
docker-compose logs --tail=10 frontend
echo "--- Database ---"
docker-compose logs --tail=5 postgres
echo "--- Redis ---"
docker-compose logs --tail=5 redis

echo ""
echo "🔍 Full diagnosis completed!"
```

#### Performance Monitor

```bash
#!/bin/bash
# performance-monitor.sh

echo "📈 AutoFund AI Performance Monitor"
echo "=================================="

while true; do
    clear
    echo "📊 Performance Monitor - $(date)"
    echo "================================"

    # Container Resource Usage
    echo "📦 Container Resource Usage:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"

    echo ""
    echo "🌐 API Response Times:"

    # Test API response times
    backend_time=$(curl -o /dev/null -s -w "%{time_total}" http://localhost:8000/health 2>/dev/null)
    echo "Backend Health: ${backend_time}s"

    frontend_time=$(curl -o /dev/null -s -w "%{time_total}" http://localhost:3000 2>/dev/null)
    echo "Frontend Load: ${frontend_time}s"

    echo ""
    echo "📊 Database Performance:"

    # Check database connections
    db_connections=$(docker-compose exec -T postgres psql -U autofund -d autofund_ai -t -c "SELECT count(*) FROM pg_stat_activity;" 2>/dev/null | tr -d ' ')
    echo "Active DB Connections: $db_connections"

    # Check database size
    db_size=$(docker-compose exec -T postgres psql -U autofund -d autofund_ai -t -c "SELECT pg_size_pretty(pg_database_size('autofund_ai'));" 2>/dev/null | tr -d ' ')
    echo "Database Size: $db_size"

    echo ""
    echo "🗄️ Redis Performance:"
    redis_memory=$(docker-compose exec -T redis redis-cli info memory | grep used_memory_human | cut -d: -f2 | tr -d '\r')
    echo "Redis Memory Usage: $redis_memory"

    echo ""
    echo "Press Ctrl+C to exit..."
    sleep 10
done
```

### Log Analysis

#### Error Log Analyzer

```bash
#!/bin/bash
# log-analyzer.sh

LOG_FILE="autofund_ai.log"

if [ ! -f "$LOG_FILE" ]; then
    echo "Log file not found: $LOG_FILE"
    exit 1
fi

echo "📋 AutoFund AI Log Analysis"
echo "==========================="

echo "📊 Log Statistics:"
echo "Total Lines: $(wc -l < $LOG_FILE)"
echo "Error Count: $(grep -c "ERROR" $LOG_FILE)"
echo "Warning Count: $(grep -c "WARNING" $LOG_FILE)"
echo ""

echo "🚨 Recent Errors (last 10):"
grep "ERROR" $LOG_FILE | tail -10
echo ""

echo "⚠️ Recent Warnings (last 10):"
grep "WARNING" $LOG_FILE | tail -10
echo ""

echo "🔄 Processing Statistics:"
echo "Total Tasks Started: $(grep -c "Task started" $LOG_FILE)"
echo "Tasks Completed: $(grep -c "Task completed" $LOG_FILE)"
echo "Tasks Failed: $(grep -c "Task failed" $LOG_FILE)"
echo ""

echo "📈 API Request Summary:"
echo "GET Requests: $(grep -c '"GET' $LOG_FILE)"
echo "POST Requests: $(grep -c '"POST' $LOG_FILE)"
echo "PUT Requests: $(grep -c '"PUT' $LOG_FILE)"
echo "DELETE Requests: $(grep -c '"DELETE' $LOG_FILE)"

echo ""
echo "🔍 Top Error Messages:"
grep "ERROR" $LOG_FILE | sed 's/.*ERROR: //' | sort | uniq -c | sort -nr | head -5
```

---

## 📞 Getting Support

### Self-Service Resources

1. **📚 Documentation**: [docs.autofund.ai](https://docs.autofund.ai)
2. **🎥 Video Tutorials**: [youtube.com/autofund](https://youtube.com/autofund)
3. **💬 Community Forum**: [discuss.autofund.ai](https://discuss.autofund.ai)
4. **🔍 API Status**: [status.autofund.ai](https://status.autofund.ai)

### Contact Support

**Before contacting support, please:**

1. ✅ Check this troubleshooting guide
2. ✅ Run the diagnostic script
3. ✅ Collect relevant logs
4. ✅ Note the exact error messages
5. ✅ Describe what you were trying to do

**Support Channels:**

- 📧 **Email**: [support@autofund.ai](mailto:support@autofund.ai)
  - Response time: 24 hours
  - Best for: Complex issues, billing questions

- 💬 **Discord**: [discord.gg/autofund](https://discord.gg/autofund)
  - Response time: 1-2 hours
  - Best for: Quick questions, community help

- 📞 **Priority Support** (Enterprise only)
  - Response time: 1 hour
  - Available 24/7
  - Direct phone support

### Bug Reports

**Found a bug? Report it at:** [github.com/autofund-ai/issues](https://github.com/autofund-ai/issues)

**Include in your report:**
- Environment details (OS, Docker version)
- Steps to reproduce
- Expected vs actual behavior
- Relevant logs
- Screenshots if applicable

### Feature Requests

**Have an idea?** We'd love to hear it!
- Submit feature requests at: [github.com/autofund-ai/discussions](https://github.com/autofund-ai/discussions)
- Vote on existing requests
- Join our beta testing program

---

<div align="center">

[![Built with ❤️ in Portugal](https://img.shields.io/badge/Built%20with%20❤️%20in%20Portugal-00205B?style=for-the-badge)](https://autofund.ai)

**🔧 We're here to help you succeed!**

[📚 Documentation](https://docs.autofund.ai) • [💬 Discord Support](https://discord.gg/autofund) • [📧 Email Support](mailto:support@autofund.ai)

</div>