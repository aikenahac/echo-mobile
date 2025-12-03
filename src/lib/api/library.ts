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

  const updateCurrentPage = async (userBookId: string, currentPage: number) => {
    const response = await authenticatedFetch(
      Endpoints.books.updateProgress(userBookId),
      {
        method: "PUT",
        body: JSON.stringify({ currentPage }),
      },
    );

    return handleApiResponse(response);
  };

  const updatePageCount = async (userBookId: string, pageCount: number) => {
    const response = await authenticatedFetch(
      Endpoints.books.updateProgress(userBookId),
      {
        method: "PUT",
        body: JSON.stringify({ pageCount }),
      },
    );

    return handleApiResponse(response);
  };

  const toggleFavorite = async (userBookId: string, isFavorite: boolean) => {
    const response = await authenticatedFetch(
      Endpoints.books.toggleFavorite(userBookId),
      {
        method: "PUT",
        body: JSON.stringify({ isFavorite })
      }
    );

    return handleApiResponse(response);
  }

  return {
    getMyLibrary,
    updateCurrentPage,
    updatePageCount,
    toggleFavorite,
  };
}
