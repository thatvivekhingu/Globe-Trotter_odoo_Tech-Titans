from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.session import get_db
from app.models import User
from app.schemas.auth import ProfileUpdateRequest
from app.schemas.common import UserRead

router = APIRouter()


@router.get('/me', response_model=UserRead)
def get_me(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.patch('/me', response_model=UserRead)
def update_me(payload: ProfileUpdateRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> User:
    changes = payload.model_dump(exclude_unset=True)
    if 'email' in changes and changes['email']:
        normalized_email = str(changes['email']).lower()
        duplicate = db.scalar(select(User).where(User.email == normalized_email, User.id != current_user.id))
        if duplicate:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail='An account with that email already exists.')
        changes['email'] = normalized_email
    if 'full_name' in changes and changes['full_name']:
        changes['full_name'] = changes['full_name'].strip()
    for key, value in changes.items():
        setattr(current_user, key, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.delete('/me', status_code=status.HTTP_204_NO_CONTENT)
def delete_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> None:
    db.delete(current_user)
    db.commit()
