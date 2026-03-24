import { describe, expect, test } from "vitest";
import { arraysEqual } from "./arraysEqual";

describe("arraysEqual", () => {
  test("returns true for equal arrays", () => {
    expect(arraysEqual([1, 2, 3], [1, 2, 3])).toBe(true);
  });

  test("returns false for different lengths", () => {
    expect(arraysEqual([1, 2], [1, 2, 3])).toBe(false);
  });

  test("returns false for different values", () => {
    expect(arraysEqual([1, 2], [1, 3])).toBe(false);
  });

  test("returns false when second is undefined", () => {
    expect(arraysEqual([1], undefined)).toBe(false);
  });

  test("returns true for empty arrays", () => {
    expect(arraysEqual([], [])).toBe(true);
  });
});
