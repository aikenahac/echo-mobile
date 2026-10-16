/** Paths under EXPO_PUBLIC_API_URL (which already ends in /api) */
export const Endpoints = {
  library: {
    get: "/v1/books",
    add: "/v1/books",
    search: "/v1/books/search",
    searchIngest: "/v1/books/search/ingest",
    getById: (id: string) => `/v1/books/${id}`,
    remove: (id: string) => `/v1/books/${id}`,
    updateStatus: (id: string) => `/v1/books/${id}/status`,
    updateProgress: (id: string) => `/v1/books/${id}/progress`,
    rate: (id: string) => `/v1/books/${id}/rating`,
    toggleFavorite: (id: string) => `/v1/books/${id}/favorite`,
  },

  catalog: {
    get: (bookId: string) => `/v1/catalog/${bookId}`,
  },

  reviews: {
    save: "/v1/reviews",
    delete: (id: string) => `/v1/reviews/${id}`,
  },

  social: {
    follow: "/v1/social/follow",
    unfollow: (userId: string) => `/v1/social/follow/${userId}`,
    block: "/v1/social/block",
    unblock: (userId: string) => `/v1/social/block/${userId}`,
    blocked: "/v1/social/blocked",
  },

  reports: {
    create: "/v1/reports",
  },

  profile: {
    get: "/v1/profile",
    update: "/v1/profile",
    delete: "/v1/profile",
    stats: "/v1/profile/stats",
    usernameAvailable: "/v1/profile/username-available",
    pictureUploadUrl: "/v1/profile/picture-upload-url",
  },

  collections: {
    getAll: "/v1/collections",
    create: "/v1/collections",
    order: "/v1/collections/order",
    getById: (id: string) => `/v1/collections/${id}`,
    update: (id: string) => `/v1/collections/${id}`,
    delete: (id: string) => `/v1/collections/${id}`,
    addBook: (id: string) => `/v1/collections/${id}/books`,
    removeBook: (id: string) => `/v1/collections/${id}/books`,
    coverUploadUrl: (id: string) => `/v1/collections/${id}/cover-upload-url`,
  },

  feed: {
    get: "/v1/feed",
  },

  subscriptions: {
    get: "/v1/subscriptions",
  },

  users: {
    search: "/v1/users/search",
    get: (userId: string) => `/v1/users/${userId}`,
    followers: (userId: string) => `/v1/users/${userId}/followers`,
    following: (userId: string) => `/v1/users/${userId}/following`,
  },
};
