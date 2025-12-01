# ADR-001: Choose Technology Stack

## Status

Accepted

## Context

AutoFund AI needs to process Portugal 2030 fund applications by extracting data from IES PDFs, analyzing financial information, and generating IAPMEI Excel templates. The system requires:

- **Frontend**: Modern, responsive UI for file upload and results display
- **Backend**: Robust API for PDF processing and AI integration
- **AI Integration**: Claude AI for data extraction and financial analysis
- **Database**: Persistent storage for user data and processing history
- **File Storage**: Secure storage for PDFs and generated files
- **Deployment**: Scalable, maintainable deployment strategy

The target audience includes Portuguese businesses and consultants who need a reliable, fast, and user-friendly solution.

## Decision

We selected the following technology stack:

### Frontend Stack
- **Next.js 16.0.5**: Modern React framework with App Router
- **TypeScript 5.7**: Type safety and better developer experience
- **Tailwind CSS 4.0**: Utility-first CSS framework
- **Framer Motion 12**: Premium animations and transitions
- **React Query**: Server state management and caching
- **Zod**: Runtime validation and TypeScript schemas

### Backend Stack
- **Python 3.13**: Latest stable Python with modern features
- **FastAPI 0.115**: Modern, fast Python web framework
- **Pydantic v2**: Data validation and settings management
- **Anthropic SDK**: Official Claude AI integration
- **openpyxl**: Excel file manipulation
- **Redis**: Caching, session storage, and task queues
- **PostgreSQL**: Primary database for structured data

### Infrastructure & DevOps
- **Docker & Docker Compose**: Containerization and orchestration
- **GitHub Actions**: CI/CD pipeline
- **Vercel**: Frontend deployment platform
- **Railway/Render**: Backend deployment
- **Prometheus + Grafana**: Monitoring and observability
- **Nginx**: Reverse proxy and load balancing

## Consequences

### Positive Consequences
- **Developer Experience**: TypeScript throughout the stack provides excellent type safety
- **Performance**: Next.js and FastAPI offer excellent performance
- **Scalability**: Containerized architecture allows for easy scaling
- **Maintainability**: Modern frameworks and tools reduce maintenance overhead
- **AI Integration**: Official Claude SDK ensures reliable AI integration
- **Development Speed**: Rich ecosystems of both frameworks accelerate development
- **Community Support**: Both tech stacks have large, active communities

### Negative Consequences
- **Learning Curve**: Team needs expertise in both React/Next.js and Python/FastAPI
- **Build Complexity**: Monorepo management with different technology stacks
- **Resource Requirements**: Running both Node.js and Python environments
- **Integration Overhead**: Additional complexity in frontend-backend communication

### Risks
- **Dependency Management**: Managing dependencies across two ecosystems
- **Team Specialization**: May need developers skilled in both stacks
- **Build Pipeline Complexity**: Separate build processes for frontend and backend

## Alternatives Considered

### Alternative 1: Full-Stack JavaScript (Node.js + React)
**Pros**: Single language stack, unified tooling, easier team alignment
**Cons**: Python's superior AI/ML libraries, less suitable for data processing
**Rejected**: Claude AI integration and data processing would be more difficult

### Alternative 2: Python Full-Stack (Django + React)
**Pros**: Python throughout, excellent Django admin interface
**Cons**: Django is more monolithic, less suited for API-first architecture
**Rejected**: FastAPI's modern async architecture and automatic OpenAPI generation

### Alternative 3: Java/Spring Boot + React
**Pros**: Enterprise-grade, excellent performance, strong typing
**Cons**: More verbose, longer development cycles, heavier runtime
**Rejected**: Slower development pace and larger resource requirements

### Alternative 4: Ruby on Rails + React
**Pros**: Rapid development, excellent conventions
**Cons**: Performance concerns, smaller AI/ML ecosystem
**Rejected**: Python's superior AI integration capabilities

## Implementation Notes

### Development Environment
```bash
# Frontend development
npm install
npm run dev

# Backend development
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python api/main.py

# Docker development
docker-compose up
```

### Integration Points
- **API Communication**: TypeScript types generated from FastAPI OpenAPI spec
- **Authentication**: JWT tokens shared between frontend and backend
- **File Handling**: Multipart uploads with progress tracking
- **Real-time Updates**: WebSocket connections for processing status

### Deployment Strategy
- **Frontend**: Static assets deployed to Vercel CDN
- **Backend**: Containerized API deployed to Railway/Render
- **Database**: Managed PostgreSQL service
- **File Storage**: S3-compatible storage service
- **Monitoring**: Prometheus + Grafana stack

### Security Considerations
- **CORS**: Configured for production domains
- **JWT**: Secure token authentication
- **Input Validation**: Pydantic schemas and Zod validation
- **File Security**: Virus scanning and size limits

---

## Related ADRs

- [ADR-002](./002-ai-integration.md): Claude AI Integration Strategy
- [ADR-003](./003-database-architecture.md): Database Architecture & Schema
- [ADR-004](./004-api-design.md): REST API Design Principles

---

### Implementation Status

✅ **Completed**: Technology stack implemented and deployed to production
✅ **Tested**: All components tested with real IES PDF files
✅ **Documented**: Complete API documentation and component library
✅ **Monitoring**: Full observability stack implemented

### Next Steps

- Monitor performance and identify optimization opportunities
- Evaluate additional AI models and integrations
- Consider mobile app development with React Native
- Explore advanced analytics and reporting features

---

**Decision Made**: 2024-01-15
**Decision By**: Technical Architecture Team
**Review Date**: 2024-01-30