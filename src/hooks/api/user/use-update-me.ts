import { useUsersApi } from "@/lib/api/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../query-keys";

export const useUpdateProfile = () => {
  const { updateMe } = useUsersApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMe,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.profile }),
  });
};
