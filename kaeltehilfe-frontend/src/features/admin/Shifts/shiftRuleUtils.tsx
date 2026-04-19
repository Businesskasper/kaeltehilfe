import {
  IconSteeringWheelFilled,
  IconUsersGroup,
  IconWomanFilled,
} from "@tabler/icons-react";
import React from "react";
import { ShiftRule, VolunteerCriterion } from "../../../common/data/shiftRule";
import { Volunteer } from "../../../common/data/volunteer";

export const CRITERION_ICONS: Record<VolunteerCriterion, React.ReactNode> = {
  ANY_VOLUNTEER: <IconUsersGroup fill="red" style={{ color: "red" }} />,
  FEMALE_VOLUNTEER: <IconWomanFilled fill="red" />,
  DRIVER: <IconSteeringWheelFilled fill="red" />,
};

export type ShiftLike = {
  busId: number;
  volunteers?: Array<Volunteer>;
};

export const countMatching = (
  criterion: VolunteerCriterion,
  volunteers: Array<Volunteer> | undefined,
): number => {
  const vs = volunteers ?? [];
  switch (criterion) {
    case "ANY_VOLUNTEER":
      return vs.length;
    case "FEMALE_VOLUNTEER":
      return vs.filter((v) => v.gender === "FEMALE").length;
    case "DRIVER":
      return vs.filter((v) => v.isDriver).length;
  }
};

export const getFailingRules = (
  rules: ShiftRule[],
  shift: ShiftLike,
): ShiftRule[] => {
  // Criteria that have a bus-specific rule for this shift's carrier
  const overriddenCriteria = new Set(
    rules
      .filter((r) => r.isActive && r.busId === shift.busId)
      .map((r) => r.criterion),
  );

  return rules.filter(
    (r) =>
      r.isActive &&
      // If a bus-specific rule exists for this criterion, skip the global rule
      (r.busId != null
        ? r.busId === shift.busId
        : !overriddenCriteria.has(r.criterion)) &&
      countMatching(r.criterion, shift.volunteers) < r.threshold,
  );
};
