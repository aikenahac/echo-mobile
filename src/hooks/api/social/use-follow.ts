import { queryKeys } from "@/hooks/query-keys";
import { useSearchApi } from "@/lib/api/search";
import type { FollowListResponse, UserSearchResponse } from "@/lib/schemas";
import { type InfiniteData, type Query, useMutation, useQueryClient } from "@tanstack/react-query";

const isFollowListQuery = (query: Query) => {
  const key = query.queryKey;
  return key[0] === "users" && typeof key[1] === "string" && (key[2] === "followers" || key[2] === "following");
};

/** Follow or unfollow, optimistic in every cached reader search */
export const useToggleFollow = () => {
  const { follow, unfollow } = useSearchApi();
  const queryClient = useQueryClient();

  const setFollowing = (userId: string, isFollowing: boolean) =>
    queryClient.setQueriesData<UserSearchResponse>({ queryKey: ["users", "search"] }, (data) =>
      data ? { ...data, results: data.results.map((r) => (r.id === userId ? { ...r, isFollowing } : r)) } : data,
    );

  const setFollowListFollowing = (userId: string, isFollowing: boolean) =>
    queryClient.setQueriesData<InfiniteData<FollowListResponse, number>>({ predicate: isFollowListQuery }, (data) =>
      data
        ? {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              results: page.results.map((user) =>
                user.id === userId
                  ? { ...user, isFollowing, isFriend: isFollowing && user.followsYou }
                  : user,
              ),
            })),
          }
        : data,
    );

  return useMutation({
    mutationFn: ({ userId, following }: { userId: string; following: boolean }) => (following ? follow(userId) : unfollow(userId)),
    onMutate: async ({ userId, following }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ["users", "search"] }),
        queryClient.cancelQueries({ predicate: isFollowListQuery }),
      ]);
      const searchSnapshot = queryClient.getQueriesData<UserSearchResponse>({ queryKey: ["users", "search"] });
      const followListSnapshot = queryClient.getQueriesData<InfiniteData<FollowListResponse, number>>({
        predicate: isFollowListQuery,
      });
      setFollowing(userId, following);
      setFollowListFollowing(userId, following);
      return { searchSnapshot, followListSnapshot };
    },
    onError: (_error, _variables, context) => {
      context?.searchSnapshot.forEach(([key, data]) => queryClient.setQueryData(key, data));
      context?.followListSnapshot.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feed });
      queryClient.invalidateQueries({ queryKey: queryKeys.users, predicate: (query) => !isFollowListQuery(query) });
      // Keep an open list as is (an unfollowed row stays, so it can be undone); refetch on next visit
      queryClient.invalidateQueries({ predicate: isFollowListQuery, refetchType: "none" });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
};
