from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
from pydantic import model_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "Aegis: High-Assurance Procurement Gateway"
    
    # Database Configuration (Optional if full URI is provided)
    POSTGRES_USER: Optional[str] = None
    POSTGRES_PASSWORD: Optional[str] = None
    POSTGRES_SERVER: Optional[str] = None
    POSTGRES_PORT: str = "5432"
    POSTGRES_DB: Optional[str] = None
    
    # Direct URI Override for Cloud Deployment
    SQLALCHEMY_DATABASE_URI: Optional[str] = None
    
    # AI Client Configuration
    GOOGLE_API_KEY: str

    @model_validator(mode='after')
    def assemble_db_connection(self) -> 'Settings':
        if not self.SQLALCHEMY_DATABASE_URI:
            if not all([self.POSTGRES_USER, self.POSTGRES_PASSWORD, self.POSTGRES_SERVER, self.POSTGRES_DB]):
                raise ValueError("Either SQLALCHEMY_DATABASE_URI or all POSTGRES_* fields must be provided")
            self.SQLALCHEMY_DATABASE_URI = f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        return self

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="allow")

settings = Settings()