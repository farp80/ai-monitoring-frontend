"""Reference Pydantic models for FastAPI — mirror src/types/auth.ts."""

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class OAuthProvider(str, Enum):
    google = "google"
    microsoft = "microsoft"
    yahoo = "yahoo"


class OAuthLoginRequest(BaseModel):
    provider: OAuthProvider
    authorization_code: str
    redirect_uri: str
    code_verifier: str = Field(min_length=43, max_length=128)
    state: str


class User(BaseModel):
    id: str
    email: EmailStr
    email_verified: bool
    display_name: str
    given_name: Optional[str] = None
    family_name: Optional[str] = None
    avatar_url: Optional[str] = None
    provider: OAuthProvider
    provider_subject: str
    roles: list[str] = Field(default_factory=lambda: ["user"])
    created_at: Optional[datetime] = None
    last_login_at: Optional[datetime] = None


class AuthSession(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    expires_in: int
    user: User
