import { Title } from "@mantine/core";
// import { IconLogin } from "@tabler/icons-react";
import { IconCertificate } from "@tabler/icons-react";
import { MRT_ColumnDef } from "mantine-react-table";
import React from "react";
import {
  Bus,
  OperatorLogin,
  isOperatorLogin,
  useBusses,
  useLogins,
} from "../../../common/app";
import { openAppModal } from "../../../common/components";
import { ExportConfig, Table } from "../../../common/components/Table/Table";
import { BusModalContent } from "./BusModalContent";
import { ManageLoginCertificatesModalContent } from "./ManageLoginCertificatesModalContent";

export const Busses = () => {
  const {
    objs: { data: busses, isLoading },
    remove: { isPending: isDeleting, mutate: deleteBus },
  } = useBusses();

  const {
    objs: { data: logins },
  } = useLogins();

  const [selectedBusses, setSelectedBusses] = React.useState<Array<Bus>>([]);
  const selectedBusLogin = React.useMemo<OperatorLogin | undefined>(
    () =>
      selectedBusses.length === 1
        ? logins?.find(
            (l): l is OperatorLogin =>
              isOperatorLogin(l) &&
              l.registrationNumber.toUpperCase() ===
                selectedBusses[0].registrationNumber.toUpperCase()
          )
        : undefined,
    [logins, selectedBusses]
  );

  const openCrudModal = React.useCallback(
    () =>
      openAppModal({
        title: selectedBusses[0] ? "Bearbeiten" : "Hinzufügen",
        modalId: "BusModal",
        children: <BusModalContent existing={selectedBusses[0]} />,
      }),
    [selectedBusses]
  );

  const openCertModal = React.useCallback(
    () =>
      openAppModal({
        title: `Anmeldezertifikate für ${selectedBusses[0]?.registrationNumber?.toUpperCase()}`,
        size: "xl",
        children: (
          <ManageLoginCertificatesModalContent login={selectedBusLogin} />
        ),
      }),
    [selectedBusLogin, selectedBusses]
  );

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

  // const handleEdit = React.useCallback(() => {
  //   openCrudModal();
  // }, [openCrudModal]);

  const handleDelete = React.useCallback(
    (busses: Array<Bus>) => {
      busses.forEach((bus) => deleteBus(bus.id));
    },
    [deleteBus]
  );

  const handleAdd = React.useCallback(() => {
    openCrudModal();
  }, [openCrudModal]);

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
        // handleEdit={handleEdit}
        handleDelete={handleDelete}
        exportConfig={exportConfig}
        fillScreen
        tableKey="busses-overview"
        setSelected={setSelectedBusses}
        customActions={[
          {
            label: "Anmeldezertifikate verwalten",
            icon: IconCertificate,
            isDisabled: (selected) => selected?.length !== 1,
            color: "blue",
            variant: "light",
            onClick: openCertModal,
          },
        ]}
        enableGrouping
      />
    </>
  );
};
