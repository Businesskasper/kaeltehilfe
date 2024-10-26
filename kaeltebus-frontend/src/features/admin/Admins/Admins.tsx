import { Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
// import { IconLogin } from "@tabler/icons-react";
import { MRT_ColumnDef } from "mantine-react-table";
import React from "react";
import { AdminLogin, isAdminLogin, useLogins } from "../../../common/app";
import { ExportConfig, Table } from "../../../common/components/Table/Table";
import { formatDateTime } from "../../../common/utils";
import { AdminModal } from "./AdminModal";

export const Admins = () => {
  const {
    objs: { data: logins, isLoading },
    remove: { isPending: isDeleting, mutate: deleteLogin },
  } = useLogins();
  const adminLogins = React.useMemo<Array<AdminLogin>>(
    () =>
      logins?.filter((login): login is AdminLogin => isAdminLogin(login)) || [],
    [logins]
  );

  const [isModalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);

  const [selectedLogins, setSelectedLogins] = React.useState<Array<AdminLogin>>(
    []
  );

  const columns: Array<MRT_ColumnDef<AdminLogin>> = [
    {
      accessorKey: "username",
      header: "Benutzername",
    },
    {
      header: "Name",
      accessorFn: (l) => `${l.firstname} ${l.lastname}`,
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      header: "Hinzugefügt",
      accessorFn: (l) => formatDateTime(l.createOn),
    },
  ];

  const exportConfig: ExportConfig<AdminLogin> = {
    fileName: () =>
      `KB-Anmeldungen-${new Date()
        .toLocaleDateString()
        .replace(".", "_")}.xlsx`,
  };

  const handleEdit = React.useCallback(() => {
    openModal();
  }, [openModal]);

  const handleDelete = React.useCallback(
    (logins: Array<AdminLogin>) => {
      logins.forEach((login) =>
        deleteLogin(login.username as unknown as number)
      );
    },
    [deleteLogin]
  );

  const handleAdd = React.useCallback(() => {
    openModal();
  }, [openModal]);

  const isTableLoading = isLoading || isDeleting;

  return (
    <>
      <Title size="h1" mb="lg">
        Administratoren
      </Title>

      <Table
        data={adminLogins || []}
        isLoading={isTableLoading}
        keyGetter="username"
        columns={columns}
        handleAdd={handleAdd}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        exportConfig={exportConfig}
        fillScreen
        tableKey="busses-overview"
        setSelected={setSelectedLogins}
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
      <AdminModal
        close={closeModal}
        isOpen={isModalOpened}
        existing={selectedLogins[0]}
      />
    </>
  );
};
