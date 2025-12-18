from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

import os

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8", 
        extra="ignore"
    )

    # Database
    DATABASE_URL: str
    
    # Redis
    REDIS_URL: str
    
    # MinIO / S3
    MINIO_ROOT_USER: str
    MINIO_ROOT_PASSWORD: str
    MINIO_ENDPOINT: str
    MINIO_USE_SSL: bool = False
    
    # Auth
    JWT_SECRET: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

settings = Settings()
