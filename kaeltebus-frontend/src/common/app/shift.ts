import { toLocalDate } from "../utils";
import { useCrudHook } from "../utils/crudHook";
import { Volunteer } from "./volunteer";

export type Shift = {
  id: number;
  date?: Date;
  volunteers?: Array<Volunteer>;
};

export type ShiftPost = {
  date: string;
  volunteers: Array<{ id: number }>;
  // volunteers: Array<{ id: number; name: string }>;
};

export const useShifts = () =>
  useCrudHook<Shift, ShiftPost>("shifts", {
    date: (date) => toLocalDate(date),
  });
