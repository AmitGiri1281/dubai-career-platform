"""
Semantic search over jobs using TF-IDF (acts as a lightweight semantic matcher).
"""
from typing import List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def semantic_search(query: str, jobs: List[dict], top_k: int = 10) -> List[dict]:
    """
    Return jobs ranked by relevance to query.
    Returns [{id, score}]
    """
    if not query.strip() or not jobs:
        return []

    job_texts = []
    for j in jobs:
        parts = [j.get("title", ""), j.get("description", ""), j.get("requirements", "")]
        job_texts.append(" ".join(p for p in parts if p))

    corpus = [query] + job_texts
    vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
    tfidf = vectorizer.fit_transform(corpus)

    query_vec = tfidf[0:1]
    job_vecs = tfidf[1:]

    similarities = cosine_similarity(query_vec, job_vecs)[0]

    ranked = sorted(
        [(i, float(s)) for i, s in enumerate(similarities) if s > 0.05],
        key=lambda x: x[1],
        reverse=True,
    )[:top_k]

    return [{"id": jobs[i]["id"], "score": round(s, 4)} for i, s in ranked]