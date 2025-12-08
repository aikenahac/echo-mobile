import { useLibraryApi } from "@/lib/api/library";
import { ReadingStatus } from "@/lib/schemas";
import { SearchResult } from "@/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { libraryQueryKeys } from "../../query-keys";

export const useAddBookToLibrary = () => {
  const { addBookToLibrary } = useLibraryApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bookData,
      status,
      isFavorite = false,
    }: {
      bookData: SearchResult;
      status: ReadingStatus;
      isFavorite?: boolean;
    }) => addBookToLibrary(bookData, status, isFavorite),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryQueryKeys.get });
    },
  });
};
