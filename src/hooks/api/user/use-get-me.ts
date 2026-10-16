import { useUsersApi } from "@/lib/api/user";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../query-keys";

export const useProfile = () => {
  const { getMe } = useUsersApi();

  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: getMe,
  });
};
