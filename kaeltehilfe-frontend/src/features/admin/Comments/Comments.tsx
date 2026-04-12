import { Box, Button, Group, Menu, Text, Title } from "@mantine/core";
import {
  useDebouncedValue,
  useOrientation,
  useResizeObserver,
} from "@mantine/hooks";
import {
  IconMap,
  IconMap2,
  IconPinFilled,
  IconRectangle,
  IconRectangleVertical,
} from "@tabler/icons-react";
import { MRT_ColumnDef } from "mantine-react-table";
import L from "leaflet";
import React from "react";
import {
  GroupSeparator,
  useCachedLayout,
} from "../../../common/components/Group";
import { openAppModal } from "../../../common/components";
import { Panel, Group as PanelGroup } from "react-resizable-panels";
import { Table } from "../../../common/components/Table/Table";
import { Comment, GeoLocation, useComments } from "../../../common/data";
import { formatDateTime, useBrowserStorage } from "../../../common/utils";
import { CommentModalContent } from "./CommentModalContent";
import { CommentsMapPanel } from "./CommentsMapPanel";

import "../../admin/Distributions/Distributions.scss";

export const AdminComments = () => {
  const {
    objs: { data: comments, isLoading },
    update: { isPending: isUpdating },
    remove: { isPending: isDeleting, mutate: deleteComment },
  } = useComments({ from: null, to: null });

  const [selectedComments, setSelectedComments] = React.useState<Array<Comment>>([]);

  // Reset unread badge when admin visits this page
  React.useEffect(() => {
    localStorage.setItem("ADMIN_COMMENTS_LAST_SEEN", new Date().toISOString());
  }, []);

  const openModal = React.useCallback(
    () =>
      openAppModal({
        title: "Kommentar bearbeiten",
        modalId: "CommentModal",
        zIndex: 1000,
        children: <CommentModalContent existing={selectedComments[0]} />,
      }),
    [selectedComments],
  );

  const handleEdit = React.useCallback(() => {
    openModal();
  }, [openModal]);

  const handleDelete = React.useCallback(
    (items: Array<Comment>) => {
      items.forEach((comment) => deleteComment(comment.id));
    },
    [deleteComment],
  );

  const { type: orientationType } = useOrientation({
    getInitialValueInEffect: false,
  });

  const [orientation, setOrientation] = useBrowserStorage<"horizontal" | "vertical">(
    "SESSION",
    "ADMIN_COMMENTS_MAP_ORIENTATION",
    () =>
      orientationType === "landscape-primary" || orientationType === "landscape-secondary"
        ? "horizontal"
        : "vertical",
  );

  const [isMapOpen, setIsMapOpen] = useBrowserStorage(
    "SESSION",
    "ADMIN_COMMENTS_MAP_OPEN",
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
    key: "admin-comments-layout",
    currentPanels: isMapOpen ? ["map-panel", "table-panel"] : ["table-panel"],
    initialLayout: {
      panels: ["map-panel", "table-panel"],
      panelConfigs: { "map-panel": 50, "table-panel": 50 },
    },
  });

  const [focusedGeoLocation, setFocusedGeoLocation] = React.useState<GeoLocation>();
  const resetFocusedGeoLocation = React.useCallback(() => {
    setFocusedGeoLocation(undefined);
  }, []);

  const goToMarker = React.useCallback(
    (id: number) => {
      const geoLocation = comments?.find((c) => c.id === id)?.geoLocation;
      if (!geoLocation) return;
      setFocusedGeoLocation(geoLocation);
    },
    [comments],
  );

  const columns: Array<MRT_ColumnDef<Comment>> = [
    {
      accessorKey: "displayName",
      header: "Schichtträger",
    },
    {
      accessorKey: "text",
      header: "Kommentar",
      Cell: ({ row }) => {
        // Strip HTML tags to get plain text for the preview
        const plain = row.original.text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        const firstLine = plain.split(/\n/)[0];
        const hasMore = row.original.text.replace(/<\/?(p|li|ul|ol|br)[^>]*>/gi, "\n").replace(/<[^>]+>/g, "").trim().split("\n").filter(Boolean).length > 1;
        return (
          <span>
            {firstLine}
            {hasMore && <span style={{ color: "gray" }}> …</span>}
          </span>
        );
      },
    },
    {
      accessorKey: "isPinned",
      header: "Fixiert",
      Cell: ({ row: { original } }) =>
        original.isPinned ? (
          <Box style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
            <IconPinFilled size={16} />
            <span>Ja</span>
          </Box>
        ) : (
          <span></span>
        ),
    },
    {
      accessorKey: "locationName",
      header: "Ort",
    },
    {
      id: "addOn",
      header: "Zeitstempel",
      accessorFn: ({ addOn }) => formatDateTime(addOn),
    },
  ];

  const isTableLoading = isLoading || isUpdating || isDeleting;

  return (
    <>
      <Title size="h2" mb="lg">
        Kommentare
      </Title>

      <Group justify="flex-end" mb="md">
        <Button
          size="sm"
          variant="default"
          onClick={toggleMapOpen}
          rightSection={<IconMap2 />}
        >
          Karte
        </Button>
        <Button
          size="sm"
          variant="default"
          disabled={!isMapOpen}
          onClick={() =>
            setOrientation((old) => (old === "horizontal" ? "vertical" : "horizontal"))
          }
          rightSection={
            orientation === "horizontal" ? <IconRectangle /> : <IconRectangleVertical />
          }
        >
          {orientation === "horizontal" ? "Horizontal" : "Vertikal"}
        </Button>
      </Group>

      <PanelGroup
        onLayoutChanged={onLayoutChanged}
        defaultLayout={defaultLayout}
        className="distributions-container"
        orientation={orientation}
      >
        {isMapOpen && (
          <>
            <Panel id="map-panel" className="map-panel" defaultSize={50} elementRef={ref}>
              <CommentsMapPanel
                comments={comments ?? []}
                mapRef={mapRef}
                focusedGeoLocation={focusedGeoLocation}
                resetFocusedGeoLocation={resetFocusedGeoLocation}
              />
            </Panel>
            <GroupSeparator orientation={orientation} />
          </>
        )}
        <Panel id="table-panel" className="table-panel" defaultSize={50}>
          <Table
            data={comments || []}
            isLoading={isTableLoading}
            keyGetter="id"
            columns={columns}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            fillScreen
            tableKey="comments-overview"
            setSelected={setSelectedComments}
            renderDetailPanel={({ row }) => (
              <div
                style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}
                // Comment text is HTML from Tiptap editor
                dangerouslySetInnerHTML={{ __html: row.original.text }}
              />
            )}
            renderRowActionMenuItems={({ row }) => (
              <Menu.Item
                disabled={!comments?.find((c) => c.id === Number(row.id))?.geoLocation}
                onClick={() => goToMarker(Number(row.id))}
              >
                <Group>
                  <IconMap />
                  <Text>Auf der Karte zeigen</Text>
                </Group>
              </Menu.Item>
            )}
          />
        </Panel>
      </PanelGroup>
    </>
  );
};
