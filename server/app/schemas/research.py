from pydantic import BaseModel, field_validator


class GenerateResearchRequest(BaseModel):
    topic: str

    @field_validator("topic")
    @classmethod
    def topic_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Topic cannot be empty")
        if len(v) > 500:
            raise ValueError("Topic too long (max 500 characters)")
        return v
