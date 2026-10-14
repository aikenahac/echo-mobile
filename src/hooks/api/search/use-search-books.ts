import { queryKeys } from "@/hooks/query-keys";
import { useSearchApi } from "@/lib/api/search";
import { docToResult, normalizeQuery, OPEN_LIBRARY_PAGE_SIZE, searchOpenLibrary } from "@/lib/open-library";
import type { SearchResult } from "@/lib/schemas";
import { type InfiniteData, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

type SearchPage = { results: Array<SearchResult>; hasMore: boolean; page: number };

/** Work keys stay stable when ingest attaches a catalog id. */
export const searchResultKey = (r: SearchResult) =>
  r.key ?? r.id ?? r.isbn ?? `${r.title.toLowerCase()}|${r.author.toLowerCase()}`;

/** Every identity a result can be recognised by, for matching a catalog book to an Open Library result */
const identities = (r: SearchResult) => [
  ...(r.id ? [`id:${r.id}`] : []),
  ...(r.key ? [`key:${r.key}`] : []),
  ...(r.isbn ? [`isbn:${r.isbn}`] : []),
  `ta:${r.title.toLowerCase()}|${r.author.toLowerCase()}`,
];

/**
 * Identities that really are one book. Open Library lists distinct works that
 * share a title and author (or even an ISBN), so those must never be merged.
 */
const strongIdentities = (r: SearchResult) => [
  ...(r.id ? [`id:${r.id}`] : []),
  ...(r.key ? [`key:${r.key}`] : []),
];

/** Append `incoming` to `current`, in order, skipping books that are already there. */
function mergeResults(current: Array<SearchResult>, incoming: Array<SearchResult>) {
  const seen = new Set(current.flatMap(strongIdentities));
  const fresh = incoming.filter((r) => {
    const ids = strongIdentities(r);
    if (ids.length > 0 && ids.some((id) => seen.has(id))) return false;
    ids.forEach((id) => seen.add(id));
    return true;
  });
  return [...current, ...fresh];
}

/**
 * Open Library's results, exactly in Open Library's order. A catalog book that
 * is also one of those results keeps the Open Library position and just gains
 * its catalog id; catalog books Open Library didn't return follow after them.
 */
function rankResults(external: Array<SearchResult>, catalog: Array<SearchResult>) {
  const ranked = mergeResults([], external);
  const extras: Array<SearchResult> = [];
  for (const row of catalog) {
    const ids = identities(row);
    const match = ranked.find((r) => identities(r).some((id) => ids.includes(id)));
    if (match) {
      if (!match.id) match.id = row.id;
    } else {
      extras.push(row);
    }
  }
  return mergeResults(ranked, extras);
}

function attachIds(results: Array<SearchResult>, ids: Record<string, string>) {
  return results.map((r) => r.key && ids[r.key] ? { ...r, id: ids[r.key] } : r);
}

/** Infinite book search, 20 Open Library results per page, de-duplicated. */
export const useSearchBooks = (q: string) => {
  const { searchBooks, ingestSearch } = useSearchApi();
  const queryClient = useQueryClient();
  const queryKey = queryKeys.searchBooks(q);
  const query = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam, signal }): Promise<SearchPage> => {
      const stored = await searchBooks(q, pageParam, signal);
      if (stored.openLibrary.status === "hit") {
        return {
          results: rankResults(stored.openLibrary.results, stored.catalog),
          hasMore: pageParam < 50 && pageParam * OPEN_LIBRARY_PAGE_SIZE < stored.openLibrary.numFound,
          page: pageParam,
        };
      }

      let found;
      try {
        found = await searchOpenLibrary(q, pageParam, { signal });
      } catch (error) {
        if (signal.aborted) throw error;
        return { results: rankResults([], stored.catalog), hasMore: false, page: pageParam };
      }

      const page: SearchPage = {
        results: rankResults(found.docs.map(docToResult), stored.catalog),
        hasMore: pageParam < 50 && pageParam * OPEN_LIBRARY_PAGE_SIZE < found.numFound,
        page: pageParam,
      };
      void ingestSearch({ query: normalizeQuery(q), page: pageParam, numFound: found.numFound, docs: found.docs })
        .then(({ ids }) => {
          if (signal.aborted) return;
          // A fast ingest can finish before React Query stores this page.
          const cached = queryClient.getQueryData<InfiniteData<SearchPage, number>>(queryKey);
          if (!cached?.pages.includes(page)) page.results = attachIds(page.results, ids);
          queryClient.setQueryData<InfiniteData<SearchPage, number>>(queryKey, (data) => data && ({
            ...data,
            pages: data.pages.map((p) => ({ ...p, results: attachIds(p.results, ids) })),
          }));
        })
        .catch(() => {});
      return page;
    },
    initialPageParam: 1,
    getNextPageParam: (last) => last.hasMore ? last.page + 1 : undefined,
    enabled: normalizeQuery(q).length > 0,
  });

  const results = useMemo(() =>
    mergeResults([], query.data?.pages.flatMap((page) => page.results) ?? []),
  [query.data]);

  return { ...query, results };
};
