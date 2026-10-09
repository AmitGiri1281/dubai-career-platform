"""
Classify a job into one of the predefined categories
using keyword matching with weighted confidence.
"""
import json
import re
from pathlib import Path
from typing import List, Tuple

DATA_DIR = Path(__file__).parent.parent / "data"
with open(DATA_DIR / "categories.json", "r", encoding="utf-8") as f:
    CATEGORY_KEYWORDS = json.load(f)


def categorize_job(title: str, description: str = "", requirements: str = "") -> dict:
    """
    Score each category by counting keyword hits in title (weight 3),
    description (weight 1), and requirements (weight 2).
    Return top category + confidence + alternatives.
    """
    title_l = title.lower()
    desc_l = description.lower()
    req_l = requirements.lower()

    scores = {}
    for category, keywords in CATEGORY_KEYWORDS.items():
        score = 0
        for kw in keywords:
            pattern = r"\b" + re.escape(kw.lower()) + r"\b"
            if re.search(pattern, title_l):
                score += 3
            if re.search(pattern, req_l):
                score += 2
            if re.search(pattern, desc_l):
                score += 1
        scores[category] = score

    total = sum(scores.values())

    if total == 0:
        return {
            "category": "General",
            "confidence": 0.3,
            "alternatives": [],
        }

    sorted_cats = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    top_cat, top_score = sorted_cats[0]
    confidence = round(top_score / total, 4)

    alternatives = [c for c, s in sorted_cats[1:4] if s > 0]

    return {
        "category": top_cat,
        "confidence": confidence,
        "alternatives": alternatives,
    }