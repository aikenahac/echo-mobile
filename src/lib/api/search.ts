import { SearchResponse, SearchResponseSchema } from "../schemas";
import { Endpoints } from "./endpoints";
import { handleApiResponse } from "./errors";
import { useFetch } from "./fetch-wrapper";

export function useSearchApi() {
  const { authenticatedFetch } = useFetch();

  const searchBooks = async (
    query: string,
    offset: number = 0,
    limit: number = 20
  ): Promise<SearchResponse> => {
    const params = new URLSearchParams({
      q: query,
      offset: offset.toString(),
      limit: limit.toString(),
    });

    const response = await authenticatedFetch(
      `${Endpoints.library.search}?${params.toString()}`
    );

    return handleApiResponse(response, SearchResponseSchema);
  };

  return {
    searchBooks,
  };
}
