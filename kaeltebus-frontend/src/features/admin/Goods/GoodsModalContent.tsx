import {
  ActionIcon,
  Button,
  NumberInput,
  Select,
  TagsInput,
  TextInput,
  Textarea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { IconX } from "@tabler/icons-react";
import React from "react";
import {
  Good,
  GoodType,
  GoodTypeTranslation,
  useGoods,
} from "../../../common/app/good";
import { ModalActions, ModalMain } from "../../../common/components";
import {
  minLengthValidator,
  requiredValidator,
  validators,
} from "../../../common/utils/validators";

type GoodForm = Omit<Good, "id">;

const goodTypeOptions = Object.keys(GoodTypeTranslation).map((key) => ({
  label: GoodTypeTranslation[key as GoodType]?.label,
  value: key,
}));

type GoodModalContentProps = {
  existing?: Good;
};
export const GoodModalContent = ({ existing }: GoodModalContentProps) => {
  const {
    post: { mutate: post },
    put: { mutate: put },
  } = useGoods();

  const initialValues: GoodForm = {
    name: "",
    description: "",
    goodType: "" as GoodType,
    tags: [],
  };

  const form = useForm<GoodForm>({
    mode: "controlled",
    initialValues,
    validate: {
      name: (value) =>
        validators(value, requiredValidator(), minLengthValidator(3)),
      goodType: (value) => validators(value, requiredValidator()),
    },
  });

  React.useEffect(() => {
    form.setValues(existing || initialValues);
    form.resetDirty();
    form.resetTouched();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing]);

  const closeModal = () => {
    modals.close("GoodsModal");
  };

  const onSubmit = (formModel: GoodForm) => {
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
        <Textarea
          {...form.getInputProps("description")}
          label="Beschreibung"
          placeholder="Beschreibung"
          mt="md"
          mb="md"
        />
        <Select
          {...form.getInputProps("goodType")}
          data={goodTypeOptions}
          withAsterisk
          label="Typ"
          placeholder="Typ"
          mt="md"
          mb="md"
        />
        <NumberInput
          {...form.getInputProps("twoWeekThreshold")}
          label="Zwei-Wochen-Warnung"
          placeholder="Zwei-Wochen-Warnung"
          mt="md"
          mb="md"
        />
        <TagsInput
          {...form.getInputProps("tags")}
          label="Tags"
          placeholder="Tags"
          mt="md"
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
