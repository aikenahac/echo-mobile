export const Endpoints = {
  books: {
    getAll: "/v1/books",
    add: "/v1/books",
    search: "/v1/books/search",
    getById: "/v1/books/:id",
    remove: "/v1/books/:id",
    updateStatus: "/v1/books/:id/status",
    updateProgress: "/v1/books/:id/progress",
    rate: "/v1/books/:id/rating",
    toggleFavorite: "/v1/books/:id/favorite",
  },

  reviews: {
    getAll: "/v1/reviews",
    create: "/v1/reviews",
    getById: "/v1/reviews/:id",
    update: "/v1/reviews/:id",
    delete: "/v1/reviews/:id",
  },

  social: {
    follow: "/v1/social/follow",
    unfollow: "/v1/social/follow/:userId",
  },

  profile: {
    get: "/v1/profile",
    update: "/v1/profile",
  },

  collections: {
    getAll: "/v1/collections",
    create: "/v1/collections",
    getById: "/v1/collections/:id",
    update: "/v1/collections/:id",
    delete: "/v1/collections/:id",
    addBook: "/v1/collections/:id/books",
    removeBook: "/v1/collections/:id/books",
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
