import { useDisclosure } from "@mantine/hooks";
import React from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import {
  AddDistributionButton,
  LocationTracker,
  ZoomButtons,
} from "./MapControls";

import "./MapView.scss";

const defaultLocation = { lat: 48.40628334508064, lng: 9.993206261642712 };

export const MapView = () => {
  const [isTracking, { toggle: toggleTracking }] = useDisclosure(true);

  const [geoLocation, setGeoLocation] = React.useState<{
    lat: number;
    lng: number;
  }>(defaultLocation);
  const updateGeoLocation = (location: { lat: number; lng: number }) =>
    setGeoLocation(location);

  const [mapCenter, setMapCenter] = React.useState<{
    lat: number;
    lng: number;
  }>(defaultLocation);
  const updateMapCenter = (center: { lat: number; lng: number }) =>
    setMapCenter(center);

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
    <div className="MapView">
      <MapContainer
        center={mapCenter}
        zoom={18}
        // zoom={zoomLevel}
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
          // updateWhenZooming
          minZoom={12}
        />
        {mapCenter?.lat && (
          <Marker position={mapCenter}>
            <Popup>Aktuelle Position</Popup>
          </Marker>
        )}
        <ZoomButtons />
        <LocationTracker
          isTracking={isTracking}
          toggleTracking={toggleTracking}
          bubbleGeoLocation={updateGeoLocation}
          bubbleMapCenter={updateMapCenter}
        />
        <AddDistributionButton onClick={newDistribution} />
        {/* <NumbZone /> */}
      </MapContainer>
    </div>
  );

  //   return (
  //     <div id="map" style={{ height: 500 }}>
  //       <MapContainer center={[51.505, -0.09]} zoom={13} scrollWheelZoom={false}>
  //         <TileLayer
  //           attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  //           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  //         />
  //         {/* <Marker position={[51.505, -0.09]}>
  //           <Popup>
  //             A pretty CSS3 popup. <br /> Easily customizable.
  //           </Popup>
  //         </Marker> */}
  //       </MapContainer>
  //     </div>
  //   );
};
