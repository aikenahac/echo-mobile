import { useLibraryApi } from "@/lib/api/library";
import { useMutation } from "@tanstack/react-query";
import { libraryQueryKeys } from "../../query-keys";

export const useUpdatePageCount = (userBookId: string) => {
  const { updatePageCount } = useLibraryApi();

  return useMutation({
    mutationKey: libraryQueryKeys.updatePageCount(userBookId),
    mutationFn: (pageCount: number) => updatePageCount(userBookId, pageCount),
  });
};
