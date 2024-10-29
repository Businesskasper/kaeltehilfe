import { Bus, Login } from "../../../common/app";
import { useLoginCertificates } from "../../../common/app/loginCertificate";
import { AppModal } from "../../../common/components";

type CreateLoginCertificateModalProps = {
  isOpen: boolean;
  close: () => void;
  bus?: Bus;
  login?: Login;
};
export const CreateLoginCertificateModal = ({
  isOpen,
  close,
  bus,
  login,
}: CreateLoginCertificateModalProps) => {
  const closeModal = () => {
    close();
  };

  const {
    post: { mutate: requestCertificate },
  } = useLoginCertificates();

  return (
    <AppModal
      close={closeModal}
      isOpen={isOpen && !!bus && !!login}
      size="sm"
      title={`Anmeldezertifikat hinzufügen`}
    ></AppModal>
  );
};
