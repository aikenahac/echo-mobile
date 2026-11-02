import {
  type FeedResponse,
  type FollowListResponse,
  type OtherUserProfile,
  type ProfileShelf,
  type UserReviewsPage,
  type UserShelfPage,
  type ProfileStats,
  type SubscriptionResponse,
  type UploadUrlResponse,
  type UsernameAvailability,
  FeedResponseSchema,
  FollowListResponseSchema,
  MutationResponseSchema,
  OtherUserProfileSchema,
  ProfileStatsSchema,
  SubscriptionResponseSchema,
  UploadUrlResponseSchema,
  UsernameAvailabilitySchema,
  UserReviewsPageSchema,
  UserShelfPageSchema,
} from "@/lib/schemas";
import { Endpoints } from "./endpoints";
import { ApiRequestError, handleApiResponse } from "./errors";
import { useFetch } from "./fetch-wrapper";

export const USER_SHELF_PAGE_SIZE = 30;
export const USER_LIST_PAGE_SIZE = 20;

export type ImageContentType = "image/jpeg" | "image/png" | "image/webp";

export function useProfileApi() {
  const { authenticatedFetch } = useFetch();

  /** GET /profile/stats: books and pages this calendar year, counts by status */
  const getStats = async (): Promise<ProfileStats> =>
    handleApiResponse(await authenticatedFetch(Endpoints.profile.stats), ProfileStatsSchema);

  /** GET /subscriptions: the user's plan (use isPremium from /profile for gating) */
  const getSubscription = async (): Promise<SubscriptionResponse> =>
    handleApiResponse(await authenticatedFetch(Endpoints.subscriptions.get), SubscriptionResponseSchema);

  /** POST /subscriptions/sync: refresh the backend plan from RevenueCat */
  const syncSubscription = async (): Promise<SubscriptionResponse> =>
    handleApiResponse(await authenticatedFetch(Endpoints.subscriptions.sync, { method: "POST" }), SubscriptionResponseSchema);

  /** GET /profile/username-available (3+ characters; your own username counts as available) */
  const usernameAvailable = async (username: string): Promise<UsernameAvailability> => {
    const params = new URLSearchParams({ username });
    return handleApiResponse(await authenticatedFetch(`${Endpoints.profile.usernameAvailable}?${params}`), UsernameAvailabilitySchema);
  };

  /** GET /users/{id}: someone else's public profile */
  const getUser = async (userId: string): Promise<OtherUserProfile> =>
    handleApiResponse(await authenticatedFetch(Endpoints.users.get(userId)), OtherUserProfileSchema);

  /** GET /users/{id}/books: one of their shelves, a page at a time (404 when hidden) */
  const getUserShelf = async (userId: string, shelf: ProfileShelf, offset: number): Promise<UserShelfPage> => {
    const params = new URLSearchParams({ shelf, limit: String(USER_SHELF_PAGE_SIZE), offset: String(offset) });
    return handleApiResponse(await authenticatedFetch(`${Endpoints.users.books(userId)}?${params}`), UserShelfPageSchema);
  };

  /** GET /users/{id}/reviews: their reviews not marked private (404 when hidden) */
  const getUserReviews = async (userId: string, offset: number): Promise<UserReviewsPage> => {
    const params = new URLSearchParams({ limit: String(USER_LIST_PAGE_SIZE), offset: String(offset) });
    return handleApiResponse(await authenticatedFetch(`${Endpoints.users.reviews(userId)}?${params}`), UserReviewsPageSchema);
  };

  /** GET /users/{id}/followers or /following (404 when profile content is hidden) */
  const getFollowList = async (
    userId: string,
    direction: "followers" | "following",
    offset: number,
  ): Promise<FollowListResponse> => {
    const params = new URLSearchParams({ limit: String(USER_LIST_PAGE_SIZE), offset: String(offset) });
    return handleApiResponse(
      await authenticatedFetch(`${Endpoints.users[direction](userId)}?${params}`),
      FollowListResponseSchema,
    );
  };

  /** GET /users/{id}/activity: their activity, shaped like the feed (404 when hidden) */
  const getUserActivity = async (userId: string, offset: number): Promise<FeedResponse> => {
    const params = new URLSearchParams({ limit: String(USER_LIST_PAGE_SIZE), offset: String(offset) });
    return handleApiResponse(await authenticatedFetch(`${Endpoints.users.activity(userId)}?${params}`), FeedResponseSchema);
  };

  /** DELETE /profile: permanently deletes the account (sign out afterwards) */
  const deleteAccount = async () =>
    handleApiResponse(await authenticatedFetch(Endpoints.profile.delete, { method: "DELETE" }), MutationResponseSchema);

  /**
   * Profile picture upload (API.md §9): ask for a signed URL for this exact type and size,
   * PUT the bytes there without our Authorization header, and return the public URL to
   * save with PUT /profile.
   */
  const uploadProfilePicture = async (uri: string, contentType: ImageContentType): Promise<string> => {
    const file = await fetch(uri);
    const blob = await file.blob();
    const signed: UploadUrlResponse = await handleApiResponse(
      await authenticatedFetch(Endpoints.profile.pictureUploadUrl, {
        method: "POST",
        body: JSON.stringify({ contentType, fileSize: blob.size }),
      }),
      UploadUrlResponseSchema,
    );
    const put = await fetch(signed.uploadUrl, { method: "PUT", headers: { "Content-Type": contentType }, body: blob });
    if (!put.ok) throw new ApiRequestError(`Upload failed (${put.status})`, put.status);
    return signed.publicUrl;
  };

  return {
    getStats,
    getSubscription,
    syncSubscription,
    usernameAvailable,
    getUser,
    getUserShelf,
    getUserReviews,
    getFollowList,
    getUserActivity,
    deleteAccount,
    uploadProfilePicture,
  };
}
