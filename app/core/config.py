from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
from pydantic import model_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "Aegis: High-Assurance Procurement Gateway"
    GOOGLE_API_KEY: str
    SQLALCHEMY_DATABASE_URI: str  # Direct URI for cloud/local deployment

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="allow")

settings = Settings()