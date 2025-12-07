import { z } from "zod";

// ============================================================================
// ENUMS
// ============================================================================

export const ReadingStatusSchema = z.enum(["want", "reading", "finished"]);

export const UserRoleSchema = z.enum(["user", "moderator", "admin"]);

export const BillingIntervalSchema = z.enum([
  "month",
  "year",
  "lifetime",
  "free",
]);

export const SubscriptionStatusSchema = z.enum([
  "active",
  "canceled",
  "past_due",
  "unpaid",
  "trialing",
  "incomplete",
]);

// ============================================================================
// BASE SCHEMAS
// ============================================================================

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string().nullable(),
  bio: z.string().nullable(),
  role: UserRoleSchema,
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]),
});

export const BookSchema = z.object({
  id: z.string().uuid(),
  isbn: z.string().nullable(),
  title: z.string(),
  author: z.string(),
  coverUrl: z.string().url().nullable(),
  pages: z.number().int().positive().nullable(),
  publishedYear: z.number().int().nullable(),
  createdAt: z.union([z.string(), z.date()]),
});

export const UserBookWithoutBookSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  bookId: z.string().uuid(),
  status: ReadingStatusSchema,
  currentPage: z.number().int().nonnegative().nullable(),
  pageCount: z.number().int().positive().nullable(),
  rating: z.number().int().min(1).max(5).nullable(),
  isFavorite: z.boolean(),
  startedAt: z.union([z.string(), z.date()]).nullable(),
  finishedAt: z.union([z.string(), z.date()]).nullable(),
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]),
});

export const ReviewSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  bookId: z.string().uuid(),
  content: z.string(),
  isPrivate: z.boolean(),
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]),
});

export const FollowSchema = z.object({
  followerId: z.string(),
  followingId: z.string(),
  createdAt: z.union([z.string(), z.date()]),
});

export const SubscriptionPlanSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  stripePriceId: z.string().nullable(),
  stripeProductId: z.string().nullable(),
  price: z.number().int().nonnegative(),
  interval: BillingIntervalSchema,
  features: z.string().nullable(),
  isActive: z.boolean(),
  isInternal: z.boolean(),
  sortOrder: z.number().int(),
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]),
});

export const UserSubscriptionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  planId: z.string().uuid(),
  stripeSubscriptionId: z.string().nullable(),
  stripeCustomerId: z.string().nullable(),
  status: SubscriptionStatusSchema,
  currentPeriodStart: z.union([z.string(), z.date()]).nullable(),
  currentPeriodEnd: z.union([z.string(), z.date()]).nullable(),
  cancelAtPeriodEnd: z.boolean(),
  canceledAt: z.union([z.string(), z.date()]).nullable(),
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]),
});

export const CollectionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  slug: z.string(),
  colorTag: z.string().nullable(),
  iconName: z.string().nullable(),
  coverImageUrl: z.string().url().nullable(),
  isPublic: z.boolean(),
  sortOrder: z.number().int(),
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]),
});

// ============================================================================
// COMPOSITE SCHEMAS
// ============================================================================

export const UserBookSchema = UserBookWithoutBookSchema.extend({
  book: BookSchema,
});

export const UserBookWithDetailsSchema = UserBookWithoutBookSchema.extend({
  book: BookSchema,
  user: UserSchema,
});

export const ReviewWithUserSchema = ReviewSchema.extend({
  user: UserSchema,
});

export const ReviewWithBookSchema = ReviewSchema.extend({
  book: BookSchema,
});

export const ReviewWithDetailsSchema = ReviewSchema.extend({
  user: UserSchema,
  book: BookSchema,
});

export const UserWithStatsSchema = UserSchema.extend({
  _count: z
    .object({
      followers: z.number().int().nonnegative().optional(),
      following: z.number().int().nonnegative().optional(),
      userBooks: z.number().int().nonnegative().optional(),
      reviews: z.number().int().nonnegative().optional(),
    })
    .optional(),
});

export const UserSubscriptionWithPlanSchema = UserSubscriptionSchema.extend({
  plan: SubscriptionPlanSchema,
});

// ============================================================================
// API RESPONSE SCHEMAS
// ============================================================================

export const ApiErrorSchema = z.object({
  error: z.string(),
  limitReached: z.boolean().optional(),
  usage: z
    .object({
      current: z.number().int().nonnegative(),
      limit: z.number().int().positive(),
    })
    .optional(),
});

// Profile response schema (can be User or UserWithStats)
export const ProfileResponseSchema = z.union([UserSchema, UserWithStatsSchema]);

// Library response schema
export const LibraryResponseSchema = z.object({
  favoriteBooks: z.array(UserBookSchema),
  wantToRead: z.array(UserBookSchema),
  currentlyReading: z.array(UserBookSchema),
  finished: z.array(UserBookSchema),
});

// Rate book request/response schemas
export const RateBookRequestSchema = z.object({
  rating: z.number().int().min(1).max(5),
});

export const RateBookResponseSchema = z.object({
  success: z.boolean(),
  userBook: UserBookWithoutBookSchema.optional(),
});

// Review array response schema
export const ReviewsResponseSchema = z.array(ReviewWithUserSchema);

// Create review request schema
export const CreateReviewRequestSchema = z.object({
  bookId: z.string().uuid(),
  content: z.string().min(1).max(5000),
  isPrivate: z.boolean().optional().default(false),
});

// Update review request schema
export const UpdateReviewRequestSchema = z.object({
  content: z.string().min(1).max(5000).optional(),
  isPrivate: z.boolean().optional(),
});

// Review response schemas
export const CreateReviewResponseSchema = z.object({
  success: z.boolean(),
  review: ReviewSchema.optional(),
});

export const UpdateReviewResponseSchema = CreateReviewResponseSchema;

export const DeleteReviewResponseSchema = z.object({
  success: z.boolean(),
});

// ============================================================================
// TYPE EXPORTS (inferred from schemas)
// ============================================================================

export type User = z.infer<typeof UserSchema>;
export type Book = z.infer<typeof BookSchema>;
export type UserBookWithoutBook = z.infer<typeof UserBookWithoutBookSchema>;
export type UserBook = z.infer<typeof UserBookSchema>;
export type Review = z.infer<typeof ReviewSchema>;
export type Follow = z.infer<typeof FollowSchema>;
export type SubscriptionPlan = z.infer<typeof SubscriptionPlanSchema>;
export type UserSubscription = z.infer<typeof UserSubscriptionSchema>;
export type Collection = z.infer<typeof CollectionSchema>;
export type UserWithStats = z.infer<typeof UserWithStatsSchema>;
export type UserSubscriptionWithPlan = z.infer<
  typeof UserSubscriptionWithPlanSchema
>;
export type ApiError = z.infer<typeof ApiErrorSchema>;
export type ProfileResponse = z.infer<typeof ProfileResponseSchema>;
export type LibraryResponse = z.infer<typeof LibraryResponseSchema>;
export type RateBookRequest = z.infer<typeof RateBookRequestSchema>;
export type RateBookResponse = z.infer<typeof RateBookResponseSchema>;
export type ReviewsResponse = z.infer<typeof ReviewsResponseSchema>;
export type CreateReviewRequest = z.infer<typeof CreateReviewRequestSchema>;
export type UpdateReviewRequest = z.infer<typeof UpdateReviewRequestSchema>;
export type CreateReviewResponse = z.infer<typeof CreateReviewResponseSchema>;
export type UpdateReviewResponse = z.infer<typeof UpdateReviewResponseSchema>;
export type DeleteReviewResponse = z.infer<typeof DeleteReviewResponseSchema>;
export type ReviewWithUser = z.infer<typeof ReviewWithUserSchema>;
export type ReviewWithBook = z.infer<typeof ReviewWithBookSchema>;
export type ReviewWithDetails = z.infer<typeof ReviewWithDetailsSchema>;

// Re-export enum types
export type ReadingStatus = z.infer<typeof ReadingStatusSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export type BillingInterval = z.infer<typeof BillingIntervalSchema>;
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;
