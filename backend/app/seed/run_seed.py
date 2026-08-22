from app.db.session import SessionLocal
from app.seed.reference import seed_reference_data


if __name__ == '__main__':
    with SessionLocal() as db:
        seed_reference_data(db)
    print('TripWise reference data seeded.')
