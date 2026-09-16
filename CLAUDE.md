# CLAUDE.md

Guidance for Claude (or any AI assistant) working in this repository.

## Project

CraftWare — marketing website for a real 3-person digital agency (Nisar B,
Tousif M, Mahir S) based in Hubli, Karnataka, India. Services: web
development, digital marketing, SEO, paid ads (Meta/Google), WhatsApp
automation, social media, branding.

## Tech stack — read this first

The site itself is a **single static HTML file**. There is no build step, no
bundler, no framework for the page. As of the client-reviews feature, the
project also has a handful of Vercel serverless functions (plain Node, no
framework) — see "Client reviews backend" below.

- `craftware-design-v2.html` — the entire site (HTML + inline `<style>` +
  inline `<script>`). This is the file to edit for on-page site changes.
- `assets/hero-showreel.mp4` — hero background video. Must stay in an
  `assets/` folder **sitting next to** the HTML file — it's referenced by a
  relative path (`assets/hero-showreel.mp4`), not embedded.
- `assets/hero-poster.jpg` — poster frame for the video, same folder.
- `admin.html` — password-gated internal page for approving/rejecting
  submitted client reviews. Not linked from the public site nav; reachable
  at `/admin` (see `vercel.json` rewrite).
- `api/` — Vercel serverless functions (plain Node, `module.exports`, no
  framework/build step) backing the review-submission flow. See "Client
  reviews backend" below before touching any of this.

There is also an old `craftware-react.zip` (React/Vite version) elsewhere in
project history. **It is stale and not maintained.** Do not use it as a
source of truth — the static HTML is the real, current site.

## Admin backend (reviews, work items, contact info)

`/admin` (password-gated, `admin.html`) is a small CMS with three tabs, all
backed by Supabase Postgres via Vercel serverless functions in `api/`. The
public site fetches from the public (non-admin) endpoints on page load and
falls back to whatever's hardcoded in the HTML if a fetch fails — so the
site never breaks if Supabase/env vars aren't configured, it just shows the
static seed content.

- **`api/_supabase.js`** — shared helper, calls Supabase's REST API using
  the **service-role key** (server-side only, via env var — never sent to
  the browser, never hold it in the HTML/JS that ships to visitors).
- **`api/_auth.js`** — shared `checkAdminPassword(req)`, timing-safe compare
  against the `ADMIN_PASSWORD` env var, used by every `*-admin.js` route.
- Required Vercel environment variables (set in the Vercel project
  dashboard — never commit these): `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`,
  `ADMIN_PASSWORD`.

**Reviews** — visitors submit via the Testimonials section's "Add your
review" modal (star rating, quick-pick phrase chips that build the quote
text, free-text option). Table `reviews` (id, name, role, rating, quote,
status, created_at); `status` is `pending` / `approved` / `rejected`.
`api/reviews-submit.js` (public POST, honeypot spam check, always inserts
as `pending`), `api/reviews-list.js` (public GET, approved-only),
`api/reviews-admin.js` (password-gated GET/POST for `/admin`). Approved
reviews render in a separate static grid (`#realReviews`) below the
existing placeholder testimonial marquee — deliberately **not** injected
into the auto-scrolling marquee track, because that track's seamless-loop
animation depends on its cards being duplicated in an exact ratio (see the
marquee gotcha below); mixing a dynamic, variable-length list into it would
reintroduce the same gap bug that was already fixed once this session.

**Work / portfolio items** — added from `/admin`'s "Work / Portfolio" tab
(title, description, category checkboxes matching the Work section's
filter pills — web/branding/marketing, comma-separated tags, optional image
URL, optional live-site URL). Table `works` (id, title, description,
categories — space-separated, tags, image_url, site_url, display_order,
created_at). `api/works-list.js` (public GET), `api/works-admin.js`
(password-gated GET/POST create/update/delete). On page load, items are
fetched and appended as `.case` divs after the existing hand-built Quba
card in `section.cases .wrap`, reusing the same CSS (including the
`nth-child(even)` alternating layout, which just works since they're
appended in DOM order) and the same filter-pill logic. Each dynamically
added card generates a unique id for its `case-badge` circular-text
`<textPath>` (`cp-work-0`, `cp-work-1`, …) — duplicate SVG ids would make
every card's circular text reference the first one.
- The filter-pill click handler re-queries `.case` fresh on every click
  (rather than once at load) specifically so these dynamically-appended
  cards get included — don't revert that to a cached NodeList.

**Contact info** — editable from `/admin`'s "Contact Info" tab. Single-row
table `site_settings` (id always `1`, email, phone, location).
`api/settings.js` (public GET), `api/settings-admin.js` (password-gated
GET/POST). The Contact section's email/phone cards are real `mailto:`/`tel:`
links now (`#ctEmailCard`/`#ctPhoneCard`) whose `href` and displayed text
both get updated from the fetched settings.

**Traffic**: Vercel Web Analytics — just a `<script defer
src="/_vercel/insights/script.js">` tag in `<head>`. No admin.html
integration; view real numbers at vercel.com (Project → Analytics). Must be
toggled on in the Vercel dashboard for data to start collecting.

None of the `/api` routes (or Vercel Analytics) work under a plain static
file server (e.g. `python -m http.server`, used for local preview) — they
only run once deployed to Vercel with the env vars set. Every fetch to them
fails silently/gracefully in local preview (expected 404s, not a bug).

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
   for seamless looping (loop distance is `-33.3333%`, i.e. one full copy —
   not `-50%`, which would leave a gap since the row is tripled, not
   doubled). Background: a looping black-hole/galaxy video
   (`.bh-video-el`, `assets/blackhole-bg.mp4`) with a slow zoom-in/out +
   brief shake at peak zoom (`bhVideoZoom` keyframes). A
   `.glass-light-sweep` overlay makes the glass tiles catch the light.
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
