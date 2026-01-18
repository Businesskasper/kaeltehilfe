import { Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { MRT_ColumnDef } from "mantine-react-table";
import React from "react";
import { openAppModal } from "../../../common/components";
import { ExportConfig, Table } from "../../../common/components/Table/Table";
import { AdminLogin, isAdminLogin, useLogins } from "../../../common/data";
import { formatDateTime } from "../../../common/utils";
import { useProfile } from "../../../common/utils/useProfile";
import { AdminLoginModalContent } from "./AdminModalContent";

export const Admins = () => {
  const profile = useProfile();
  const {
    objs: { data: logins, isLoading },
    remove: { isPending: isDeleting, mutate: deleteLogin },
  } = useLogins();
  const adminLogins = React.useMemo<Array<AdminLogin>>(
    () =>
      logins?.filter((login): login is AdminLogin => isAdminLogin(login)) || [],
    [logins],
  );

  const [selectedLogins, setSelectedLogins] = React.useState<Array<AdminLogin>>(
    [],
  );

  const openModal = React.useCallback(
    () =>
      openAppModal({
        title: selectedLogins[0] ? "Bearbeiten" : "Hinzufügen",
        modalId: "AdminLoginModal",
        children: <AdminLoginModalContent existing={selectedLogins[0]} />,
      }),
    [selectedLogins],
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
      logins.forEach((login) => {
        if (login.username !== profile?.username)
          deleteLogin(login.username as unknown as number);
        else {
          notifications.show({
            message: `Der eigene Benutzer kann nicht gelöscht werden`,
            withBorder: true,
            withCloseButton: true,
            w: "100%",
            my: "sm",
            autoClose: false,
            color: "red",
          });
        }
      });
    },
    [deleteLogin, profile?.username],
  );

  // const handleDelete = React.useCallback(
  //   (logins: Array<AdminLogin>) => {
  //     const handleDeletes = logins.map((login) => {
  //       return new Promise<void>((resolve, reject) => {
  //         if (login.username !== profile?.username)
  //           deleteLogin(login.username as unknown as number, {
  //             onSettled: resolve,
  //             onError: reject,
  //           });
  //         else {
  //           notifications.show({
  //             message: `Der eigene Benutzer kann nicht gelöscht werden`,
  //             withBorder: true,
  //             withCloseButton: true,
  //             w: "100%",
  //             my: "sm",
  //             autoClose: false,
  //             color: "red",
  //           });
  //           resolve();
  //         }
  //       });
  //     });
  //     Promise.allSettled(handleDeletes).then(() => {
  //       console.log("refetch all");
  //       invalidate();
  //     });
  //   },
  //   [deleteLogin, invalidate, profile?.username]
  // );

  const handleAdd = React.useCallback(() => {
    openModal();
  }, [openModal]);

  const isTableLoading = isLoading || isDeleting;

  return (
    <>
      <Title size="h1" mb="lg">
        Admin-Logins
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
    </>
  );
};
