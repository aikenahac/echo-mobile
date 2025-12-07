import { useReviewsApi } from "@/lib/api/reviews";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewQueryKeys } from "../../query-keys";

export const useUpdateReview = (reviewId: string, bookId: string) => {
  const { updateReview } = useReviewsApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: reviewQueryKeys.update(reviewId),
    mutationFn: (data: { content?: string; isPrivate?: boolean }) =>
      updateReview(reviewId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: reviewQueryKeys.getByBook(bookId),
      });
    },
  });
};
