import { notifications } from "@mantine/notifications";
import {
  useDebouncedValue,
  useOrientation,
  useResizeObserver,
} from "@mantine/hooks";
import { IconExclamationMark } from "@tabler/icons-react";
import { Map } from "leaflet";
import React from "react";
import { Group, Panel } from "react-resizable-panels";
import { useNavigate } from "react-router-dom";
import {
  Distribution,
  GeoLocation,
  useComments,
  useDistributions,
  useBusses,
} from "../../../common/data";
import { compareByDateOnly, formatDate, useBrowserStorage, useIsMobile } from "../../../common/utils";
import { useSelectedBus } from "../../../common/utils/useSelectedBus";
import { DetailsPanel } from "./DetailsPanel";
import { MainControls } from "./MainControls";
import { MapPanel } from "./MapPanel/MapPanel";

import {
  GroupSeparator,
  useCachedLayout,
} from "../../../common/components/Group";
import "./MainView.scss";

export const MapView = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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

  const [showDistributions, setShowDistributions] = useBrowserStorage(
    "LOCAL",
    "OPERATOR_SHOW_DISTRIBUTIONS",
    true,
  );

  const [showComments, setShowComments] = useBrowserStorage(
    "LOCAL",
    "OPERATOR_SHOW_COMMENTS",
    true,
  );

  const toggleDetailsOpen = React.useCallback(() => {
    setIsDetailsOpen((open) => !open);
  }, [setIsDetailsOpen]);

  const toggleShowDistributions = React.useCallback(() => {
    setShowDistributions((v) => !v);
  }, [setShowDistributions]);

  const toggleShowComments = React.useCallback(() => {
    setShowComments((v) => !v);
  }, [setShowComments]);

  const mapRef = React.useRef<Map>(null);
  const [ref, rect] = useResizeObserver();
  const watchablePos = `${rect.top}:${rect.bottom}:${rect.left}:${rect.right}`;
  const [debouncedRect] = useDebouncedValue(watchablePos, 200);
  React.useEffect(() => {
    mapRef?.current?.invalidateSize();
  }, [debouncedRect]);

  const showMapPanel = !isDetailsOpen || !isMobile;

  const { defaultLayout, onLayoutChanged } = useCachedLayout({
    key: "operator-layout",
    currentPanels: isDetailsOpen
      ? isMobile
        ? ["details-panel"]
        : ["details-panel", "map-panel"]
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

  // Tracks the map's current center so navigation callbacks can use it
  const mapCenterRef = React.useRef<GeoLocation>();
  const onCenterChange = React.useCallback((center: GeoLocation) => {
    mapCenterRef.current = center;
  }, []);

  const { isOperator, selectedRegistrationNumber } = useSelectedBus();
  const {
    objs: { data: busses },
  } = useBusses();

  const onAddDistribution = React.useCallback(() => {
    if (compareByDateOnly(selectedDate, today) !== 0) {
      notifications.show({
        color: "yellow",
        icon: <IconExclamationMark />,
        withBorder: false,
        withCloseButton: true,
        mb: "xs",
        message: "Zum Hinzufügen bitte zum aktuellen Tag wechseln",
      });
      return;
    }
    if (isOperator && busses && !busses.some((b) => b.registrationNumber === selectedRegistrationNumber)) {
      notifications.show({
        color: "red",
        icon: <IconExclamationMark />,
        withBorder: false,
        withCloseButton: true,
        mb: "xs",
        message: `Kein Schichtträger mit Kennzeichen "${selectedRegistrationNumber}" gefunden`,
      });
      return;
    }
    if (!isOperator && !selectedRegistrationNumber) {
      notifications.show({
        color: "orange",
        icon: <IconExclamationMark />,
        withBorder: false,
        withCloseButton: true,
        mb: "xs",
        message: "Bitte wähle zuerst einen Schichtträger über das Benutzermenü oben rechts aus",
      });
      return;
    }
    navigate("/add", { state: mapCenterRef.current });
  }, [navigate, selectedDate, today, isOperator, selectedRegistrationNumber, busses]);

  const onAddComment = React.useCallback(() => {
    navigate("/add-comment", { state: mapCenterRef.current });
  }, [navigate]);

  const {
    objs: { data: distributions },
  } = useDistributions({ from: queryFrom, to: today });

  const {
    objs: { data: allComments },
  } = useComments({ from: null, to: null });

  // Show comments from the last 7 days, or pinned comments regardless of age
  const comments = React.useMemo(() => {
    if (!allComments) return [];
    const cutoff = queryFrom;
    return allComments.filter(
      (c) => c.isPinned || new Date(c.addOn) >= cutoff,
    );
  }, [allComments, queryFrom]);

  const [focusedGeoLocation, setFocusedDistributionId] =
    React.useState<GeoLocation>();

  const resetFocusedGeoLocation = React.useCallback(() => {
    setFocusedDistributionId(undefined);
  }, []);

  const [focusedCommentGeoLocation, setFocusedCommentGeoLocation] =
    React.useState<GeoLocation>();

  const resetFocusedCommentGeoLocation = React.useCallback(() => {
    setFocusedCommentGeoLocation(undefined);
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
        onAddDistribution={onAddDistribution}
        onAddComment={onAddComment}
      />

      <Group
        onLayoutChanged={onLayoutChanged}
        defaultLayout={defaultLayout}
        className="container"
        orientation={groupOrientation}
      >
        {showMapPanel && (
          <Panel
            id="map-panel"
            className="map-panel"
            defaultSize={isDetailsOpen ? "70" : "100"}
            minSize="30"
            elementRef={ref}
          >
            <MapPanel
              mapRef={mapRef}
              selectedDate={selectedDate}
              distributions={distributions}
              focusedGeoLocation={focusedGeoLocation}
              resetFocusedGeoLocation={resetFocusedGeoLocation}
              showDistributions={showDistributions}
              toggleShowDistributions={toggleShowDistributions}
              showComments={showComments}
              toggleShowComments={toggleShowComments}
              comments={comments ?? []}
              focusedCommentGeoLocation={focusedCommentGeoLocation}
              resetFocusedCommentGeoLocation={resetFocusedCommentGeoLocation}
              onCenterChange={onCenterChange}
            />
          </Panel>
        )}
        {isDetailsOpen && (
          <>
            {!isMobile && <GroupSeparator orientation={groupOrientation} />}
            <Panel
              defaultSize={isMobile ? "100" : "30"}
              minSize={isMobile ? "100" : "300px"}
              id="details-panel"
              className="details-panel"
            >
              <DetailsPanel
                selectedDate={selectedDate}
                distributions={distributions}
                comments={comments ?? []}
                today={today}
                onCardClick={onCardClick}
                onCommentCardClick={setFocusedCommentGeoLocation}
              />
            </Panel>
          </>
        )}
      </Group>
    </div>
  );
};
