from __future__ import annotations

import uuid
from typing import List

from openai import AsyncOpenAI
from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    PointStruct,
    VectorParams,
    Filter,
    FieldCondition,
    MatchValue,
    PayloadSchemaType,
)

from app.core.config import settings
from app.core.logger import logger

COLLECTION = "arxio_papers"
EMBED_MODEL = "text-embedding-3-small"
EMBED_DIMS = 1536
CHUNK_SIZE = 1500
CHUNK_OVERLAP = 200
TOP_K = 6

_qdrant: QdrantClient | None = None
_openai: AsyncOpenAI | None = None


def get_qdrant() -> QdrantClient:
    global _qdrant
    if _qdrant is None:
        _qdrant = QdrantClient(url=settings.qdrant_url, api_key=settings.qdrant_api_key)
    return _qdrant


def get_openai() -> AsyncOpenAI:
    global _openai
    if _openai is None:
        _openai = AsyncOpenAI(api_key=settings.openai_api_key)
    return _openai


def ensure_collection() -> None:
    client = get_qdrant()
    existing = {c.name for c in client.get_collections().collections}
    if COLLECTION not in existing:
        client.create_collection(
            collection_name=COLLECTION,
            vectors_config=VectorParams(size=EMBED_DIMS, distance=Distance.COSINE),
        )
        client.create_payload_index(
            collection_name=COLLECTION,
            field_name="workspace_id",
            field_schema=PayloadSchemaType.KEYWORD,
        )
        logger.info("Qdrant collection '%s' created", COLLECTION)


def _chunk_text(text: str) -> List[str]:
    chunks = []
    start = 0
    while start < len(text):
        end = start + CHUNK_SIZE
        chunks.append(text[start:end])
        start += CHUNK_SIZE - CHUNK_OVERLAP
    return [c.strip() for c in chunks if c.strip()]


async def _embed(texts: List[str]) -> List[List[float]]:
    client = get_openai()
    response = await client.embeddings.create(model=EMBED_MODEL, input=texts)
    return [item.embedding for item in response.data]


async def index_workspace(workspace_id: str, user_id: str, text: str) -> int:
    chunks = _chunk_text(text)
    if not chunks:
        return 0

    ensure_collection()
    qdrant = get_qdrant()

    delete_by_workspace(workspace_id)

    batch_size = 50
    total = 0
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i: i + batch_size]
        vectors = await _embed(batch)
        points = [
            PointStruct(
                id=str(uuid.uuid4()),
                vector=vectors[j],
                payload={
                    "workspace_id": workspace_id,
                    "user_id": user_id,
                    "chunk_index": i + j,
                    "text": batch[j],
                },
            )
            for j in range(len(batch))
        ]
        qdrant.upsert(collection_name=COLLECTION, points=points)
        total += len(points)

    logger.info("RAG indexed %d chunks for workspace %s", total, workspace_id)
    return total


async def search_workspace(workspace_id: str, query: str) -> str:
    ensure_collection()
    qdrant = get_qdrant()

    query_vector = (await _embed([query]))[0]

    from qdrant_client.models import QueryRequest
    results = qdrant.query_points(
        collection_name=COLLECTION,
        query=query_vector,
        query_filter=Filter(
            must=[FieldCondition(key="workspace_id", match=MatchValue(value=workspace_id))]
        ),
        limit=TOP_K,
        with_payload=True,
    ).points

    if not results:
        return ""

    return "\n\n---\n\n".join(r.payload["text"] for r in results)


def delete_by_workspace(workspace_id: str) -> None:
    try:
        qdrant = get_qdrant()
        from qdrant_client.models import FilterSelector
        qdrant.delete(
            collection_name=COLLECTION,
            points_selector=FilterSelector(
                filter=Filter(
                    must=[FieldCondition(key="workspace_id", match=MatchValue(value=workspace_id))]
                )
            ),
        )
    except Exception as e:
        logger.error("RAG delete failed for workspace %s — %s", workspace_id, str(e))
