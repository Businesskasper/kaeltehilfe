export const validators = <T>(
  value: T | undefined,
  ...validators: Array<(value: T | undefined) => string | undefined>
) => {
  for (const validator of validators) {
    const result = validator(value);
    if (result) return result;
  }
};
export const requiredValidator = (type?: "Date" | "Id") => (value: unknown) => {
  if (!isValueSet(value, type)) return "Erforderlich";
};

export const minLengthValidator =
  (minLength: number) => (value?: string | number) => {
    if ((value?.toString()?.trim()?.length || 0) < minLength) {
      return `Mindestens ${minLength} Zeichen`;
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
