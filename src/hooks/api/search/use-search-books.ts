import { queryKeys } from "@/hooks/query-keys";
import { BOOK_PAGE_SIZE, useSearchApi } from "@/lib/api/search";
import type { SearchResult } from "@/lib/schemas";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";

/** The same book can appear on two pages (catalog and Open Library overlap) */
export const searchResultKey = (r: SearchResult) =>
  r.id ?? r.key ?? r.isbn ?? `${r.title.toLowerCase()}|${r.author.toLowerCase()}`;

/** Infinite book search, 20 at a time, de-duplicated */
export const useSearchBooks = (q: string) => {
  const { searchBooks } = useSearchApi();
  const query = useInfiniteQuery({
    queryKey: queryKeys.searchBooks(q),
    queryFn: ({ pageParam }) => searchBooks(q, pageParam),
    initialPageParam: 0,
    // hasMore is a best guess (Open Library's size is unknown): also stop on an empty page
    getNextPageParam: (last) => (last.hasMore && last.results.length > 0 ? last.offset + BOOK_PAGE_SIZE : undefined),
    enabled: q.length > 0,
  });

  const results = useMemo(() => {
    const seen = new Set<string>();
    const all: Array<SearchResult> = [];
    for (const page of query.data?.pages ?? []) {
      for (const r of page.results) {
        const key = searchResultKey(r);
        if (seen.has(key)) continue;
        seen.add(key);
        all.push(r);
      }
    }
    return all;
  }, [query.data]);

  return { ...query, results };
};
