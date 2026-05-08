# Handoff: Marketing / Landing Page

## Overview

This package contains the **Marketing Page** for Drive Duplicate Cleaner — a public-facing landing page optimized for SEO and AI crawler discoverability, with the Google sign-in CTA as the primary action throughout.

It replaces the current minimal sign-in card at `/` with a full marketing experience. Sign-in remains the primary action — there is no separate `/login` route needed.

---

## About the Design Files

`Marketing Page.html` is a **design reference created in HTML** — an interactive prototype showing the intended look, content, and structure. It is **not production code to copy directly**. Recreate it in your TanStack Router + Tailwind codebase using the patterns already established in `src/routes/index.tsx` and `src/index.css`.

**Fidelity: High-fidelity.** Copy, layout, type, and tokens are final.

---

## SEO & AI Crawler Optimization (the important part)

This page is built to be **highly discoverable** by both traditional search engines and AI crawlers (ChatGPT, Perplexity, Claude, etc.). Implement these in production exactly as shown:

### 1. `<head>` Meta

```html
<title>Drive Duplicate Cleaner — Free Tool to Find & Remove Duplicate Files in Google Drive</title>
<meta name="description" content="Free, open-source tool to find and delete duplicate files in your Google Drive. Recover gigabytes of storage space. Runs entirely in your browser — no backend, no data stored, complete privacy.">
<meta name="keywords" content="google drive duplicate finder, remove duplicate files google drive, free up google drive storage, open source google drive cleaner, find duplicate files google drive, delete duplicates google drive, google drive cleanup tool">
<link rel="canonical" href="https://driveduplicatecleaner.com/">
```

### 2. Open Graph + Twitter Card

Both included for social sharing previews. Replace `og:image`/`twitter:image` with a real 1200×630 social preview when ready.

### 3. JSON-LD Structured Data (CRITICAL for AI crawlers)

Two schemas are emitted in the HTML head:

- **`SoftwareApplication`** — tells crawlers this is an app, with offer/price/rating
- **`FAQPage`** — matches the FAQ section content; powers Google rich-result FAQ accordions

The FAQ JSON-LD content **must stay in sync** with the visible FAQ list on the page. If you change one, change both.

### 4. Server-Side Rendering Recommendation

Since the current stack is Vite + TanStack Router (client-rendered React), AI crawlers and many SEO bots will see an empty page. **Strongly recommend:**

- Pre-render `/` at build time using `vite-plugin-prerender` or migrate to TanStack Start (which has SSR)
- Or render this page as **static HTML** (the content rarely changes) and only hydrate the sign-in button. The page has no auth-dependent content above the fold.

### 5. Semantic HTML

The reference uses semantic landmarks throughout — preserve in your TSX:

- `<nav>` for top nav
- `<header>` for hero
- `<section>` for each major content block (`#features`, `#how-it-works`, `#privacy`, `#faq`)
- `<article>` for each feature card
- `<ol>` for the numbered "How it works" steps
- `<details>`/`<summary>` for the FAQ (native, accessible, indexable)
- `<footer>` for the footer
- One `<h1>` only (in the hero), then `<h2>` per section, `<h3>` for cards

### 6. Heading Keyword Targets

| Heading | Target keywords |
|---|---|
| H1: "Find & Remove Duplicate Files In Google Drive" | primary keyword |
| H2: "Everything you need to clean up Drive" | secondary |
| H2: "Four steps. Zero risk." | navigational |
| H2: "Your files never leave your browser." | privacy / trust signal |
| H2: "Common questions" | FAQ landing |
| H2: "Read the code. Run it yourself." | open-source signal |

---

## Layout & Sections

Page width: max-width `1100px`, centered, horizontal padding `28px`. Background uses `--theme-page-bg`.

### 1. Sticky Nav (`<nav>`)
- Sticky top, blurred background (`backdrop-filter: blur(8px)`)
- Logo (28×28 accent square + wordmark) on left
- Anchor links: Features / How it works / Privacy / FAQ — `font-size: 11px`, uppercase, `letter-spacing: 0.04em`
- GitHub icon link
- "Sign in" button (right) — small primary button

### 2. Hero (`<header id="top">`)
- 2-column grid `1.1fr 1fr`, gap `40px`
- Subtle 32×32px grid background overlay
- **Left column:**
  - Pill chip: "FREE · OPEN SOURCE · NO BACKEND" with green dot
  - H1: 64px, Barlow Condensed 900, line-height 0.95, accent color on "Duplicate Files"
  - Lede paragraph: 17px, max-width 460px
  - Dual CTAs: primary `<I.Google/> Sign in with Google` + secondary `See how it works ↓`
  - 3 trust check items below CTAs
- **Right column:** stylized results-page mockup tilted with `perspective(1400px) rotateY(-7deg) rotateX(3deg)`

### 3. Stat Strip
4-column grid below hero, separated by hairline dividers. Values use Barlow Condensed 900 28px. Labels are 10px uppercase metaText.

### 4. Features Grid (`<section id="features">`)
- Section header centered (eyebrow + H2 + supporting text)
- 3-column grid of `<article>` cards, gap `14px`
- Each card: 36×36 icon tile (accent-tinted), tag in JetBrains Mono, H3 in Barlow Condensed, body copy

### 5. How it works (`<section id="how-it-works">`)
- 2-column grid `1fr 1.4fr`, gap `60px`
- Left column: sticky (`position: sticky; top: 80px`) — section header + intro + Try-it-now CTA
- Right column: `<ol>` of 4 step cards
- Each step: `60px` step number column / content / time-tag column
- 4px accent left-border on each step

### 6. Privacy Card (`<section id="privacy">`)
- Single 2-column card: left = headline + intro paragraph, right = 4 check-item list
- Each check item: 22px circular accent badge with white check icon + title + body

### 7. FAQ (`<section id="faq">`)
- Max-width 820px, centered
- `<details>` elements (no JS needed — native expand)
- Custom summary: hides default marker, adds `+` indicator on right
- 6 questions, all matched in JSON-LD

### 8. Open Source CTA
- Inverted dark card (`background: var(--theme-title-text)`)
- Giant "MIT" watermark in accent at 8% opacity, top-right
- 2-column: copy + GitHub button (with star count) + "Read the docs"

### 9. Final CTA
- Centered, gradient background fade
- Massive H2 (56px Barlow Condensed): "Get your storage back."
- Primary Google sign-in button + unverified-app note

### 10. Footer
- 4-column grid: brand column + Product / Project / Resources columns
- Bottom row: copyright + version badge in JetBrains Mono

---

## Design Tokens

Reuses your existing Clinical theme tokens. Map to CSS custom properties already in `src/index.css`:

| Reference token | Your CSS var |
|---|---|
| `pageBg` | `--theme-page-bg` |
| `surface` | `--theme-surface` |
| `border` | `--theme-border` |
| `titleText` | `--theme-title-text` |
| `bodyText` | `--theme-body-text` |
| `metaText` | `--theme-text-secondary` |
| `accent` | `--theme-accent` |
| `cardShadow` | `--theme-card-shadow` |

Two new tokens to add:
- `--theme-accent-bg`: `rgba(0,184,148,0.05)` (light) / `rgba(0,201,167,0.05)` (dark)
- `--theme-accent-border`: `rgba(0,184,148,0.25)` / `rgba(0,201,167,0.22)`

---

## Typography

| Role | Font | Size | Weight |
|---|---|---|---|
| Hero H1 | Barlow Condensed | 64px | 900 |
| Final CTA H2 | Barlow Condensed | 56px | 900 |
| Section H2 | Barlow Condensed | 36–44px | 900 |
| Card H3 | Barlow Condensed | 17–18px | 800 |
| Lede | Barlow | 17px | 400 |
| Body | Barlow | 13–14px | 400 |
| Eyebrows / tags | Barlow / JetBrains Mono | 9–10px | 700–800 |
| Stat values | Barlow Condensed | 28px | 900 |
| Code / paths | JetBrains Mono | 11–12px | 400 |

---

## Routing Recommendation

Replace the current `routes/index.tsx` (login card) with this marketing page. Move the auth redirect logic (the `useEffect` checking `isAuthenticated`) to the top of the new page — authenticated users go straight to `/dashboard`, everyone else sees the marketing page.

Sign-in CTAs throughout the page should call the same `signIn()` from `useGoogleAuth()` that the existing button uses.

---

## Login Button Styling

The hero/final-CTA Google sign-in button should match the existing `sign-in-buttons-styles.css` pattern. Add the gradient-border ::before overlay to maintain visual consistency with the current login button. The marketing page reference uses a flat solid-bg button for clarity — feel free to use either.

---

## Files in This Bundle

| File | Purpose |
|---|---|
| `README.md` | This document |
| `Marketing Page.html` | Interactive design reference — Light + Dark themes |
