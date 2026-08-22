# TripWise SQL Fixtures

Run the files in order against MySQL 8.0 or newer:

```bash
mysql -u root -p < 001_initial_schema.sql
mysql -u root -p tripwise < 002_seed_reference_data.sql
```

The schema is additive and uses `CREATE TABLE IF NOT EXISTS`. The reference seed is repeatable by city/activity slug.

Private users, trips, stops, expenses, and shares are intentionally created through the application layer in later phases so authentication, password hashing, and ownership checks remain the source of truth.
