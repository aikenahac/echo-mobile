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

/**
 * Feed times: "40 min", "2 h", "Yesterday", then the weekday within a week ("Sat"), then
 * the date ("3 Oct").
 */
export function relativeTime(iso: string, t: (key: string, opts?: Record<string, unknown>) => string, now = new Date()) {
  const then = new Date(iso);
  const minutes = Math.max(0, Math.round((now.getTime() - then.getTime()) / 60_000));
  if (minutes < 1) return t("time.now");
  if (minutes < 60) return t("time.minutes", { count: minutes });
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOfDay(now) - startOfDay(then)) / 86_400_000);
  if (days === 0) return t("time.hours", { count: Math.round(minutes / 60) });
  if (days === 1) return t("time.yesterday");
  if (days < 7) return new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(then);
  return shortDate(iso);
}
