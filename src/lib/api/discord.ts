import { MutationResponseSchema } from "@/lib/schemas";
import { useCallback } from "react";
import { z } from "zod";
import { Endpoints } from "./endpoints";
import { handleApiResponse } from "./errors";
import { useFetch } from "./fetch-wrapper";

const ConnectResponseSchema = z.object({ url: z.string() });

/** Link / unlink the Discord account (community roles) */
export function useDiscordApi() {
  const { authenticatedFetch } = useFetch();

  const connectUrl = useCallback(
    async () => handleApiResponse(await authenticatedFetch(Endpoints.discord, { method: "POST" }), ConnectResponseSchema),
    [authenticatedFetch],
  );

  const disconnect = useCallback(
    async () => handleApiResponse(await authenticatedFetch(Endpoints.discord, { method: "DELETE" }), MutationResponseSchema),
    [authenticatedFetch],
  );

  return { connectUrl, disconnect };
}
