import secrets
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_owned_trip
from app.db.session import get_db
from app.models import SharedTrip, Trip
from app.schemas.common import PublicTripRead, SharedTripRead
from app.services.public_trip import get_public_trip

router = APIRouter()


@router.post('/trips/{trip_id}/share', response_model=SharedTripRead, status_code=status.HTTP_201_CREATED)
def create_share(trip: Trip = Depends(get_owned_trip), db: Session = Depends(get_db)) -> SharedTrip:
    shared = db.scalar(select(SharedTrip).where(SharedTrip.trip_id == trip.id))
    if shared is None:
        shared = SharedTrip(trip_id=trip.id, share_token=secrets.token_hex(16), is_active=True)
        db.add(shared)
    else:
        shared.share_token = secrets.token_hex(16)
        shared.is_active = True
        shared.expires_at = None
    db.commit()
    db.refresh(shared)
    return shared


@router.delete('/trips/{trip_id}/share', status_code=status.HTTP_204_NO_CONTENT)
def disable_share(trip: Trip = Depends(get_owned_trip), db: Session = Depends(get_db)) -> None:
    shared = db.scalar(select(SharedTrip).where(SharedTrip.trip_id == trip.id))
    if shared:
        shared.is_active = False
        shared.expires_at = datetime.now(timezone.utc).replace(tzinfo=None)
        db.commit()


@router.get('/shared/{share_token}', response_model=PublicTripRead)
def read_shared_itinerary(share_token: str, db: Session = Depends(get_db)) -> PublicTripRead:
    return get_public_trip(db, share_token)
