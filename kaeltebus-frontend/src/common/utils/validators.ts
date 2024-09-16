export const validators = <T>(
  value: T | undefined,
  ...validators: Array<(value: T | undefined) => string | undefined>
) => {
  for (const validator of validators) {
    const result = validator(value);
    if (result) return result;
  }
};
export const requiredValidator =
  (type?: "Date" | "Id", message = "Erforderlich") =>
  (value: unknown) => {
    if (!isValueSet(value, type)) return message;
  };

export const minLengthValidator =
  (minLength: number) => (value?: string | number) => {
    if ((value?.toString()?.trim()?.length || 0) < minLength) {
      return `Mindestens ${minLength} Zeichen`;
    }
  };

export const noSpacesValidator = () => (value?: string) => {
  if (value?.toString()?.includes(" ")) {
    return "Darf keine Leerzeichen enthalten";
  }
};

const isValueSet = (value: unknown, type?: "Date" | "Id") => {
  if (value === null || value === undefined) return false;

  if (typeof value === "string" && value.trim() === "") return false;

  if (
    type === "Date" &&
    typeof value === "object" &&
    isNaN((value as Date).valueOf())
  )
    return false;

  if (type == "Id" && !value) return false;

  return true;
};

export const isDuplicate =
  <T>(existingValues: Array<T>, message: string) =>
  (value: T) => {
    return existingValues
      .map((existingValue) => toString(existingValue))
      ?.includes(toString(value))
      ? message
      : undefined;
  };

const toString = (value: unknown) => {
  return value && typeof value === "object" && "toString" in value
    ? value.toString()
    : String(value);
};
