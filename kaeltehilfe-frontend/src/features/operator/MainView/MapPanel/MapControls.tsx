import {
  ActionIcon,
  Button,
  Popover,
  PopoverDropdown,
  PopoverTarget,
  rem,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconLocation, IconPencil, IconSoup } from "@tabler/icons-react";
import React from "react";
import { Popup, useMap, useMapEvents } from "react-leaflet";
import { ButtonContainer, PlusMarker } from "../../../../common/components/Map";
import { Flag } from "../../../../common/components/Map/Flag";
import { GeoLocation } from "../../../../common/data";

export const LocationTracker = ({
  setIsTracking,
  isTracking,
  bubbleGeoLocation,
  bubbleMapCenter,
  bubbleMapZoom,
  initialMapCenter,
  initialMapZoom,
}: {
  setIsTracking: (isTracking: boolean) => void;
  isTracking: boolean;
  bubbleGeoLocation?: (data: GeoLocation) => void;
  bubbleMapCenter: (data: GeoLocation) => void;
  bubbleMapZoom?: (zoom: number) => void;
  initialMapCenter?: GeoLocation;
  initialMapZoom?: number;
}) => {
  const map = useMap();

  const isManualMoveRef = React.useRef<boolean>(false);
  const isTrackingRef = React.useRef<boolean>(false);

  const [geoLocation, setGeoLocation] = React.useState<GeoLocation>();

  const [mapCenter, setMapCenter] = React.useState<GeoLocation>(
    initialMapCenter || { lat: 0, lng: 0 },
  );

  const [mapZoom, setMapZoom] = React.useState<number>(
    initialMapZoom !== undefined ? initialMapZoom : map.getZoom(),
  );

  useMapEvents({
    move: () => {
      const center = map.getCenter();
      // console.log("move", center);
      setMapCenter(center);
      isManualMoveRef.current && !isTrackingRef.current && setIsTracking(false);
    },
    locationfound: (event) => {
      const location = { lat: event.latlng.lat, lng: event.latlng.lng };
      console.log("locationfound", location);
      setGeoLocation(location);
    },
    locationerror: () => {
      // console.error("locationerror", event);
    },
    dragstart: () => {
      // console.log("dragstart");
      isManualMoveRef.current = true;
      setIsTracking(false);
    },
    dragend: () => {
      // console.log("dragend");
      isManualMoveRef.current = false;
    },
    zoomend: () => {
      // console.log("zoomend");
      const zoom = map.getZoom();
      setMapZoom(zoom);
    },
  });

  const onClick: React.MouseEventHandler<HTMLButtonElement> = () => {
    setIsTracking(true);
  };

  const mapCenterLat = mapCenter?.lat;
  const mapCenterLng = mapCenter?.lng;
  const geoLocationLat = geoLocation?.lat;
  const geoLocationLng = geoLocation?.lng;

  // Always locate in background - stop on unmount
  React.useEffect(() => {
    map.stopLocate();

    map.locate({
      setView: false,
      enableHighAccuracy: true,
      maximumAge: 900,
      watch: true,
      maxZoom: 20,
    });

    return () => {
      map.stopLocate();
    };
  }, [map]);

  // Sync location to map center when tracking is enabled
  React.useEffect(() => {
    if (
      !isTracking ||
      geoLocationLat === undefined ||
      geoLocationLng === undefined
    )
      return;

    isTrackingRef.current = true;
    // map.setView(geoLocation, mapZoom, { animate: true, easeLinearity: 0.5 });
    map.panTo(
      { lat: geoLocationLat, lng: geoLocationLng },
      { animate: true, easeLinearity: 0.5, noMoveStart: true },
    );
    isTrackingRef.current = true;
  }, [isTracking, geoLocationLat, geoLocationLng, map]);

  // Sync up zoom
  React.useEffect(() => {
    bubbleMapZoom && bubbleMapZoom(mapZoom);
  }, [bubbleMapZoom, mapZoom]);

  // Sync up map center
  React.useEffect(() => {
    bubbleMapCenter({ lat: mapCenterLat, lng: mapCenterLng });
  }, [bubbleMapCenter, mapCenterLat, mapCenterLng]);

  // Sync up geo location
  React.useEffect(() => {
    geoLocationLat !== undefined &&
      geoLocationLng !== undefined &&
      bubbleGeoLocation &&
      bubbleGeoLocation({ lat: geoLocationLat, lng: geoLocationLng });
  }, [geoLocationLat, geoLocationLng, bubbleGeoLocation]);

  return (
    <ButtonContainer left={rem(13)} top={rem(90)}>
      <ActionIcon
        onClick={onClick}
        variant="default"
        size="md"
        disabled={isTracking}
      >
        <IconLocation />
      </ActionIcon>
    </ButtonContainer>
  );
};

// export const AddDistributionButton = ({ onClick }: { onClick: () => void }) => {
//   return (
//     <ButtonContainer bottom="20px" centerX right="50%">
//       <Button
//         leftSection={<IconPlus />}
//         onClick={onClick}
//         variant="filled"
//         size="sm"
//       >
//         Ausgabe
//       </Button>
//     </ButtonContainer>
//   );
// };

type StaticAddDistributionFlagProps = {
  onClick: () => void;
};
export const StaticAddDistributionFlag = ({
  onClick,
}: StaticAddDistributionFlagProps) => {
  // const [opened, { toggle }] = useDisclosure(false);
  const [opened] = useDisclosure(false);

  return (
    <div className="static-add-distribution-flag">
      <Popover opened={opened} zIndex={400} position="top" withArrow>
        <PopoverTarget>
          <div className="marker">
            {/* <PlusMarker onClick={toggle} height={60} /> */}
            <PlusMarker onClick={onClick} height={60} />
          </div>
        </PopoverTarget>
        <PopoverDropdown>
          <div className="add-button-group">
            <Button
              leftSection={<IconSoup />}
              onClick={onClick}
              variant="filled"
              size="sm"
              fullWidth
            >
              Ausgabe
            </Button>
            <Button
              leftSection={<IconPencil />}
              onClick={onClick}
              variant="outline"
              size="sm"
              fullWidth
            >
              Kommentar
            </Button>
          </div>
        </PopoverDropdown>
      </Popover>
    </div>
  );
};

// export const StaticAddDistributionFlag = ({
//   onClick,
// }: {
//   onClick: () => void;
// }) => {
//   return (
//     <ButtonContainer bottom="50%" right="50%" centerX>
//       <PlusMarker
//         className="static-add-distribution"
//         onClick={onClick}
//         size={60}
//       />
//     </ButtonContainer>
//   );
// };

type AddDistributionFlagProps = {
  lat: number;
  lng: number;
  onClick: () => void;
};
export const AddDistributionFlag = ({
  lat,
  lng,
  onClick,
}: AddDistributionFlagProps) => {
  return (
    <Flag
      lat={lat}
      lng={lng}
      height={60}
      width={35}
      marker={<PlusMarker height={60} />}
      popup={
        <Popup
          closeButton
          autoPanPaddingBottomRight={[100, 100]}
          offset={[0, -55]}
        >
          <div className="add-button-group">
            <Button
              leftSection={<IconSoup />}
              onClick={onClick}
              variant="filled"
              size="sm"
              fullWidth
            >
              Ausgabe
            </Button>
            <Button
              leftSection={<IconPencil />}
              onClick={onClick}
              variant="outline"
              size="sm"
              fullWidth
            >
              Kommentar
            </Button>
          </div>
        </Popup>
      }
    />
  );
};
