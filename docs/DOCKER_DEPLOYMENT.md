# AutoFund AI Docker Deployment Guide

<div align="center">

[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com)
[![Docker Compose](https://img.shields.io/badge/Docker%20Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docs.docker.com/compose)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)](https://kubernetes.io)

**🐳 Complete Containerized Deployment Solutions**

[🚀 Quick Start](#quick-start) • [🏗️ Production Setup](#production-deployment) • [📊 Monitoring](#monitoring) • [🔧 Configuration](#configuration)

</div>

---

## 📋 Table of Contents

- [🏁 Overview](#-overview)
- [🚀 Quick Start](#-quick-start)
- [🏗️ Production Deployment](️-production-deployment)
- [📊 Environment Configurations](#-environment-configurations)
- [🔧 Docker Configuration](#-docker-configuration)
- [📈 Monitoring & Logging](#-monitoring--logging)
- [🔒 Security Setup](#-security-setup)
- [🚨 Troubleshooting](#-troubleshooting)
- [⚡ Performance Optimization](#-performance-optimization)
- [🔄 CI/CD Integration](#-cicd-integration)

---

## 🏁 Overview

This guide provides comprehensive Docker deployment solutions for AutoFund AI, from development to production environments.

### 🐳 Container Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AutoFund AI Stack                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Frontend  │  │   Backend   │  │   Database          │  │
│  │  (Next.js)  │  │  (FastAPI)  │  │  (PostgreSQL)       │  │
│  │   Port 3000 │  │   Port 8000 │  │    Port 5432        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │     Redis   │  │   Nginx     │  │   Monitoring        │  │
│  │ (Cache/Queue)│  │ (Reverse    │  │  (Prometheus/       │  │
│  │   Port 6379 │  │   Proxy)    │  │   Grafana)          │  │
│  │             │  │ Port 80/443 │  │   Ports 9091/3001   │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 📦 Container Images

| Service | Image | Size | Purpose |
|---------|-------|------|---------|
| **Frontend** | `autofund-ai/frontend` | ~50MB | Next.js application |
| **Backend** | `autofund-ai/api` | ~300MB | FastAPI application |
| **Database** | `postgres:15-alpine` | ~150MB | PostgreSQL data store |
| **Cache** | `redis:7-alpine` | ~30MB | Redis cache & queue |
| **Proxy** | `nginx:alpine` | ~40MB | Load balancer & SSL |
| **Monitoring** | `prometheus/grafana` | ~200MB | Metrics & dashboards |

---

## 🚀 Quick Start

### Prerequisites

```bash
# Install Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Verify installation
docker --version      # >= 24.0.0
docker-compose --version # >= 2.0.0
```

### 1. Clone Repository

```bash
git clone https://github.com/autofund-ai/autofund-ai.git
cd autofund-ai
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit with your configuration
nano .env
```

### 3. Development Setup (Simple)

```bash
# Start basic development stack
docker-compose -f docker-compose.simple.yml up -d

# Follow logs
docker-compose -f docker-compose.simple.yml logs -f

# Access applications
# Frontend: http://localhost:3000
# Backend:  http://localhost:8000
# API Docs:  http://localhost:8000/docs
```

### 4. Production Setup (Complete)

```bash
# Start full production stack
docker-compose -f docker-compose.production.yml up -d

# Check service health
docker-compose -f docker-compose.production.yml ps

# Access services
# Application: http://localhost:3000
# API:        http://localhost:8000
# Grafana:    http://localhost:3001 (admin/admin123)
# Redis GUI:  http://localhost:8081
# Flower:     http://localhost:5555
```

### 5. Verify Deployment

```bash
# Test API health
curl http://localhost:8000/health

# Test frontend
curl http://localhost:3000

# Check all containers
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

---

## 🏗️ Production Deployment

### Environment Configurations

#### 1. Development Environment

```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.dev
    volumes:
      - ./:/app
      - /app/node_modules
      - /app/.next
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_API_URL=http://localhost:8000
      - CHOKIDAR_USEPOLLING=true
    ports:
      - "3000:3000"
    command: npm run dev

  backend:
    build:
      context: ./api
      dockerfile: Dockerfile.dev
    volumes:
      - ./api:/app
      - ./uploads:/app/uploads
      - ./outputs:/app/outputs
    environment:
      - DEBUG=true
      - RELOAD=true
      - LOG_LEVEL=DEBUG
      - MOCK_MODE=true  # Use mock AI responses
    ports:
      - "8000:8000"
    command: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Staging Environment

```yaml
# docker-compose.staging.yml
version: '3.8'
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
      target: builder
    environment:
      - NODE_ENV=staging
      - NEXT_PUBLIC_API_URL=https://staging-api.autofund.ai
      - NEXT_PUBLIC_STRIPE_PUBLIC_KEY=${STAGING_STRIPE_KEY}
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 512M
          cpus: '0.5'

  backend:
    build:
      context: .
      dockerfile: Dockerfile.production
    environment:
      - ENVIRONMENT=staging
      - DATABASE_URL=${STAGING_DATABASE_URL}
      - REDIS_URL=${STAGING_REDIS_URL}
      - ANTHROPIC_API_KEY=${STAGING_ANTHROPIC_KEY}
      - MOCK_MODE=false
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 1G
          cpus: '1.0'
```

#### 3. Production Environment

```yaml
# docker-compose.production.yml (excerpt)
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.production
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.autofund.ai
      - NEXT_PUBLIC_STRIPE_PUBLIC_KEY=${STRIPE_PUBLIC_KEY}
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3

  backend:
    build:
      context: .
      dockerfile: Dockerfile.production
    environment:
      - ENVIRONMENT=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 1G
          cpus: '1.0'
        reservations:
          memory: 512M
          cpus: '0.5'
```

### Multi-Stage Dockerfile Production

```dockerfile
# Dockerfile.production (Optimized for production)
FROM node:18-alpine AS base

# Install build dependencies
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# Frontend Build Stage
FROM base AS frontend-builder
COPY . .
RUN npm run build

# Backend Build Stage
FROM python:3.11-slim AS backend-builder

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Copy application code
COPY api/ .
COPY template_iapmei.xlsx ./templates/

# Production Runtime Stage
FROM node:18-alpine AS frontend-runner

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built frontend
COPY --from=frontend-builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=frontend-builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=frontend-builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000
ENV NODE_ENV production
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]

# Backend Runtime Stage
FROM python:3.11-slim AS backend-runner

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create non-root user
RUN useradd --create-home --shell /bin/bash appuser

# Copy Python packages
COPY --from=backend-builder /root/.local /home/appuser/.local
ENV PATH=/home/appuser/.local/bin:$PATH

# Copy application
COPY --from=backend-builder --chown=appuser:appuser /app ./

# Create directories
RUN mkdir -p uploads outputs logs && chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

### Deployment Commands

```bash
#!/bin/bash
# deploy.sh - Complete deployment script

set -e

ENVIRONMENT=${1:-production}
COMPOSE_FILE="docker-compose.${ENVIRONMENT}.yml"

echo "🚀 Deploying AutoFund AI to ${ENVIRONMENT}..."

# Check if compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
    echo "❌ Compose file not found: $COMPOSE_FILE"
    exit 1
fi

# Pull latest images
echo "📦 Pulling latest images..."
docker-compose -f "$COMPOSE_FILE" pull

# Build custom images
echo "🔨 Building application images..."
docker-compose -f "$COMPOSE_FILE" build --parallel

# Stop old containers
echo "🛑 Stopping old containers..."
docker-compose -f "$COMPOSE_FILE" down

# Start new containers
echo "🚀 Starting new containers..."
docker-compose -f "$COMPOSE_FILE" up -d

# Wait for health checks
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Run health check
echo "🔍 Running health check..."
if curl -f http://localhost:8000/health; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
    exit 1
fi

if curl -f http://localhost:3000; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend health check failed"
    exit 1
fi

echo "✅ Deployment successful!"
echo "📊 Services running:"
docker-compose -f "$COMPOSE_FILE" ps
```

---

## 📊 Environment Configurations

### Environment Variables

Create `.env.production`:

```bash
# Database Configuration
DATABASE_URL=postgresql://autofund:password@postgres:5432/autofund_ai
DATABASE_ECHO=false
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=30

# Redis Configuration
REDIS_URL=redis://redis:6379/0
REDIS_MAX_CONNECTIONS=50

# Application Configuration
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=INFO
LOG_FILE=/app/logs/autofund_ai.log

# Security
JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# File Storage
UPLOAD_DIR=/app/uploads
OUTPUT_DIR=/app/outputs
MAX_FILE_SIZE=10485760  # 10MB

# AI Services
ANTHROPIC_API_KEY=sk-ant-xxx
MODEL_EXTRACTION=claude-3-5-sonnet-20241022
MODEL_ANALYSIS=claude-opus-4-5-20251101
MOCK_MODE=false

# Processing Configuration
PROCESSING_TIMEOUT=600
MAX_CONCURRENT_TASKS=10
WORKER_CONCURRENCY=4

# Rate Limiting
ANONYMOUS_RATE_LIMIT=10
USER_RATE_LIMIT=100
PREMIUM_RATE_LIMIT=1000
RATE_LIMIT_WINDOW=3600

# CORS Configuration
CORS_ORIGINS=["https://yourdomain.com", "https://www.yourdomain.com"]

# Monitoring
PROMETHEUS_ENABLED=true
PROMETHEUS_PORT=9090

# Grafana Configuration
GRAFANA_ADMIN_PASSWORD=your-grafana-password

# Nginx Configuration
NGINX_SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
NGINX_SSL_KEY_PATH=/etc/nginx/ssl/key.pem

# External Services
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=noreply@autofund.ai
EMAIL_SMTP_PASS=your-app-password

# Backup Configuration
BACKUP_ENABLED=true
BACKUP_SCHEDULE="0 2 * * *"  # Daily at 2 AM
BACKUP_RETENTION_DAYS=30
S3_BACKUP_BUCKET=autofund-ai-backups
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
```

### Secrets Management

```bash
# Docker Secrets (Production)
echo "your-jwt-secret" | docker secret create jwt_secret -
echo "your-db-password" | docker secret create db_password -
echo "your-api-key" | docker secret create anthropic_api_key -
```

```yaml
# docker-compose.production.yml (with secrets)
services:
  api:
    environment:
      JWT_SECRET_KEY: /run/secrets/jwt_secret
      DATABASE_PASSWORD: /run/secrets/db_password
      ANTHROPIC_API_KEY: /run/secrets/anthropic_api_key
    secrets:
      - jwt_secret
      - db_password
      - anthropic_api_key

secrets:
  jwt_secret:
    external: true
  db_password:
    external: true
  anthropic_api_key:
    external: true
```

---

## 🔧 Docker Configuration

### Docker Compose Best Practices

```yaml
# docker-compose.production.yml
version: '3.8'

# Network configuration
networks:
  autofund_network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
          gateway: 172.20.0.1

# Volume configuration
volumes:
  postgres_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /data/autofund/postgres
  redis_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /data/autofund/redis
  uploads:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /data/autofund/uploads
  logs:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /data/autofund/logs

# Resource limits and constraints
x-common-resources: &common-resources
  restart: unless-stopped
  logging:
    driver: "json-file"
    options:
      max-size: "10m"
      max-file: "3"

x-deploy-resources: &deploy-resources
  resources:
    limits:
      memory: 1G
      cpus: '1.0'
    reservations:
      memory: 512M
      cpus: '0.5'

services:
  api:
    <<: *common-resources
    build:
      context: .
      dockerfile: Dockerfile.production
      target: backend-runner
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    volumes:
      - uploads:/app/uploads
      - outputs:/app/outputs
      - logs:/app/logs
    networks:
      - autofund_network
    deploy:
      <<: *deploy-resources
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
        failure_action: rollback
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
```

### Health Checks

```yaml
# Comprehensive health checks for all services
services:
  postgres:
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U autofund -d autofund_ai"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s

  redis:
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
      start_period: 10s

  api:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/system/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  frontend:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 30s

  nginx:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 5s
      retries: 3
```

---

## 📈 Monitoring & Logging

### Prometheus Configuration

```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'autofund-api'
    static_configs:
      - targets: ['api:8000']
    metrics_path: '/metrics'
    scrape_interval: 15s

  - job_name: 'autofund-frontend'
    static_configs:
      - targets: ['frontend:3000']
    metrics_path: '/api/metrics'
    scrape_interval: 30s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx-exporter:9113']
```

### Grafana Dashboards

```json
{
  "dashboard": {
    "title": "AutoFund AI Overview",
    "panels": [
      {
        "title": "API Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{endpoint}}"
          }
        ]
      },
      {
        "title": "Processing Queue Size",
        "type": "stat",
        "targets": [
          {
            "expr": "redis_queue_size",
            "legendFormat": "Tasks in Queue"
          }
        ]
      },
      {
        "title": "Processing Success Rate",
        "type": "stat",
        "targets": [
          {
            "expr": "rate(processing_completed_total[5m]) / rate(processing_started_total[5m]) * 100",
            "legendFormat": "Success Rate %"
          }
        ]
      }
    ]
  }
}
```

### Centralized Logging

```yaml
# docker-compose.logging.yml
version: '3.8'

services:
  # ELK Stack for centralized logging
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.8.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"

  logstash:
    image: docker.elastic.co/logstash/logstash:8.8.0
    volumes:
      - ./monitoring/logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    ports:
      - "5044:5044"
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.8.0
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch

  # Filebeat for log collection
  filebeat:
    image: docker.elastic.co/beats/filebeat:8.8.0
    user: root
    volumes:
      - ./monitoring/filebeat.yml:/usr/share/filebeat/filebeat.yml:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
    depends_on:
      - logstash

volumes:
  elasticsearch_data:
```

---

## 🔒 Security Setup

### Security Headers Configuration

```nginx
# nginx/nginx.conf
server {
    listen 443 ssl http2;
    server_name autofund.ai www.autofund.ai;

    # SSL Configuration
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'" always;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=upload:10m rate=2r/s;

    # Backend API
    location /api/ {
        proxy_pass http://api:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Apply rate limiting
        limit_req zone=api burst=20 nodelay;
    }

    # File uploads
    location /api/upload {
        proxy_pass http://api:8000;
        limit_req zone=upload burst=5 nodelay;
        client_max_body_size 10M;
    }

    # Frontend
    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Container Security

```yaml
# Security-focused service configuration
services:
  api:
    build:
      context: .
      dockerfile: Dockerfile.production
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
    user: "1001:1001"  # Non-root user
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
    environment:
      - PATH=/usr/local/bin:/usr/bin:/bin
    secrets:
      - jwt_secret
      - anthropic_api_key
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '1.0'
        reservations:
          memory: 512M
          cpus: '0.5'
```

---

## 🚨 Troubleshooting

### Common Issues & Solutions

#### 1. Container Startup Issues

```bash
# Check container logs
docker-compose logs api
docker-compose logs frontend

# Check container status
docker-compose ps

# Inspect container
docker inspect autofund_api

# Enter container for debugging
docker-compose exec api bash
```

#### 2. Database Connection Issues

```bash
# Test database connection from API container
docker-compose exec api python -c "
import psycopg2
try:
    conn = psycopg2.connect('postgresql://autofund:password@postgres:5432/autofund_ai')
    print('✅ Database connection successful')
    conn.close()
except Exception as e:
    print(f'❌ Database connection failed: {e}')
"

# Check database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

#### 3. Redis Connection Issues

```bash
# Test Redis connection
docker-compose exec api python -c "
import redis
try:
    r = redis.Redis(host='redis', port=6379, db=0)
    r.ping()
    print('✅ Redis connection successful')
except Exception as e:
    print(f'❌ Redis connection failed: {e}')
"

# Check Redis logs
docker-compose logs redis
```

#### 4. Performance Issues

```bash
# Monitor resource usage
docker stats

# Check disk space
df -h

# Check memory usage
free -h

# Monitor container logs for errors
docker-compose logs -f --tail=100 api
```

#### 5. Network Issues

```bash
# Test network connectivity
docker-compose exec frontend curl http://api:8000/health
docker-compose exec api curl http://frontend:3000

# Check network configuration
docker network ls
docker network inspect autofund_autofund_network
```

### Health Check Scripts

```bash
#!/bin/bash
# health-check.sh

echo "🔍 AutoFund AI Health Check"

# Check if containers are running
echo "📦 Container Status:"
docker-compose ps

# Check service health endpoints
echo ""
echo "🏥 Service Health:"

# Backend health
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend API: Healthy"
else
    echo "❌ Backend API: Unhealthy"
fi

# Frontend health
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend: Healthy"
else
    echo "❌ Frontend: Unhealthy"
fi

# Database health
if docker-compose exec -T postgres pg_isready -U autofund > /dev/null 2>&1; then
    echo "✅ PostgreSQL: Healthy"
else
    echo "❌ PostgreSQL: Unhealthy"
fi

# Redis health
if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis: Healthy"
else
    echo "❌ Redis: Unhealthy"
fi

# Resource usage
echo ""
echo "📊 Resource Usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Disk usage
echo ""
echo "💾 Disk Usage:"
df -h | grep -E "(Filesystem|/dev/)"

echo ""
echo "🔍 Health check completed!"
```

---

## ⚡ Performance Optimization

### Docker Optimization

```dockerfile
# Multi-stage build with optimization
FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies only when package.json changes
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Production build
FROM base AS builder
COPY . .
RUN npm run build

# Minimal production image
FROM node:18-alpine AS runner

# Remove unnecessary packages
RUN apk del --purge \
    && rm -rf /var/cache/apk/* \
    && rm -rf /tmp/*

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

WORKDIR /app

# Copy only necessary files
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Optimize Node.js
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=512"

USER nextjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
```

### Resource Limits and Scaling

```yaml
# Optimized resource allocation
services:
  api:
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 1G
          cpus: '1.0'
        reservations:
          memory: 512M
          cpus: '0.5'
      update_config:
        parallelism: 1
        delay: 10s
        failure_action: rollback
        monitor: 30s
        max_failure_ratio: 0.3
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
        window: 60s

  # Auto-scaling based on metrics
  autoscaler:
    image: docker/swarmkit:latest
    command: >
      --mode global
      --label com.docker.compose.project=autofund
      --constraint node.role == manager
      --mount type=bind,src=/var/run/docker.sock,dst=/var/run/docker.sock
      --env PROMETHEUS_URL=http://prometheus:9090
      --env SCALE_UP_THRESHOLD=80
      --env SCALE_DOWN_THRESHOLD=30
```

---

## 🔄 CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/docker-deploy.yml
name: Docker Deployment

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3

    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run tests
      run: npm run test:all

    - name: Run E2E tests
      run: npm run test:e2e

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - uses: actions/checkout@v3

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2

    - name: Login to Docker Hub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}

    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v4
      with:
        images: autofund-ai/api,autofund-ai/frontend

    - name: Build and push API image
      uses: docker/build-push-action@v4
      with:
        context: ./api
        file: ./api/Dockerfile.production
        push: true
        tags: ${{ steps.meta.outputs.tags }}-api
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

    - name: Build and push Frontend image
      uses: docker/build-push-action@v4
      with:
        context: .
        file: ./Dockerfile.production
        push: true
        tags: ${{ steps.meta.outputs.tags }}-frontend
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - name: Deploy to production
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /opt/autofund-ai
          docker-compose -f docker-compose.production.yml pull
          docker-compose -f docker-compose.production.yml up -d
          docker system prune -f
```

### Automated Testing Pipeline

```yaml
# .github/workflows/test.yml
name: Test Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3

    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run linting
      run: npm run lint

    - name: Run unit tests
      run: npm run test:coverage

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3

  backend-tests:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3

    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'

    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
        pip install pytest pytest-cov

    - name: Run API tests
      run: pytest --cov=api tests/

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    needs: [frontend-tests, backend-tests]

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
    - uses: actions/checkout@v3

    - name: Start services
      run: |
        docker-compose -f docker-compose.test.yml up -d
        sleep 30

    - name: Run integration tests
      run: |
        pytest tests/integration/

    - name: Cleanup
      run: |
        docker-compose -f docker-compose.test.yml down -v
```

---

<div align="center">

[![Built with ❤️ in Portugal](https://img.shields.io/badge/Built%20with%20❤️%20in%20Portugal-00205B?style=for-the-badge)](https://autofund.ai)

**🐳 Ready for Production Deployment**

[🚀 Quick Deploy](#quick-start) • [📚 Full Documentation](https://docs.autofund.ai) • [💬 Support](https://discord.gg/autofund)

</div>