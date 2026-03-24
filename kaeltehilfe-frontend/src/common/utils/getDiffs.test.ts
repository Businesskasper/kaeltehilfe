import { describe, expect, test } from "vitest";
import { getDiffs, getHasDiffs } from "./getDiffs";

describe("getDiffs", () => {
  test("detects changed values", () => {
    expect(getDiffs({ a: 1, b: 2 }, { a: 1, b: 3 })).toEqual({ b: 2 });
  });

  test("returns empty when objects are equal", () => {
    expect(getDiffs({ a: 1 }, { a: 1 })).toEqual({});
  });

  test("detects removed keys", () => {
    const diffs = getDiffs({ a: 1 } as Record<string, unknown>, { a: 1, b: 2 });
    expect(diffs).toHaveProperty("b", undefined);
  });

  test("compares arrays", () => {
    expect(getDiffs({ arr: [1, 2] }, { arr: [1, 2] })).toEqual({});
    expect(getDiffs({ arr: [1, 2] }, { arr: [1, 3] })).toEqual({ arr: [1, 2] });
  });

  test("compares nested objects", () => {
    const diffs = getDiffs({ nested: { x: 1 } }, { nested: { x: 2 } });
    expect(diffs).toEqual({ nested: { x: 1 } });
  });

  test("returns empty for null item", () => {
    expect(getDiffs(null as never, { a: 1 })).toEqual({});
  });
});

describe("getHasDiffs", () => {
  test("returns true when differences exist", () => {
    expect(getHasDiffs({ a: 1 }, { a: 2 })).toBe(true);
  });

  test("returns false when equal", () => {
    expect(getHasDiffs({ a: 1 }, { a: 1 })).toBe(false);
  });
});
