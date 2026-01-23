import {
  ActionIcon,
  Button,
  Popover,
  PopoverDropdown,
  PopoverTarget,
} from "@mantine/core";
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
import { rem } from "../../../../common/utils";
import { DistributionMarker, PlusMarker } from "./Marker";

import { useDisclosure } from "@mantine/hooks";
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

export const ZoomButtons = ({ lat, lng }: { lat: number; lng: number }) => {
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
  toggleTracking,
  isTracking,
  bubbleGeoLocation,
  bubbleMapCenter,
  bubbleMapZoom,
  initialMapCenter,
  initialMapZoom,
}: {
  toggleTracking: () => void;
  isTracking: boolean;
  bubbleGeoLocation: (data: { lat: number; lng: number }) => void;
  bubbleMapCenter: (data: { lat: number; lng: number }) => void;
  bubbleMapZoom?: (zoom: number) => void;
  initialMapCenter?: { lat: number; lng: number };
  initialMapZoom?: number;
}) => {
  const map = useMap();
  const isProgrammaticUpdateRef = React.useRef(false);
  const hasInitializedRef = React.useRef(false);
  const isZoomingRef = React.useRef(false);
  const isDraggingRef = React.useRef(false);
  const lastDragEndRef = React.useRef<number | null>(null);

  const [geoLocation, setGeoLocation] = React.useState<{
    lat: number;
    lng: number;
  }>();
  const [mapCenter, setMapCenter] = React.useState<{
    lat: number;
    lng: number;
  }>(initialMapCenter || { lat: 0, lng: 0 });

  // Initialize map position on mount
  React.useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;
    isProgrammaticUpdateRef.current = true;

    if (initialMapCenter && initialMapZoom) {
      map.setView(initialMapCenter, initialMapZoom, { animate: false });
    } else if (initialMapZoom) {
      map.setZoom(initialMapZoom, { animate: false });
    }

    isProgrammaticUpdateRef.current = false;
  }, [map, initialMapCenter, initialMapZoom]);

  useMapEvents({
    move: () => {
      if (isProgrammaticUpdateRef.current || isZoomingRef.current) {
        return;
      }

      // if (isTracking && isDraggingRef.current) toggleTracking();

      const center = map.getCenter();
      const zoom = map.getZoom();
      setMapCenter(center);
      bubbleMapCenter(center);
      bubbleMapZoom?.(zoom);
    },
    locationfound: (event) => {
      setGeoLocation({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
    zoomstart: () => {
      isZoomingRef.current = true;
    },
    zoomend: () => {
      isZoomingRef.current = false;
      if (!isProgrammaticUpdateRef.current) {
        bubbleMapZoom?.(map.getZoom());
      }
    },
    dragstart() {
      isDraggingRef.current = true;
      lastDragEndRef.current = null;
      if (isTracking) toggleTracking();
    },

    dragend() {
      isDraggingRef.current = false;
      lastDragEndRef.current = performance.now();
    },
  });

  React.useEffect(() => {
    map.stopLocate();
    map.locate({
      // setView: true,
      setView: false, // TODO: Maybe more accurate and less lags when setting the view here instead of setting the view in effects
      enableHighAccuracy: true,
      maximumAge: 2500,
      watch: true,
      maxZoom: 18,
    });
  }, [map]);

  React.useEffect(() => {
    if (geoLocation) bubbleGeoLocation(geoLocation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoLocation]);

  React.useEffect(() => {
    if (mapCenter?.lat && !isProgrammaticUpdateRef.current) {
      bubbleMapCenter(mapCenter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapCenter]);

  // Auto-center to geo location when tracking is enabled
  React.useEffect(() => {
    if (!isTracking || !geoLocation) return;

    isProgrammaticUpdateRef.current = true;
    map.setView(geoLocation, map.getZoom(), { animate: true });
    setMapCenter(geoLocation);
    bubbleMapCenter(geoLocation);
    setTimeout(() => {
      isProgrammaticUpdateRef.current = false;
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoLocation, isTracking, map]);

  const onClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleTracking();
  };

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
  marker: JSX.Element;
  popup?: JSX.Element;
};
export const Flag = ({ lat, lng, marker, popup }: FlagProps) => {
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
      className: "",
      iconSize: [60, 60],
      iconAnchor: [30, 60],
    });

    setIcon(leafletIcon);

    // Cleanup on unmount
    return () => {
      // Unmount asynchronously to avoid race condition during render
      const root = rootRef.current;
      rootRef.current = null;

      // Use requestAnimationFrame to defer unmount until after React finishes rendering
      // This ensures we're outside of React's render phase and prevents the warning:
      // "Attempted to synchronously unmount a root while React was already rendering"
      requestAnimationFrame(() => {
        if (root) {
          root.unmount();
        }
      });
    };
  }, []);

  React.useEffect(() => {
    // Render marker into the div icon
    rootRef.current && rootRef.current.render(marker);
  }, [marker]);

  return icon ? (
    <Marker icon={icon} position={{ lat, lng }}>
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
      marker={<DistributionMarker colorSet={colorSet} height={60} />}
    />
  );
};
