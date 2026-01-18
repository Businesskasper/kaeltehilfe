/** Infers types of a template literal with a separator that occurs once or multiple times, e.g. TEST#${string} */
export type SplitBy<
  T extends string,
  S extends string,
> = T extends `${infer A}${S}${infer B}` ? [A, ...SplitBy<B, S>] : [T];

/**
 * Splits a string by the '#' character and infers the resulting types based on the template literal structure.
 *
 * @param input - The input string to be split.
 * @returns An array of strings representing the split parts.
 *
 * @example
 * const result = splitByHash('TEST#example');
 * // result: ['TEST', 'example']
 *
 * @example
 * const result = splitByHash('one#two#three');
 * // result: ['one', 'two', 'three']
 */
export function splitByHash<T extends string>(input: T): SplitBy<T, "#"> {
  return input.split("#") as SplitBy<T, "#">;
}
