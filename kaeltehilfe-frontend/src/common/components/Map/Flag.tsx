import L from "leaflet";
import React from "react";
import { createRoot, Root } from "react-dom/client";
import { Marker } from "react-leaflet";

import "./Map.scss";

type FlagProps = {
  lat: number;
  lng: number;
  height: number;
  width: number;
  marker: JSX.Element;
  popup?: JSX.Element;
  className?: string;
};
export const Flag = React.forwardRef<L.Marker, FlagProps>(
  ({ lat, lng, height, width, marker, popup, className }, ref) => {
    const rootRef = React.useRef<Root | null>(null);

    const [icon, setIcon] = React.useState<L.DivIcon | null>(null);

    React.useEffect(() => {
      // Create div element
      const divElement = document.createElement("div");

      // divElement.setAttribute("x-child-count", childCount?.toString() || "0");

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
      <Marker ref={ref} icon={icon} position={position}>
        {popup}
      </Marker>
    ) : (
      <></>
    );
  },
);
