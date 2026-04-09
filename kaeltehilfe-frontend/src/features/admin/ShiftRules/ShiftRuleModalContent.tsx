import { Button, NumberInput, Select } from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import React from "react";
import { ModalActions, ModalMain } from "../../../common/components";
import { useBusses } from "../../../common/data/bus";
import {
  GLOBAL_CRITERION_ORDER,
  ShiftRule,
  VolunteerCriterionLabel,
  useShiftRules,
} from "../../../common/data/shiftRule";

type ShiftRuleModalContentProps = {
  existing?: ShiftRule;
};

type BusRuleForm = {
  busId: string;
  criterion: string;
  threshold: number;
};

export const ShiftRuleModalContent = ({
  existing,
}: ShiftRuleModalContentProps) => {
  const {
    post: { mutate: post },
    put: { mutate: put },
  } = useShiftRules();

  const { objs: { data: busses } } = useBusses();

  const busOptions = (busses ?? []).map((b) => ({
    label: b.registrationNumber,
    value: String(b.id),
  }));

  const criterionOptions = GLOBAL_CRITERION_ORDER.map((c) => ({
    label: VolunteerCriterionLabel[c],
    value: c,
  }));

  const initialValues: BusRuleForm = {
    busId: "",
    criterion: "",
    threshold: 1,
  };

  const form = useForm<BusRuleForm>({
    mode: "controlled",
    initialValues,
    validate: {
      busId: (value) =>
        !value || value.trim() === "" ? "Erforderlich" : null,
      criterion: (value) =>
        !value || value.trim() === "" ? "Erforderlich" : null,
      threshold: (value) =>
        value === null || value === undefined || value < 1
          ? "Mindestens 1"
          : null,
    },
  });

  React.useEffect(() => {
    if (existing) {
      form.setValues({
        busId: existing.busId != null ? String(existing.busId) : "",
        criterion: existing.criterion,
        threshold: existing.threshold,
      });
    } else {
      form.setValues(initialValues);
    }
    form.resetDirty();
    form.resetTouched();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing]);

  const closeModal = () => modals.close("ShiftRuleModal");

  const onSubmit = (formModel: BusRuleForm) => {
    const payload: Omit<ShiftRule, "id"> = {
      criterion: formModel.criterion as ShiftRule["criterion"],
      threshold: formModel.threshold,
      isActive: true,
      busId: formModel.busId ? Number(formModel.busId) : null,
    };

    if (existing) {
      put({ id: existing.id, update: payload }, { onSuccess: closeModal });
    } else {
      post(payload, { onSuccess: closeModal });
    }
  };

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <ModalMain>
        <Select
          {...form.getInputProps("busId")}
          data={busOptions}
          label="Schichtträger"
          placeholder="Kennzeichen wählen"
          withAsterisk
          mb="md"
          searchable
        />
        <Select
          {...form.getInputProps("criterion")}
          data={criterionOptions}
          label="Kriterium"
          placeholder="Kriterium wählen"
          withAsterisk
          mb="md"
        />
        <NumberInput
          {...form.getInputProps("threshold")}
          label="Mindestanzahl"
          min={1}
          withAsterisk
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
