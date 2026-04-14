from pydantic_settings import BaseSettings
from app.shared.constant.application import EApplicationEnvironment


class Settings(BaseSettings):
    app_name: str = "Arxio API"
    port: int = 8000
    version: str = "1.0.0"
    environment: EApplicationEnvironment = EApplicationEnvironment.DEVELOPMENT

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
