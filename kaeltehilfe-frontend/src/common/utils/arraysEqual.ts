/**
 * Checks if two arrays are equal
 *
 * @param arr1
 * @param arr2
 * @returns A boolean indicating if equal
 */
export const arraysEqual = <T>(
  arr1: Array<T>,
  arr2: Array<T> | undefined
): boolean => {
  if (!arr2) return false;

  if (Array.isArray(arr1) !== Array.isArray(arr2)) return false;

  if (arr1.length !== arr2.length) return false;

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }

  return true;
};
