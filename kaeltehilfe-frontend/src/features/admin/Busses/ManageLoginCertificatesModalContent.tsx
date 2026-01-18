import { Group, Text } from "@mantine/core";
import {
  IconCancel,
  IconCircleDashedCheck,
  IconDownload,
  IconHandStop,
  IconPlus,
} from "@tabler/icons-react";
import { MRT_ColumnDef } from "mantine-react-table";
import React from "react";
import { ModalMain, Table, openAppModal } from "../../../common/components";
import { OperatorLogin } from "../../../common/data";
import {
  LoginCertificate,
  fetchCertificateContent,
  useLoginCertificates,
  useRevokeLoginCertificate,
} from "../../../common/data/loginCertificate";
import { formatDateTime } from "../../../common/utils";
import { CreateLoginCertificateModalContent } from "./CreateLoginCertificateModalContent";

type ManageLoginCertificatesModalContentProps = {
  login?: OperatorLogin;
};

export const ManageLoginCertificatesModalContent = ({
  login,
}: ManageLoginCertificatesModalContentProps) => {
  const { mutate: revokeCertificate, isPending: isCertificateRevoking } =
    useRevokeLoginCertificate();

  const {
    objs: { data: loginCertificates, isLoading: isLoginCertificatesLoading },
  } = useLoginCertificates();

  const currentLoginCertificates = React.useMemo(
    () =>
      loginCertificates?.filter(
        (lc) =>
          lc.loginUsername?.toUpperCase() === login?.username?.toUpperCase(),
      ) || [],
    [login?.username, loginCertificates],
  );

  const downloadCert = (selectedCerts: LoginCertificate[]) => {
    if (selectedCerts.length !== 1) return;
    fetchCertificateContent(selectedCerts[0]);
  };

  const columns: Array<MRT_ColumnDef<LoginCertificate>> = [
    {
      accessorKey: "thumbprint",
      header: "Fingerabdruck",
    },
    {
      accessorKey: "description",
      header: "Beschreibung",
    },
    {
      accessorFn: ({ status }) =>
        status === "ACTIVE" ? (
          <Group align="flex-start" gap="xs">
            <Text>Aktiv</Text>
            <IconCircleDashedCheck color="green" />
          </Group>
        ) : (
          <Group align="flex-start" gap="xs">
            <Text>Gesperrt</Text>
            <IconCancel color="red" />
          </Group>
        ),
      header: "Status",
    },
    {
      accessorFn: ({ validFrom }) => formatDateTime(validFrom),
      header: "Gültig von",
    },
    {
      accessorFn: ({ validTo }) => formatDateTime(validTo),
      header: "Gültig bis",
    },
  ];

  const openCreateModal = React.useCallback(
    () =>
      openAppModal({
        title: `Anmeldezertifikat für ${login?.username?.toUpperCase()} erstellen`,
        modalId: "CreateLoginCertModal",
        size: "xl",
        children: <CreateLoginCertificateModalContent login={login} />,
      }),
    [login],
  );

  return (
    <ModalMain>
      <Table
        fillScreen
        tableKey="login-certificates"
        data={currentLoginCertificates}
        columns={columns}
        isLoading={isLoginCertificatesLoading || isCertificateRevoking}
        keyGetter="thumbprint"
        hideTopToolbarActions
        disablePagination
        customActions={[
          {
            label: "Sperren",
            icon: IconHandStop,
            isDisabled: (selected) =>
              selected?.length !== 1 || selected[0].status === "REVOKED",
            color: "red",
            variant: "outline",
            onClick: (selectedCerts) => {
              if (!selectedCerts || selectedCerts.length !== 1) return;
              revokeCertificate({ id: selectedCerts[0].id });
            },
          },
          {
            label: "Hinzufügen",
            icon: IconPlus,
            isDisabled: (selected) => selected?.length !== 0,
            color: "blue",
            variant: "light",
            onClick: openCreateModal,
          },
          {
            label: "Herunterladen",
            icon: IconDownload,
            isDisabled: (selected) => selected?.length !== 1,
            color: "blue",
            variant: "light",
            onClick: downloadCert,
          },
        ]}
      />
    </ModalMain>
  );
};
