import { useDisclosure } from "@mantine/hooks";
import { IconDownload, IconPlus } from "@tabler/icons-react";
import { MRT_ColumnDef } from "mantine-react-table";
import React from "react";
import { Bus, OperatorLogin } from "../../../common/app";
import {
  LoginCertificate,
  fetchCertificateContent,
  useLoginCertificates,
} from "../../../common/app/loginCertificate";
import { AppModal, ModalMain, Table } from "../../../common/components";
import { formatDateTime } from "../../../common/utils";

type LoginCertificatesModalProps = {
  isOpen: boolean;
  close: () => void;
  bus?: Bus;
  login?: OperatorLogin;
};

export const LoginCertificatesModal = ({
  isOpen,
  close,
  bus,
  login,
}: LoginCertificatesModalProps) => {
  const closeModal = () => {
    close();
  };

  const {
    objs: { data: loginCertificates, isLoading: isLoginCertificatesLoading },
  } = useLoginCertificates();

  const currentLoginCertificates = React.useMemo(
    () =>
      loginCertificates?.filter(
        (lc) =>
          lc.loginUsername?.toUpperCase() === login?.username?.toUpperCase()
      ) || [],
    [login?.username, loginCertificates]
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
      accessorFn: ({ validFrom }) => formatDateTime(validFrom),
      header: "Gültig von",
    },
    {
      accessorFn: ({ validTo }) => formatDateTime(validTo),
      header: "Gültig bis",
    },
  ];

  const [
    isCertCreateModalOpen,
    { open: openCreateCertmodal, close: closeCreateCertModal },
  ] = useDisclosure(false);

  return (
    <AppModal
      close={closeModal}
      isOpen={isOpen && !!bus && !!login}
      size="xl"
      title={`Anmeldezertifikate für ${bus?.registrationNumber?.toUpperCase()}`}
    >
      <ModalMain>
        <Table
          tableKey="login-certificates"
          data={currentLoginCertificates}
          columns={columns}
          isLoading={isLoginCertificatesLoading}
          keyGetter="thumbprint"
          hideTopToolbarActions
          disablePagination
          customActions={[
            {
              label: "Hinzufügen",
              icon: IconPlus,
              isDisabled: (selected) => selected?.length !== 0,
              color: "blue",
              variant: "light",
              onClick: openCreateCertmodal,
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
          // columns={columns}
          // handleEdit={handleEdit}
          // exportConfig={exportConfig}
          // fillScreen
          // tableKey="clients-overview"
          // setSelected={setSelectedClients}
          // enableGrouping
        />
      </ModalMain>
      <LoginCertificatesModal
        close={closeCreateCertModal}
        isOpen={isOpen && isCertCreateModalOpen && !!bus && !!login}
        bus={bus}
        login={login}
      />
    </AppModal>
  );
};
