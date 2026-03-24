import { describe, expect, test } from "vitest";
import { extractPartial } from "./extractPartial";

describe("extractPartial", () => {
  test("extracts specified keys", () => {
    const obj = { a: 1, b: 2, c: 3 };
    expect(extractPartial(obj, ["a", "c"])).toEqual({ a: 1, c: 3 });
  });

  test("returns undefined when no keys match", () => {
    const obj = { a: 1 } as Record<string, unknown>;
    expect(extractPartial(obj, ["b" as keyof typeof obj])).toBeUndefined();
  });

  test("handles partial key overlap", () => {
    const obj = { a: 1, b: 2 };
    expect(extractPartial(obj, ["a"])).toEqual({ a: 1 });
  });
});
