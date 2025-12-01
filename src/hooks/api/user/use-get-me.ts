import { useUsersApi } from "@/lib/api/user";
import { useQuery } from "@tanstack/react-query";
import { profileQueryKeys } from "../../query-keys";


export const useProfile = () => {
  const { getMe } = useUsersApi();

  return useQuery({
    queryKey: profileQueryKeys.get,
    queryFn: getMe,
  });
};
