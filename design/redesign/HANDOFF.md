# Echo redesign: implementation handoff

You are implementing an approved, finished design in this Expo app (SDK 57, Expo Router). The design is
the source of truth. Your job is to make the running iOS app match it, not to redesign it.

## Read first, in this order

1. `design/redesign/shots/r6/*.png`: the approved screens, rendered at 3x (402×874pt, iPhone 17 Pro).
   **These are the spec.** Open each one at full size before building its screen.
2. `design/redesign/DIRECTION.md`: brief, tokens, type scale, the signature interaction, and the exact content.
3. `design/redesign/mockup.html`: the CSS has the exact values (sizes, spacing, radii, colours). Read it for numbers;
   never port its markup.
4. `design/redesign/CRITIQUE.md`: open items and what is not yet designed.
5. `/Users/aiken/repos/projects/echo/docs/mobile-handoff.md`: the product and API reference (features,
   rules, endpoints, and API gaps).
6. `CLAUDE.md`: repo conventions (API hooks, Zod, query keys, MMKV, i18n).

Load the skills `expo-overview`, `expo-ui`, `expo-router`, `expo-animation` and `expo-design-system` before writing code.

## Stack rules (from the owner, non-negotiable)

- **Remove React Native Reusables completely.** That means:
  - Delete `src/components/ui/*`, every `@rn-primitives/*` package, `class-variance-authority`, and the
    RNR CLI config in `components.json`.
  - Use `clsx` / `tailwind-merge` only if you still need them.
  - Never run `npx @react-native-reusables/cli`.
- **Native controls come from `@expo/ui`** (install it): sheets (BottomSheet), the segmented picker (Books / Readers),
  switches (review private toggle), context menus and menus (the status stamp menu, book overflow ⋯), and grouped
  form sections (settings, edit profile). Follow the `expo-ui` skill.
- **Layout and styling:** Uniwind/Tailwind classes are fine, as are plain `StyleSheet` styles. Pick one per component and
  keep it consistent. All colours, sizes and radii go through the tokens below. No hard-coded hex values in screens.
- **Navigation:** `NativeTabs` (already used) with **3 tabs, Library · Friends · You, plus Search as the separate
  search-role tab**. The native iOS 26 glass tab bar comes for free; do not draw a custom one.
  - Book detail is a pushed screen.
  - "Add to collection" is a sheet.
  - Premium is a full-screen modal.
  - Username onboarding is a blocking full-screen modal.
- **Icons:** SF Symbols through `expo-symbols` on iOS, matched to the mockup glyphs:
  `books.vertical`, `person.2`, `person`, `magnifyingglass`, `heart.fill`, `folder`, `ellipsis`,
  `square.grid.2x2`, `chevron.down`, `plus`, `minus`, `checkmark`, `star.fill` / `star`, `person.badge.plus`,
  `gearshape`, `pencil`. Keep `lucide-react-native` only for **user-chosen collection icons** (that is data).
- **Images:** `expo-image` for covers.
- **Haptics:** `expo-haptics`.
- **Motion:** `react-native-reanimated` + `react-native-gesture-handler`.

## Tokens (implement first, as one theme module plus Uniwind CSS variables)

| Role | Light | Dark | Use |
|---|---|---|---|
| paper | `#FBF7F8` | `#130A0E` | screen ground |
| field | `#FF6BA8` | `#5C1738` | the pink. **Means "in progress / now" only** |
| ink | `#170B11` | `#FFE8F1` | primary text, stars, stamps |
| ink-2 | `#6B5560` | `#C9AEBA` | secondary text |
| ink-3 | `#8C7682` | `#A48D98` | tertiary |
| rule | `#EADCE2` | `#2E1C24` | 0.5pt hairlines |
| tint | `#F3E6EC` | `#2A1820` | avatar tiles, segmented track, fallback covers |
| pink-ink | `#B3165A` | `#FF8CBF` | accent on paper: hearts, progress bars, links, selected tab (system tint) |
| on-field | `#170B11` | `#FFE8F1` | text on the field; secondary on field = 74% opacity |
| negative | `#C2312B` | `#FF6B62` | remove/delete only |
| plate | `#B3165A` | `#8E2457` | the 3pt "misregistered" offset under big numerals |

Replace the old shadcn variables in `src/global.css` with these. Dark mode is designed, not inverted: the field
deepens to `#5C1738`, and the primary button on the field becomes a pink-ink fill.

**Type.**
- **Display:** Archivo at **width 62 (Condensed)**, weights 900 and 800. Expo Google Fonts does not ship the condensed
  width as a static face. Download the variable Archivo TTF (OFL) and cut static instances with
  `fonttools varLib.instancer` (`wdth=62 wght=900` → `ArchivoCondensed-Black.ttf`, `wdth=62 wght=800` →
  `ArchivoCondensed-ExtraBold.ttf`). Bundle them with `expo-font` and remove EB Garamond and Roboto.
- **UI and body text:** the system font (SF Pro).
- **Scale (pt):** 120 page number · 64 first-run/paywall headline · 44 screen titles · 28 hero book title and section
  heads · 22 list book titles · 17 body · 15 secondary · 13 metadata · 11 captions.
- **Tracking and spacing:** display tracking is slightly negative (≈ −0.4pt at 44), and Archivo needs extra word spacing.
  React Native has no `wordSpacing`, so check the rendered titles. If words run together, use a slightly
  looser letterSpacing, or bake wider spacing into the font instance.
- **Numerals:** tabular figures (`fontVariant: ['tabular-nums']`) for anything that changes.
- **Dynamic Type:** respect it; never fix sizes to protect a layout.

**Layout.** 20pt side margin. Spacing 4/8/12/20/32/48. Covers have a 1.5/3pt radius (spine side smaller) and one soft
shadow (`0 14 22 -12 rgba(70,8,36,.5)`); they are the only things with shadows. Buttons are capsules (52–56pt tall).
No cards: group with space and 0.5pt hairlines.

## Build order (one PR-sized phase each; screenshot-compare after each)

1. **Foundation.**
   - Remove RNR.
   - Add the tokens, fonts and `@expo/ui`.
   - Build the shared primitives:
     - `Cover`: expo-image, 2:3, spine radius and shadow, plus the designed fallback (tint ground, 5pt pink-ink spine, title in Archivo).
     - `Stamp`: the ink double-rule label at −6°, in sizes 11/22/34.
     - `PlateNumber`: Archivo 120 with the 3pt plate offset.
     - `FieldBand`.
     - `Avatar`: a square tile with an Archivo initial.
     - `Stars`.
     - `ProgressBar`.
   - Change the tabs to Library · Friends · You plus Search.
2. **Library (core screen).**
   - Field hero: shelves row (Reading · Want · Finished · Favourites, with counts), cover, the 120pt page number with
     an underline (it is editable: tap to type, sheet with current page and page count), −/Next page, title and author.
   - Paper section: "Also reading" rows with progress, then collections.
   - Want/Finished/Favourites shelves render on paper, with no field.
   - Grid/list toggle persisted in MMKV.
   - Then the dark variant.
3. **The signature: the numbering stamp** (DIRECTION.md § Signature; storyboard in `05-signature-stamp.png`).
   - Vertical pan on the number with per-digit rolling wheels. `selectionAsync` fires per page, plus a light impact every 10.
   - A spring settle saves the page. Debounce the API call; the update must be optimistic.
   - At the last page: the FINISHED stamp lands (rigid impact, then success), the field drains, and stars rise. Undo is available for 5 seconds.
   - Reduced motion: cross-fades.
   - Mirror the automatic status rules from the API doc (page > 0 → reading; page = total → finished).
4. **Book detail.**
   - Cover with the status Stamp, which opens the native status menu.
   - Side column: title, author, year · pages, stars, "Read in N days".
   - Your review with Edit (review editor sheet with an `@expo/ui` Switch for private).
   - Reviews from people you follow.
   - Toolbar: heart, add-to-collection, ⋯.
   - A *reading* book's detail uses the field hero instead (colour = in progress).
5. **Search.**
   - Native search field. Books / Readers segmented picker from `@expo/ui`.
   - Source line ("From Echo's catalog" / Open Library).
   - Result rows with Want / Reading / Finished quick-add capsules, or "Finished · rated 4" plus a mini stamp when the book is already owned.
   - Infinite scroll. The Readers segment is Find users, with Follow / Following.
6. **Friends feed.**
   - "started reading" items are full-bleed field bands with a 92pt cover and the plate title.
   - Finished items get a mini FINISHED stamp on the cover. Review items are clamped to 3 lines.
   - Infinite scroll on `hasMore`.
   - The empty state leads to Find users.
7. **Profile (You).**
   - Square avatar, name, @username, bio.
   - "19 books finished in 2026" as a PlateNumber, with pages read.
   - "Reading now" field band, then Favourites, Want, Finished shelves.
   - Edit and settings toolbar.
   - No streak.
8. **Collections and Premium.**
   - Add-to-collection sheet: collection colour + Lucide icon tile, checkmarks, counts, New collection.
   - The Premium paywall is a full field page with a PREMIUM stamp, shown to free users on any collection action.
9. **Signed-out flow and first run** (`10-launch` … `16-library-empty`). Clerk stays the auth provider, and the
   existing sign-in/sign-up logic is reused; only the UI changes.
   - **Launch:** the `expo-splash-screen` config is background `#FF6BA8` with the two-ribbon mark centred. No text.
   - **Welcome** (first open, signed out):
     - Pink field with a fan of three covers and a small FINISHED stamp.
     - "Every page, counted." with the plate offset, then a one-line sub.
     - "Continue with Apple" (black; use the native `expo-apple-authentication` button if it fits the look, otherwise
       follow Apple's button guidelines), "Continue with Google" (paper capsule, official 4-colour G), and a
       "Use email instead" text button.
     - Terms and Privacy links underneath, pointing to echoreads.app `/documents/terms-of-service` and `/documents/privacy-policy`.
     - On small screens the cover fan is hidden.
   - **Sign in** (paper):
     - Fields: Email, then Password with a show/hide eye.
     - The inline error sits under the field with a red border. Never use a toast for auth errors.
     - Also: Forgot password, the primary button in the thumb zone, and a footer link to Create an account.
   - **Create account:** Email and Password with a show/hide toggle and a live "8 characters or more" check.
     **No confirm-password field** (the show toggle replaces it).
   - **Verify email:**
     - Six code boxes in Archivo with the plate offset. The focused box gets an ink border and a pink caret.
     - Support iOS one-time-code autofill (`textContentType="oneTimeCode"`).
     - A resend countdown, an "Open Mail" outline button, and a "Change email" link.
   - **Username:** a blocking modal on the field, with a live preview card. Hide the preview card on small screens.
     OAuth users go straight here from Welcome.
   - **Empty library:** the field hero with a dashed empty cover slot, "What are you reading?", and a "Find a book"
     button that opens Search. Below, a paper note pointing to Find readers.
   - **Forgot password** (`24-reset-password`): step 1 reuses the Sign in layout with only the Email field and a
     "Send code" button. Step 2 is the drawn screen: code boxes, New password with a show/hide eye and a live
     check, "Save and sign in", and "Send it again". This uses Clerk's `reset_password_email_code` strategy.
10. **Secondary screens** (`17` … `23`).
   - **List view** (`17`): the Library list layout. Shelves other than Reading have no field, so the header sits on
     paper. Rows show a 44pt cover, title, author, and on the right ink stars plus the finish date ("Not rated" if none).
     A sort menu sits top-right ("Recently finished"), with "23 books · 6,412 pages this year" on the left. The toolbar
     toggle shows the list glyph when list view is active.
   - **Collection detail** (`18`, pushed):
     - The banner is full-bleed in **the collection's own colour** (never the pink field), with a white glass toolbar
       (back; grid/list toggle and ⋯ for Edit, Public/Private, Delete with confirm).
     - It shows the icon tile, the Archivo 44 name, the description, and "Private · 5 books".
     - If the collection has a cover image, it fills the banner behind a bottom scrim.
     - Books show in a 3-column cover grid.
   - **Collection editor** (`19`, large-detent sheet; the same layout serves New collection):
     - Toolbar: ✕ and ✓. Cover image picker. Name and Description (with counter) fields.
     - **6 riso-ink swatches**, mapped to the stored `"{palette}-{shade}"` tokens: ink → `zinc-700`,
       burgundy → `pink-700`, pink → `pink-300`, red-orange → `orange-500`, mustard → `amber-500`, teal → `teal-700`.
       Pick the closest hex for each in the theme. Legacy values (any of the 88) still render.
     - Icon row: 5 recent icons plus "More", which opens the searchable list of about 120 Lucide icons.
     - Public switch from `@expo/ui`.
     - In edit mode, add Delete collection (negative) at the bottom.
     - On small phones the cover and icon rows sit under a scroll.
   - **Review editor** (`20`, large-detent sheet):
     - Book row and editable stars. The rating saves through the rating endpoint, separately from the review.
     - A multiline field with an "N / 10,000" counter, and a Private switch with its explanation.
     - Delete review (negative, confirm) at the bottom. The keyboard covers the lower half while typing.
   - **Keyboards:** the auth forms (`12`, `13`, `14`, `24`) are drawn with the keyboard up. The primary button docks
     above it (use a keyboard-aware bottom inset), and the footer link hides while the keyboard is up. On small phones
     the view scrolls so the focused field, its error and the button stay visible. Verify uses the number pad.
   - **Find readers** (`21`): the Search › Readers segment.
     - Results appear after 2 characters, with "5 readers match …" above them.
     - Rows: square initial tile (or photo), name, @username, a 2-line bio, and a Follow (ink) / Following (outline) toggle.
     - Rows are not tappable until public profiles exist (API gap).
   - **Settings** (`22`, pushed from You): native grouped form via `@expo/ui`.
     - Account row (opens Edit profile).
     - Plan: Echo Premium with a LIFETIME stamp, plus "Paid once 4 Mar 2026". Monthly plans show "Renews 4 Nov 2026".
       Then Billing on echoreads.app.
     - App: Appearance, Language, Library layout.
     - Terms and Privacy links.
     - Sign out, and **Delete account**. App Store guideline 5.1.1(v) requires in-app deletion, and the API has no
       endpoint for it yet. Version number in the footer.
     - Free users see "Free" with a Premium row that opens the paywall.
   - **Edit profile** (`23`, large-detent sheet): square 96pt avatar with Add photo (S3 upload, API gap), Display name,
     Username (with the rules hint), and Bio with a counter. `PUT /profile` replaces every field, so always send them all.

## Things the design needs that the API does not have yet (see the API doc §8)

Stub these behind clearly named hooks, with a TODO and mock data. Do not invent backend endpoints silently:
- Book detail by **catalog** id, including the user's UserBook and review.
- Reviews filtered to followed users.
- Profile stats (books and pages this year).
- Paginated search.
- Username availability check.
- Image upload URLs.
- Delete account.

## Open decisions (ask the owner; do not decide)

1. **Premium purchase.** The design says "Continue on echoreads.app". App Review guideline 3.1.1 needs IAP, or the
   external-purchase link entitlement. Keep the button behind one component so the label and action can change.
2. **Account deletion.** Apple requires it, and the backend has no endpoint yet.
3. **Anything not drawn** (Want/Favourites grid view, the collection icon-picker list, the forgot-password step 1,
   error and loading states): build it in the same language (tokens, Archivo display, the paper/field rule, `@expo/ui`
   forms) and show the owner screenshots before polishing.

## How to verify each phase

- Run in the iOS Simulator (iPhone 17 Pro) using the same content as DIRECTION.md § Content (seed or mock it).
- Screenshot each screen and compare side by side with the matching `shots/r6` PNG: hero size, type scale, margins,
  colours, and where the pink appears.
- Check dark mode, the largest Dynamic Type size, and a small phone (SE-class).
- Run `npm run lint` and the TypeScript check.
