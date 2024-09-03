export const toDate = (value: unknown) => {
  if (!value || !["string", "number", "object"].includes(typeof value))
    return undefined;

  const asDate = new Date(value as string);
  return isNaN(asDate.valueOf()) ? undefined : asDate;
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
