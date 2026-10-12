import { bookTotal } from "@/lib/books";
import type { LibraryResponse, ReadingStatus, UserBook } from "@/lib/schemas";

export type Shelf = "reading" | "want" | "finished" | "favourites";

/** Which LibraryResponse array backs each shelf */
export const SHELF_KEY = {
  reading: "currentlyReading",
  want: "wantToRead",
  finished: "finished",
  favourites: "favoriteBooks",
} as const satisfies Record<Shelf, keyof LibraryResponse>;

const STATUS_KEY = {
  reading: "currentlyReading",
  want: "wantToRead",
  finished: "finished",
} as const satisfies Record<ReadingStatus, keyof LibraryResponse>;

export function findUserBook(library: LibraryResponse | undefined, userBookId: string): UserBook | undefined {
  if (!library) return undefined;
  return (
    library.currentlyReading.find((b) => b.id === userBookId) ??
    library.wantToRead.find((b) => b.id === userBookId) ??
    library.finished.find((b) => b.id === userBookId) ??
    library.favoriteBooks.find((b) => b.id === userBookId)
  );
}

/** The hero book: the reading entry touched most recently (the API sorts by date added) */
export function heroBook(library: LibraryResponse | undefined): UserBook | undefined {
  return [...(library?.currentlyReading ?? [])].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
}

/** Replace an entry everywhere it appears, moving it to the shelf of its (new) status */
function placeEntry(library: LibraryResponse, next: UserBook): LibraryResponse {
  const without = (list: Array<UserBook>) => list.filter((b) => b.id !== next.id);
  const result: LibraryResponse = {
    currentlyReading: without(library.currentlyReading),
    wantToRead: without(library.wantToRead),
    finished: without(library.finished),
    favoriteBooks: library.favoriteBooks
      .map((b) => (b.id === next.id ? next : b))
      .filter((b) => b.id !== next.id || next.isFavorite),
  };
  const key = STATUS_KEY[next.status];
  result[key] = [next, ...result[key]];
  if (next.isFavorite && !result.favoriteBooks.some((b) => b.id === next.id)) {
    result.favoriteBooks = [next, ...result.favoriteBooks];
  }
  return result;
}

/**
 * The client half of PUT /books/{id}/progress, mirroring the server rules:
 * page = total → finished (finishedAt set); any other page > 0 → reading (startedAt filled).
 */
export function applyProgress(
  library: LibraryResponse,
  userBookId: string,
  change: { currentPage?: number; pageCount?: number },
): LibraryResponse {
  const entry = findUserBook(library, userBookId);
  if (!entry) return library;

  const now = new Date().toISOString();
  const pageCount = change.pageCount ?? entry.pageCount;
  const total = bookTotal({ pageCount }, entry.book);
  const currentPage = Math.max(0, Math.min(change.currentPage ?? entry.currentPage ?? 0, total ?? 100_000));

  let status: ReadingStatus = entry.status;
  if (total && currentPage === total) status = "finished";
  else if (currentPage > 0) status = "reading";

  const next: UserBook = {
    ...entry,
    pageCount,
    currentPage,
    status,
    startedAt: status !== "want" ? (entry.startedAt ?? now) : entry.startedAt,
    finishedAt: status === "finished" ? (entry.status === "finished" ? entry.finishedAt : now) : entry.finishedAt,
    updatedAt: now,
  };
  return placeEntry(library, next);
}

/** Optimistic favourite toggle */
export function applyFavorite(library: LibraryResponse, userBookId: string, isFavorite: boolean): LibraryResponse {
  const entry = findUserBook(library, userBookId);
  if (!entry) return library;
  return placeEntry(library, { ...entry, isFavorite, updatedAt: new Date().toISOString() });
}
