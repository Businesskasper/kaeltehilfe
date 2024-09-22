import { useLocations } from "../../../common/app";
import { FormSelect } from "../../../common/components";
import { useDistributionFormContext } from "./DistributionFormContext";

export const FormLocation = () => {
  const {
    objs: { data: locations },
  } = useLocations();

  const form = useDistributionFormContext();

  return (
    <>
      <FormSelect
        label="Ort"
        withAsterisk
        searchable
        items={locations || []}
        valueGetter="name"
        sort
        formProps={form.getInputProps("locationName")}
      />
    </>
  );
};
