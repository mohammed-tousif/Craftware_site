# CraftWare — Project Memory / Handoff

> Single source of truth for the CraftWare website build. Read this first in any new session.
> For the full conversation narrative + the verbatim original brief, see `SESSION-HANDOFF.md`
> in this folder.
> Working directory: `C:\Users\mdtou\project\Craftware` (old `C:\Users\mdtou\Craftware` is dead).
> Last updated: 2026-09-02

---

## 1. What CraftWare is

A full-service **digital growth agency**. Services offered:
Website Design & Development · Instagram Management · Social Media Management ·
Meta Ads (FB/IG) · Google Ads · SEO · Branding & Creative Design · Content Creation ·
Digital Marketing Strategy · Complete Digital Marketing Solutions.

Goal of the site: make a visitor *feel* the quality in ~3 seconds, understand the full
service range, and convert via **Start a Project** / **WhatsApp**. Target bar:
Awwwards-level, futuristic tech studio, cinematic, minimal, confident — **not** a template,
**not** a blue-gradient SaaS page, **not** a generic agency site.

---

## 2. Where things live

| Item | Path / Link |
|---|---|
| **Canonical project folder** | `C:\Users\mdtou\project\Craftware` |
| Old folder (do not use) | `C:\Users\mdtou\Craftware` — emptied 2026-09-02; delete the empty dir manually |
| Design canvas (Claude Design) | https://claude.ai/code/artifact/637473c5-1ae8-4577-99e8-6ac0703684d6 |
| Design canvas source files | `*.dc.html` + `canvas.json` in the project folder (seeded via the `design` skill) |
| Memory-system entry | `C:\Users\mdtou\.claude\projects\C--Users-mdtou-Craftware\memory\craftware-project.md` |

The design canvas is **static hi-fi mockups** for sign-off. The real interactive site is
built separately in Next.js in this same folder.

---

## 3. Locked decisions (2026-09-02, stack revised 2026-09-03 during build)

- **Tech stack (as built):** Next.js **16** (App Router, Turbopack) · React 19 · TypeScript · Tailwind **v4** · **three (raw, hand-rolled renderer)** · gsap (+ ScrollTrigger) · lenis · geist.
  - **@react-three/fiber / @react-three/drei were REMOVED** — R3F v9's reconciler never attaches to the canvas under React 19.2 / Next 16 / Turbopack (`canvas.__r3f` undefined, empty scene, no error). The signature 3D object is now `components/three/MonolithCanvas.tsx` — a plain `useEffect` that owns the `THREE.WebGLRenderer`, scene, rAF loop, resize + disposal.
  - **framer-motion was REMOVED** for the same class of failure (motion components stuck at `initial`). Entrance/reveal animation is now CSS transitions + IntersectionObserver via `components/ui/Reveal.tsx` and `RevealText.tsx` (with a timeout failsafe so text can't stay hidden).
- **Deployed:** GitHub `github.com/mohammed-tousif/Craftware_site` (branch `main`), auto-deploying to Vercel project `craftware-site` → **https://craftware-site.vercel.app**. Push to `main` = auto deploy.
- **Signature object:** a frosted-violet-glass **stepped monolith** (Hubtown-inspired — user disliked the earlier revolving half-C ring) with a glowing "C" on its face, a wireframe energy field + particles. Hero + Final CTA.
- **Case studies:** real routed pages `/work/[slug]` (SSG). Modal-morph transition from the Work rail is still TODO (currently a plain link).
- **Contact:** `mailto:` + WhatsApp `wa.me` links only (no backend). Form UI is built so a backend (Web3Forms/Resend) can drop in later
- **Portfolio & content:** typed data files (`content/*.ts`) + `config/site.ts`; portfolio must be trivial to update
- **Imagery:** generated abstract placeholders now, swappable via one path in the data file
- **Repo/host:** `git init` locally; hosting decided later (Vercel likely)
- **Fidelity of first canvas:** static mockups, 3 hero directions + core system
- **Chosen hero direction: B — "Object First"** (centred composition, glass "C" large and central, headline beneath it, product-reveal feel). Rejected: A (Kinetic Type), C (Editorial Split) — kept on the canvas "Alternates" page for reference only.

### Reference sites the user likes
- **hubtown.co.in** — scroll-driven full-screen "chapters", one-word kickers, `0→100%` preloader, momentum scroll, heavy restraint
- **unseen.co** — dark, typographic, buttery WebGL/GSAP motion, minimal chrome

Take the **idea** (opening ritual, full-screen acts, restraint, momentum scroll, big type),
**not** the skin. Hubtown is light/editorial — CraftWare stays dark.

---

## 4. Visual system

- **Grounds:** near-black `#08080B`, deep charcoal surfaces `#0F0F14`, very subtle violet/cyan radial washes
- **Accents (used as light — glows, edges, single lines, not fills):** electric violet `#8B5CF6`, neon blue `#3B82F6`, cyan `#22D3EE`, white for emphasis
- **Text:** hi `#F4F4F6`, muted `#9A9AA6`, faint `#6C6C78`
- **Hairlines:** `rgba(255,255,255,0.08–0.16)`
- **Type:** **Space Grotesk** (display, 600/700, tight tracking, gradient on final word) + **Geist** (body, 300–500). Prefer `geist` npm package; Space Grotesk via `next/font`
- **Texture:** 64px grid at ~3–4% opacity with a radial mask; fractal-noise overlay at ~4% `soft-light`
- **Signature 3D object:** a glass / chrome "C" with glowing violet→cyan edges, dashed inner ring, drifting particle dots. Appears in the **hero** and behind the **final CTA**. Everywhere else 3D is absent or a faint accent. In the mockups it's a flat CSS/SVG stand-in — real one = R3F `MeshTransmissionMaterial`.
- **Buttons:** filled violet-gradient pill (`Start a Project`) + ghost hairline pill (`Explore Our Work`); magnetic pull + glow on hover
- **Corner meta labels:** 11px, `letter-spacing 0.18em`, faint — e.g. `DESIGN × TECHNOLOGY × MARKETING`, `EST. 2026 — MUMBAI`
- **Section index:** bottom-right `0X / 09`

---

## 5. Homepage — nine acts

| # | Act (kicker) | Content | Signature motion |
|---|---|---|---|
| 00 | Preloader | `CRAFTWARE` letters assemble → snap through `CRAFT → CREATE → GROW` → curtain wipe into hero. ≤ ~1.8s | letter assembly + word snap + wipe |
| 01 | **Craft** — Hero | Kicker `CRAFTWARE — DIGITAL GROWTH STUDIO`. H1 `WE CRAFT DIGITAL EXPERIENCES THAT GROW.` Sub `Websites. Social. Ads. SEO. Everything your brand needs to dominate digitally.` CTAs `Start a Project` / `Explore Our Work` | glass "C" reacts to mouse; particles drift; headline mask-reveal line by line; subtle parallax |
| 02 | **Machines** — Trust | `WE DON'T JUST BUILD WEBSITES. WE BUILD DIGITAL MACHINES.` + paragraph + animated stats: `50+ Projects Delivered`, `20+ Brands`, `4.2M+ Ad Reach`, `3.1x Avg Growth` (placeholders) | pinned; word-by-word headline; stats count up on enter |
| 03 | **Capabilities** — Services | Heading `EVERYTHING YOUR BRAND NEEDS TO GROW.` + interactive list 01–07 (below) | hover row → type expands, radial glow blooms, keyword tags float, cursor label `EXPLORE →` |
| 04 | **Work** — Portfolio | Heading `WORK WE'VE CRAFTED.` Sub `Ideas are easy. Execution is everything.` Horizontal rail of large project panels (projects below) | vertical scroll drives horizontal travel; centre panel scales; cursor `VIEW PROJECT →` |
| — | Case Study `/work/[slug]` | `01 Challenge · 02 Strategy · 03 Execution · 04 Result` + animated metric tiles + large media + next-project teaser | modal-morph in from the panel; metrics count up |
| 05 | **Process** — Timeline | Heading `FROM IDEA TO IMPACT.` 5 steps (below) | connecting gradient line draws as the section scrolls; current step highlighted |
| 06 | **Why CraftWare** | `Design × Technology × Marketing` + 6 orbiting values: Creative Thinking · Performance Driven · Technology First · Data Backed · Built For Growth · Long-Term Partnerships | faint central 3D accent; values on a slow orbit |
| 07 | **Studio** — About + Tech | `WE'RE CRAFTWARE.` 2 short paragraphs + team image placeholders. Then tech "constellation": React, Next.js, Three.js, Figma, Google Ads, Meta Ads, Google Analytics, SEO, WordPress, Shopify | constellation drifts, links draw between near nodes, reacts to cursor |
| 08 | **Voices** — Testimonials | name / company / role / quote | slow horizontal marquee, pauses on hover |
| 09 | **Move** — Final CTA | `YOUR NEXT BIG MOVE STARTS HERE.` Sub `Have an idea? Need more customers? Want to transform your digital presence?` CTAs `Start a Project →` / `WhatsApp Us` | sibling 3D object drifts behind text; magnetic buttons |
| — | Footer | `CraftWare` + tagline `We craft digital experiences that grow businesses.` Links: Work / Services / About / Contact. Socials: Instagram / Facebook / LinkedIn. Contact: `[EMAIL]` `[PHONE]` `[LOCATION]`. `© 2026 CraftWare. All rights reserved.` | animated underlines, magnetic links |

### Services list (act 03)
| # | Name | One-liner | Hover keywords |
|---|---|---|---|
| 01 | Websites | High-performance websites that turn visitors into customers. | DESIGN · CODE · PERFORMANCE · CONVERSION |
| 02 | Social Media | Strategy, content, design and management that builds your brand. | CONTENT · STRATEGY · COMMUNITY · GROWTH |
| 03 | Meta Ads | Performance-focused Facebook & Instagram campaigns engineered for growth. | CTR · ROAS · CONVERSIONS · REACH |
| 04 | Google Ads | Get your business in front of customers actively searching for you. | INTENT · CPC · QUALITY SCORE · LEADS |
| 05 | SEO | Build sustainable organic visibility and dominate search results. | KEYWORDS · RANKINGS · TRAFFIC · ORGANIC GROWTH |
| 06 | Creative & Branding | Visual identities, creatives and content that make your brand memorable. | IDENTITY · SYSTEM · CREATIVE · VOICE |
| 07 | Complete Digital Marketing | One team managing your entire digital presence. | AUDIT · PLAN · EXECUTE · OPTIMISE |

### Portfolio projects (act 04) — placeholders, easy to swap
| Project | Industry | Services | Result (placeholder) |
|---|---|---|---|
| Quba International Tours & Travels | Travel & Tourism | Website · Digital Marketing · Meta Ads | +180% package enquiries in 90 days |
| Orbit Care | Healthcare Platform | Website/App · Branding | — |
| No Name Café | Food & Beverage | Branding · Social Media · Creative Design | — |
| Al Madina Restaurant | Food & Beverage | Website · Social Media · Meta Ads | — |

Case-study metric tiles (Quba, placeholder): `+180% Enquiries` · `3.2x ROAS` · `68% Organic Growth` · `4.6M Reach`.

### Process steps (act 05)
1. **Discover** — We understand your business, audience and goals.
2. **Strategy** — We build a digital roadmap around measurable outcomes.
3. **Craft** — Design, development, content and campaigns come together.
4. **Launch** — We launch your digital presence.
5. **Grow** — We optimize, advertise and continuously improve.

---

## 6. Motion & interaction system

- **Smooth scroll:** Lenis (momentum) as the baseline; GSAP ScrollTrigger reads from it
- **Scroll choreography:** GSAP ScrollTrigger — pin, scrub, timeline; also drives 3D object rotation/camera on scroll
- **Component motion:** Framer Motion — nav, mobile menu, case-study modal-morph, mount/exit
- **Reveals:** headlines mask-reveal line by line; images `clip-path` wipe + scale-from-1.06; nothing translates > ~40px; **no bounce, no spin-in**
- **Signature moments only:** ~3, not 30. Everything else is quiet reveals + parallax
- **Custom cursor (desktop only, disabled on touch):** glowing dot → expands on links → `VIEW PROJECT →` over portfolio → `LET'S TALK →` over CTAs. Must not block usability
- **Magnetic buttons:** pull toward cursor + glow + thin underline sweep
- **Reduced effects:** `prefers-reduced-motion` and mobile → 3D swapped for a static render, particle count cut ~80%, marquee/parallax simplified, custom cursor off

---

## 7. Proposed architecture

```
app/
  layout.tsx                metadata, fonts, <SmoothScroll>, <CustomCursor>
  page.tsx                  homepage — composes the section components
  work/[slug]/page.tsx      case-study pages (generateStaticParams from data)
  sitemap.ts  robots.ts
components/
  layout/   Nav.tsx  MobileMenu.tsx  Footer.tsx  SmoothScroll.tsx
  ui/       MagneticButton.tsx  CustomCursor.tsx  RevealText.tsx  Stat.tsx  Pill.tsx
  three/    Scene.tsx  GlassC.tsx  Particles.tsx  (all dynamic-imported, ssr:false)
  sections/ Preloader  Hero  Trust  Services  Work  Process  WhyCraftWare  About  TechConstellation  Testimonials  FinalCta
content/
  services.ts  projects.ts  testimonials.ts  stats.ts  process.ts  techStack.ts
config/
  site.ts     nav, email, phone, whatsapp, socials, tagline, copyright
lib/
  animations.ts  useMousePosition.ts  useReducedMotion.ts
```

- Dynamic-import all Three.js; `next/image` everywhere; code-split per section
- One shared `<Canvas>`, not one per section
- Keep components small; no monolith

---

## 8. SEO

Title: `CraftWare — Digital Experiences That Grow`
Description: `CraftWare builds high-performance websites, manages social media, runs Meta & Google Ads, and grows brands through SEO and complete digital marketing.`
Also: Open Graph + Twitter card, semantic HTML, correct heading hierarchy, `sitemap.ts`, `robots.ts`, descriptive `alt` text.

---

## 9. Still needed from the user (currently placeholders)

- Real contact: **email, phone, WhatsApp number, location**
- Social URLs: **Instagram, Facebook, LinkedIn**
- **CraftWare logo** (SVG) — else typographic wordmark stands in
- Real project **screenshots** for the 4 projects (else generated placeholders)
- Real **metrics / results** per project and the act-02 stats (else placeholder numbers, clearly marked)
- Real **testimonials** (name, company, role, quote) — else fictional, labelled in code
- Exact brand hex values if they differ from the palette above

All wired through `config/site.ts` / `content/*.ts` so each is a one-line swap.

---

## 10. Next steps

1. User reviews the six Direction-B screens on the canvas; apply any layout/copy changes.
2. Tighten the Process timeline (node dots to sit on the connecting line) — deferred to the code build.
3. Scaffold the Next.js project in `C:\Users\mdtou\project\Craftware` (`git init`).
4. Build act by act, in order: shell (Nav/Footer/Lenis/cursor/preloader) → Hero + 3D → Trust + Services → Work + case studies → Process/Why/About/Tech/Testimonials → Final CTA.
5. Responsive pass (tablet/mobile redesign, not shrink) → performance pass → SEO → console-error sweep.

### Quality gates (from user's global `ccg-skills` rules)
- New module → `/gen-docs`, then `/verify-module`, then `/verify-security`
- Any change > 30 lines → `/verify-change`, then `/verify-quality <path>`
- Auth / validation / secrets touched → `/verify-security <path>`
- Gates are non-blocking; only Critical/High findings must be fixed before delivery.
