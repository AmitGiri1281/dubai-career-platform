from fastapi import APIRouter, Header, HTTPException
from models.schemas import (
    RecommendRequest,
    RecommendResponse,
    CategorizeRequest,
    CategorizeResponse,
    SearchRequest,
    SearchResponse,
    ScamCheckRequest,
    ScamCheckResponse,
)
from services.job_recommender import build_profile_text, recommend_jobs
from services.job_categorizer import categorize_job
from services.semantic_search import semantic_search
from services.scam_detector import check_scam
import os

router = APIRouter(prefix="/jobs", tags=["Jobs"])

API_KEY = os.getenv("AI_SERVICE_API_KEY", "change-me")


def _check_key(x_api_key: str):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")


@router.post("/recommend", response_model=RecommendResponse)
def recommend(req: RecommendRequest, x_api_key: str = Header(...)):
    _check_key(x_api_key)

    profile = build_profile_text(req.skills, req.job_titles, req.summary or "")
    jobs_dicts = [j.model_dump() for j in req.jobs]
    recs = recommend_jobs(profile, jobs_dicts, top_k=req.top_k)

    return {"recommendations": recs}


@router.post("/categorize", response_model=CategorizeResponse)
def categorize(req: CategorizeRequest, x_api_key: str = Header(...)):
    _check_key(x_api_key)

    result = categorize_job(req.title, req.description or "", req.requirements or "")
    return result


@router.post("/search", response_model=SearchResponse)
def search(req: SearchRequest, x_api_key: str = Header(...)):
    _check_key(x_api_key)

    jobs_dicts = [j.model_dump() for j in req.jobs]
    results = semantic_search(req.query, jobs_dicts, top_k=req.top_k)

    return {"results": results}


@router.post("/scam-check", response_model=ScamCheckResponse)
def scam_check(req: ScamCheckRequest, x_api_key: str = Header(...)):
    _check_key(x_api_key)

    result = check_scam(
        title=req.title,
        description=req.description,
        requirements=req.requirements or "",
        company=req.company or "",
        salary_min=req.salaryMin,
        salary_max=req.salaryMax,
    )
    return result