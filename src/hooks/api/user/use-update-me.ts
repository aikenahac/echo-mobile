import { useUsersApi } from "@/lib/api/user";
import { useMutation } from "@tanstack/react-query";
import { profileQueryKeys } from "../query-keys";


export const useUpdateProfile = () => {
  const { updateMe } = useUsersApi();

  return useMutation({
    mutationKey: profileQueryKeys.get,
    mutationFn: updateMe,
  });
};
