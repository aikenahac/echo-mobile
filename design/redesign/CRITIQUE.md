# Critique log

One independent critic (fresh agent), same agent every round. Rubric: app-designer `critique.md`, plus line 13 (Fidelity) for the redesign.

## Round 1 (shots/r1b)

| # | Line | Score |
|---|---|---|
| 1 | Concept on the pixel | 3 |
| 2 | Not the category average | 4 |
| 3 | Not this skill's average | 3 |
| 4 | Hierarchy | 4 |
| 5 | Typography | 3 |
| 6 | Colour | 4 |
| 7 | Richness | 3 |
| 8 | Rhythm and space | 3 |
| 9 | Craft details | 2 |
| 10 | Native fluency | 4 |
| 11 | Signature | 3 |
| 12 | Feature test | 3 |
| 13 | Fidelity | 3 |

**Asks**
1. Display tracking is too tight: word spaces vanish. Loosen it, and set Search titles in Archivo. **Done.**
2. Detail: fix the home-indicator collision, make the status a stamp, move the title under the cover. **Stamp and collision done; title move declined** (side-by-side keeps the cover large).
3. Storyboard: real wheels, a draining field, rising stars. **Done.**
4. Riso material: grain or halftone, misregistration, duotone avatars. **Misregistration done.** Grain declined (no noise textures). Duotone avatars declined (no user photos to use).
5. Library: an editable cue, two-line titles, a tighter gap. First run: fill the dead middle. **Done**, but the cue is an underline instead of helper copy.

**Also added:** an "Add to collection" sheet, because Collections was the critic's top missing screen.

**Scan warns answered**
- Shadows on 9 elements in Profile: deliberate. The covers are physical objects and nothing else casts a shadow.
- Icon chips in the collection sheet: deliberate. The colour and icon are user data stored per collection.
- Text under the home indicator in Detail: this is scroll content under an edge fade.

## Round 2 (shots/r2)

| # | Line | R1 | R2 |
|---|---|---|---|
| 1 | Concept on the pixel | 3 | 4 |
| 2 | Not the category average | 4 | 4 |
| 3 | Not this skill's average | 3 | 3 |
| 4 | Hierarchy | 4 | 4 |
| 5 | Typography | 3 | 4 |
| 6 | Colour | 4 | 4 |
| 7 | Richness | 3 | 3 |
| 8 | Rhythm and space | 3 | 3 |
| 9 | Craft details | 2 | 3 |
| 10 | Native fluency | 4 | 4 |
| 11 | Signature | 3 | 4 |
| 12 | Feature test | 3 | 3 |
| 13 | Fidelity | 3 | 3 |

**Asks, all taken in round 3**
1. First run on the small phone. **Done**, with the headline at 44 rather than 40 to stay on the type scale.
2. Profile: square avatar plus Want and Finished shelves. **Done.**
3. Detail: move the meta into the side column. **Done.**
4. Friends: a field band for "started reading", finished mini-stamps, riso-ink collection colours. **Done.**
5. Storyboard fill, Favourites back in the tab rows, stamp nudge, Premium paywall. **Done.**

## Round 3 (shots/r3): done by the stop rule

| # | Line | R1 | R2 | R3 |
|---|---|---|---|---|
| 1 | Concept on the pixel | 3 | 4 | 4 |
| 2 | Not the category average | 4 | 4 | 4 |
| 3 | Not this skill's average | 3 | 3 | 4 |
| 4 | Hierarchy | 4 | 4 | 4 |
| 5 | Typography | 3 | 4 | 4 |
| 6 | Colour | 4 | 4 | 4 |
| 7 | Richness | 3 | 3 | 4 |
| 8 | Rhythm and space | 3 | 3 | 4 |
| 9 | Craft details | 2 | 3 | 4 |
| 10 | Native fluency | 4 | 4 | 4 |
| 11 | Signature | 3 | 4 | 4 |
| 12 | Feature test | 3 | 3 | 4 |
| 13 | Fidelity | 3 | 3 | 4 |

**Fixed after the final critique (not re-scored)**
- Storyboard frame 3: the stamp is centred on the cover, so "of 245 pages" reads whole.
- Search: a FINISHED mini-stamp on Klara. Fallback covers are now ink on tint with a pink-ink spine, so they read as fallbacks.
- Premium on the small phone: the 4th benefit is hidden on purpose below 760pt height.

**Open before engineering**
- IAP decision: "Continue on echobook.club" needs the external-purchase entitlement (guideline 3.1.1), or switch to in-app purchase.
- Screens not drawn: find-users list, settings, review editor (with its private toggle), edit profile, collection detail and editor, Want/Finished shelf views, list view, sign-in.

## Round 4 (shots/r4): auth and first open, added after sign-off

Seven frames: launch, welcome, sign in (error), create account, verify email, the username screen (unchanged), and
the empty library. Checked by the scan (no FAILs at either size) and by eye. **Not scored by the critic.**

- The Google button is marked `data-system`: Google's brand rules require the 4-colour G, which the confetti check
  would otherwise flag.
- The verify-email screen has only 3 text sizes. That is deliberate: it is a form, and the code digits carry it.

## Round 5 (shots/r5): the 14 screens added after sign-off

Done by the stop rule. Colour, Rhythm and Craft scored 3; every other line scored 4. Defects named, all fixed in `shots/r6`:
1. Collection grid: equal columns with 2-line titles, an inset clear of the tab bar, and a clearer lock glyph.
2. Finished list: Intermezzo now says "Not rated", and the summary reads "23 books · 19 this year" so it matches Profile.
3. Swatches: cut from 12 to 6 riso inks.
4. Auth forms: drawn with the keyboard up and the button docked above it. On small phones the title scrolls away.
5. The Open Mail glyph is redrawn.
6. Small-phone empty library: the Friends note is hidden.
