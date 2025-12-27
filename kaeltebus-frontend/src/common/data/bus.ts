import { useCrudHook } from "../utils";

export type Bus = {
  id: number;
  registrationNumber: string;
};

export const useBusses = () =>
  useCrudHook<Bus, never, Omit<Bus, "id">>({ key: "busses" });
