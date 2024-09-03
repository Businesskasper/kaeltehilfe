import { Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { MRT_ColumnDef } from "mantine-react-table";
import React from "react";
import { Client, useClients } from "../../../common/app/client";
import { GenderTranslation } from "../../../common/app/gender";
import { ExportConfig, Table } from "../../../common/components/Table/Table";
import { ClientModal } from "./ClientsModal";

export const Clients = () => {
  const {
    objs: { data: clients, isLoading },
    put: { isPending: isPutting },
  } = useClients();

  const [isModalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);

  const [selectedClients, setSelectedClients] = React.useState<Array<Client>>(
    []
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
      `KB-Klienten-${new Date().toLocaleDateString().replace(".", "_")}.xlsx`,
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
      <Title size="h1" mb="lg">
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
        tableKey="volunteers-overview"
        setSelected={setSelectedClients}
      />
      <ClientModal
        close={closeModal}
        isOpen={isModalOpened}
        existing={selectedClients[0]}
      />
    </>
  );
};
