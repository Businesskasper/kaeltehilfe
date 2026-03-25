import { describe, expect, test } from "vitest";
import { chunkArray } from "./chunkArray";

describe("chunkArray", () => {
  test("splits into even chunks", () => {
    expect(chunkArray([1, 2, 3, 4], 2)).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  test("handles remainder", () => {
    expect(chunkArray([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  test("returns empty for empty array", () => {
    expect(chunkArray([], 3)).toEqual([]);
  });

  test("single element chunks", () => {
    expect(chunkArray([1, 2, 3], 1)).toEqual([[1], [2], [3]]);
  });
});
