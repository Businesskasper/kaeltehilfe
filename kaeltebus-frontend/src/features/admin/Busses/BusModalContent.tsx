import { ActionIcon, Button, TextInput } from "@mantine/core";
import { matches, useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { IconX } from "@tabler/icons-react";
import React from "react";
import { Bus, useBusses } from "../../../common/app";
import { ModalActions, ModalMain } from "../../../common/components";
import { useIsTouchDevice } from "../../../common/utils";
import {
  minLengthValidator,
  requiredValidator,
  validators,
} from "../../../common/utils/validators";

type BusForm = Omit<Bus, "id">;

type BusModalContentProps = {
  existing?: Bus;
};
export const BusModalContent = ({ existing }: BusModalContentProps) => {
  const {
    post: { mutate: post },
    put: { mutate: put },
  } = useBusses();

  const isTouchDevice = useIsTouchDevice();

  const initialValues: BusForm = {
    registrationNumber: "",
  };

  const form = useForm<BusForm>({
    mode: "controlled",
    initialValues,
    validate: {
      registrationNumber: (value) =>
        validators(
          value,
          requiredValidator(),
          minLengthValidator(5),
          (value) =>
            matches(
              /^[A-ZÄÖÜ]{1,3}-[A-Z]{1,2}\d{1,4}$/,
              "Kein valides Kennzeichen"
            )(value)?.toString() || null
        ),
    },
  });

  React.useEffect(() => {
    form.setValues(existing || initialValues);
    form.resetDirty();
    form.resetTouched();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing]);

  const closeModal = () => {
    modals.close("BusModal");
    setTimeout(() => form.reset(), 200);
  };

  const onSubmit = (formModel: BusForm) => {
    if (existing) {
      put(
        {
          id: existing.id,
          update: formModel,
        },
        { onSuccess: closeModal }
      );
    } else {
      post(formModel, { onSuccess: closeModal });
    }
  };

  // React.useEffect(() => {
  //   form.setFieldValue(
  //     "registrationNumber",
  //     form.values.registrationNumber?.toUpperCase() || ""
  //   );
  // }, [form, form.values.registrationNumber]);

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <ModalMain>
        <TextInput
          {...form.getInputProps("registrationNumber")}
          onChange={undefined}
          onKeyDown={(e) => {
            if (e.key === " ") {
              e.preventDefault();
              e.bubbles = false;
            }
          }}
          onInput={(event) => {
            event.preventDefault();
            event.bubbles = false;
            const uppercased = event.currentTarget.value.toUpperCase();
            form.setFieldValue("registrationNumber", uppercased);
          }}
          data-autofocus
          label="Nummernschild"
          key={form.key("registrationNumer")}
          disabled={!!existing}
          placeholder='Nummernschild (Format "UL-RK12345")'
          withAsterisk
          mb="md"
          rightSection={
            !isTouchDevice ? undefined : (
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
            )
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
    </form>
  );
};
