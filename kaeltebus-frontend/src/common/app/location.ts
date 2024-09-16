import { useCrudHook } from "../utils";

export type Location = {
  id: number;
  name: string;
};

export const useLocations = () =>
  useCrudHook<Location, Omit<Location, "id">>("locations");
