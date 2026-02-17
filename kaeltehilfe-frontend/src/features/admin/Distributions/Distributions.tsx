import { Title } from "@mantine/core";
import {
  useDebouncedValue,
  useOrientation,
  useResizeObserver,
} from "@mantine/hooks";
import L from "leaflet";
import React from "react";
import { Group, Panel } from "react-resizable-panels";
import {
  GroupSeparator,
  useCachedLayout,
} from "../../../common/components/Group";
import { GeoLocation, useDistributions } from "../../../common/data";
import { toNormalizedDate, useBrowserStorage } from "../../../common/utils";
import { DistributionsControls } from "./DistributionsControls";
import { MapPanel } from "./MapPanel";
import { TablePanel } from "./TablePanel";

import "./Distributions.scss";

export const Distributions = () => {
  const [rangeFilter, setRangeFilter] = React.useState<{
    from: Date | null;
    to: Date | null;
  }>(() => {
    const today = toNormalizedDate(new Date()) || new Date();
    const oneMonthBefore =
      toNormalizedDate(new Date(today).setMonth(today.getMonth() - 1)) ||
      new Date();
    return { from: oneMonthBefore, to: today };
  });

  const { from, to } = rangeFilter;
  const fromStart = from ? toNormalizedDate(from) : undefined;
  const toEnd = to
    ? toNormalizedDate(new Date(to).setDate(to?.getDate() + 1))
    : undefined;

  const distHook = useDistributions({
    from: fromStart || null,
    to: toEnd || null,
  });

  // const { type: orientationType } = useOrientation({
  //   getInitialValueInEffect: false,
  // });
  // const groupOrientation =
  //   orientationType === "landscape-primary" ||
  //   orientationType === "landscape-secondary"
  //     ? "horizontal"
  //     : "vertical";

  const { type: orientationType } = useOrientation({
    getInitialValueInEffect: false,
  });

  const [orientation, setOrientation] = useBrowserStorage<
    "horizontal" | "vertical"
  >("SESSION", "ADMIN_MAP_ORIENTATION", () =>
    orientationType === "landscape-primary" ||
    orientationType === "landscape-secondary"
      ? "horizontal"
      : "vertical",
  );

  const [isMapOpen, setIsMapOpen] = useBrowserStorage(
    "SESSION",
    "ADMIN_MAP_OPEN",
    false,
  );

  const toggleMapOpen = React.useCallback(() => {
    setIsMapOpen((open) => !open);
  }, [setIsMapOpen]);

  const mapRef = React.useRef<L.Map>(null);
  const [ref, rect] = useResizeObserver();
  const watchablePos = `${rect.top}:${rect.bottom}:${rect.left}:${rect.right}`;
  const [debouncedRect] = useDebouncedValue(watchablePos, 200);
  React.useEffect(() => {
    mapRef?.current?.invalidateSize();
  }, [debouncedRect]);

  const { defaultLayout, onLayoutChanged } = useCachedLayout({
    key: "admin-layout",
    currentPanels: isMapOpen ? ["map-panel", "table-panel"] : ["table-panel"],
    initialLayout: {
      panels: ["map-panel", "table-panel"],
      panelConfigs: { "map-panel": 50, "table-panel": 50 },
    },
  });

  const [focusedGeoLocation, setFocusedGeoLocation] =
    React.useState<GeoLocation>();
  const resetFocusedGeoLocation = React.useCallback(() => {
    setFocusedGeoLocation(undefined);
  }, []);

  console.log("orientation", orientation);
  return (
    <>
      <Title size="h2" mb="lg">
        Ausgaben
      </Title>
      <DistributionsControls
        rangeFilter={rangeFilter}
        setRangeFilter={setRangeFilter}
        toggleMapOpen={toggleMapOpen}
        orientation={orientation}
        setOrientation={setOrientation}
        isMapOpen={isMapOpen}
      />
      <Group
        onLayoutChanged={onLayoutChanged}
        defaultLayout={defaultLayout}
        className="distributions-container"
        orientation={orientation}
      >
        {isMapOpen && (
          <>
            <Panel
              id="map-panel"
              className="map-panel"
              defaultSize={50}
              elementRef={ref}
            >
              <MapPanel
                distHook={distHook}
                mapRef={mapRef}
                focusedGeoLocation={focusedGeoLocation}
                resetFocusedGeoLocation={resetFocusedGeoLocation}
              />
            </Panel>
            <GroupSeparator orientation={orientation} />
          </>
        )}
        <Panel id="table-panel" className="table-panel" defaultSize={50}>
          <TablePanel
            distHook={distHook}
            setFocusedGeoLocation={setFocusedGeoLocation}
          />
        </Panel>
      </Group>
    </>
  );
};
