-- 3) GiST index on building_polygon geometry
-- Required for:
--     - ST_Covers / ST_Contains (containment check)
--     - ORDER BY geom <-> point (KNN distance ordering)

-- This index is used in function "nearest_building":
--     - step 1 (point-in-polygon test)
--     - step 3 (nearest polygon candidate)

CREATE INDEX IF NOT EXISTS idx_building_polygon_geom
ON osm.building_polygon
USING GIST (geom);