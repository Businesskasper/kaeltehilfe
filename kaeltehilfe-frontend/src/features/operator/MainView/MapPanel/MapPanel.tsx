import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import {
  CommentsLayer,
  DistributionsLayer,
  ZoomButtons,
} from "../../../../common/components/Map";
import { Comment, Distribution, GeoLocation } from "../../../../common/data";
import { compareByDateOnly, useBrowserStorage } from "../../../../common/utils";
import { LayerToggleButtons, LocationTracker } from "./MapControls";

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
  showDistributions: boolean;
  toggleShowDistributions: () => void;
  showComments: boolean;
  toggleShowComments: () => void;
  comments: Array<Comment>;
  focusedCommentGeoLocation?: GeoLocation;
  resetFocusedCommentGeoLocation: () => void;
  onCenterChange: (center: GeoLocation) => void;
};
export const MapPanel = ({
  mapRef,
  selectedDate,
  distributions,
  focusedGeoLocation,
  resetFocusedGeoLocation,
  showDistributions,
  toggleShowDistributions,
  showComments,
  toggleShowComments,
  comments,
  focusedCommentGeoLocation,
  resetFocusedCommentGeoLocation,
  onCenterChange,
}: MapPanelProps) => {
  const distributionsToDisplay = React.useMemo(
    () =>
      (distributions || []).filter(
        (dist) => compareByDateOnly(dist.timestamp, selectedDate) === 0,
      ),
    [distributions, selectedDate],
  );

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
      onCenterChange(pos);
    },
    [setStoredState, onCenterChange],
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

  React.useEffect(() => {
    if (focusedGeoLocation) {
      setStoredState((prev) => ({
        ...prev,
        isTracking: false,
      }));
    }
  }, [focusedGeoLocation, setStoredState]);

  const onFitBounds = React.useCallback(() => {
    setIsTracking(false);
  }, [setIsTracking]);

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
        <ZoomButtons />
        <LayerToggleButtons
          showDistributions={showDistributions}
          toggleShowDistributions={toggleShowDistributions}
          showComments={showComments}
          toggleShowComments={toggleShowComments}
        />
        <LocationTracker
          isTracking={storedState.isTracking}
          setIsTracking={setIsTracking}
          bubbleMapCenter={updateMapCenter}
          bubbleMapZoom={updateMapZoom}
          initialMapCenter={storedState.center}
          initialMapZoom={storedState.zoom}
        />
        {showDistributions && (
          <DistributionsLayer
            distributions={distributionsToDisplay}
            focusedGeoLocation={focusedGeoLocation}
            resetFocusedGeoLocation={resetFocusedGeoLocation}
            onFitBounds={onFitBounds}
          />
        )}
        {showComments && (
          <CommentsLayer
            comments={comments}
            focusedGeoLocation={focusedCommentGeoLocation}
            resetFocusedGeoLocation={resetFocusedCommentGeoLocation}
            onFitBounds={onFitBounds}
          />
        )}
      </MapContainer>
  );
};
