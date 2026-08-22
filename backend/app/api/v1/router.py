from fastapi import APIRouter

from app.api.v1.endpoints import activities, auth, budget, cities, expenses, sharing, trip_activities, trip_stops, trips, users

api_router = APIRouter()
api_router.include_router(auth.router, prefix='/auth', tags=['auth'])
api_router.include_router(users.router, prefix='/users', tags=['users'])
api_router.include_router(trips.router, prefix='/trips', tags=['trips'])
api_router.include_router(trip_stops.router, prefix='/trips', tags=['trip stops'])
api_router.include_router(trip_activities.router, prefix='/trips', tags=['trip activities'])
api_router.include_router(expenses.router, prefix='/trips', tags=['expenses'])
api_router.include_router(budget.router, prefix='/trips', tags=['budget'])
api_router.include_router(cities.router, prefix='/cities', tags=['cities'])
api_router.include_router(activities.router, prefix='/activities', tags=['activities'])
api_router.include_router(sharing.router, tags=['sharing'])
