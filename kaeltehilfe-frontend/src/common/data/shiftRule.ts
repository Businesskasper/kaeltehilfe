import { useCrudHook } from "../utils";

export type VolunteerCriterion =
  | "ANY_VOLUNTEER"
  | "FEMALE_VOLUNTEER"
  | "DRIVER";

export type ShiftRule = {
  id: number;
  criterion: VolunteerCriterion;
  threshold: number;
  isActive: boolean;
  busId?: number | null;
  busRegistrationNumber?: string | null;
};

export const VolunteerCriterionLabel: Record<VolunteerCriterion, string> = {
  ANY_VOLUNTEER: "Alle Freiwilligen",
  FEMALE_VOLUNTEER: "Weibliche Freiwillige",
  DRIVER: "Fahrer",
};

export const GLOBAL_CRITERION_ORDER: VolunteerCriterion[] = [
  "ANY_VOLUNTEER",
  "FEMALE_VOLUNTEER",
  "DRIVER",
];

export const useShiftRules = () =>
  useCrudHook<ShiftRule, never, Omit<ShiftRule, "id">>({ key: "shift-rules" });
