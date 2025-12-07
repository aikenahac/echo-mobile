import {
  CreateReviewResponse,
  CreateReviewResponseSchema,
  DeleteReviewResponse,
  DeleteReviewResponseSchema,
  ReviewsResponse,
  ReviewsResponseSchema,
  UpdateReviewResponse,
  UpdateReviewResponseSchema,
} from "../schemas";
import { Endpoints } from "./endpoints";
import { handleApiResponse } from "./errors";
import { useFetch } from "./fetch-wrapper";

export function useReviewsApi() {
  const { authenticatedFetch } = useFetch();

  const getBookReviews = async (bookId: string): Promise<ReviewsResponse> => {
    const response = await authenticatedFetch(
      `${Endpoints.reviews.getAll}?bookId=${bookId}`
    );
    return handleApiResponse(response, ReviewsResponseSchema);
  };

  const createReview = async (
    bookId: string,
    content: string,
    isPrivate: boolean = false
  ): Promise<CreateReviewResponse> => {
    const response = await authenticatedFetch(Endpoints.reviews.create, {
      method: "POST",
      body: JSON.stringify({ bookId, content, isPrivate }),
    });
    return handleApiResponse(response, CreateReviewResponseSchema);
  };

  const updateReview = async (
    reviewId: string,
    data: { content?: string; isPrivate?: boolean }
  ): Promise<UpdateReviewResponse> => {
    const response = await authenticatedFetch(
      Endpoints.reviews.update(reviewId),
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
    return handleApiResponse(response, UpdateReviewResponseSchema);
  };

  const deleteReview = async (
    reviewId: string
  ): Promise<DeleteReviewResponse> => {
    const response = await authenticatedFetch(
      Endpoints.reviews.delete(reviewId),
      {
        method: "DELETE",
      }
    );
    return handleApiResponse(response, DeleteReviewResponseSchema);
  };

  return {
    getBookReviews,
    createReview,
    updateReview,
    deleteReview,
  };
}
