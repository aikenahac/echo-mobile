# Echo redesign: API handoff

This is the data half of `HANDOFF.md`. For every screen in `shots/r3` it says which endpoint feeds which element,
what to compute on the client, which mutations to call, and what to refresh afterwards. **It replaces the
"Things the design needs that the API does not have yet" section of `HANDOFF.md`:** all six items listed there now
exist. Build real hooks for them; don't stub them.

Full reference with every field and error: `/Users/aiken/repos/projects/echo/docs/mobile-handoff.md` §6 (API) and
§4 (product rules). If this document and the code disagree, the code in `echo/src/app/api/v1/` wins.

> **Backend branch.** The new endpoints live on the `feat/mobile-api-parity` branch of the `echo` repo and are not
> deployed yet. Point `EXPO_PUBLIC_API_URL` at a local `pnpm dev` of that branch (`http://<your-mac-ip>:3000/api`)
> until it ships to echobook.club.

---

## 0. Ground rules

- **Base and paths.** `EXPO_PUBLIC_API_URL` already ends in `/api`; every path below is relative to `/api/v1`. Add the
  new ones to `src/lib/api/endpoints.ts`.
- **Auth.** Every endpoint needs `Authorization: Bearer <Clerk session token>`. `useFetch()` already adds it. The
  first authenticated call provisions the user row, so there is no register call.
- **Responses are unwrapped.** You get the data itself, never `{ success, data }`. Mutations that have nothing to
  return answer `{ success: true }`. Errors are `{ error: string }` with an HTTP status:

  | Status | Meaning | UI |
  |---|---|---|
  | 400 | validation (message is user-readable English) | inline error or toast |
  | 401 | token missing or expired | Clerk refresh, then sign-in |
  | 403 | premium required (collections) | open the Premium paywall (phase 8) |
  | 404 | not found, **or someone else's private data** | "not available" state; never "forbidden" |

  Error messages are English and come from the server. Show them as they are for now, and key i18n on the status
  code plus the endpoint if you need translated copy.
- **Two kinds of book ID; don't mix them up.** `userBook.id` is a library entry, used by `/books/{id}/…` and by
  collections. `book.id` is the catalog book, used by `/catalog/{bookId}` and by reviews. Every `UserBook` carries
  both (`id` and `bookId`).
- **Pagination.** List endpoints take `limit` and `offset` and return `hasMore`. Out-of-range values are clamped,
  not rejected. Use `useInfiniteQuery` with `getNextPageParam: (last, pages) => last.hasMore ? offset + limit : undefined`.
- **Dates** are ISO strings. Format them on the client with the user's locale. Relative times ("2 h", "Yesterday",
  "Sat") are computed from `date`/`createdAt`.

### 0.1 Fix the existing Zod schemas first (they'll reject real responses)

`src/lib/schemas/index.ts` was written against an older API. Before building screens, fix these:

| Schema | Problem | Fix |
|---|---|---|
| `UserSchema` | missing `displayName`, `profilePictureUrl` | add both, `string().nullable()` |
| `ReviewWithUserSchema`, `ReviewWithDetailsSchema`, feed items | other users come back as **PublicUser** (`id, username, displayName, profilePictureUrl`), with no `email` or `role`, so `UserSchema` fails | add `PublicUserSchema` and use it for every other-user field |
| `UserBookWithoutBookSchema.pageCount` | `positive()`, but `0` is a legal value | `int().nonnegative().nullable()`; treat `0` as unknown |
| `BookSchema.pages` | same | `int().nonnegative().nullable()` |
| `SearchResponseSchema` | now an object, not an array | `{ results: SearchResult[], hasMore, offset, limit }` |
| `CreateReviewRequestSchema` / `UpdateReviewRequestSchema` | `max(5000)` | the server allows `10000` |
| `ApiErrorSchema` | `limitReached` / `usage` no longer exist | just `{ error: string }` |
| `UpdateUserParams` / `updateMe` | sends `{ username, bio }` and requires both | `PUT /profile` is now a **partial** update; send only what changed (§9) |
| `getUsage` endpoint | returns 410 | delete it |

New schemas you'll need are listed per phase below.

### 0.2 Query keys and invalidation

Extend `src/hooks/query-keys.ts`:

```ts
library:     ["library"]                       // GET /books (grouped)
libraryBook: ["library", userBookId]           // GET /books/{id}
catalog:     ["catalog", bookId]               // GET /catalog/{bookId}
stats:       ["profile", "stats"]              // GET /profile/stats
profile:     ["profile"]                       // GET /profile
collections: ["collections"]                   // GET /collections
feed:        ["feed"]                          // GET /feed (infinite)
search:      ["search", "books", q]            // GET /books/search (infinite)
users:       ["users", "search", q]            // GET /users/search
user:        ["users", userId]                 // GET /users/{id}
```

**Any library mutation** (add, status, progress, rating, favorite, remove) invalidates `library`,
`["library", userBookId]`, `["catalog", bookId]` and `["profile", "stats"]`. Reviews invalidate `["catalog", bookId]`.
Collection membership invalidates `collections`. Follow/unfollow invalidates `feed`, `["users", …]` and the
current search results.

---

## 1. Foundation: shared types the primitives render

| Primitive | Data |
|---|---|
| `Cover` | `book.coverUrl` (may be `null` → designed fallback with `book.title`) |
| `Avatar` (square, initial) | `user.profilePictureUrl` if set, else the first letter of `displayName ?? username` (own profile: fall back to `email`) |
| `Stamp` | `userBook.status` → READING / WANT / FINISHED |
| `Stars` | `userBook.rating` (1–5 or `null`) |
| `ProgressBar` | `currentPage / total`, where `total = userBook.pageCount \|\| book.pages` (both may be `null`/`0` → no bar) |

**Display name:** use `displayName`, with `@username` underneath when both exist; otherwise use `username`.

**Page total, everywhere:** `const total = userBook.pageCount || userBook.book.pages || null`. This is exactly the
rule the server uses for validation and auto-finish.

---

## 2. Library (`01-library.png`, `08-library-dark.png`)

**Load:** `GET /books` → `{ favoriteBooks, wantToRead, currentlyReading, finished }`, each an array of `UserBook` with `book`,
newest-added first. Also `GET /collections` for the paper section.

| Element | Source |
|---|---|
| Shelf row "Reading 3 · Want 7 · Finished 23 · Favourites 6" | the lengths of the four arrays |
| Field hero book | the `currentlyReading` entry with the latest `updatedAt` (sort on the client; the API sorts by date added) |
| 120pt page number | `currentPage` |
| "of 245 pages" | `total` (§1). Unknown total: hide the line and the auto-finish |
| "77 to go" | `total - currentPage` |
| "+12 today" | **No backend source.** The server keeps no reading history. Derive it on the device: store `{ userBookId, date, startPage }` in MMKV the first time the page changes each local day and show `currentPage - startPage`. Hide it when there's no snapshot or the delta is ≤ 0. It's device-local, so it won't match across devices. |
| Title, author | `book.title`, `book.author` |
| "Also reading" rows | the other `currentlyReading` entries: `currentPage / total` and a progress bar |
| "last opened 21 Sep" | `userBook.updatedAt`. Any change (favorite, rating) also bumps it, so label it "updated" if that matters. |
| Collections rows (name, count) | `GET /collections` → `name`, `bookCount`, `colorTag`, `iconName`, `isPublic`, ordered by `sortOrder` |
| Want / Finished / Favourites shelves | the matching array; or `GET /books?status=want` / `?favorite=true` (flat `UserBook[]`) if you want a separate query per shelf |
| Grid/list toggle | local only (MMKV) |

**Mutations**

| Action | Call |
|---|---|
| − / Next page | `PUT /books/{userBookId}/progress { currentPage }` |
| Tap the number → sheet with current page and page count | `PUT /books/{userBookId}/progress { pageCount, currentPage }`: one call, `pageCount` is applied first |
| Book overflow: status | `PUT /books/{userBookId}/status { status }` |
| Favourite | `PUT /books/{userBookId}/favorite { isFavorite }` |
| Remove (confirm first) | `DELETE /books/{userBookId}` |

**Server rules the UI must mirror** (they're the same on web and API):
- `currentPage` is an integer from 0 to 100,000 and can't exceed `total` → 400 "Current page cannot exceed total pages". Clamp in the UI.
- Reaching `total` → the status becomes `finished` and `finishedAt` is set.
- Any other page above 0 on a book that isn't `reading` → the status becomes `reading` (`startedAt` is filled if empty).
- `status: finished` via the status endpoint sets `currentPage = pageCount`.

Empty Reading shelf: no field hero. Show the paper empty state with a "Search for a book" action (phase 5).

---

## 3. Signature: the numbering stamp (`05-signature-stamp.png`)

Same endpoint as the stepper, with stricter client behaviour:

1. **While dragging:** update the React Query cache optimistically (`setQueryData(["library"], …)`) and don't call the API.
2. **On settle:** debounce about 600ms, then `PUT /books/{id}/progress { currentPage }`. Coalesce: if a request is in
   flight, send only the latest value after it returns. On error, roll back to the last confirmed value and show the
   message.
3. **Reaching `total`:** play the FINISHED stamp locally right away. The same progress call moves the book to
   `finished` on the server, so there's no separate status call.
4. **"Rate it" stars:** `PUT /books/{id}/rating { rating }`.
5. **Undo (5 s):** `PUT /books/{id}/progress { currentPage: <previous> }`. Because the previous page is below the total,
   the server moves the book back to `reading`. Caveat: `finishedAt` keeps the undone date until the book is
   finished again (the API can't clear it). Nothing in the design shows it for a reading book, so it's harmless.
   If the user rated it before undoing, the rating stays.
6. Then invalidate as in §0.2. Moving to Finished changes the shelf counts and the profile stats.

---

## 4. Book detail (`02-detail-james.png`)

Opened with the **catalog** `book.id`, from the library (`userBook.bookId`), the feed (`item.book.id`) or an internal
search result (`result.id`). External search results have no catalog ID, so they don't open detail (add them first).

**Load:** `GET /catalog/{bookId}` →

```ts
{ book: Book;
  userBook: UserBookWithoutBook | null;   // null = not in your library (no `book` nested; use the top-level one)
  myReview: Review | null;                // yours, public or private
  followingReviews: (Review & { user: PublicUser })[]; }   // public reviews by people you follow, newest first
```
404 → a "book not found" state.

| Element | Source |
|---|---|
| Cover, title, author | `book` |
| "2024 · 303 pages" | `book.publishedYear`, `total` |
| Status stamp | `userBook.status`. With no `userBook`, show the add menu (below) instead of a stamp |
| Stars + "Your rating" | `userBook.rating`; only when `status === "finished"` |
| "Read in 11 days · 22 Sep to 3 Oct" | `finishedAt - startedAt` in days (round up, minimum 1). Hide when either is null |
| A *reading* book uses the field hero | `userBook.status === "reading"` → same hero and progress as §2, with the same calls |
| "Your review", Public/Private, date, Edit | `myReview.content`, `myReview.isPrivate`, `myReview.updatedAt` |
| "From people you follow" | `followingReviews[]` → avatar initial, `user.displayName ?? user.username`, `createdAt`, `content`. Hide the section when it's empty |
| ISBN (if shown) | `book.isbn` |

**Mutations**

| Action | Call |
|---|---|
| Status stamp menu (in library) | `PUT /books/{userBook.id}/status { status }` |
| Status menu (not in library) → Want / Reading / Finished | `POST /books { bookData: { title, author, isbn, coverUrl, pages, publishedYear } from book, status }` → `201 { success, userBook }`. 400 "Book already in your library" means stale data, so refetch |
| Heart | `PUT /books/{userBook.id}/favorite { isFavorite }` (only when in library; hide it otherwise) |
| Stars | `PUT /books/{userBook.id}/rating { rating: 1–5 }` |
| Folder (add to collection) | phase 8 sheet; needs `userBook` and Premium |
| ⋯ → Remove from library (confirm) | `DELETE /books/{userBook.id}`. Your review stays (reviews hang off the catalog book) |
| Review editor sheet, Save | `POST /reviews { bookId: book.id, content, isPrivate }`. This creates the review or updates your existing one, so one call covers both. Content is 1–10,000 characters |
| Review editor, Delete (confirm) | `DELETE /reviews/{myReview.id}` |

Refresh `["catalog", bookId]` after every action here, plus the library keys for library actions.

---

## 5. Search (`04-search.png`)

### Books segment
`GET /books/search?q=&offset=&limit=20` →
`{ results: SearchResult[], hasMore, offset, limit }`.

```ts
SearchResult = { id?: string; key?: string; isbn: string | null; title: string; author: string;
                 coverUrl: string | null; pages: number | null; publishedYear: number | null;
                 source: "internal" | "external" }
```

- **Infinite scroll:** `offset` in steps of 20, stopping when `hasMore` is false **or** a page comes back empty. `hasMore`
  is a best guess, because the external catalog's size is unknown. **De-duplicate** appended results by
  `id ?? key ?? isbn ?? title+author`, because the two sources can overlap at page boundaries.
- `q` is required (trimmed, up to 200 characters). Debounce typing by 300–400ms and don't search on an empty query.
- **Source line:** "From Echo's catalog" when `results[0].source === "internal"`; per row, show "Open Library" on
  `external` items.
- **Already-owned rows** ("Finished · rated 4" plus a mini stamp): the search response doesn't say what you own.
  Match on the client against the cached `GET /books` data: for `internal` results by `userBook.bookId === result.id`,
  otherwise by ISBN, and show that entry's `status` and `rating`.
- **Quick-add capsules Want / Reading / Finished:** `POST /books { bookData: { title, author, isbn, coverUrl, pages, publishedYear }, status }`.
  Works for both sources. On 400 "Book already in your library", refetch the library so the row flips to owned.
  On success, invalidate `library` and `stats`.
- Tapping an `internal` row opens Book detail with `result.id`. `external` rows aren't tappable until they're added.

### Readers segment (Find users)
`GET /users/search?q=&limit=20` → `{ results: [{ id, username, displayName, profilePictureUrl, bio, isFollowing }], hasMore, total, query }`.
- `q` needs at least 2 characters (otherwise 400); don't call it below that. The current user is never in the results.
- No offset on this endpoint: raise `limit` (max 50) for "more".
- **Follow:** `POST /social/follow { userId }` (201). **Unfollow:** `DELETE /social/follow/{userId}`. Toggle optimistically.
  400 "Already following this user" is safe to treat as success.
- Tapping a reader can open their profile (§7.1).

---

## 6. Friends feed (`03-friends.png`)

`GET /feed?limit=20&offset=` → `{ activities: FeedItem[], hasMore, limit, offset }`. When you follow nobody it returns
`{ activities: [], hasMore: false, total: 0 }`, which is the **empty state**: "Find users" goes to Search → Readers.

```ts
type FeedItem =
  | { type: "book";   date: string; user: PublicUser; book: Book;
      data: { status: "reading" | "finished"; rating: number | null; currentPage: number | null;
              startedAt: string | null; finishedAt: string | null } }
  | { type: "review"; date: string; user: PublicUser; book: Book;
      data: { content: string; isPrivate: false } };
```

| Design item | Mapping |
|---|---|
| "Maja Horvat started reading" (field band, 92pt cover, plate title, "559 pages") | `type === "book" && data.status === "reading"`; `book.pages` |
| "Luka Novak finished" + mini FINISHED stamp + stars | `type === "book" && data.status === "finished"`; stars = `data.rating` (hide when null) |
| "Ana Zupan reviewed", text clamped to 3 lines, small cover | `type === "review"` → `data.content` |
| Time ("40 min", "Yesterday", "Sat") | `date` |
| Tap the book | Book detail with `book.id` |
| Tap the person | the user's profile (§7.1) |
| Header person-plus | Search → Readers |

- Offset max is 1000 and limit max is 100. Infinite scroll on `hasMore`.
- Note: a book item's `date` is the UserBook's `updatedAt`, so a friend's later page update moves "started reading" back
  to the top. That's expected.

---

## 7. Profile, "You" (`09-profile.png`)

| Element | Call |
|---|---|
| Avatar, name, @username, bio | `GET /profile` → `{ id, email, username, displayName, bio, profilePictureUrl, role, isPremium, planName, … }` |
| "19 books finished in 2026" + "6,412 pages" | `GET /profile/stats` → `booksFinishedThisYear`, `pagesReadThisYear` (calendar year, server time; pages use the catalog page counts) |
| "Reading now" band, "p. 168 / 245" | `GET /books` → `currentlyReading`, `currentPage / total` |
| Favourites / Want to read 7 / Finished shelves, "See all" | `GET /books` → the arrays; "See all" opens the Library on that shelf |
| Pencil (edit profile) | §9 |
| Gear (settings) | §9 |

`/profile/stats` also returns `totalBooks`, `countsByStatus { want, reading, finished }` and `favoritesCount`, so shelf
counts don't need the full library. There's no streak; don't show one.

### 7.1 Other people's profiles (not drawn; build it in the same language when a feed or reader row is tapped)
- `GET /users/{userId}` → `{ user: PublicUser & { bio }, stats: { booksFinishedThisYear, finishedCount }, followerCount,
  followingCount, isFollowing, currentlyReading, recentlyFinished, favorites (each up to 6 UserBook with book),
  publicCollections (with bookCount, no books) }`. 404 for an unknown user. It never includes reviews or email.
- Follower and following lists: `GET /users/{userId}/followers` and `/following` with `limit` (max 50) and `offset` →
  `{ results: (PublicUser & { isFollowing })[], hasMore }`. Here `isFollowing` is whether **you** follow that person.
- Follow button: the same `/social/follow` calls as §5.

---

## 8. Collections and Premium (`06-add-to-collection.png`, `07-premium.png`)

**Gate:** `GET /profile` → `isPremium`. If it's false, any collection action (folder button, "New collection", the
Library collections row's +) opens the Premium paywall instead. Also treat any **403** from a collection call as
"show paywall" (e.g. Premium lapsed).

### Add-to-collection sheet
- **Load:** `GET /collections` → `Collection[]`, each with `books: UserBook[]` and `bookCount`, ordered by `sortOrder`.
- **Rows:** colour tile from `colorTag` (a Tailwind token like `"blue-500"`; map it to your curated riso palette and
  fall back to the nearest for any of the 22×4 values), Lucide icon `iconName` (kebab-case, default `book`), `name`,
  "`bookCount` books · public/private" from `isPublic`.
- **Checked state:** `collection.books.some(b => b.id === userBook.id)`.
- **Toggle on:** `POST /collections/{id}/books { userBookId }` (201). 400 "Book already in collection" means it's
  already there. **Toggle off:** `DELETE /collections/{id}/books?userBookId=`. Optimistic, then invalidate `collections`.
- **New collection:** `POST /collections { name, description?, isPublic?, colorTag?, iconName? }` → `201 Collection`
  (a 403 means not Premium). Then add the book to it.

### Collection detail and editor (not drawn yet)
| Action | Call |
|---|---|
| Open one of yours | `GET /collections/{id}` → `Collection` with `books: UserBook[]` |
| Edit | `PUT /collections/{id} { name?, description?, isPublic?, colorTag?, iconName?, coverImageUrl? }` → the updated collection. Renaming changes `slug` |
| Delete (confirm; the books stay in the library) | `DELETE /collections/{id}` |
| Cover image | §9 upload flow with `POST /collections/{id}/cover-upload-url`, then `PUT /collections/{id} { coverImageUrl: publicUrl }` |
| Reorder (drag in the list) | `PUT /collections/order { order: [every collection id, in the new order] }`. It must contain **all** your collections exactly once (400 otherwise) |
| Open someone's public collection (a link, a profile) | `GET /collections/{idOrSlug}/public` → collection + `user`, `books`, `followerCount`, `isFollowing`. 404 if it's private and not yours |
| Follow / unfollow a public collection | `POST` / `DELETE /collections/{id}/follow`. You can't follow your own (400) |
| Discover public collections | `GET /collections/public?limit=` (max 50), each with `user`, `bookCount`, `followerCount`, 4 preview `books` |

Limits: name 1–100 characters, description up to 1000, `colorTag`/`iconName` up to 50.

### Premium paywall
- **No API for buying.** The "Continue on echobook.club" button opens `https://echobook.club/subscription` in the
  system browser (`expo-web-browser`). Keep it behind the one component the HANDOFF asks for. The IAP decision is still open.
- **Prices** ("€1.99 a month or €19.99 once") have **no public API**: `GET /subscriptions` only returns the user's own
  plan. Keep the copy in i18n for now and flag it.
- On return to the app (`AppState` active), refetch `GET /profile` to pick up `isPremium`.

---

## 9. First run, edit profile, settings

### Username onboarding (`10-first-run-username.png`)
- **Show when** `GET /profile` → `username === null`. Block everything else.
- **"Available" check while typing:** filter locally to `[a-zA-Z0-9_.]` and 30 characters, debounce 300ms, then
  `GET /profile/username-available?username=` → `{ available: true }` or `{ available: false, reason }`. Show `reason`
  under the field (e.g. "Username already taken", "Username must be at least 3 characters long"). Don't call it below 3 characters.
- **Continue:** `PUT /profile { username }`. A 400 can still say "Username already taken" if someone grabbed it in between,
  so show it inline. Then invalidate `profile`.
- The live preview card ("@neza.reads started reading …") is local UI only.

### Edit profile (not drawn)
`PUT /profile` is a **partial update**: send only the fields that changed.
- `displayName` (up to 100), `bio` (up to 1000), `profilePictureUrl`: send `null` (or `""`) to clear.
- `username` can be changed but **not** cleared (400).
- `{}` → 400 "No profile fields to update", so don't call it when nothing changed.

**Profile picture upload (also used for collection covers):**
1. Pick an image and convert or compress it to JPEG/PNG/WEBP, at most 5 MB.
2. `POST /profile/picture-upload-url { contentType, fileSize }` → `{ uploadUrl, publicUrl, expiresIn: 300 }`.
   `fileSize` is the exact byte count.
3. `PUT uploadUrl` with the raw bytes, `Content-Type: <same contentType>`, and **no** Authorization header, within 300s.
   The URL is signed for that exact type and size.
4. `PUT /profile { profilePictureUrl: publicUrl }`. Only URLs issued to this user are accepted.

### Settings (not drawn)
- Plan: `GET /subscriptions` → `{ subscription: { status, currentPeriodEnd, cancelAtPeriodEnd } | null, plan: { name, price (cents), interval }, isActive, isFree }`.
  Show "Renews" or "Expires" with `currentPeriodEnd`, or "lifetime" when `plan.interval === "lifetime"`. Use `isPremium`
  from `/profile` for gating, not `isFree`.
- "Manage subscription" → open `https://echobook.club/subscription` in the browser.
- Legal: `https://echobook.club/documents/privacy-policy` and `/documents/terms-of-service`.
- Sign out: Clerk `signOut()`, then clear the React Query cache.

---

## 10. Not in the API (design around these; don't invent endpoints)

| Need | What to do |
|---|---|
| "+12 today" pages | device-local MMKV snapshot (§2) |
| Reading streak / goals | not built; leave them out |
| Buying Premium in the app | open decision (IAP vs external link); web link for now |
| Plan prices | i18n copy |
| Clearing `finishedAt` on undo | not possible; harmless (§3) |
| Paging the Readers search | raise `limit` up to 50 |
| Push notifications, activity on your own reviews | not built |

If a screen needs anything else from the server, stop and ask the owner. Don't add a mock that looks like a real endpoint.
