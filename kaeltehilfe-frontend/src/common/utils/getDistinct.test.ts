import { describe, expect, test } from "vitest";
import { getDistinct } from "./getDistinct";

describe("getDistinct", () => {
  test("returns distinct items by getter", () => {
    const items = [
      { id: 1, type: "a" },
      { id: 2, type: "a" },
      { id: 3, type: "b" },
    ];
    const result = getDistinct(items, (i) => i.type);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(3);
  });

  test("returns empty for empty array", () => {
    expect(getDistinct([], (i: unknown) => i)).toEqual([]);
  });
});
