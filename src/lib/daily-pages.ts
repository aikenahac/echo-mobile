import { getFromLocalStorage, setInLocalStorage, STORAGE_KEYS } from "@/lib/storage";

/*
 * "+12 today" has no backend source: the server keeps no reading history. The
 * first time a book's page changes on a given local day, remember the page it
 * started the day on; today's progress is the difference. Device-local only.
 */

type Snapshots = Record<string, { date: string; startPage: number }>;

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

/** Call before a page change, with the page the book was on */
export function recordDayStart(userBookId: string, previousPage: number) {
  const all = getFromLocalStorage<Snapshots>(STORAGE_KEYS.DAILY_PAGE_SNAPSHOT) ?? {};
  if (all[userBookId]?.date === today()) return;
  setInLocalStorage<Snapshots>(STORAGE_KEYS.DAILY_PAGE_SNAPSHOT, {
    ...all,
    [userBookId]: { date: today(), startPage: previousPage },
  });
}

/** Pages read today on this device, or null when there's nothing to show */
export function pagesToday(userBookId: string, currentPage: number): number | null {
  const snap = getFromLocalStorage<Snapshots>(STORAGE_KEYS.DAILY_PAGE_SNAPSHOT)?.[userBookId];
  if (!snap || snap.date !== today()) return null;
  const delta = currentPage - snap.startPage;
  return delta > 0 ? delta : null;
}
