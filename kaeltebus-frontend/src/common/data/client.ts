import { useCrudHook } from "../utils";
import { Gender } from "./gender";

export type Client = {
  id: number;
  name: string;
  gender?: Gender;
  approxAge?: number;
  remarks?: string;
};

export const useClients = () =>
  useCrudHook<Client, never, Omit<Client, "id">>({ key: "clients" });
