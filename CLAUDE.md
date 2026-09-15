# CLAUDE.md

Guidance for Claude (or any AI assistant) working in this repository.

## Project

CraftWare — marketing website for a real 3-person digital agency (Nisar B,
Tousif M, Mahir S) based in Hubli, Karnataka, India. Services: web
development, digital marketing, SEO, paid ads (Meta/Google), WhatsApp
automation, social media, branding.

## Tech stack — read this first

This is a **single static HTML file**. There is no build step, no bundler,
no package.json for the site itself, no framework.

- `craftware-design-v2.html` — the entire site (HTML + inline `<style>` +
  inline `<script>`). This is the ONLY file to edit for site changes.
- `assets/hero-showreel.mp4` — hero background video. Must stay in an
  `assets/` folder **sitting next to** the HTML file — it's referenced by a
  relative path (`assets/hero-showreel.mp4`), not embedded.
- `assets/hero-poster.jpg` — poster frame for the video, same folder.

There is also an old `craftware-react.zip` (React/Vite version) elsewhere in
project history. **It is stale and not maintained.** Do not use it as a
source of truth — the static HTML is the real, current site.

### How to preview

Open `craftware-design-v2.html` directly in a real desktop browser
(Chrome/Firefox/Safari — not a mobile "file preview" pane, which doesn't run
JavaScript). No server required, though a local static server works fine
too if preferred.

## File structure inside the HTML

Single `<style>` block, then body markup, then single `<script>` block at
the end of `<body>`. Section order top to bottom:

1. **Hero** (`section.hero`) — full-bleed video background, left-aligned
   headline, reveals 1.5s after load.
2. **Brand statement / "glass card"** (`section.brand-glass`) — the
   CraftWare logo stamp card. Circular reveal-mask wipe on scroll-in, curtain
   wipe + stamp-in animation on the card itself. Repeats every time scrolled
   into view (not one-time).
3. **Expertise** (`section.expertise`) — numbered service list
   (`.exp-row`). Hover reveals description + tag pills + a glossy "3D" icon
   badge per row. Real brand-colored badges for WhatsApp/Meta/Google/
   Instagram. Rows blur-reveal in once, on first scroll-into-view. Floating
   decorative logos scattered in the left column.
4. **Integrations** (`section.integrations`) — two-row, opposite-direction
   infinite-scroll icon marquee (`.int-grid-row-a` / `-b`), each row tripled
   for seamless looping. Background: an original canvas animation
   (`#jellyfishCanvas`) with drifting jellyfish, small fish, sun rays from
   the top-left, and a soft pulsing glow orb (`.glow-orb`, pure CSS). A
   `.glass-light-sweep` overlay makes the glass tiles catch the light in
   sync with the canvas.
5. Marquee, Work, About, Process, Testimonials, Contact, Footer.

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

## Known gotchas (hard-won this session — read before touching animations)

1. **CSS `transition` doesn't merge across rules.** If two selectors with
   *equal specificity* both set `transition:` on the same element, the one
   later in source order wins **completely** — not just for the properties
   it names, for the whole declaration. This silently killed a reveal
   animation for a long time. If you add hover-transition properties to an
   element, add them to the *same* rule as any existing transition, don't
   create a second one.
2. **`scroll-behavior: smooth` is set globally** (on `html`) and it makes
   `IntersectionObserver`-based triggers unreliable — the observer samples
   position at inconsistent points mid-scroll-animation. That's why
   `.exp-row` and the glass-card use manual `getBoundingClientRect()`
   checks on `scroll`/`resize` instead.
3. **Never embed large video as a base64 data URI.** It's unreliable across
   real browsers even though small images work fine that way. Video must
   be a real file referenced by relative path.
4. **Windows zip-preview ≠ extraction.** Double-clicking into a `.zip` in
   File Explorer only pulls the one file you open into a temp folder — the
   `assets` folder won't come with it. Users must fully extract first.
5. Don't build effects that depend on WebGPU or other narrow browser
   support without a fallback — a hard `navigator.gpu` check means the
   whole feature silently fails on unsupported browsers.

## Deployment

Pushed via git to the user's local repo at (their machine) — branch
`mahir`. No CI/CD configured as of this writing.
