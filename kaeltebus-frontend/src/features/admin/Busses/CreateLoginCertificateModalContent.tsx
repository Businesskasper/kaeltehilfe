import { Button, Group } from "@mantine/core";
import { modals } from "@mantine/modals";
import { Bus, Login } from "../../../common/app";
import { ModalActions, ModalMain } from "../../../common/components";

type CreateLoginCertificateModalContentProps = {
  bus?: Bus;
  login?: Login;
};
export const CreateLoginCertificateModalContent = ({
  bus,
  login,
}: CreateLoginCertificateModalContentProps) => {
  const closeModal = () => {
    modals.close("CreateLoginCertModal");
  };

  console.log(bus, login);

  // const {
  //   post: { mutate: requestCertificate },
  // } = useLoginCertificates();

  return (
    <>
      <ModalMain>jooo</ModalMain>
      <ModalActions>
        <Group justify="space-between" mt="xl">
          <Button color="red" variant="subtle" onClick={closeModal}>
            Abbrechen
          </Button>
          <Button
          // disabled={!form.isTouched() || !form.isDirty()}
          // onClick={() => form.onSubmit(onSubmit)()}
          >
            Abschicken
          </Button>
        </Group>
      </ModalActions>
    </>
  );
};
