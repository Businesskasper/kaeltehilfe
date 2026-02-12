export function allStringsMatch(arr1: Array<string>, arr2: Array<string>) {
  return (
    arr1.every((m1) => arr2.includes(m1)) &&
    arr2.every((m2) => arr1.includes(m2))
  );
}
