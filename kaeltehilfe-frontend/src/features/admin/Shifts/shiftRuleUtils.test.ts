import { describe, expect, test } from "vitest";
import { ShiftRule } from "../../../common/data/shiftRule";
import { Volunteer } from "../../../common/data/volunteer";
import { ShiftLike, countMatching, getFailingRules } from "./shiftRuleUtils";

const vol = (
  overrides: Partial<Volunteer> & { id: number },
): Volunteer => ({
  gender: "MALE",
  isDriver: false,
  ...overrides,
});

const rule = (overrides: Partial<ShiftRule> & { id: number }): ShiftRule => ({
  criterion: "ANY_VOLUNTEER",
  threshold: 1,
  isActive: true,
  busId: null,
  ...overrides,
});

const shift = (overrides: Partial<ShiftLike> & { busId: number }): ShiftLike => ({
  volunteers: [],
  ...overrides,
});

describe("countMatching", () => {
  test("ANY_VOLUNTEER counts all volunteers", () => {
    const vs = [vol({ id: 1 }), vol({ id: 2 }), vol({ id: 3 })];
    expect(countMatching("ANY_VOLUNTEER", vs)).toBe(3);
  });

  test("FEMALE_VOLUNTEER counts only female volunteers", () => {
    const vs = [
      vol({ id: 1, gender: "FEMALE" }),
      vol({ id: 2, gender: "MALE" }),
      vol({ id: 3, gender: "FEMALE" }),
    ];
    expect(countMatching("FEMALE_VOLUNTEER", vs)).toBe(2);
  });

  test("DRIVER counts only drivers", () => {
    const vs = [
      vol({ id: 1, isDriver: true }),
      vol({ id: 2, isDriver: false }),
      vol({ id: 3, isDriver: true }),
    ];
    expect(countMatching("DRIVER", vs)).toBe(2);
  });

  test("returns 0 for empty volunteer list", () => {
    expect(countMatching("ANY_VOLUNTEER", [])).toBe(0);
    expect(countMatching("FEMALE_VOLUNTEER", [])).toBe(0);
    expect(countMatching("DRIVER", [])).toBe(0);
  });

  test("returns 0 for undefined volunteer list", () => {
    expect(countMatching("ANY_VOLUNTEER", undefined)).toBe(0);
  });
});

describe("getFailingRules", () => {
  test("returns empty array when all rules pass", () => {
    const rules = [rule({ id: 1, criterion: "ANY_VOLUNTEER", threshold: 2 })];
    const s = shift({ busId: 1, volunteers: [vol({ id: 1 }), vol({ id: 2 })] });
    expect(getFailingRules(rules, s)).toEqual([]);
  });

  test("returns failing rule when count is below threshold", () => {
    const r = rule({ id: 1, criterion: "ANY_VOLUNTEER", threshold: 3 });
    const s = shift({ busId: 1, volunteers: [vol({ id: 1 })] });
    expect(getFailingRules([r], s)).toEqual([r]);
  });

  test("bus-specific rule overrides global rule for same criterion", () => {
    const global = rule({ id: 1, criterion: "ANY_VOLUNTEER", threshold: 2, busId: null });
    const busSpecific = rule({ id: 2, criterion: "ANY_VOLUNTEER", threshold: 1, busId: 1 });
    // Shift has 1 volunteer — passes bus-specific (threshold 1), would fail global (threshold 2)
    const s = shift({ busId: 1, volunteers: [vol({ id: 1 })] });
    const failing = getFailingRules([global, busSpecific], s);
    // Global rule must be excluded (overridden), bus-specific passes
    expect(failing).toEqual([]);
  });

  test("bus-specific rule for a different bus is ignored", () => {
    const otherBusRule = rule({ id: 1, criterion: "ANY_VOLUNTEER", threshold: 5, busId: 99 });
    const s = shift({ busId: 1, volunteers: [vol({ id: 1 })] });
    expect(getFailingRules([otherBusRule], s)).toEqual([]);
  });

  test("inactive rules are ignored", () => {
    const inactive = rule({ id: 1, threshold: 5, isActive: false });
    const s = shift({ busId: 1, volunteers: [] });
    expect(getFailingRules([inactive], s)).toEqual([]);
  });

  test("multiple rules can fail simultaneously", () => {
    const r1 = rule({ id: 1, criterion: "ANY_VOLUNTEER", threshold: 3 });
    const r2 = rule({ id: 2, criterion: "DRIVER", threshold: 1 });
    const s = shift({ busId: 1, volunteers: [vol({ id: 1, isDriver: false })] });
    const failing = getFailingRules([r1, r2], s);
    expect(failing).toHaveLength(2);
    expect(failing).toContain(r1);
    expect(failing).toContain(r2);
  });

  test("bus-specific rule that fails is returned", () => {
    const busSpecific = rule({ id: 1, criterion: "DRIVER", threshold: 2, busId: 1 });
    const s = shift({ busId: 1, volunteers: [vol({ id: 1, isDriver: true })] });
    expect(getFailingRules([busSpecific], s)).toEqual([busSpecific]);
  });
});
