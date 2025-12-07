import { useReviewsApi } from "@/lib/api/reviews";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewQueryKeys } from "../../query-keys";

export const useCreateReview = (bookId: string) => {
  const { createReview } = useReviewsApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: reviewQueryKeys.create(bookId),
    mutationFn: ({
      content,
      isPrivate,
    }: {
      content: string;
      isPrivate: boolean;
    }) => createReview(bookId, content, isPrivate),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: reviewQueryKeys.getByBook(bookId),
      });
    },
  });
};
