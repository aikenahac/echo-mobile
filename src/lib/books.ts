import type { Book, PublicUser, User, UserBookWithoutBook } from "@/lib/schemas";

/**
 * The page total, everywhere: the entry's own page count, else the catalog's.
 * Both may be null or 0 (unknown). Same rule the server uses for validation and
 * auto-finish.
 */
export function bookTotal(
  userBook: Pick<UserBookWithoutBook, "pageCount"> | null | undefined,
  book: Pick<Book, "pages"> | null | undefined,
): number | null {
  return userBook?.pageCount || book?.pages || null;
}

/** The progress fraction 0–1, or null when the total is unknown */
export function bookProgress(currentPage: number | null | undefined, total: number | null) {
  if (!total) return null;
  return Math.min(1, Math.max(0, (currentPage ?? 0) / total));
}

/** `displayName`, else `username`; for the signed-in user, falls back to the email */
export function displayName(user: Pick<PublicUser, "displayName" | "username"> & { email?: string }) {
  return user.displayName || user.username || user.email || "";
}

/** The letter on a square avatar tile */
export function initialOf(user: Pick<PublicUser, "displayName" | "username"> & { email?: string }) {
  return displayName(user).trim().charAt(0).toUpperCase() || "?";
}

export type ProfileLike = Pick<User, "displayName" | "username" | "email">;

/** System administrators get the sparkle badge: others carry `isAdmin`, the signed-in user a role */
export function isAdmin(user: Partial<Pick<PublicUser, "isAdmin">> & Partial<Pick<User, "role">>) {
  return user.isAdmin === true || user.role === "admin";
}
