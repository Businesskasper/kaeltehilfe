import {
  ActionIcon,
  Button,
  Checkbox,
  Select,
  TextInput,
  Textarea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { IconX } from "@tabler/icons-react";
import React from "react";
import { Gender, GenderTranslation } from "../../../common/app/gender";
import { Volunteer, useVolunteers } from "../../../common/app/volunteer";
import { ModalActions, ModalMain } from "../../../common/components";

type VolunteerModalContentProps = {
  existing?: Volunteer;
};

type VolunteerForm = Omit<Volunteer, "id">;

const volunteerGenderOptions = Object.keys(GenderTranslation).map((key) => ({
  label: GenderTranslation[key as Gender]?.label,
  value: key,
}));

export const VolunteerModalContent = ({
  existing,
}: VolunteerModalContentProps) => {
  const {
    post: { mutate: post },
    put: { mutate: put },
  } = useVolunteers();

  const initialValues: VolunteerForm = {
    firstname: "",
    lastname: "",
    gender: "" as Gender,
    isDriver: false,
    remarks: "",
  };

  const form = useForm<VolunteerForm>({
    mode: "controlled",
    initialValues,
    validate: {
      firstname: (value) => {
        if (value === null || value === undefined || value.trim() === "")
          return "Erforderlich";
        if (value.trim().length < 3) {
          return "Mindestens 3 Zeichen";
        }
      },
      lastname: (value) => {
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
    modals.close("VolunteersModal");
  };

  const onSubmit = (formModel: VolunteerForm) => {
    if (existing) {
      put({ id: existing.id, update: formModel }, { onSuccess: closeModal });
    } else {
      post(formModel, { onSuccess: closeModal });
    }
  };

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <ModalMain>
        <TextInput
          {...form.getInputProps("firstname")}
          data-autofocus
          label="Vorname"
          key={form.key("firstname")}
          placeholder="Vorname (min. 3 Zeichen)"
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
          data-autofocus
          label="Nachname"
          key={form.key("lastname")}
          placeholder="Nachname (min. 3 Zeichen)"
          withAsterisk
          mt="md"
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
        {/* <Group mt="md" mb="md" align="center">
            <Checkbox
              {...form.getInputProps("isDriver", { type: "checkbox" })}
              label="Fahrer"
            />
            <div>
              <SegmentedControl
                {...form.getInputProps(`gender`)}
                data={GenderOptions}
              />
            </div>
          </Group> */}
        <Select
          {...form.getInputProps("gender")}
          data={volunteerGenderOptions}
          label="Geschlecht"
          placeholder="Geschlecht"
          mt="md"
          mb="md"
        />
        <Checkbox
          {...form.getInputProps("isDriver", { type: "checkbox" })}
          label="Fahrer"
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
    </form>
  );
};
