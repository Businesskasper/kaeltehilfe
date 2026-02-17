import { Marker } from "leaflet";
import React from "react";
import { useMap } from "react-leaflet";
import { MarkerClusterGroupProps } from "react-leaflet-markercluster";
import { GeoLocation } from "../../data";
import { groupBy } from "../../utils";

type MarkerClusterGroupIconCreateFunctionCluster = Parameters<
  Exclude<MarkerClusterGroupProps["iconCreateFunction"], undefined>
>[0];

export type Cluster = object & { spiderfy: () => void };

export const hasLeafletParent = (
  obj: unknown,
): obj is object & { __parent: object } => {
  return !!obj && typeof obj === "object" && "__parent" in obj;
};

export const isLeafletCluster = (obj: unknown): obj is Cluster => {
  return !!obj && typeof obj === "object" && "spiderfy" in obj;
};

type MarkerRegistryEntry<TData> = {
  data: Array<TData>;
  marker: Marker | null;
  cluster: Cluster | null;
};

export type KeyedMarkerRegistry<TData> = {
  [key: string]: MarkerRegistryEntry<TData>;
};

type UseMarkerRegistryProps<TData> = {
  data: Array<TData>;
  getGeoLocation: (item: TData) => GeoLocation;
};

export const useMarkerRegistry = <TData,>({
  data,
  getGeoLocation,
}: UseMarkerRegistryProps<TData>) => {
  const map = useMap();

  const registryRef = React.useRef<KeyedMarkerRegistry<TData>>(
    {} as KeyedMarkerRegistry<TData>,
  );

  const getMapEntry = React.useCallback(
    (geoLocation: GeoLocation): MarkerRegistryEntry<TData> | undefined => {
      const key = JSON.stringify(geoLocation);
      return registryRef.current[key];
    },
    [],
  );

  const setMapEntry = React.useCallback(
    (geoLocation: GeoLocation, entry: MarkerRegistryEntry<TData>) => {
      const key = JSON.stringify(geoLocation);
      registryRef.current[key] = entry;
    },
    [],
  );

  React.useEffect(() => {
    const byGeoLocation = groupBy(data, (d) => getGeoLocation(d));
    const geoLocations = Array.from(byGeoLocation.keys());

    registryRef.current = geoLocations.reduce((acc, geoLocation) => {
      const geoLocationData = byGeoLocation.get(geoLocation);
      if (!geoLocationData || geoLocationData.length === 0) return acc;
      const key = JSON.stringify(geoLocation);
      return {
        ...acc,
        [key]: {
          data: geoLocationData,
          marker: null,
          cluster: null,
        },
      };
    }, {} as KeyedMarkerRegistry<TData>);
  }, [data, getGeoLocation]);

  const trySetMarker = React.useCallback(
    (geoLocation: GeoLocation, marker: Marker | null) => {
      const existingEntry = getMapEntry(geoLocation);
      if (!existingEntry) return;
      setMapEntry(geoLocation, { ...existingEntry, marker });
    },
    [getMapEntry, setMapEntry],
  );

  const trySetCluster = React.useCallback(
    (geoLocation: GeoLocation, cluster: Cluster | null) => {
      const existingEntry = getMapEntry(geoLocation);
      if (!existingEntry) return;
      setMapEntry(geoLocation, { ...existingEntry, cluster });
    },
    [getMapEntry, setMapEntry],
  );

  const tryFocus = React.useCallback(
    (geoLocation: GeoLocation) => {
      const mapEntry = getMapEntry(geoLocation);
      if (mapEntry?.marker) {
        const { lat, lng } = mapEntry.marker.getLatLng();
        map.setView(
          // Slight offset to avoid overlap with the current location marker
          { lat: lat - 0.00005, lng: lng - 0.00005 },
          map.getMaxZoom(),
          { animate: false },
        );
      }
      setTimeout(() => {
        const isRendered =
          mapEntry?.marker && map.hasLayer(mapEntry.marker as L.Layer);
        if (!isRendered) {
          mapEntry?.cluster?.spiderfy();
        }
        mapEntry?.marker?.openPopup();
      }, 400);
    },
    [getMapEntry, map],
  );

  const onIconCreate = React.useCallback(
    (cluster: MarkerClusterGroupIconCreateFunctionCluster) => {
      const childMarkers = cluster.getAllChildMarkers();

      for (const childMarker of childMarkers) {
        const childLatLng = childMarker.getLatLng();
        // Update cluster and marker as safe guard in case anything changed
        trySetCluster(childLatLng, cluster);
        trySetMarker(childLatLng, childMarker);
      }
    },
    [trySetCluster, trySetMarker],
  );

  const getFlagRef = React.useCallback(
    (geoLocation: GeoLocation) => (marker: L.Marker | null) => {
      trySetMarker(geoLocation, marker);
      if (hasLeafletParent(marker) && isLeafletCluster(marker.__parent)) {
        trySetCluster(geoLocation, marker.__parent);
      }
    },
    [trySetMarker, trySetCluster],
  );

  return {
    getMapEntry,
    tryFocus,
    onIconCreate,
    getFlagRef,
    registryRef,
  };
};
