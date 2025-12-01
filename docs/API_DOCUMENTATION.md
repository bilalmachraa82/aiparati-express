# AutoFund AI API Documentation

<div align="center">

[![API Version](https://img.shields.io/badge/Version-1.0.0-blue.svg)](https://api.autofund.ai)
[![Authentication](https://img.shields.io/badge/Auth-JWT-orange.svg)](#authentication)
[![Base URL](https://img.shields.io/badge/Base_URL-https://api.autofund.ai-green.svg)](#base-url)
[![Content Type](https://img.shields.io/badge/Content-Type-application%2Fjson-red.svg)](#content-types)

**🚀 Complete REST API for Portugal 2030 Fund Application Automation**

[▶️ Try API](https://api.autofund.ai/docs) • [🔑 Get API Key](https://autofund.ai/register) • [📞 Support](https://autofund.ai/support)

</div>

---

## 📋 Table of Contents

- [🏁 Overview](#-overview)
- [🔑 Authentication](#-authentication)
- [🌐 Base URL & Endpoints](#-base-url--endpoints)
- [📤 Core Endpoints](#-core-endpoints)
- [🔍 Task Management](#-task-management)
- [📊 Data Models](#-data-models)
- [⚡ Rate Limits](#-rate-limits)
- [🔒 Security](#-security)
- [🧪 Testing](#-testing)
- [🚨 Error Codes](#-error-codes)
- [📚 Examples](#-examples)

---

## 🏁 Overview

The AutoFund AI API enables programmatic access to Portugal 2030 fund application processing, including:

- **📄 IES PDF Processing** with Claude AI extraction
- **📊 Financial Analysis** and risk assessment
- **📋 IAPMEI Template Generation** (Excel format)
- **🔄 Real-time Task Tracking**
- **📈 Comprehensive Analytics**

### Key Features
- ⚡ **Fast Processing**: <2 minutes per IES
- 🤖 **AI-Powered**: Claude 3.5/Opus 4.1 integration
- 🔒 **Enterprise Security**: JWT authentication
- 📊 **Rich Data**: Complete financial analysis
- 🌐 **RESTful**: Standard HTTP methods
- 📝 **Documented**: OpenAPI 3.0 specification

---

## 🔑 Authentication

### JWT Bearer Authentication

All API endpoints require authentication using JWT Bearer tokens.

#### Getting Your API Key

1. **Register** at [autofund.ai/register](https://autofund.ai/register)
2. **Generate** API key in dashboard
3. **Include** token in Authorization header

#### Authorization Header
```http
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

#### Token Format
```json
{
  "sub": "user_id",
  "tier": "professional",
  "permissions": ["upload", "analyze", "download"],
  "exp": 1735689600,
  "iat": 1735603200
}
```

### Authentication Examples

#### cURL
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     https://api.autofund.ai/health
```

#### JavaScript
```javascript
const token = 'YOUR_JWT_TOKEN';
const response = await fetch('https://api.autofund.ai/health', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

#### Python
```python
import requests

headers = {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
}
response = requests.get('https://api.autofund.ai/health', headers=headers)
```

---

## 🌐 Base URL & Endpoints

### Environment URLs

| Environment | Base URL | Description |
|-------------|----------|-------------|
| **Production** | `https://api.autofund.ai` | Live production API |
| **Staging** | `https://staging-api.autofund.ai` | Staging environment |
| **Development** | `http://localhost:8000` | Local development |

### API Endpoints Overview

```
POST /api/upload              # Upload IES PDF for processing
GET  /api/status/{task_id}    # Get processing status
GET  /api/result/{task_id}    # Get complete analysis result
GET  /api/download/{task_id}/{file_type}  # Download generated files
GET  /api/tasks               # List all user tasks
DELETE /api/tasks/{task_id}   # Delete task and files
GET  /health                  # API health check
GET  /                        # Root endpoint (service info)
```

---

## 📤 Core Endpoints

### Upload IES PDF

Upload an IES PDF file for automated processing and analysis.

#### Endpoint
```http
POST /api/upload
```

#### Content Type
`multipart/form-data`

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | ✅ | IES PDF file (max 10MB) |
| `nif` | String | ✅ | Portuguese NIF (9 digits) |
| `ano_exercicio` | String | ✅ | Exercise year (e.g., "2023") |
| `designacao_social` | String | ✅ | Company legal name |
| `email` | String | ✅ | Contact email |
| `context` | String | ❌ | Additional context (optional) |

#### Request Example

```bash
curl -X POST "https://api.autofund.ai/api/upload" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@IES-2023.pdf" \
  -F "nif=508195673" \
  -F "ano_exercicio=2023" \
  -F "designacao_social=SUA EMPRESA LDA" \
  -F "email=contato@empresa.pt" \
  -F "context=Candidatura Portugal 2030 para expansão internacional"
```

#### Response (201 Created)

```json
{
  "task_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "processing",
  "message": "Ficheiro IES-2023.pdf recebido. A processar..."
}
```

#### Validation Rules

- **File**: Must be PDF format, max 10MB
- **NIF**: 9 digits, Portuguese format validation
- **Email**: Valid email format
- **Ano Exercicio**: 4-digit year (2020-2024)

### Get Processing Status

Check the status of an IES processing task.

#### Endpoint
```http
GET /api/status/{task_id}
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `task_id` | UUID | ✅ | Task identifier from upload response |

#### Request Example

```bash
curl -X GET "https://api.autofund.ai/api/status/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Response Examples

**Processing Status (200 OK)**
```json
{
  "task_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "analyzing",
  "created_at": "2024-01-15T10:30:00.000Z"
}
```

**Completed Status (200 OK)**
```json
{
  "task_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "completed",
  "created_at": "2024-01-15T10:30:00.000Z",
  "completed_at": "2024-01-15T10:32:15.000Z",
  "result": {
    "metadata": {
      "nif": "508195673",
      "ano_exercicio": "2023",
      "designacao_social": "SUA EMPRESA LDA",
      "data_processamento": "2024-01-15T10:32:15.000Z"
    },
    "dados_financeiros": {
      "volume_negocios": 1500000.00,
      "ebitda": 225000.00,
      "autonomia_financeira": 0.42,
      "liquidez_geral": 1.6,
      "margem_ebitda": 0.15
    },
    "analise": {
      "rating": "MÉDIO",
      "recomendacoes": [
        "Melhorar autonomia financeira para >50%",
        "Aumentar margem EBITDA para >20%",
        "Reduzir dívida de curto prazo"
      ]
    },
    "download_urls": {
      "excel": "/api/download/123e4567-e89b-12d3-a456-426614174000/excel",
      "json": "/api/download/123e4567-e89b-12d3-a456-426614174000/json"
    }
  }
}
```

**Error Status (200 OK)**
```json
{
  "task_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "error",
  "created_at": "2024-01-15T10:30:00.000Z",
  "completed_at": "2024-01-15T10:31:45.000Z",
  "error": "PDF extraction failed: Invalid document format"
}
```

### Get Complete Analysis Result

Retrieve the complete financial analysis result for a completed task.

#### Endpoint
```http
GET /api/result/{task_id}
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `task_id` | UUID | ✅ | Task identifier |

#### Request Example

```bash
curl -X GET "https://api.autofund.ai/api/result/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Response (200 OK)

```json
{
  "metadata": {
    "nif": "508195673",
    "ano_exercicio": "2023",
    "designacao_social": "SUA EMPRESA LDA",
    "email": "contato@empresa.pt",
    "data_processamento": "2024-01-15T10:32:15.000Z"
  },
  "dados_financeiros": {
    "volume_negocios": 1500000.00,
    "ebitda": 225000.00,
    "autonomia_financeira": 0.42,
    "liquidez_geral": 1.6,
    "margem_ebitda": 0.15,
    "resultado_liquido": 125000.00,
    "ativo_total": 2750000.00,
    "passivo_total": 2750000.00,
    "capital_proprio": 1155000.00
  },
  "analise": {
    "rating": "MÉDIO",
    "pontuacao": 65,
    "forcas": [
      "Volume de negócios estável",
      "Margem EBITDA positiva",
      "Liquidez geral adequada"
    ],
    "fracasos": [
      "Autonomia financeira abaixo do ideal",
      "Elevado endividamento",
      "Rentabilidade moderada"
    ],
    "recomendacoes": [
      {
        "area": "Estrutura Capital",
        "recomendacao": "Aumentar capital próprio",
        "impacto": "Melhora autonomia financeira",
        "prioridade": "Alta"
      },
      {
        "area": "Operações",
        "recomendacao": "Otimizar custos operacionais",
        "impacto": "Aumenta margem EBITDA",
        "prioridade": "Média"
      }
    ],
    "indicadores_setor": {
      "margem_ebitda_setor": 0.18,
      "autonomia_financeira_setor": 0.55,
      "liquidez_setor": 1.8
    }
  },
  "download_urls": {
    "excel": "/api/download/123e4567-e89b-12d3-a456-426614174000/excel",
    "json": "/api/download/123e4567-e89b-12d3-a456-426614174000/json"
  }
}
```

### Download Generated Files

Download the generated Excel or JSON files for a completed task.

#### Endpoint
```http
GET /api/download/{task_id}/{file_type}
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `task_id` | UUID | ✅ | Task identifier |
| `file_type` | String | ✅ | File type: `excel` or `json` |

#### Request Examples

**Download Excel File**
```bash
curl -X GET "https://api.autofund.ai/api/download/123e4567-e89b-12d3-a456-426614174000/excel" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -o autofund_analysis.xlsx
```

**Download JSON Report**
```bash
curl -X GET "https://api.autofund.ai/api/download/123e4567-e89b-12d3-a456-426614174000/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -o autofund_analysis.json
```

#### Response

- **Content-Type**: `application/octet-stream`
- **Content-Disposition**: `attachment; filename="autofund_508195673.xlsx"`
- **File**: Binary file content

---

## 🔍 Task Management

### List All Tasks

Retrieve all tasks for the authenticated user with pagination support.

#### Endpoint
```http
GET /api/tasks
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | Integer | ❌ | 1 | Page number (1-based) |
| `limit` | Integer | ❌ | 20 | Items per page (max 100) |
| `status` | String | ❌ | - | Filter by status (`all`, `completed`, `processing`, `error`) |
| `sort` | String | ❌ | `created_at_desc` | Sort order |

#### Request Example

```bash
curl -X GET "https://api.autofund.ai/api/tasks?page=1&limit=10&status=completed" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Response (200 OK)

```json
{
  "tasks": [
    {
      "task_id": "123e4567-e89b-12d3-a456-426614174000",
      "status": "completed",
      "created_at": "2024-01-15T10:30:00.000Z",
      "completed_at": "2024-01-15T10:32:15.000Z",
      "nif": "508195673",
      "ano_exercicio": "2023",
      "rating": "MÉDIO"
    },
    {
      "task_id": "456e7890-e89b-12d3-a456-426614174111",
      "status": "processing",
      "created_at": "2024-01-15T11:15:00.000Z",
      "nif": "123456789",
      "ano_exercicio": "2023"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3,
    "has_next": true,
    "has_prev": false
  }
}
```

### Delete Task

Delete a task and all associated files.

#### Endpoint
```http
DELETE /api/tasks/{task_id}
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `task_id` | UUID | ✅ | Task identifier |

#### Request Example

```bash
curl -X DELETE "https://api.autofund.ai/api/tasks/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Response (200 OK)

```json
{
  "message": "Task eliminada com sucesso",
  "task_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

---

## 📊 Data Models

### TaskStatus

Status values for processing tasks:

| Status | Description |
|--------|-------------|
| `uploaded` | File uploaded successfully |
| `extracting` | Extracting data from PDF |
| `analyzing` | Performing financial analysis |
| `generating` | Generating Excel/JSON files |
| `completed` | Processing completed successfully |
| `error` | Processing failed |

### RiskRating

Financial risk assessment levels:

| Rating | Score Range | Description |
|--------|-------------|-------------|
| `BAIXO` | 80-100 | Excellent financial health |
| `MÉDIO` | 60-79 | Good financial health |
| `ALTO` | 40-59 | Moderate risk factors |
| `CRÍTICO` | 0-39 | High risk, immediate attention needed |

### FinancialIndicators

Key financial metrics calculated from IES data:

```json
{
  "volume_negocios": 1500000.00,      // Total revenue (€)
  "ebitda": 225000.00,               // EBITDA (€)
  "autonomia_financeira": 0.42,      // Capital próprio / Ativo total
  "liquidez_geral": 1.6,             // Ativo corrente / Passivo corrente
  "margem_ebitda": 0.15,             // EBITDA / Volume negócios
  "resultado_liquido": 125000.00,    // Net profit (€)
  "ativo_total": 2750000.00,         // Total assets (€)
  "passivo_total": 2750000.00,       // Total liabilities (€)
  "capital_proprio": 1155000.00      // Equity (€)
}
```

### AnalysisResult

Complete analysis response structure:

```typescript
interface AnalysisResult {
  metadata: {
    nif: string;
    ano_exercicio: string;
    designacao_social: string;
    email: string;
    data_processamento: string;
  };
  dados_financeiros: FinancialIndicators;
  analise: {
    rating: "BAIXO" | "MÉDIO" | "ALTO" | "CRÍTICO";
    pontuacao: number;               // 0-100
    forcas: string[];                // Strengths
    fracasos: string[];              // Weaknesses
    recomendacoes: Recommendation[];
    indicadores_setor: {
      margem_ebitda_setor: number;
      autonomia_financeira_setor: number;
      liquidez_setor: number;
    };
  };
  download_urls: {
    excel: string;
    json: string;
  };
}
```

---

## ⚡ Rate Limits

### Rate Limiting by Tier

| Tier | Requests/Hour | Burst | Concurrent Tasks |
|------|---------------|-------|------------------|
| **Free** | 10 | 20 | 1 |
| **Professional** | 100 | 200 | 5 |
| **Enterprise** | 1000 | 2000 | 25 |

### Rate Limit Headers

All API responses include rate limiting headers:

```http
X-Rate-Limit-Limit: 100
X-Rate-Limit-Remaining: 95
X-Rate-Limit-Reset: 1642694400
X-Rate-Limit-Retry-After: 60
```

### Rate Limit Exceeded (429)

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please try again later.",
    "retry_after": 60,
    "limit": 100,
    "reset_time": "2024-01-20T12:00:00Z"
  }
}
```

---

## 🔒 Security

### Authentication Security

- **JWT Tokens** with 24-hour expiration
- **Refresh Tokens** for extended sessions
- **Token Revocation** on logout
- **Rate Limiting** prevents brute force

### Data Security

- **Encryption** AES-256 for stored data
- **HTTPS** TLS 1.3 for all requests
- **Input Validation** with Pydantic models
- **SQL Injection Protection** via ORM
- **XSS Protection** with output escaping

### File Security

- **Virus Scanning** for uploaded PDFs
- **File Size Limits** (max 10MB)
- **Format Validation** (PDF only)
- **Secure Storage** with controlled access
- **Automatic Cleanup** after 30 days

### Security Headers

```http
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: default-src 'self'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

---

## 🧪 Testing

### API Testing with cURL

**Complete Workflow Test**
```bash
#!/bin/bash

# 1. Health check
echo "🔍 Checking API health..."
curl -X GET "http://localhost:8000/health" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 2. Upload IES PDF
echo "📤 Uploading IES PDF..."
UPLOAD_RESPONSE=$(curl -X POST "http://localhost:8000/api/upload" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@IES-2023.pdf" \
  -F "nif=508195673" \
  -F "ano_exercicio=2023" \
  -F "designacao=SUA EMPRESA LDA" \
  -F "email=test@empresa.pt")

TASK_ID=$(echo $UPLOAD_RESPONSE | jq -r '.task_id')
echo "Task ID: $TASK_ID"

# 3. Check status
echo "⏳ Checking processing status..."
curl -X GET "http://localhost:8000/api/status/$TASK_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 4. Wait for completion
echo "⏱️ Waiting for completion..."
sleep 30

# 5. Get result
echo "📊 Getting analysis result..."
curl -X GET "http://localhost:8000/api/result/$TASK_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 6. Download files
echo "📥 Downloading Excel file..."
curl -X GET "http://localhost:8000/api/download/$TASK_ID/excel" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -o "analysis_result.xlsx"

echo "✅ Test completed!"
```

### API Testing with Postman

**Import Collection**
```json
{
  "info": {
    "name": "AutoFund AI API",
    "description": "Complete API collection for AutoFund AI"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{jwt_token}}",
        "type": "string"
      }
    ]
  },
  "variable": [
    {
      "key": "base_url",
      "value": "https://api.autofund.ai"
    },
    {
      "key": "jwt_token",
      "value": "YOUR_JWT_TOKEN"
    }
  ]
}
```

### Integration Testing Examples

**Python Integration Test**
```python
import pytest
import requests
from pathlib import Path

class TestAutoFundAPI:
    def setup_method(self):
        self.base_url = "http://localhost:8000"
        self.token = "YOUR_JWT_TOKEN"
        self.headers = {
            "Authorization": f"Bearer {self.token}"
        }

    def test_health_check(self):
        response = requests.get(f"{self.base_url}/health", headers=self.headers)
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

    def test_upload_ies(self):
        files = {
            "file": ("IES-2023.pdf", open("IES-2023.pdf", "rb"), "application/pdf")
        }
        data = {
            "nif": "508195673",
            "ano_exercicio": "2023",
            "designacao_social": "TEST EMPRESA LDA",
            "email": "test@empresa.pt"
        }

        response = requests.post(
            f"{self.base_url}/api/upload",
            headers=self.headers,
            files=files,
            data=data
        )

        assert response.status_code == 201
        result = response.json()
        assert "task_id" in result
        assert result["status"] == "processing"

        return result["task_id"]

    def test_processing_workflow(self):
        task_id = self.test_upload_ies()

        # Poll for completion
        import time
        while True:
            response = requests.get(
                f"{self.base_url}/api/status/{task_id}",
                headers=self.headers
            )
            assert response.status_code == 200

            status = response.json()["status"]
            if status in ["completed", "error"]:
                break

            time.sleep(5)

        # Get final result
        response = requests.get(
            f"{self.base_url}/api/result/{task_id}",
            headers=self.headers
        )
        assert response.status_code == 200

        result = response.json()
        assert "dados_financeiros" in result
        assert "analise" in result
        assert result["analise"]["rating"] in ["BAIXO", "MÉDIO", "ALTO", "CRÍTICO"]
```

---

## 🚨 Error Codes

### HTTP Status Codes

| Code | Description | Usage |
|------|-------------|-------|
| `200` | OK | Successful request |
| `201` | Created | Resource created (upload) |
| `400` | Bad Request | Invalid input data |
| `401` | Unauthorized | Missing or invalid token |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource not found |
| `413` | Payload Too Large | File exceeds size limit |
| `415` | Unsupported Media Type | Invalid file format |
| `422` | Unprocessable Entity | Validation failed |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server error |
| `503` | Service Unavailable | Maintenance mode |

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid NIF format",
    "details": {
      "field": "nif",
      "value": "123",
      "expected": "9 digits"
    },
    "request_id": "req_123456789",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Common Error Codes

| Error Code | Description | Solution |
|------------|-------------|----------|
| `INVALID_TOKEN` | JWT token is invalid or expired | Refresh authentication |
| `INVALID_FILE_FORMAT` | Uploaded file is not PDF | Ensure file is PDF format |
| `FILE_TOO_LARGE` | File exceeds 10MB limit | Compress or split file |
| `INVALID_NIF` | NIF format is invalid | Use 9-digit Portuguese NIF |
| `TASK_NOT_FOUND` | Task ID does not exist | Check task ID value |
| `PROCESSING_ERROR` | PDF extraction failed | Check PDF quality and format |
| `RATE_LIMIT_EXCEEDED` | Too many requests | Wait and retry later |

---

## 📚 Examples

### JavaScript/Node.js Example

```javascript
class AutoFundAPI {
  constructor(apiKey, baseURL = 'https://api.autofund.ai') {
    this.apiKey = apiKey;
    this.baseURL = baseURL;
  }

  async uploadIES(filePath, companyData) {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));

    Object.entries(companyData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const response = await fetch(`${this.baseURL}/api/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: formData
    });

    return response.json();
  }

  async getTaskStatus(taskId) {
    const response = await fetch(`${this.baseURL}/api/status/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return response.json();
  }

  async getResult(taskId) {
    const response = await fetch(`${this.baseURL}/api/result/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return response.json();
  }

  async downloadFile(taskId, fileType, outputPath) {
    const response = await fetch(
      `${this.baseURL}/api/download/${taskId}/${fileType}`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      }
    );

    const buffer = await response.arrayBuffer();
    fs.writeFileSync(outputPath, Buffer.from(buffer));
    return outputPath;
  }
}

// Usage example
const api = new AutoFundAPI('YOUR_JWT_TOKEN');

async function processIES() {
  try {
    // Upload IES
    const uploadResult = await api.uploadIES('IES-2023.pdf', {
      nif: '508195673',
      ano_exercicio: '2023',
      designacao_social: 'EMPRESA LDA',
      email: 'contato@empresa.pt',
      context: 'Candidatura Portugal 2030'
    });

    console.log('Upload successful:', uploadResult);

    // Poll for completion
    let status;
    do {
      await new Promise(resolve => setTimeout(resolve, 5000));
      status = await api.getTaskStatus(uploadResult.task_id);
      console.log('Status:', status.status);
    } while (status.status === 'processing');

    if (status.status === 'completed') {
      // Get results
      const result = await api.getResult(uploadResult.task_id);
      console.log('Analysis complete:', result.analise.rating);

      // Download files
      await api.downloadFile(uploadResult.task_id, 'excel', 'analysis.xlsx');
      await api.downloadFile(uploadResult.task_id, 'json', 'analysis.json');

      console.log('Files downloaded successfully');
    }
  } catch (error) {
    console.error('Error processing IES:', error);
  }
}

processIES();
```

### Python Example

```python
import requests
import time
import json
from pathlib import Path

class AutoFundAPI:
    def __init__(self, api_key, base_url="https://api.autofund.ai"):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

    def upload_ies(self, file_path, company_data):
        """Upload IES PDF for processing"""
        url = f"{self.base_url}/api/upload"

        with open(file_path, 'rb') as f:
            files = {'file': f}
            response = requests.post(
                url,
                headers={"Authorization": f"Bearer {self.api_key}"},
                files=files,
                data=company_data
            )

        response.raise_for_status()
        return response.json()

    def get_status(self, task_id):
        """Get processing status"""
        url = f"{self.base_url}/api/status/{task_id}"
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return response.json()

    def get_result(self, task_id):
        """Get complete analysis result"""
        url = f"{self.base_url}/api/result/{task_id}"
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return response.json()

    def download_file(self, task_id, file_type, output_path):
        """Download generated files"""
        url = f"{self.base_url}/api/download/{task_id}/{file_type}"
        response = requests.get(
            url,
            headers={"Authorization": f"Bearer {self.api_key}"},
            stream=True
        )
        response.raise_for_status()

        with open(output_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

        return output_path

    def process_ies_complete(self, file_path, company_data, poll_interval=10):
        """Complete IES processing workflow"""
        # Upload file
        print("📤 Uploading IES PDF...")
        upload_result = self.upload_ies(file_path, company_data)
        task_id = upload_result["task_id"]
        print(f"✅ Upload successful. Task ID: {task_id}")

        # Poll for completion
        print("⏳ Processing IES...")
        while True:
            status = self.get_status(task_id)
            print(f"Status: {status['status']}")

            if status["status"] == "completed":
                break
            elif status["status"] == "error":
                raise Exception(f"Processing failed: {status.get('error')}")

            time.sleep(poll_interval)

        # Get result
        print("📊 Retrieving analysis...")
        result = self.get_result(task_id)

        # Download files
        print("📥 Downloading files...")
        excel_path = self.download_file(task_id, "excel", f"analysis_{task_id}.xlsx")
        json_path = self.download_file(task_id, "json", f"analysis_{task_id}.json")

        print(f"✅ Processing complete!")
        print(f"📊 Risk Rating: {result['analise']['rating']}")
        print(f"📁 Excel: {excel_path}")
        print(f"📄 JSON: {json_path}")

        return result

# Usage example
def main():
    api = AutoFundAPI("YOUR_JWT_TOKEN")

    company_data = {
        "nif": "508195673",
        "ano_exercicio": "2023",
        "designacao_social": "EMPRESA LDA",
        "email": "contato@empresa.pt",
        "context": "Candidatura Portugal 2030 - expansão"
    }

    try:
        result = api.process_ies_complete("IES-2023.pdf", company_data)

        print("\n📈 Analysis Results:")
        print(f"Volume Negócios: €{result['dados_financeiros']['volume_negocios']:,.2f}")
        print(f"EBITDA: €{result['dados_financeiros']['ebitda']:,.2f}")
        print(f"Rating: {result['analise']['rating']}")
        print(f"Recommendations: {len(result['analise']['recomendacoes'])}")

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
```

---

## 📞 Support

### API Support Resources

- **📖 Full Documentation**: [docs.autofund.ai](https://docs.autofund.ai)
- **🧪 API Playground**: [api.autofund.ai/docs](https://api.autofund.ai/docs)
- **📧 Technical Support**: [api-support@autofund.ai](mailto:api-support@autofund.ai)
- **💬 Developer Discord**: [discord.gg/autofund-dev](https://discord.gg/autofund-dev)
- **📊 API Status**: [status.autofund.ai](https://status.autofund.ai)

### Getting Help

1. **Check Documentation**: Review detailed guides and examples
2. **API Playground**: Test endpoints interactively
3. **Error Codes**: Reference error code documentation
4. **Community Forum**: Ask questions and share solutions
5. **Contact Support**: Get help from our technical team

### Rate Limit Support

- **Professional Tier**: 100 requests/hour
- **Enterprise Tier**: 1000 requests/hour
- **Custom Plans**: Available for high-volume usage

---

<div align="center">

[![Built with ❤️ in Portugal](https://img.shields.io/badge/Built%20with%20❤️%20in%20Portugal-00205B?style=for-the-badge)](https://autofund.ai)

**🚀 Start automating your Portugal 2030 applications today**

[🔑 Get API Key](https://autofund.ai/register) • [📖 Full Docs](https://docs.autofund.ai) • [💬 Discord Support](https://discord.gg/autofund-dev)

</div>