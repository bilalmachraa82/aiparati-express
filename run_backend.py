#!/usr/bin/env python3
"""
Iniciar Backend sem autenticação para demonstração
"""

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

# Criar app simples para demo
app = FastAPI(title="AutoFund AI Demo", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpoint health
@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "message": "AutoFund AI Demo Running",
        "endpoints": {
            "docs": "/docs",
            "upload": "/api/upload (POST)",
            "health": "/health"
        }
    }

# Endpoint upload sem autenticação
@app.post("/api/upload")
async def upload_file(file = None, nif: str = "", ano_exercicio: str = "", designacao_social: str = "", email: str = ""):
    import uuid
    from datetime import datetime

    task_id = str(uuid.uuid4())

    return {
        "task_id": task_id,
        "status": "processing",
        "message": f"Recebido IES de {designacao_social} ({nif})",
        "timestamp": datetime.now().isoformat(),
        "next_step": f"Verifique o status em /api/status/{task_id}"
    }

# Endpoint status
@app.get("/api/status/{task_id}")
async def get_status(task_id: str):
    return {
        "task_id": task_id,
        "status": "completed",
        "result": {
            "metadata": {
                "nif": nif if 'nif' in locals() else "516807706",
                "designacao_social": designacao_social if 'designacao_social' in locals() else "PLF - PROJETOS, LDA.",
                "ano": "2023"
            },
            "rating": "BAIXO",
            "excel_generated": True,
            "analysis": "Dados processados com sucesso"
        }
    }

if __name__ == "__main__":
    print("🚀 Iniciando AutoFund AI Demo Server")
    print("📊 Acesse: http://localhost:8000")
    print("📖 Docs: http://localhost:8000/docs")

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True
    )