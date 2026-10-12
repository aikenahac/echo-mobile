import {
  type AddBookRequest,
  type LibraryResponse,
  type ReadingStatus,
  AddBookResponseSchema,
  LibraryResponseSchema,
  MutationResponseSchema,
} from "@/lib/schemas";
import { Endpoints } from "./endpoints";
import { handleApiResponse } from "./errors";
import { useFetch } from "./fetch-wrapper";

export function useLibraryApi() {
  const { authenticatedFetch } = useFetch();

  const json = (method: string, body: unknown) => ({ method, body: JSON.stringify(body) });

  /** GET /books: the four shelves, each newest-added first */
  const getLibrary = async (): Promise<LibraryResponse> => {
    const response = await authenticatedFetch(Endpoints.library.get);
    return handleApiResponse(response, LibraryResponseSchema);
  };

  /**
   * PUT /books/{id}/progress. `pageCount` is applied first, so both can change in one call.
   * Server rules: reaching the total finishes the book; any other page above 0 moves it to reading.
   */
  const updateProgress = async (userBookId: string, body: { currentPage?: number; pageCount?: number }) => {
    const response = await authenticatedFetch(Endpoints.library.updateProgress(userBookId), json("PUT", body));
    return handleApiResponse(response, MutationResponseSchema);
  };

  const updateStatus = async (userBookId: string, status: ReadingStatus) => {
    const response = await authenticatedFetch(Endpoints.library.updateStatus(userBookId), json("PUT", { status }));
    return handleApiResponse(response, MutationResponseSchema);
  };

  const setFavorite = async (userBookId: string, isFavorite: boolean) => {
    const response = await authenticatedFetch(Endpoints.library.toggleFavorite(userBookId), json("PUT", { isFavorite }));
    return handleApiResponse(response, MutationResponseSchema);
  };

  const rate = async (userBookId: string, rating: number) => {
    const response = await authenticatedFetch(Endpoints.library.rate(userBookId), json("PUT", { rating }));
    return handleApiResponse(response, MutationResponseSchema);
  };

  const remove = async (userBookId: string) => {
    const response = await authenticatedFetch(Endpoints.library.remove(userBookId), { method: "DELETE" });
    return handleApiResponse(response, MutationResponseSchema);
  };

  /** POST /books → 201 { success, userBook }. 400 "Book already in your library" means stale data. */
  const add = async (body: AddBookRequest) => {
    const response = await authenticatedFetch(Endpoints.library.add, json("POST", body));
    return handleApiResponse(response, AddBookResponseSchema);
  };

  return { getLibrary, updateProgress, updateStatus, setFavorite, rate, remove, add };
}
