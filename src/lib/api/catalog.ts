import { type CatalogBookResponse, type SaveReviewRequest, CatalogBookResponseSchema, MutationResponseSchema } from "@/lib/schemas";
import { Endpoints } from "./endpoints";
import { handleApiResponse } from "./errors";
import { useFetch } from "./fetch-wrapper";

export function useCatalogApi() {
  const { authenticatedFetch } = useFetch();

  /** GET /catalog/{bookId}: the book, your entry and review, and reviews from people you follow */
  const getCatalogBook = async (bookId: string): Promise<CatalogBookResponse> => {
    const response = await authenticatedFetch(Endpoints.catalog.get(bookId));
    return handleApiResponse(response, CatalogBookResponseSchema);
  };

  /** POST /reviews creates your review or updates the existing one */
  const saveReview = async (body: SaveReviewRequest) => {
    const response = await authenticatedFetch(Endpoints.reviews.save, { method: "POST", body: JSON.stringify(body) });
    return handleApiResponse(response, MutationResponseSchema);
  };

  const deleteReview = async (reviewId: string) => {
    const response = await authenticatedFetch(Endpoints.reviews.delete(reviewId), { method: "DELETE" });
    return handleApiResponse(response, MutationResponseSchema);
  };

  return { getCatalogBook, saveReview, deleteReview };
}
