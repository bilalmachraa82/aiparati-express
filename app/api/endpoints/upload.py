"""
Upload endpoint for IES PDF files
"""

from fastapi import APIRouter, File, UploadFile, HTTPException, Depends, BackgroundTasks
from fastapi.responses import JSONResponse
from datetime import datetime
import uuid
import aiofiles
import os
from typing import Optional

from app.core.config import settings
from app.models.schemas import UploadResponse, ProcessingStatus
from app.services.pdf_processor import PDFProcessor
from app.core.security import get_current_user

router = APIRouter()


@router.post("/ies", response_model=UploadResponse)
async def upload_ies(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    company_context: Optional[str] = None,
    current_user = Depends(get_current_user)
):
    """
    Upload IES PDF for processing

    - **file**: IES PDF file (max 50MB)
    - **company_context**: Optional context about the company and project
    """

    # Validate file
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )

    if file.size > settings.max_file_size:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size is {settings.max_file_size // (1024*1024)}MB"
        )

    # Generate unique job ID
    job_id = str(uuid.uuid4())

    # Create upload directory if it doesn't exist
    os.makedirs(settings.upload_dir, exist_ok=True)

    # Save uploaded file
    file_path = os.path.join(settings.upload_dir, f"{job_id}.pdf")

    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)

    # Initialize processing job
    job_data = {
        "job_id": job_id,
        "user_id": current_user.id,
        "filename": file.filename,
        "file_path": file_path,
        "company_context": company_context,
        "status": ProcessingStatus.QUEUED,
        "created_at": datetime.now().isoformat(),
        "progress": 0,
        "current_stage": "queued"
    }

    # Save job to database (simplified for example)
    # In production, use proper database storage

    # Add background task to process the file
    background_tasks.add_task(
        process_ies_file,
        job_id=job_id,
        file_path=file_path,
        company_context=company_context
    )

    return UploadResponse(
        job_id=job_id,
        status=ProcessingStatus.QUEUED,
        message="File uploaded successfully. Processing started.",
        estimated_time="3-5 minutes"
    )


async def process_ies_file(job_id: str, file_path: str, company_context: Optional[str]):
    """Background task to process IES file"""
    from app.main import broadcast_update

    try:
        # Initialize processor
        processor = PDFProcessor()

        # Update status: Starting processing
        await broadcast_update(job_id, {
            "status": "processing",
            "stage": "extracting",
            "progress": 10,
            "message": "Extracting data from IES PDF..."
        })

        # Extract data
        extracted_data = await processor.extract_from_pdf(file_path)

        # Update status: Analyzing
        await broadcast_update(job_id, {
            "status": "processing",
            "stage": "analyzing",
            "progress": 50,
            "message": "Analyzing financial data with AI..."
        })

        # Perform analysis
        from app.services.claude_service import ClaudeService
        claude_service = ClaudeService()
        analysis = await claude_service.analyze_financial_data(
            extracted_data,
            company_context or ""
        )

        # Update status: Generating Excel
        await broadcast_update(job_id, {
            "status": "processing",
            "stage": "generating",
            "progress": 80,
            "message": "Generating IAPMEI Excel template..."
        })

        # Generate Excel file
        excel_path = await processor.generate_excel_template(
            extracted_data,
            analysis,
            job_id
        )

        # Update status: Complete
        await broadcast_update(job_id, {
            "status": "completed",
            "stage": "completed",
            "progress": 100,
            "message": "Processing completed successfully!",
            "results": {
                "extracted_data": extracted_data,
                "analysis": analysis,
                "excel_path": excel_path
            }
        })

    except Exception as e:
        # Update status: Error
        await broadcast_update(job_id, {
            "status": "failed",
            "stage": "error",
            "progress": 0,
            "message": f"Processing failed: {str(e)}",
            "error": str(e)
        })
        # Log error
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to process job {job_id}: {str(e)}", exc_info=True)


@router.get("/status/{job_id}")
async def get_upload_status(job_id: str, current_user = Depends(get_current_user)):
    """Get processing status for uploaded file"""
    # In production, retrieve from database
    # For now, return mock status

    return {
        "job_id": job_id,
        "status": "processing",
        "progress": 65,
        "stage": "analyzing",
        "message": "Analyzing financial data...",
        "created_at": "2025-11-29T21:00:00Z",
        "estimated_completion": "2025-11-29T21:05:00Z"
    }