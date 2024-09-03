import { useCrudHook } from "../utils";
import { Gender } from "./gender";

export type Volunteer = {
  id: number;
  firstname?: string;
  lastname?: string;
  fullname?: string;
  gender?: Gender;
  isDriver?: boolean;
  remarks?: string;
};

export const useVolunteers = () =>
  useCrudHook<Volunteer, Omit<Volunteer, "id">>("volunteers");
