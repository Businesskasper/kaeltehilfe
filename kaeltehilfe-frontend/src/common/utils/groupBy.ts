/**
 * A Map wrapper that handles object key stringification transparently.
 * Allows getting and setting with the original key type, automatically stringifying complex objects.
 */
export class GroupedMap<K, V> {
  private map: Map<string, V[]>;

  constructor() {
    this.map = new Map();
  }

  private deserializeKey(serializedKey: string) {
    return JSON.parse(serializedKey) as K;
  }

  private serializeKey(key: K) {
    return JSON.stringify(key);
  }

  get(key: K): V[] | undefined {
    const serialized = this.serializeKey(key);
    return this.map.get(serialized);
  }

  set(key: K, value: V[]): this {
    const serialized = this.serializeKey(key);
    this.map.set(serialized, value);
    return this;
  }

  has(key: K): boolean {
    const serialized = this.serializeKey(key);
    return this.map.has(serialized);
  }

  private *keysGenerator(): IterableIterator<K> {
    for (const serializedKey of this.map.keys()) {
      yield this.deserializeKey(serializedKey);
    }
  }

  keys(): IterableIterator<K> {
    return this.keysGenerator();
  }

  values(): IterableIterator<V[]> {
    return this.map.values();
  }

  private *entriesGenerator(): IterableIterator<[K, V[]]> {
    for (const [serializedKey, value] of this.map.entries()) {
      yield [this.deserializeKey(serializedKey), value];
    }
  }

  entries(): IterableIterator<[K, V[]]> {
    return this.entriesGenerator();
  }

  forEach(callback: (value: V[], key: K) => void): void {
    // Implement this accordingly
    for (const [serializedKey, value] of this.map.entries()) {
      const key = this.deserializeKey(serializedKey);
      callback(value, key);
    }
  }
}

/**
 * Groups an array of objects
 *
 * @param items the item array
 * @param key the key to group the items by
 * @returns a GroupedMap where complex object keys are automatically stringified for comparison
 */
export function groupBy<T, K extends keyof T>(
  items: T[],
  key: K,
): GroupedMap<T[K], T>;
/**
 * Groups an array of objects
 *
 * @param items the item array
 * @param getKey a function that is used to retrieve the group key from each item
 * @returns a GroupedMap where complex object keys are automatically stringified for comparison
 */
export function groupBy<T, V>(
  items: T[],
  getKey: (item: T) => V,
): GroupedMap<V, T>;
export function groupBy<T, V, K extends keyof T>(
  items: T[],
  keyGetter: (item: T) => V | K,
): GroupedMap<V | K, T> {
  const groupedMap = new GroupedMap<V | K, T>();

  for (const item of items) {
    const key =
      typeof keyGetter === "function" ? keyGetter(item) : item[keyGetter];

    const group = groupedMap.get(key);

    if (group) {
      group.push(item);
    } else {
      groupedMap.set(key, [item]);
    }
  }

  return groupedMap;
}
