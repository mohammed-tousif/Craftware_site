# CLAUDE.md

Guidance for Claude (or any AI assistant) working in this repository.

## Project

CraftWare — marketing website for a real 3-person digital agency (Nisar B,
Tousif M, Mahir S) based in Hubli, Karnataka, India. Services: web
development, digital marketing, SEO, paid ads (Meta/Google), WhatsApp
automation, social media, branding.

## Tech stack — read this first

The public site is **one static HTML file**, but it is no longer
backend-free: there's a small admin + API (see "Admin panel & API" below).
The design rule that keeps this safe: **visitors never depend on the
database.** Admin-managed content is baked into the static HTML at build
time, so the live site stays fast, crawlable and up even if the database
is down. History: an earlier Supabase review/CMS backend (17 Sep 2026)
loaded content client-side and was removed the same day; the current one
was built deliberately (Sep 2026) as a leads inbox + build-time CMS.

- `craftware-design-v2.html` — the whole public site (HTML + inline
  `<style>` + inline `<script>`). Regions between `<!-- cms:NAME -->` and
  `<!-- /cms:NAME -->` (work, stats, clients, testimonials) are
  **generated** — edit that content in `/admin` (or `content/seed.json`
  before a database exists), never by hand inside the markers.
- `admin.html` — the admin panel (vanilla JS, same brand), served at
  `/admin`, `noindex`. All data comes from `/api/admin/*` behind a login.
- `api/lead.js`, `api/admin/[action].js` — Vercel serverless functions
  (one admin function on purpose: Hobby caps a project at 12). Shared code
  in `lib/` (`db.js`, `auth.js`, `render.js`, `mail.js`, `storage.js`,
  `http.js`).
- `scripts/build.mjs` — the Vercel build (renders the cms regions into
  `dist/`); `scripts/setup-admin.mjs` — sets the admin password;
  `content/seed.json` — the content the database starts from on first run.
- `assets/hero-showreel.mp4` — desktop hero background video, 1920×1080
  (16:9), 60fps, 20s seamless loop, ~3.2MB. Must stay in an `assets/`
  folder **sitting next to** the HTML file — referenced by a relative
  path, not embedded.
- `assets/hero-showreel-mobile.mp4` — separate hero video for narrow
  screens, 1080×1920 (9:16), 60fps, 20s loop, ~3.2MB — composed for a
  tall mobile frame instead of being a cropped desktop video. Used on
  **every portrait screen** — phones and upright tablets — via
  `(max-width:700px), (orientation: portrait) and (max-width:1100px)`;
  the 16:9 cut cropped its animation off the sides on an upright iPad.
  The `<source>` carries only `data-src` / `data-src-mobile` (no real
  `src`): a small inline `<script>` right after the `<video>` sets the
  right src and poster before anything is fetched — deliberately NOT
  `<source media>`, which has autoplay quirks on mobile browsers. Putting
  a real `src` back in the markup makes phones start (then abort) the
  desktop file. Matching conditional `<link rel="preload" media="...">`
  tags in `<head>` use the same two complementary queries, so only one
  video is ever fetched. Upright tablets also get `object-position:50% 0%`
  so the crop comes off the calm bottom band, not the scene titles.
- Both hero videos are motion graphics rendered frame-by-frame (not stock
  footage, not a screen recording) by a separate local project that is
  **not in this repo**: `C:\Users\mdtou\project\craftware-hero\` on
  Tousif's machine — `node render3d.mjs --f=desk|mob --crf=24
  --tune=animation --suffix=web` (WebGL2 in headless Chrome → ffmpeg).
  Design rules they follow, which any replacement should keep: every
  moving layer is periodic in the loop length so the loop point is
  invisible; frame 0 is the bare background (so the poster = frame 0 and
  playback starts without a flash); all motion stays right of the
  bottom-left headline on desktop / in the upper band on mobile, and that
  headline zone is dimmed and effect-damped inside the video itself.
  Encode muted (`-an`), `+faststart`, and keep each file ≲5MB.
  **Desktop safe area (hard-won):** the hero is `object-fit:cover` in a
  `100svh` box, so on short, wide laptop windows (≈1366×650 once browser
  chrome and the taskbar are gone) the 1080p frame is cropped ~140px top
  and bottom, and the fixed nav hides the next ~70px. Anything that must
  be read — scene titles, chips — has to sit inside roughly y 260–920 of
  the 1920×1080 frame, and right of x≈1000 (at 1280–1366px widths the
  site headline reaches ~x900 of the frame). The first v2 render put
  titles at y≈180 and they vanished under the nav on a real laptop. Test
  a new hero video at 1366×650, not just 1440×900/1920×1080 — those
  aspect ratios crop sideways instead and hide the problem.
- `assets/hero-poster.jpg` / `assets/hero-poster-mobile.jpg` — poster
  frames (frame 0) for the desktop/mobile hero videos. The `<video
  poster>` attribute can't media-query itself, so the same inline script
  swaps in the mobile poster.
- `assets/og-image.jpg` — 1200×630 Open Graph / Twitter share image (the
  logo + wordmark end card of the hero video). Separate from the posters
  on purpose: frame 0 is an empty background, which makes a blank share
  card.
- `assets/blackhole-bg.mp4` (1080p, ~3.5MB) / `assets/blackhole-bg-mobile.mp4`
  (540×960 portrait centre crop, ~0.55MB) — Integrations section background
  video; the lazy loader picks the mobile cut at ≤700px (`data-src-mobile`).
  Deliberately **lazy-loaded** (see "Known gotchas" #6) — don't add
  `autoplay` back to its `<video>` tag or give the `<source>` a real `src`
  in the markup, that undoes the page-speed fix.
- `assets/team/founders.webp` (+ `.jpg` fallback) — the About photo, served
  through `<picture>`. It used to be a 261KB base64 blob inside the HTML.
- `favicon.svg` — **stale, no longer referenced.** Was a hand-drawn
  placeholder (navy square + yellow diamond) used before the agency had a
  finalized logo. Left on disk but unlinked from `<head>`; real favicons now
  come from `assets/brand/` (see below).
- `assets/brand/` — the real, finalized CraftWare logo (a 3D yellow/black/
  cream folded "C" mark) and everything derived from it:
  - `craftware-logo-master.png` — cleaned, upscaled (3x), transparent-bg
    high-res master. Source of truth for any future derivative; don't
    regenerate icons from a re-screenshotted or re-compressed copy.
  - `logo-nav.png` — the image used for `.logo-mark` in the nav (next to
    the "CraftWare" wordmark), transparent background, 207×240.
  - `favicon-32.png` / `favicon-192.png` / `favicon-512.png` — transparent
    PNG favicons, linked via `<link rel="icon" sizes="...">` in `<head>`.
  - `apple-touch-icon.png` — 180×180 with an **opaque navy (`#05080f`)
    background**, not transparent — iOS composites its own background
    behind a transparent touch icon and it looks wrong, so this one is
    flattened on purpose.
  - The original file the logo was sourced from was a background-removed
    export with dithered/noisy alpha and light edge-color bleed from the
    old dark background; it was cleaned up (alpha smoothed, edge colors
    decontaminated by pushing trusted opaque-pixel color into the fringe)
    before being trimmed/upscaled into the master. If a new logo file
    ever needs the same treatment, don't skip that step — the raw
    background-removal output has visible speckle/halo at any size above
    the small icon sizes it was probably tested at.
- `assets/work-previews/*.jpg` — real screenshots of each live Work-section
  project (1200×750, 16:10, JPEG ~15-105KB each). See Work section below
  for how these are captured and kept small. `quba-full.jpg`,
  `hershield-full.jpg`, `mi-auto-link-full.jpg` are tall (1200×1300–3000)
  stitched captures used for the desktop hover-scroll preview — served
  only to `(min-width:861px) and (hover:hover)` via `<picture>`, phones
  keep the short ones. Captured as 1440×900 viewport tiles with fixed/
  sticky elements hidden after the first tile (a single `fullPage`
  screenshot breaks on `100vh` layouts). Sites that are tap-to-open
  invitations or sticky-scroll layouts don't get one.
- `sitemap.xml`, `robots.txt` — at the repo root, referenced from `<head>`
  via `<link rel="canonical">` and pointed at `https://craftware.co.in/`.
  Single-page site, so the sitemap is deliberately one URL — add more only
  if the site ever grows real additional pages/routes.

There is also an old `craftware-react.zip` (React/Vite version) elsewhere in
project history. **It is stale and not maintained.** Do not use it as a
source of truth — the static HTML is the real, current site.

### How to preview

Open `craftware-design-v2.html` directly in a real desktop browser
(Chrome/Firefox/Safari — not a mobile "file preview" pane, which doesn't run
JavaScript), or serve the folder with any static file server
(`python -m http.server`, `npx serve .`). The committed file always holds
fully rendered content (from `content/seed.json`), so this keeps working.
The contact form and `/admin` need the API: run `vercel dev` after
`vercel env pull` to exercise them locally.

## Admin panel & API

**What it does.** `/admin` (one shared password) has four tabs:
- **Leads** — every contact-form enquiry (also emailed to
  craftwaretech@gmail.com with Reply-To set to the visitor): status
  new/contacted/won/lost/spam, private notes, search, CSV export.
- **Work** — the Work cards and the "Built with CraftWare" list: add/edit/
  hide/reorder, preview + optional tall hover-scroll image (uploads are
  resized in the browser, stored in Vercel Blob), categories, flags.
- **Numbers** — the numbers band; "live projects" counts visible
  projects automatically.
- **Testimonials** — rendered under "Built with CraftWare" only when at
  least one is visible. Real, permitted quotes only.

**Publishing.** Content edits are saved to the database but reach the site
only when someone presses **Publish**, which calls a Vercel Deploy Hook:
Vercel re-runs `scripts/build.mjs`, which reads the database and bakes the
content into `dist/craftware-design-v2.html` (~1 min). If the database
can't be read during a build, **the build fails on purpose** and Vercel
keeps the previous deployment live — never ship silent fallback content.
Without `DATABASE_URL` at all (before setup, local work) the build uses
`content/seed.json`.

**Security model.** One shared password, stored only as a scrypt hash
(`ADMIN_PASSWORD_HASH`); login issues a signed, 12-hour
`__Host-cw_admin` cookie (HttpOnly, Secure, SameSite=Strict, HMAC with
`SESSION_SECRET`). Every write also checks the `Origin` header. Logins are
rate-limited (8 failures / 15 min per IP), leads 5 per IP per 10 min, plus
a honeypot and a minimum-fill-time trap. IPs are stored only as salted
hashes. All SQL is parameterised (tagged templates), all rendered/emailed
text is escaped, links must be `https://` (or our own `assets/`), CSV
export neutralises spreadsheet formulas. The public form falls back to a
pre-filled WhatsApp link on any API failure, so an enquiry is never lost.

**Environment variables (Vercel → Settings → Environment Variables).**
| Variable | Set by | Purpose |
|---|---|---|
| `DATABASE_URL` | Vercel Storage → Neon Postgres (auto) | leads + content |
| `BLOB_READ_WRITE_TOKEN` | Vercel Storage → Blob (auto) | admin image uploads |
| `RESEND_API_KEY` | you, from resend.com | new-lead emails |
| `ADMIN_PASSWORD_HASH`, `SESSION_SECRET` | `npm run setup-admin` | admin login |
| `DEPLOY_HOOK_URL` | you, Settings → Git → Deploy Hooks (branch `main`) | the Publish button |
| `LEAD_FROM` (optional) | you, after verifying craftware.co.in in Resend | e.g. `CraftWare <hello@craftware.co.in>` |

Until `craftware.co.in` is verified in Resend, emails come from
`onboarding@resend.dev`, which Resend only delivers to the Resend
account's own address — so sign up to Resend **with craftwaretech@gmail.com**.
Functions run in `sin1` (Singapore, closest Vercel region to Hubli); create
the Neon database in Singapore too. The first build/request after the
database is connected creates the tables and imports `content/seed.json`
(guarded by a `meta.seeded` row, so it never re-imports over your edits).

**Plan note.** Vercel's Hobby plan is officially for non-commercial use;
a business site with a backend should be on Pro.

## File structure inside the HTML

Single `<style>` block, then body markup, then single `<script>` block at
the end of `<body>`. Section order top to bottom:

0. **Intro** (`#intro`) — branded curtain (logo, letter-by-letter
   CRAFTWARE, progress bar) shown **once per browser session**, never under
   reduced motion. Decided by a tiny inline script in `<head>` that adds
   `html.intro-on` before first paint, with a 6s failsafe that removes it
   even if the main script dies. Lifts after 1.3–2.0s (timed from
   navigation start, not from when the main script runs), then the hero
   reveals. See gotcha #9 before making it longer.
1. **Hero** (`section.hero`) — full-bleed video background, left-aligned
   headline + two CTAs ("Start a project" → #contact, "WhatsApp us" →
   wa.me), revealed as the intro lifts (≈350ms after load when there's no
   intro). See "Known gotchas" #5 for the mobile-specific overlay/brightness
   treatment.
2. **Brand statement / "glass card"** (`section.brand-glass`) — the
   CraftWare logo stamp card. Circular reveal-mask wipe on scroll-in, curtain
   wipe + stamp-in animation on the card itself. Repeats every time scrolled
   into view (not one-time). The watery displacement filter on the
   "CRAFTWARE" text is hover-triggered (plus one settle-in wobble on first
   scroll-into-view) — it is **not** a continuous scroll-driven effect,
   don't reintroduce that.
3. **Expertise** (`section.expertise`) — numbered service list
   (`.exp-row`). Hover reveals description + tag pills + a glossy "3D" icon
   badge per row. Real brand-colored badges for WhatsApp/Meta/Google/
   Instagram. Rows blur-reveal in once, on first scroll-into-view. Floating
   decorative logos scattered in the left column. **Touch devices** (no
   real `:hover`) get tap-to-expand instead via `.exp-row-open`, wired in
   JS behind a `matchMedia('(hover: none)')` check — accordion, one row
   open at a time. Icon badges are shown (smaller, 40px) on mobile too, not
   hidden.
4. **Integrations** (`section.integrations`) — two-row, opposite-direction
   infinite-scroll icon marquee (`.int-grid-row-a` / `-b`), each row tripled
   for seamless looping (loop distance is `-33.3333%`, i.e. one full copy —
   not `-50%`, which would leave a gap since the row is tripled, not
   doubled). Background: a looping black-hole/galaxy video
   (`.bh-video-el`, `assets/blackhole-bg.mp4`, **lazy-loaded**, see gotcha
   #6) with a slow zoom-in/out + brief shake at peak zoom (`bhVideoZoom`
   keyframes). A `.glass-light-sweep` overlay makes the glass tiles catch
   the light.
5. **Work** (`section.cases`) — six hand-built `.case` cards: Quba
   International, Kaksha, Her Shield, MI Auto Link, and two wedding/event
   invitations (Sumera & Hayat, Mohammed Yusuf). Equal-width `1fr 1fr`
   grid — text column + a real screenshot of the live site as a 16:10
   `<img class="fill-img">` inside `.case-visual`, with the existing
   rotating "VISIT SITE" circular badge (`.case-badge`) overlaid in the
   corner, linking out to the real live project. Screenshots live in
   `assets/work-previews/` as real JPG files (never base64/inline — see
   "Known gotchas" #3) — captured with headless Chrome, not a
   screenshot-taking tool that saves inline:
   ```
   chrome.exe --headless --disable-gpu --no-sandbox --hide-scrollbars \
     --window-size=1400,900 --screenshot="out.png" \
     --virtual-time-budget=8000 "<live URL>"
   ```
   then cropped/resized to 1200×750 (16:10) and saved as JPEG q82 via
   Pillow. If adding another project: give its `case-badge` circular-text
   `<textPath>` a **unique** id (`cp7`, not another `cp1`) — duplicate SVG
   ids make every card's circular text reference the first one. Pick a
   correct `data-cat` for the filter pills (`web`, `branding`, `marketing`
   — space-separated if more than one applies). Only add a project here
   with real, verifiable detail (what it is, why it was built, a live
   URL if one exists) — never a placeholder entry.
   Desktop extras (fine pointers only): 3D tilt + pointer-following glare
   (`.cv-glare`), and on the
   three cards with a tall capture (`.case-visual--scroll`, `--pan-dur`)
   the preview scrolls through the live site on hover. The old full-width
   dark gradient over every preview (for badge legibility) made light
   sites look muddy — the badge sits on its own dark disc instead.
6. **Numbers band** (`section.stats`) — 6 live projects, 8 services, 3
   founders, 100% in-house, counted up on first view. The markup holds the
   final numbers (no-JS/crawlers); JS resets to 0 then counts. **Every
   number must stay literally true** — update it when the work list or
   services change, never round up.
7. **About**, then **Process** (`#process`) — a scroll-driven timeline: the
   rail fills as the section scrolls and each step (`.proc-step.is-on`)
   lights when the rail reaches its dot; horizontal on desktop, vertical
   ≤860px. (The old per-section "texture switcher" CSS and the rotating
   conic borders on the cards were removed.)
8. **Built with CraftWare** (`#clients`) — big-type list of real, live
   projects with what we did for each; on desktop a live-site preview
   (`#clientFloat`) trails the pointer. Last row is a "Your brand, next."
   CTA. Only real projects belong here. When real client quotes arrive
   (name, business, one line, with their OK), add them to this section.
9. The yellow marquee sits between Integrations and Work. The old Testimonials section
   was **removed on purpose**: its four quotes (Emma R., Daniel K., Priya
   M., Rohan S.) were invented, not real clients — a credibility and
   consumer-protection risk. Only ever add testimonials that are real,
   attributable quotes from real clients who agreed to be quoted.
10. **Contact** — WhatsApp CTA pill, email card, and one row per phone
   number with separate Call (`tel:`) and WhatsApp (`wa.me`) actions (a
   whole-card `tel:` link can't also offer WhatsApp). The form panel is
   sticky beside the longer info column on desktop.
11. **Footer** (`footer.site-footer`) — big "Let's talk" CTA, four link
   columns, and a giant outlined CRAFTWARE wordmark whose font-size is
   fitted to the container width by script (`fitFooterWord`) — pure CSS
   `vw` sizing clipped the last letter at some widths.
12. **Floating WhatsApp button** (`#waFloat`) — appears after the hero,
   hides while the contact section or footer (which have their own
   WhatsApp links) are on screen, or while the mobile menu is open.
13. **Contact form** (`#contactForm`) POSTs to `/api/lead` (saved to the
   admin inbox + emailed). On any failure — not deployed yet, offline,
   rate-limited — it shows a pre-filled WhatsApp link instead, so an
   enquiry is never dropped. It used to be `onsubmit="return false;"`,
   which silently discarded every message — never ship a form without a
   real destination again. Honeypot (`botcheck`), fill-time trap (`t`)
   and inline validation.

## Design tokens (CSS custom properties on `:root`)

```
--navy: #05080f       --cream: #f2ede2       --sky: #57c2ef
--navy-2: #0b1120      --cream-2: #e9e2d2     --sky-dim: #2f7fa3
--ink: #0a0d15         --hero-bg: #f2ede2     --yellow: #ffcd3c
--display: "Big Shoulders Display"    --body: "Inter"
```

## Conventions established in this codebase

- **Scroll-reveal system has three flavors** — don't mix them up:
  - `.reveal` — fires once, via `IntersectionObserver`. Used for most
    sections (hero content, etc.).
  - `.reveal-once` — fires once, via a manual `getBoundingClientRect()`
    check on scroll/resize (NOT IntersectionObserver). Used for
    `.exp-row`. See "Known gotchas" below for why.
  - `.reveal-repeat` — toggles on/off every time the element scrolls in
    and out of view, same manual rect-check mechanism. Used for the
    glass-card / brand stamp.
  - A 2-second `setTimeout` safety net forces `in` class onto anything
    still not revealed, so content can never get permanently stuck
    invisible if a trigger fails.
- Tile/row duplication for infinite marquees: content is **tripled**, not
  doubled — two copies isn't enough width to guarantee no gap appears at
  wide viewports.
- Brand icon SVGs (WhatsApp, Google, Meta, Instagram) are original paths
  inspired by the real marks, not exact reproductions — kept intentionally
  recognizable since agencies routinely display client-platform logos.
- No-hover (touch) detection uses `window.matchMedia('(hover: none)')`,
  not user-agent sniffing or a screen-width check — follow that same
  pattern for any future touch-specific behavior.

## Signature interaction layer (desktop polish — read before adding effects)

- **Smooth scroll is Lenis v1.3.26, inlined** (pinned, MIT header kept, no
  CDN at runtime) and only enabled for `(hover:hover) and (pointer:fine)`
  and not under reduced motion — touch devices keep native momentum
  scrolling. Never call `window.scrollTo` for navigation; use
  `scrollToTarget(target, immediate)` so Lenis stays in sync. In-page `#`
  links are handled in one delegated listener. Sections carry
  `scroll-margin-top:84px` for the fixed nav and **Lenis honours it** —
  don't also pass an `offset`, it doubles (links landed at 168px).
- **No custom cursor.** The site uses the normal system pointer. A dot +
  trailing-ring cursor existed briefly and was removed at the owners'
  request — don't add one back.
- **Magnetic buttons, tilt, floating previews** are all
  fine-pointer-only and off under reduced motion. Magnetic elements
  (`[data-magnetic]`) and the floating preview move via the individual
  `translate` property from a rAF lerp — not `transform`, and no CSS
  transition — so they compose with each element's own hover transforms
  and don't collide with gotcha #1.
- **Kinetic headings**: add `data-split` to a heading (or
  `data-split="chars"` for letters) and it's split into masked words that
  rise on first view; nested spans like `.hl` keep their styling. Chars
  mode sets `aria-label` and hides the letter spans from assistive tech.
- **One scroll pass**: everything scroll-linked in this layer (progress
  bar, split reveals, counters, process rail, WhatsApp button, footer word,
  nav scroll-spy) runs in the single rAF-throttled `sigFrame()` — add new
  scroll-linked behaviour there instead of another listener.

## Known gotchas (hard-won — read before touching animations, the hero, or the Work section)

1. **CSS `transition` doesn't merge across rules.** If two selectors with
   *equal specificity* both set `transition:` on the same element, the one
   later in source order wins **completely** — not just for the properties
   it names, for the whole declaration. If you add hover-transition
   properties to an element, add them to the *same* rule as any existing
   transition, don't create a second one.
2. **`scroll-behavior: smooth` is set globally** (on `html`) and it makes
   `IntersectionObserver`-based triggers unreliable — the observer samples
   position at inconsistent points mid-scroll-animation. That's why
   `.exp-row` and the glass-card use manual `getBoundingClientRect()`
   checks on `scroll`/`resize` instead.
3. **Never embed large video or images as a base64 data URI.** It's
   unreliable across real browsers even though small images work fine
   that way, and it bloats the HTML file. The old Quba card once embedded
   a full-res screenshot as base64 (~250KB inline) — that's exactly why
   the Work section's screenshots are real files in
   `assets/work-previews/*.jpg`, referenced by a normal `<img src>`, not
   inlined. Keep them small (crop to 1200×750, JPEG q~80) when adding or
   replacing one. Same story for the hero: `.hero-media` once carried the
   old video's full 1920×1080 poster as a ~166KB base64 CSS background,
   which flashed a stale frame before the video started (and survived the
   video being replaced). It's plain `var(--navy)` now — the `<video
   poster>` covers that moment; don't re-inline a placeholder.
4. **Windows zip-preview ≠ extraction.** Double-clicking into a `.zip` in
   File Explorer only pulls the one file you open into a temp folder — the
   `assets` folder won't come with it. Users must fully extract first.
5. **The mobile hero keeps its own scrim.** On a phone the headline sits
   on top of the video, bottom-anchored. The `@media (max-width:700px)`
   block for `section.hero` replaces the desktop's left-to-right scrim
   (which fades out by 55% width — useless on a single-column layout)
   with a full-width, bottom-weighted one, adds a text-shadow as
   insurance, and applies a light `brightness(0.85)` dim. The dim used to
   be a heavy `brightness(0.6) saturate(0.85)` because the old video was a
   busy stock clip (faces, fake UI mockups); the current mobile video is
   composed around the headline, so the heavy dim just muddied it. Don't
   remove the block thinking it's redundant with the desktop styles, and
   if the hero video is ever swapped for busier footage, the heavier dim
   probably needs to come back. Also: the CSS previously had a whole
   family of `.hm-*` decorative "floating dashboard card" rules (blobs,
   browser-mockup cards, chat bubbles, etc.) — those were leftover from an
   earlier hero iteration and matched no HTML; removed as dead code. If a
   `.hm-*` class is ever wanted back, it needs new markup, not just CSS.
6. **The Integrations background video is lazy-loaded on purpose.** Its
   `<video>` has no `autoplay` and its `<source>` uses `data-src` instead
   of `src` — a small `IntersectionObserver` (`lazyLoadBlackHoleVideo` in
   the script) sets the real `src` and calls `.play()` once the section is
   ~600px from the viewport. This avoids a second multi-MB video
   competing with the hero video for bandwidth on first paint. Don't
   "fix" this by adding `autoplay`/a real `src` back — that's a page-speed
   regression, not a bug.
7. Don't build effects that depend on WebGPU or other narrow browser
   support without a fallback — a hard `navigator.gpu` check means the
   whole feature silently fails on unsupported browsers.
8. **No dead dependencies.** The page used to load three.js (~150KB,
   render-blocking, from a CDN) for a WebGL black-hole shader that was
   switched off (`USE_SHADER = false`) in favour of the video — every
   visitor paid for it and nothing used it. Both the library and the
   ~220-line parked shader were removed. If an effect is parked, remove its
   code and dependency too; git history has it if it's ever wanted back.
9. **The intro is on the LCP critical path.** Google's Largest Contentful
   Paint is the hero text, which can't appear until the intro lifts. On a
   throttled mid-range phone the main script only runs at ~1.2s, so the
   intro is timed from navigation start (`performance.now()`), capped at
   2.0s regardless of the video (the video opens on the same empty frame
   as its poster — there's nothing worth waiting for), and the hero text
   fades in over .45s (the rise keeps .9s). Measured on a 4G/4×CPU
   profile: LCP 6.4s before this upgrade → ~3.5s. Don't lengthen the
   intro or re-add opacity-heavy delays without re-measuring.

## SEO

`<head>` carries a real title/description (Hubli/Karnataka + service
keywords), canonical URL, Open Graph + Twitter card tags (image is
`assets/og-image.jpg`, 1200×630 — the end card of the real hero video,
with explicit `og:image:width/height/alt`), and a `ProfessionalService` JSON-LD block listing the
real services from the Expertise section. `sitemap.xml` + `robots.txt` live
at the repo root. Deliberately **no `<meta name="keywords">` tag** — Google
has ignored it for years; real keyword coverage comes from the title,
description, headings and schema instead, not a legacy meta tag.

If the canonical domain ever changes from `https://craftware.co.in/`,
update it in four places: the `<link rel="canonical">`, `og:url`,
`og:image`/`twitter:image`, and the JSON-LD `url` field — plus
`sitemap.xml` and `robots.txt`.

## Deployment

Pushed via git to GitHub (`main`), deployed on Vercel
(`craftware-site.vercel.app`, also reachable at `craftware.co.in` once DNS
finishes propagating). No CI beyond Vercel's own git-push deploy (plus
the admin's Publish button, which triggers the same production build via
a Deploy Hook).

**`.vercelignore` is a whitelist — keep it that way.** Only
the site files (and, since the admin, the API/build files listed below)
are ever uploaded. Before it existed, a CLI deploy
(`vercel --prod`) uploaded the whole working folder, tracked or not, and
the team notes (`MEMORY.md`, `CLAUDE.md`, `SESSION-HANDOFF.md`, `KB.md`),
a 5MB source zip and the untracked `legacy-red-white/` Next.js app were all
publicly downloadable at `craftware.co.in/<file>`. If the site ever needs
a new top-level file, add it to the whitelist explicitly.

`vercel.json` runs `npm ci` + `node scripts/build.mjs` and serves `dist/`
(`framework` stays `null` — without that, Vercel falls back to a cached
Next.js config from an early version of this project). It also sets
security headers on every response
(`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`,
`Permissions-Policy`) and a 1-day cache (+7-day stale-while-revalidate) on
`/assets/*`. Asset names aren't content-hashed, so after replacing an
asset in place expect up to a day of stale copies for returning visitors;
rename the file if a change must be instant.

`.vercelignore` whitelists `api/`, `lib/`, `scripts/`, `content/`,
`admin.html` and `package*.json` alongside the site files.

Big changes go through a branch first: pushing a non-`main` branch gets a
Vercel **preview** deployment (the team can review it logged in to
Vercel) before anything reaches craftware.co.in.
