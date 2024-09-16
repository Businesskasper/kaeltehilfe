import { Button } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useLocations } from "../../../common/app";
import { FormSelect } from "../../../common/components";
import {
  requiredValidator,
  validators,
} from "../../../common/utils/validators";

type LocationForm = {
  locationName: string;
};

type Props = {
  toNext: () => void;
};
export const FormLocation = ({ toNext }: Props) => {
  const {
    objs: { data: locations },
  } = useLocations();

  const form = useForm<LocationForm>({
    mode: "controlled",
    initialValues: { locationName: "" },
    validate: {
      locationName: (value) => validators(value, requiredValidator()),
    },
  });

  const onSubmit = (formModel: LocationForm) => {
    console.log("submit", formModel);
    form.validateField("locationName");
    toNext();
  };
  //   form.validate();
  //   if (form.erro)

  return (
    <form style={{ display: "contents" }} onSubmit={form.onSubmit(onSubmit)}>
      <FormSelect
        formProps={form.getInputProps("locationName")}
        label="Ort"
        withAsterisk
        searchable
        items={locations || []}
        valueGetter="name"
        sort
        style={{ width: "calc(100% - 35px)" }}
      />
      <Button
        disabled={!form.isTouched() || !form.isDirty()}
        onClick={() => form.onSubmit(onSubmit)()}
        // fullWidth
        mt="xl"
      >
        Weiter
      </Button>
    </form>
  );
};
