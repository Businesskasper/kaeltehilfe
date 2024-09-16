import { useCrudHook } from "../utils";

export type Distribution = {
  id: number;
  timestamp: Date;
  device: {
    id: number;
    registrationNumber: string;
  };
  client: {
    id: number;
    name: string;
  };
  good: {
    id: number;
    name: string;
  };
  quantity: number;
};

export const useDistributions = () =>
  useCrudHook<Distribution, never>("distributions");
