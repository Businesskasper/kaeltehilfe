import { IconDownload, IconHandStop, IconPlus } from "@tabler/icons-react";
import { MRT_ColumnDef } from "mantine-react-table";
import React from "react";
import { OperatorLogin } from "../../../common/app";
import {
  LoginCertificate,
  fetchCertificateContent,
  useLoginCertificates,
} from "../../../common/app/loginCertificate";
import { ModalMain, Table, openAppModal } from "../../../common/components";
import { formatDateTime } from "../../../common/utils";
import { CreateLoginCertificateModalContent } from "./CreateLoginCertificateModalContent";

type ManageLoginCertificatesModalContentProps = {
  login?: OperatorLogin;
};

export const ManageLoginCertificatesModalContent = ({
  login,
}: ManageLoginCertificatesModalContentProps) => {
  // const closeModal = () => {
  //   modals.close("LoginCertificatesModal");
  // };

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
      accessorKey: "description",
      header: "Beschreibung",
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

  // const [
  //   // isCertCreateModalOpen,
  //   { open: openCreateCertmodal },
  // ] = useDisclosure(false);

  const openCreateModal = React.useCallback(
    () =>
      openAppModal({
        title: `Anmeldezertifikat für ${login?.username?.toUpperCase()} erstellen`,
        modalId: "CreateLoginCertModal",
        size: "xl",
        children: <CreateLoginCertificateModalContent login={login} />,
      }),
    [login]
  );

  return (
    <ModalMain>
      <Table
        fillScreen
        tableKey="login-certificates"
        data={currentLoginCertificates}
        columns={columns}
        isLoading={isLoginCertificatesLoading}
        keyGetter="thumbprint"
        hideTopToolbarActions
        disablePagination
        customActions={[
          {
            label: "Sperren",
            icon: IconHandStop,
            isDisabled: (selected) => selected?.length !== 1,
            color: "red",
            variant: "outline",
            onClick: () => {
              alert("Kommt noch");
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
        // columns={columns}
        // handleEdit={handleEdit}
        // exportConfig={exportConfig}
        // fillScreen
        // tableKey="clients-overview"
        // setSelected={setSelectedClients}
        // enableGrouping
      />
    </ModalMain>
    // <LoginCertificatesModalContent
    //   close={closeCreateCertModal}
    //   isOpen={isOpen && isCertCreateModalOpen && !!bus && !!login}
    //   bus={bus}
    //   login={login}
    // />
  );
};
