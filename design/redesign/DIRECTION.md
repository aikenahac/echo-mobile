# Echo — redesign direction

## Brief (self-authored from the handoff doc; one hard requirement from the user)

1. **App and audience.** Echo is a social reading tracker, a Goodreads alternative, for people who read
   a book or three a month and want to remember them, see what friends are reading, and not be sold to.
2. **Core action.** Open the app mid-book and log the page you stopped on. Everything else (search, rate,
   review, follow) happens a few times a week; logging pages happens most days.
3. **Feel.** Warm, literate, a little loud. References outside apps: a fluorescent risograph zine from an
   independent bookshop, the ribbon marker sewn into a hardback, a well-lit bookshop window at night.
4. **What exists.** Name "Echo" / echobook.club. Primary pink (web: `oklch(0.823 0.12 346)` ≈ `#F5A3C7`,
   mobile: `#FDA5D5`). EB Garamond + IBM Plex Mono on the web. Real covers in `design/covers/`.
5. **Need.** A complete redesign of the mobile app covering the handoff's feature list.
6. **Hard requirement (user):** the primary colour is a nice shade of pink.
7. **Image generation:** none used. Imagery is the book covers themselves.

## Current app

- **Look:** shadcn/React Native Reusables defaults. Cool slate-white ground `#F8FAFC`, pastel pink `#FDA5D5`
  used as a tab tint, lavender secondary, EB Garamond everywhere, 0.15rem corners, "My Library" heading,
  a drawer to pick a shelf, a 2-column grid of covers with "168 / 245" under each.
- **Slop tells it hits:** title-only hierarchy (everything 14–16pt except the title), the shelf hidden in a
  drawer, page progress as grey caption text under a cover, pastel pink that fails contrast as text
  (`#FDA5D5` on white ≈ 1.7:1), the feed tab is "under construction".
- **History row for the current look:** `printed | light | serif | pink | photo`.

### Inventory (contract: every "keep" is in the redesign)

| Keep | Notes |
|---|---|
| Shelves: Reading, Want to read, Finished, Favourites (filter) | Reading is the default |
| Grid / list toggle, remembered per device | |
| Page stepper − / current / pageCount / +, editable current and total | the core action |
| Automatic status transitions (page > 0 → Reading, page = total → Finished) | designed as the signature |
| Favourite heart, star rating (finished), status change, add to collection, remove (confirm) | |
| Search: hybrid catalog, source badge, three quick-add actions, load more | |
| Book detail: cover, meta, status, dates, progress, rating, my review (private toggle), friends' reviews | |
| Reviews: one per book, public/private, 10,000 chars | |
| Find users + follow toggle | |
| Feed: started / finished / review items, infinite scroll, empty state → Find users | |
| Collections (Premium): name, description, colour, Lucide icon, cover, public toggle, paywall | |
| Profile: avatar, name, @username, bio, edit, stats (books this year, pages read), shelves | streak dropped (not implemented) |
| Premium / Settings, legal links, sign out | |
| Mandatory username onboarding | blocking |

### Decisions for you

1. **Tab structure:** Library · Feed · Profile, with Search as its own glass button (iOS 26 pattern),
   instead of four equal icon-only tabs. Find users lives inside Search (a "Books / Readers" switch).
2. **Day streak** is dropped from the profile stats until the backend has it (it is hard-coded to 0).
3. **Collection colour:** the 22×4 Tailwind palette stays in the data model, but the picker offers
   12 curated colours so collections do not fight the pink. Old values still render.
4. **Premium purchase on iOS** is designed as "manage on the web" (no in-app buy button) until IAP is decided.

## Exploration (explore.html, shots/explore/sheet.png)

| | Concept | Family | Ground | Type | Richness |
|---|---|---|---|---|---|
| A | Echo is a hardback with a ribbon marker | object | light | serif (New York) | photo (covers as objects) |
| B | Echo is a fluorescent-pink riso zine from an indie bookshop | printed | colour-field | condensed (Archivo) | colour-material (duotone print) |
| C | Echo is a bookshop window at night | place | dark | expanded (SF Pro) | photo (cover lights the room) |

The brief fixes the hue to pink, so the "three accent hues" rule is replaced by three different pinks in three
different roles (ribbon, paper, light).

**Chosen by the user: merge A + B.**
- From **B**: pink as a *colour field*, not a tint; Archivo Condensed black display type; black ink on pink; the
  numbering-stamp page counter.
- From **A**: a light rose-white paper ground for everything that is not "now"; real full-colour covers as objects
  with a soft book shadow; hairline rows instead of cards.
- **C lost** because pink shrinks to a slider fill and the blurred-cover ground reads as an ambient blob.

**Colour is information:** the pink field means *in progress*. It sits behind the book you are reading (Library,
Profile "Reading now", a Reading book's detail). Finished and wanted books sit on paper.

**History check** vs the current app (`printed | light | serif | pink | photo`): the merge is
`printed | colour-field | condensed | pink | colour-material`, which differs on ground, type and richness (3 of 5).

## Category default refused

Goodreads, StoryGraph and Fable share: a beige/brown or white "library" ground, a serif title, a 3-column cover
grid, a stats dashboard with donut charts, and stars in yellow/orange. The category colour cliché is
**brown-and-cream library wood** (and Goodreads' tan). Refused: no cream, no wood, no donut charts, no yellow stars
(stars are ink), no cover-grid home screen. The first screen is the book you are reading and the page you are on.

## Tokens

| Role | Light | Dark |
|---|---|---|
| `paper` (ground) | `#FBF7F8` | `#130A0E` |
| `field` (in-progress ground, the pink) | `#FF6BA8` | `#5C1738` |
| `ink` | `#170B11` | `#FFE8F1` |
| `ink-2` | `#6B5560` | `#C9AEBA` |
| `ink-3` | `#9A8590` | `#8F7782` |
| `rule` | `#EADCE2` | `#2E1C24` |
| `pink-ink` (accent as text/glyph on paper: hearts, progress bars, links) | `#B3165A` | `#FF8CBF` |
| `on-field` | `#170B11` | `#FFE8F1` |
| `negative` | `#C2312B` (remove, delete only) | `#FF6B62` |

**Accent role:** pink means *now / in progress* and the primary action. System tint = `pink-ink`.

**Type:** Archivo (variable, `wdth 62` = Condensed) for display, page numbers and book titles in heroes. SF Pro for
all UI and reading text. Steps: 120 (page number) / 44 (screen title) / 28 (hero book title) / 17 (row title,
body) / 15 (secondary) / 13 (metadata) / 11 (captions, tab labels). Display tracking −2% to −3%, weights 900/800
against SF 400/600.

**Layout:** 20pt side margin. Spacing 4 / 8 / 12 / 20 / 32 / 48. Radius family: covers 2–4 (books are
square-cornered objects), fields 12, buttons capsule. No cards: hairlines (0.5pt `rule`) and space.

**Richness:** the covers, shot as objects (a 2pt spine-side radius, a long soft shadow cast down onto the ground),
and the pink field itself as a printed colour. Covers with no image become a designed fallback: a `field`
rectangle with the title set in Archivo Condensed black.

## Signature: the numbering stamp

On the Library hero, the page number is a numbering machine.

1. **Trigger:** drag vertically on the 120pt number (or tap +/−).
2. **Frames:** digits roll like the wheels of a numbering stamp, one wheel per digit, the units wheel fastest.
   Each page is a `.selection` haptic; every 10th page a `.impact(.light)`. Release → spring settle
   (`.spring(duration: 0.3, bounce: 0.15)`), the value saves.
3. **Finishing:** when the number reaches the last page, the wheels lock, a black **FINISHED** stamp lands on the
   cover at −6° (scale 1.25 → 1, 180ms, `.impact(.rigid)` then `.success`), the pink field drains down to paper
   (400ms, smooth spring: the book leaves "now"), and five ink stars slide up: "Rate it". Undo for 5 seconds.
4. **Reduced motion:** digits cross-fade, the stamp fades in, the field cross-fades to paper; haptics stay.

## Content

Today is Monday 12 October 2026. The reader is **Neža Kovač**, @neza.reads, Ljubljana, Premium (lifetime).

**Library — Reading (core).** Field hero: *Piranesi*, Susanna Clarke, page 168 of 245, "77 to go", "+12 today".
Shelf switch: Reading 3 · Want 7 · Finished 23 · Favourites 6. Also reading: *Orbital* (Samantha Harvey, 41 / 136),
*Tomorrow, and Tomorrow, and Tomorrow* (Gabrielle Zevin, 212 / 401, "last opened 21 Sep"). Collections: "Booker
2024 shortlist" 4, "Ishiguro, all of it" 3, "Winter rereads" 5.

**Book detail — James** (finished). Percival Everett, 2024, 303 pages, ISBN 978-0-385-55036-9. Finished 3 Oct,
read in 11 days (22 Sep – 3 Oct). Rated 5. Favourite. My review (public, 4 Oct): "Funnier than I expected, and then,
around page 200, not funny at all. The pencil chapter stays with you." From people you follow: Luka Novak
@lukan, 6 Oct: "Read it in two sittings. Huck Finn will never read the same." Ana Zupan @anazee, 9 Oct:
"The ending is a gunshot. I need a week."

**Friends (feed).** Luka Novak finished *Intermezzo* ★4, 2 h ago. Ana Zupan reviewed *Pachinko*, yesterday 21:14:
"Four generations and not one wasted page. Sunja is the best character I've met this year, and I read a lot of
Russians in the spring." Maja Horvat started *The Secret History*, yesterday. Tine Kralj finished *Klara and the
Sun* ★3, Saturday.

**Search — "ishiguro".** Books / Readers switch. "From Echo's catalog". *Klara and the Sun* 2021 · 303 pp — in your
library, Finished ★4. *The Remains of the Day* 1989 · 245 pp — Want / Reading / Finished. *Never Let Me Go* 2005 ·
288 pp, no cover — Want / Reading / Finished. *An Artist of the Floating World* 1986 · 206 pp (from Open Library).

**Profile.** Neža Kovač, @neza.reads, "Slow reader, fast opinions. Mostly fiction, mostly after midnight."
19 books finished in 2026, 6,412 pages. Reading now: Piranesi, Orbital, Tomorrow…. Favourites: James, Pachinko,
The Secret History, Remains of the Day, Klara and the Sun, Demon Copperhead.

**First run — username.** "Echo", "What should other readers call you?", field "neza.reads", "Available",
"3–30 characters: letters, numbers, _ and .", Continue.

**Launch.** Pink field with the two-ribbon mark. No text.

**Welcome (first open, signed out).** "Echo". A fan of three covers: Pachinko, Piranesi, and James with a FINISHED stamp.
"Every page, counted." "Log where you stopped, rate what you finish, and see what your friends are reading."
Buttons: Continue with Apple, Continue with Google, Use email instead.
"By continuing you agree to the Terms and Privacy Policy."

**Sign in (error state).** Email neza.kovac@gmail.com, password masked, "That password doesn't match this email.",
Forgot password?, Sign in, "New to Echo? Create an account".

**Create account.** "Free, with no limit on books. Premium only adds collections." Email, Password (shown via the
eye toggle), "8 characters or more" check, Create account, "Already have an account? Sign in".

**Verify email.** "Check your email". "We sent a 6-digit code to neza.kovac@gmail.com. It expires in 10 minutes."
Code 4 8 1 0 _ _, "Resend code in 0:42", Open Mail, "Wrong address? Change email".

**Empty library.** Shelves all 0, a dashed empty cover slot, "What are you reading?", "Add the book you have open.
Echo keeps your page from here on.", Find a book. Friends note: "People you follow show up in Friends when they
start or finish a book." Find readers.

**Library, Finished, list view.** "23 books · 19 this year", sorted by Recently finished:
- James ★5, 3 Oct
- Klara and the Sun ★4, 24 Sep
- Demon Copperhead ★4, 2 Sep
- The Remains of the Day ★5, 19 Aug
- Pachinko ★5, 30 Jul
- The Secret History, not rated, 2 Jul
- Intermezzo, not rated, 11 Jun

**Collection detail — Winter rereads.** Teal. Snowflake icon. "Books that are better the second time, with a blanket
and the lamp on." Private, 5 books: The Secret History, The Remains of the Day, Piranesi, Klara and the Sun, Pachinko.

**Collection editor.** Edit collection. Add a cover image (JPG, PNG or WEBP, up to 5 MB). Name, Description 71 / 1000,
6 riso-ink colours (teal selected), icon (snowflake selected) plus More, Public off: "Anyone with the link can see a public
collection."

**Review editor — Klara and the Sun**, finished 24 Sep, ★4. "Ishiguro does the thing again where the narrator
understands less than you do, and it hurts more each chapter. Klara's faith in the Sun is the most religious thing
I've read this year. / Docked a star for the last thirty pages, which explain too much" 298 / 10,000.
Private off: "Public reviews show on the book and in your followers' Friends feed." Delete review.

**Find readers — "ana".** "5 readers match":

| Name | Username | Bio | State |
|---|---|---|---|
| Ana Zupan | @anazee | Reads in Slovene and English. Mostly Russians. | Following |
| Anamarija Kos | @anamarija.k | Poetry, mostly. Some science fiction on trains. | Follow |
| Hana Šuštar | @hana.reads | Bookseller in Ljubljana. Ask me about translated fiction. | Following |
| Anže Petek | @anze.p | Crime novels and cycling books. | Follow |
| ana_bere | (none) | (no bio) | Follow |

**Settings.**
- Neža Kovač, neza.kovac@gmail.com
- Plan: Echo Premium (LIFETIME), Paid once 4 Mar 2026, Billing on echobook.club
- App: Appearance System, Language English, Library layout Grid
- Terms of Service, Privacy Policy
- Sign out, Delete account
- Footer: Echo 2.0 (214)

**Edit profile.** Add photo. Display name Neža Kovač. Username neza.reads. Bio 67 / 1000.

**Reset password.** "Set a new password". Code 2 7 0 9 1 5. New password, 8 characters or more, "Save and sign in",
"No code? Send it again".
