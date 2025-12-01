import { LibraryResponse, LibraryResponseSchema } from "../schemas";
import { Endpoints } from "./endpoints";
import { handleApiResponse } from "./errors";
import { useFetch } from "./fetch-wrapper";

export function useLibraryApi() {
  const { authenticatedFetch } = useFetch();

  const getMyLibrary = async (): Promise<LibraryResponse> => {
    const response = await authenticatedFetch(Endpoints.library.get);

    // Handle response with validation
    return handleApiResponse(response, LibraryResponseSchema);
  };

  return {
    getMyLibrary,
  };
}
