import { useLibraryApi } from "@/lib/api/library";
import { ReadingStatus } from "@/lib/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { libraryQueryKeys } from "../../query-keys";

export const useUpdateStatus = (userBookId: string) => {
  const { updateStatus } = useLibraryApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: libraryQueryKeys.updateStatus(userBookId),
    mutationFn: (status: ReadingStatus) => updateStatus(userBookId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryQueryKeys.get });
    },
  });
};
