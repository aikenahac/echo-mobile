import { queryKeys } from "@/hooks/query-keys";
import { useLibraryApi } from "@/lib/api/library";
import { useQuery } from "@tanstack/react-query";

/** GET /books: the four shelves */
export const useLibrary = () => {
  const { getLibrary } = useLibraryApi();
  return useQuery({ queryKey: queryKeys.library, queryFn: getLibrary });
};
