import { Group, Menu, Text } from "@mantine/core";
import { IconMap } from "@tabler/icons-react";
import { MRT_ColumnDef } from "mantine-react-table";
import React from "react";
import { ExportConfig, Table } from "../../../common/components";
import {
  Distribution,
  GeoLocation,
  useDistributions,
} from "../../../common/data";
import {
  compareByDateOnly,
  compareByDateTime,
  formatDate,
  formatDateTime,
} from "../../../common/utils";

type TablePanelProps = {
  distHook: ReturnType<typeof useDistributions>;
  setFocusedGeoLocation: React.Dispatch<
    React.SetStateAction<GeoLocation | undefined>
  >;
};

export const TablePanel = ({
  distHook,
  setFocusedGeoLocation,
}: TablePanelProps) => {
  const {
    objs: { data: distributions, isFetching, isFetched },
    remove: { mutate: deleteDistribution, isPending: isDeleting },
    put: { isPending: isPutting },
  } = distHook;

  const columns: Array<MRT_ColumnDef<Distribution>> = [
    {
      id: "date",
      header: "Datum",
      accessorFn: ({ timestamp }) => formatDate(timestamp),
      sortingFn: (a, b) => {
        return compareByDateOnly(a.original.timestamp, b.original.timestamp);
      },
    },
    {
      accessorKey: "bus.registrationNumber",
      header: "Schichtträger",
    },
    {
      accessorKey: "client.name",
      header: "Klient",
    },

    {
      accessorKey: "good.name",
      header: "Gut",
    },
    {
      accessorKey: "quantity",
      header: "Anzahl",
      aggregationFn: "sum",
      AggregatedCell: ({ cell }) => cell.getValue() as number,
    },
    {
      accessorKey: "locationName",
      header: "Ort",
    },
    {
      id: "timestamp",
      header: "Zeitstempel",
      accessorFn: ({ timestamp }) => formatDateTime(timestamp),
      sortingFn: (a, b) => {
        return compareByDateTime(a.original.timestamp, b.original.timestamp);
      },
    },
  ];

  const exportConfig: ExportConfig<Distribution> = {
    fileName: () =>
      `KH-Ausgaben-${new Date().toLocaleDateString().replace(".", "_")}.xlsx`,
    transformators: {
      bus: {
        columnName: "Schichtträger",
        transformFn: ({ bus }) => bus.registrationNumber || "",
      },
      client: {
        columnName: "Klient",
        transformFn: ({ client }) => client.name || "",
      },
      quantity: {
        columnName: "Anzahl",
        transformFn: ({ quantity }) => quantity?.toString() || "",
      },
      locationName: {
        columnName: "Ort",
        transformFn: ({ locationName }) => locationName || "",
      },
      good: {
        columnName: "Gut",
        transformFn: ({ good }) => good.name || "",
      },
      timestamp: {
        columnName: "Zeitstempel",
        transformFn: ({ timestamp }) => formatDateTime(timestamp),
      },
    },
  };

  const isTableLoading = (!isFetched && isFetching) || isPutting || isDeleting;

  const handleDelete = React.useCallback(
    (goods: Array<Distribution>) => {
      goods.forEach((distribution) => deleteDistribution(distribution.id));
    },
    [deleteDistribution],
  );

  const goToMarker = React.useCallback(
    (id: number) => {
      const { lat, lng } =
        distributions?.find((d) => d.id === id)?.geoLocation || {};
      if (!lat || !lng) return;
      setFocusedGeoLocation({ lat, lng });
    },
    [distributions, setFocusedGeoLocation],
  );

  return (
    <Table
      data={distributions || []}
      isLoading={isTableLoading}
      keyGetter="id"
      columns={columns}
      handleDelete={handleDelete}
      exportConfig={exportConfig}
      fillScreen
      tableKey="distributions-overview"
      defaultSorting={[{ id: "timestamp", desc: true }]}
      enableGrouping
      renderRowActionMenuItems={({ row }) => (
        <>
          <Menu.Item
            onClick={() => {
              const { id } = row;
              const parsed = parseInt(id);
              if (!!parsed && !isNaN(parsed)) {
                goToMarker(parsed);
              }
            }}
          >
            <Group>
              <IconMap />
              <Text>Auf der Karte zeigen</Text>
            </Group>
          </Menu.Item>
        </>
      )}
    />
  );
};
