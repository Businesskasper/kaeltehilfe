import { createFormContext } from "@mantine/form";
import { Gender, GeoLocation } from "../../../common/data";

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
  locationName: string;
  geoLocation: GeoLocation;
  busRegistrationNumber: string;
  clients: Array<DistributionFormClient>;
  goods: Array<DistributionFormGood>;
};

export const [
  DistributionFormProvider,
  useDistributionFormContext,
  useDistributionForm,
] = createFormContext<DistributionForm>();
