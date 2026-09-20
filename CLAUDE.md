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

### Important

- Do not modify `writing/` output files by hand - they are regenerated on every build.
- Do not modify `index.html` or `work/artemis/index.html` via the build scripts - they are hand-authored.
- The sitemap build preserves all non-writing URLs and regenerates only the writing portion.
- The build is deterministic and safe to rerun.

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

## Git

- Push to `main` triggers Vercel deploy
- Commit generated writing output alongside source Markdown
- Use `www.reubenstone.co.uk` for all canonical URLs
