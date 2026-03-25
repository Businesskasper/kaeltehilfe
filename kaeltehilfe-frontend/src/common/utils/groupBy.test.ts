import { describe, expect, test } from "vitest";
import { groupBy, GroupedMap } from "./groupBy";

describe("groupBy", () => {
  test("groups by a getter function", () => {
    const items = [
      { name: "a", type: "x" },
      { name: "b", type: "y" },
      { name: "c", type: "x" },
    ];
    const grouped = groupBy(items, (i) => i.type);
    expect(grouped.get("x")).toHaveLength(2);
    expect(grouped.get("y")).toHaveLength(1);
  });

  test("groups by object key using JSON serialization", () => {
    const items = [
      { loc: { lat: 1, lng: 2 }, name: "a" },
      { loc: { lat: 1, lng: 2 }, name: "b" },
      { loc: { lat: 3, lng: 4 }, name: "c" },
    ];
    const grouped = groupBy(items, (i) => i.loc);
    const keys = Array.from(grouped.keys());
    expect(keys).toHaveLength(2);
    expect(grouped.get({ lat: 1, lng: 2 })).toHaveLength(2);
  });
});

describe("GroupedMap", () => {
  test("set and get work with object keys", () => {
    const map = new GroupedMap<{ id: number }, string>();
    map.set({ id: 1 }, ["a", "b"]);
    expect(map.get({ id: 1 })).toEqual(["a", "b"]);
    expect(map.has({ id: 1 })).toBe(true);
    expect(map.has({ id: 2 })).toBe(false);
  });

  test("iterates keys and entries", () => {
    const map = new GroupedMap<string, number>();
    map.set("x", [1]);
    map.set("y", [2]);
    expect(Array.from(map.keys())).toEqual(["x", "y"]);
    expect(Array.from(map.entries())).toEqual([
      ["x", [1]],
      ["y", [2]],
    ]);
  });
});
