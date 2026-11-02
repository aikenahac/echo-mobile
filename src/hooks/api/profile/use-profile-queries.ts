import { queryKeys } from "@/hooks/query-keys";
import { USER_LIST_PAGE_SIZE, USER_SHELF_PAGE_SIZE, useProfileApi } from "@/lib/api/profile";
import type { ProfileShelf } from "@/lib/schemas";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

export const useProfileStats = () => {
  const { getStats } = useProfileApi();
  return useQuery({ queryKey: queryKeys.stats, queryFn: getStats });
};

export const useSubscription = () => {
  const { getSubscription } = useProfileApi();
  return useQuery({ queryKey: queryKeys.subscription, queryFn: getSubscription });
};

export const useUserProfile = (userId: string, enabled = true) => {
  const { getUser } = useProfileApi();
  return useQuery({ queryKey: queryKeys.user(userId), queryFn: () => getUser(userId), enabled: !!userId && enabled });
};

/** One of another reader's shelves, infinite on hasMore */
export const useUserShelf = (userId: string, shelf: ProfileShelf) => {
  const { getUserShelf } = useProfileApi();
  return useInfiniteQuery({
    queryKey: queryKeys.userShelf(userId, shelf),
    queryFn: ({ pageParam }) => getUserShelf(userId, shelf, pageParam),
    initialPageParam: 0,
    getNextPageParam: (last, pages) => (last.hasMore ? pages.length * USER_SHELF_PAGE_SIZE : undefined),
    enabled: !!userId,
  });
};

/** Another reader's reviews; only enabled once the profile says they're visible */
export const useUserReviews = (userId: string, enabled: boolean) => {
  const { getUserReviews } = useProfileApi();
  return useInfiniteQuery({
    queryKey: queryKeys.userReviews(userId),
    queryFn: ({ pageParam }) => getUserReviews(userId, pageParam),
    initialPageParam: 0,
    getNextPageParam: (last, pages) => (last.hasMore ? pages.length * USER_LIST_PAGE_SIZE : undefined),
    enabled: !!userId && enabled,
  });
};

/** A reader's followers or following list; only enabled once profile content is visible */
export const useFollowList = (userId: string, direction: "followers" | "following", enabled = true) => {
  const { getFollowList } = useProfileApi();
  return useInfiniteQuery({
    queryKey: queryKeys.userFollows(userId, direction),
    queryFn: ({ pageParam }) => getFollowList(userId, direction, pageParam),
    initialPageParam: 0,
    getNextPageParam: (last, pages) => (last.hasMore ? pages.length * USER_LIST_PAGE_SIZE : undefined),
    enabled: !!userId && enabled,
  });
};

/** Another reader's activity (offset max 1000, like the feed) */
export const useUserActivity = (userId: string, enabled: boolean) => {
  const { getUserActivity } = useProfileApi();
  return useInfiniteQuery({
    queryKey: queryKeys.userActivity(userId),
    queryFn: ({ pageParam }) => getUserActivity(userId, pageParam),
    initialPageParam: 0,
    getNextPageParam: (last, pages) => {
      const next = pages.length * USER_LIST_PAGE_SIZE;
      return last.hasMore && next <= 1000 ? next : undefined;
    },
    enabled: !!userId && enabled,
  });
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
