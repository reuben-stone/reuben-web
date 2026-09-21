# reuben-web - Portfolio Site

## Architecture

Static site deployed on Vercel. No framework. Hand-authored HTML for the homepage and case study pages. Writing section uses a minimal build pipeline.

- `index.html` - hand-authored homepage
- `work/artemis/index.html` - hand-authored case study
- `writing/` - generated from Markdown sources by build scripts
- `vercel.json` - Vercel config (cleanUrls, www redirect, outputDirectory)

## Writing system

Articles are authored as Markdown with YAML frontmatter in `content/writing/`.

### Adding a new article

1. Create `content/writing/<slug>.md` with this frontmatter:

```yaml
---
title: "Article title"
question: "The central question the article explores (required for published articles)"
description: "Concise factual description for SEO and social metadata."
excerpt: "Optional short editorial preview for the Writing index."
slug: "article-slug"
datePublished: "2026-09-20"
dateModified: "2026-09-20"
published: true
topics:
  - Topic One
  - Topic Two
relatedWork:
  - title: "Artemis"
    url: "/work/artemis/"
    label: "AI Systems Engineering Case Study"
---
```

**Important distinctions:**
- `title` - memorable editorial idea
- `question` - the human hook, rendered as standfirst on the article page and on the Writing index (required)
- `description` - factual SEO description for meta tags and social cards
- `excerpt` - optional editorial preview shown on the Writing index beneath the question

Do not make these identical. Each has a distinct purpose.

2. Write the article body in Markdown. Supports: headings (h2, h3), paragraphs, lists, blockquotes, inline code, code blocks, links, images, horizontal rules.

3. Run `npm run build` to generate:
   - `writing/<slug>/index.html` - article page with full SEO metadata, JSON-LD, canonical URL
   - `writing/<slug>/og-image.png` - 1200x630 OG image generated from frontmatter
   - `writing/index.html` - updated article index
   - `sitemap.xml` - updated with new article URL

4. Commit all generated output and push.

### Draft articles

Set `published: false` (or omit it) to keep an article out of the index, sitemap and generated output. Only `published: true` articles are built.

### Build commands

```
npm run build           # Generate all writing HTML + OG images
npm run build:writing   # Generate HTML and sitemap only
npm run build:og        # Generate OG images only
```

### OG image generation

Uses satori + @resvg/resvg-js (no Chromium). Fonts are cached locally in `build/fonts/`. The OG images use the portfolio's visual language: dark background, serif title, mono metadata, purple accent.

The title is the primary element - sized for legibility at LinkedIn thumbnail dimensions.

### Frontmatter validation

The build requires these fields for published articles and will skip with a warning if missing:
- `title`, `question`, `description`, `slug`, `datePublished`, `dateModified`, `topics`
- `slug` must be lowercase hyphen-separated (`a-z0-9` and `-`)
- Duplicate slugs are rejected
- `published` defaults to false - only `published: true` articles are built

### SEO (auto-generated from frontmatter)

Each article page automatically gets:
- Canonical URL, OG/Twitter meta with image dimensions and alt text
- `article:published_time`, `article:modified_time`, `article:tag` OG meta
- Article JSON-LD with `@graph` structure (Article + BreadcrumbList + Person)
- Canonical Person entity referenced via `@id: https://www.reubenstone.co.uk/#person`
- Semantic `<time datetime>` tags
- Visible author attribution ("date · Reuben Stone")

The writing index gets CollectionPage + ItemList JSON-LD.

The homepage has Person + WebSite JSON-LD with the same `@id` references.

### Important

- Do not modify `writing/` output files by hand - they are regenerated on every build.
- Do not modify `index.html` or `work/artemis/index.html` via the build scripts - they are hand-authored.
- The sitemap build preserves all non-writing URLs and regenerates only the writing portion.
- The build is deterministic and safe to rerun.
- The editorial roadmap lives at `docs/WRITING-ROADMAP.md` - internal planning only, not published.

## Design language

- Near-black background (`#0e0f11`)
- Warm off-white text (`#e0ddd5`)
- Serif display: Source Serif 4
- Sans body: Inter
- Mono metadata: JetBrains Mono
- Purple accent: `#8b5cf6`
- Generous negative space, thin borders, no cards/gradients/icons
- Editorial restraint - the site should feel sparse and mature

## Writing editorial guidelines

- Writing section is for substantial engineering pieces, not content marketing
- Work section answers "What did I build?" - Writing answers "What did building it teach me?"
- Case studies remain under Work, not Writing
- No em dashes - use regular hyphens
- Keep copy natural and understated, not promotional
- Every section on the homepage has one job - don't repeat positioning across sections

### Writing voice

The voice is a senior product engineer thinking in public, not a content writer explaining a topic. Articles should sound like Reuben sat down after building something and noticed something worth writing about.

**Tone:** observant, technically experienced, plain-spoken, curious, slightly self-questioning. Comfortable saying two apparently conflicting things can both be useful.

**Do:**
- Use contractions and British English
- Prefer concrete nouns and verbs ("we changed the code" over "a remediation was implemented")
- Let thoughts develop rather than announcing the lesson up front
- Include yourself in the problem being examined
- Let some paragraphs be one or two sentences, others develop an idea
- Use hedging phrases naturally ("I think...", "I've noticed...", "Maybe the distinction is...")
- End quietly rather than with a quotable final sentence

**Don't:**
- Use em dashes (use commas, full stops, or hyphens)
- Use canned transitions ("Here's the thing", "The reality is", "At its core", "Ultimately")
- Use artificial contrasts ("It's not about X. It's about Y.")
- Manufacture profundity - if a sentence looks designed to become a pull quote, rewrite it plainer
- Create perfect rhetorical symmetry (three examples because three feels satisfying, every paragraph the same length, every observation resolving cleanly)
- Isolate dramatic one-sentence paragraphs as punchlines
- Use unnecessary adjectives (powerful, profound, crucial, transformative, seamless, robust, meaningful, innovative, holistic)
- Summarise the whole article at the end or build toward a slogan
- Start with statistics, history, or broad industry statements
- Speak for disabled people or manufacture emotion about their experiences
- Introduce products like a launch announcement or use sales language

**References:** The writing brief at `docs/` or `Downloads/` may contain more detailed guidance for specific articles. The existing published articles set the baseline for voice.

## Git

- Push to `main` triggers Vercel deploy
- Commit generated writing output alongside source Markdown
- Use `www.reubenstone.co.uk` for all canonical URLs
