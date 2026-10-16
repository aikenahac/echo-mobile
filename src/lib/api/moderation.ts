import { type BlockedUsersResponse, type ReportRequest, BlockedUsersResponseSchema, MutationResponseSchema } from "@/lib/schemas";
import { Endpoints } from "./endpoints";
import { handleApiResponse } from "./errors";
import { useFetch } from "./fetch-wrapper";

export function useModerationApi() {
  const { authenticatedFetch } = useFetch();

  /** POST /social/block: hides you and them from each other and removes any follows */
  const blockUser = async (userId: string) => {
    const response = await authenticatedFetch(Endpoints.social.block, { method: "POST", body: JSON.stringify({ userId }) });
    return handleApiResponse(response, MutationResponseSchema);
  };

  const unblockUser = async (userId: string) => {
    const response = await authenticatedFetch(Endpoints.social.unblock(userId), { method: "DELETE" });
    return handleApiResponse(response, MutationResponseSchema);
  };

  /** GET /social/blocked: the people you blocked, newest first */
  const getBlockedUsers = async (): Promise<BlockedUsersResponse> => {
    const response = await authenticatedFetch(Endpoints.social.blocked);
    return handleApiResponse(response, BlockedUsersResponseSchema);
  };

  /** POST /reports: reporting the same user or review twice is not an error */
  const report = async (body: ReportRequest) => {
    const response = await authenticatedFetch(Endpoints.reports.create, { method: "POST", body: JSON.stringify(body) });
    return handleApiResponse(response, MutationResponseSchema);
  };

  return { blockUser, unblockUser, getBlockedUsers, report };
}
