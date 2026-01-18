export const validators = <T>(
  value: T | undefined,
  ...validators: Array<(value: T | undefined) => string | null>
) => {
  for (const validator of validators) {
    const result = validator(value);
    if (result) return result;
  }
};
export const requiredValidator =
  (type?: "Date" | "Id" | "Array", message = "Erforderlich") =>
  (value: unknown) => {
    if (!isValueSet(value, type)) return message;
    return null;
  };

export const minLengthValidator =
  (minLength: number) => (value?: string | number) => {
    if ((value?.toString()?.trim()?.length || 0) < minLength) {
      return `Mindestens ${minLength} Zeichen`;
    }
    return null;
  };

export const noSpacesValidator = () => (value?: string) => {
  if (value?.toString()?.includes(" ")) {
    return "Darf keine Leerzeichen enthalten";
  }
  return null;
};

const isValueSet = (value: unknown, type?: "Date" | "Id" | "Array") => {
  if (value === null || value === undefined) return false;

  if (
    type === "Date" &&
    typeof value === "object" &&
    isNaN((value as Date).valueOf())
  )
    return false;

  if (type === "Id" && !value) return false;

  if (
    type === "Array" &&
    (!value || !Array.isArray(value) || value?.length === 0)
  )
    return false;

  if (typeof value === "string" && value.trim() === "") return false;

  if (typeof value === "number" && (value === undefined || value === null))
    return false;

  return true;
};

export const isDuplicate =
  <T>(existingValues: Array<T | undefined>, message: string) =>
  (value: T | undefined) => {
    return existingValues
      .map((existingValue) => toString(existingValue))
      ?.includes(toString(value))
      ? message
      : null;
  };

const toString = (value: unknown) => {
  return value && typeof value === "object" && "toString" in value
    ? value.toString()
    : String(value);
};

export type RegexValdiatorRequirements = {
  matcher: RegExp;
  error: string;
};
export const regexValidator =
  (requirements: Array<RegexValdiatorRequirements>) => (value?: string) => {
    return (
      requirements.find((r) => value && !r.matcher.test(value))?.error || null
    );
  };
