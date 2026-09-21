/**
 * Writing build script.
 *
 * Reads Markdown files from content/writing/, generates:
 *   - writing/<slug>/index.html  (article pages)
 *   - writing/index.html         (article index)
 *   - updates sitemap.xml        (preserves non-writing URLs)
 *
 * Only articles with `published: true` in frontmatter are included.
 * Safe to rerun - replaces generated writing output without affecting
 * hand-authored pages.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'
import matter from 'gray-matter'
import { marked } from 'marked'

marked.use({
  hooks: {
    postprocess(html) {
      return html.replace(/<a href="(https?:\/\/[^"]+)"/g, '<a href="$1" target="_blank" rel="noopener noreferrer"')
    }
  }
})

const ROOT = new URL('.', import.meta.url).pathname
const CONTENT_DIR = join(ROOT, 'content', 'writing')
const OUTPUT_DIR = join(ROOT, 'writing')
const SITEMAP_PATH = join(ROOT, 'sitemap.xml')
const SITE_URL = 'https://www.reubenstone.co.uk'
const PERSON_ID = `${SITE_URL}/#person`

// ── Load and parse articles ──────────────────────────────────────

function loadArticles() {
  if (!existsSync(CONTENT_DIR)) return []

  const files = readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'))
  const articles = []
  const slugs = new Set()

  for (const file of files) {
    const raw = readFileSync(join(CONTENT_DIR, file), 'utf-8')
    const { data, content } = matter(raw)

    if (!data.published) continue

    // Validate required fields
    const missing = []
    if (!data.title) missing.push('title')
    if (!data.slug) missing.push('slug')
    if (!data.description) missing.push('description')
    if (!data.datePublished) missing.push('datePublished')
    if (!data.dateModified) missing.push('dateModified')
    if (!data.question) missing.push('question')
    if (!data.topics?.length) missing.push('topics')

    if (missing.length > 0) {
      console.warn(`Skipping ${file}: missing required fields: ${missing.join(', ')}`)
      continue
    }

    // Validate slug format
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) {
      console.warn(`Skipping ${file}: invalid slug format "${data.slug}"`)
      continue
    }

    // Validate no duplicate slugs
    if (slugs.has(data.slug)) {
      console.warn(`Skipping ${file}: duplicate slug "${data.slug}"`)
      continue
    }
    slugs.add(data.slug)

    // Validate dates
    if (isNaN(new Date(data.datePublished).getTime())) {
      console.warn(`Skipping ${file}: invalid datePublished "${data.datePublished}"`)
      continue
    }

    articles.push({
      ...data,
      content,
      html: marked.parse(content),
      sourceFile: file
    })
  }

  // Sort by datePublished descending
  articles.sort((a, b) => {
    const da = new Date(a.datePublished)
    const db = new Date(b.datePublished)
    return db.getTime() - da.getTime()
  })

  return articles
}

// ── Format date ──────────────────────────────────────────────────

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatDateShort(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()
}

// ── Shared HTML fragments ────────────────────────────────────────

const FAVICON = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='4' fill='%230e0f11'/><text x='6' y='23' font-family='serif' font-size='22' fill='%238b5cf6'>R</text></svg>`

const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">`

const SHARED_CSS = `
    :root {
      --bg: #0e0f11;
      --bg-raised: #151618;
      --border: #2a2b30;
      --border-strong: #3a3b42;
      --text: #e0ddd5;
      --text-secondary: #a8a5a0;
      --text-muted: #8a8780;
      --accent: #8b5cf6;
      --serif: 'Source Serif 4', Georgia, serif;
      --sans: 'Inter', -apple-system, system-ui, sans-serif;
      --mono: 'JetBrains Mono', 'SF Mono', monospace;
      --content-width: 1280px;
      --reading-width: 680px;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      font-family: var(--sans);
      font-size: 16px;
      line-height: 1.7;
      color: var(--text);
      background: var(--bg);
      -webkit-font-smoothing: antialiased;
    }
    .container { max-width: var(--content-width); margin: 0 auto; padding: 0 32px; }

    /* Navigation */
    .header {
      padding: 24px 0;
      border-bottom: 1px solid var(--border);
      position: relative;
      z-index: 101;
      background: var(--bg);
    }
    .header .container { display: flex; align-items: center; justify-content: space-between; }
    .header-name {
      font-family: var(--mono);
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--text-muted);
      text-decoration: none;
    }
    .header-links { display: flex; gap: 20px; list-style: none; }
    .header-links a {
      font-size: 13px;
      color: var(--text-muted);
      text-decoration: none;
      transition: color 0.15s;
      padding: 8px 4px;
    }
    .header-links a:hover { color: var(--text); }
    .mobile-toggle {
      display: none;
      background: none;
      border: none;
      color: var(--text-muted);
      font-family: var(--mono);
      font-size: 11px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      cursor: pointer;
      padding: 8px 0;
      transition: color 0.15s;
      position: relative;
      z-index: 101;
    }
    .mobile-toggle:hover { color: var(--text); }
    .mobile-nav {
      display: none;
    }

    @media (max-width: 768px) {
      .mobile-nav {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100dvh;
        background: var(--bg);
        z-index: 99;
        flex-direction: column;
      }
      .mobile-nav.open { display: flex; }
    }
    body.nav-open { overflow: hidden; }
    .mobile-nav-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 80px 20px 0;
    }
    .mobile-nav-links {
      list-style: none;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      margin-top: -12vh;
    }
    .mobile-nav-links li {
      display: flex;
      align-items: baseline;
      gap: 24px;
      opacity: 0;
      transform: translateY(6px);
      animation: navItemIn 0.22s ease-out forwards;
    }
    .mobile-nav-links li:nth-child(1) { animation-delay: 0.04s; }
    .mobile-nav-links li:nth-child(2) { animation-delay: 0.08s; }
    .mobile-nav-links li:nth-child(3) { animation-delay: 0.12s; }
    @keyframes navItemIn {
      to { opacity: 1; transform: translateY(0); }
    }
    .mobile-nav-index {
      font-family: var(--mono);
      font-size: 12px;
      color: var(--text-muted);
      letter-spacing: 0.06em;
      min-width: 28px;
      flex-shrink: 0;
    }
    .mobile-nav-links a {
      font-family: var(--serif);
      font-size: 36px;
      font-weight: 600;
      color: var(--text);
      text-decoration: none;
      display: block;
      padding: 10px 0;
      transition: color 0.15s;
    }
    .mobile-nav-links a:hover { color: var(--accent); }
    .mobile-nav-bottom {
      margin-top: auto;
      padding: 0 20px calc(48px + env(safe-area-inset-bottom));
    }
    .mobile-nav-external {
      display: flex;
      gap: 24px;
    }
    .mobile-nav-external a {
      font-size: 13px;
      color: var(--text-muted);
      text-decoration: none;
      transition: color 0.15s;
    }
    .mobile-nav-external a:hover { color: var(--text); }

    /* Footer */
    .footer {
      padding: 48px 0;
      border-top: 1px solid var(--border);
      font-size: 13px;
      color: var(--text-muted);
    }

    /* Focus / motion */
    :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
    @media (prefers-reduced-motion: reduce) {
      html { scroll-behavior: auto; }
      * { transition: none !important; animation: none !important; }
    }
    @media (max-width: 768px) {
      .container { padding: 0 20px; }
      .mobile-toggle { display: block; }
      .header-links { display: none; }
      body.nav-open .header {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
      }
    }
`

function nav(activeSection) {
  const links = [
    { href: '/', label: 'Work', id: 'work' },
    { href: '/writing/', label: 'Writing', id: 'writing' },
    { href: '/#about', label: 'About', id: 'about' },
    { href: 'https://github.com/reuben-stone', label: 'GitHub', external: true },
    { href: 'https://linkedin.com/in/reubenstone', label: 'LinkedIn', external: true },
  ]
  const items = links.map(l => {
    const active = l.id === activeSection ? ' style="color: var(--text);"' : ''
    const ext = l.external ? ' target="_blank" rel="noopener noreferrer"' : ''
    return `<li><a href="${l.href}"${active}${ext}>${l.label}</a></li>`
  }).join('\n          ')

  return `<header class="header">
    <div class="container">
      <a href="/" class="header-name">Reuben Stone</a>
      <nav aria-label="Main navigation">
        <button class="mobile-toggle" aria-expanded="false" onclick="var n=document.getElementById('mobile-nav');var o=n.classList.toggle('open');document.body.classList.toggle('nav-open',o);this.setAttribute('aria-expanded',o);this.textContent=o?'Close':'Menu'">Menu</button>
        <ul class="header-links">
          ${items}
        </ul>
      </nav>
    </div>
  </header>
  <div class="mobile-nav" id="mobile-nav">
    <div class="mobile-nav-body">
      <ul class="mobile-nav-links">
        <li><span class="mobile-nav-index">01</span><a href="/">Work</a></li>
        <li><span class="mobile-nav-index">02</span><a href="/writing/"${activeSection === 'writing' ? ' style="color: var(--accent);"' : ''}>Writing</a></li>
        <li><span class="mobile-nav-index">03</span><a href="/#about">About</a></li>
      </ul>
      <div class="mobile-nav-bottom">
        <div class="mobile-nav-external">
          <a href="mailto:reubenastone@gmail.com">Email</a>
          <a href="https://github.com/reuben-stone" target="_blank" rel="noopener noreferrer">GitHub &#8599;</a>
          <a href="https://linkedin.com/in/reubenstone" target="_blank" rel="noopener noreferrer">LinkedIn &#8599;</a>
        </div>
      </div>
    </div>
  </div>`
}

const FOOTER = `<footer class="footer">
    <div class="container">
      &copy; <script>document.write(new Date().getFullYear())</script> Reuben Stone
    </div>
  </footer>
  <script>
    var mq = window.matchMedia('(min-width: 769px)');
    mq.addEventListener('change', function(e) {
      if (e.matches) {
        document.getElementById('mobile-nav').classList.remove('open');
        document.body.classList.remove('nav-open');
        var btn = document.querySelector('.mobile-toggle');
        if (btn) { btn.textContent = 'Menu'; btn.setAttribute('aria-expanded', 'false'); }
      }
    });
  </script>`

// ── Escape for JSON ──────────────────────────────────────────────

function jsonEscape(str) {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')
}

// ── Article page template ────────────────────────────────────────

function renderArticle(article) {
  const ogUrl = `${SITE_URL}/writing/${article.slug}/og-image.png`
  const canonicalUrl = `${SITE_URL}/writing/${article.slug}/`
  const topicsMeta = (article.topics || []).join(' / ')
  const ogImageAlt = `${article.title} - article by Reuben Stone`

  const topicTags = (article.topics || []).map(t =>
    `  <meta property="article:tag" content="${t}">`
  ).join('\n')

  const relatedHtml = (article.relatedWork || []).map(r =>
    `<a href="${r.url}" style="display:block;padding:12px 0;border-bottom:1px solid var(--border);text-decoration:none;color:inherit;">
        <div style="font-size:15px;color:var(--text);margin-bottom:2px;">${r.title}</div>
        <div style="font-size:12px;color:var(--text-muted);">${r.label}</div>
      </a>`
  ).join('\n          ')

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${canonicalUrl}#article`,
        "headline": article.title,
        "description": article.description,
        "url": canonicalUrl,
        "image": ogUrl,
        "datePublished": article.datePublished,
        "dateModified": article.dateModified || article.datePublished,
        "author": { "@id": PERSON_ID },
        "mainEntityOfPage": { "@type": "WebPage", "@id": canonicalUrl }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Reuben Stone", "item": SITE_URL + "/" },
          { "@type": "ListItem", "position": 2, "name": "Writing", "item": SITE_URL + "/writing/" },
          { "@type": "ListItem", "position": 3, "name": article.title, "item": canonicalUrl }
        ]
      },
      {
        "@type": "Person",
        "@id": PERSON_ID,
        "name": "Reuben Stone",
        "url": SITE_URL + "/"
      }
    ]
  }, null, 2)

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${article.title} | Reuben Stone</title>
  <meta name="description" content="${article.description}">
  <link rel="canonical" href="${canonicalUrl}">
  <link rel="icon" href="${FAVICON}">
  <meta property="og:title" content="${article.title} | Reuben Stone">
  <meta property="og:description" content="${article.description}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:image" content="${ogUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:alt" content="${ogImageAlt}">
  <meta property="og:site_name" content="Reuben Stone">
  <meta property="article:published_time" content="${article.datePublished}">
  <meta property="article:modified_time" content="${article.dateModified || article.datePublished}">
  <meta property="article:author" content="${SITE_URL}/">
${topicTags}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${article.title} | Reuben Stone">
  <meta name="twitter:description" content="${article.description}">
  <meta name="twitter:image" content="${ogUrl}">
  <meta name="twitter:image:alt" content="${ogImageAlt}">
  <script type="application/ld+json">
${jsonLd}
  </script>
  ${FONTS}
  <style>
    ${SHARED_CSS}

    /* Article layout */
    .article-header { padding: 100px 0 60px; }
    .article-eyebrow {
      font-family: var(--mono);
      font-size: 11px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--text-muted);
      margin-bottom: 24px;
    }
    .article-eyebrow a {
      color: var(--text-muted);
      text-decoration: none;
    }
    .article-eyebrow a:hover { color: var(--text); }
    .article-title {
      font-family: var(--serif);
      font-size: clamp(1.8rem, 4vw, 2.8rem);
      font-weight: 600;
      line-height: 1.2;
      max-width: 800px;
      margin-bottom: 20px;
    }
    .article-standfirst {
      font-size: 17px;
      line-height: 1.7;
      color: var(--text-secondary);
      max-width: var(--reading-width);
      margin-bottom: 24px;
    }
    .article-meta {
      font-family: var(--mono);
      font-size: 11px;
      color: var(--text-muted);
      letter-spacing: 0.04em;
    }

    /* Article body */
    .article-body {
      max-width: var(--reading-width);
      padding-bottom: 80px;
    }
    .article-body p {
      font-size: 17px;
      line-height: 1.8;
      color: var(--text-secondary);
      margin-bottom: 28px;
    }
    .article-body h2 {
      font-family: var(--serif);
      font-size: 1.5rem;
      font-weight: 600;
      margin-top: 56px;
      margin-bottom: 20px;
    }
    .article-body h3 {
      font-size: 1.1rem;
      font-weight: 600;
      margin-top: 40px;
      margin-bottom: 16px;
    }
    .article-body ul, .article-body ol {
      padding-left: 24px;
      margin-bottom: 28px;
      color: var(--text-secondary);
    }
    .article-body li {
      font-size: 17px;
      line-height: 1.8;
      margin-bottom: 8px;
    }
    .article-body blockquote {
      border-left: 3px solid var(--border-strong);
      padding: 4px 0 4px 24px;
      margin: 40px 0;
      font-family: var(--serif);
      font-size: 1.15rem;
      font-style: italic;
      line-height: 1.6;
      color: var(--text);
    }
    .article-body code {
      font-family: var(--mono);
      font-size: 0.88em;
      background: var(--bg-raised);
      padding: 2px 6px;
      border-radius: 3px;
      color: var(--text);
    }
    .article-body pre {
      background: var(--bg-raised);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 20px 24px;
      overflow-x: auto;
      margin-bottom: 28px;
    }
    .article-body pre code {
      background: none;
      padding: 0;
      font-size: 13px;
      line-height: 1.6;
    }
    .article-body hr {
      border: none;
      border-top: 1px solid var(--border);
      margin: 48px 0;
    }
    .article-body a {
      color: var(--text);
      text-decoration: underline;
      text-underline-offset: 3px;
      text-decoration-color: var(--accent);
      transition: color 0.15s;
    }
    .article-body a:hover { color: var(--accent); }
    .article-body img {
      max-width: 100%;
      height: auto;
      border-radius: 6px;
      border: 1px solid var(--border);
      margin: 8px 0;
    }

    /* Article footer */
    .article-footer {
      border-top: 1px solid var(--border);
      padding: 60px 0;
      max-width: var(--reading-width);
    }
    .article-footer-label {
      font-family: var(--mono);
      font-size: 10px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--text-muted);
      margin-bottom: 16px;
    }
    .article-back {
      display: inline-block;
      margin-top: 40px;
      font-size: 14px;
      color: var(--text-muted);
      text-decoration: none;
      transition: color 0.15s;
    }
    .article-back:hover { color: var(--text); }

    @media (max-width: 768px) {
      .article-header { padding: 60px 0 40px; }
    }
  </style>
</head>
<body>
  ${nav('writing')}

  <main>
    <article>
      <div class="container">
        <header class="article-header">
          <div class="article-eyebrow"><a href="/writing/">Writing</a>${topicsMeta ? ' / ' + topicsMeta : ''}</div>
          <h1 class="article-title">${article.title}</h1>
          <p class="article-standfirst">${article.question}</p>
          <div class="article-meta"><time datetime="${article.datePublished}">${formatDate(article.datePublished)}</time> &middot; Reuben Stone</div>
        </header>

        <div class="article-body">
          ${article.html}
        </div>

        <footer class="article-footer">
          ${relatedHtml ? `<div class="article-footer-label">Related work</div>\n          ${relatedHtml}` : ''}
          <a href="/writing/" class="article-back">&larr; All writing</a>
        </footer>
      </div>
    </article>
  </main>

  ${FOOTER}
  <script defer src="/_vercel/insights/script.js"></script>
</body>
</html>`
}

// ── Writing index template ───────────────────────────────────────

function renderIndex(articles) {
  const listHtml = articles.map(a => `
        <a href="/writing/${a.slug}/" class="writing-entry">
          <div class="writing-entry-date"><time datetime="${a.datePublished}">${formatDateShort(a.datePublished)}</time></div>
          <div class="writing-entry-body">
            <h2 class="writing-entry-title">${a.title}</h2>
            <p class="writing-entry-question">${a.question}</p>
            ${a.excerpt ? `<p class="writing-entry-excerpt">${a.excerpt}</p>` : ''}
            ${a.topics?.length ? `<div class="writing-entry-topics">${a.topics.join(' / ')}</div>` : ''}
          </div>
        </a>`
  ).join('\n')

  // CollectionPage + ItemList JSON-LD
  const indexJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/writing/#page`,
        "name": "Writing",
        "description": "Notes on building software, products and AI systems.",
        "url": `${SITE_URL}/writing/`,
        "mainEntity": {
          "@type": "ItemList",
          "itemListElement": articles.map((a, i) => ({
            "@type": "ListItem",
            "position": i + 1,
            "url": `${SITE_URL}/writing/${a.slug}/`,
            "name": a.title
          }))
        },
        "author": { "@id": PERSON_ID }
      },
      {
        "@type": "Person",
        "@id": PERSON_ID,
        "name": "Reuben Stone",
        "url": `${SITE_URL}/`
      }
    ]
  }, null, 2)

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Writing | Reuben Stone - Senior Product Engineer</title>
  <meta name="description" content="Notes on building software, products and AI systems. Occasional writing about the engineering problems that emerge while building real products.">
  <link rel="canonical" href="${SITE_URL}/writing/">
  <link rel="icon" href="${FAVICON}">
  <meta property="og:title" content="Writing | Reuben Stone">
  <meta property="og:description" content="Notes on building software, products and AI systems.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${SITE_URL}/writing/">
  <meta property="og:image" content="${SITE_URL}/writing/og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:alt" content="Writing - Reuben Stone">
  <meta property="og:site_name" content="Reuben Stone">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Writing | Reuben Stone">
  <meta name="twitter:description" content="Notes on building software, products and AI systems.">
  <meta name="twitter:image" content="${SITE_URL}/writing/og-image.png">
  <meta name="twitter:image:alt" content="Writing - Reuben Stone">
  <script type="application/ld+json">
${indexJsonLd}
  </script>
  ${FONTS}
  <style>
    ${SHARED_CSS}

    .writing-hero { padding: 100px 0 60px; }
    .writing-label {
      font-family: var(--mono);
      font-size: 11px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--text-muted);
      margin-bottom: 48px;
    }
    .writing-heading {
      font-family: var(--serif);
      font-size: clamp(1.6rem, 3.5vw, 2.4rem);
      font-weight: 600;
      line-height: 1.2;
      max-width: 700px;
      margin-bottom: 20px;
    }
    .writing-intro {
      font-size: 16px;
      line-height: 1.7;
      color: var(--text-secondary);
      max-width: 600px;
    }

    /* Article list */
    .writing-list {
      padding-bottom: 80px;
    }
    .writing-entry {
      display: flex;
      gap: 32px;
      padding: 32px 0;
      border-top: 1px solid var(--border);
      text-decoration: none;
      color: inherit;
      transition: opacity 0.15s;
    }
    .writing-entry:last-child { border-bottom: 1px solid var(--border); }
    .writing-entry:hover { opacity: 0.8; }
    .writing-entry-date {
      font-family: var(--mono);
      font-size: 11px;
      color: var(--text-muted);
      letter-spacing: 0.04em;
      min-width: 120px;
      flex-shrink: 0;
      padding-top: 4px;
    }
    .writing-entry-body { flex: 1; min-width: 0; }
    .writing-entry-title {
      font-family: var(--serif);
      font-size: 1.3rem;
      font-weight: 600;
      line-height: 1.3;
      margin-bottom: 8px;
    }
    .writing-entry-question {
      font-size: 16px;
      line-height: 1.6;
      color: var(--text-secondary);
      max-width: 580px;
      margin-bottom: 8px;
    }
    .writing-entry-excerpt {
      font-size: 14px;
      line-height: 1.6;
      color: var(--text-muted);
      max-width: 580px;
      margin-bottom: 8px;
    }
    .writing-entry-topics {
      font-family: var(--mono);
      font-size: 10px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--text-muted);
    }

    @media (max-width: 768px) {
      .writing-hero { padding: 60px 0 40px; }
      .writing-entry { flex-direction: column; gap: 4px; }
      .writing-entry-date { min-width: 0; }
    }
  </style>
</head>
<body>
  ${nav('writing')}

  <main>
    <section class="writing-hero">
      <div class="container">
        <div class="writing-label">Writing</div>
        <h1 class="writing-heading">Notes on building software, products and AI systems.</h1>
        <p class="writing-intro">Occasional writing about the engineering problems that emerge while building real products.</p>
      </div>
    </section>

    <section class="writing-list">
      <div class="container">
        ${listHtml}
      </div>
    </section>
  </main>

  ${FOOTER}
  <script defer src="/_vercel/insights/script.js"></script>
</body>
</html>`
}

// ── Sitemap update ───────────────────────────────────────────────

function updateSitemap(articles) {
  let existing = ''
  if (existsSync(SITEMAP_PATH)) {
    existing = readFileSync(SITEMAP_PATH, 'utf-8')
  }

  // Extract non-writing URLs (preserve exactly as they are)
  const nonWritingUrls = []
  const urlRegex = /<url>\s*<loc>(.*?)<\/loc>\s*<lastmod>(.*?)<\/lastmod>(?:\s*<priority>(.*?)<\/priority>)?\s*<\/url>/g
  let match
  while ((match = urlRegex.exec(existing)) !== null) {
    if (!match[1].includes('/writing')) {
      nonWritingUrls.push({ loc: match[1], lastmod: match[2] })
    }
  }

  // Writing index lastmod = latest article modification
  const latestMod = articles.length > 0
    ? articles.reduce((latest, a) => {
        const d = a.dateModified || a.datePublished
        return d > latest ? d : latest
      }, articles[0].dateModified || articles[0].datePublished)
    : new Date().toISOString().slice(0, 10)

  const writingUrls = [
    { loc: `${SITE_URL}/writing/`, lastmod: latestMod }
  ]

  for (const a of articles) {
    writingUrls.push({
      loc: `${SITE_URL}/writing/${a.slug}/`,
      lastmod: a.dateModified || a.datePublished
    })
  }

  const allUrls = [...nonWritingUrls, ...writingUrls]
  const urlEntries = allUrls.map(u =>
    `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n  </url>`
  ).join('\n')

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>\n`
  writeFileSync(SITEMAP_PATH, sitemap)
  console.log(`  sitemap.xml updated (${allUrls.length} URLs)`)
}

// ── Main ─────────────────────────────────────────────────────────

const articles = loadArticles()
console.log(`Found ${articles.length} published article(s)`)

// Generate article pages
for (const article of articles) {
  const dir = join(OUTPUT_DIR, article.slug)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'index.html'), renderArticle(article))
  console.log(`  writing/${article.slug}/index.html`)
}

// Generate index
mkdirSync(OUTPUT_DIR, { recursive: true })
writeFileSync(join(OUTPUT_DIR, 'index.html'), renderIndex(articles))
console.log('  writing/index.html')

// Update sitemap
updateSitemap(articles)

console.log('Done')
