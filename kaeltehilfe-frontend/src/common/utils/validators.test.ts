import { describe, expect, test } from "vitest";
import {
  requiredValidator,
  minLengthValidator,
  noSpacesValidator,
  isDuplicate,
  validators,
} from "./validators";

describe("requiredValidator", () => {
  const required = requiredValidator();

  test("returns error for empty string", () => {
    expect(required("")).toBe("Erforderlich");
    expect(required("  ")).toBe("Erforderlich");
  });

  test("returns null for valid value", () => {
    expect(required("hello")).toBeNull();
    expect(required(0)).toBeNull();
  });

  test("returns error for null/undefined", () => {
    expect(required(null)).toBe("Erforderlich");
    expect(required(undefined)).toBe("Erforderlich");
  });

  test("validates arrays when type is Array", () => {
    const arrayRequired = requiredValidator("Array");
    expect(arrayRequired([])).toBe("Erforderlich");
    expect(arrayRequired([1])).toBeNull();
  });
});

describe("minLengthValidator", () => {
  const min3 = minLengthValidator(3);

  test("returns error for short strings", () => {
    expect(min3("ab")).toBe("Mindestens 3 Zeichen");
  });

  test("returns null for valid length", () => {
    expect(min3("abc")).toBeNull();
  });
});

describe("noSpacesValidator", () => {
  const noSpaces = noSpacesValidator();

  test("returns error for strings with spaces", () => {
    expect(noSpaces("a b")).toBe("Darf keine Leerzeichen enthalten");
  });

  test("returns null for strings without spaces", () => {
    expect(noSpaces("abc")).toBeNull();
  });
});

describe("isDuplicate", () => {
  test("returns error when value exists", () => {
    const check = isDuplicate(["a", "b"], "Duplikat");
    expect(check("a")).toBe("Duplikat");
  });

  test("returns null when value is unique", () => {
    const check = isDuplicate(["a", "b"], "Duplikat");
    expect(check("c")).toBeNull();
  });
});

describe("validators (chain)", () => {
  test("returns first failing validator message", () => {
    const result = validators("", requiredValidator(), minLengthValidator(3));
    expect(result).toBe("Erforderlich");
  });

  test("returns undefined when all pass", () => {
    const result = validators(
      "hello",
      requiredValidator(),
      minLengthValidator(3),
    );
    expect(result).toBeUndefined();
  });
});
