import { ActionIcon, Button, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconX } from "@tabler/icons-react";
import React from "react";
import { Device, useDevices } from "../../../common/app";
import { AppModal, ModalActions, ModalMain } from "../../../common/components";
import {
  minLengthValidator,
  requiredValidator,
  validators,
} from "../../../common/utils/validators";

type DeviceModalProps = {
  isOpen: boolean;
  close: () => void;
  existing?: Device;
};

type DeviceForm = Omit<Device, "id">;

export const DeviceModal = ({ isOpen, close, existing }: DeviceModalProps) => {
  const {
    post: { mutate: post },
    put: { mutate: put },
  } = useDevices();

  const initialValues: DeviceForm = {
    registrationNumber: "",
  };

  const form = useForm<DeviceForm>({
    mode: "controlled",
    initialValues,
    validate: {
      registrationNumber: (value) =>
        validators(value, requiredValidator(), minLengthValidator(3)),
    },
  });

  React.useEffect(() => {
    form.setValues(existing || initialValues);
    form.resetDirty();
    form.resetTouched();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing]);

  const closeModal = () => {
    form.reset();
    close();
  };

  const onSubmit = (formModel: DeviceForm) => {
    if (existing) {
      put({ id: existing.id, update: formModel }, { onSuccess: closeModal });
    } else {
      post(formModel, { onSuccess: closeModal });
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
            {...form.getInputProps("registrationNumber")}
            data-autofocus
            label="Nummernschild"
            key={form.key("registrationNumer")}
            disabled={!!existing}
            placeholder="Nummernschild (min. 3 Zeichen, keine Leerzeichen)"
            withAsterisk
            mb="md"
            rightSection={
              <ActionIcon
                size="xs"
                disabled={!form.values.registrationNumber}
                onClick={() => {
                  form.setFieldValue("registrationNumber", "");
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
