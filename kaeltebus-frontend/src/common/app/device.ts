import { useCrudHook } from "../utils";

export type Device = {
  id: number;
  registrationNumber: string;
};

export const useDevices = () =>
  useCrudHook<Device, Omit<Device, "id">>("devices");
