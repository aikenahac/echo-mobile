/** Dates arrive as ISO strings; format them in the user's locale */

/** "3 Oct" / "Oct 3" */
export function shortDate(iso: string | null | undefined) {
  if (!iso) return "";
  return new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short" }).format(new Date(iso));
}

/** Whole days between two dates, rounded up, at least 1 ("Read in 11 days") */
export function daysBetween(fromIso: string, toIso: string) {
  const ms = new Date(toIso).getTime() - new Date(fromIso).getTime();
  return Math.max(1, Math.ceil(ms / 86_400_000));
}
