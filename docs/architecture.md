# Architecture: reuben-web

## Overview

`reuben-web` is a professional portfolio website for Reuben Stone, a Senior Product Engineer. It is implemented as a **pure static HTML site** with no build step, no JavaScript framework, and no runtime dependencies. It is hosted on Vercel and delivers two distinct content experiences:

1. **Portfolio landing page** — a single-page resume/CV-style site
2. **Engineering case study** — an in-depth article documenting the design and rebuild of Artemis Lite, an AI operations system

---

## Repository Structure

```
reuben-web/
├── index.html               # Main portfolio landing page (598 lines)
├── og-image.html            # Template for generating the OpenGraph preview image
├── og-image.png             # Rendered OG image (1200×630)
├── robots.txt               # SEO crawler configuration
├── sitemap.xml              # XML sitemap with page priorities
├── vercel.json              # Vercel hosting and redirect configuration
├── assets/                  # Static media (images, video, PDF CV)
│   ├── *.png / *.mp4        # Project screenshots and demo clips
│   └── Reuben-Stone-CV-2026.pdf
└── work/
    └── artemis/
        └── index.html       # Artemis case study article (1,244 lines)
```

---

## Technology Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 (semantic, no framework) |
| Styling | CSS3 (custom properties, Grid, Flexbox) |
| Scripting | Vanilla JS (minimal — Intersection Observer, dynamic year) |
| Fonts | Google Fonts (Inter, Source Serif 4, JetBrains Mono) |
| Hosting | Vercel (static, global CDN) |
| Version control | Git / GitHub |
| Build process | None — files are deployed as-is |

---

## Architecture

### Deployment Model

The site is a **flat static deployment** served directly from Vercel's edge CDN. There is no server-side rendering, no API layer, and no client-side routing library. Navigation between sections on the landing page uses anchor links (`#work`, `#about`, etc.). The case study is a separate HTML document at `/work/artemis/`.

```
Browser
  └── Vercel Edge CDN
        ├── /                     → index.html
        ├── /work/artemis/        → work/artemis/index.html  (clean URL)
        └── /assets/*             → static media files
```

### Vercel Configuration (`vercel.json`)

```json
{
  "cleanUrls": true,
  "redirects": [
    {
      "source": "/:path(.*)",
      "has": [{ "type": "host", "value": "reubenstone.co.uk" }],
      "destination": "https://www.reubenstone.co.uk/:path",
      "permanent": true
    }
  ]
}
```

- `cleanUrls: true` — strips `.html` extensions from all URLs
- Permanent (301) redirect enforces the canonical `www.reubenstone.co.uk` domain

---

## Pages

### 1. Portfolio Landing Page (`index.html`)

A single scrollable page with the following sections:

| Section | Purpose |
|---|---|
| Header | Sticky navigation with links to Work, About, GitHub, LinkedIn |
| Hero | Personal introduction, focus areas, current research interests |
| Selected Work | Four featured projects with visual thumbnails and links |
| Currently | Active research interests in persistent AI systems |
| Experience | Chronological professional timeline |
| About | Professional narrative and engineering philosophy |
| Contact | Email and social links |
| Footer | Copyright |

**Design system:**
- Background: `#0e0f11` (dark)
- Primary text: `#e0ddd5`
- Accent: `#8b5cf6` (purple)
- Max-width container: 1280px; prose width: 720px
- Responsive breakpoint: 768px

### 2. Artemis Case Study (`work/artemis/index.html`)

A long-form engineering article structured as a deep-dive into the design of Artemis Lite — a desktop AI operations system built on Electron. The article is self-contained with the same design tokens as the main site, and serves as both a technical portfolio piece and a public engineering reference.

**Article sections:**

| Section | Content |
|---|---|
| Problem | Challenges discovered in Artemis v1 (broad context, unclear boundaries, fragile state) |
| Direction | Design principles for the rebuild (durable state, selective context, constrained tools) |
| Architecture | System components: Orchestrator, Context Builder, Tool Registry, Model Provider |
| Workflows | Step-by-step: Issue investigation → planning → worktree → worker dispatch → PR creation |
| Context | Evidence acquisition strategy; progressive discovery over broad search |
| Reliability | Failure modes, recovery scenarios, tool-specific reconciliation |
| Evaluation | Real dogfooding result: Lumi production bug, 18 trace events, 273s execution |
| Lessons | Key takeaways on AI system design |

---

## SEO and Discoverability

| Feature | Implementation |
|---|---|
| OpenGraph metadata | Custom OG image (1200×630), title, description per page |
| Twitter Card | `summary_large_image` card type |
| Structured data | Schema.org `Person` JSON-LD on landing page |
| Canonical URLs | Enforced via Vercel redirect (www) and `<link rel="canonical">` |
| Sitemap | `sitemap.xml` with two pages; homepage priority 1.0, case study 0.8 |
| Robots | `robots.txt` allows all crawlers, references sitemap |

---

## Accessibility

- Skip-to-content link at page top
- ARIA labels on navigation elements
- `focus-visible` outline styles
- `prefers-reduced-motion` respected for animations
- Semantic HTML landmarks (`<header>`, `<main>`, `<nav>`, `<footer>`, `<article>`)

---

## Artemis Lite — Documented System Architecture

The case study documents the architecture of Artemis Lite, a separate Electron desktop application (not in this repo). The key architectural components described are:

```
┌─────────────────────────────────────────────────────┐
│                   Artemis Lite (Electron)            │
│                                                     │
│  ┌───────────────────┐   ┌──────────────────────┐   │
│  │ Workflow           │   │ Context Builder       │   │
│  │ Orchestrator       │   │ (token-budgeted,      │   │
│  │ (state machine,    │   │  per-step, selective) │   │
│  │  SQLite-persisted) │   └──────────────────────┘   │
│  └────────┬──────────┘                               │
│           │              ┌──────────────────────┐    │
│           └─────────────►│ Tool Registry         │    │
│                          │ (typed, approval       │    │
│                          │  policies, Zod-        │    │
│                          │  validated IPC)        │    │
│                          └──────────┬───────────┘    │
│                                     │                 │
│                          ┌──────────▼───────────┐    │
│                          │ Model Provider        │    │
│                          │ (Claude / Anthropic,  │    │
│                          │  usage tracking)      │    │
│                          └──────────────────────┘    │
│                                                     │
│  Capabilities: GitHub API, Repo ops, Verification,  │
│                Approval gates, Sentry, Analytics    │
│  Persistence:  SQLite, Project registry,            │
│                OS Keychain (encrypted secrets)      │
└─────────────────────────────────────────────────────┘
```

**Seven key design decisions documented:**

1. **Explicit workflow state** — persisted to SQLite so restarts resume from last known step
2. **Typed capabilities** — all tool inputs/outputs validated at the boundary (Zod)
3. **Approval as state** — human approval gates are persisted pause points, not blocking calls
4. **Durable recovery** — process interruption is a first-class failure mode, not an edge case
5. **Tool-specific reconciliation** — before retrying a step, check external systems (e.g. GitHub) for partial completion
6. **Observable model usage** — token consumption tracked per workflow, not globally
7. **Selective context** — evidence is acquired progressively (identify subsystem → scoped search → candidate inspection → reference following), not broadcast as full state

---

## Content Delivery Flow

```
User visits www.reubenstone.co.uk
  │
  ├── [if reubenstone.co.uk (no www)] → 301 redirect → www
  │
  └── Vercel serves static file
        ├── /              → index.html
        ├── /work/artemis/ → work/artemis/index.html
        └── /assets/...    → media files (CDN-cached)
```

---

## What Is Not in This Repository

The following systems are **documented in the case study** but live in separate, private repositories:

- **Artemis / Artemis Lite** — Electron desktop app (AI operations system)
- **Lumi / Livana** — Accessibility audit and remediation software
- **GenAI Mindset platform** — AI-enabled learning product (The Smarty Train)
- **Powster CMS** — AWS-backed content management for Universal Pictures web properties
