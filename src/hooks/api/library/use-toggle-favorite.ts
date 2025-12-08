import { useLibraryApi } from "@/lib/api/library";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { libraryQueryKeys } from "../../query-keys";

export const useToggleFavorite = (userBookId: string) => {
  const queryClient = useQueryClient();
  const { toggleFavorite } = useLibraryApi();

  return useMutation({
    mutationKey: libraryQueryKeys.toggleFavorite(userBookId),
    mutationFn: (isFavorite: boolean) => toggleFavorite(userBookId, isFavorite),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: libraryQueryKeys.get }),
  });
};
