export type ValueTypeProps<TType, TValue> = {
  [TKey in keyof TType]: TType[TKey] extends TValue ? TKey : never;
}[keyof TType];

export type OneOfUnion<T, K extends keyof T, V extends T[K]> = T extends {
  [key in K]: V;
}
  ? T
  : never;
