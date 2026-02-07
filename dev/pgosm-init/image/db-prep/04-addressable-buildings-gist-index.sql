-- Step 4: Partial GiST indexes for addressable buildings only
-- The nearest_building function explicitly filters on buildings that have at least a house number and street.
-- Benefits:
--   - smaller index size
--   - fewer false candidates
--   - faster KNN ordering and containment checks
-- This directly optimizes all candidate lookups.

CREATE INDEX IF NOT EXISTS idx_building_point_addr_geom
ON osm.building_point
USING GIST (geom)
WHERE housenumber IS NOT NULL
  AND street IS NOT NULL;


CREATE INDEX IF NOT EXISTS idx_building_polygon_addr_geom
ON osm.building_polygon
USING GIST (geom)
WHERE housenumber IS NOT NULL
  AND street IS NOT NULL;