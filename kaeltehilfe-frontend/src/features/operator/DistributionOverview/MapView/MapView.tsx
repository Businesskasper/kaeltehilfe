import { useComputedColorScheme } from "@mantine/core";
import {
  useDebouncedValue,
  useOrientation,
  useResizeObserver,
} from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconExclamationMark } from "@tabler/icons-react";
import { Map } from "leaflet";
import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { Group, Panel, Separator } from "react-resizable-panels";
import { useNavigate } from "react-router-dom";
import { GeoLocation, useDistribtions } from "../../../../common/data";
import {
  compareByDateOnly,
  useBrowserStorage,
  useCachedLayout,
} from "../../../../common/utils";
import { DistributionsLayer } from "./DistributionsLayer";
import {
  LocationTracker,
  StaticAddDistributionFlag,
  ZoomButtons,
} from "./MapControls";
import { ViewControls } from "./ViewControls";

import { ListView } from "./ListView";
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

  const { type: orientationType } = useOrientation({
    getInitialValueInEffect: false,
  });
  const groupOrientation =
    orientationType === "landscape-primary" ||
    orientationType === "landscape-secondary"
      ? "horizontal"
      : "vertical";
  const colorScheme = useComputedColorScheme();

  const [isDetailsOpen, setIsDetailsOpen] = useBrowserStorage(
    "SESSION",
    "OPERATOR_DETAILS_OPEN",
    false,
  );

  const toggleDetailsOpen = React.useCallback(() => {
    setIsDetailsOpen((open) => !open);
  }, [setIsDetailsOpen]);

  const mapRef = React.useRef<Map>(null);
  const [ref, rect] = useResizeObserver();
  const watchablePos = `${rect.top}:${rect.bottom}:${rect.left}:${rect.right}`;
  const [debouncedRect] = useDebouncedValue(watchablePos, 200);
  React.useEffect(() => {
    mapRef?.current?.invalidateSize();
  }, [debouncedRect]);

  const { defaultLayout, onLayoutChanged } = useCachedLayout({
    currentPanels: isDetailsOpen
      ? ["details-panel", "map-panel"]
      : ["map-panel"],
    initialLayout: {
      panels: ["details-panel", "map-panel"],
      panelConfigs: { "details-panel": 30, "map-panel": 70 },
    },
  });

  const now = new Date();
  const queryTo = new Date(now.setHours(23, 59, 59, 999));
  const lastWeek = new Date(now.setDate(now.getDate() - 7));
  const queryFrom = new Date(lastWeek.setHours(0, 0, 0, 0));

  const [selectedDate, setSelectedDate] = React.useState<Date>(queryTo);

  const {
    query: { data: distributions },
  } = useDistribtions({ from: queryFrom, to: queryTo });

  const navigate = useNavigate();

  const lat = storedState?.center?.lat;
  const lng = storedState?.center.lng;

  const onNewDistributionClick = React.useCallback(() => {
    const canAdd = compareByDateOnly(selectedDate, queryTo) === 0;
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

  return (
    <div className="operator-view">
      <ViewControls
        toggleDetailsOpen={toggleDetailsOpen}
        setSelectedDate={setSelectedDate}
        selectedDate={selectedDate}
        minDay={queryFrom}
        maxDay={queryTo}
      />

      <Group
        onLayoutChanged={onLayoutChanged}
        defaultLayout={defaultLayout}
        className="container"
        orientation={groupOrientation}
      >
        <Panel
          id="map-panel"
          className="map-view"
          defaultSize={isDetailsOpen ? 70 : 100}
          elementRef={ref}
        >
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
              distributions={distributions}
              selectedDate={selectedDate}
              onClusterClick={() => setIsTracking(false)}
            />
          </MapContainer>
        </Panel>
        {isDetailsOpen && (
          <>
            <Separator
              className={`panel-divider ${groupOrientation} ${colorScheme}`}
            />
            <Panel
              collapsible
              defaultSize={30}
              minSize={0}
              id="details-panel"
              className="details-view"
            >
              <ListView
                selectedDate={selectedDate}
                distributions={distributions}
              />
            </Panel>
          </>
        )}
      </Group>
    </div>
  );
};
