# CraftWare Site — Knowledge Base

A detailed reference for anyone (human or AI) picking up this project.
For quick orientation, see `CLAUDE.md`. This file goes deeper on *why*
things are built the way they are.

---

## 1. Business context

- **CraftWare** — real digital agency, Hubli, Karnataka, India.
- Team of 3: Nisar B, Tousif M, Mahir S.
- Contact: craftwaretech@gmail.com, +91 87229 73448.
- Real client example used in the portfolio: **Quba International**
  (Umrah/Hajj/Ziyarat travel agency) — their live site
  (qubainternationaltravelshubli.com) was also used as a direct style
  reference for the hero layout (left-aligned text, eyebrow tag, stat row
  pattern) at one point.
- Services offered (also the icon-grid content): Web Development, Digital
  Marketing, SEO, Meta Ads, Google Ads, WhatsApp Automation, Social Media,
  Branding, Ecommerce, Landing Pages, Content, Email, Analytics, Design,
  Automation, Hosting.

## 2. Deliverables

| File | Status |
|---|---|
| `craftware-design-v2.html` | **Active, maintained.** The real site. |
| `assets/hero-showreel.mp4`, `assets/hero-poster.jpg` | Active, ships with the HTML. |
| `craftware-react.zip` (React/Vite rebuild) | **Stale.** Built early on, never kept in sync after the static HTML took over as the working file. Do not treat as current. |
| `craftware-site.zip` | Packaging of the HTML + assets folder together, rebuilt and handed off after each round of changes, so video/assets are never separated from the HTML file. |

## 3. Section-by-section history and rationale

### Hero
- Full-bleed background video (`hero-showreel.mp4`) — a "SaaS explainer"
  style animation (floating dashboard cards, service tags) the user
  supplied, compressed from ~26–40MB down to ~3.5–4.3MB for web (`ffmpeg`,
  scaled to 1600px wide, audio stripped since the video plays muted anyway).
- A still frame from the video is baked into the CSS as a base64
  `background-image` fallback on `.hero-media`, so *something* always shows
  even if the video file can't load (e.g. wrong folder structure).
- Text is left-aligned (not centered) and positioned toward the lower half
  of the frame, matching the Quba International reference and avoiding
  overlap with the video's own baked-in wordmark graphic.
- Entrance: reveals 1.5s after load, rising up from below
  (`.reveal-item`), so the video is visible clean for a beat before text
  appears.
- CTAs and a stats row were added then explicitly removed per user
  request — if re-adding, check with the user on copy/content first
  rather than reusing old placeholder numbers.

### Brand statement / "glass card" (`section.brand-glass`)
- A cream rounded card with the CraftWare sticker-style logo, "DESIGN •
  CODE • GROWTH" tags, tagline, and a footer row with a rotating circular
  "let's work together" badge.
- **Circular reveal mask**: as the section scrolls into view, a growing
  `clip-path: circle()` (anchored bottom-left) sweeps across, unveiling the
  cream content over a navy backdrop — inspired by a Google Labs demo site
  the user shared (corner-anchored circular page-transition wipe).
- **Card's own reveal**: a yellow curtain panel slides off the card,
  the logo "stamps" in with a scale-overshoot bounce (plus a one-time
  spike on the existing mouse-reactive SVG turbulence filter for a subtle
  wobble), then tags/tagline/footer stagger in.
- This section's reveal **repeats** every time it's scrolled away from and
  back to (`.reveal-repeat`) — the user specifically wanted this one to
  replay, unlike most of the site's one-time reveals.

### Expertise (`section.expertise`)
- Numbered list (01–08) of services, each row expandable on hover:
  description text + 4 tag pills fade/slide in, row gets a colored
  left-accent border matching its icon color.
- Each row also carries a "3D glossy" icon badge (`.exp-thumb`) — rounded
  square, gradient background, glass-highlight overlay, drop shadow — that
  appears on hover only. WhatsApp/Meta/Google/Instagram badges use their
  **real brand colors** as an inline `--tc` override (not the row's
  generic alternating accent), since the user specifically asked for
  realistic branding here.
- Rows blur/rise into view once, the first time each row is scrolled into
  view (`.reveal-once`) — not on every scroll pass, per explicit request
  ("I don't need that" re: repeat-blurring on scroll-back).
- Left column has floating decorative icons (WhatsApp, Google, Meta,
  Instagram, SEO, plus a couple of generic shapes) using the existing
  `.float-icon` gentle bob/rotate animation, added because the column
  looked plain.

### Integrations (`section.integrations`) — icon grid + underwater scene
- **Icon marquee**: two rows, opposite scroll directions, each row's 8
  unique tiles **tripled** (24 tiles/row) so the loop never runs out of
  content and shows a gap at wide viewports. `overflow:hidden` on the
  viewport container is load-bearing — it was accidentally dropped once
  during a CSS rewrite and caused exactly this gap bug.
- Icons are "real logo" style: WhatsApp (green speech bubble), Google Ads
  (four-color G), Meta Ads (blue infinity loop), Social→Instagram
  (gradient camera icon), rest are polished filled badges in the tile's
  accent color.
- **Background canvas** (`#jellyfishCanvas`) — fully original code,
  loosely inspired by a WebGPU jellyfish/physics project the user shared
  (`aurelia-master.zip`). That project was **not integrated directly**: it
  hard-requires `navigator.gpu` (WebGPU) and is a tightly-coupled
  15+-file physics/shader simulation that can't be safely dropped into a
  static page without a build pipeline and a WebGPU-capable browser to
  test against. Built an original plain-Canvas2D equivalent instead so it
  works everywhere:
  - 3 jellyfish (bezier bell + wavy tentacle lines), positioned in open
    areas (top-left, top-right, bottom-center) so they're never hidden
    behind text/icons.
  - 5 small fish swimming across at varying heights/speeds.
  - Sun rays fan out from the top-left corner (moved here from
    center-top per request), with a warm radial bloom at the source.
  - `.glow-orb` — a separate, pure-CSS pulsing radial-gradient sphere
    behind everything, kept deliberately subtle (low opacity) since a
    solid/dark version was too dominant against the light cream
    background and hurt text readability.
  - `.glass-light-sweep` — an overlay on the tile grid using
    `mix-blend-mode: overlay` with a radial gradient whose position is
    driven by the same animation clock as the sun rays, so the glass
    tiles visibly brighten as the light "passes" over them.

## 4. Debugging war stories (so they aren't repeated)

- **The transition-override bug.** `.exp-row` had a hover-color
  transition added later; `.exp-row.reveal-once` (equal specificity, but
  earlier in source order) had the blur/rise transition. CSS transition
  is a shorthand — only one of the two rules' `transition:` declarations
  ever applied, not a merge of both. The blur reveal was silently dead
  for a long time before this was found by directly inspecting
  `getComputedStyle(el).transitionProperty` in a real headless browser
  test. Lesson: when adding transitions to an element that already has
  some, extend the existing rule, don't add a new one with equal
  specificity.
- **`IntersectionObserver` + `scroll-behavior: smooth` don't mix well.**
  Verified via repeated Playwright tests that the observer sometimes
  didn't fire at all for many hundreds of milliseconds after an element
  was clearly on-screen, when the page had smooth scrolling enabled. All
  reveal triggers were migrated to manual `getBoundingClientRect()`
  checks on `scroll`/`resize` (throttled with `requestAnimationFrame`)
  instead, which tested reliably across many repeated cycles.
- **Base64 video embedding fails.** Tried embedding the hero video
  directly as a `data:video/mp4;base64,...` URI so the site would be a
  single self-contained file. It decoded to a perfectly valid MP4 file
  (verified with `ffprobe`) but browsers still failed to load it as a
  `<video>` source — a real, known limitation of large data URIs in
  video elements, not a corruption issue. Reverted to a real file
  referenced by relative path, and started shipping the HTML + assets
  folder together as a zip so they can't get separated.
- **File-path confusion cost a lot of back-and-forth.** Root causes,
  roughly in order encountered: (1) opening the HTML without the
  sibling `assets` folder, (2) opening a file *from inside* a zip via
  Windows Explorer's virtual browsing rather than a real extracted
  folder (address bar showed a `Temp\...zip\...` path), (3) opening an
  entirely unrelated old React build by mistake. Now always explicitly
  says "right-click → Extract All" and gives the expected address-bar
  path shape to self-check against.
- **A safety-net `setTimeout`** forces every reveal-gated element visible
  after 2 seconds regardless of whether its trigger fired, specifically
  because a scroll-reveal system with no fallback risks leaving real
  content (not just decoration) permanently invisible if any one part of
  the detection breaks in some browser/environment.

## 5. Deployment

- Git repo lives on the user's machine; pushed a `mahir` branch containing
  the latest `craftware-design-v2.html` + `assets/`.
- No CI/CD or hosting pipeline set up yet as of this writing.
