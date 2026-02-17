import { ActionIcon, rem } from "@mantine/core";
import { IconMinus, IconPlus, IconTarget } from "@tabler/icons-react";
import L from "leaflet";
import React from "react";
import { useMap, useMapEvents } from "react-leaflet";
import { Distribution, GeoLocation } from "../../data";
import { ActionGroup } from "../ActionGroup/ActionGroup";
import { KeyedMarkerRegistry } from "./mapUtils";

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

export const ZoomButtons = ({ lat, lng }: Partial<GeoLocation>) => {
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
      if (lat && lng) {
        map.setView({ lat, lng }, map.getZoom() + 1);
      } else {
        map.zoomIn(1, { animate: true });
      }
      // map.zoomIn(1, { animate: true });
    } else if (zoomMode === "OUT" && canZoomOut) {
      if (lat && lng) {
        map.setView({ lat, lng }, map.getZoom() - 1);
      } else {
        map.zoomOut(1, { animate: true });
      }
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

type FitBoundsButtonProps = {
  registry: KeyedMarkerRegistry<Distribution>;
};
export const FitBoundsButton = ({ registry }: FitBoundsButtonProps) => {
  const map = useMap();

  const onClick = React.useCallback(() => {
    const markers = Array.from(Object.values(registry))
      .map((re) => re.marker)
      .filter(Boolean) as Array<L.Marker>;

    if (!markers || markers.length === 0) return;

    const bounds = L.latLngBounds(
      markers.map((m) => {
        const { lat, lng } = m.getLatLng();
        return [lat, lng];
      }),
    );

    map.fitBounds(bounds, {
      padding: [50, 50],
      //   maxZoom: 16,
    });
  }, [registry, map]);

  return (
    <ButtonContainer top={rem(80)} left={rem(13)}>
      <ActionIcon
        title="Karte an Ausgaben ausrichten"
        onClick={onClick}
        variant="default"
        size="md"
      >
        <IconTarget />
      </ActionIcon>
    </ButtonContainer>
  );
};
