import { OpenLibraryDocSchema, type OpenLibraryDoc } from "@/lib/open-library";
import { z } from "zod";

/*
 * Runtime schemas for the /api/v1 responses (design/redesign/API.md, and
 * echo/docs/mobile-handoff.md §6). Dates arrive as ISO strings.
 * Other users always come back as PublicUser (no email or role).
 */

const Timestamp = z.string();

// ============================================================================
// ENUMS
// ============================================================================

export const ReadingStatusSchema = z.enum(["want", "reading", "finished"]);
export const UserRoleSchema = z.enum(["user", "moderator", "admin"]);
export const BillingIntervalSchema = z.enum(["month", "year", "lifetime", "free"]);
export const SubscriptionSourceSchema = z.enum(["lemonsqueezy", "app_store", "play_store", "manual"]);
export const SubscriptionStatusSchema = z.enum([
  "active",
  "canceled",
  "past_due",
  "unpaid",
  "trialing",
  "incomplete",
]);

// ============================================================================
// PEOPLE
// ============================================================================

/** The signed-in user (GET /profile) */
export const UserSchema = z.object({
  id: z.string(),
  email: z.string(),
  username: z.string().nullable(),
  displayName: z.string().nullable(),
  bio: z.string().nullable(),
  profilePictureUrl: z.string().nullable(),
  profilePictureBlurhash: z.string().nullable().optional(),
  role: UserRoleSchema,
  isPremium: z.boolean(),
  planName: z.string().nullable(),
  createdAt: Timestamp,
  updatedAt: Timestamp,
});

/** Anyone else */
export const PublicUserSchema = z.object({
  id: z.string(),
  username: z.string().nullable(),
  displayName: z.string().nullable(),
  profilePictureUrl: z.string().nullable(),
  profilePictureBlurhash: z.string().nullable().optional(),
  /** System administrator (sparkle badge); optional until every server sends it */
  isAdmin: z.boolean().optional(),
});

// ============================================================================
// BOOKS
// ============================================================================

export const BookSchema = z.object({
  id: z.string(),
  isbn: z.string().nullable(),
  title: z.string(),
  author: z.string(),
  coverUrl: z.string().nullable(),
  /** 0 or null means unknown */
  pages: z.number().int().nonnegative().nullable(),
  publishedYear: z.number().int().nullable(),
  createdAt: Timestamp.optional(),
});

export const UserBookWithoutBookSchema = z.object({
  id: z.string(),
  userId: z.string(),
  bookId: z.string(),
  status: ReadingStatusSchema,
  currentPage: z.number().int().nonnegative().nullable(),
  /** 0 or null means unknown; falls back to book.pages */
  pageCount: z.number().int().nonnegative().nullable(),
  rating: z.number().int().min(1).max(5).nullable(),
  isFavorite: z.boolean(),
  startedAt: Timestamp.nullable(),
  finishedAt: Timestamp.nullable(),
  createdAt: Timestamp,
  updatedAt: Timestamp,
});

export const UserBookSchema = UserBookWithoutBookSchema.extend({
  book: BookSchema,
});

export const LibraryResponseSchema = z.object({
  favoriteBooks: z.array(UserBookSchema),
  wantToRead: z.array(UserBookSchema),
  currentlyReading: z.array(UserBookSchema),
  finished: z.array(UserBookSchema),
});

export const AddBookRequestSchema = z.object({
  book: z.union([
    z.object({ bookId: z.string() }),
    z.object({ openLibrary: OpenLibraryDocSchema }),
  ]),
  status: ReadingStatusSchema,
  isFavorite: z.boolean().optional(),
});

export const AddBookResponseSchema = z.object({
  success: z.boolean(),
  userBook: UserBookWithoutBookSchema,
});

export const MutationResponseSchema = z.object({ success: z.boolean() }).loose();

/** PUT /profile: echoes the photo (and its blurhash) when profilePictureUrl was set */
export const UpdateProfileResponseSchema = z.object({
  success: z.boolean(),
  profilePictureUrl: z.string().nullable().optional(),
  profilePictureBlurhash: z.string().nullable().optional(),
});

// ============================================================================
// REVIEWS
// ============================================================================

export const REVIEW_MAX_LENGTH = 10000;

export const ReviewSchema = z.object({
  id: z.string(),
  userId: z.string(),
  bookId: z.string(),
  content: z.string(),
  isPrivate: z.boolean(),
  createdAt: Timestamp,
  updatedAt: Timestamp,
});

export const ReviewWithUserSchema = ReviewSchema.extend({
  user: PublicUserSchema,
});

export const SaveReviewRequestSchema = z.object({
  bookId: z.string(),
  content: z.string().min(1).max(REVIEW_MAX_LENGTH),
  isPrivate: z.boolean(),
});

// ============================================================================
// CATALOG (book detail)
// ============================================================================

export const CatalogBookResponseSchema = z.object({
  book: BookSchema,
  userBook: UserBookWithoutBookSchema.nullable(),
  myReview: ReviewSchema.nullable(),
  followingReviews: z.array(ReviewWithUserSchema),
});

// ============================================================================
// SEARCH
// ============================================================================

export const SearchResultSchema = z.object({
  id: z.string().optional(),
  key: z.string().optional(),
  isbn: z.string().nullable(),
  title: z.string(),
  author: z.string(),
  coverUrl: z.string().nullable(),
  pages: z.number().int().nonnegative().nullable(),
  publishedYear: z.number().int().nullable(),
  source: z.enum(["internal", "external"]),
});

export const SearchResponseSchema = z.object({
  catalog: z.array(SearchResultSchema),
  openLibrary: z.discriminatedUnion("status", [
    z.object({
      status: z.literal("hit"),
      results: z.array(SearchResultSchema),
      numFound: z.number().int().nonnegative(),
    }),
    z.object({ status: z.literal("miss") }),
  ]),
});

export const SearchIngestResponseSchema = z.object({
  ids: z.record(z.string(), z.string()),
});

export const ReaderSchema = PublicUserSchema.extend({
  bio: z.string().nullable(),
  isFollowing: z.boolean(),
});

export const UserSearchResponseSchema = z.object({
  results: z.array(ReaderSchema),
  hasMore: z.boolean(),
  total: z.number().int().optional(),
  query: z.string().optional(),
});

// ============================================================================
// BLOCKS & REPORTS
// ============================================================================

export const BlockedUsersResponseSchema = z.object({ users: z.array(PublicUserSchema) });

export const REPORT_REASONS = ["spam", "harassment", "hate", "inappropriate", "other"] as const;
export const ReportReasonSchema = z.enum(REPORT_REASONS);
export const ReportTargetTypeSchema = z.enum(["user", "review"]);

export const ReportRequestSchema = z.object({
  targetType: ReportTargetTypeSchema,
  targetId: z.string(),
  reason: ReportReasonSchema,
  details: z.string().max(500).optional(),
});

// ============================================================================
// FEED
// ============================================================================

export const FeedBookItemSchema = z.object({
  type: z.literal("book"),
  date: Timestamp,
  user: PublicUserSchema,
  book: BookSchema,
  data: z.object({
    status: z.enum(["reading", "finished"]),
    rating: z.number().int().nullable(),
    currentPage: z.number().int().nullable(),
    startedAt: Timestamp.nullable(),
    finishedAt: Timestamp.nullable(),
  }),
});

export const FeedReviewItemSchema = z.object({
  type: z.literal("review"),
  date: Timestamp,
  user: PublicUserSchema,
  book: BookSchema,
  data: z.object({
    /** Review id, needed to report it; optional until every server sends it */
    id: z.string().optional(),
    content: z.string(),
    isPrivate: z.boolean(),
  }),
});

export const FeedItemSchema = z.discriminatedUnion("type", [FeedBookItemSchema, FeedReviewItemSchema]);

export const FeedResponseSchema = z.object({
  activities: z.array(FeedItemSchema),
  hasMore: z.boolean(),
  limit: z.number().int().optional(),
  offset: z.number().int().optional(),
});

// ============================================================================
// PROFILE
// ============================================================================

export const ProfileStatsSchema = z.object({
  booksFinishedThisYear: z.number().int(),
  pagesReadThisYear: z.number().int(),
  totalBooks: z.number().int(),
  countsByStatus: z.object({
    want: z.number().int(),
    reading: z.number().int(),
    finished: z.number().int(),
  }),
  favoritesCount: z.number().int(),
});

export const UpdateProfileRequestSchema = z
  .object({
    username: z.string(),
    displayName: z.string().nullable(),
    bio: z.string().nullable(),
    profilePictureUrl: z.string().nullable(),
  })
  .partial();

export const UsernameAvailabilitySchema = z.object({
  available: z.boolean(),
  reason: z.string().optional(),
});

export const UploadUrlResponseSchema = z.object({
  uploadUrl: z.string(),
  publicUrl: z.string(),
  expiresIn: z.number(),
});

export const OtherUserProfileSchema = z.object({
  user: PublicUserSchema.extend({ bio: z.string().nullable() }),
  stats: z.object({
    booksFinishedThisYear: z.number().int(),
    finishedCount: z.number().int(),
  }),
  followerCount: z.number().int(),
  followingCount: z.number().int(),
  isFollowing: z.boolean(),
  currentlyReading: z.array(UserBookSchema),
  recentlyFinished: z.array(UserBookSchema),
  favorites: z.array(UserBookSchema),
  publicCollections: z.array(z.lazy(() => CollectionSummarySchema)),
});

// ============================================================================
// COLLECTIONS
// ============================================================================

export const CollectionSummarySchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  slug: z.string(),
  colorTag: z.string().nullable(),
  iconName: z.string().nullable(),
  coverImageUrl: z.string().nullable(),
  isPublic: z.boolean(),
  sortOrder: z.number().int(),
  createdAt: Timestamp,
  updatedAt: Timestamp,
  bookCount: z.number().int().optional(),
});

export const CollectionSchema = CollectionSummarySchema.extend({
  bookCount: z.number().int(),
  books: z.array(UserBookSchema),
});

export const CollectionsResponseSchema = z.array(CollectionSchema);

// ============================================================================
// SUBSCRIPTIONS
// ============================================================================

export const SubscriptionPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().int().nonnegative(),
  interval: BillingIntervalSchema,
});

export const SubscriptionResponseSchema = z.object({
  subscription: z
    .object({
      id: z.string(),
      status: SubscriptionStatusSchema,
      source: SubscriptionSourceSchema.optional(),
      currentPeriodStart: Timestamp.nullable(),
      currentPeriodEnd: Timestamp.nullable(),
      cancelAtPeriodEnd: z.boolean(),
    })
    .nullable(),
  plan: SubscriptionPlanSchema.nullable(),
  isActive: z.boolean(),
  isFree: z.boolean(),
});

// ============================================================================
// ERRORS
// ============================================================================

export const ApiErrorSchema = z.object({ error: z.string() });

// ============================================================================
// TYPES
// ============================================================================

export type ReadingStatus = z.infer<typeof ReadingStatusSchema>;
export type User = z.infer<typeof UserSchema>;
export type PublicUser = z.infer<typeof PublicUserSchema>;
export type Book = z.infer<typeof BookSchema>;
export type UserBookWithoutBook = z.infer<typeof UserBookWithoutBookSchema>;
export type UserBook = z.infer<typeof UserBookSchema>;
export type LibraryResponse = z.infer<typeof LibraryResponseSchema>;
export type AddBookRequest = z.infer<typeof AddBookRequestSchema>;
export type Review = z.infer<typeof ReviewSchema>;
export type ReviewWithUser = z.infer<typeof ReviewWithUserSchema>;
export type SaveReviewRequest = z.infer<typeof SaveReviewRequestSchema>;
export type CatalogBookResponse = z.infer<typeof CatalogBookResponseSchema>;
export type SearchResult = z.infer<typeof SearchResultSchema> & { doc?: OpenLibraryDoc };
export type SearchResponse = z.infer<typeof SearchResponseSchema>;
export type SearchIngestRequest = { query: string; page: number; numFound: number; docs: Array<OpenLibraryDoc> };
export type SearchIngestResponse = z.infer<typeof SearchIngestResponseSchema>;
export type BlockedUsersResponse = z.infer<typeof BlockedUsersResponseSchema>;
export type ReportReason = z.infer<typeof ReportReasonSchema>;
export type ReportTargetType = z.infer<typeof ReportTargetTypeSchema>;
export type ReportRequest = z.infer<typeof ReportRequestSchema>;
export type Reader = z.infer<typeof ReaderSchema>;
export type UserSearchResponse = z.infer<typeof UserSearchResponseSchema>;
export type FeedItem = z.infer<typeof FeedItemSchema>;
export type FeedResponse = z.infer<typeof FeedResponseSchema>;
export type ProfileStats = z.infer<typeof ProfileStatsSchema>;
export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestSchema>;
export type UsernameAvailability = z.infer<typeof UsernameAvailabilitySchema>;
export type UploadUrlResponse = z.infer<typeof UploadUrlResponseSchema>;
export type OtherUserProfile = z.infer<typeof OtherUserProfileSchema>;
export type CollectionSummary = z.infer<typeof CollectionSummarySchema>;
export type Collection = z.infer<typeof CollectionSchema>;
export type SubscriptionSource = z.infer<typeof SubscriptionSourceSchema>;
export type SubscriptionResponse = z.infer<typeof SubscriptionResponseSchema>;
export type ApiError = z.infer<typeof ApiErrorSchema>;
