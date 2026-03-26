/**
 * Get the initials of a user
 * @param name The name of the user
 * @returns The initials of the user
 */
export function getUserInitials(name: string | undefined) {
  if (!name) return "";
  const names = name.split(" ");

  return `${names[0][0]}${names[1][0]}`;
}
