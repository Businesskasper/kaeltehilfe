import { toLocalDate } from "../utils";
import { useCrudHook } from "../utils/crudHook";
import { Volunteer } from "./volunteer";

export type Shift = {
  id: number;
  busId: number;
  registrationNumber: string;
  date?: Date;
  volunteers?: Array<Volunteer>;
};

export type ShiftPost = {
  date: string;
  busId: number;
  volunteers: Array<{ id: number }>;
};

export const useShifts = () =>
  useCrudHook<Shift, never, ShiftPost>({
    key: "shifts",
    transformer: {
      date: (date) => toLocalDate(date),
    },
  });
