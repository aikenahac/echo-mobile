import { queryKeys } from "@/hooks/query-keys";
import { useCollectionsApi } from "@/lib/api/collections";
import { useQuery } from "@tanstack/react-query";

/** GET /collections */
export const useCollections = () => {
  const { getCollections } = useCollectionsApi();
  return useQuery({ queryKey: queryKeys.collections, queryFn: getCollections });
};
