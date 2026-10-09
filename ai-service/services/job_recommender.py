"""
Job recommendations using TF-IDF + cosine similarity.
"""
from typing import List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def build_profile_text(
    skills: List[str], job_titles: List[str], summary: str = ""
) -> str:
    parts = []
    if skills:
        parts.append("Skills: " + ", ".join(skills))
    if job_titles:
        parts.append("Experience: " + ", ".join(job_titles))
    if summary:
        parts.append(summary)
    return " ".join(parts) or "general"


def recommend_jobs(
    profile_text: str,
    jobs: List[dict],
    top_k: int = 5,
) -> List[dict]:
    """
    Rank jobs by cosine similarity to profile_text.
    Returns [{id, score, reason}]
    """
    if not jobs:
        return []

    # Build job corpus
    job_texts = []
    for j in jobs:
        parts = [j.get("title", ""), j.get("description", ""), j.get("requirements", "")]
        job_texts.append(" ".join(p for p in parts if p))

    # Vectorize profile + jobs together
    corpus = [profile_text] + job_texts
    vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
    tfidf = vectorizer.fit_transform(corpus)

    profile_vec = tfidf[0:1]
    job_vecs = tfidf[1:]

    similarities = cosine_similarity(profile_vec, job_vecs)[0]

    # Rank
    ranked = sorted(
        [(i, float(s)) for i, s in enumerate(similarities)],
        key=lambda x: x[1],
        reverse=True,
    )[:top_k]

    results = []
    for idx, score in ranked:
        if score <= 0.01:
            continue
        job = jobs[idx]
        reason = _build_reason(profile_text, job, score)
        results.append({"id": job["id"], "score": round(score, 4), "reason": reason})

    return results


def _build_reason(profile_text: str, job: dict, score: float) -> str:
    """Generate a short human-readable reason for the match."""
    job_title = job.get("title", "this role")
    if score >= 0.5:
        return f"Strong match for {job_title} — skills align closely."
    if score >= 0.3:
        return f"Good match for {job_title} — several relevant skills."
    return f"Possible match for {job_title} — consider tailoring your CV."