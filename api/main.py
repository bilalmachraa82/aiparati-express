"""
AiparatiExpress API
Backend FastAPI para processamento de IES e candidaturas Portugal 2030
"""

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import os
import json
import uuid
import shutil
from pathlib import Path
import logging
from datetime import datetime
import asyncio
import uvicorn

# Import do motor original
from autofund_ai_poc_v3 import AutoFundAI, ExtracoesFinanceiras, AnaliseFinanceira

# Configuração
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(
    title="AiparatiExpress API",
    description="API automatizada para candidaturas Portugal 2030",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especificar domínios
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Segurança (simples para MVP)
security = HTTPBearer()

# Configuração de paths
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR = Path("outputs")
OUTPUT_DIR.mkdir(exist_ok=True)

# Modelo de dados para API
class ProcessRequest(BaseModel):
    context: Optional[str] = None

class ProcessResponse(BaseModel):
    task_id: str
    status: str
    message: str

class AnalysisResult(BaseModel):
    metadata: Dict[str, Any]
    dados_financeiros: Dict[str, Any]
    analise: Dict[str, Any]
    download_urls: Dict[str, str]

# Storage em memória (para MVP - em prod usar Redis/DB)
active_tasks = {}
user_sessions = {}

# Dependência simples de autenticação
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    # MVP: aceita qualquer token (em prod validar JWT)
    return {"user_id": token[:8], "email": f"user-{token[:8]}@aiparati.pt"}

@app.get("/")
async def root():
    """Health check"""
    return {
        "service": "AiparatiExpress API",
        "status": "running",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/upload", response_model=ProcessResponse)
async def upload_ies(
    file: UploadFile = File(...),
    request: ProcessRequest = Depends(),
    current_user: dict = Depends(get_current_user)
):
    """
    Upload de ficheiro IES para processamento

    - **file**: Ficheiro PDF da IES
    - **context**: Contexto adicional opcional

    Retorna task_id para acompanhamento
    """

    # Validação
    if not file.filename.endswith('.pdf'):
        raise HTTPException(
            status_code=400,
            detail="Apenas ficheiros PDF são aceites"
        )

    if file.size > 10 * 1024 * 1024:  # 10MB
        raise HTTPException(
            status_code=400,
            detail="Ficheiro demasiado grande (máx 10MB)"
        )

    # Gerar IDs
    task_id = str(uuid.uuid4())
    user_id = current_user["user_id"]

    # Guardar ficheiro
    file_path = UPLOAD_DIR / f"{task_id}_{file.filename}"
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        logger.error(f"Erro ao guardar ficheiro: {e}")
        raise HTTPException(status_code=500, detail="Erro ao guardar ficheiro")

    # Criar task
    task = {
        "task_id": task_id,
        "user_id": user_id,
        "status": "uploaded",
        "file_path": str(file_path),
        "context": request.context or "",
        "created_at": datetime.now(),
        "result": None
    }

    active_tasks[task_id] = task

    # Iniciar processamento assíncrono
    asyncio.create_task(process_ies_async(task_id))

    return ProcessResponse(
        task_id=task_id,
        status="processing",
        message=f"Ficheiro {file.filename} recebido. A processar..."
    )

async def process_ies_async(task_id: str):
    """Processa IES em background"""
    task = active_tasks.get(task_id)
    if not task:
        return

    try:
        # Atualizar status
        task["status"] = "extracting"

        # Inicializar AutoFundAI
        api_key = os.getenv('ANTHROPIC_API_KEY')
        if not api_key:
            raise Exception("API key não configurada")

        autofund = AutoFundAI(api_key)

        # Processar
        task["status"] = "analyzing"
        result = autofund.process_ies(task["file_path"], task.get("context", ""))

        # Preparar URLs de download
        excel_path = result["ficheiros_gerados"]["excel"]
        json_path = result["ficheiros_gerados"]["json"]

        result["download_urls"] = {
            "excel": f"/api/download/{task_id}/excel",
            "json": f"/api/download/{task_id}/json"
        }

        # Atualizar task
        task["status"] = "completed"
        task["result"] = result
        task["completed_at"] = datetime.now()

        logger.info(f"Task {task_id} completada com sucesso")

    except Exception as e:
        logger.error(f"Erro na task {task_id}: {e}")
        task["status"] = "error"
        task["error"] = str(e)
        task["completed_at"] = datetime.now()

@app.get("/api/status/{task_id}")
async def get_status(
    task_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Verifica status de processamento"""

    task = active_tasks.get(task_id)
    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task não encontrada"
        )

    if task["user_id"] != current_user["user_id"]:
        raise HTTPException(
            status_code=403,
            detail="Acesso não autorizado"
        )

    response = {
        "task_id": task_id,
        "status": task["status"],
        "created_at": task["created_at"].isoformat()
    }

    if task["status"] == "completed":
        response["result"] = task["result"]
        response["completed_at"] = task["completed_at"].isoformat()
    elif task["status"] == "error":
        response["error"] = task.get("error", "Erro desconhecido")
        response["completed_at"] = task.get("completed_at", datetime.now()).isoformat()

    return response

@app.get("/api/result/{task_id}", response_model=AnalysisResult)
async def get_result(
    task_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Obtém resultado completo da análise"""

    task = active_tasks.get(task_id)
    if not task or task["status"] != "completed":
        raise HTTPException(
            status_code=404,
            detail="Resultado não disponível"
        )

    if task["user_id"] != current_user["user_id"]:
        raise HTTPException(
            status_code=403,
            detail="Acesso não autorizado"
        )

    return AnalysisResult(**task["result"])

@app.get("/api/download/{task_id}/{file_type}")
async def download_file(
    task_id: str,
    file_type: str,
    current_user: dict = Depends(get_current_user)
):
    """Download de ficheiros gerados"""

    task = active_tasks.get(task_id)
    if not task or task["status"] != "completed":
        raise HTTPException(
            status_code=404,
            detail="Ficheiro não disponível"
        )

    if task["user_id"] != current_user["user_id"]:
        raise HTTPException(
            status_code=403,
            detail="Acesso não autorizado"
        )

    if file_type == "excel":
        file_path = task["result"]["ficheiros_gerados"]["excel"]
        filename = f"aiparati_{task['result']['metadata']['nif']}.xlsx"
    elif file_type == "json":
        file_path = task["result"]["ficheiros_gerados"]["json"]
        filename = f"aiparati_{task['result']['metadata']['nif']}.json"
    else:
        raise HTTPException(
            status_code=400,
            detail="Tipo de ficheiro inválido"
        )

    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=404,
            detail="Ficheiro não encontrado"
        )

    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="application/octet-stream"
    )

@app.get("/api/tasks")
async def list_tasks(current_user: dict = Depends(get_current_user)):
    """Lista tarefas do utilizador"""

    user_tasks = []
    for task_id, task in active_tasks.items():
        if task["user_id"] == current_user["user_id"]:
            user_tasks.append({
                "task_id": task_id,
                "status": task["status"],
                "created_at": task["created_at"].isoformat(),
                "completed_at": task.get("completed_at", datetime.now()).isoformat()
            })

    return {"tasks": user_tasks}

@app.delete("/api/tasks/{task_id}")
async def delete_task(
    task_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Elimina tarefa e ficheiros associados"""

    task = active_tasks.get(task_id)
    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task não encontrada"
        )

    if task["user_id"] != current_user["user_id"]:
        raise HTTPException(
            status_code=403,
            detail="Acesso não autorizado"
        )

    # Eliminar ficheiros
    try:
        if os.path.exists(task.get("file_path", "")):
            os.remove(task["file_path"])

        if task.get("result"):
            for file_path in task["result"]["ficheiros_gerados"].values():
                if os.path.exists(file_path):
                    os.remove(file_path)
    except Exception as e:
        logger.error(f"Erro ao eliminar ficheiros: {e}")

    # Eliminar task
    del active_tasks[task_id]

    return {"message": "Task eliminada com sucesso"}

# Health checks
@app.get("/health")
async def health_check():
    """Health check detalhado"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "active_tasks": len(active_tasks),
        "api_key_configured": bool(os.getenv('ANTHROPIC_API_KEY'))
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )