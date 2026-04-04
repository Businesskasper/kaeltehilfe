-- Step 2: GiST index on building_point geometry
-- Required for ORDER BY geom <-> point (KNN nearest-neighbor search)
-- This index is critical for efficiently finding the nearest building_point candidate.

CREATE INDEX IF NOT EXISTS idx_building_point_geom
ON osm.building_point
USING GIST (geom);