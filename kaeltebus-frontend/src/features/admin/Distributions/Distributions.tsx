import { Title } from "@mantine/core";
import { MRT_ColumnDef } from "mantine-react-table";
import React from "react";
import { Distribution, useDistributions } from "../../../common/app";
import { ExportConfig, Table } from "../../../common/components/Table/Table";
import {
  compareByDateOnly,
  compareByDateTime,
  formatDate,
  formatDateTime,
} from "../../../common/utils";

export const Distributions = () => {
  const {
    objs: { data: distributions, isLoading },
    remove: { mutate: deleteDistribution, isPending: isDeleting },
    put: { isPending: isPutting },
  } = useDistributions();

  //   const [isModalOpened, { open: openModal, close: closeModal }] =
  //     useDisclosure(false);

  //   const [selectedDistributions, setSelectedDistributions] = React.useState<
  //     Array<Distribution>
  //   >([]);

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
      accessorKey: "device.registrationNumber",
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
      device: {
        columnName: "Schichtträger",
        transformFn: ({ device }) => device.registrationNumber || "",
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

  //   const handleEdit = React.useCallback(() => {
  //     openModal();
  //   }, [openModal]);

  const handleDelete = React.useCallback(
    (goods: Array<Distribution>) => {
      goods.forEach((distribution) => deleteDistribution(distribution.id));
    },
    [deleteDistribution]
  );

  const isTableLoading = isLoading || isPutting || isDeleting;

  return (
    <>
      <Title size="h1" mb="lg">
        Ausgaben
      </Title>

      <Table
        data={distributions || []}
        isLoading={isTableLoading}
        keyGetter="id"
        columns={columns}
        // handleAdd={handleAdd}
        // handleEdit={handleEdit}
        handleDelete={handleDelete}
        exportConfig={exportConfig}
        fillScreen
        tableKey="goods-overview"
        // setSelected={setSelectedDistributions}
        defaultSorting={[{ id: "timestamp", desc: true }]}
      />
      {/* <GoodModal
        close={closeModal}
        isOpen={isModalOpened}
        existing={selectedDistributions[0]}
      /> */}
    </>
  );
};
