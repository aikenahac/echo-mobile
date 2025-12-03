import { useLibraryApi } from "@/lib/api/library";
import { useMutation } from "@tanstack/react-query";
import { libraryQueryKeys } from "../../query-keys";

export const useToggleFavorite = (userBookId: string) => {
  const { toggleFavorite } = useLibraryApi();

  return useMutation({
    mutationKey: libraryQueryKeys.toggleFavorite(userBookId),
    mutationFn: (isFavorite: boolean) =>
      toggleFavorite(userBookId, isFavorite),
  });
};
