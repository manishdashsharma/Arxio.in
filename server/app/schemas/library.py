from pydantic import BaseModel, field_validator


class SearchLibraryRequest(BaseModel):
    query: str

    @field_validator("query")
    @classmethod
    def query_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Search query cannot be empty")
        if len(v) > 200:
            raise ValueError("Query too long (max 200 characters)")
        return v
