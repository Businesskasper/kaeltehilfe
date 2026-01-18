import { groupBy } from "./groupBy";

/**
 * Gets items distinct from an array of objects
 *
 * @param items the item array
 * @param key the key to get distinct items by
 * @returns an array of distinct items by provided key
 */
export function getDistinct<T, K extends keyof T>(items: T[], key: K): T[];
/**
 * Gets items distinct from an array of objects
 *
 * @param items the item array
 * @param getKey a function that is used to retrieve distinct items by
 * @returns an array of distinct items by provided getKey
 */
export function getDistinct<T, V>(items: T[], getKey: (item: T) => V): T[];
export function getDistinct<T, V, K extends keyof T>(
  items: T[],
  keyGetter: (item: T) => V | K
): T[] {
  const grouped = groupBy(items, keyGetter);

  const keys = Array.from(grouped.keys());

  const firstItems = keys.reduce((acc, key) => {
    const items = grouped.get(key);
    return items && items?.length > 0 ? [...acc, items[0]] : acc;
  }, new Array<T>());

  return firstItems;
}
