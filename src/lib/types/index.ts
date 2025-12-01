// ============================================================================
// ENUMS
// ============================================================================

import { LibraryResponse } from "../schemas";

export type ReadingStatus = "want" | "reading" | "finished";

export type UserRole = "user" | "moderator" | "admin";

export type BillingInterval = "month" | "year" | "lifetime" | "free";

export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "unpaid"
  | "trialing"
  | "incomplete";

// ============================================================================
// DATABASE MODELS
// ============================================================================

export interface User {
  id: string; // Clerk user ID
  email: string;
  username: string | null;
  bio: string | null;
  role: UserRole;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Book {
  id: string; // UUID
  isbn: string | null;
  title: string;
  author: string;
  coverUrl: string | null;
  pages: number | null;
  publishedYear: number | null;
  createdAt: Date | string;
}

export interface UserBookWithoutBook {
  id: string; // UUID
  userId: string;
  bookId: string;
  status: ReadingStatus;
  currentPage: number | null;
  pageCount: number | null;
  rating: number | null; // 1-5
  isFavorite: boolean;
  startedAt: Date | string | null;
  finishedAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Review {
  id: string; // UUID
  userId: string;
  bookId: string;
  content: string;
  isPrivate: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Follow {
  followerId: string;
  followingId: string;
  createdAt: Date | string;
}

export interface AuditLog {
  id: string; // UUID
  userId: string;
  action: string;
  targetId: string | null;
  targetType: string | null;
  metadata: string | null; // JSON string
  createdAt: Date | string;
}

export interface SubscriptionPlan {
  id: string; // UUID
  name: string;
  stripePriceId: string | null;
  stripeProductId: string | null;
  price: number; // Price in cents
  interval: BillingInterval;
  features: string | null; // JSON string
  isActive: boolean;
  isInternal: boolean;
  sortOrder: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface UserSubscription {
  id: string; // UUID
  userId: string;
  planId: string;
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;
  status: SubscriptionStatus;
  currentPeriodStart: Date | string | null;
  currentPeriodEnd: Date | string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface SubscriptionUsage {
  id: string; // UUID
  userId: string;
  periodStart: Date | string;
  periodEnd: Date | string;
  booksAdded: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Collection {
  id: string; // UUID
  userId: string;
  name: string;
  description: string | null;
  slug: string;
  colorTag: string | null;
  iconName: string | null;
  coverImageUrl: string | null;
  isPublic: boolean;
  sortOrder: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CollectionBook {
  id: string; // UUID
  collectionId: string;
  userBookId: string;
  addedAt: Date | string;
  notes: string | null;
}

export interface CollectionFollow {
  userId: string;
  collectionId: string;
  createdAt: Date | string;
}

// ============================================================================
// COMPOSITE TYPES (with relations)
// ============================================================================

export interface UserBook extends UserBookWithoutBook {
  book: Book;
}

export interface UserBookWithDetails extends UserBookWithoutBook {
  book: Book;
  user: User;
}

export interface ReviewWithUser extends Review {
  user: User;
}

export interface ReviewWithBook extends Review {
  book: Book;
}

export interface ReviewWithDetails extends Review {
  user: User;
  book: Book;
}

export interface UserWithStats extends User {
  _count?: {
    followers?: number;
    following?: number;
    userBooks?: number;
    reviews?: number;
  };
}

export interface CollectionWithBooks extends Collection {
  books: Array<
    CollectionBook & {
      userBook: UserBook;
    }
  >;
  _count?: {
    books?: number;
    follows?: number;
  };
}

export interface UserSubscriptionWithPlan extends UserSubscription {
  plan: SubscriptionPlan;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface ApiError {
  error: string;
  limitReached?: boolean;
  usage?: {
    current: number;
    limit: number;
  };
}

export type ApiResponse<T> = T | ApiError;

// Book search/add types
export interface NormalizedBook {
  isbn: string | null;
  title: string;
  author: string;
  coverUrl: string | null;
  pages: number | null;
  publishedYear: number | null;
}

export interface AddBookToLibraryRequest {
  bookData: NormalizedBook;
  status: ReadingStatus;
}

export interface AddBookToLibraryResponse {
  success?: boolean;
  userBook?: UserBookWithoutBook;
  error?: string;
  limitReached?: boolean;
  usage?: {
    current: number;
    limit: number;
  };
}

// Reading progress types
export interface UpdateReadingProgressRequest {
  userBookId: string;
  currentPage: number;
  status?: ReadingStatus;
}

export interface UpdateReadingProgressResponse {
  success: boolean;
  userBook?: UserBookWithoutBook;
  error?: string;
}

// Review types
export interface CreateReviewRequest {
  bookId: string;
  content: string;
  isPrivate?: boolean;
}

export interface UpdateReviewRequest {
  reviewId: string;
  content?: string;
  isPrivate?: boolean;
}

// Follow types
export interface FollowUserRequest {
  userId: string;
}

export interface FollowUserResponse {
  success: boolean;
  error?: string;
}

// Collection types
export interface CreateCollectionRequest {
  name: string;
  description?: string;
  isPublic?: boolean;
  colorTag?: string;
  iconName?: string;
}

export interface UpdateCollectionRequest {
  collectionId: string;
  name?: string;
  description?: string;
  isPublic?: boolean;
  colorTag?: string;
  iconName?: string;
}

export interface AddBookToCollectionRequest {
  collectionId: string;
  userBookId: string;
  notes?: string;
}

// Subscription types
export interface SubscriptionLimits {
  maxBooksPerYear: number;
}

export interface SubscriptionUsageCheck {
  allowed: boolean;
  reason?: string;
  usage?: {
    current: number;
    limit: number;
  };
}

// ============================================================================
// UTILITY TYPES
// ============================================================================
export type LibraryViews = "grid" | "list";
export type LibraryTabsRaw = "favorites" | "want" | "reading" | "finished";
export type LibraryTabs = LibraryTabsRaw | "collection"

export const LibraryTabsApiMap: Record<LibraryTabs, keyof LibraryResponse | "collection"> = {
  "favorites": "favoriteBooks",
  "want": "wantToRead",
  "reading": "currentlyReading",
  "finished": "finished",
  "collection": "collection"
}

export type DateString = string; // ISO 8601 date string

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: Array<T>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SearchParams extends PaginationParams {
  query?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// ============================================================================
// HELPER TYPE GUARDS
// ============================================================================

export function isApiError(response: unknown): response is ApiError {
  return (
    typeof response === "object" &&
    response !== null &&
    "error" in response &&
    typeof (response as ApiError).error === "string"
  );
}

export function hasLimitReached(
  response: unknown,
): response is Required<ApiError> {
  return isApiError(response) && response.limitReached === true;
}
