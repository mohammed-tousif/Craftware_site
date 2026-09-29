# CLAUDE.md

Guidance for Claude (or any AI assistant) working in this repository.

## Project

CraftWare — marketing website for a real 3-person digital agency (Nisar B,
Tousif M, Mahir S) based in Hubli, Karnataka, India. Services: web
development, digital marketing, SEO, paid ads (Meta/Google), WhatsApp
automation, social media, branding.

## Tech stack — read this first

This is a **single static HTML file**. There is no build step, no bundler,
no framework, no backend. A Supabase-backed reviews/admin/CMS system
existed briefly (Vercel serverless functions under `api/`, a password-gated
`admin.html`) and was **deliberately removed** — a portfolio site doesn't
need one, and it added real ongoing cost/complexity for no benefit at this
stage. If a real lead/review pipeline is wanted later, the cheaper first
move is a hosted form service (Formspree, Web3Forms) or `mailto:`/WhatsApp
links, not rebuilding a custom backend.

- `craftware-design-v2.html` — the entire site (HTML + inline `<style>` +
  inline `<script>`). This is the only file to edit for on-page changes.
- `assets/hero-showreel.mp4` — desktop hero background video, 1920×1080
  (16:9), 60fps, 20s seamless loop, ~3.2MB. Must stay in an `assets/`
  folder **sitting next to** the HTML file — referenced by a relative
  path, not embedded.
- `assets/hero-showreel-mobile.mp4` — separate hero video for narrow
  screens, 1080×1920 (9:16), 60fps, 20s loop, ~3.2MB — composed for a
  tall mobile frame instead of being a cropped desktop video. Picked by a
  small inline `<script>` right after the hero `<video>` that swaps the
  `<source>` src (and the poster) via `matchMedia('(max-width:700px)')`
  before the video starts fetching — deliberately NOT `<source media>`,
  which has autoplay quirks on mobile browsers (see the comment in that
  script). A matching conditional `<link rel="preload" media="...">` in
  `<head>` means only one of the two videos is ever fetched.
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
- `assets/blackhole-bg.mp4` — Integrations section background video.
  Deliberately **lazy-loaded** (see "Known gotchas" #6) — don't add
  `autoplay` back to its `<video>` tag or give the `<source>` a real `src`
  in the markup, that undoes the page-speed fix.
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
  for how these are captured and kept small.
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
(`python -m http.server`, `npx serve .`). No build step, ever.

## File structure inside the HTML

Single `<style>` block, then body markup, then single `<script>` block at
the end of `<body>`. Section order top to bottom:

1. **Hero** (`section.hero`) — full-bleed video background, left-aligned
   headline, reveals 1.5s after load. See "Known gotchas" #5 for the
   mobile-specific overlay/brightness treatment.
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
6. Marquee, About, Process, Contact, Footer. The old Testimonials section
   was **removed on purpose**: its four quotes (Emma R., Daniel K., Priya
   M., Rohan S.) were invented, not real clients — a credibility and
   consumer-protection risk. Only ever add testimonials that are real,
   attributable quotes from real clients who agreed to be quoted.
7. **Contact form** (`#contactForm`) actually delivers. With
   `WEB3FORMS_KEY` set in the script, it POSTs to Web3Forms, which emails
   craftwaretech@gmail.com (the access key is public by design — it can
   only send to that inbox). With the key empty, or if the email API
   fails, the message is handed to WhatsApp (`wa.me/918722973448`,
   pre-filled with name/email/message) so an enquiry is never dropped. It
   used to be `onsubmit="return false;"`, which silently discarded every
   message — never ship a form without a real destination again. Has a
   hidden `botcheck` honeypot (Web3Forms convention) and inline validation.

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
finishes propagating). `vercel.json` pins `framework`/`buildCommand` etc.
to `null` — without that, Vercel falls back to a cached Next.js build
config from an earlier version of this project and the deploy fails
looking for an `app/` directory that no longer exists. No `/admin` rewrite
anymore (removed along with the backend). No CI beyond Vercel's own
git-push deploy.

**`.vercelignore` is a whitelist — keep it that way.** Only
`craftware-design-v2.html`, `assets/`, `robots.txt`, `sitemap.xml` and
`vercel.json` are ever uploaded. Before it existed, a CLI deploy
(`vercel --prod`) uploaded the whole working folder, tracked or not, and
the team notes (`MEMORY.md`, `CLAUDE.md`, `SESSION-HANDOFF.md`, `KB.md`),
a 5MB source zip and the untracked `legacy-red-white/` Next.js app were all
publicly downloadable at `craftware.co.in/<file>`. If the site ever needs
a new top-level file, add it to the whitelist explicitly.
