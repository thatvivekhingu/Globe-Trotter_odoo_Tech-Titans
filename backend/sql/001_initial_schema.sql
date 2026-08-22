-- TripWise Phase 3: initial relational schema
-- Target: MySQL 8.0+
-- This script is intentionally additive and safe to run more than once.

CREATE DATABASE IF NOT EXISTS tripwise
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE tripwise;
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  avatar_url VARCHAR(2048) NULL,
  language_code VARCHAR(10) NOT NULL DEFAULT 'en',
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  CONSTRAINT chk_users_language CHECK (language_code IN ('en', 'hi')),
  CONSTRAINT chk_users_role CHECK (role IN ('user', 'admin'))
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cities (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug VARCHAR(80) NOT NULL,
  name VARCHAR(120) NOT NULL,
  country VARCHAR(120) NOT NULL,
  region VARCHAR(120) NOT NULL,
  latitude DECIMAL(9, 6) NULL,
  longitude DECIMAL(9, 6) NULL,
  popularity_score TINYINT UNSIGNED NOT NULL DEFAULT 0,
  cost_index VARCHAR(10) NOT NULL DEFAULT 'medium',
  image_url VARCHAR(2048) NULL,
  image_alt VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cities_slug (slug),
  KEY idx_cities_name (name),
  KEY idx_cities_country_region (country, region),
  KEY idx_cities_popularity (popularity_score),
  CONSTRAINT chk_cities_popularity CHECK (popularity_score BETWEEN 0 AND 100),
  CONSTRAINT chk_cities_cost_index CHECK (cost_index IN ('low', 'medium', 'high'))
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS trips (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  owner_user_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(160) NOT NULL,
  description TEXT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'INR',
  budget_limit DECIMAL(12, 2) UNSIGNED NULL,
  cover_image_url VARCHAR(2048) NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_trips_owner (owner_user_id),
  KEY idx_trips_owner_dates (owner_user_id, start_date, end_date),
  KEY idx_trips_status (status),
  CONSTRAINT fk_trips_owner FOREIGN KEY (owner_user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT chk_trips_dates CHECK (end_date >= start_date),
  CONSTRAINT chk_trips_budget CHECK (budget_limit IS NULL OR budget_limit >= 0),
  CONSTRAINT chk_trips_status CHECK (status IN ('draft', 'upcoming', 'in-progress', 'completed'))
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS activities (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  city_id BIGINT UNSIGNED NOT NULL,
  slug VARCHAR(120) NOT NULL,
  name VARCHAR(160) NOT NULL,
  category VARCHAR(30) NOT NULL,
  description TEXT NULL,
  default_cost DECIMAL(12, 2) UNSIGNED NOT NULL DEFAULT 0,
  duration_minutes SMALLINT UNSIGNED NOT NULL,
  image_url VARCHAR(2048) NULL,
  image_alt VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_activities_slug (slug),
  KEY idx_activities_city (city_id),
  KEY idx_activities_category (category),
  KEY idx_activities_city_category (city_id, category),
  CONSTRAINT fk_activities_city FOREIGN KEY (city_id) REFERENCES cities (id) ON DELETE RESTRICT,
  CONSTRAINT chk_activities_category CHECK (category IN ('sightseeing', 'food', 'adventure', 'nature', 'shopping', 'culture', 'entertainment')),
  CONSTRAINT chk_activities_cost CHECK (default_cost >= 0),
  CONSTRAINT chk_activities_duration CHECK (duration_minutes > 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS trip_stops (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  trip_id BIGINT UNSIGNED NOT NULL,
  city_id BIGINT UNSIGNED NOT NULL,
  arrival_date DATE NOT NULL,
  departure_date DATE NOT NULL,
  stop_order SMALLINT UNSIGNED NOT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_trip_stop_order (trip_id, stop_order),
  UNIQUE KEY uq_trip_stop_pair (id, trip_id),
  KEY idx_trip_stops_trip_dates (trip_id, arrival_date, departure_date),
  KEY idx_trip_stops_city (city_id),
  CONSTRAINT fk_trip_stops_trip FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE,
  CONSTRAINT fk_trip_stops_city FOREIGN KEY (city_id) REFERENCES cities (id) ON DELETE RESTRICT,
  CONSTRAINT chk_trip_stops_dates CHECK (departure_date >= arrival_date)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS trip_activities (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  trip_id BIGINT UNSIGNED NOT NULL,
  trip_stop_id BIGINT UNSIGNED NOT NULL,
  activity_id BIGINT UNSIGNED NOT NULL,
  scheduled_date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration_minutes SMALLINT UNSIGNED NOT NULL,
  estimated_cost DECIMAL(12, 2) UNSIGNED NOT NULL DEFAULT 0,
  activity_order SMALLINT UNSIGNED NOT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_trip_activity_order (trip_stop_id, activity_order),
  KEY idx_trip_activities_trip_date (trip_id, scheduled_date, start_time),
  KEY idx_trip_activities_stop (trip_stop_id),
  KEY idx_trip_activities_activity (activity_id),
  CONSTRAINT fk_trip_activities_stop_trip FOREIGN KEY (trip_stop_id, trip_id) REFERENCES trip_stops (id, trip_id) ON DELETE CASCADE,
  CONSTRAINT fk_trip_activities_activity FOREIGN KEY (activity_id) REFERENCES activities (id) ON DELETE RESTRICT,
  CONSTRAINT chk_trip_activities_cost CHECK (estimated_cost >= 0),
  CONSTRAINT chk_trip_activities_duration CHECK (duration_minutes > 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS expenses (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  trip_id BIGINT UNSIGNED NOT NULL,
  category VARCHAR(30) NOT NULL,
  amount DECIMAL(12, 2) UNSIGNED NOT NULL,
  description VARCHAR(255) NOT NULL,
  expense_date DATE NULL,
  is_actual BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_expenses_trip_category (trip_id, category),
  KEY idx_expenses_trip_date (trip_id, expense_date),
  CONSTRAINT fk_expenses_trip FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE,
  CONSTRAINT chk_expenses_category CHECK (category IN ('transportation', 'accommodation', 'activities', 'food', 'other')),
  CONSTRAINT chk_expenses_amount CHECK (amount >= 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS shared_trips (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  trip_id BIGINT UNSIGNED NOT NULL,
  share_token CHAR(32) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_shared_trips_token (share_token),
  UNIQUE KEY uq_shared_trips_trip (trip_id),
  KEY idx_shared_trips_active (is_active, expires_at),
  CONSTRAINT fk_shared_trips_trip FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS saved_destinations (
  user_id BIGINT UNSIGNED NOT NULL,
  city_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, city_id),
  KEY idx_saved_destinations_city (city_id),
  CONSTRAINT fk_saved_destinations_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_saved_destinations_city FOREIGN KEY (city_id) REFERENCES cities (id) ON DELETE CASCADE
) ENGINE=InnoDB;
