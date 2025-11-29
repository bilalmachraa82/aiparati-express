# AutoFund AI - Arquitetura Escalável para Produção

## 📋 Visão Geral

O AutoFund AI é uma plataforma SaaS para automação de candidaturas a fundos Portugal 2030, processando IES PDF → Análise IA → Excel IAPMEI.

## 🏗️ Arquitetura de Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
├─────────────────────────────────────────────────────────────┤
│  React.js + TypeScript                                     │
│  ├─ Upload Portal (Drag & Drop IES)                        │
│  ├─ Context Input Form                                      │
│  ├─ Real-time Processing Status                            │
│  └─ Results Dashboard                                      │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTPS / WebSocket
┌─────────────────────────▼───────────────────────────────────┐
│                      API GATEWAY                            │
├─────────────────────────────────────────────────────────────┤
│  Kong / AWS API Gateway                                     │
│  ├─ Rate Limiting                                           │
│  ├─ Authentication (JWT)                                    │
│  ├─ Request Validation                                      │
│  └─ Load Balancing                                          │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                     MICROSSERVIÇOS                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Auth      │  │   Queue     │  │   Processing        │  │
│  │   Service   │  │   Service   │  │   Service           │  │
│  │             │  │             │  │                     │  │
│  │ - JWT Mgmt  │  │ - Redis/RQ  │  │ - PDF Ingestion     │  │
│  │ - OAuth2    │  │ - Priority  │  │ - Claude API        │  │
│  │ - RBAC      │  │ - Retry     │  │ - Validation        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                                                             │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                      DATA LAYER                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ PostgreSQL  │  │   S3        │  │   Cache             │  │
│  │             │  │             │  │                     │  │
│  │ - Users     │  │ - PDFs      │  │ - Redis             │  │
│  │ - Analytics │  │ - Results   │  │ - Session Store     │  │
│  │ - Audit     │  │ - Templates │  │ - Rate Limits       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Componentes Detalhados

### 1. Frontend (React + TypeScript)

**Tecnologias:**
- React 18 + TypeScript
- Material-UI ou Ant Design
- React Query (TanStack Query)
- Zustand (State Management)
- React Hook Form

**Componentes Principais:**
```typescript
// FileUpload.tsx
interface FileUploadProps {
  onUpload: (file: File, context: string) => Promise<void>;
  maxFileSize: number;
  acceptedTypes: string[];
}

// ProcessingStatus.tsx
interface ProcessingStatus {
  stage: 'uploading' | 'extracting' | 'analyzing' | 'generating' | 'completed';
  progress: number;
  error?: string;
}

// ResultsDashboard.tsx
interface AnalysisResults {
  financialData: ExtracoesFinanceiras;
  analysis: AnaliseFinanceira;
  excelDownloadUrl: string;
  pdfReportUrl: string;
}
```

### 2. API Gateway (Kong/AWS API Gateway)

**Configuração Essencial:**
```yaml
# kong.yml
services:
  - name: autofund-ai
    url: http://processing-service:8000
    plugins:
      - name: rate-limiting
        config:
          minute: 100
          hour: 1000
      - name: jwt
      - name: request-size-limiting
        config:
          allowed_payload_size: 50

routes:
  - name: upload-route
    service: autofund-ai
    paths:
      - /api/v1/upload
    methods:
      - POST
```

### 3. Microsserviço de Processamento (FastAPI)

**Estrutura:**
```
processing_service/
├── app/
│   ├── api/
│   │   ├── endpoints/
│   │   │   ├── upload.py
│   │   │   ├── analysis.py
│   │   │   └── results.py
│   │   └── dependencies.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── logging.py
│   ├── services/
│   │   ├── claude_service.py
│   │   ├── pdf_processor.py
│   │   └── excel_generator.py
│   └── models/
│       ├── schemas.py
│       └── database.py
```

**Endpoints Principais:**
```python
from fastapi import FastAPI, UploadFile, Depends
from app.services.claude_service import ClaudeService
from app.services.excel_generator import ExcelGenerator

@app.post("/api/v1/ies/upload")
async def upload_ies(
    file: UploadFile,
    context: str,
    user_id: str = Depends(get_current_user)
):
    """Upload IES PDF para processamento assíncrono"""
    pass

@app.get("/api/v1/ies/{job_id}/status")
async def get_processing_status(job_id: str):
    """Verificar status do processamento"""
    pass

@app.get("/api/v1/ies/{job_id}/results")
async def get_results(job_id: str):
    """Download dos resultados (Excel, PDF)"""
    pass
```

### 4. Serviço de Fila (Redis + RQ)

**Configuração de Workers:**
```python
# worker.py
import redis
from rq import Worker, Queue, Connection

redis_conn = redis.Redis(host='redis', port=6379, db=0)

q = Queue('high_priority', connection=redis_conn)
q_low = Queue('low_priority', connection=redis_conn)

def process_ies_pdf(job_id: str, pdf_path: str, context: str):
    """Worker principal de processamento"""
    try:
        # 1. Extrair dados
        extractor = DataExtractor(ANTHROPIC_API_KEY)
        raw_data = extractor.extract_from_pdf(pdf_path)

        # 2. Validar
        financial_data = ExtracoesFinanceiras(**raw_data)

        # 3. Analisar
        analyzer = FinancialAnalyzer(ANTHROPIC_API_KEY)
        analysis = analyzer.generate_analysis(financial_data, context)

        # 4. Gerar Excel
        excel_gen = ExcelGenerator()
        excel_path = excel_gen.generate(financial_data, analysis)

        # 5. Salvar resultados
        save_results(job_id, financial_data, analysis, excel_path)

    except Exception as e:
        handle_error(job_id, e)

# Start workers
if __name__ == '__main__':
    with Connection(redis_conn):
        worker = Worker([q, q_low])
        worker.work()
```

### 5. Banco de Dados (PostgreSQL)

**Schema Principal:**
```sql
-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    subscription_tier VARCHAR(50) DEFAULT 'free'
);

-- IES Processing Jobs
CREATE TABLE ies_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    company_nif VARCHAR(9) NOT NULL,
    original_filename VARCHAR(255),
    s3_pdf_key VARCHAR(255),
    s3_result_key VARCHAR(255),
    status job_status DEFAULT 'pending',
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- Results
CREATE TABLE financial_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES ies_jobs(id),
    financial_data JSONB NOT NULL,
    analysis_data JSONB NOT NULL,
    risk_level VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Audit Log
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100),
    resource_type VARCHAR(50),
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Types
CREATE TYPE job_status AS ENUM (
    'pending',
    'processing',
    'extracting',
    'analyzing',
    'generating',
    'completed',
    'failed'
);

-- Indexes
CREATE INDEX idx_ies_jobs_user_id ON ies_jobs(user_id);
CREATE INDEX idx_ies_jobs_status ON ies_jobs(status);
CREATE INDEX idx_ies_jobs_created_at ON ies_jobs(created_at DESC);
CREATE INDEX idx_financial_analyses_risk_level ON financial_analyses(risk_level);
```

## 🚀 Deploy em Produção

### 1. Kubernetes (EKS/GKE)

**Namespace & Config:**
```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: autofund-ai

---
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: autofund-config
  namespace: autofund-ai
data:
  ANTHROPIC_API_URL: "https://api.anthropic.com"
  POSTGRES_HOST: "postgres-service"
  REDIS_HOST: "redis-service"
  LOG_LEVEL: "INFO"
```

**Deployment da API:**
```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: processing-api
  namespace: autofund-ai
spec:
  replicas: 3
  selector:
    matchLabels:
      app: processing-api
  template:
    metadata:
      labels:
        app: processing-api
    spec:
      containers:
      - name: api
        image: autofund-ai/processing:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: autofund-secrets
              key: database-url
        - name: ANTHROPIC_API_KEY
          valueFrom:
            secretKeyRef:
              name: autofund-secrets
              key: anthropic-api-key
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
```

**Horizontal Pod Autoscaler:**
```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: processing-api-hpa
  namespace: autofund-ai
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: processing-api
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### 2. Workers Escaláveis

**Kubernetes CronJob para Workers:**
```yaml
# worker-deployment.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: ies-processor-worker
  namespace: autofund-ai
spec:
  parallelism: 5
  completions: 5
  template:
    spec:
      containers:
      - name: worker
        image: autofund-ai/worker:latest
        env:
        - name: REDIS_URL
          value: "redis://redis-service:6379"
        - name: ANTHROPIC_API_KEY
          valueFrom:
            secretKeyRef:
              name: autofund-secrets
              key: anthropic-api-key
        resources:
          requests:
            memory: "1Gi"
            cpu: "1000m"
          limits:
            memory: "2Gi"
            cpu: "2000m"
      restartPolicy: OnFailure
```

## 📊 Monitoramento & Observabilidade

### 1. Prometheus + Grafana

**Métricas Essenciais:**
```python
# metrics.py
from prometheus_client import Counter, Histogram, Gauge

# Contadores
ies_processed_total = Counter(
    'ies_processed_total',
    'Total IES files processed',
    ['status', 'user_tier']
)

# Histogramas
processing_duration = Histogram(
    'processing_duration_seconds',
    'Time spent processing IES',
    buckets=[0.1, 0.5, 1, 2, 5, 10, 30, 60, 120]
)

# Gauges
active_jobs = Gauge(
    'active_processing_jobs',
    'Number of active processing jobs'
)
```

**Dashboard Grafana:**
- Taxa de sucesso/falha de processamento
- Tempo médio de processamento por etapa
- Distribuição de níveis de risco
- Uso da API Anthropic (rate limits, custos)
- Performance dos workers

### 2. Logging Estruturado

**Configuração com ELK Stack:**
```python
# logging_config.py
import structlog

structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()
```

## 🔒 Segurança & Compliance

### 1. RGPD Compliance

**Medidas Implementadas:**
- Criptografia AES-256 em repouso (S3, PostgreSQL)
- TLS 1.3 em trânsito
- Anonimização de dados para analytics
- Direito ao esquecimento (endpoint DELETE)
- Consentimento explícito no upload
- Audit trail completo

### 2. Autenticação & Autorização

**JWT com Claims Customizadas:**
```python
# security.py
from jose import jwt

def create_access_token(user_id: str, tier: str):
    expires = datetime.utcnow() + timedelta(hours=24)
    claims = {
        "sub": user_id,
        "tier": tier,
        "permissions": get_permissions(tier),
        "exp": expires
    }
    return jwt.encode(claims, SECRET_KEY, algorithm="HS256")

def get_current_user(token: str):
    payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    return User.get(payload["sub"])
```

**Rate Limiting por Tier:**
- Free: 5 uploads/mês
- Professional: 50 uploads/mês
- Enterprise: Ilimitado

## 💰 Modelo de Preços

### 1. Estrutura de Preços

| Tier | Preço | Uploads/Mês | Features |
|------|-------|------------|----------|
| Free | €0 | 5 | - IES básico<br>- Relatório simples<br>- Suporte email |
| Professional | €49/mês | 50 | - Tudo Free<br>- Análise avançada<br>- Excel personalizado<br>- API access<br>- Prioridade |
| Enterprise | €199/mês | Ilimitado | - Tudo Pro<br>- SLA 99.9%<br>- White-label<br>- Integração ERP<br>- Consultor dedicado |

### 2. Métricas de Monetização

- **ARPU**: Target €75/mês (mix Professional/Enterprise)
- **LTV**: €1.800 (2 anos avg retention)
- **CAC**: €150 (marketing + sales)
- **MRR Break-even**: 1.000 usuários

## 🎯 Roadmap de Implementação

### Fase 1 - MVP (2 meses)
- [x] Core pipeline (PDF → JSON → Excel)
- [x] Validação de dados financeiros
- [x] Análise de risco básica
- [ ] Web UI mínima
- [ ] Sistema de autenticação
- [ ] Processamento batch (1 IES por vez)

### Fase 2 - Beta (4 meses)
- [ ] Processamento assíncrono com filas
- [ ] Dashboard de resultados
- [ ] Múltiplos templates IAPMEI
- [ ] API REST pública
- [ ] Integração Stripe
- [ ] Sistema de notificações

### Fase 3 - Scale (6 meses)
- [ ] Deploy em Kubernetes
- [ ] Auto-scaling automático
- [ ] Analytics avançados
- [ ] Benchmarking sectorial
- [ ] Integração ERPs (PHC, Primavera)
- [ ] Mobile app

### Fase 4 - Enterprise (9+ meses)
- [ ] On-premise deployment
- [ ] White-label solutions
- [ ] API avançada com webhooks
- [ ] Machine Learning custom models
- [ ] Multi-country expansion
- [ ] B2B partnerships

## 🚦 KPIs de Sucesso

### Técnicos
- **Uptime**: 99.9%
- **Processing Time**: < 5 min por IES
- **API Response**: < 200ms (P95)
- **Error Rate**: < 0.1%

### Negócio
- **Monthly Active Users**: Target 5.000 (mês 12)
- **Processing Success Rate**: > 98%
- **Customer Satisfaction**: NPS > 50
- **Revenue Growth**: 20% MoM

### Produto
- **Feature Adoption**: > 60% para features principais
- **User Retention**: > 80% (mês 2)
- **Support Tickets**: < 5% de MAU
- **Documentation Coverage**: 100% API

## 🌐 Considerações Finais

### Riscos Mitigados
- **Dependência Anthropic**: Multi-cloud strategy (Azure OpenAI backup)
- **Performance**: Arquitetura serverless + cache agressivo
- **Escalabilidade**: Horizontal scaling com Kubernetes
- **Segurança**: Defense in depth, security by design

### Diferenciais Competitivos
1. **Especialização Portugal 2030**: Conhecimento domínio específico
2. **Integração IAPMEI**: Templates oficiais sempre atualizados
3. **Accuracy**: Validação cruzada + fallback humano
4. **Speed**: Pipeline otimizado para sub-5min
5. **Ecosystem**: Plug-ins para ERPs portugueses

### Próximos Passos
1. **Validação**: Testar com 100 empresas reais
2. **Legal**: DPA com Anthropic para GDPR
3. **Funding**: Seed round €500k para scale
4. **Team**: Contratar frontend dev + DevOps
5. **Launch**: Beta fechada Q2 2024