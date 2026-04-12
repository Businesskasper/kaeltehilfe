import {
  ActionIcon,
  Button,
  Popover,
  PopoverDropdown,
  PopoverTarget,
  rem,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconLocation, IconMessage, IconPencil, IconSoup } from "@tabler/icons-react";
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

  const isTrackingRef = React.useRef<boolean>(false);

  const [geoLocation, setGeoLocation] = React.useState<GeoLocation>();

  const [mapCenter, setMapCenter] = React.useState<GeoLocation>(
    initialMapCenter || { lat: 0, lng: 0 },
  );

  const [mapZoom, setMapZoom] = React.useState<number>(
    initialMapZoom !== undefined ? initialMapZoom : map.getZoom(),
  );

  useMapEvents({
    movestart: () => {
      const isProgrammatic =
        isTrackingRef.current ||
        (map as L.Map & { _programmaticMove?: boolean })._programmaticMove;
      if (!isProgrammatic) {
        setIsTracking(false);
      }
    },
    move: () => {
      setMapCenter(map.getCenter());
    },
    locationfound: (event) => {
      setGeoLocation({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
    locationerror: () => {},
    zoomend: () => {
      setMapZoom(map.getZoom());
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
    map.once("moveend", () => {
      isTrackingRef.current = false;
    });
    map.panTo(
      { lat: geoLocationLat, lng: geoLocationLng },
      { animate: true, easeLinearity: 0.5, noMoveStart: true },
    );
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
    <>
      <ButtonContainer left={rem(13)} top={rem(130)}>
        <ActionIcon
          onClick={onClick}
          variant="default"
          size="md"
          disabled={isTracking}
        >
          <IconLocation />
        </ActionIcon>
      </ButtonContainer>
      <div className="current-location-flag">
        <div className="marker">
          <CurrentLocationMarker height={60} />
        </div>
      </div>
    </>
  );
};

const CurrentLocationMarker = ({ height = 60 }: { height?: number }) => (
  <svg
    height={height}
    width={35}
    preserveAspectRatio="xMidYMid meet"
    viewBox="0 0 35 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M17.5 0.5C26.8901 0.5 34.4997 8.08181 34.5 17.4365C34.5 19.7436 33.4399 23.5301 31.7969 27.9785C30.1629 32.4023 27.9808 37.4074 25.7959 42.1201C23.6116 46.8316 21.427 51.2441 19.7881 54.4785C18.9689 56.0951 18.2863 57.4172 17.8086 58.335C17.694 58.5551 17.5901 58.7518 17.5 58.9238C17.4099 58.7518 17.306 58.5551 17.1914 58.335C16.7137 57.4172 16.0311 56.0951 15.2119 54.4785C13.573 51.2441 11.3884 46.8316 9.2041 42.1201C7.01921 37.4074 4.83709 32.4023 3.20312 27.9785C1.56008 23.5301 0.5 19.7436 0.5 17.4365C0.500262 8.08181 8.10994 0.5 17.5 0.5Z"
      fill="#4285F4"
      stroke="#2563EB"
    />
    <circle cx="17.5" cy="19.5" r="7" fill="white" />
    <circle cx="17.5" cy="19.5" r="4.5" fill="#4285F4" />
  </svg>
);

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
  onCommentClick: () => void;
};
export const StaticAddDistributionFlag = ({
  onClick,
  onCommentClick,
}: StaticAddDistributionFlagProps) => {
  const [opened, { toggle, close }] = useDisclosure(false);

  return (
    <div className="static-add-distribution-flag">
      <Popover opened={opened} zIndex={400} position="top" withArrow>
        <PopoverTarget>
          <div className="marker">
            <PlusMarker onClick={toggle} height={60} />
          </div>
        </PopoverTarget>
        <PopoverDropdown>
          <div className="add-button-group">
            <Button
              leftSection={<IconSoup />}
              onClick={() => { close(); onClick(); }}
              variant="filled"
              size="sm"
              fullWidth
            >
              Ausgabe
            </Button>
            <Button
              leftSection={<IconPencil />}
              onClick={() => { close(); onCommentClick(); }}
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

const StrikeOverlay = () => (
  <svg
    style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    width="100%"
    height="100%"
    viewBox="0 0 28 28"
  >
    <line x1="4" y1="4" x2="24" y2="24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
  </svg>
);

type LayerToggleButtonsProps = {
  showDistributions: boolean;
  toggleShowDistributions: () => void;
  showComments: boolean;
  toggleShowComments: () => void;
};
export const LayerToggleButtons = ({
  showDistributions,
  toggleShowDistributions,
  showComments,
  toggleShowComments,
}: LayerToggleButtonsProps) => {
  return (
    <ButtonContainer top={rem(20)} right={rem(13)}>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <div style={{ position: "relative", display: "inline-flex" }}>
          <ActionIcon title="Ausgaben" variant="default" size="md" onClick={toggleShowDistributions}>
            <IconSoup size={16} />
          </ActionIcon>
          {!showDistributions && <StrikeOverlay />}
        </div>
        <div style={{ position: "relative", display: "inline-flex" }}>
          <ActionIcon title="Kommentare" variant="default" size="md" onClick={toggleShowComments}>
            <IconMessage size={16} />
          </ActionIcon>
          {!showComments && <StrikeOverlay />}
        </div>
      </div>
    </ButtonContainer>
  );
};

type AddDistributionFlagProps = {
  lat: number;
  lng: number;
  onClick: () => void;
  onCommentClick: () => void;
};
export const AddDistributionFlag = ({
  lat,
  lng,
  onClick,
  onCommentClick,
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
              onClick={onCommentClick}
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
