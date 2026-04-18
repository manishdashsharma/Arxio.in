from pydantic import BaseModel
from typing import Optional
from app.shared.constant.application import EWorkspaceStatus


class WorkspaceResponse(BaseModel):
    workspaceId: str
    originalName: str
    status: EWorkspaceStatus
    pageCount: Optional[int]
    wordCount: Optional[int]
    fileSize: int
    createdAt: str


class ProcessingStatusResponse(BaseModel):
    workspaceId: str
    status: EWorkspaceStatus
    errorMessage: Optional[str]
    generatedFiles: Optional[dict]
