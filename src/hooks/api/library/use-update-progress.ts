import { invalidateLibrary, queryKeys } from "@/hooks/query-keys";
import { useLibraryApi } from "@/lib/api/library";
import { recordDayStart } from "@/lib/daily-pages";
import { applyProgress, findUserBook } from "@/lib/library-cache";
import type { LibraryResponse } from "@/lib/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const PROGRESS_MUTATION = ["library", "progress"] as const;

type Vars = { userBookId: string; currentPage?: number; pageCount?: number };

/**
 * PUT /books/{id}/progress, optimistic: the library cache moves the book to the
 * shelf the server will put it on, and rolls back if the call fails.
 */
export const useUpdateProgress = () => {
  const { updateProgress } = useLibraryApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: PROGRESS_MUTATION,
    mutationFn: ({ userBookId, ...body }: Vars) => updateProgress(userBookId, body),
    onMutate: async ({ userBookId, ...change }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.library });
      const previous = queryClient.getQueryData<LibraryResponse>(queryKeys.library);
      const entry = findUserBook(previous, userBookId);
      if (entry && change.currentPage !== undefined) recordDayStart(userBookId, entry.currentPage ?? 0);
      if (previous) queryClient.setQueryData(queryKeys.library, applyProgress(previous, userBookId, change));
      return { previous, bookId: entry?.bookId };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.library, context.previous);
    },
    onSettled: (_data, _err, { userBookId }, context) => {
      // Refetch only after the last pending update, so an early response can't
      // overwrite a later optimistic page while the user is still tapping
      if (queryClient.isMutating({ mutationKey: PROGRESS_MUTATION }) > 1) return;
      return invalidateLibrary(queryClient, { userBookId, bookId: context?.bookId });
    },
  });
};
