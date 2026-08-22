from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models import Trip, User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/api/v1/auth/login')


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    user_id = decode_access_token(token)
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid or expired access token.', headers={'WWW-Authenticate': 'Bearer'})
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid or expired access token.', headers={'WWW-Authenticate': 'Bearer'})
    return user


def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != 'admin':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Admin access is required.')
    return current_user


def get_owned_trip(trip_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Trip:
    trip = db.scalar(select(Trip).where(Trip.id == trip_id, Trip.owner_user_id == current_user.id))
    if trip is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Trip not found.')
    return trip
