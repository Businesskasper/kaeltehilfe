-- Step 1: Update planner statistics
-- The query planner relies on up-to-date statistics to choose GiST indexes for KNN searches and spatial predicates. Without this, indexes may be ignored.

ANALYZE osm.building_point;
ANALYZE osm.building_polygon;