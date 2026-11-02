import { MutationResponseSchema } from "@/lib/schemas";
import { useCallback } from "react";
import { Endpoints } from "./endpoints";
import { handleApiResponse } from "./errors";
import { useFetch } from "./fetch-wrapper";

type PushPlatform = "ios" | "android";

export function useNotificationsApi() {
  const { authenticatedFetch } = useFetch();

  const registerToken = useCallback(
    async (token: string, platform: PushPlatform) =>
      handleApiResponse(
        await authenticatedFetch(Endpoints.notifications.token, {
          method: "POST",
          body: JSON.stringify({ token, platform }),
        }),
        MutationResponseSchema,
      ),
    [authenticatedFetch],
  );

  const unregisterToken = useCallback(
    async (token: string) =>
      handleApiResponse(
        await authenticatedFetch(Endpoints.notifications.token, {
          method: "DELETE",
          body: JSON.stringify({ token }),
        }),
        MutationResponseSchema,
      ),
    [authenticatedFetch],
  );

  return { registerToken, unregisterToken };
}
