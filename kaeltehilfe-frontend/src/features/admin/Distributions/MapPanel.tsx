import { MapContainer, TileLayer } from "react-leaflet";
import {
  DistributionsLayer,
  ZoomButtons,
} from "../../../common/components/Map";
import { GeoLocation, useDistributions } from "../../../common/data";

const defaultLocation = { lat: 48.40628334508064, lng: 9.993206261642712 };
const defaultZoom = 16;

type MapPanelProps = {
  distHook: ReturnType<typeof useDistributions>;
  mapRef: React.RefObject<L.Map>;
  focusedGeoLocation?: GeoLocation;
  resetFocusedGeoLocation: () => void;
};
export const MapPanel = ({
  distHook,
  mapRef,
  focusedGeoLocation,
  resetFocusedGeoLocation,
}: MapPanelProps) => {
  const {
    objs: { data: distributions },
  } = distHook;

  return (
    <MapContainer
      center={defaultLocation}
      zoom={defaultZoom}
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

      {distributions && (
        <DistributionsLayer
          distributions={distributions}
          focusedGeoLocation={focusedGeoLocation}
          resetFocusedGeoLocation={resetFocusedGeoLocation}
        />
      )}
    </MapContainer>
  );
};
