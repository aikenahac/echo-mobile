import { queryKeys } from "@/hooks/query-keys";
import { useProfileApi } from "@/lib/api/profile";
import { useQuery } from "@tanstack/react-query";

export const useProfileStats = () => {
  const { getStats } = useProfileApi();
  return useQuery({ queryKey: queryKeys.stats, queryFn: getStats });
};

export const useSubscription = () => {
  const { getSubscription } = useProfileApi();
  return useQuery({ queryKey: queryKeys.subscription, queryFn: getSubscription });
};

export const useUserProfile = (userId: string) => {
  const { getUser } = useProfileApi();
  return useQuery({ queryKey: queryKeys.user(userId), queryFn: () => getUser(userId), enabled: !!userId });
};

/** Live availability while typing (call with the debounced, filtered value) */
export const useUsernameAvailability = (username: string, current: string | null | undefined) => {
  const { usernameAvailable } = useProfileApi();
  return useQuery({
    queryKey: ["profile", "username-available", username],
    queryFn: () => usernameAvailable(username),
    enabled: username.length >= 3 && username !== current,
    staleTime: 30_000,
  });
};
