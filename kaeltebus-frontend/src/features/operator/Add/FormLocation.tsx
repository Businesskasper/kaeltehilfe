import { Title } from "@mantine/core";
import { useLocations } from "../../../common/app";
import { FormSelect } from "../../../common/components";
import { useBreakpoint } from "../../../common/utils";
import { useDistributionFormContext } from "./DistributionFormContext";

export const FormLocation = () => {
  const {
    objs: { data: locations },
  } = useLocations();

  const form = useDistributionFormContext();

  const breakpoint = useBreakpoint();
  const isDesktop =
    breakpoint === "SM" ||
    breakpoint === "MD" ||
    breakpoint === "LG" ||
    breakpoint === "XL";

  return (
    <>
      {isDesktop && (
        <Title mt={isDesktop ? "sm" : undefined} mb="md" order={3}>
          Ausgabe
        </Title>
      )}
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
