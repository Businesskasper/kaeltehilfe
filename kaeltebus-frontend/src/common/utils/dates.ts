export const toDate = (value: unknown) => {
  if (!value || !["string", "number", "object"].includes(typeof value))
    return undefined;

  const asDate = new Date(value as string);
  return isNaN(asDate.valueOf()) ? undefined : asDate;
};

export const toLocalDate = (value: unknown) => {
  const asDate = toDate(value);
  if (!asDate) return undefined;

  return new Date(
    asDate.setTime(asDate.getTime() + asDate.getTimezoneOffset() * 60 * 1000)
  );
};

export const formatDate = (date: unknown) => {
  const asDate = toDate(date);
  if (!asDate) return "";

  return Intl.DateTimeFormat("de-DE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(asDate);
};

export const toNormalizedDate = (date: unknown) => {
  const asDate = toDate(date);
  if (!asDate) return undefined;

  return new Date(
    asDate.getFullYear(),
    asDate.getMonth(),
    asDate.getDate(),
    0,
    0,
    0,
    0
  );
};

export const compareByDateOnly = (date1: unknown, date2: unknown) => {
  const value1 = toNormalizedDate(date1);
  const value2 = toNormalizedDate(date2);
  return (value1?.valueOf() || 0) - (value2?.valueOf() || 0);
};
