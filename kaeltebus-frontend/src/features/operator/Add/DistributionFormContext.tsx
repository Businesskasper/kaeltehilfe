import { createFormContext } from "@mantine/form";
import { Gender } from "../../../common/data";

export type DistributionFormClient = {
  id?: number;
  name: string;
  gender: Gender;
  approxAge: number;
};

export type DistributionFormGood = {
  id: number;
  quantity: number;
};

export type DistributionForm = {
  locationName?: string;
  geoLocation?: { lat: number; lng: number };
  busRegistrationNumber: string;
  clients: Array<DistributionFormClient>;
  goods: Array<DistributionFormGood>;
};

export const [
  DistributionFormProvider,
  useDistributionFormContext,
  useDistributionForm,
] = createFormContext<DistributionForm>();
