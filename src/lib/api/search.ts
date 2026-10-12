import { type SearchResponse, type UserSearchResponse, MutationResponseSchema, SearchResponseSchema, UserSearchResponseSchema } from "@/lib/schemas";
import { Endpoints } from "./endpoints";
import { ApiRequestError, handleApiResponse } from "./errors";
import { useFetch } from "./fetch-wrapper";

export const BOOK_PAGE_SIZE = 20;

export function useSearchApi() {
  const { authenticatedFetch } = useFetch();

  /** GET /books/search: the Echo catalog first, then Open Library */
  const searchBooks = async (q: string, offset: number): Promise<SearchResponse> => {
    const params = new URLSearchParams({ q, offset: String(offset), limit: String(BOOK_PAGE_SIZE) });
    const response = await authenticatedFetch(`${Endpoints.library.search}?${params}`);
    return handleApiResponse(response, SearchResponseSchema);
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

  return { searchBooks, searchUsers, follow, unfollow };
}
