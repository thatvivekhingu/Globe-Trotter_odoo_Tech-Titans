from datetime import date, datetime, time
from decimal import Decimal

from sqlalchemy import BigInteger, Boolean, CheckConstraint, Date, DateTime, ForeignKey, ForeignKeyConstraint, Integer, Numeric, SmallInteger, String, Text, Time, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


AutoId = BigInteger().with_variant(Integer, 'sqlite')


class User(Base):
    __tablename__ = 'users'
    __table_args__ = (
        CheckConstraint("language_code IN ('en', 'hi')", name='chk_users_language'),
        CheckConstraint("role IN ('user', 'admin')", name='chk_users_role'),
    )

    id: Mapped[int] = mapped_column(AutoId, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str] = mapped_column(String(120))
    avatar_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    language_code: Mapped[str] = mapped_column(String(10), default='en')
    role: Mapped[str] = mapped_column(String(20), default='user')
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class City(Base):
    __tablename__ = 'cities'
    __table_args__ = (
        CheckConstraint('popularity_score BETWEEN 0 AND 100', name='chk_cities_popularity'),
        CheckConstraint("cost_index IN ('low', 'medium', 'high')", name='chk_cities_cost_index'),
    )

    id: Mapped[int] = mapped_column(AutoId, primary_key=True, autoincrement=True)
    slug: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120), index=True)
    country: Mapped[str] = mapped_column(String(120), index=True)
    region: Mapped[str] = mapped_column(String(120), index=True)
    latitude: Mapped[Decimal | None] = mapped_column(Numeric(9, 6), nullable=True)
    longitude: Mapped[Decimal | None] = mapped_column(Numeric(9, 6), nullable=True)
    popularity_score: Mapped[int] = mapped_column(SmallInteger, default=0)
    cost_index: Mapped[str] = mapped_column(String(10), default='medium')
    image_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    image_alt: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Trip(Base):
    __tablename__ = 'trips'
    __table_args__ = (
        CheckConstraint('end_date >= start_date', name='chk_trips_dates'),
        CheckConstraint('budget_limit IS NULL OR budget_limit >= 0', name='chk_trips_budget'),
        CheckConstraint("status IN ('draft', 'upcoming', 'in-progress', 'completed')", name='chk_trips_status'),
    )

    id: Mapped[int] = mapped_column(AutoId, primary_key=True, autoincrement=True)
    owner_user_id: Mapped[int] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'), index=True)
    name: Mapped[str] = mapped_column(String(160))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    start_date: Mapped[date] = mapped_column(Date)
    end_date: Mapped[date] = mapped_column(Date)
    currency: Mapped[str] = mapped_column(String(3), default='INR')
    budget_limit: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    cover_image_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default='draft', index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Activity(Base):
    __tablename__ = 'activities'
    __table_args__ = (
        CheckConstraint("category IN ('sightseeing', 'food', 'adventure', 'nature', 'shopping', 'culture', 'entertainment')", name='chk_activities_category'),
        CheckConstraint('default_cost >= 0', name='chk_activities_cost'),
        CheckConstraint('duration_minutes > 0', name='chk_activities_duration'),
    )

    id: Mapped[int] = mapped_column(AutoId, primary_key=True, autoincrement=True)
    city_id: Mapped[int] = mapped_column(ForeignKey('cities.id', ondelete='RESTRICT'), index=True)
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(160))
    category: Mapped[str] = mapped_column(String(30), index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    default_cost: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal('0'))
    duration_minutes: Mapped[int] = mapped_column(SmallInteger)
    image_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    image_alt: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class TripStop(Base):
    __tablename__ = 'trip_stops'
    __table_args__ = (
        UniqueConstraint('trip_id', 'stop_order', name='uq_trip_stop_order'),
        UniqueConstraint('id', 'trip_id', name='uq_trip_stop_pair'),
        CheckConstraint('departure_date >= arrival_date', name='chk_trip_stops_dates'),
    )

    id: Mapped[int] = mapped_column(AutoId, primary_key=True, autoincrement=True)
    trip_id: Mapped[int] = mapped_column(ForeignKey('trips.id', ondelete='CASCADE'), index=True)
    city_id: Mapped[int] = mapped_column(ForeignKey('cities.id', ondelete='RESTRICT'), index=True)
    arrival_date: Mapped[date] = mapped_column(Date)
    departure_date: Mapped[date] = mapped_column(Date)
    stop_order: Mapped[int] = mapped_column(SmallInteger)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class TripActivity(Base):
    __tablename__ = 'trip_activities'
    __table_args__ = (
        ForeignKeyConstraint(
            ['trip_stop_id', 'trip_id'],
            ['trip_stops.id', 'trip_stops.trip_id'],
            name='fk_trip_activities_stop_trip',
            ondelete='CASCADE',
        ),
        ForeignKeyConstraint(['activity_id'], ['activities.id'], name='fk_trip_activities_activity', ondelete='RESTRICT'),
        UniqueConstraint('trip_stop_id', 'activity_order', name='uq_trip_activity_order'),
        CheckConstraint('estimated_cost >= 0', name='chk_trip_activities_cost'),
        CheckConstraint('duration_minutes > 0', name='chk_trip_activities_duration'),
    )

    id: Mapped[int] = mapped_column(AutoId, primary_key=True, autoincrement=True)
    trip_id: Mapped[int] = mapped_column(ForeignKey('trips.id', ondelete='CASCADE'), index=True)
    trip_stop_id: Mapped[int] = mapped_column(index=True)
    activity_id: Mapped[int] = mapped_column(index=True)
    scheduled_date: Mapped[date] = mapped_column(Date)
    start_time: Mapped[time] = mapped_column(Time)
    duration_minutes: Mapped[int] = mapped_column(SmallInteger)
    estimated_cost: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal('0'))
    activity_order: Mapped[int] = mapped_column(SmallInteger)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Expense(Base):
    __tablename__ = 'expenses'
    __table_args__ = (
        CheckConstraint("category IN ('transportation', 'accommodation', 'activities', 'food', 'other')", name='chk_expenses_category'),
        CheckConstraint('amount >= 0', name='chk_expenses_amount'),
    )

    id: Mapped[int] = mapped_column(AutoId, primary_key=True, autoincrement=True)
    trip_id: Mapped[int] = mapped_column(ForeignKey('trips.id', ondelete='CASCADE'), index=True)
    category: Mapped[str] = mapped_column(String(30), index=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    description: Mapped[str] = mapped_column(String(255))
    expense_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    is_actual: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class SharedTrip(Base):
    __tablename__ = 'shared_trips'
    __table_args__ = (
        UniqueConstraint('share_token', name='uq_shared_trips_token'),
        UniqueConstraint('trip_id', name='uq_shared_trips_trip'),
    )

    id: Mapped[int] = mapped_column(AutoId, primary_key=True, autoincrement=True)
    trip_id: Mapped[int] = mapped_column(ForeignKey('trips.id', ondelete='CASCADE'), index=True)
    share_token: Mapped[str] = mapped_column(String(32), index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class SavedDestination(Base):
    __tablename__ = 'saved_destinations'

    user_id: Mapped[int] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'), primary_key=True)
    city_id: Mapped[int] = mapped_column(ForeignKey('cities.id', ondelete='CASCADE'), primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
