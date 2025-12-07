import { useReviewsApi } from "@/lib/api/reviews";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewQueryKeys } from "../../query-keys";

export const useDeleteReview = (reviewId: string, bookId: string) => {
  const { deleteReview } = useReviewsApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: reviewQueryKeys.delete(reviewId),
    mutationFn: () => deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: reviewQueryKeys.getByBook(bookId),
      });
    },
  });
};
