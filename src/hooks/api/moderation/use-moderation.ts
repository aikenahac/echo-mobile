import { queryKeys } from "@/hooks/query-keys";
import { useModerationApi } from "@/lib/api/moderation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useBlockedUsers = () => {
  const { getBlockedUsers } = useModerationApi();
  return useQuery({ queryKey: queryKeys.blockedUsers, queryFn: getBlockedUsers });
};

/** Blocking or unblocking changes who shows up in the feed, reviews, search and profiles */
function useRefreshAfterBlockChange() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.blockedUsers }),
      queryClient.invalidateQueries({ queryKey: queryKeys.feed }),
      queryClient.invalidateQueries({ queryKey: queryKeys.users }),
      queryClient.invalidateQueries({ queryKey: ["catalog"] }),
    ]);
}

export const useBlockUser = () => {
  const { blockUser } = useModerationApi();
  const refresh = useRefreshAfterBlockChange();
  return useMutation({ mutationFn: blockUser, onSettled: refresh });
};

export const useUnblockUser = () => {
  const { unblockUser } = useModerationApi();
  const refresh = useRefreshAfterBlockChange();
  return useMutation({ mutationFn: unblockUser, onSettled: refresh });
};

export const useReport = () => {
  const { report } = useModerationApi();
  return useMutation({ mutationFn: report });
};
