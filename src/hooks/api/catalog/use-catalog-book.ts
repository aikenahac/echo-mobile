import { queryKeys } from "@/hooks/query-keys";
import { useCatalogApi } from "@/lib/api/catalog";
import { useQuery } from "@tanstack/react-query";

/** Book detail by catalog id */
export const useCatalogBook = (bookId: string) => {
  const { getCatalogBook } = useCatalogApi();
  return useQuery({ queryKey: queryKeys.catalog(bookId), queryFn: () => getCatalogBook(bookId), enabled: !!bookId });
};
