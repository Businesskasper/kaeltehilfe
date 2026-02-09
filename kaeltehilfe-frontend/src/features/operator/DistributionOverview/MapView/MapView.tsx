import { notifications } from "@mantine/notifications";
import { IconExclamationMark } from "@tabler/icons-react";
import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import { GeoLocation } from "../../../../common/data";
import { compareByDateOnly, useBrowserStorage } from "../../../../common/utils";
import { DistributionsLayer } from "./DistributionsLayer";
import {
  LocationTracker,
  StaticAddDistributionFlag,
  ZoomButtons,
} from "./MapControls";
import { ViewControls } from "./ViewControls";

import "./MapView.scss";

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

export const MapView = () => {
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

  const now = new Date();
  const queryTo = new Date(now.setHours(23, 59, 59, 999));
  const lastWeek = new Date(now.setDate(now.getDate() - 7));
  const queryFrom = new Date(lastWeek.setHours(0, 0, 0, 0));

  const [selectedDate, setSelectedDate] = React.useState<Date>(queryTo);

  const navigate = useNavigate();

  const lat = storedState?.center?.lat;
  const lng = storedState?.center.lng;

  const onNewDistributionClick = React.useCallback(() => {
    const canAdd = compareByDateOnly(selectedDate, queryTo) === 0;
    console.log(selectedDate, queryTo);
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
  }, [selectedDate, queryTo, navigate, lat, lng]);

  return (
    <div className="map-view">
      <ViewControls
        setSelectedDate={setSelectedDate}
        selectedDate={selectedDate}
        minDay={queryFrom}
        maxDay={queryTo}
      />

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
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={20}
          minZoom={12}
          maxNativeZoom={19}
        />
        {storedState.center?.lat && (
          <StaticAddDistributionFlag onClick={onNewDistributionClick} />
        )}
        <ZoomButtons
          lat={storedState.center.lat}
          lng={storedState.center.lng}
        />
        <LocationTracker
          isTracking={storedState.isTracking}
          setIsTracking={setIsTracking}
          bubbleMapCenter={updateMapCenter}
          bubbleMapZoom={updateMapZoom}
          initialMapCenter={storedState.center}
          initialMapZoom={storedState.zoom}
        />
        <DistributionsLayer
          from={queryFrom}
          to={queryTo}
          selectedDate={selectedDate}
          onClusterClick={() => setIsTracking(false)}
        />
      </MapContainer>
    </div>
  );
};
