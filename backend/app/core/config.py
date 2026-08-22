from functools import lru_cache
from typing import Literal

from pydantic import computed_field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = 'TripWise API'
    environment: Literal['development', 'test', 'production'] = 'development'
    debug: bool = False
    auto_create_tables: bool = True
    auto_seed_reference_data: bool = True

    database_url: str = 'sqlite:///./tripwise.db'

    jwt_secret_key: str = 'replace-this-with-a-long-random-secret'
    jwt_algorithm: str = 'HS256'
    access_token_expire_minutes: int = 1440

    cors_origins: str = 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000'

    gemini_api_key: str = 'AIzaSyAb8RN6Kl7jng9UECHOVh174K0tgZSeLTLgcTQjPDrQyh_q3mjg'
    gemini_model: str = 'gemini-1.5-flash'

    model_config = SettingsConfigDict(
        env_file='.env',
        env_file_encoding='utf-8',
        extra='ignore',
    )

    @model_validator(mode='after')
    def validate_security_settings(self):
        if self.access_token_expire_minutes <= 0:
            raise ValueError('ACCESS_TOKEN_EXPIRE_MINUTES must be positive.')
        if self.environment == 'production' and self.jwt_secret_key == 'replace-this-with-a-long-random-secret':
            raise ValueError('JWT_SECRET_KEY must be changed in production.')
        return self

    @computed_field
    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(',') if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
