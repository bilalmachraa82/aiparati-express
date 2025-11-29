# AutoFund AI - Web Application

## 🚀 FastAPI Web Interface

Versão web do AutoFund AI com interface intuitiva para automação de candidaturas a fundos Portugal 2030.

## 📋 Features Implementadas

### ✅ Core Features
- **Upload de PDF IES**: Drag & drop interface com validação
- **Processamento em Tempo Real**: WebSocket updates para progresso
- **Análise Financeira**: Claude Opus com prompts Portugal 2030 específicos
- **Geração Excel**: Templates IAPMEI preenchidos automaticamente
- **Dashboard de Resultados**: Métricas e recomendações detalhadas

### ✅ Technical Features
- **FastAPI**: Backend async de alta performance
- **WebSocket**: Comunicação bidirecional real-time
- **Docker**: Containerização pronta para produção
- **PostgreSQL + Redis**: Base de dados e cache
- **Celery Workers**: Processamento assíncrono

## 🛠️ Setup e Execução

### Pré-requisitos
```bash
# Python 3.11+
# Docker & Docker Compose
# PostgreSQL (se não usar Docker)
```

### Execução com Docker (Recomendado)
```bash
# 1. Copiar variáveis de ambiente
cp .env.example .env
# Editar .env com ANTHROPIC_API_KEY

# 2. Build e start
docker-compose up --build

# 3. Acessar aplicação
# http://localhost:8000
```

### Execução Local
```bash
# 1. Instalar dependências
pip install -r requirements_web.txt

# 2. Setup base de dados
# (Configurar DATABASE_URL no .env)

# 3. Executar migrations
alembic upgrade head

# 4. Iniciar Redis (separadamente)
redis-server

# 5. Iniciar worker
celery -A app.worker worker --loglevel=info

# 6. Iniciar API
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 📁 Estrutura do Projeto

```
app/
├── main.py                 # FastAPI application entry point
├── core/
│   ├── config.py          # Settings e configurações
│   └── security.py        # JWT authentication
├── api/
│   └── endpoints/
│       ├── auth.py        # Autenticação
│       ├── upload.py      # Upload e processamento
│       ├── analysis.py    # Análise financeira
│       └── results.py     # Download de resultados
├── services/
│   ├── claude_service.py  # Integração Claude AI
│   └── pdf_processor.py   # Processamento PDFs
├── models/
│   └── schemas.py         # Pydantic models
├── static/
│   ├── css/style.css      # Estilos
│   └── js/app.js          # Frontend JavaScript
└── templates/
    └── index.html         # Single-page app
```

## 🔌 API Endpoints

### Autenticação
- `POST /api/v1/auth/login` - Login de utilizador
- `POST /api/v1/auth/register` - Registo de novo utilizador

### Upload e Processamento
- `POST /api/v1/upload/ies` - Upload IES PDF
- `GET /api/v1/upload/status/{job_id}` - Status do processamento
- `GET /api/v1/analysis/{job_id}` - Resultados da análise

### Downloads
- `GET /api/v1/results/{job_id}/excel` - Download Excel IAPMEI
- `GET /api/v1/results/{job_id}/pdf` - Download relatório PDF

### WebSocket
- `WS /ws/{job_id}` - Updates em tempo real

## 🧊 Docker Deployment

### Production Environment
```bash
# Build para produção
docker build -t autofund-ai:latest .

# Compose produção
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables
```bash
ANTHROPIC_API_KEY=sk-ant-xxx
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379
SECRET_KEY=your-secret-key
ENVIRONMENT=production
SENTRY_DSN=your-sentry-dsn
```

## 📊 Métricas e Monitorização

### Health Check
```bash
curl http://localhost:8000/health
```

### Prometheus Metrics
Disponíveis em `/metrics`:
- `autofund_uploads_total` - Total de uploads
- `autofund_processing_duration_seconds` - Tempo de processamento
- `autofund_active_jobs` - Jobs ativos

### Logs
```bash
# Ver logs Docker
docker-compose logs -f autofund-ai

# Ver logs worker
docker-compose logs -f worker
```

## 🔒 Segurança

- JWT tokens para autenticação
- Rate limiting configurável
- CORS configurado para produção
- Upload validation e sanitização
- HTTPS recomendado em produção

## 🚀 Performance

- Async processing com Celery
- Redis cache para respostas rápidas
- File compression para uploads
- CDN recomendado para static assets

## 📈 Escalabilidade

### Horizontal Scaling
```yaml
# docker-compose.scale.yml
services:
  autofund-ai:
    scale: 3
  worker:
    scale: 5
```

### Kubernetes
Ver `ARQUITETURA_PRODUCAO.md` para configuração Kubernetes completa.

## 🧪 Testes

```bash
# Testes unitários
pytest app/tests/

# Testes de integração
pytest app/tests/integration/

# Coverage
pytest --cov=app tests/
```

## 🎯 Roadmap Web App

### Phase 1 - MVP (Current)
- [x] Upload e processamento PDF
- [x] Interface web básica
- [x] WebSocket updates
- [x] Download resultados

### Phase 2 - Enhancement
- [ ] Autenticação completa
- [ ] Dashboard de histórico
- [ ] Batch processing
- [ ] Export múltiplos formatos

### Phase 3 - Enterprise
- [ ] Multi-tenant
- [ ] RBAC permissions
- [ ] API rate limiting por plano
- [ ] White-label customization

## 📞 Suporte

- **Email**: hello@autofund.ai
- **Docs**: [AutoFund AI Documentation](https://docs.autofund.ai)
- **Status**: [status.autofund.ai](https://status.autofund.ai)

---

## 🏁 Quick Start

```bash
# 1. Clone
git clone https://github.com/autofund-ai/autofund-web.git
cd autofund-web

# 2. Configure
cp .env.example .env
# Edit .env

# 3. Run
docker-compose up

# 4. Use
open http://localhost:8000
```

**Transforme 2 horas em 2 minutos com AutoFund AI!** 🚀