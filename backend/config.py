from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # Supabase Configuration
    SUPABASE_URL: str
    SUPABASE_KEY: str

    # Google Gemini AI Configuration
    GEMINI_API_KEY: str

    # Email Configuration (Resend)
    RESEND_API_KEY: str = ""  # Read from .env - leave empty if email not configured
    FROM_EMAIL: str = ""  # Read from .env - e.g., "LegalDoc Filler <noreply@yourdomain.com>" or "onboarding@resend.dev"

    # Application Configuration
    APP_NAME: str = "LegalDoc Filler Backend"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False  # Default to False for production, override with env var
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    # File Upload Configuration
    MAX_FILE_SIZE_MB: int = 10
    ALLOWED_FILE_TYPES: str = ".docx"

    @property
    def allowed_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(',')]

    @property
    def max_file_size_bytes(self) -> int:
        return self.MAX_FILE_SIZE_MB * 1024 * 1024

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
