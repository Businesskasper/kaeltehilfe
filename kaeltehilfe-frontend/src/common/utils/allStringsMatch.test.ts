import { describe, expect, test } from "vitest";
import { allStringsMatch } from "./allStringsMatch";

describe("allStringsMatch", () => {
  test("returns true for identical arrays", () => {
    expect(allStringsMatch(["a", "b"], ["a", "b"])).toBe(true);
  });

  test("returns true regardless of order", () => {
    expect(allStringsMatch(["b", "a"], ["a", "b"])).toBe(true);
  });

  test("returns false when arrays differ", () => {
    expect(allStringsMatch(["a"], ["a", "b"])).toBe(false);
  });

  test("returns true for empty arrays", () => {
    expect(allStringsMatch([], [])).toBe(true);
  });
});
