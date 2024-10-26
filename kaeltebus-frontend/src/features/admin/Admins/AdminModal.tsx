import { ActionIcon, Button, PasswordInput, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconX } from "@tabler/icons-react";
import React from "react";
import { AdminLogin, useLogins } from "../../../common/app";
import {
  AppModal,
  ModalActions,
  ModalMain,
  NewPassword,
} from "../../../common/components";
import {
  RegexValdiatorRequirements,
  isDuplicate,
  minLengthValidator,
  regexValidator,
  requiredValidator,
  validators,
} from "../../../common/utils/validators";

type LoginModalProps = {
  isOpen: boolean;
  close: () => void;
  existing?: AdminLogin;
};

type LoginForm = Omit<
  AdminLogin,
  "identityProviderId" | "username" | "createOn"
> & {
  password: string;
  password_: string;
  // Username is not posted, but should be presented to the user
  username: string;
};

const defaultAdminForm: LoginForm = {
  role: "ADMIN",
  username: "",
  email: "",
  firstname: "",
  lastname: "",
  password: "",
  password_: "",
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
export const AdminModal = ({ isOpen, close, existing }: LoginModalProps) => {
  const {
    objs: { data: logins },
    post: { mutate: post },
    put: { mutate: put },
  } = useLogins();

  const form = useForm<LoginForm>({
    mode: "controlled",
    initialValues: defaultAdminForm,
    validate: {
      username: (value) =>
        validators(
          value,
          requiredValidator(),
          minLengthValidator(5),
          isDuplicate(
            logins?.map((l) => l.username) || [],
            "Der Benutzername existiert bereits"
          )
        ),
      email: (value) =>
        validators(
          value,
          requiredValidator(),
          minLengthValidator(5),
          isDuplicate(
            logins?.map((l) => l.email) || [],
            "Die Email Adresse existiert bereits"
          )
        ),
      firstname: (value) =>
        validators(value, requiredValidator(), minLengthValidator(3)),
      lastname: (value) =>
        validators(value, requiredValidator(), minLengthValidator(3)),
      password: (value) =>
        validators(
          value,
          requiredValidator(),
          minLengthValidator(6),
          regexValidator(passwordRequirements)
        ),
      password_: (value, values) => {
        return value !== values.password
          ? "Passwörter stimmen nicht überein"
          : undefined;
      },
    },
  });

  React.useEffect(() => {
    form.setValues(existing || defaultAdminForm);
    form.resetDirty();
    form.resetTouched();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing]);

  // Automatically set username
  React.useEffect(() => {
    if (existing) return;
    form.setFieldValue(
      "username",
      `${form.values.firstname}.${form.values.lastname}`
    );
  }, [existing, form, form.values.firstname, form.values.lastname]);

  const closeModal = () => {
    form.reset();
    close();
  };

  console.log("errs", form.errors);
  const onSubmit = (formModel: LoginForm) => {
    if (existing) {
      put(
        { id: existing.username as unknown as number, update: formModel },
        { onSuccess: closeModal }
      );
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { username, password_, ...loginToCreate } = formModel;
      post(loginToCreate, { onSuccess: closeModal });
    }
  };

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <AppModal
        close={closeModal}
        isOpen={isOpen}
        title={existing ? "Bearbeiten" : "Hinzufügen"}
      >
        <ModalMain>
          {/* <TextInput
            {...form.getInputProps("username")}
            label="Benutzername"
            key={form.key("username")}
            disabled
            placeholder="Benutzername (wird automatisch generiert)"
            withAsterisk
            mb="md"
          /> */}
          <TextInput
            {...form.getInputProps("email")}
            data-autofocus
            label="Email"
            key={form.key("email")}
            placeholder="Email"
            withAsterisk
            type="email"
            mb="md"
            rightSection={
              <ActionIcon
                size="xs"
                disabled={!form.values.email}
                onClick={() => {
                  form.setFieldValue("email", "");
                }}
                variant="transparent"
              >
                <IconX />
              </ActionIcon>
            }
          />
          <TextInput
            {...form.getInputProps("firstname")}
            data-autofocus
            label="Vorname"
            key={form.key("firstname")}
            placeholder="Vorname"
            withAsterisk
            mb="md"
            rightSection={
              <ActionIcon
                size="xs"
                disabled={!form.values.firstname}
                onClick={() => {
                  form.setFieldValue("firstname", "");
                }}
                variant="transparent"
              >
                <IconX />
              </ActionIcon>
            }
          />
          <TextInput
            {...form.getInputProps("lastname")}
            label="Nachname"
            key={form.key("lastname")}
            placeholder="Vorname"
            withAsterisk
            mb="md"
            rightSection={
              <ActionIcon
                size="xs"
                disabled={!form.values.lastname}
                onClick={() => {
                  form.setFieldValue("lastname", "");
                }}
                variant="transparent"
              >
                <IconX />
              </ActionIcon>
            }
          />
          <NewPassword
            {...form.getInputProps("password")}
            requirements={passwordRequirements}
            label="Passwort"
            key={form.key("password")}
            withAsterisk
            mb="md"
            placeholder="Passwort"
            minLength={6}
            rightSection={
              <ActionIcon
                size="xs"
                disabled={!form.values.password}
                onClick={() => {
                  form.setFieldValue("password", "");
                }}
                variant="transparent"
              >
                <IconX />
              </ActionIcon>
            }
          />
          {/* <PasswordInput
            {...form.getInputProps("password")}
            label="Passwort"
            key={form.key("password")}
            withAsterisk
            mb="md"
            placeholder="Passwort (min. 8 Zeichen)"
            rightSection={
              <ActionIcon
                size="xs"
                disabled={!form.values.password}
                onClick={() => {
                  form.setFieldValue("password", "");
                }}
                variant="transparent"
              >
                <IconX />
              </ActionIcon>
            }
          /> */}
          <PasswordInput
            {...form.getInputProps("password_")}
            label="Passwort wiederholen"
            key={form.key("password_")}
            withAsterisk
            mb="md"
            placeholder="Passwort wiederholen"
            rightSection={
              <ActionIcon
                size="xs"
                disabled={!form.values.password_}
                onClick={() => {
                  form.setFieldValue("password_", "");
                }}
                variant="transparent"
              >
                <IconX />
              </ActionIcon>
            }
          />
        </ModalMain>
        <ModalActions>
          <Button
            disabled={!form.isTouched() || !form.isDirty()}
            onClick={() => form.onSubmit(onSubmit)()}
            fullWidth
            mt="xl"
          >
            Abschicken
          </Button>
        </ModalActions>
      </AppModal>
    </form>
  );
};
