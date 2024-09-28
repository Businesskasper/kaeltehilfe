import { Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconLogin } from "@tabler/icons-react";
import { MRT_ColumnDef } from "mantine-react-table";
import React from "react";
import { Device, useDevices } from "../../../common/app";
import { ExportConfig, Table } from "../../../common/components/Table/Table";
import { DeviceModal } from "./DeviceModal";

export const Devices = () => {
  const {
    objs: { data: devices, isLoading },
    // put: { isPending: isPutting },
    remove: { isPending: isDeleting, mutate: deleteDevice },
  } = useDevices();

  const [isModalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);

  const [selectedDevices, setSelectedDevices] = React.useState<Array<Device>>(
    []
  );

  const columns: Array<MRT_ColumnDef<Device>> = [
    {
      accessorKey: "registrationNumber",
      header: "Nummernschild",
    },
  ];

  const exportConfig: ExportConfig<Device> = {
    fileName: () =>
      `KB-Schichtträger-${new Date()
        .toLocaleDateString()
        .replace(".", "_")}.xlsx`,
  };

  const handleEdit = React.useCallback(() => {
    openModal();
  }, [openModal]);

  const handleDelete = React.useCallback(
    (goods: Array<Device>) => {
      goods.forEach((good) => deleteDevice(good.id));
    },
    [deleteDevice]
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
        data={devices || []}
        isLoading={isTableLoading}
        keyGetter="id"
        columns={columns}
        handleAdd={handleAdd}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        exportConfig={exportConfig}
        fillScreen
        tableKey="devices-overview"
        setSelected={setSelectedDevices}
        customActions={[
          {
            label: "Passwort vergeben",
            icon: IconLogin,
            isDisabled: (selected) => selected?.length !== 1,
            color: "blue",
            variant: "light",
            onClick: (selected) => console.log(selected),
          },
        ]}
        enableGrouping
      />
      <DeviceModal
        close={closeModal}
        isOpen={isModalOpened}
        existing={selectedDevices[0]}
      />
    </>
  );
};
