import { TextInput } from "@mantine/core";
import { MapContainer, TileLayer } from "react-leaflet";
import { GeoLocation } from "../../../common/data";
import { Flag } from "../shared/Flag";
import { PlusMarker } from "../shared/Marker";
import { useDistributionFormContext } from "./DistributionFormContext";

export const FormLocation = () => {
  const form = useDistributionFormContext();

  const { geoLocation } = form.values;

  const zoom = 18;

  return (
    <>
      {geoLocation && (
        <MapContainer
          center={geoLocation}
          zoom={zoom}
          minZoom={zoom}
          maxZoom={zoom}
          zoomControl={false}
          attributionControl={true}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          className="map-container"
          dragging={false}
        >
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={zoom}
            minZoom={zoom}
            maxNativeZoom={zoom}
          />
          <CurrentLocationFlag lat={geoLocation.lat} lng={geoLocation.lng} />
        </MapContainer>
      )}
      {/* <InputLabel required={!geoLocation} w="100%" mt="lg" mb="xs">
        Ort
      </InputLabel> */}
      <TextInput
        {...form.getInputProps("locationName")}
        data-autofocus
        label="Ort"
        withAsterisk
        placeholder="Ort"
        mt="md"
        required
      />
    </>
  );
};

const CurrentLocationFlag = ({ lat, lng }: GeoLocation) => {
  return (
    <Flag
      lat={lat}
      lng={lng}
      height={60}
      width={35}
      className="pointer-normal"
      marker={<PlusMarker height={60} />}
    ></Flag>
  );
};
