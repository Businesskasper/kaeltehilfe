import { useCrudHook } from "../utils";

export type Location = {
  id: number;
  name: string;
};

export const useLocations = () =>
  useCrudHook<Location, never, Omit<Location, "id">>({ key: "locations" });
