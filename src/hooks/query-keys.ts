export const profileQueryKeys = {
  get: ["profile"],
  update: ["profile"],
}

export const libraryQueryKeys = {
  get: ["library"],
  view: ["library-view"],
  getBook: (userBookId: string) =>  ["library", userBookId],
  updateCurrentPage: (userBookId: string) => ["library", "update-progress", "current-page", userBookId],
  updatePageCount: (userBookId: string) => ["library", "update-progress", "page-count" , userBookId],
  toggleFavorite: (userBookId: string) => ["library", "toggle-favorite" , userBookId],
  rateBook: (userBookId: string) => ["library", "rate", userBookId],
};

export const reviewQueryKeys = {
  getByBook: (bookId: string) => ["reviews", "book", bookId],
  create: (bookId: string) => ["reviews", "create", bookId],
  update: (reviewId: string) => ["reviews", "update", reviewId],
  delete: (reviewId: string) => ["reviews", "delete", reviewId],
};