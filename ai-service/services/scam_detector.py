"""
Rule-based scam detection for the Dubai Career Support Platform.

The detector evaluates:
- High-risk payment/job scam phrases
- Medium-risk recruitment phrases
- Suspicious contact methods
- Document and credential requests
- Payment-related language
- Urgency/pressure tactics
- Suspicious salary claims
- Suspicious company/recruiter language
- Social-engineering language
- Salary outliers

The result contains:
- is_suspicious
- risk_score (0-1)
- flags
- recommendation
"""

import json
import re
from pathlib import Path
from typing import List, Optional


# -------------------------------------------------------------------
# Load scam patterns
# -------------------------------------------------------------------

DATA_DIR = Path(__file__).parent.parent / "data"
PATTERNS_FILE = DATA_DIR / "scam_patterns.json"

with open(PATTERNS_FILE, "r", encoding="utf-8") as f:
    PATTERNS = json.load(f)


# -------------------------------------------------------------------
# Configuration
# -------------------------------------------------------------------

# Risk weights for different categories.
# These are intentionally different because requesting an OTP/payment
# is more serious than using words such as "urgent hiring".
CATEGORY_WEIGHTS = {
    "high_risk_phrases": 0.35,
    "medium_risk_phrases": 0.10,
    "suspicious_contact": 0.15,
    "document_risk_phrases": 0.25,
    "payment_risk_phrases": 0.30,
    "urgency_risk_phrases": 0.08,
    "salary_risk_phrases": 0.15,
    "company_risk_phrases": 0.15,
    "social_engineering_phrases": 0.20,
}


# -------------------------------------------------------------------
# Text helpers
# -------------------------------------------------------------------

def _normalize_text(text: Optional[str]) -> str:
    """
    Normalize text for safer and more consistent matching.
    """
    if not text:
        return ""

    text = str(text).lower()

    # Normalize different dash characters.
    text = text.replace("–", "-")
    text = text.replace("—", "-")

    # Collapse repeated whitespace.
    text = re.sub(r"\s+", " ", text)

    return text.strip()


def _find_matches(text_lower: str, phrases: List[str]) -> List[str]:
    """
    Find configured phrases in normalized text.

    Returns each matching phrase once.
    """
    found = []

    for phrase in phrases:
        normalized_phrase = _normalize_text(phrase)

        if normalized_phrase and normalized_phrase in text_lower:
            found.append(phrase)

    return found


def _add_category_flags(
    flags: List[str],
    matches: List[str],
    label: str,
    emoji: str,
) -> None:
    """
    Convert matches into readable security flags.
    """
    for phrase in matches:
        flags.append(f"{emoji} {label}: '{phrase}'")


# -------------------------------------------------------------------
# Main scam detector
# -------------------------------------------------------------------

def check_scam(
    title: str,
    description: str,
    requirements: str = "",
    company: str = "",
    salary_min: Optional[int] = None,
    salary_max: Optional[int] = None,
) -> dict:
    """
    Analyze a job posting for suspicious/scam indicators.

    Returns:
        {
            "is_suspicious": bool,
            "risk_score": float,
            "flags": list[str],
            "recommendation": str
        }
    """

    # ---------------------------------------------------------------
    # Normalize all input
    # ---------------------------------------------------------------

    title_text = _normalize_text(title)
    description_text = _normalize_text(description)
    requirements_text = _normalize_text(requirements)
    company_text = _normalize_text(company)

    combined = " ".join(
        part
        for part in [
            title_text,
            description_text,
            requirements_text,
            company_text,
        ]
        if part
    )

    flags: List[str] = []

    # ---------------------------------------------------------------
    # Detect categories
    # ---------------------------------------------------------------

    high = _find_matches(
        combined,
        PATTERNS.get("high_risk_phrases", []),
    )

    medium = _find_matches(
        combined,
        PATTERNS.get("medium_risk_phrases", []),
    )

    contact = _find_matches(
        combined,
        PATTERNS.get("suspicious_contact", []),
    )

    document_risk = _find_matches(
        combined,
        PATTERNS.get("document_risk_phrases", []),
    )

    payment_risk = _find_matches(
        combined,
        PATTERNS.get("payment_risk_phrases", []),
    )

    urgency_risk = _find_matches(
        combined,
        PATTERNS.get("urgency_risk_phrases", []),
    )

    salary_risk = _find_matches(
        combined,
        PATTERNS.get("salary_risk_phrases", []),
    )

    company_risk = _find_matches(
        combined,
        PATTERNS.get("company_risk_phrases", []),
    )

    social_risk = _find_matches(
        combined,
        PATTERNS.get("social_engineering_phrases", []),
    )

    # ---------------------------------------------------------------
    # Create readable flags
    # ---------------------------------------------------------------

    _add_category_flags(
        flags,
        high,
        "High risk",
        "🚨",
    )

    _add_category_flags(
        flags,
        medium,
        "Suspicious",
        "⚠️",
    )

    _add_category_flags(
        flags,
        contact,
        "Unusual contact or sensitive information request",
        "📱",
    )

    _add_category_flags(
        flags,
        document_risk,
        "Sensitive document request",
        "📄",
    )

    _add_category_flags(
        flags,
        payment_risk,
        "Payment-related risk",
        "💳",
    )

    _add_category_flags(
        flags,
        urgency_risk,
        "Urgency/pressure signal",
        "⏰",
    )

    _add_category_flags(
        flags,
        salary_risk,
        "Suspicious salary/income claim",
        "💰",
    )

    _add_category_flags(
        flags,
        company_risk,
        "Company/recruiter risk",
        "🏢",
    )

    _add_category_flags(
        flags,
        social_risk,
        "Social-engineering signal",
        "🛡️",
    )

    # ---------------------------------------------------------------
    # Salary analysis
    # ---------------------------------------------------------------

    if salary_max is not None:
        try:
            salary_max_value = float(salary_max)

            if salary_max_value > 100000:
                flags.append(
                    f"💰 Salary unusually high ({salary_max_value:g} AED)"
                )
        except (TypeError, ValueError):
            pass

    if salary_min is not None and salary_max is not None:
        try:
            salary_min_value = float(salary_min)
            salary_max_value = float(salary_max)

            if (
                salary_min_value < 500
                and salary_max_value > 50000
            ):
                flags.append(
                    "💰 Suspicious salary range"
                )

        except (TypeError, ValueError):
            pass

    # ---------------------------------------------------------------
    # Calculate risk
    # ---------------------------------------------------------------

    risk = 0.0

    # Count each category, but cap the contribution of each category.
    # This prevents dozens of duplicate phrases from automatically
    # forcing the score to 1.0.
    category_matches = {
        "high_risk_phrases": high,
        "medium_risk_phrases": medium,
        "suspicious_contact": contact,
        "document_risk_phrases": document_risk,
        "payment_risk_phrases": payment_risk,
        "urgency_risk_phrases": urgency_risk,
        "salary_risk_phrases": salary_risk,
        "company_risk_phrases": company_risk,
        "social_engineering_phrases": social_risk,
    }

    for category, matches in category_matches.items():
        if not matches:
            continue

        weight = CATEGORY_WEIGHTS.get(category, 0.0)

        # First match receives the full category weight.
        # Additional matches add a smaller amount.
        additional_matches = max(0, len(matches) - 1)

        category_score = weight + (
            additional_matches * weight * 0.25
        )

        # Never allow one category to dominate the entire score.
        category_score = min(
            category_score,
            weight * 1.5,
        )

        risk += category_score

    # Salary outlier contributes a small additional amount.
    if salary_max is not None:
        try:
            if float(salary_max) > 100000:
                risk += 0.10
        except (TypeError, ValueError):
            pass

    if salary_min is not None and salary_max is not None:
        try:
            if (
                float(salary_min) < 500
                and float(salary_max) > 50000
            ):
                risk += 0.10
        except (TypeError, ValueError):
            pass

    # Final score must stay between 0 and 1.
    risk = min(1.0, max(0.0, risk))

    # ---------------------------------------------------------------
    # Determine suspicious status
    # ---------------------------------------------------------------

    # Multiple independent scam signals should trigger suspicion.
    is_suspicious = risk >= 0.30

    # Very strong indicators should trigger suspicion even if there
    # aren't many different categories.
    critical_signal_count = (
        len(high)
        + len(payment_risk)
        + len(document_risk)
        + len(social_risk)
    )

    if critical_signal_count >= 2:
        is_suspicious = True

    # ---------------------------------------------------------------
    # Recommendation
    # ---------------------------------------------------------------

    if not flags:
        recommendation = (
            "✅ No suspicious patterns detected. "
            "Normal verification is still recommended."
        )

    elif risk >= 0.70:
        recommendation = (
            "🚨 HIGH RISK — Do not apply or send money/documents. "
            "Verify the employer independently and report the posting "
            "if fraud is suspected."
        )

    elif risk >= 0.45:
        recommendation = (
            "⚠️ HIGH CAUTION — Several suspicious signals were detected. "
            "Verify the company, recruiter and job independently before "
            "sharing documents or making any payment."
        )

    elif risk >= 0.30:
        recommendation = (
            "⚠️ CAUTION — Suspicious signals were detected. "
            "Verify the employer independently before applying or "
            "sharing sensitive information."
        )

    else:
        recommendation = (
            "ℹ️ Minor warning signals detected. "
            "Proceed carefully and verify the employer."
        )

    # ---------------------------------------------------------------
    # Return API response
    # ---------------------------------------------------------------

    return {
        "is_suspicious": is_suspicious,
        "risk_score": round(risk, 4),
        "flags": flags,
        "recommendation": recommendation,
    }