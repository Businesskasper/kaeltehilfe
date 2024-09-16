import { createFormContext } from "@mantine/form";

export type DistributionFormClient = {
  id?: number;
  name: string;
};

export type DistributionForm = {
  clients: Array<DistributionFormClient>;
  quantity: number;
  locationName: string;
};

export const [
  DistributionFormProvider,
  useDistributionFormContext,
  useDistributionForm,
] = createFormContext<DistributionForm>();
