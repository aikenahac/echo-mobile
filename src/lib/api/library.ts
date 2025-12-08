import {
  AddBookToLibraryResponseSchema,
  LibraryResponse,
  LibraryResponseSchema,
  RateBookResponse,
  RateBookResponseSchema,
  ReadingStatus,
  UserBookSchema,
} from "../schemas";
import { SearchResult, UserBook } from "../types";
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

  const addBookToLibrary = async (
    bookData: SearchResult,
    status: ReadingStatus,
    isFavorite: boolean = false
  ) => {
    const response = await authenticatedFetch(Endpoints.library.add, {
      method: "POST",
      body: JSON.stringify({
        bookData: {
          isbn: bookData.isbn,
          title: bookData.title,
          author: bookData.author,
          coverUrl: bookData.coverUrl,
          pages: bookData.pages,
          publishedYear: bookData.publishedYear,
        },
        status,
        isFavorite,
      }),
    });

    const result = await handleApiResponse(response, AddBookToLibraryResponseSchema);

    if (result.error) {
      throw new Error(result.error);
    }

    return result;
  };

  const updateStatus = async (userBookId: string, status: ReadingStatus) => {
    const response = await authenticatedFetch(
      Endpoints.library.updateStatus(userBookId),
      {
        method: "PUT",
        body: JSON.stringify({ status }),
      }
    );

    return handleApiResponse(response);
  };

  return {
    getMyLibrary,
    updateCurrentPage,
    updatePageCount,
    toggleFavorite,
    getUserBook,
    rateBook,
    addBookToLibrary,
    updateStatus,
  };
}
