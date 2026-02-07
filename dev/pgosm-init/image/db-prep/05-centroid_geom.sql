-- Step 5: Refresh statistics after index creation
-- Ensures the planner is aware of the new partial indexes and can correctly prefer them during execution.

ANALYZE osm.building_point;
ANALYZE osm.building_polygon;