import {
  useDebouncedValue,
  useOrientation,
  useResizeObserver,
} from "@mantine/hooks";
import { Map } from "leaflet";
import React from "react";
import { Group, Panel } from "react-resizable-panels";
import {
  Distribution,
  GeoLocation,
  useDistributions,
} from "../../../common/data";
import { formatDate, useBrowserStorage } from "../../../common/utils";
import { DetailsPanel } from "./DetailsPanel";
import { MainControls } from "./MainControls";
import { MapPanel } from "./MapPanel/MapPanel";

import {
  GroupSeparator,
  useCachedLayout,
} from "../../../common/components/Group";
import "./MainView.scss";

export const MapView = () => {
  const { type: orientationType } = useOrientation({
    getInitialValueInEffect: false,
  });
  const groupOrientation =
    orientationType === "landscape-primary" ||
    orientationType === "landscape-secondary"
      ? "horizontal"
      : "vertical";

  const [isDetailsOpen, setIsDetailsOpen] = useBrowserStorage(
    "SESSION",
    "OPERATOR_DETAILS_OPEN",
    false,
  );

  const toggleDetailsOpen = React.useCallback(() => {
    setIsDetailsOpen((open) => !open);
  }, [setIsDetailsOpen]);

  const mapRef = React.useRef<Map>(null);
  const [ref, rect] = useResizeObserver();
  const watchablePos = `${rect.top}:${rect.bottom}:${rect.left}:${rect.right}`;
  const [debouncedRect] = useDebouncedValue(watchablePos, 200);
  React.useEffect(() => {
    mapRef?.current?.invalidateSize();
  }, [debouncedRect]);

  const { defaultLayout, onLayoutChanged } = useCachedLayout({
    key: "operator-layout",
    currentPanels: isDetailsOpen
      ? ["details-panel", "map-panel"]
      : ["map-panel"],
    initialLayout: {
      panels: ["details-panel", "map-panel"],
      panelConfigs: { "details-panel": 30, "map-panel": 70 },
    },
  });

  const now = new Date();
  const nowStr = formatDate(now);
  const today = React.useMemo(
    () => new Date(now.setHours(23, 59, 59, 999)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nowStr],
  );
  const queryFrom = React.useMemo(() => {
    const lastWeek = new Date(now.setDate(now.getDate() - 7));
    return new Date(lastWeek.setHours(0, 0, 0, 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nowStr]);

  const [selectedDate, setSelectedDate] = React.useState<Date>(today);

  const {
    objs: { data: distributions },
  } = useDistributions({ from: queryFrom, to: today });

  const [focusedGeoLocation, setFocusedDistributionId] =
    React.useState<GeoLocation>();

  const resetFocusedGeoLocation = React.useCallback(() => {
    setFocusedDistributionId(undefined);
  }, []);

  const onCardClick = React.useCallback(
    (_: string, distributions: Array<Distribution>) => {
      const geoLocation = distributions?.find(
        (d) => !!d.geoLocation.lat && !!d.geoLocation.lng,
      )?.geoLocation;
      if (!geoLocation) return;
      setFocusedDistributionId(geoLocation);
    },
    [],
  );

  return (
    <div className="main-view">
      <MainControls
        toggleDetailsOpen={toggleDetailsOpen}
        setSelectedDate={setSelectedDate}
        selectedDate={selectedDate}
        queryFrom={queryFrom}
        today={today}
      />

      <Group
        onLayoutChanged={onLayoutChanged}
        defaultLayout={defaultLayout}
        className="container"
        orientation={groupOrientation}
      >
        <Panel
          id="map-panel"
          className="map-panel"
          defaultSize={isDetailsOpen ? 70 : 100}
          elementRef={ref}
        >
          <MapPanel
            mapRef={mapRef}
            selectedDate={selectedDate}
            distributions={distributions}
            focusedGeoLocation={focusedGeoLocation}
            resetFocusedGeoLocation={resetFocusedGeoLocation}
          />
        </Panel>
        {isDetailsOpen && (
          <>
            <GroupSeparator orientation={groupOrientation} />
            <Panel
              collapsible
              defaultSize={30}
              minSize={30}
              id="details-panel"
              className="details-panel"
            >
              <DetailsPanel
                selectedDate={selectedDate}
                distributions={distributions}
                today={today}
                onCardClick={onCardClick}
              />
            </Panel>
          </>
        )}
      </Group>
    </div>
  );
};
