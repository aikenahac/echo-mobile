import {
  type OtherUserProfile,
  type ProfileStats,
  type SubscriptionResponse,
  type UploadUrlResponse,
  type UsernameAvailability,
  MutationResponseSchema,
  OtherUserProfileSchema,
  ProfileStatsSchema,
  SubscriptionResponseSchema,
  UploadUrlResponseSchema,
  UsernameAvailabilitySchema,
} from "@/lib/schemas";
import { Endpoints } from "./endpoints";
import { ApiRequestError, handleApiResponse } from "./errors";
import { useFetch } from "./fetch-wrapper";

export type ImageContentType = "image/jpeg" | "image/png" | "image/webp";

export function useProfileApi() {
  const { authenticatedFetch } = useFetch();

  /** GET /profile/stats: books and pages this calendar year, counts by status */
  const getStats = async (): Promise<ProfileStats> =>
    handleApiResponse(await authenticatedFetch(Endpoints.profile.stats), ProfileStatsSchema);

  /** GET /subscriptions: the user's plan (use isPremium from /profile for gating) */
  const getSubscription = async (): Promise<SubscriptionResponse> =>
    handleApiResponse(await authenticatedFetch(Endpoints.subscriptions.get), SubscriptionResponseSchema);

  /** GET /profile/username-available (3+ characters; your own username counts as available) */
  const usernameAvailable = async (username: string): Promise<UsernameAvailability> => {
    const params = new URLSearchParams({ username });
    return handleApiResponse(await authenticatedFetch(`${Endpoints.profile.usernameAvailable}?${params}`), UsernameAvailabilitySchema);
  };

  /** GET /users/{id}: someone else's public profile */
  const getUser = async (userId: string): Promise<OtherUserProfile> =>
    handleApiResponse(await authenticatedFetch(Endpoints.users.get(userId)), OtherUserProfileSchema);

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

  return { getStats, getSubscription, usernameAvailable, getUser, deleteAccount, uploadProfilePicture };
}
