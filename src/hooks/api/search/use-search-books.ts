import { useSearchApi } from "@/lib/api/search";
import { useInfiniteQuery } from "@tanstack/react-query";
import { searchQueryKeys } from "../../query-keys";

export const useSearchBooks = (query: string, limit: number = 20) => {
  const { searchBooks } = useSearchApi();

  return useInfiniteQuery({
    queryKey: searchQueryKeys.books(query),
    queryFn: ({ pageParam = 0 }) => searchBooks(query, pageParam, limit),
    getNextPageParam: (lastPage, allPages) => {
      // If we got fewer results than the limit, there are no more pages
      if (lastPage.length < limit) return undefined;

      // Calculate the next offset based on total results so far
      return allPages.reduce((acc, page) => acc + page.length, 0);
    },
    enabled: query.trim().length > 0,
    initialPageParam: 0,
  });
};
