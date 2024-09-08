import { ActionIcon, Button, Group, InputLabel } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import React from "react";
import {
  Shift,
  ShiftPost,
  useShifts,
  useVolunteers,
} from "../../../common/app";
import {
  AppModal,
  FormSelect,
  ModalActions,
  ModalMain,
} from "../../../common/components";
import {
  isDuplicate,
  requiredValidator,
  validators,
} from "../../../common/utils/validators";

type ShiftModalProps = {
  isOpen: boolean;
  close: () => void;
  existing?: Shift;
};

type ShiftForm = {
  date: Date;
  volunteers: Array<{ id: number; fullname: string }>;
};

export const ShiftModal = ({ isOpen, close, existing }: ShiftModalProps) => {
  const {
    objs: { data: shifts },
    post: { mutate: post },
    put: { mutate: put },
  } = useShifts();

  const {
    objs: { data: volunteers },
  } = useVolunteers();

  const initialValues: ShiftForm = {
    date: undefined as unknown as Date,
    volunteers: [
      { id: undefined as unknown as number, fullname: "" },
      { id: undefined as unknown as number, fullname: "" },
      { id: undefined as unknown as number, fullname: "" },
    ],
  };

  const form = useForm<ShiftForm>({
    mode: "controlled",
    initialValues,
    validate: {
      date: (value) =>
        validators(
          value,
          requiredValidator("Date"),
          isDuplicate(
            shifts
              ?.filter((s) => s.date !== existing?.date)
              ?.map(({ date }) => date) || [],
            "Eine Schicht zum angegebenem Datum existiert bereits"
          )
        ),
      volunteers: {
        id: requiredValidator("Id", "Bitte auswählen"),
        fullname: (value, values, path) => {
          if (!value) return "Bitte auswählen";

          const index = Number.parseInt(path.match(/\d+/)?.[0] || "");
          if (isNaN(index)) return;

          const currentVolunteer = values.volunteers[index];
          if (
            !currentVolunteer ||
            !currentVolunteer.fullname ||
            (currentVolunteer.id &&
              volunteers?.find((v) => v.id)?.fullname ===
                currentVolunteer.fullname)
          ) {
            return;
          }

          // if ()
          const volunteerObjs = volunteers?.filter(
            (v) => v.id === currentVolunteer.id
          );
          if (!volunteerObjs || volunteerObjs.length === 0) {
            return "Frewilliger wurde nicht gefunden";
          }
          if (volunteerObjs.length > 1) {
            return "Mehrere Freiwillige unter selbem Namen gefnden - bitte auswählen";
          }
        },
      },
    },
  });

  React.useEffect(() => {
    if (existing) {
      form.setValues({
        date: existing.date,
        volunteers:
          existing.volunteers?.map(({ id, fullname }) => ({
            id,
            fullname: fullname || "",
          })) || [],
      });
    } else {
      form.setValues(initialValues);
    }
    form.resetDirty();
    form.resetTouched();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing]);

  const closeModal = () => {
    form.reset();
    close();
  };

  const onSubmit = (formModel: ShiftForm) => {
    const submitModel: ShiftPost = {
      date: formModel.date.toLocaleString("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
      volunteers: formModel.volunteers.map(({ id }) => ({ id })),
    };
    if (existing) {
      put({ id: existing.id, update: submitModel }, { onSuccess: closeModal });
    } else {
      post(submitModel, { onSuccess: closeModal });
    }
  };

  const volunteerFields = form.getValues().volunteers?.map((_, index) => (
    <Group
      mt={index > 0 ? "md" : undefined}
      mb="md"
      key={index}
      align="baseline"
      pos="relative"
    >
      <FormSelect
        searchable
        items={volunteers || []}
        valueGetter="fullname"
        sort
        style={{ width: "calc(100% - 35px)" }}
        formProps={form.getInputProps(`volunteers.${index}.fullname`)}
        onItemSelected={(selectedVolunteer) => {
          form.setFieldValue(`volunteers.${index}.id`, selectedVolunteer?.id);
        }}
        onBlur={() => {
          // In case on option was selected (but typed), we must manually set the volunteers id
          const currentVolunteer = form.getValues()?.volunteers[index];
          if (
            !currentVolunteer ||
            !currentVolunteer.fullname ||
            (currentVolunteer.id &&
              volunteers?.find((v) => v.id)?.fullname ===
                currentVolunteer.fullname)
          ) {
            return;
          }
          const volunteerObj = volunteers?.filter(
            (v) => v.fullname === currentVolunteer.fullname
          );
          if (!volunteerObj || volunteerObj.length === 0) {
            // form.setFieldError(
            //   `volunteers.${index}.fullname`,
            //   "Nicht gefunden"
            // );
            return;
          }
          if (volunteerObj.length > 1) {
            // form.setFieldError(
            //   `volunteers.${index}.fullname`,
            //   "Bitte auswählen"
            // );
            return;
          }
          form.setFieldValue(`volunteers.${index}.id`, volunteerObj[0].id);
        }}
      />
      {/* <Autocomplete
          {...form.getInputProps(`volunteers.${index}.id`)}
          key={form.key(`volunteers.${index}.id`)}
          placeholder={`Freiwilliger ${index + 1}`}
          style={{ width: "calc(100% - 35px)" }}
          withAsterisk
          data={(volunteers || []).map((v) => ({
            value: v.id.toString() || "",
            label: v.fullname || "",
          }))}
          renderOption={(x) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (x.option as any).label;
          }}
        /> */}
      {/* <Select
          {...form.getInputProps(`volunteers.${index}.name`)}
          key={form.key(`volunteers.${index}.name`)}
          placeholder={`Freiwilliger ${index + 1}`}
          style={{ width: "calc(100% - 35px)" }}
          withAsterisk
        /> */}
      <ActionIcon
        // h="35px"
        pos="absolute"
        top="3px"
        right="0px"
        color="red"
        onClick={() => form.removeListItem("volunteers", index)}
      >
        <IconTrash size="1rem" />
      </ActionIcon>
    </Group>
  ));

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <AppModal
        close={closeModal}
        isOpen={isOpen}
        title={existing ? "Bearbeiten" : "Hinzufügen"}
      >
        <ModalMain>
          <DateInput
            {...form.getInputProps("date")}
            data-autofocus={existing ? undefined : true}
            label="Datum"
            key={form.key("date")}
            placeholder="Datum"
            withAsterisk
            mb="md"
            locale="de"
            valueFormat="DD.MM.YYYY"
            preserveTime={false}
            clearable
          />
          <InputLabel required w="100%">
            Freiwillige
          </InputLabel>
          {volunteerFields}
          <ActionIcon
            mt={form.getValues().volunteers?.length > 0 ? undefined : "md"}
            onClick={() =>
              form.insertListItem("volunteers", { id: "", name: "" })
            }
          >
            <IconPlus />
          </ActionIcon>
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
