import { Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
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
import { ExportConfig, Table } from "../../../common/components/Table/Table";
import { BusModal } from "./BusModal";
import { LoginCertificatesModal } from "./LoginCertificatesModal";

export const Busses = () => {
  const {
    objs: { data: busses, isLoading },
    remove: { isPending: isDeleting, mutate: deleteBus },
  } = useBusses();

  const {
    objs: { data: logins },
  } = useLogins();

  const [isCrudModalOpened, { open: openCrudModal, close: closeCrudModal }] =
    useDisclosure(false);

  const [isCertModalOpened, { open: openCertModal, close: closeCertModal }] =
    useDisclosure(false);

  const [selectedBusses, setSelectedBusses] = React.useState<Array<Bus>>([]);
  const selectedBusLogin: OperatorLogin | undefined =
    selectedBusses.length === 1
      ? logins?.find(
          (l): l is OperatorLogin =>
            isOperatorLogin(l) &&
            l.registrationNumber.toUpperCase() ===
              selectedBusses[0].registrationNumber.toUpperCase()
        )
      : undefined;

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
    openCrudModal();
  }, [openCrudModal]);

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
        handleEdit={handleEdit}
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
      <BusModal
        close={closeCrudModal}
        isOpen={isCrudModalOpened}
        existing={selectedBusses[0]}
      />
      <LoginCertificatesModal
        login={selectedBusLogin}
        bus={selectedBusses[0]}
        close={closeCertModal}
        isOpen={isCertModalOpened && !!selectedBusLogin && !!selectedBusses[0]}
      />
    </>
  );
};
