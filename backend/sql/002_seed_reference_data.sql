-- TripWise Phase 3: repeatable reference data
-- Run after 001_initial_schema.sql.
-- This file intentionally seeds cities and activities only. User passwords and private trips
-- are created by the application layer after password hashing and authorization exist.

USE tripwise;
SET NAMES utf8mb4;

INSERT INTO cities (
  slug, name, country, region, latitude, longitude, popularity_score, cost_index, image_url, image_alt
) VALUES
  ('ahmedabad', 'Ahmedabad', 'India', 'Gujarat', 23.022505, 72.571362, 74, 'medium', 'https://images.unsplash.com/photo-1613697193450-23f766dbaa73?auto=format&fit=crop&w=1200&q=85', 'A vintage espresso cup on a marble table, Grace Hazell on Unsplash'),
  ('mumbai', 'Mumbai', 'India', 'Maharashtra', 19.075984, 72.877656, 91, 'high', 'https://images.unsplash.com/photo-1600693003196-0b7ff400fdfd?auto=format&fit=crop&w=1200&q=85', 'Intricate Moorish architecture, Klaus Kreuer on Unsplash'),
  ('goa', 'Goa', 'India', 'Konkan Coast', 15.299326, 74.124008, 96, 'medium', 'https://images.unsplash.com/photo-1771605344513-f4300bc0affe?auto=format&fit=crop&w=1200&q=85', 'A warm coastal village at sunset, Enzo Cetrangolo on Unsplash'),
  ('delhi', 'Delhi', 'India', 'Delhi NCR', 28.613939, 77.209023, 88, 'medium', 'https://images.unsplash.com/photo-1600693003196-0b7ff400fdfd?auto=format&fit=crop&w=1200&q=85', 'Intricate Moorish architecture, Klaus Kreuer on Unsplash'),
  ('jaipur', 'Jaipur', 'India', 'Rajasthan', 26.912434, 75.787270, 93, 'medium', 'https://images.unsplash.com/photo-1600693003196-0b7ff400fdfd?auto=format&fit=crop&w=1200&q=85', 'Intricate Moorish architecture, Klaus Kreuer on Unsplash'),
  ('udaipur', 'Udaipur', 'India', 'Rajasthan', 24.585445, 73.712479, 87, 'medium', 'https://images.unsplash.com/photo-1661341533016-41514edea9e4?auto=format&fit=crop&w=1200&q=85', 'A serene mountain lake, Florian Delée on Unsplash'),
  ('bengaluru', 'Bengaluru', 'India', 'Karnataka', 12.971599, 77.594566, 82, 'medium', 'https://images.unsplash.com/photo-1624253346805-df69ad2b3d7f?auto=format&fit=crop&w=1200&q=85', 'A cozy wooden street, Roméo A. on Unsplash'),
  ('manali', 'Manali', 'India', 'Himachal Pradesh', 32.239632, 77.188713, 89, 'low', 'https://images.unsplash.com/photo-1661341533016-41514edea9e4?auto=format&fit=crop&w=1200&q=85', 'A serene mountain lake, Florian Delée on Unsplash')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  country = VALUES(country),
  region = VALUES(region),
  latitude = VALUES(latitude),
  longitude = VALUES(longitude),
  popularity_score = VALUES(popularity_score),
  cost_index = VALUES(cost_index),
  image_url = VALUES(image_url),
  image_alt = VALUES(image_alt);

INSERT INTO activities (
  city_id, slug, name, category, description, default_cost, duration_minutes, image_url, image_alt
)
SELECT c.id, seed.slug, seed.name, seed.category, seed.description, seed.default_cost, seed.duration_minutes, seed.image_url, seed.image_alt
FROM cities AS c
JOIN (
  SELECT 'goa' AS city_slug, 'goa-baga-beach-sunrise' AS slug, 'Baga Beach sunrise walk' AS name, 'nature' AS category, 'Start slowly with a shoreline walk before the coast gets busy.' AS description, 0.00 AS default_cost, 90 AS duration_minutes, 'https://images.unsplash.com/photo-1771605344513-f4300bc0affe?auto=format&fit=crop&w=1200&q=85' AS image_url, 'Warm coastal village at sunset, Enzo Cetrangolo on Unsplash' AS image_alt
  UNION ALL SELECT 'goa', 'goa-arabian-sea-scuba', 'Arabian Sea scuba dive', 'adventure', 'A beginner-friendly reef dive with a local instructor.', 3200.00, 180, 'https://images.unsplash.com/photo-1661341533016-41514edea9e4?auto=format&fit=crop&w=1200&q=85', 'Serene mountain lake, Florian Delée on Unsplash'
  UNION ALL SELECT 'goa', 'goa-home-style-thali', 'Home-style coastal thali', 'food', 'A generous tasting of coconut, spice, and fresh catch classics.', 850.00, 90, 'https://images.unsplash.com/photo-1614563637806-1d0e645e0940?auto=format&fit=crop&w=1200&q=85', 'Steaming bowl of authentic ramen, Susann Schuster on Unsplash'
  UNION ALL SELECT 'mumbai', 'mumbai-gateway-blue-hour', 'Gateway of India at blue hour', 'sightseeing', 'See the harbor lights come on from Mumbai’s most iconic promenade.', 0.00, 75, 'https://images.unsplash.com/photo-1600693003196-0b7ff400fdfd?auto=format&fit=crop&w=1200&q=85', 'Intricate Moorish architecture, Klaus Kreuer on Unsplash'
  UNION ALL SELECT 'mumbai', 'mumbai-fort-food-walk', 'Fort food walk', 'food', 'A small-group walk through old bakeries, cafés, and street stalls.', 1800.00, 150, 'https://images.unsplash.com/photo-1614563637806-1d0e645e0940?auto=format&fit=crop&w=1200&q=85', 'Steaming bowl of authentic ramen, Susann Schuster on Unsplash'
  UNION ALL SELECT 'jaipur', 'jaipur-amber-fort-trail', 'Amber Fort architecture trail', 'culture', 'Follow courtyards, mirror halls, and hilltop views with a local guide.', 1400.00, 180, 'https://images.unsplash.com/photo-1600693003196-0b7ff400fdfd?auto=format&fit=crop&w=1200&q=85', 'Intricate Moorish architecture, Klaus Kreuer on Unsplash'
  UNION ALL SELECT 'jaipur', 'jaipur-johari-bazaar', 'Johari Bazaar craft hour', 'shopping', 'Browse block prints, blue pottery, and small-batch jewelry.', 600.00, 120, 'https://images.unsplash.com/photo-1624253346805-df69ad2b3d7f?auto=format&fit=crop&w=1200&q=85', 'Cozy cobblestone street, Roméo A. on Unsplash'
  UNION ALL SELECT 'udaipur', 'udaipur-lake-pichola-sunset', 'Lake Pichola sunset boat', 'nature', 'A quiet evening on the lake with palace silhouettes in the distance.', 2200.00, 120, 'https://images.unsplash.com/photo-1661341533016-41514edea9e4?auto=format&fit=crop&w=1200&q=85', 'Serene mountain lake, Florian Delée on Unsplash'
  UNION ALL SELECT 'delhi', 'delhi-humayun-tomb-walk', 'Humayun’s Tomb heritage walk', 'culture', 'A thoughtful architecture and garden walk through old Delhi.', 900.00, 120, 'https://images.unsplash.com/photo-1600693003196-0b7ff400fdfd?auto=format&fit=crop&w=1200&q=85', 'Intricate Moorish architecture, Klaus Kreuer on Unsplash'
  UNION ALL SELECT 'manali', 'manali-solang-meadow-hike', 'Solang Valley meadow hike', 'adventure', 'A moderate hillside route with broad valley views.', 1100.00, 210, 'https://images.unsplash.com/photo-1661341533016-41514edea9e4?auto=format&fit=crop&w=1200&q=85', 'Serene mountain lake, Florian Delée on Unsplash'
  UNION ALL SELECT 'bengaluru', 'bengaluru-indiranagar-coffee-crawl', 'Indiranagar coffee crawl', 'food', 'A relaxed tasting route through three independent coffee counters.', 1250.00, 135, 'https://images.unsplash.com/photo-1613697193450-23f766dbaa73?auto=format&fit=crop&w=1200&q=85', 'Vintage espresso cup, Grace Hazell on Unsplash'
  UNION ALL SELECT 'ahmedabad', 'ahmedabad-heritage-pol-walk', 'Old city heritage pol walk', 'culture', 'A guided morning through carved façades, courtyards, and local stories.', 600.00, 120, 'https://images.unsplash.com/photo-1600693003196-0b7ff400fdfd?auto=format&fit=crop&w=1200&q=85', 'Intricate Moorish architecture, Klaus Kreuer on Unsplash'
) AS seed ON seed.city_slug = c.slug
ON DUPLICATE KEY UPDATE
  city_id = VALUES(city_id),
  name = VALUES(name),
  category = VALUES(category),
  description = VALUES(description),
  default_cost = VALUES(default_cost),
  duration_minutes = VALUES(duration_minutes),
  image_url = VALUES(image_url),
  image_alt = VALUES(image_alt);
