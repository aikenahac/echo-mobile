import {
  LibraryResponse,
  LibraryResponseSchema,
  RateBookResponse,
  RateBookResponseSchema,
  UserBookSchema,
} from "../schemas";
import { UserBook } from "../types";
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

  const getUserBook = async (userBookId: string): Promise<UserBook> => {
    const response = await authenticatedFetch(Endpoints.library.getById(userBookId));

    return handleApiResponse(response, UserBookSchema);
  }

  const updateCurrentPage = async (userBookId: string, currentPage: number) => {
    const response = await authenticatedFetch(
      Endpoints.library.updateProgress(userBookId),
      {
        method: "PUT",
        body: JSON.stringify({ currentPage }),
      },
    );

    return handleApiResponse(response);
  };

  const updatePageCount = async (userBookId: string, pageCount: number) => {
    const response = await authenticatedFetch(
      Endpoints.library.updateProgress(userBookId),
      {
        method: "PUT",
        body: JSON.stringify({ pageCount }),
      },
    );

    return handleApiResponse(response);
  };

  const toggleFavorite = async (userBookId: string, isFavorite: boolean) => {
    const response = await authenticatedFetch(
      Endpoints.library.toggleFavorite(userBookId),
      {
        method: "PUT",
        body: JSON.stringify({ isFavorite })
      }
    );

    return handleApiResponse(response);
  };

  const rateBook = async (
    userBookId: string,
    rating: number
  ): Promise<RateBookResponse> => {
    const response = await authenticatedFetch(
      Endpoints.library.rate(userBookId),
      {
        method: "PUT",
        body: JSON.stringify({ rating }),
      }
    );

    return handleApiResponse(response, RateBookResponseSchema);
  };

  return {
    getMyLibrary,
    updateCurrentPage,
    updatePageCount,
    toggleFavorite,
    getUserBook,
    rateBook,
  };
}
