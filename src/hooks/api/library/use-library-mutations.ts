import { invalidateLibrary, queryKeys } from "@/hooks/query-keys";
import { useLibraryApi } from "@/lib/api/library";
import { applyFavorite } from "@/lib/library-cache";
import type { AddBookRequest, Book, CatalogBookResponse, LibraryResponse, ReadingStatus } from "@/lib/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type Ids = { userBookId: string; bookId: string };

/** Patch the catalog cache for this book while a library call is in flight */
function patchCatalog(
  queryClient: ReturnType<typeof useQueryClient>,
  bookId: string,
  patch: (data: CatalogBookResponse) => CatalogBookResponse,
) {
  const previous = queryClient.getQueryData<CatalogBookResponse>(queryKeys.catalog(bookId));
  if (previous) queryClient.setQueryData(queryKeys.catalog(bookId), patch(previous));
  return previous;
}

/** PUT /books/{id}/status. Finished sets currentPage = pageCount on the server. */
export const useUpdateStatus = () => {
  const { updateStatus } = useLibraryApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userBookId, status }: Ids & { status: ReadingStatus }) => updateStatus(userBookId, status),
    onMutate: async ({ bookId, status }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.catalog(bookId) });
      const previous = patchCatalog(queryClient, bookId, (d) => (d.userBook ? { ...d, userBook: { ...d.userBook, status } } : d));
      return { previous };
    },
    onError: (_e, { bookId }, ctx) => ctx?.previous && queryClient.setQueryData(queryKeys.catalog(bookId), ctx.previous),
    onSettled: (_d, _e, ids) => invalidateLibrary(queryClient, ids),
  });
};

/** PUT /books/{id}/favorite, optimistic on both caches */
export const useSetFavorite = () => {
  const { setFavorite } = useLibraryApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userBookId, isFavorite }: Ids & { isFavorite: boolean }) => setFavorite(userBookId, isFavorite),
    onMutate: async ({ userBookId, bookId, isFavorite }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.catalog(bookId) });
      const previous = patchCatalog(queryClient, bookId, (d) => (d.userBook ? { ...d, userBook: { ...d.userBook, isFavorite } } : d));
      const library = queryClient.getQueryData<LibraryResponse>(queryKeys.library);
      if (library) queryClient.setQueryData(queryKeys.library, applyFavorite(library, userBookId, isFavorite));
      return { previous, library };
    },
    onError: (_e, { bookId }, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKeys.catalog(bookId), ctx.previous);
      if (ctx?.library) queryClient.setQueryData(queryKeys.library, ctx.library);
    },
    onSettled: (_d, _e, ids) => invalidateLibrary(queryClient, ids),
  });
};

/** DELETE /books/{id}. The review stays (reviews belong to the catalog book). */
export const useRemoveBook = () => {
  const { remove } = useLibraryApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userBookId }: Ids) => remove(userBookId),
    onSettled: (_d, _e, ids) => invalidateLibrary(queryClient, ids),
  });
};

/** POST /books: add a catalog or search book to a shelf */
export const useAddBook = () => {
  const { add } = useLibraryApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AddBookRequest) => add(body),
    onSettled: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.search });
      return invalidateLibrary(queryClient, { bookId: data?.userBook.bookId });
    },
  });
};

/** The POST /books body for a book we already have the details of */
export function addBookBody(book: Pick<Book, "title" | "author" | "isbn" | "coverUrl" | "pages" | "publishedYear">, status: ReadingStatus): AddBookRequest {
  return {
    bookData: {
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      coverUrl: book.coverUrl,
      pages: book.pages,
      publishedYear: book.publishedYear,
    },
    status,
  };
}
