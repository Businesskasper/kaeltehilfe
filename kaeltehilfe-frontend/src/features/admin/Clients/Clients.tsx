import { Title } from "@mantine/core";
import { MRT_ColumnDef } from "mantine-react-table";
import React from "react";
import { openAppModal } from "../../../common/components";
import { ExportConfig, Table } from "../../../common/components/Table/Table";
import { Client, useClients } from "../../../common/data/client";
import { GenderTranslation } from "../../../common/data/gender";
import { ClientModalContent } from "./ClientsModalContent";

export const Clients = () => {
  const {
    objs: { data: clients, isLoading },
    put: { isPending: isPutting },
  } = useClients();

  const [selectedClients, setSelectedClients] = React.useState<Array<Client>>(
    [],
  );

  const openModal = React.useCallback(
    () =>
      openAppModal({
        title: selectedClients[0] ? "Bearbeiten" : "Hinzufügen",
        modalId: "ClientsModal",
        children: <ClientModalContent existing={selectedClients[0]} />,
      }),
    [selectedClients],
  );

  const columns: Array<MRT_ColumnDef<Client>> = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorFn: ({ gender }) => {
        if (!gender) return "";

        const { label } = GenderTranslation[gender];
        return label ?? gender;
      },
      header: "Geschlecht",
    },
    {
      accessorKey: "approxAge",
      header: "Geschätztes Alter",
    },
    {
      accessorKey: "remarks",
      header: "Notizen",
    },
  ];

  const exportConfig: ExportConfig<Client> = {
    fileName: () =>
      `KH-Klienten-${new Date().toLocaleDateString().replace(".", "_")}.xlsx`,
    transformators: {
      gender: {
        columnName: "Geschlecht",
        transformFn: ({ gender }) =>
          gender ? GenderTranslation[gender]?.label : "",
      },
    },
  };

  const handleEdit = React.useCallback(() => {
    openModal();
  }, [openModal]);

  const isTableLoading = isLoading || isPutting;

  return (
    <>
      <Title size="h2" mb="lg">
        Klienten
      </Title>

      <Table
        data={clients || []}
        isLoading={isTableLoading}
        keyGetter="id"
        columns={columns}
        handleEdit={handleEdit}
        exportConfig={exportConfig}
        fillScreen
        tableKey="clients-overview"
        setSelected={setSelectedClients}
        enableGrouping
      />
    </>
  );
};
