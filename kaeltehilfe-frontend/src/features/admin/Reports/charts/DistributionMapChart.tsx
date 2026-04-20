import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import {
  DistributionsLayer,
  FitBoundsButton,
  KeyedMarkerRegistry,
  ZoomButtons,
} from "../../../../common/components/Map";
import { Distribution } from "../../../../common/data";

import "leaflet/dist/leaflet.css";

const defaultLocation = { lat: 48.40628334508064, lng: 9.993206261642712 };
const defaultZoom = 13;

type Props = { distributions: Distribution[] };

export const DistributionMapChart = ({ distributions }: Props) => {
  const registryRef = React.useRef<KeyedMarkerRegistry<unknown>>({} as KeyedMarkerRegistry<unknown>);

  const validDistributions = distributions.filter(
    (d) => d.geoLocation?.lat !== 0 || d.geoLocation?.lng !== 0,
  );

  return (
    <MapContainer
      center={defaultLocation}
      zoom={defaultZoom}
      maxZoom={20}
      minZoom={8}
      zoomControl={false}
      attributionControl={true}
      scrollWheelZoom={true}
      style={{ height: 760, width: "100%", borderRadius: 8 }}
    >
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={20}
        maxNativeZoom={19}
      />
      <ZoomButtons />
      <FitBoundsButton
        registryRefs={[registryRef]}
        disabled={validDistributions.length === 0}
      />
      <DistributionsLayer
        distributions={validDistributions}
        groupByDate
        registryRef={registryRef}
        resetFocusedGeoLocation={() => {}}
      />
    </MapContainer>
  );
};
