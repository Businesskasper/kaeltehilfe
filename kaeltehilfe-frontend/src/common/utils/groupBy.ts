/**
 * Groups an array of objects
 *
 * @param items the item array
 * @param key a the key to group the items by
 * @returns a map where the key is the getKey retrieved value
 */
export function groupBy<T, K extends keyof T>(
  items: T[],
  key: K,
): Map<T[K], T[]>;
/**
 * Groups an array of objects
 *
 * @param items the item array
 * @param getKey a function that is used to retrieve the group key from each item
 * @returns a map where the key is the getKey retrieved value
 */
export function groupBy<T, V>(items: T[], getKey: (item: T) => V): Map<V, T[]>;
export function groupBy<T, V, K extends keyof T>(
  items: T[],
  keyGetter: (item: T) => V | K,
): Map<V | K, T[]> {
  const map = new Map<V | K, T[]>();

  for (const item of items) {
    const key =
      typeof keyGetter === "function" ? keyGetter(item) : item[keyGetter];
    const group = map.get(key);

    if (group) {
      group.push(item);
    } else {
      map.set(key, [item]);
    }
  }

  return map;
}
