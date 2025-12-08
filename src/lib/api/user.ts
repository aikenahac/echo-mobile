import { ProfileResponseSchema, type ProfileResponse } from '@/lib/schemas';
import { Endpoints } from './endpoints';
import { handleApiResponse } from './errors';
import { useFetch } from './fetch-wrapper';

export function useUsersApi() {
  const { authenticatedFetch } = useFetch();

  /**
   * Get current user's profile
   * @returns User profile with optional stats
   * @throws {ApiRequestError} When the API request fails
   * @throws {ValidationError} When response validation fails
   */
  const getMe = async (): Promise<ProfileResponse> => {
    const response = await authenticatedFetch(Endpoints.profile.get);

    console.log("me response")
    const body = await response.json()
    console.log({ body })

    // Handle response with validation
    return handleApiResponse(response, ProfileResponseSchema);
  };

  /**
   * Update current user's profile
   * @param {}
   * @returns User profile with optional stats
   * @throws {ApiRequestError} When the API request fails
   * @throws {ValidationError} When response validation fails
   */
  const updateMe = async ({ username, bio }: UpdateUserParams) => {
    const response = await authenticatedFetch(Endpoints.profile.update, {
      method: "PUT",
      body: JSON.stringify({ username, bio })
    });

    return handleApiResponse(response);
  }

  return {
    getMe,
    updateMe,
  };
}

export type UpdateUserParams = {
  username: string;
  bio: string;
}