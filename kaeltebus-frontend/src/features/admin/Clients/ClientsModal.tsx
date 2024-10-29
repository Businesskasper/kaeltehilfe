import {
  ActionIcon,
  Button,
  NumberInput,
  Select,
  TextInput,
  Textarea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconX } from "@tabler/icons-react";
import React from "react";
import { Client, useClients } from "../../../common/app/client";
import { Gender, GenderTranslation } from "../../../common/app/gender";
import { AppModal, ModalActions, ModalMain } from "../../../common/components";

type ClientsModalProps = {
  isOpen: boolean;
  close: () => void;
  existing?: Client;
};

type ClientsForm = Omit<Client, "id">;

const clientGenderOptions = Object.keys(GenderTranslation).map((key) => ({
  label: GenderTranslation[key as Gender]?.label,
  value: key,
}));

export const ClientModal = ({ isOpen, close, existing }: ClientsModalProps) => {
  const {
    post: { mutate: post },
    put: { mutate: put },
    invalidate,
  } = useClients();

  const initialValues: ClientsForm = {
    name: "",
    gender: "" as Gender,
    remarks: "",
  };

  const form = useForm<ClientsForm>({
    mode: "controlled",
    initialValues,
    validate: {
      name: (value) => {
        if (value === null || value === undefined || value.trim() === "")
          return "Erforderlich";
        if (value.trim().length < 3) {
          return "Mindestens 3 Zeichen";
        }
      },
    },
  });

  React.useEffect(() => {
    form.setValues(existing || initialValues);
    form.resetDirty();
    form.resetTouched();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing]);

  const closeModal = () => {
    close();
    setTimeout(() => form.reset(), 200);
  };

  const onSubmit = (formModel: ClientsForm) => {
    if (existing) {
      put(
        { id: existing.id, update: formModel },
        {
          onSuccess: closeModal,
          onSettled: () => {
            console.log("DEBUG: invalidate from hook");
            invalidate();
          },
        }
      );
    } else {
      post(formModel, {
        onSuccess: closeModal,
        onSettled: () => {
          console.log("DEBUG: invalidate from hook");
          invalidate();
        },
      });
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
          <TextInput
            {...form.getInputProps("name")}
            data-autofocus
            label="Name"
            key={form.key("name")}
            placeholder="Name (min. 3 Zeichen)"
            withAsterisk
            mb="md"
            rightSection={
              <ActionIcon
                size="xs"
                disabled={!form.values.name}
                onClick={() => {
                  form.setFieldValue("name", "");
                }}
                variant="transparent"
              >
                <IconX />
              </ActionIcon>
            }
          />
          <Select
            {...form.getInputProps("gender")}
            data={clientGenderOptions}
            label="Geschlecht"
            placeholder="Geschlecht"
            mt="md"
            mb="md"
          />
          <NumberInput
            {...form.getInputProps("approxAge")}
            label="Geschätztes Alter"
            key={form.key("approxAge")}
            placeholder="Gschätztes Alter"
            mt="md"
            mb="md"
          />
          <Textarea
            {...form.getInputProps("remarks")}
            label="Notizen"
            placeholder="Notizen"
            mb="md"
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
