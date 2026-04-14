from enum import Enum


class EApplicationEnvironment(str, Enum):
    PRODUCTION = "production"
    DEVELOPMENT = "development"
    STAGING = "staging"
