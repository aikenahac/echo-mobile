import { queryKeys } from "@/hooks/query-keys";
import { FEED_PAGE_SIZE, useFeedApi } from "@/lib/api/feed";
import { useInfiniteQuery } from "@tanstack/react-query";

/** Infinite feed on hasMore (offset max 1000) */
export const useFeed = () => {
  const { getFeed } = useFeedApi();
  return useInfiniteQuery({
    queryKey: queryKeys.feed,
    queryFn: ({ pageParam }) => getFeed(pageParam),
    initialPageParam: 0,
    getNextPageParam: (last, pages) => {
      const next = pages.length * FEED_PAGE_SIZE;
      return last.hasMore && next <= 1000 ? next : undefined;
    },
  });
};
