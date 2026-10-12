import { type FeedResponse, FeedResponseSchema } from "@/lib/schemas";
import { Endpoints } from "./endpoints";
import { handleApiResponse } from "./errors";
import { useFetch } from "./fetch-wrapper";

export const FEED_PAGE_SIZE = 20;

export function useFeedApi() {
  const { authenticatedFetch } = useFetch();

  /** GET /feed: what people you follow started, finished and reviewed, newest first */
  const getFeed = async (offset: number): Promise<FeedResponse> => {
    const params = new URLSearchParams({ limit: String(FEED_PAGE_SIZE), offset: String(offset) });
    const response = await authenticatedFetch(`${Endpoints.feed.get}?${params}`);
    return handleApiResponse(response, FeedResponseSchema);
  };

  return { getFeed };
}
