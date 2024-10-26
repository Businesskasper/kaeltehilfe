import { Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
// import { IconLogin } from "@tabler/icons-react";
import { MRT_ColumnDef } from "mantine-react-table";
import React from "react";
import { Bus, useBusses } from "../../../common/app";
import { ExportConfig, Table } from "../../../common/components/Table/Table";
import { BusModal } from "./BusModal";

export const Busses = () => {
  const {
    objs: { data: busses, isLoading },
    remove: { isPending: isDeleting, mutate: deleteBus },
  } = useBusses();

  const [isModalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);

  const [selectedBusses, setSelectedBusses] = React.useState<Array<Bus>>([]);

  const columns: Array<MRT_ColumnDef<Bus>> = [
    {
      accessorKey: "registrationNumber",
      header: "Nummernschild",
    },
  ];

  const exportConfig: ExportConfig<Bus> = {
    fileName: () =>
      `KB-Schichtträger-${new Date()
        .toLocaleDateString()
        .replace(".", "_")}.xlsx`,
  };

  const handleEdit = React.useCallback(() => {
    openModal();
  }, [openModal]);

  const handleDelete = React.useCallback(
    (busses: Array<Bus>) => {
      busses.forEach((bus) => deleteBus(bus.id));
    },
    [deleteBus]
  );

  const handleAdd = React.useCallback(() => {
    openModal();
  }, [openModal]);

  const isTableLoading = isLoading || isDeleting;

  return (
    <>
      <Title size="h1" mb="lg">
        Schichtträger
      </Title>

      <Table
        data={busses || []}
        isLoading={isTableLoading}
        keyGetter="id"
        columns={columns}
        handleAdd={handleAdd}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        exportConfig={exportConfig}
        fillScreen
        tableKey="busses-overview"
        setSelected={setSelectedBusses}
        // customActions={[
        //   {
        //     label: "Passwort vergeben",
        //     icon: IconLogin,
        //     isDisabled: (selected) => selected?.length !== 1,
        //     color: "blue",
        //     variant: "light",
        //     onClick: (selected) => console.log(selected),
        //   },
        // ]}
        enableGrouping
      />
      <BusModal
        close={closeModal}
        isOpen={isModalOpened}
        existing={selectedBusses[0]}
      />
    </>
  );
};
