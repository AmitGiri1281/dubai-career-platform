"""
Dubai Career Support — AI Microservice
FastAPI application entry point.
"""
import os
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import resume, jobs

app = FastAPI(
    title="Dubai Career AI Service",
    version="1.0.0",
    description="AI features for the Dubai Career Support Platform",
)

# CORS — allow the Next.js app to call from browser
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        os.getenv("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(resume.router)
app.include_router(jobs.router)


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok", "service": "dubai-career-ai", "version": "1.0.0"}


@app.get("/", tags=["Health"])
def root():
    return {
        "service": "Dubai Career AI",
        "docs": "/docs",
        "health": "/health",
    }