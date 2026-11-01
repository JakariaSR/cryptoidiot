// Build script: turns Markdown posts in blog-src/ into styled HTML pages,
// and regenerates sitemap.xml + robots.txt.
// Run on every deploy: Cloudflare Pages build command = "npm run build"
import { readdir, readFile, writeFile, mkdir, rm, cp } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SRC = ROOT + "blog-src/";
const OUT = ROOT + "blog/";
const SITE = "https://cryptoidiot.com";
const GA_ID = "G-G6GJPEWWKK";

function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function parsePost(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) throw new Error("Missing front matter (--- ... ---)");
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (kv) fm[kv[1]] = kv[2].trim();
  }
  return { fm, body: m[2].trim() };
}

function articlePage(slug, fm, html) {
  const navNext = fm.next_title && fm.next_url
    ? `<a href="${esc(fm.next_url)}">Next: ${esc(fm.next_title)} →</a>` : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(fm.title)}</title>
  <meta name="description" content="${esc(fm.description)}" />
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🤓</text></svg>" />
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_ID}');
  </script>
  <link rel="stylesheet" href="../css/style.css" />
</head>
<body>
  <header class="site-header">
    <div class="container header-inner">
      <a href="/" class="logo">crypto<span class="accent">idiot</span><span class="dot">.com</span></a>
      <nav class="main-nav" id="mainNav">
        <a href="/#tools">Tools</a>
        <a href="/#learn">Learn</a>
        <a href="/#blog">Blog</a>
        <a href="/#newsletter" class="nav-cta">Start Here</a>
      </nav>
      <button class="nav-toggle" id="navToggle" aria-label="Toggle menu">☰</button>
    </div>
  </header>

  <section class="article-hero">
    <div class="container">
      <span class="post-tag">${esc(fm.tag)}</span>
      <h1>${esc(fm.heading || fm.title)}</h1>
      <p class="article-meta">${esc(fm.readtime)} · Crypto Idiot Guides</p>
    </div>
  </section>

  <article class="article-body">
${html}

    <div class="article-nav">
      <a href="/#learn">← All guides</a>
      ${navNext}
    </div>
  </article>

  <footer class="site-footer">
    <div class="container footer-inner">
      <p class="footer-note">© 2026 CryptoIdiot.com — Not financial advice, obviously.</p>
    </div>
  </footer>
  <script src="../js/main.js"></script>
</body>
</html>
`;
}

const files = (await readdir(SRC)).filter((f) => f.endsWith(".md") && !f.startsWith("_"));
const posts = [];

for (const file of files) {
  const raw = await readFile(SRC + file, "utf8");
  const { fm, body } = parsePost(raw);
  const slug = file.replace(/\.md$/, "");
  const html = marked.parse(body, { mangle: false, headerIds: false });
  await mkdir(OUT, { recursive: true });
  await writeFile(OUT + slug + ".html", articlePage(slug, fm, html));
  posts.push({ slug, fm });
  console.log("built blog/" + slug + ".html");
}

// --- sitemap.xml + robots.txt ---
const today = new Date().toISOString().slice(0, 10);
const urls = [
  { loc: SITE + "/", lastmod: today, priority: "1.0" },
  ...posts
    .sort((a, b) => String(a.fm.date).localeCompare(String(b.fm.date)))
    .map((p) => ({
      loc: `${SITE}/blog/${p.slug}.html`,
      lastmod: p.fm.date || today,
      priority: "0.8",
    })),
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod><priority>${u.priority}</priority></url>`).join("\n")}
</urlset>
`;
await writeFile(ROOT + "sitemap.xml", sitemap);

const robots = `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`;
await writeFile(ROOT + "robots.txt", robots);

console.log("built sitemap.xml (" + urls.length + " urls) and robots.txt");

// --- dist/ output for Worker static assets ([assets] directory = "dist") ---
const DIST = ROOT + "dist/";
await rm(DIST, { recursive: true, force: true });
await mkdir(DIST, { recursive: true });
for (const item of ["index.html", "sitemap.xml", "robots.txt", "css", "js", "blog", "admin", "images"]) {
  try {
    await cp(ROOT + item, DIST + item, { recursive: true });
  } catch {
    // optional item (e.g. images/) may not exist yet
  }
}
console.log("built dist/ for Worker deploy");
