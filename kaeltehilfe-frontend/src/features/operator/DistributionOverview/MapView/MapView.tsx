import { useDisclosure } from "@mantine/hooks";
import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import { useBrowserStorage } from "../../../../common/utils";
import {
  AddDistributionFlag,
  LocationTracker,
  ZoomButtons,
} from "./MapControls";

import "./MapView.scss";

const defaultLocation = { lat: 48.40628334508064, lng: 9.993206261642712 };
const STORAGE_KEY_MAP_STATE = "mapView_state";

type MapState = {
  center: { lat: number; lng: number } | null;
  zoom: number;
  isTracking: boolean;
};

const defaultMapState: MapState = {
  center: null,
  zoom: 18,
  isTracking: true,
};

export const MapView = () => {
  // Use browser storage for map state persistence
  const [storedState, setStoredState] = useBrowserStorage<MapState>(
    "SESSION",
    STORAGE_KEY_MAP_STATE,
    defaultMapState,
  );

  const [isTracking, { toggle: toggleTracking }] = useDisclosure(
    storedState.isTracking,
  );
  const [mapCenter, setMapCenter] = React.useState(() =>
    !storedState.isTracking && storedState.center
      ? storedState.center
      : defaultLocation,
  );
  const [mapZoom, setMapZoom] = React.useState(storedState.zoom);
  const [geoLocation, setGeoLocation] = React.useState(defaultLocation);

  const updateGeoLocation = React.useCallback(
    (location: { lat: number; lng: number }) => setGeoLocation(location),
    [],
  );
  const updateMapCenter = React.useCallback(
    (center: { lat: number; lng: number }) => setMapCenter(center),
    [],
  );
  const updateMapZoom = React.useCallback(
    (zoom: number) => setMapZoom(zoom),
    [],
  );

  // Save map state: when tracking is enabled, preserve last manual center; always save zoom
  React.useEffect(() => {
    setStoredState((prev) => {
      const zoomChanged = prev.zoom !== mapZoom;
      const trackingChanged = prev.isTracking !== isTracking;
      const centerChanged =
        !prev.center ||
        prev.center.lat !== mapCenter.lat ||
        prev.center.lng !== mapCenter.lng;

      if (!zoomChanged && !trackingChanged && (!centerChanged || isTracking)) {
        return prev;
      }

      return {
        center: isTracking ? prev.center : mapCenter,
        zoom: mapZoom,
        isTracking,
      };
    });
  }, [mapCenter, mapZoom, isTracking, setStoredState]);

  const navigate = useNavigate();
  const newDistribution = () => {
    navigate("/add", {
      state: {
        hideLocationForm: true,
        lat: geoLocation.lat,
        lng: geoLocation.lng,
      },
    });
  };

  return (
    <div className="map-view">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        maxZoom={20}
        minZoom={12}
        zoomControl={false}
        attributionControl={true}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        style={{ minHeight: "100%", position: "relative", zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={20}
          minZoom={12}
        />
        {mapCenter?.lat && (
          <AddDistributionFlag
            lat={mapCenter.lat}
            lng={mapCenter.lng}
            onClick={newDistribution}
          />
        )}

        <ZoomButtons />
        <LocationTracker
          isTracking={isTracking}
          toggleTracking={toggleTracking}
          bubbleGeoLocation={updateGeoLocation}
          bubbleMapCenter={updateMapCenter}
          bubbleMapZoom={updateMapZoom}
          initialMapCenter={!isTracking ? mapCenter : undefined}
          initialMapZoom={mapZoom}
        />
        {/* <AddDistributionButton onClick={newDistribution} /> */}
        {/* <NumbZone /> */}
      </MapContainer>
    </div>
  );
};
