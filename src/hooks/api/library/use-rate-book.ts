import { invalidateLibrary, queryKeys } from "@/hooks/query-keys";
import { useLibraryApi } from "@/lib/api/library";
import { findUserBook } from "@/lib/library-cache";
import type { CatalogBookResponse, LibraryResponse } from "@/lib/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/** PUT /books/{id}/rating, optimistic on the library cache */
export const useRateBook = () => {
  const { rate } = useLibraryApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userBookId, rating }: { userBookId: string; rating: number; bookId?: string }) => rate(userBookId, rating),
    onMutate: async ({ userBookId, rating, bookId }) => {
      if (bookId) {
        const detail = queryClient.getQueryData<CatalogBookResponse>(queryKeys.catalog(bookId));
        if (detail?.userBook) queryClient.setQueryData(queryKeys.catalog(bookId), { ...detail, userBook: { ...detail.userBook, rating } });
      }
      await queryClient.cancelQueries({ queryKey: queryKeys.library });
      const previous = queryClient.getQueryData<LibraryResponse>(queryKeys.library);
      if (previous) {
        const patch = (list: LibraryResponse["finished"]) => list.map((b) => (b.id === userBookId ? { ...b, rating } : b));
        queryClient.setQueryData<LibraryResponse>(queryKeys.library, {
          currentlyReading: patch(previous.currentlyReading),
          wantToRead: patch(previous.wantToRead),
          finished: patch(previous.finished),
          favoriteBooks: patch(previous.favoriteBooks),
        });
      }
      return { previous, bookId: findUserBook(previous, userBookId)?.bookId };
    },
    onError: (_e, _v, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.library, context.previous);
    },
    onSettled: (_d, _e, { userBookId, bookId }, context) => invalidateLibrary(queryClient, { userBookId, bookId: bookId ?? context?.bookId }),
  });
};
