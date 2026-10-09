"""
Resume analysis — score a CV, extract skills, suggest improvements.
Uses simple rule-based scoring + keyword matching.
"""
import json
import re
from pathlib import Path
from typing import List, Tuple

DATA_DIR = Path(__file__).parent.parent / "data"
with open(DATA_DIR / "skills.json", "r", encoding="utf-8") as f:
    SKILLS_DB = json.load(f)


def _flatten_skills() -> List[str]:
    out = []
    for skills in SKILLS_DB.values():
        out.extend(skills)
    return sorted(set(out))


ALL_SKILLS = _flatten_skills()


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from a PDF using pdfplumber."""
    import pdfplumber
    import io

    text_parts = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                text_parts.append(text)
    return "\n".join(text_parts)


def detect_skills(text: str) -> List[str]:
    """Find skills mentioned in text."""
    text_lower = text.lower()
    found = []
    for skill in ALL_SKILLS:
        # word boundary match
        pattern = r"\b" + re.escape(skill.lower()) + r"\b"
        if re.search(pattern, text_lower):
            found.append(skill)
    return sorted(set(found))


def has_section(text_lower: str, keywords: List[str]) -> bool:
    return any(kw in text_lower for kw in keywords)


def analyze_resume(text: str) -> dict:
    """
    Score a resume on a 0-100 scale based on:
    • Presence of key sections (contact, experience, education, skills)
    • Length (word count)
    • Skill density
    • Action verbs
    """
    text_lower = text.lower()
    word_count = len(text.split())

    # ── Section detection ──
    has_contact = has_section(text_lower, ["@", "phone", "email", "contact"])
    has_experience = has_section(
        text_lower, ["experience", "employment", "work history", "professional"]
    )
    has_education = has_section(
        text_lower, ["education", "degree", "university", "college", "bachelor"]
    )
    has_skills = has_section(text_lower, ["skills", "technologies", "competencies"])

    skills_found = detect_skills(text)

    # ── Scoring ──
    score = 0
    score += 15 if has_contact else 0
    score += 25 if has_experience else 0
    score += 20 if has_education else 0
    score += 15 if has_skills else 0

    # Length: 300-800 words = ideal
    if 300 <= word_count <= 800:
        score += 15
    elif 150 <= word_count < 300 or 800 < word_count <= 1200:
        score += 8

    # Skill density
    score += min(10, len(skills_found))

    score = min(100, score)

    # ── Missing sections ──
    missing = []
    if not has_contact:
        missing.append("Contact information")
    if not has_experience:
        missing.append("Work experience section")
    if not has_education:
        missing.append("Education section")
    if not has_skills:
        missing.append("Skills section")

    # ── Suggestions ──
    suggestions = []
    if not has_contact:
        suggestions.append("Add your email and phone at the top of your CV.")
    if not has_experience:
        suggestions.append("Add a Work Experience section with job titles, companies, and dates.")
    if not has_education:
        suggestions.append("Add your education background (degree, institution, year).")
    if not has_skills:
        suggestions.append("Add a dedicated Skills section — ATS systems scan for this.")
    if word_count < 300:
        suggestions.append("Your CV is short. Expand on responsibilities and achievements.")
    if word_count > 1200:
        suggestions.append("Your CV is long. Trim to 1-2 pages — recruiters skim quickly.")
    if len(skills_found) < 5:
        suggestions.append("Include more relevant skills (technical + soft) to match job descriptions.")

    # Quantified achievements check
    if not re.search(r"\d+\s*%|\$\s*\d+|\d+\s*(million|k|thousand)", text_lower):
        suggestions.append("Add quantified achievements, e.g., 'Improved sales by 30%'.")

    if not suggestions:
        suggestions.append("Your CV looks strong! Consider tailoring it per job description.")

    return {
        "score": score,
        "skills_found": skills_found,
        "missing_sections": missing,
        "suggestions": suggestions,
        "word_count": word_count,
        "has_contact": has_contact,
        "has_experience": has_experience,
        "has_education": has_education,
    }