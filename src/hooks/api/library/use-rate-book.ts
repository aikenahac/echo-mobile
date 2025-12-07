import { useLibraryApi } from "@/lib/api/library";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { libraryQueryKeys } from "../../query-keys";

export const useRateBook = (userBookId: string) => {
  const { rateBook } = useLibraryApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: libraryQueryKeys.rateBook(userBookId),
    mutationFn: (rating: number) => rateBook(userBookId, rating),
    onSuccess: () => {
      // Invalidate library queries to refresh data
      queryClient.invalidateQueries({
        queryKey: libraryQueryKeys.getBook(userBookId),
      });
      queryClient.invalidateQueries({
        queryKey: libraryQueryKeys.get,
      });
    },
  });
};
