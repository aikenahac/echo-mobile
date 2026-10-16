import {
  type UpdateProfileRequest,
  type User,
  UpdateProfileResponseSchema,
  UserSchema,
} from '@/lib/schemas';
import { Endpoints } from './endpoints';
import { handleApiResponse } from './errors';
import { useFetch } from './fetch-wrapper';

export function useUsersApi() {
  const { authenticatedFetch } = useFetch();

  /** GET /profile: the signed-in user, with isPremium and planName */
  const getMe = async (): Promise<User> => {
    const response = await authenticatedFetch(Endpoints.profile.get);
    return handleApiResponse(response, UserSchema);
  };

  /**
   * PUT /profile is a partial update: send only the fields that changed.
   * `null` clears displayName, bio or profilePictureUrl; username can't be cleared.
   */
  const updateMe = async (changes: UpdateProfileRequest) => {
    const response = await authenticatedFetch(Endpoints.profile.update, {
      method: 'PUT',
      body: JSON.stringify(changes),
    });
    return handleApiResponse(response, UpdateProfileResponseSchema);
  };

  return { getMe, updateMe };
}
