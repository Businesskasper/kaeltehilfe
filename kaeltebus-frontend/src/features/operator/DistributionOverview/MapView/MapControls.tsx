import { ActionIcon, Button } from "@mantine/core";
import { IconLocation, IconMinus, IconPlus } from "@tabler/icons-react";
import L, { LeafletMouseEvent } from "leaflet";
import React from "react";
import { useMap, useMapEvents } from "react-leaflet";
import { ActionGroup } from "../../../../common/components";

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
}: {
  toggleTracking: () => void;
  isTracking: boolean;
  bubbleGeoLocation: (data: { lat: number; lng: number }) => void;
  bubbleMapCenter: (data: { lat: number; lng: number }) => void;
}) => {
  const map = useMap();

  const [geoLocation, setGeoLocation] = React.useState<{
    lat: number;
    lng: number;
  }>();
  const [mapCenter, setMapCenter] = React.useState<{
    lat: number;
    lng: number;
  }>({ lat: 0, lng: 0 });

  const [zoomLevel, setZoomLevel] = React.useState<number>(map.getZoom());

  useMapEvents({
    move: (event) => {
      if (!(event as LeafletMouseEvent).originalEvent) return;

      isTracking && toggleTracking();

      const center = map.getCenter();
      setMapCenter(center);
    },
    locationfound: (event) => {
      setGeoLocation({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
    zoomend: () => {
      setZoomLevel(map.getZoom());
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

  // Bubble geoLocation
  React.useEffect(() => {
    if (!geoLocation) return;

    bubbleGeoLocation(geoLocation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoLocation, map]);

  // Bubble mapCenter
  React.useEffect(() => {
    if (!mapCenter) return;
    bubbleMapCenter(mapCenter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapCenter, map]);

  React.useEffect(() => {
    isTracking && geoLocation && setMapCenter(geoLocation);
  }, [geoLocation, isTracking]);

  React.useEffect(() => {
    map && map.setView(mapCenter, map.getZoom(), { easeLinearity: 1.0 });
  }, [map, mapCenter, zoomLevel]);

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
