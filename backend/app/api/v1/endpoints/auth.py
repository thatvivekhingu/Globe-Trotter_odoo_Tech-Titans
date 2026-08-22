from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import get_db
from app.models import User
from app.schemas.auth import LoginRequest, SignupRequest, TokenResponse
from app.schemas.common import UserRead

router = APIRouter()


@router.post('/signup', response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, db: Session = Depends(get_db)) -> TokenResponse:
    email = str(payload.email).lower()
    existing = db.scalar(select(User).where(User.email == email))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail='An account with that email already exists.')

    user = User(email=email, password_hash=hash_password(payload.password), full_name=payload.full_name.strip())
    db.add(user)
    db.commit()
    db.refresh(user)
    return TokenResponse(access_token=create_access_token(user.id), user=UserRead.model_validate(user))


@router.post('/login', response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    identifier = (payload.user or payload.username or payload.email or '').strip().lower()
    if not identifier:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='User identifier is required.')
    user = db.scalar(select(User).where((User.email == identifier) | (User.email.like(f"{identifier}@%"))))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid user or password.', headers={'WWW-Authenticate': 'Bearer'})
    return TokenResponse(access_token=create_access_token(user.id), user=UserRead.model_validate(user))



@router.post('/logout')
def logout(_current_user: User = Depends(get_current_user)) -> dict[str, str]:
    # JWT access tokens are stateless. The client removes its token on logout.
    return {'message': 'Logged out successfully.'}
