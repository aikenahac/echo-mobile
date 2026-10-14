import { type SearchIngestRequest, type SearchIngestResponse, type SearchResponse, type UserSearchResponse, MutationResponseSchema, SearchIngestResponseSchema, SearchResponseSchema, UserSearchResponseSchema } from "@/lib/schemas";
import { Endpoints } from "./endpoints";
import { ApiRequestError, handleApiResponse } from "./errors";
import { useFetch } from "./fetch-wrapper";

export function useSearchApi() {
  const { authenticatedFetch } = useFetch();

  /** GET /books/search: catalog matches and a stored Open Library page */
  const searchBooks = async (q: string, page: number, signal?: AbortSignal): Promise<SearchResponse> => {
    const params = new URLSearchParams({ q, page: String(page) });
    const response = await authenticatedFetch(`${Endpoints.library.search}?${params}`, { signal });
    return handleApiResponse(response, SearchResponseSchema);
  };

  const ingestSearch = async (body: SearchIngestRequest): Promise<SearchIngestResponse> => {
    const response = await authenticatedFetch(Endpoints.library.searchIngest, { method: "POST", body: JSON.stringify(body) });
    return handleApiResponse(response, SearchIngestResponseSchema);
  };

  /** GET /users/search (2+ characters). No offset: raise `limit` (max 50) for more. */
  const searchUsers = async (q: string, limit: number): Promise<UserSearchResponse> => {
    const params = new URLSearchParams({ q, limit: String(limit) });
    const response = await authenticatedFetch(`${Endpoints.users.search}?${params}`);
    return handleApiResponse(response, UserSearchResponseSchema);
  };

  /** POST /social/follow. "Already following this user" counts as success. */
  const follow = async (userId: string) => {
    const response = await authenticatedFetch(Endpoints.social.follow, { method: "POST", body: JSON.stringify({ userId }) });
    try {
      return await handleApiResponse(response, MutationResponseSchema);
    } catch (e) {
      if (e instanceof ApiRequestError && /already following/i.test(e.message)) return { success: true };
      throw e;
    }
  };

  const unfollow = async (userId: string) => {
    const response = await authenticatedFetch(Endpoints.social.unfollow(userId), { method: "DELETE" });
    return handleApiResponse(response, MutationResponseSchema);
  };

  return { searchBooks, ingestSearch, searchUsers, follow, unfollow };
}
