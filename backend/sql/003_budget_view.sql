-- Optional read-only helper view for Phase 4 budget services.
-- It is safe to skip this file if the application prefers a service query.

USE tripwise;

CREATE OR REPLACE VIEW trip_budget_category_totals AS
SELECT
  costs.trip_id,
  costs.category,
  SUM(costs.amount) AS category_total
FROM (
  SELECT trip_id, 'activities' AS category, estimated_cost AS amount
  FROM trip_activities
  UNION ALL
  SELECT trip_id, category, amount
  FROM expenses
) AS costs
GROUP BY costs.trip_id, costs.category;
