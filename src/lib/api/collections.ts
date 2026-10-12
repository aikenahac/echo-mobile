import { type Collection, CollectionsResponseSchema } from "@/lib/schemas";
import { Endpoints } from "./endpoints";
import { handleApiResponse } from "./errors";
import { useFetch } from "./fetch-wrapper";

export function useCollectionsApi() {
  const { authenticatedFetch } = useFetch();

  /** GET /collections: yours, ordered by sortOrder, each with books and bookCount */
  const getCollections = async (): Promise<Array<Collection>> => {
    const response = await authenticatedFetch(Endpoints.collections.getAll);
    return handleApiResponse(response, CollectionsResponseSchema);
  };

  return { getCollections };
}
