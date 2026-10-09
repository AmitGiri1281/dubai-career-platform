from fastapi import APIRouter, UploadFile, File, HTTPException, Header
from models.schemas import ResumeAnalysisResponse
from services.resume_analyzer import extract_text_from_pdf, analyze_resume
import os

router = APIRouter(prefix="/resume", tags=["Resume"])

API_KEY = os.getenv("AI_SERVICE_API_KEY", "change-me")


def _check_key(x_api_key: str):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")


@router.post("/analyze", response_model=ResumeAnalysisResponse)
async def analyze(
    file: UploadFile = File(...),
    x_api_key: str = Header(...),
):
    """
    Upload a PDF resume and get analysis.
    """
    _check_key(x_api_key)

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large (max 5MB)")

    try:
        text = extract_text_from_pdf(contents)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read PDF: {str(e)}")

    if not text.strip():
        raise HTTPException(status_code=400, detail="PDF appears to be empty or image-only")

    result = analyze_resume(text)
    return result