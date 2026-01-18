import { ActionIcon, Button } from "@mantine/core";
import {
  IconLocation,
  IconMinus,
  IconPencil,
  IconPlus,
  IconSoup,
} from "@tabler/icons-react";
import L, { LeafletMouseEvent } from "leaflet";
import React from "react";
import { createRoot, Root } from "react-dom/client";
import { Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import { ActionGroup } from "../../../../common/components";
import { PlusMarker } from "./Marker";

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
        zone.style.height = "100px";
        zone.style.width = "50px";
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

// export const NumbZone = () => {
//   const map = useMap();

//   React.useEffect(() => {
//     const CustomControl = L.Control.extend({
//       onAdd: function () {
//         const zone = L.DomUtil.create("div");
//         zone.style.border = "1px solid red";
//         zone.style.zIndex = "1";
//         zone.style.height = "100px";
//         zone.style.width = "50px";
//         zone.style.pointerEvents = "auto";
//         zone.ondblclick = (e) => {
//           e.preventDefault();
//           e.stopPropagation();
//         };
//         zone.onclick = (e) => {
//           e.preventDefault();
//           e.stopPropagation();
//         };
//         return zone;
//       },
//     });

//     const controlInstance = new CustomControl({ position: "topleft" });
//     controlInstance.addTo(map);

//     return () => {
//       map.removeControl(controlInstance);
//     };
//   }, [map]);

//   return null;
// };

export const ZoomButtons = () => {
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
      map.zoomIn(1, { animate: true });
    } else if (zoomMode === "OUT" && canZoomOut) {
      map.zoomOut(1, { animate: true });
    }
  };

  return (
    <ButtonContainer top="20px" left="13px">
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
    move: (event) => {
      if (isProgrammaticUpdateRef.current || !(event as LeafletMouseEvent).originalEvent) {
        return;
      }

      if (isTracking) toggleTracking();

      const center = map.getCenter();
      const zoom = map.getZoom();
      setMapCenter(center);
      bubbleMapCenter(center);
      bubbleMapZoom?.(zoom);
    },
    locationfound: (event) => {
      setGeoLocation({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
    zoomend: () => {
      if (!isProgrammaticUpdateRef.current) {
        bubbleMapZoom?.(map.getZoom());
      }
    },
  });

  React.useEffect(() => {
    map.stopLocate();
    map.locate({
      // setView: true,
      setView: false,
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
    <ButtonContainer left="13px" top="90px">
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

export const AddDistributionButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <ButtonContainer bottom="20px" centerX right="50%">
      {/* <ActionIcon onClick={onClick} variant="default" size="md">
        <IconPlus />
      </ActionIcon> */}

      <Button
        leftSection={<IconPlus />}
        onClick={onClick}
        variant="filled"
        size="sm"
      >
        Ausgabe
      </Button>
    </ButtonContainer>
  );
};

export const AddDistributionFlag = ({
  lat,
  lng,
  onClick,
}: {
  lat: number;
  lng: number;
  onClick: () => void;
}) => {
  const rootRef = React.useRef<Root | null>(null);

  const [icon, setIcon] = React.useState<L.DivIcon | null>(null);

  React.useEffect(() => {
    // Create div element
    const divElement = document.createElement("div");

    // Create root and render contents
    rootRef.current = createRoot(divElement);
    rootRef.current.render(<PlusMarker size={60} />);

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

  return icon ? (
    <Marker icon={icon} position={{ lat, lng }}>
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
    </Marker>
  ) : (
    <></>
  );
};

// export const AddDistributionFlag = ({
//   lat,
//   lng,
//   onClick,
// }: {
//   lat: number;
//   lng: number;
//   onClick: () => void;
// }) => {
//   /*
//   const rootRef = React.useRef<Root | null>(null);

//   React.useEffect(() => {
//     const root = createRoot(document.createElement("div"));
//     root.render(<IconPlus />);
//     rootRef.current = root;
//   }, []);
// */

//   const div = React.useMemo<HTMLDivElement>(
//     () => document.createElement("div"),
//     []
//   );

//   const icon = React.useMemo(() => {
//     return L.divIcon({
//       html: div,
//       className: "",
//       iconSize: [60, 60],
//       iconAnchor: [30, 60],
//     });
//   }, [div]);

//   const root = createRoot(div);

//   React.useEffect(() => {
//     root.render(
//       // <div
//       //   style={{
//       //     position: "absolute",
//       //     left: 0,
//       //     top: -20,
//       //   }}
//       // >
//       <PlusMarker size={60} />
//       // </div>

//       // <MantineProvider>
//       //   <ActionIcon
//       //     onClick={(e) => {
//       //       e.stopPropagation();
//       //       onClick();
//       //     }}
//       //     variant="filled"
//       //     size="md"
//       //     style={{ backgroundColor: "#339af0", color: "white" }}
//       //   >
//       //     <IconPlus size={18} />
//       //   </ActionIcon>
//       // </MantineProvider>
//     );
//   }, [onClick, root]);

//   return (
//     <Marker icon={icon} position={{ lat, lng }}>
//       <Popup>Aktuelle Position</Popup>
//     </Marker>
//   );
// };

export const AddDistributionFlag_ = ({
  lat,
  lng,
  onClick,
}: {
  lat: number;
  lng: number;
  onClick: () => void;
}) => {
  const rootRef = React.useRef<Root | null>(null);

  const icon = React.useMemo(() => {
    // Create a div element for the icon
    const iconDiv = document.createElement("div");
    iconDiv.style.background = "white";
    iconDiv.style.border = "2px solid #339af0";
    iconDiv.style.borderRadius = "4px";
    iconDiv.style.width = "36px";
    iconDiv.style.height = "36px";
    iconDiv.style.display = "flex";
    iconDiv.style.alignItems = "center";
    iconDiv.style.justifyContent = "center";
    iconDiv.style.cursor = "pointer";
    iconDiv.style.zIndex = "1000";

    // Create and store the root for rendering React component
    rootRef.current = createRoot(iconDiv);

    // Create Leaflet divIcon
    return L.divIcon({
      html: iconDiv,
      className: "", // Remove default Leaflet marker styling
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
  }, []);

  // Render and update the ActionIcon when onClick changes
  React.useEffect(() => {
    // Ensure root is created before rendering
    if (rootRef.current) {
      rootRef.current.render(
        <ActionIcon
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          variant="filled"
          size="md"
          style={{ backgroundColor: "#339af0", color: "white" }}
        >
          <IconPlus size={18} />
        </ActionIcon>
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClick]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (rootRef.current) {
        rootRef.current.unmount();
        rootRef.current = null;
      }
    };
  }, []);

  return (
    <Marker
      position={[lat, lng]}
      icon={icon}
      eventHandlers={{
        click: (e) => {
          e.originalEvent.stopPropagation();
          onClick();
        },
      }}
    >
      <Popup>Aktuelle Position</Popup>
    </Marker>
  );
};
