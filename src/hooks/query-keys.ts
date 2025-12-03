export const profileQueryKeys = {
  get: ["profile"],
  update: ["profile"],
}

export const libraryQueryKeys = {
  get: ["library"],
  view: ["library-view"],
  updateCurrentPage: (userBookId: string) => ["library", "update-progress", "current-page", userBookId],
  updatePageCount: (userBookId: string) => ["library", "update-progress", "page-count" , userBookId],
  toggleFavorite: (userBookId: string) => ["library", "toggle-favorite" , userBookId],
}