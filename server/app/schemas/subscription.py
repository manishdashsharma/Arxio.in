from pydantic import BaseModel
from app.shared.constant.application import EPlanTier


class ActivatePlanRequest(BaseModel):
    access_key: str
    plan: EPlanTier
