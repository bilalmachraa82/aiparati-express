# AutoFund AI - Deployment Guide

This guide covers the complete deployment process for AutoFund AI in production, including infrastructure setup, CI/CD pipeline, monitoring, and maintenance.

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Local Development](#local-development)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Production Deployment](#production-deployment)
7. [Monitoring & Logging](#monitoring--logging)
8. [Security Configuration](#security-configuration)
9. [Maintenance & Updates](#maintenance--updates)
10. [Troubleshooting](#troubleshooting)

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel        │    │   Railway       │    │   Monitoring    │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│   (Grafana)     │
│   Next.js       │    │   FastAPI       │    │   Prometheus    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                       ┌────────┴────────┐
                       │                 │
                ┌─────────────┐   ┌─────────────┐
                │ PostgreSQL  │   │   Redis     │
                │ (Database)  │   │  (Cache)    │
                └─────────────┘   └─────────────┘
```

### Components

- **Frontend**: Next.js 16 deployed on Vercel
- **Backend**: FastAPI deployed on Railway
- **Database**: PostgreSQL (Railway managed)
- **Cache**: Redis (Railway managed)
- **Monitoring**: Prometheus + Grafana
- **Storage**: S3-compatible storage for files
- **CI/CD**: GitHub Actions

## 📦 Prerequisites

### Required Tools

```bash
# Core tools
node >= 20.0.0
npm >= 10.0.0
python >= 3.13
docker >= 24.0.0
git >= 2.40.0

# CLI tools
vercel CLI
railway CLI
```

### Install CLI Tools

```bash
# Install Vercel CLI
npm install -g vercel

# Install Railway CLI
npm install -g @railway/cli

# Verify installations
vercel --version
railway --version
```

### Required Accounts

- [GitHub](https://github.com) (for code repository)
- [Vercel](https://vercel.com) (for frontend hosting)
- [Railway](https://railway.app) (for backend hosting)
- [Anthropic](https://console.anthropic.com) (for Claude API)
- [AWS S3](https://aws.amazon.com/s3) (for file storage)
- [Sentry](https://sentry.io) (for error tracking)

## 🔧 Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-org/autofund-ai.git
cd autofund-ai
```

### 2. Environment Variables

Create environment files:

```bash
# Development
cp .env.example .env

# Production
cp .env.production.example .env.production
```

### 3. Backend Configuration

Edit `.env.production`:

```bash
# Database (provided by Railway)
DATABASE_URL=postgresql://autofund:password@postgres.railway.app:5432/autofund

# Redis (provided by Railway)
REDIS_URL=redis://redis.railway.app:6379

# Claude API
ANTHROPIC_API_KEY=your-anthropic-api-key

# Security
JWT_SECRET_KEY=your-generated-jwt-secret-key

# Storage
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_BUCKET_NAME=autofund-files
```

### 4. Frontend Configuration

Edit `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "env": {
    "NEXT_PUBLIC_API_URL": "https://your-backend.railway.app"
  }
}
```

## 🛠️ Local Development

### Start All Services

```bash
# Using Docker Compose (recommended)
docker-compose -f docker-compose.dev.yml up -d

# Or start services individually
npm run dev:frontend
npm run dev:backend
```

### Access Services

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Redis Commander: http://localhost:8081
- PgAdmin: http://localhost:5050
- Grafana: http://localhost:3001
- MinIO Console: http://localhost:9001

### Run Tests

```bash
# Frontend tests
npm run test:unit
npm run test:component
npm run test:e2e

# Backend tests
pytest tests/ -v --cov=api

# Full test suite
npm run test:ci
```

## 🚀 CI/CD Pipeline

### GitHub Actions Workflow

The CI/CD pipeline (`.github/workflows/ci-cd.yml`) includes:

1. **Code Quality Checks**
   - Linting
   - Type checking
   - Security scanning

2. **Testing**
   - Unit tests
   - Integration tests
   - E2E tests
   - Performance tests

3. **Build & Deploy**
   - Docker image building
   - Push to registry
   - Deploy to staging
   - Deploy to production

### Pipeline Triggers

```yaml
# On push to main branch
on:
  push:
    branches: [main]

# On pull requests
  pull_request:
    branches: [main]

# On tags (releases)
  tags:
    - 'v*'
```

## 🌍 Production Deployment

### Automated Deployment (Recommended)

```bash
# Deploy everything with one command
./deploy-complete.sh production

# Or with options
./deploy-complete.sh production false false  # Don't skip tests/build
```

### Manual Deployment

#### 1. Deploy Backend to Railway

```bash
# Using deployment script
./deploy/railway-deploy.sh production

# Or manually
railway login
railway link
railway up
```

#### 2. Deploy Frontend to Vercel

```bash
# Using deployment script
./deploy/vercel-deploy.sh production https://your-backend.railway.app

# Or manually
vercel --prod
```

#### 3. Configure Domain

```bash
# Add custom domain in Vercel dashboard
vercel domains add autofund.ai

# Add CNAME record in DNS
autofund.ai -> cname.vercel-dns.com
```

### Deployment URLs

- Frontend: https://autofund.ai
- Backend API: https://api.autofund.ai
- API Documentation: https://api.autofund.ai/docs
- Monitoring: https://monitor.autofund.ai

## 📊 Monitoring & Logging

### Health Checks

```bash
# Backend health
curl https://api.autofund.ai/api/system/health

# Detailed health
curl https://api.autofund.ai/api/system/health/detailed

# Metrics
curl https://api.autofund.ai/api/system/metrics
```

### Monitoring Stack

1. **Prometheus**
   - URL: https://api.autofund.ai:9090
   - Collects metrics from all services
   - Configured in `monitoring/prometheus.yml`

2. **Grafana**
   - URL: https://monitor.autofund.ai
   - Default credentials: admin / your-password
   - Pre-built dashboards for:
     - System metrics
     - Application performance
     - Error rates
     - User activity

3. **Sentry** (Optional)
   - Error tracking and alerting
   - Configured in `.env.production`

### Key Metrics to Monitor

- **Request Rate**: API requests per second
- **Response Time**: P95, P99 latencies
- **Error Rate**: 4xx and 5xx responses
- **Database Connections**: Active and idle connections
- **Redis Memory**: Memory usage and eviction
- **File Processing**: Success/failure rates
- **Claude API Usage**: Token consumption and costs

### Log Management

Logs are structured in JSON format:

```json
{
  "timestamp": "2025-11-30T17:00:00.000Z",
  "service": "autofund-api",
  "level": "INFO",
  "message": "File processed successfully",
  "correlation_id": "uuid",
  "user_id": "uuid",
  "file_size": 1048576,
  "duration_ms": 1234
}
```

## 🔒 Security Configuration

### SSL/TLS

- Frontend: Managed by Vercel (automatic)
- Backend: Managed by Railway (automatic)
- Custom domains require DNS configuration

### Security Headers

Configured in Nginx:

```nginx
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=63072000";
```

### API Security

- JWT authentication with refresh tokens
- Rate limiting by user tier
- CORS configuration
- Input validation with Pydantic
- SQL injection protection via ORM

### Environment Security

- All secrets in environment variables
- No hardcoded credentials
- Regular secret rotation
- Access logs enabled

## 🔄 Maintenance & Updates

### Database Migrations

```bash
# Create new migration
python database/migrations/migrate.py create "Add new feature"

# Run migrations
python database/migrations/migrate.py migrate

# Check migration status
python database/migrations/migrate.py status
```

### Updating Dependencies

```bash
# Frontend
npm update
npm audit fix

# Backend
pip install --upgrade -r requirements.txt
pip install --upgrade -r requirements_production.txt
```

### Backup Strategy

- **Database**: Daily automatic backups (Railway)
- **Files**: S3 with versioning enabled
- **Configuration**: Git repository
- **Logs**: 30-day retention

### Scaling

1. **Vertical Scaling**
   - Increase Railway plan resources
   - Adjust connection pools

2. **Horizontal Scaling**
   - Multiple Railway instances
   - Load balancer configuration

3. **CDN**
   - Vercel Edge Network
   - Static asset caching

## 🐛 Troubleshooting

### Common Issues

#### 1. Deployment Fails

```bash
# Check build logs
railway logs

# Check Vercel logs
vercel logs

# Verify environment variables
railway variables list
```

#### 2. Database Connection Issues

```bash
# Test database connection
python -c "from api.config import get_settings; print(get_settings().DATABASE_URL)"

# Check connection pool
curl https://api.autofund.ai/api/system/health/detailed
```

#### 3. High Memory Usage

```bash
# Check memory metrics
curl https://api.autofund.ai/api/system/metrics

# Scale resources
railway scale
```

#### 4. Slow API Responses

```bash
# Check response times
curl -w "@curl-format.txt" https://api.autofund.ai/api/system/health

# Review Grafana dashboard
# Check database query performance
```

### Debug Mode

Enable debug logging in development:

```bash
# Set environment variable
export LOG_LEVEL=DEBUG

# Or in .env
LOG_LEVEL=DEBUG
```

### Getting Help

1. Check [GitHub Issues](https://github.com/your-org/autofund-ai/issues)
2. Review [API Documentation](https://api.autofund.ai/docs)
3. Check [Monitoring Dashboard](https://monitor.autofund.ai)
4. Email: support@autofund.ai

## 📝 Best Practices

### Development

1. Always run tests before committing
2. Use feature branches for new features
3. Write meaningful commit messages
4. Update documentation

### Deployment

1. Deploy to staging first
2. Run smoke tests after deployment
3. Monitor metrics closely
4. Have rollback plan ready

### Security

1. Regularly update dependencies
2. Rotate secrets regularly
3. Monitor security advisories
4. Conduct security audits

### Performance

1. Monitor key metrics
2. Optimize database queries
3. Use caching effectively
4. Implement rate limiting

## 🎉 Conclusion

You now have a fully deployed AutoFund AI application with:
- ✅ Production-ready infrastructure
- ✅ CI/CD pipeline
- ✅ Monitoring and alerting
- ✅ Security best practices
- ✅ Scalable architecture

For additional support or questions, refer to the documentation or contact the development team.