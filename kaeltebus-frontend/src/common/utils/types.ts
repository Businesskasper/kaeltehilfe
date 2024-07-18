export type ValueTypeProps<TType, TValue> = {
  [TKey in keyof TType]: TType[TKey] extends TValue ? TKey : never;
}[keyof TType];
