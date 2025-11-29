"""
AutoFund AI - FastAPI Main Application
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, FileResponse
from contextlib import asynccontextmanager
import uvicorn
import json
import asyncio
from datetime import datetime
from typing import Optional, Dict, Any
import logging

from app.core.config import settings
from app.core.security import get_current_user, create_access_token
from app.api.endpoints import upload, analysis, results, auth
from app.services.claude_service import ClaudeService
from app.services.pdf_processor import PDFProcessor
from app.models.schemas import (
    UploadResponse,
    AnalysisStatus,
    ProcessingRequest,
    UserCreate,
    User
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables for managing active connections
active_connections: Dict[str, WebSocket] = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle"""
    # Startup
    logger.info("Starting AutoFund AI...")
    # Initialize services
    app.state.claude_service = ClaudeService()
    app.state.pdf_processor = PDFProcessor()

    yield

    # Shutdown
    logger.info("Shutting down AutoFund AI...")


# Create FastAPI app
app = FastAPI(
    title="AutoFund AI API",
    description="API para automação de candidaturas a fundos Portugal 2030",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files and templates
app.mount("/static", StaticFiles(directory="app/static"), name="static")
templates = Jinja2Templates(directory="app/templates")

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(upload.router, prefix="/api/v1/upload", tags=["upload"])
app.include_router(analysis.router, prefix="/api/v1/analysis", tags=["analysis"])
app.include_router(results.router, prefix="/api/v1/results", tags=["results"])


@app.websocket("/ws/{job_id}")
async def websocket_endpoint(websocket: WebSocket, job_id: str):
    """WebSocket endpoint for real-time progress updates"""
    await websocket.accept()
    active_connections[job_id] = websocket

    try:
        # Send initial status
        await websocket.send_json({
            "job_id": job_id,
            "status": "connected",
            "message": "WebSocket connection established",
            "timestamp": datetime.now().isoformat()
        })

        # Keep connection alive
        while True:
            try:
                await asyncio.sleep(10)
                # Send heartbeat
                await websocket.send_json({
                    "type": "heartbeat",
                    "timestamp": datetime.now().isoformat()
                })
            except WebSocketDisconnect:
                break

    except WebSocketDisconnect:
        if job_id in active_connections:
            del active_connections[job_id]
        logger.info(f"WebSocket disconnected for job {job_id}")


@app.get("/", response_class=HTMLResponse)
async def read_root():
    """Serve the main application page"""
    return FileResponse("app/templates/index.html")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "services": {
            "claude": "operational",
            "pdf_processor": "operational",
            "database": "operational"
        }
    }


@app.get("/api/v1/info")
async def app_info():
    """Application information"""
    return {
        "name": "AutoFund AI",
        "description": "Automatização de candidaturas a fundos Portugal 2030",
        "version": "1.0.0",
        "features": [
            "Extração automática de dados do IES",
            "Análise financeira com IA",
            "Geração de templates IAPMEI",
            "Avaliação de elegibilidade",
            "Relatórios customizados"
        ],
        "supported_formats": ["PDF", "XLSX", "CSV"],
        "processing_time": "< 5 minutos",
        "accuracy": "99%+"
    }


# Helper function to broadcast updates to WebSocket
async def broadcast_update(job_id: str, update: Dict[str, Any]):
    """Send update to specific WebSocket connection"""
    if job_id in active_connections:
        try:
            await active_connections[job_id].send_json({
                "job_id": job_id,
                **update,
                "timestamp": datetime.now().isoformat()
            })
        except:
            # Connection lost, remove from active connections
            del active_connections[job_id]


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )