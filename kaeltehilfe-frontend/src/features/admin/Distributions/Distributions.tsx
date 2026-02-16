import { rem, Title } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useField } from "@mantine/form";
import { MRT_ColumnDef } from "mantine-react-table";
import React from "react";
import { ExportConfig, Table } from "../../../common/components/Table/Table";
import { Distribution, useDistributions } from "../../../common/data";
import {
  compareByDateOnly,
  compareByDateTime,
  formatDate,
  formatDateTime,
  toNormalizedDate,
} from "../../../common/utils";

export const Distributions = () => {
  const today = toNormalizedDate(new Date()) || new Date();
  const oneMonthBefore =
    toNormalizedDate(new Date(today).setMonth(today.getMonth() - 1)) ||
    new Date();
  const rangeFilterField = useField<[Date | null, Date | null]>({
    mode: "controlled",
    initialValue: [oneMonthBefore, today],
  });

  const rangeFilter = rangeFilterField.getValue();
  const [from, to] = rangeFilter;
  const fromStart = from ? toNormalizedDate(from) : undefined;
  const toEnd = to
    ? toNormalizedDate(new Date(to).setDate(to?.getDate() + 1))
    : undefined;

  const {
    objs: { data: distributions, isFetching, isFetched },
    remove: { mutate: deleteDistribution, isPending: isDeleting },
    put: { isPending: isPutting },
  } = useDistributions({ from: fromStart || null, to: toEnd || null });

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
      `KB-Ausgaben-${new Date().toLocaleDateString().replace(".", "_")}.xlsx`,
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

  const handleDelete = React.useCallback(
    (goods: Array<Distribution>) => {
      goods.forEach((distribution) => deleteDistribution(distribution.id));
    },
    [deleteDistribution],
  );

  const isLoading = !isFetched && isFetching;
  const isTableLoading = isLoading || isPutting || isDeleting;

  return (
    <>
      <Title size="h1" mb="lg">
        Ausgaben
      </Title>
      <DatePickerInput
        {...rangeFilterField.getInputProps()}
        label="Zeitraum"
        w={rem(300)}
        mb="sm"
        type="range"
        valueFormat="DD MMMM YYYY"
      />
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
      />
    </>
  );
};
