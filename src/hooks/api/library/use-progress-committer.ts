import { invalidateLibrary, queryKeys } from "@/hooks/query-keys";
import { useLibraryApi } from "@/lib/api/library";
import { getErrorMessage } from "@/lib/api/errors";
import { recordDayStart } from "@/lib/daily-pages";
import { applyProgress, findUserBook } from "@/lib/library-cache";
import { bookTotal } from "@/lib/books";
import type { CatalogBookResponse, LibraryResponse } from "@/lib/schemas";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { Alert } from "react-native";

/** Settle time before the page is sent (API.md §3) */
const DEBOUNCE_MS = 600;

type Pending = { userBookId: string; bookId: string; page: number };

/**
 * Page changes from the numbering stamp and the stepper (API.md §3):
 * 1. every change updates the library cache at once (optimistic, status rules mirrored);
 * 2. the API call waits ~600ms after the last change;
 * 3. while a request is in flight, only the latest page is sent after it returns;
 * 4. on error the cache rolls back to the last confirmed page and the message shows.
 */
export function useProgressCommitter() {
  const { updateProgress } = useLibraryApi();
  const queryClient = useQueryClient();

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlight = useRef(false);
  const latest = useRef<Pending | null>(null);
  /** The page the server last accepted, per entry */
  const confirmed = useRef(new Map<string, number>());

  const flush = useCallback(async () => {
    timer.current = null;
    if (inFlight.current) return; // the running loop picks up the latest page
    inFlight.current = true;
    let last: Pending | null = null;
    // Send the latest page; if a newer one arrived meanwhile, send only that one, and so on
    while (latest.current) {
      const pending: Pending = latest.current;
      latest.current = null;
      last = pending;
      try {
        await updateProgress(pending.userBookId, { currentPage: pending.page });
        confirmed.current.set(pending.userBookId, pending.page);
      } catch (error) {
        const fallback = confirmed.current.get(pending.userBookId);
        const library = queryClient.getQueryData<LibraryResponse>(queryKeys.library);
        if (library && fallback !== undefined) {
          queryClient.setQueryData(queryKeys.library, applyProgress(library, pending.userBookId, { currentPage: fallback }));
        }
        latest.current = null;
        Alert.alert(getErrorMessage(error));
      }
    }
    inFlight.current = false;
    if (last) await invalidateLibrary(queryClient, { userBookId: last.userBookId, bookId: last.bookId });
  }, [queryClient, updateProgress]);

  /**
   * Apply a page now and schedule the save. `bookId` is needed when the entry may not be
   * in the library cache (book detail opened from the feed or search).
   */
  const commit = useCallback(
    (userBookId: string, page: number, bookIdHint?: string) => {
      const library = queryClient.getQueryData<LibraryResponse>(queryKeys.library);
      const entry = findUserBook(library, userBookId);
      const bookId = entry?.bookId ?? bookIdHint;
      if (!bookId) return;
      const detail = queryClient.getQueryData<CatalogBookResponse>(queryKeys.catalog(bookId));
      const before = entry?.currentPage ?? detail?.userBook?.currentPage ?? 0;
      if (!confirmed.current.has(userBookId)) confirmed.current.set(userBookId, before);

      recordDayStart(userBookId, before);
      queryClient.cancelQueries({ queryKey: queryKeys.library });
      if (library && entry) {
        queryClient.setQueryData(queryKeys.library, applyProgress(library, userBookId, { currentPage: page }));
      }
      if (detail?.userBook) {
        // Mirror the status rules on the detail screen's copy too
        const total = bookTotal(detail.userBook, detail.book);
        const status = total && page === total ? "finished" : page > 0 ? "reading" : detail.userBook.status;
        queryClient.setQueryData(queryKeys.catalog(bookId), {
          ...detail,
          userBook: { ...detail.userBook, currentPage: page, status },
        });
      }

      latest.current = { userBookId, bookId, page };
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(flush, DEBOUNCE_MS);
    },
    [flush, queryClient],
  );

  /** Send a pending page right away (e.g. the screen is going away) */
  const flushNow = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      flush();
    }
  }, [flush]);

  useEffect(() => flushNow, [flushNow]);

  return { commit, flushNow };
}
