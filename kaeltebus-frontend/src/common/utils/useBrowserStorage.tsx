import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";

type SetValue<T> = Dispatch<SetStateAction<T>>;

export const useBrowserStorage = <T,>(
  type: "SESSION" | "LOCAL",
  key: string,
  initialValue: T,
  readTransform?: (obj: T) => T,
): [T, Dispatch<SetStateAction<T>>] => {
  const readValue = useCallback(() => {
    const storage = type === "SESSION" ? sessionStorage : localStorage;
    const storedValue = storage.getItem(key);

    let parsedValue: T;
    if (storedValue === null) {
      parsedValue = initialValue;
    } else {
      try {
        parsedValue = JSON.parse(storedValue) as T;
      } catch {
        parsedValue = storedValue as unknown as T;
      }
    }

    return readTransform ? readTransform(parsedValue) : parsedValue;
  }, [key, initialValue, type, readTransform]);

  const writeValue = useCallback(
    (value: T) => {
      const storage = type === "SESSION" ? sessionStorage : localStorage;
      const valueToStore =
        typeof value === "object" || Array.isArray(value)
          ? JSON.stringify(value)
          : value;
      storage.setItem(key, valueToStore as string);
    },
    [key, type],
  );

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue: SetValue<T> = React.useCallback(
    (value) => {
      // Allow value to be a function so we have the same API as useState
      const newValue = value instanceof Function ? value(storedValue) : value;

      // Save to storage
      writeValue(newValue);

      // Save state
      setStoredValue(newValue);
    },
    [storedValue, writeValue],
  );

  useEffect(() => {
    setStoredValue(readValue());
  }, [readValue]);

  return [storedValue, setValue];
};
