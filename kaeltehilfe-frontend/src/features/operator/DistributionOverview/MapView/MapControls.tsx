import {
  ActionIcon,
  Button,
  Popover,
  PopoverDropdown,
  PopoverTarget,
  rem,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconLocation,
  IconMinus,
  IconPencil,
  IconPlus,
  IconSoup,
} from "@tabler/icons-react";
import L from "leaflet";
import React from "react";
import { createRoot, Root } from "react-dom/client";
import { Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import { ActionGroup } from "../../../../common/components";
import { GeoLocation } from "../../../../common/data";
import { DistributionMarker, PlusMarker } from "./Marker";

import "./MapView.scss";

type ButtonContainerProps = {
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  centerX?: boolean;
  children: React.ReactNode;
};
export const ButtonContainer = ({
  top,
  left,
  right,
  bottom,
  centerX,
  children,
}: ButtonContainerProps) => {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const buttonsContainer = ref.current;
    if (buttonsContainer) {
      // Prevent map interactions when interacting with the buttons
      L.DomEvent.disableClickPropagation(buttonsContainer);
      L.DomEvent.disableScrollPropagation(buttonsContainer);
      L.DomEvent.on(buttonsContainer, "mousedown", L.DomEvent.stopPropagation);
      L.DomEvent.on(buttonsContainer, "mouseup", L.DomEvent.stopPropagation);
    }
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        top,
        left,
        right,
        bottom,
        transform: centerX ? "translateX(50%)" : undefined,
        zIndex: 400, // Ensure it's above the map
        pointerEvents: "auto", // Allow interaction with the buttons
      }}
    >
      {children}
    </div>
  );
};

export const NumbZone = () => {
  const map = useMap();

  React.useEffect(() => {
    const CustomControl = L.Control.extend({
      onAdd: function () {
        const zone = L.DomUtil.create("div");
        zone.style.border = "1px solid red";
        zone.style.zIndex = "1";
        zone.style.height = rem(100);
        zone.style.width = rem(50);
        zone.style.pointerEvents = "auto";

        // Disable event propagation
        L.DomEvent.disableClickPropagation(zone);
        L.DomEvent.disableScrollPropagation(zone);

        return zone;
      },
    });

    const controlInstance = new CustomControl({ position: "topleft" });
    controlInstance.addTo(map);

    return () => {
      map.removeControl(controlInstance);
    };
  }, [map]);

  return null;
};

export const ZoomButtons = ({ lat, lng }: GeoLocation) => {
  const map = useMap();

  const [currentZoom, setCurrentZoom] = React.useState<{
    min: number;
    max: number;
    current: number;
  }>();

  const updateZoom = () => {
    const max = map.getMaxZoom();
    const min = map.getMinZoom();
    const current = map.getZoom();

    setCurrentZoom({ min, max, current });
  };

  const canZoomIn = (currentZoom?.current || 0) < (currentZoom?.max || 0);

  const canZoomOut = (currentZoom?.current || 0) > (currentZoom?.min || 0);

  React.useEffect(() => {
    if (!map) return;
    updateZoom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  useMapEvents({
    load: () => {
      updateZoom();
    },
    zoom: () => {
      updateZoom();
    },
  });

  const onZoom = (zoomMode: string) => {
    if (zoomMode === "IN" && canZoomIn) {
      map.setView({ lat, lng }, map.getZoom() + 1);
      // map.zoomIn(1, { animate: true });
    } else if (zoomMode === "OUT" && canZoomOut) {
      map.setView({ lat, lng }, map.getZoom() - 1);
      // map.zoomOut(1, { animate: true });
    }
  };

  return (
    <ButtonContainer top={rem(20)} left={rem(13)}>
      <ActionGroup
        groupProps={{
          orientation: "vertical",
        }}
        options={[
          {
            icon: IconPlus,
            id: "IN" as const,
            hoverTitle: "Rein zoomen",
            props: { w: undefined, disabled: !canZoomIn },
          },
          {
            icon: IconMinus,
            id: "OUT" as const,
            hoverTitle: "Raus zoomen",
            props: { w: undefined, disabled: !canZoomOut },
          },
        ]}
        onClick={onZoom}
      />
    </ButtonContainer>
  );
};

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

type FlagProps = {
  lat: number;
  lng: number;
  height: number;
  width: number;
  marker: JSX.Element;
  popup?: JSX.Element;
  className?: string;
};
export const Flag = ({
  lat,
  lng,
  height,
  width,
  marker,
  popup,
  className,
}: FlagProps) => {
  const rootRef = React.useRef<Root | null>(null);

  const [icon, setIcon] = React.useState<L.DivIcon | null>(null);

  React.useEffect(() => {
    // Create div element
    const divElement = document.createElement("div");

    // Create root
    rootRef.current = createRoot(divElement);

    // Create Leaflet icon
    const leafletIcon = L.divIcon({
      html: divElement,
      className,
      iconSize: [width, height],
      iconAnchor: [width / 2, height],
    });

    setIcon(leafletIcon);

    // Cleanup on unmount
    return () => {
      // Unmount asynchronously to avoid race condition during render
      const root = rootRef.current;
      rootRef.current = null;

      // Defer unmount until rendered -> prevent "Attempted to synchronously unmount a root while React was already rendering"
      requestAnimationFrame(() => {
        if (root) {
          root.unmount();
        }
      });
    };
  }, [className, height, width]);

  React.useEffect(() => {
    // Render marker into the div icon
    rootRef.current && rootRef.current.render(marker);
  }, [marker]);

  const position = React.useMemo(() => ({ lat, lng }), [lat, lng]);

  return icon ? (
    <Marker icon={icon} position={position}>
      {popup}
    </Marker>
  ) : (
    <></>
  );
};

export const StaticAddDistributionFlag = ({
  onClick,
}: {
  onClick: () => void;
}) => {
  const [opened, { toggle }] = useDisclosure(false);

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

type ExistingDistributionFlagProps = {
  lat: number;
  lng: number;
  colorSet: [string, string];
};
export const ExistingDistributionFlag = ({
  lat,
  lng,
  colorSet,
}: ExistingDistributionFlagProps) => {
  return (
    <Flag
      lat={lat}
      lng={lng}
      height={60}
      width={35}
      marker={<DistributionMarker colorSet={colorSet} height={60} />}
    />
  );
};
