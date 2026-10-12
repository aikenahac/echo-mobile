import type { QueryClient } from "@tanstack/react-query";

/** Query keys (design/redesign/API.md §0.2) */
export const queryKeys = {
  library: ["library"] as const,
  libraryBook: (userBookId: string) => ["library", userBookId] as const,
  catalog: (bookId: string) => ["catalog", bookId] as const,
  profile: ["profile"] as const,
  stats: ["profile", "stats"] as const,
  subscription: ["profile", "subscription"] as const,
  collections: ["collections"] as const,
  collection: (id: string) => ["collections", id] as const,
  feed: ["feed"] as const,
  searchBooks: (q: string) => ["search", "books", q] as const,
  searchUsers: (q: string) => ["users", "search", q] as const,
  users: ["users"] as const,
  user: (userId: string) => ["users", userId] as const,
};

/**
 * Any library mutation (add, status, progress, rating, favorite, remove)
 * refreshes the library, the entry, its catalog book and the profile stats.
 */
export function invalidateLibrary(
  queryClient: QueryClient,
  ids: { userBookId?: string; bookId?: string } = {},
) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.library }),
    ids.bookId ? queryClient.invalidateQueries({ queryKey: queryKeys.catalog(ids.bookId) }) : null,
    queryClient.invalidateQueries({ queryKey: queryKeys.stats }),
  ]);
}
