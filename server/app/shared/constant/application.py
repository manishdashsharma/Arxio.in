from enum import Enum


class EApplicationEnvironment(str, Enum):
    PRODUCTION = "production"
    DEVELOPMENT = "development"
    STAGING = "staging"


class EPlanTier(str, Enum):
    FREE = "free"
    STUDENT = "student"
    PRO = "pro"
    SCHOLAR = "scholar"


class EWorkspaceStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class EResearchStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
