/**
 * Returns a Partial from provided object
 *
 * @param object the object to extract from
 * @param relevantKeys the relevant keys to extract the partial from
 * @returns the Partial or undefined (if none of provided keys are in the object)
 */
export function extractPartial<
  T extends Record<string, unknown>,
  K extends keyof T,
>(object: T, relevantKeys: K[]): Pick<T, K> | undefined {
  // Check for all relevant keys
  return relevantKeys.reduce(
    (partial: Pick<T, K> | undefined, key: K) => {
      // ... if they exist in the reference object
      if (key in object)
        // ... and add them to the new partial
        return {
          ...partial,
          [key]: object[key],
        } as Pick<T, K>;
      // ... otherwise return the partial as is
      return partial;
    },
    undefined as Pick<T, K> | undefined,
  );
}
