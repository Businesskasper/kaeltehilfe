import { describe, expect, test } from "vitest";
import { splitByHash } from "./splitBy";

describe("splitByHash", () => {
  test("splits by # character", () => {
    expect(splitByHash("a#b#c")).toEqual(["a", "b", "c"]);
  });

  test("returns single element when no #", () => {
    expect(splitByHash("abc")).toEqual(["abc"]);
  });

  test("handles empty segments", () => {
    expect(splitByHash("#a#")).toEqual(["", "a", ""]);
  });
});
