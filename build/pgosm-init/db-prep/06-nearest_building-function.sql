-- Step 6: Create function to get the nearest building to a point

CREATE OR REPLACE FUNCTION nearest_building(
    lat double precision,
    lon double precision,
    buildingPointRadius integer
)
RETURNS TABLE (
    housenumber text,
    street text,
    city text,
    postcode text,
    address text,
    distance_m double precision
)
AS $$
DECLARE
    p geometry := ST_SetSRID(ST_MakePoint(lon, lat), 4326);

    -- Candidates
    point_rec RECORD;
    polygon_rec RECORD;
BEGIN
    -- 1) Point withing building_polygon -> direct hit
    RETURN QUERY
    SELECT
        b.housenumber,
        b.street,
        b.city,
        b.postcode,
        b.address,
        0.0::double precision AS distance_m
    FROM osm.building_polygon b
    WHERE
        b.housenumber IS NOT NULL
        AND b.street IS NOT NULL
        AND ST_Covers(b.geom, p)
    LIMIT 1;

    IF FOUND THEN
        RETURN;
    END IF;

    -- 2) Determine next building_point
    SELECT
        b.housenumber,
        b.street,
        b.city,
        b.postcode,
        b.address,
        ST_Distance(b.geom::geography, p::geography) AS distance_m
    INTO point_rec
    FROM osm.building_point b
    WHERE
        b.housenumber IS NOT NULL
        AND b.street IS NOT NULL
    ORDER BY b.geom <-> p
    LIMIT 1;

    -- 3) Determine next building_polygon
    SELECT
        b.housenumber,
        b.street,
        b.city,
        b.postcode,
        b.address,
        ST_Distance(b.geom::geography, p::geography) AS distance_m
    INTO polygon_rec
    FROM osm.building_polygon b
    WHERE
        b.housenumber IS NOT NULL
        AND b.street IS NOT NULL
    ORDER BY b.geom <-> p
    LIMIT 1;

    -- 4) Decide between candidates

    -- No building_polygon -> use building_point
    IF polygon_rec IS NULL THEN
        RETURN QUERY SELECT
            point_rec.housenumber,
            point_rec.street,
            point_rec.city,
            point_rec.postcode,
            point_rec.address,
            point_rec.distance_m;
        RETURN;
    END IF;

    -- No building_point -> use building_polygon
    IF point_rec IS NULL THEN
        RETURN QUERY SELECT
            polygon_rec.housenumber,
            polygon_rec.street,
            polygon_rec.city,
            polygon_rec.postcode,
            polygon_rec.address,
            polygon_rec.distance_m;
        RETURN;
    END IF;

    -- Point within buildingPointRadius -> building_point wins
    IF point_rec.distance_m <= buildingPointRadius THEN
        RETURN QUERY SELECT
            point_rec.housenumber,
            point_rec.street,
            point_rec.city,
            point_rec.postcode,
            point_rec.address,
            point_rec.distance_m;
        RETURN;
    END IF;

    -- building_polygon is nearer than building_point -> building_polygon wins
    -- TODO: don't we have to calc building_point with radius?
    IF polygon_rec.distance_m < point_rec.distance_m THEN
        RETURN QUERY SELECT
            polygon_rec.housenumber,
            polygon_rec.street,
            polygon_rec.city,
            polygon_rec.postcode,
            polygon_rec.address,
            polygon_rec.distance_m;
        RETURN;
    END IF;

    -- Fallback to point
    RETURN QUERY SELECT
        point_rec.housenumber,
        point_rec.street,
        point_rec.city,
        point_rec.postcode,
        point_rec.address,
        point_rec.distance_m;
END;
$$ LANGUAGE plpgsql;