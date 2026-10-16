import { queryKeys } from "@/hooks/query-keys";
import { useSearchApi } from "@/lib/api/search";
import type { UserSearchResponse } from "@/lib/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/** Follow or unfollow, optimistic in every cached reader search */
export const useToggleFollow = () => {
  const { follow, unfollow } = useSearchApi();
  const queryClient = useQueryClient();

  const setFollowing = (userId: string, isFollowing: boolean) =>
    queryClient.setQueriesData<UserSearchResponse>({ queryKey: ["users", "search"] }, (data) =>
      data ? { ...data, results: data.results.map((r) => (r.id === userId ? { ...r, isFollowing } : r)) } : data,
    );

  return useMutation({
    mutationFn: ({ userId, following }: { userId: string; following: boolean }) => (following ? follow(userId) : unfollow(userId)),
    onMutate: async ({ userId, following }) => {
      await queryClient.cancelQueries({ queryKey: ["users", "search"] });
      setFollowing(userId, following);
    },
    onError: (_e, { userId, following }) => setFollowing(userId, !following),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feed });
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
};
