"""
Pydantic schemas for AI service.
These define the exact request/response shapes that Next.js sends and receives.
"""
from typing import List, Optional, Literal
from pydantic import BaseModel, Field


# ─────────────────────────────────────────────────
# Resume Analysis
# ─────────────────────────────────────────────────
class ResumeAnalysisResponse(BaseModel):
    score: int = Field(..., ge=0, le=100, description="Overall CV score 0-100")
    skills_found: List[str] = Field(default_factory=list)
    missing_sections: List[str] = Field(default_factory=list)
    suggestions: List[str] = Field(default_factory=list)
    word_count: int = 0
    has_contact: bool = False
    has_experience: bool = False
    has_education: bool = False


# ─────────────────────────────────────────────────
# Job Recommendations
# ─────────────────────────────────────────────────
class JobForRecommendation(BaseModel):
    id: str
    title: str
    description: str
    requirements: Optional[str] = ""


class RecommendRequest(BaseModel):
    skills: List[str] = Field(default_factory=list)
    job_titles: List[str] = Field(default_factory=list)
    summary: Optional[str] = ""
    jobs: List[JobForRecommendation] = Field(default_factory=list)
    top_k: int = Field(default=5, ge=1, le=50)


class RecommendedJob(BaseModel):
    id: str
    score: float = Field(..., ge=0, le=1)
    reason: str


class RecommendResponse(BaseModel):
    recommendations: List[RecommendedJob]


# ─────────────────────────────────────────────────
# Auto-Categorization
# ─────────────────────────────────────────────────
class CategorizeRequest(BaseModel):
    title: str
    description: Optional[str] = ""
    requirements: Optional[str] = ""


class CategorizeResponse(BaseModel):
    category: str
    confidence: float = Field(..., ge=0, le=1)
    alternatives: List[str] = Field(default_factory=list)


# ─────────────────────────────────────────────────
# Semantic Search
# ─────────────────────────────────────────────────
class SearchJob(BaseModel):
    id: str
    title: str
    description: str
    requirements: Optional[str] = ""


class SearchRequest(BaseModel):
    query: str
    jobs: List[SearchJob] = Field(default_factory=list)
    top_k: int = Field(default=10, ge=1, le=50)


class SearchResult(BaseModel):
    id: str
    score: float = Field(..., ge=0, le=1)


class SearchResponse(BaseModel):
    results: List[SearchResult]


# ─────────────────────────────────────────────────
# Scam Detection
# ─────────────────────────────────────────────────
class ScamCheckRequest(BaseModel):
    title: str
    description: str
    requirements: Optional[str] = ""
    company: Optional[str] = ""
    salaryMin: Optional[int] = None
    salaryMax: Optional[int] = None


class ScamCheckResponse(BaseModel):
    is_suspicious: bool
    risk_score: float = Field(..., ge=0, le=1)
    flags: List[str] = Field(default_factory=list)
    recommendation: str