import { Button, Select, TagsInput, TextInput, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  Good,
  GoodType,
  GoodTypeTranslation,
  useGoods,
} from "../../../common/app/good";
import { AppModal, ModalActions, ModalMain } from "../../../common/components";

type GoodModalProps = {
  isOpen: boolean;
  close: () => void;
  existingGood?: Good;
};

type GoodForm = Omit<Good, "id">;

const goodTypeOptions = Object.keys(GoodTypeTranslation).map((key) => ({
  label: GoodTypeTranslation[key as GoodType]?.label,
  value: key,
}));

export const GoodModal = ({ isOpen, close, existingGood }: GoodModalProps) => {
  const {
    addGood: { mutate, status },
  } = useGoods();
  console.log("status", status);

  const form = useForm<GoodForm>({
    mode: "controlled",
    initialValues: {
      name: "",
      description: "",
      goodType: "" as GoodType,
      tags: [],
    },
    validate: {
      name: (value) => {
        if (value === null || value === undefined || value.trim() === "")
          return "Erforderlich";
        if (value.trim().length < 3) {
          return "Mindestens 3 Zeichen";
        }
      },
      goodType: (value) => {
        if (value === null || value === undefined || value.trim() === "")
          return "Erforderlich";
      },
    },
  });

  const closeModal = () => {
    form.reset();
    close();
  };

  const onSubmit = (formModel: GoodForm) => {
    console.log("onSubmit", formModel);
    console.log("formModel", formModel);
    mutate(formModel, { onSuccess: closeModal });
  };

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <AppModal
        close={closeModal}
        isOpen={isOpen}
        title={existingGood ? "Bearbeiten" : "Hinzufügen"}
      >
        <ModalMain>
          <TextInput
            {...form.getInputProps("name")}
            data-autofocus
            label="Name"
            key={form.key("name")}
            // placeholder="Name"
            placeholder="Name (min. 3 Zeichen)"
            withAsterisk
            // required
            // minLength={3}
            // mt="md"
            mb="md"
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
            // required
            withAsterisk
            label="Typ"
            placeholder="Typ"
            // value={value ? value.value : null}
            // onChange={(_value, option) => setValue(option)}
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
            // disabled={!form.isValid() || !form.isTouched() || !form.isDirty()}
            disabled={!form.isTouched() || !form.isDirty()}
            // type="submit"
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
