import { useReviewsApi } from "@/lib/api/reviews";
import { useQuery } from "@tanstack/react-query";
import { reviewQueryKeys } from "../../query-keys";

export const useGetBookReviews = (bookId: string) => {
  const { getBookReviews } = useReviewsApi();

  return useQuery({
    queryKey: reviewQueryKeys.getByBook(bookId),
    queryFn: () => getBookReviews(bookId),
    enabled: !!bookId,
  });
};
