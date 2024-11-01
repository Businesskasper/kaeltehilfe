import {
  ActionIcon,
  Button,
  Group,
  PasswordInput,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { IconX } from "@tabler/icons-react";
import React from "react";
import { Login } from "../../../common/app";
import {
  LoginCertificatePost,
  useLoginCertificates,
} from "../../../common/app/loginCertificate";
import {
  ModalActions,
  ModalMain,
  NewPassword,
} from "../../../common/components";
import { downloadBase64, useIsTouchDevice } from "../../../common/utils";
import {
  RegexValdiatorRequirements,
  minLengthValidator,
  regexValidator,
  requiredValidator,
  validators,
} from "../../../common/utils/validators";

type LoginCertificateForm = LoginCertificatePost & {
  pfxPassword_: string;
};

const passwordRequirements: Array<RegexValdiatorRequirements> = [
  { matcher: /[0-9]/, error: "Mindestens eine Zahl" },
  { matcher: /[a-z]/, error: "Mindestens ein kleingeschriebenes Zeichen" },
  { matcher: /[A-Z]/, error: "Mindestens ein großgeschriebenes Zeichen" },
  {
    matcher: /[$&+,:;=?@#|'<>.^*()%!-]/,
    error: "Mindestens ein Sonderzeichen",
  },
];

type CreateLoginCertificateModalContentProps = {
  login?: Login;
};
export const CreateLoginCertificateModalContent = ({
  login,
}: CreateLoginCertificateModalContentProps) => {
  const {
    post: { mutate: post },
  } = useLoginCertificates();

  const isTouchDevice = useIsTouchDevice();

  const form = useForm<LoginCertificateForm>({
    mode: "controlled",
    initialValues: {
      loginUsername: login?.username || "",
      pfxPassword: "",
      pfxPassword_: "",
      description: "",
    },
    validate: {
      loginUsername: (value) =>
        validators(value, requiredValidator(), minLengthValidator(5)),
      pfxPassword: (value) =>
        validators(
          value,
          requiredValidator(),
          minLengthValidator(6),
          regexValidator(passwordRequirements)
        ),
      pfxPassword_: (value, values) =>
        value !== values.pfxPassword
          ? "Passwörter stimmen nicht überein"
          : undefined,
    },
  });

  React.useEffect(() => {
    form.setFieldValue("loginUsername", login?.username || "");
    form.resetDirty();
    form.resetTouched();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [login]);

  const closeModal = () => {
    modals.close("CreateLoginCertModal");
  };

  const onSubmit = (formModel: LoginCertificateForm) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { pfxPassword_, ...certificateToCreate } = formModel;
    post(certificateToCreate, {
      onSuccess: (response) => {
        downloadBase64(
          response.data.fileName,
          response.data.encodedCertChain,
          "application/x-pkcs12"
        ).then(closeModal);
      },
    });
  };

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <ModalMain>
        <TextInput
          {...form.getInputProps("description")}
          data-autofocus
          label="Beschreibung"
          key={form.key("description")}
          placeholder="Beschreibung"
          withAsterisk
          mb="md"
          rightSection={
            !isTouchDevice ? undefined : (
              <ActionIcon
                size="xs"
                disabled={!form.values.description}
                onClick={() => {
                  form.setFieldValue("description", "");
                }}
                variant="transparent"
              >
                <IconX />
              </ActionIcon>
            )
          }
        />
        <NewPassword
          {...form.getInputProps("pfxPassword")}
          onKeyDown={(e) => {
            if (e.key === " ") {
              e.preventDefault();
              e.bubbles = false;
            }
          }}
          requirements={passwordRequirements}
          label="Import Passwort"
          key={form.key("pfxPassword")}
          withAsterisk
          mb="md"
          placeholder="Import Passwort"
          minLength={6}
        />
        <PasswordInput
          {...form.getInputProps("pfxPassword_")}
          onKeyDown={(e) => {
            if (e.key === " ") {
              e.preventDefault();
              e.bubbles = false;
            }
          }}
          label="Passwort wiederholen"
          key={form.key("pfxPassword_")}
          withAsterisk
          mb="md"
          placeholder="Passwort wiederholen"
        />
      </ModalMain>
      <ModalActions>
        <Group justify="space-between" mt="xl">
          <Button color="red" variant="subtle" onClick={closeModal}>
            Abbrechen
          </Button>
          <Button
            disabled={!form.isTouched() || !form.isDirty()}
            onClick={() => form.onSubmit(onSubmit)()}
          >
            Abschicken
          </Button>
        </Group>
      </ModalActions>
    </form>
  );
};
