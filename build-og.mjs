/**
 * OG image build script.
 *
 * Reads published article frontmatter from content/writing/,
 * generates 1200x630 PNG images using satori + resvg.
 *
 * Output: writing/<slug>/og-image.png
 *
 * Uses locally cached fonts (build/fonts/) to avoid network dependency.
 * Deterministic - safe to rerun.
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import matter from 'gray-matter'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'

const ROOT = new URL('.', import.meta.url).pathname
const CONTENT_DIR = join(ROOT, 'content', 'writing')
const OUTPUT_DIR = join(ROOT, 'writing')
const FONTS_DIR = join(ROOT, 'build', 'fonts')

// ── Load fonts ───────────────────────────────────────────────────

const serifFont = readFileSync(join(FONTS_DIR, 'SourceSerif4-SemiBold.ttf'))
const sansFont = readFileSync(join(FONTS_DIR, 'Inter-Regular.ttf'))
const monoFont = readFileSync(join(FONTS_DIR, 'JetBrainsMono-Regular.ttf'))

// ── Load articles ────────────────────────────────────────────────

function loadArticles() {
  if (!existsSync(CONTENT_DIR)) return []
  return readdirSync(CONTENT_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const { data } = matter(readFileSync(join(CONTENT_DIR, f), 'utf-8'))
      return data
    })
    .filter(d => d.published && d.slug && d.title)
}

// ── Generate OG image ────────────────────────────────────────────

async function generateOG(article) {
  const topics = (article.topics || []).join(' / ').toUpperCase()

  // Satori uses a JSX-like object format
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          background: '#0e0f11',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '72px 80px',
          position: 'relative',
        },
        children: [
          // Purple accent line at top
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '3px',
                background: '#8b5cf6',
              },
            },
          },
          // Eyebrow
          {
            type: 'div',
            props: {
              style: {
                fontFamily: 'JetBrains Mono',
                fontSize: '15px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#8a8780',
                marginBottom: '28px',
              },
              children: 'Reuben Stone / Writing',
            },
          },
          // Title - large, serif, readable at thumbnail size
          {
            type: 'div',
            props: {
              style: {
                fontFamily: 'Source Serif 4',
                fontSize: article.title.length > 50 ? '44px' : '52px',
                fontWeight: 600,
                lineHeight: 1.2,
                color: '#e0ddd5',
                marginBottom: '20px',
                maxWidth: '960px',
              },
              children: article.title,
            },
          },
          // Question - subordinate to title, readable at thumbnail
          article.question
            ? {
                type: 'div',
                props: {
                  style: {
                    fontFamily: 'Inter',
                    fontSize: '20px',
                    lineHeight: 1.5,
                    color: '#8a8780',
                    marginBottom: '24px',
                    maxWidth: '800px',
                  },
                  children: article.question,
                },
              }
            : null,
          // Topics
          topics
            ? {
                type: 'div',
                props: {
                  style: {
                    fontFamily: 'JetBrains Mono',
                    fontSize: '12px',
                    letterSpacing: '0.1em',
                    color: '#5a5754',
                    marginBottom: '24px',
                  },
                  children: topics,
                },
              }
            : null,
          // URL
          {
            type: 'div',
            props: {
              style: {
                fontFamily: 'JetBrains Mono',
                fontSize: '14px',
                color: '#8b5cf6',
                letterSpacing: '0.04em',
                position: 'absolute',
                bottom: '40px',
                left: '80px',
              },
              children: 'reubenstone.co.uk',
            },
          },
        ].filter(Boolean),
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Source Serif 4', data: serifFont, weight: 600, style: 'normal' },
        { name: 'Inter', data: sansFont, weight: 400, style: 'normal' },
        { name: 'JetBrains Mono', data: monoFont, weight: 400, style: 'normal' },
      ],
    }
  )

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
  })
  return resvg.render().asPng()
}

// ── Writing index OG ─────────────────────────────────────────────

async function generateIndexOG() {
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          background: '#0e0f11',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '72px 80px',
          position: 'relative',
        },
        children: [
          {
            type: 'div',
            props: {
              style: { position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', background: '#8b5cf6' },
            },
          },
          {
            type: 'div',
            props: {
              style: { fontFamily: 'JetBrains Mono', fontSize: '15px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8a8780', marginBottom: '28px' },
              children: 'Reuben Stone / Writing',
            },
          },
          {
            type: 'div',
            props: {
              style: { fontFamily: 'Source Serif 4', fontSize: '48px', fontWeight: 600, lineHeight: 1.2, color: '#e0ddd5', marginBottom: '28px', maxWidth: '900px' },
              children: 'Notes on building software, products and AI systems.',
            },
          },
          {
            type: 'div',
            props: {
              style: { fontFamily: 'JetBrains Mono', fontSize: '14px', color: '#8b5cf6', letterSpacing: '0.04em', position: 'absolute', bottom: '40px', left: '80px' },
              children: 'reubenstone.co.uk',
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Source Serif 4', data: serifFont, weight: 600, style: 'normal' },
        { name: 'Inter', data: sansFont, weight: 400, style: 'normal' },
        { name: 'JetBrains Mono', data: monoFont, weight: 400, style: 'normal' },
      ],
    }
  )

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } })
  return resvg.render().asPng()
}

// ── Main ─────────────────────────────────────────────────────────

const articles = loadArticles()
console.log(`Generating OG images for ${articles.length} article(s) + index`)

// Writing index OG
mkdirSync(OUTPUT_DIR, { recursive: true })
const indexPng = await generateIndexOG()
writeFileSync(join(OUTPUT_DIR, 'og-image.png'), indexPng)
console.log('  writing/og-image.png')

// Article OGs
for (const article of articles) {
  const dir = join(OUTPUT_DIR, article.slug)
  mkdirSync(dir, { recursive: true })
  const png = await generateOG(article)
  writeFileSync(join(dir, 'og-image.png'), png)
  console.log(`  writing/${article.slug}/og-image.png`)
}

console.log('Done')
