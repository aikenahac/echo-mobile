import { queryKeys } from "@/hooks/query-keys";
import { useSearchApi } from "@/lib/api/search";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

/** Reader search; the endpoint has no offset, so "more" raises the limit (max 50) */
export const useSearchUsers = (q: string, limit: number) => {
  const { searchUsers } = useSearchApi();
  return useQuery({
    queryKey: [...queryKeys.searchUsers(q), limit],
    queryFn: () => searchUsers(q, limit),
    enabled: q.length >= 2,
    placeholderData: keepPreviousData,
  });
};
