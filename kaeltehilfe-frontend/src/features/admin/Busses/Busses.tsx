import { Title } from "@mantine/core";
import { MRT_ColumnDef } from "mantine-react-table";
import React from "react";
import { formatDateTime } from "../../../common/utils";
import { openAppModal } from "../../../common/components";
import { ExportConfig, Table } from "../../../common/components/Table/Table";
import {
  Bus,
  OperatorLogin,
  isOperatorLogin,
  useBusses,
  useLogins,
} from "../../../common/data";
import { BusModalContent } from "./BusModalContent";
import { ManageLoginCertificatesDetailsContent } from "./ManageLoginCertificatesDetailsContent";

export const Busses = () => {
  const {
    objs: { data: busses, isLoading },
    remove: { isPending: isDeleting, mutate: deleteBus },
  } = useBusses();

  const {
    objs: { data: logins },
  } = useLogins();

  const [selectedBusses, setSelectedBusses] = React.useState<Array<Bus>>([]);

  const getBusLogin = (registrationNumber?: string) => {
    return !logins || !registrationNumber
      ? null
      : logins.find(
          (l): l is OperatorLogin =>
            isOperatorLogin(l) &&
            l.registrationNumber?.toUpperCase() ===
              registrationNumber?.toUpperCase(),
        );
  };

  const openCrudModal = React.useCallback(
    () =>
      openAppModal({
        title: selectedBusses[0] ? "Bearbeiten" : "Hinzufügen",
        modalId: "BusModal",
        children: <BusModalContent existing={selectedBusses[0]} />,
      }),
    [selectedBusses],
  );

  const columns: Array<MRT_ColumnDef<Bus>> = [
    {
      accessorKey: "registrationNumber",
      header: "Nummernschild",
    },
    {
      header: "Letzter Login",
      accessorFn: (bus) => {
        const login = getBusLogin(bus.registrationNumber?.toUpperCase());
        return login?.lastLoginOn ? formatDateTime(login.lastLoginOn) : "—";
      },
    },
  ];

  const exportConfig: ExportConfig<Bus> = {
    fileName: () =>
      `KH-Schichtträger-${new Date()
        .toLocaleDateString()
        .replace(".", "_")}.xlsx`,
  };

  const handleDelete = React.useCallback(
    (busses: Array<Bus>) => {
      busses.forEach((bus) => deleteBus(bus.id));
    },
    [deleteBus],
  );

  const handleAdd = React.useCallback(() => {
    openCrudModal();
  }, [openCrudModal]);

  const isTableLoading = isLoading || isDeleting;

  return (
    <>
      <Title size="h2" mb="lg">
        Schichtträger
      </Title>

      <Table
        data={busses || []}
        isLoading={isTableLoading}
        keyGetter="id"
        columns={columns}
        handleAdd={handleAdd}
        handleDelete={handleDelete}
        exportConfig={exportConfig}
        fillScreen
        tableKey="busses-overview"
        setSelected={setSelectedBusses}
        enableGrouping
        renderDetailPanel={({ row }) => {
          const login = getBusLogin(
            row.original.registrationNumber?.toUpperCase(),
          );
          return login ? (
            <ManageLoginCertificatesDetailsContent login={login} />
          ) : null;
        }}
      />
    </>
  );
};
