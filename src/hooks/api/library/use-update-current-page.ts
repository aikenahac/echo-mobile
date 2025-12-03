import { useLibraryApi } from "@/lib/api/library";
import { useMutation } from "@tanstack/react-query";
import { libraryQueryKeys } from "../../query-keys";

export const useUpdateCurrentPage = (userBookId: string) => {
  const { updateCurrentPage } = useLibraryApi();

  return useMutation({
    mutationKey: libraryQueryKeys.updateCurrentPage(userBookId),
    mutationFn: (currentPage: number) =>
      updateCurrentPage(userBookId, currentPage),
  });
};
