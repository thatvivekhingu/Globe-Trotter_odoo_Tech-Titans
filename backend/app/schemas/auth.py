from pydantic import BaseModel, EmailStr, Field, field_validator

from .common import UserRead


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=2, max_length=120)

    @field_validator('full_name')
    @classmethod
    def normalize_full_name(cls, value: str) -> str:
        normalized = ' '.join(value.split())
        if len(normalized) < 2:
            raise ValueError('full_name must contain at least two characters.')
        return normalized


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = 'bearer'
    user: UserRead


class ProfileUpdateRequest(BaseModel):
    email: EmailStr | None = None
    full_name: str | None = Field(default=None, min_length=2, max_length=120)
    avatar_url: str | None = Field(default=None, max_length=2048)
    language_code: str | None = Field(default=None, pattern='^(en|hi)$')
