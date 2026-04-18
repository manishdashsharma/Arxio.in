from pydantic_settings import BaseSettings
from app.shared.constant.application import EApplicationEnvironment


class Settings(BaseSettings):
    app_name: str = "Arxio API"
    port: int = 8000
    version: str = "1.0.0"
    environment: EApplicationEnvironment = EApplicationEnvironment.DEVELOPMENT

    mongodb_uri: str
    mongodb_db_name: str = "arxio"

    redis_url: str = "redis://localhost:6379"

    jwt_secret: str
    jwt_access_expire_minutes: int = 15
    jwt_refresh_expire_days: int = 7

    openai_api_key: str = ""

    resend_api_key: str = ""
    email_from: str = "noreply@manishdashsharma.com"

    tavily_api_key: str = ""

    qdrant_url: str = ""
    qdrant_api_key: str = ""

    subscription_access_key: str = ""

    cloudflare_r2_access_key: str = ""
    cloudflare_r2_secret_key: str = ""
    cloudflare_r2_bucket: str = ""
    cloudflare_r2_endpoint: str = ""

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
