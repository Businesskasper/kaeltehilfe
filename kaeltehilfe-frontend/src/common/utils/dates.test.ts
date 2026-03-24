import { describe, expect, test } from "vitest";
import { toDate, formatDate, toNormalizedDate, compareByDateOnly } from "./dates";

describe("toDate", () => {
  test("parses a valid date string", () => {
    const d = toDate("2026-03-24");
    expect(d).toBeInstanceOf(Date);
    expect(d!.getFullYear()).toBe(2026);
  });

  test("returns undefined for invalid string", () => {
    expect(toDate("not-a-date")).toBeUndefined();
  });

  test("returns undefined for null/undefined", () => {
    expect(toDate(null)).toBeUndefined();
    expect(toDate(undefined)).toBeUndefined();
  });

  test("returns undefined for boolean", () => {
    expect(toDate(true)).toBeUndefined();
  });
});

describe("formatDate", () => {
  test("formats a date in de-DE format", () => {
    const result = formatDate("2026-01-15T00:00:00Z");
    expect(result).toMatch(/15\.01\.2026/);
  });

  test("returns empty string for invalid input", () => {
    expect(formatDate(null)).toBe("");
    expect(formatDate("garbage")).toBe("");
  });
});

describe("toNormalizedDate", () => {
  test("strips time component", () => {
    const d = toNormalizedDate("2026-03-24T14:30:00");
    expect(d!.getHours()).toBe(0);
    expect(d!.getMinutes()).toBe(0);
  });

  test("returns undefined for invalid input", () => {
    expect(toNormalizedDate("nope")).toBeUndefined();
  });
});

describe("compareByDateOnly", () => {
  test("returns negative when first is earlier", () => {
    expect(compareByDateOnly("2026-01-01", "2026-12-31")).toBeLessThan(0);
  });

  test("returns 0 for same date different times", () => {
    expect(compareByDateOnly("2026-03-24T08:00:00", "2026-03-24T20:00:00")).toBe(0);
  });
});
