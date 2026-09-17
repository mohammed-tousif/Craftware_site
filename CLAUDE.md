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
- `assets/hero-showreel.mp4` — hero background video. Must stay in an
  `assets/` folder **sitting next to** the HTML file — referenced by a
  relative path, not embedded.
- `assets/hero-poster.jpg` — poster frame for the hero video; also reused
  as the Open Graph / Twitter share image (see `<head>`).
- `assets/blackhole-bg.mp4` — Integrations section background video.
  Deliberately **lazy-loaded** (see "Known gotchas" #6) — don't add
  `autoplay` back to its `<video>` tag or give the `<source>` a real `src`
  in the markup, that undoes the page-speed fix.
- `favicon.svg` — brand mark (navy square, yellow diamond, matches
  `.logo-mark` in the nav).
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
   mobile-specific overlay/brightness treatment — the video is a busy,
   landscape-composed stock asset and needs real help staying legible on
   a narrow screen.
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
5. **Work** (`section.cases`) — five hand-built `.case` cards: Quba
   International, Kaksha, Her Shield, MI Auto Link, and a wedding
   invitation (Gabriella & Zachary). **Deliberately no screenshots.** Each
   card's visual is an abstract gradient panel (`.fill` + `.fill-a`
   through `.fill-e`) with a large faint index numeral (`.fill-mark`) and
   the existing rotating "VISIT SITE" circular badge (`.case-badge`) —
   linking out to the real live project instead of embedding an image of
   it. If adding another project: give its `case-badge` circular-text
   `<textPath>` a **unique** id (`cp6`, not another `cp1`) — duplicate SVG
   ids make every card's circular text reference the first one. Pick an
   unused `fill-*` class (rotate back to `fill-a` after `fill-e`) and a
   correct `data-cat` for the filter pills (`web`, `branding`, `marketing`
   — space-separated if more than one applies). Only add a project here
   with real, verifiable detail (what it is, why it was built, a live
   URL if one exists) — never a placeholder/screenshot-only entry.
6. Marquee, About, Process, Testimonials, Contact, Footer.

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
3. **Never embed large video as a base64 data URI.** It's unreliable across
   real browsers even though small images work fine that way. Video must
   be a real file referenced by relative path. (This also applies to
   *screenshots* of other sites — the old Quba card embedded a full-res
   screenshot as base64, which both looked bad and bloated the HTML file
   by ~250KB. Use the `.fill`/`.fill-mark` abstract-panel treatment
   instead — see Work section above.)
4. **Windows zip-preview ≠ extraction.** Double-clicking into a `.zip` in
   File Explorer only pulls the one file you open into a temp folder — the
   `assets` folder won't come with it. Users must fully extract first.
5. **The hero video needs real help on mobile.** It's a busy,
   landscape-composed stock asset (faces, fake UI mockups) that dominates
   almost the whole viewport on a narrow phone, with the headline text
   sitting on top of it. The `@media (max-width:700px)` block for
   `section.hero` dampens the video's brightness, replaces the desktop's
   left-to-right scrim (which fades out by 55% width — useless on a
   single-column mobile layout) with a full-width, bottom-weighted one,
   and adds a text-shadow as insurance. Don't remove that block thinking
   it's redundant with the desktop styles — it's the fix for a real
   legibility bug, not decoration. Also: the CSS previously had a whole
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

## SEO

`<head>` carries a real title/description (Hubli/Karnataka + service
keywords), canonical URL, Open Graph + Twitter card tags (image is
`assets/hero-poster.jpg` — an actual frame from the real hero video, not a
generated asset), and a `ProfessionalService` JSON-LD block listing the
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
