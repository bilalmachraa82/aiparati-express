# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AutoFund AI is a Python-based SaaS platform that automates Portugal 2030 fund applications by:
1. Extracting financial data from IES (Informação Empresarial Simplificada) PDFs
2. Validating accounting equations (Ativo = Passivo + Capital Próprio)
3. Analyzing financial risks using Claude AI models
4. Generating filled IAPMEI Excel templates automatically

## Core Architecture

The system follows a **pipeline architecture** with these main components:

- **Data Extraction**: Uses Claude 3.5 Sonnet via Files API for high-accuracy PDF data extraction
- **Data Validation**: Pydantic models ensure data integrity and Portuguese NIF format validation
- **Financial Analysis**: Claude Opus 4.5 generates risk assessment and financial recommendations
- **Excel Generation**: openpyxl library fills IAPMEI templates by intelligent label matching (not cell coordinates)

## Key Development Commands

```bash
# Setup environment
pip install -r requirements.txt
cp .env.example .env  # Then edit .env with your ANTHROPIC_API_KEY

# Run offline tests (no API calls)
python3 test_offline.py

# Process a real IES PDF
python3 autofund_ai_poc_v3.py

# Create new IAPMEI Excel template for testing
python3 create_template.py

# View logs
tail -f autofund_ai.log
```

## Important Development Patterns

### 1. Environment Configuration
Always use `.env` file for sensitive data:
- `ANTHROPIC_API_KEY`: Required for Claude API access
- `MODEL_EXTRACTION`: claude-3-5-sonnet-20241022 (default)
- `MODEL_ANALYSIS`: claude-opus-4-20250514 (default)

### 2. Data Models (Pydantic)
All financial data must conform to `ExtracoesFinanceiras` model in `autofund_ai_poc_v3.py:59-150`. Key validations:
- Portuguese NIF format (9 digits)
- Non-negative financial values where appropriate
- Accounting equation validation

### 3. Excel Template Handling
- Templates are filled by **label matching**, not cell coordinates
- Handle merged cells properly with `openpyxl.utils.cell`
- Always check cell type before writing to avoid errors
- Output files go to `outputs/` directory

### 4. Error Handling
- Comprehensive logging with timestamps and file output
- Graceful fallback when Claude API fails
- Validation errors must include specific field information

## File Structure Context

```
ies/
├── autofund_ai_poc_v3.py    # Main pipeline (1500+ lines)
├── test_offline.py         # Test suite without API dependencies
├── create_template.py      # Excel template generator
├── requirements.txt        # Python dependencies
├── .env.example           # Environment template
├── ARQUITETURA_PRODUCAO.md # Production architecture guide
├── README.md              # User-facing documentation
├── IES - 2023.pdf         # Sample IES for testing
├── template_iapmei.xlsx   # IAPMEI Excel template
└── outputs/               # Generated results
```

## Testing Strategy

- **Offline Tests**: Run `test_offline.py` to validate logic without API calls
- **Real PDF Tests**: Use the provided `IES - 2023.pdf` for end-to-end testing
- **Template Validation**: Test Excel generation with different financial scenarios

## Production Architecture

See `ARQUITETURA_PRODUCAO.md` for complete production deployment plans including:
- FastAPI microservices architecture
- Kubernetes deployment configurations
- PostgreSQL schema definitions
- Redis queue management
- Prometheus/Grafana monitoring
- GDPR compliance measures

## Key Business Logic

### Financial Calculations
- **EBITDA**: Calculated automatically from operating results + depreciation
- **Autonomia Financeira**: Capital Próprio / Total Ativo
- **Liquidez Geral**: Ativo Corrente / Passivo Corrente
- **Margem EBITDA**: EBITDA / Volume de Negócios

### Risk Assessment Levels
- BAIXO: Autonomia > 50%, Liquidez > 1.5, Margem EBITDA > 10%
- MÉDIO: Autonomia 30-50%, Liquidez 1.2-1.5, Margem 5-10%
- ALTO: Autonomia 20-30%, Liquidez 1-1.2, Margem 0-5%
- CRÍTICO: Below threshold values

## MCP Integration

The project includes Model Context Protocol servers in `.mcp.json`:
- Context7 for enhanced context management
- Playwright for browser automation (future UI testing)
- GitHub for repository operations
- Browser server for web scraping capabilities

## Development Notes

- The codebase is Portuguese-focused (PT business context, IAPMEI templates)
- All financial values are in Euros (€)
- Logging includes Portuguese business terms
- Error messages should be user-friendly for Portuguese consultants
- The system targets a 60x improvement in processing time (2 hours → 2 minutes)