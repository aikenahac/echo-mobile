import { queryKeys } from "@/hooks/query-keys";
import { useCatalogApi } from "@/lib/api/catalog";
import type { CatalogBookResponse, SaveReviewRequest } from "@/lib/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/*
 * The book's detail screen sits under the editor sheet, so it may not count as an
 * "active" query; refetch it regardless, and patch the cache so it's right at once.
 */

/** POST /reviews (create or update) */
export const useSaveReview = () => {
  const { saveReview } = useCatalogApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: SaveReviewRequest) => saveReview(body),
    onSuccess: (_d, { bookId, content, isPrivate }) => {
      const detail = queryClient.getQueryData<CatalogBookResponse>(queryKeys.catalog(bookId));
      if (detail?.myReview) {
        queryClient.setQueryData(queryKeys.catalog(bookId), {
          ...detail,
          myReview: { ...detail.myReview, content, isPrivate, updatedAt: new Date().toISOString() },
        });
      }
    },
    onSettled: (_d, _e, { bookId }) => queryClient.invalidateQueries({ queryKey: queryKeys.catalog(bookId), refetchType: "all" }),
  });
};

/** DELETE /reviews/{id} */
export const useDeleteReview = () => {
  const { deleteReview } = useCatalogApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId }: { reviewId: string; bookId: string }) => deleteReview(reviewId),
    onSuccess: (_d, { bookId }) => {
      const detail = queryClient.getQueryData<CatalogBookResponse>(queryKeys.catalog(bookId));
      if (detail) queryClient.setQueryData(queryKeys.catalog(bookId), { ...detail, myReview: null });
    },
    onSettled: (_d, _e, { bookId }) => queryClient.invalidateQueries({ queryKey: queryKeys.catalog(bookId), refetchType: "all" }),
  });
};
