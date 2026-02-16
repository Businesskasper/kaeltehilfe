import { notifications } from "@mantine/notifications";
import { IconExclamationMark } from "@tabler/icons-react";
import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import { Distribution, GeoLocation } from "../../../../common/data";
import { compareByDateOnly, useBrowserStorage } from "../../../../common/utils";
import { DistributionsLayer } from "./DistributionsLayer";
import {
  LocationTracker,
  StaticAddDistributionFlag,
  ZoomButtons,
} from "./MapControls";

const STORAGE_KEY_MAP_STATE = "mapView_state";

type MapState = {
  center: GeoLocation;
  zoom: number;
  isTracking: boolean;
};

const defaultLocation = { lat: 48.40628334508064, lng: 9.993206261642712 };

const defaultMapState: MapState = {
  center: defaultLocation,
  zoom: 18,
  isTracking: true,
};

type MapPanelProps = {
  mapRef: React.RefObject<L.Map>;
  selectedDate: Date;
  distributions?: Array<Distribution>;
  focusedGeoLocation?: GeoLocation;
  resetFocusedGeoLocation: () => void;
};
export const MapPanel = ({
  mapRef,
  selectedDate,
  distributions,
  focusedGeoLocation,
  resetFocusedGeoLocation,
}: MapPanelProps) => {
  // Use browser storage for map state persistence
  const [storedState, setStoredState] = useBrowserStorage<MapState>(
    "SESSION",
    STORAGE_KEY_MAP_STATE,
    defaultMapState,
  );

  const setIsTracking = React.useCallback(
    (isTracking: boolean) => {
      setStoredState((prev) => ({
        ...prev,
        isTracking,
      }));
    },
    [setStoredState],
  );

  const updateMapCenter = React.useCallback(
    (pos: GeoLocation) => {
      setStoredState((prev) => ({
        ...prev,
        center: pos,
      }));
    },
    [setStoredState],
  );

  const updateMapZoom = React.useCallback(
    (zoom: number) => {
      setStoredState((prev) => ({
        ...prev,
        zoom,
      }));
    },
    [setStoredState],
  );

  const navigate = useNavigate();

  const lat = storedState?.center?.lat;
  const lng = storedState?.center.lng;

  const now = new Date();
  const today = new Date(now.setHours(23, 59, 59, 999));

  const onNewDistributionClick = React.useCallback(() => {
    const canAdd = compareByDateOnly(selectedDate, today) === 0;
    if (!canAdd) {
      notifications.show({
        color: "yellow",
        icon: <IconExclamationMark />,
        withBorder: false,
        withCloseButton: true,
        mb: "xs",
        message: "Zum Hinzufügen bitte zum aktuellen Tag wechseln",
      });
      return;
    }

    navigate("/add", {
      state: {
        lat,
        lng,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, navigate, lat, lng]);

  React.useEffect(() => {
    if (focusedGeoLocation) {
      setStoredState((prev) => ({
        ...prev,
        isTracking: false,
      }));
    }
  }, [focusedGeoLocation, setStoredState]);

  return (
    <MapContainer
      center={storedState.center}
      zoom={storedState.zoom}
      maxZoom={20}
      minZoom={12}
      zoomControl={false}
      attributionControl={true}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      className="map-container"
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={20}
        minZoom={12}
        maxNativeZoom={19}
        className="tile-layer"
      />
      {/* <MapLibreTileLayer
              attribution='&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
              url="https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json"
              maxZoom={20}
              minZoom={12}
              // className="tile-layer"
            /> */}
      {storedState.center?.lat && (
        <StaticAddDistributionFlag onClick={onNewDistributionClick} />
      )}
      <ZoomButtons lat={storedState.center.lat} lng={storedState.center.lng} />
      <LocationTracker
        isTracking={storedState.isTracking}
        setIsTracking={setIsTracking}
        bubbleMapCenter={updateMapCenter}
        bubbleMapZoom={updateMapZoom}
        initialMapCenter={storedState.center}
        initialMapZoom={storedState.zoom}
      />
      <DistributionsLayer
        distributions={distributions}
        selectedDate={selectedDate}
        onClusterClick={() => setIsTracking(false)}
        focusedGeoLocation={focusedGeoLocation}
        resetFocusedGeoLocation={resetFocusedGeoLocation}
      />
    </MapContainer>
  );
};
