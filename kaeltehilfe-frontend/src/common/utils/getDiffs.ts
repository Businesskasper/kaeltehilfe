import { arraysEqual } from "./arraysEqual";

/**
 * Deeply compares two objects and returns the diff
 *
 * @param item The item to check
 * @param reference The object to check against
 * @returns A new object containing the differences between the two objects
 **/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getDiffs<T extends Record<string, any>>(
  item: T,
  reference: T,
): Partial<T> {
  const diffs: Partial<T> = {};

  if (!item) {
    // if the item is null or undefined, there are no diffs to check
    return {};
  }

  const keys = Object.keys(item) as Array<keyof T>;

  for (const key of keys) {
    const value = item[key];
    const referenceValue = reference ? reference[key] : undefined;

    if (value === referenceValue) {
      // the values are equal, so there is no difference
      continue;
    }

    if (Array.isArray(value)) {
      // if the value is an array, compare the arrays
      if (!arraysEqual(value, referenceValue)) {
        diffs[key] = value;
      }
    } else if ((value as unknown) instanceof Date) {
      // if the value is a date, compare the dates
      if (value.valueOf() !== referenceValue?.valueOf()) {
        diffs[key] = value;
      }
    } else if (value !== null && typeof value === "object") {
      // if the value is an object, compare the objects recursively
      const nestedDiffs = getDiffs(value, referenceValue as T[keyof T]);
      if (Object.keys(nestedDiffs).length > 0) {
        diffs[key] = nestedDiffs as T[keyof T];
      }
    } else {
      // for simple value types, just compare the values
      diffs[key] = value;
    }
  }

  // Add the keys to the diff that have been removed
  const keysReference = Object.keys(reference) as Array<keyof T>;
  for (const key of keysReference) {
    if (!(key in item)) {
      diffs[key] = undefined;
    }
  }

  return diffs;
}

export function getHasDiffs<T extends Record<string, unknown>>(
  item: T,
  reference: T,
): boolean {
  const diffs = getDiffs(item, reference);

  return Object.keys(diffs).length > 0;
}
