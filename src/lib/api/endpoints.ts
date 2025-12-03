export const Endpoints = {
  books: {
    getAll: "/v1/books",
    add: "/v1/books",
    search: "/v1/books/search",
    getById: (id: string) => `/v1/books/${id}`,
    remove: (id: string) => `/v1/books/${id}`,
    updateStatus: (id: string) => `/v1/books/${id}/status`,
    updateProgress: (id: string) => `/v1/books/${id}/progress`,
    rate: (id: string) => `/v1/books/${id}/rating`,
    toggleFavorite: (id: string) => `/v1/books/${id}/favorite`,
  },

  reviews: {
    getAll: "/v1/reviews",
    create: "/v1/reviews",
    getById: (id: string) => `/v1/reviews/${id}`,
    update: (id: string) => `/v1/reviews/${id}`,
    delete: (id: string) => `/v1/reviews/${id}`,
  },

  social: {
    follow: "/v1/social/follow",
    unfollow: (userId: string) => `/v1/social/follow/${userId}`,
  },

  profile: {
    get: "/v1/profile",
    update: "/v1/profile",
  },

  library: {
    get: "/v1/library"
  },

  collections: {
    getAll: "/v1/collections",
    create: "/v1/collections",
    getById: (id: string) => `/v1/collections/${id}`,
    update: (id: string) => `/v1/collections/${id}`,
    delete: (id: string) => `/v1/collections/${id}`,
    addBook: (id: string) => `/v1/collections/${id}/books`,
    removeBook: (id: string) => `/v1/collections/${id}/books`,
  },

  feed: {
    get: "/v1/feed",
  },

  subscriptions: {
    get: "/v1/subscriptions",
    getUsage: "/v1/subscriptions/usage",
  },

  users: {
    search: "/v1/users/search",
  },

  webhooks: {
    stripe: "/webhooks/stripe",
  },
};
