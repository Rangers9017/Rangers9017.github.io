import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const out = path.join(root, "_site");
const site = JSON.parse(fs.readFileSync(path.join(root, "content/site.json"), "utf8"));
const posts = JSON.parse(fs.readFileSync(path.join(root, "content/posts.json"), "utf8"))
  .sort((a, b) => b.date.localeCompare(a.date));
const tools = JSON.parse(fs.readFileSync(path.join(root, "content/tools.json"), "utf8"));
const about = fs.readFileSync(path.join(root, "content/about.html"), "utf8");
const version = process.env.SITE_VERSION || "dev";
const base = site.baseurl.replace(/\/$/, "");

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
fs.cpSync(path.join(root, "assets"), path.join(out, "assets"), { recursive: true });
for (const stale of ["assets/feed.xml", "assets/robots.txt"]) fs.rmSync(path.join(out, stale), { force: true });
fs.mkdirSync(path.join(out, "tools"), { recursive: true });
for (const file of fs.readdirSync(path.join(root, "tools"))) {
  if (file.endsWith(".html")) {
    fs.copyFileSync(path.join(root, "tools", file), path.join(out, "tools", file));
  }
}
function esc(value = "") {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
function slugify(value) {
  return value.toLocaleLowerCase("tr-TR")
    .replaceAll("ı", "i").replaceAll("ğ", "g").replaceAll("ü", "u")
    .replaceAll("ş", "s").replaceAll("ö", "o").replaceAll("ç", "c")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function href(route) {
  return base + (route.startsWith("/") ? route : "/" + route);
}
function dateLabel(value) {
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "long", timeZone: "Europe/Istanbul" })
    .format(new Date(value + "T12:00:00+03:00"));
}
function writeRoute(route, html) {
  const clean = route.replace(/^\/+|\/+$/g, "");
  const target = !clean ? path.join(out, "index.html") : clean.endsWith(".html") ? path.join(out, clean) : path.join(out, clean, "index.html");
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, html, "utf8");
}
function shell(title, description, route, body) {
  const canonical = "https://rangers9017.github.io" + encodeURI(href(route || "/"));
  return `<!doctype html>
<html lang="${esc(site.language)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="${esc(description || site.description)}">
<meta name="theme-color" content="#f4f7fb">
<link rel="canonical" href="${canonical}">
<link rel="icon" href="${href("/assets/img/favicons/favicon.svg")}" type="image/svg+xml">
<link rel="stylesheet" href="${href("/assets/css/site.css")}?v=${encodeURIComponent(version)}">
<title>${esc(title === site.title ? site.title : title + " · " + site.title)}</title>
<script>
(function () {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then(function (items) {
      items.filter(function (item) {
        return new URL(item.scope).pathname.indexOf("${base}/") === 0;
      }).forEach(function (item) { item.unregister(); });
    });
  }
  if ("caches" in window) {
    caches.keys().then(function (keys) {
      keys.filter(function (key) { return /chirpy/i.test(key); })
        .forEach(function (key) { caches.delete(key); });
    });
  }
})();
</script>
</head>
<body>
<header class="site-header">
  <a class="brand" href="${href("/")}">${esc(site.title)}</a>
  <p class="tagline">${esc(site.tagline)}</p>
  <nav aria-label="Ana menü">
    ${[["Ana Sayfa","/"],["Kategoriler","/categories/"],["Etiketler","/tags/"],["Arşiv","/archives/"],["Araçlar ve Simülasyonlar","/tools/"],["Hakkımda","/about/"]].map(([name, url]) => `<a href="${href(url)}"${route === url ? ' aria-current="page"' : ""}>${name}</a>`).join("\n    ")}
  </nav>
</header>
<main class="site-main">${body}</main>
<footer class="site-footer"><span>© ${new Date().getUTCFullYear()} ${esc(site.title)}.</span><span>${esc(site.description)}</span></footer>
</body>
</html>`;
}
function chips(post) {
  const categories = post.categories.map(name => `<a href="${href("/categories/" + slugify(name) + "/")}">${esc(name)}</a>`);
  const tags = post.tags.map(name => `<a href="${href("/tags/" + slugify(name) + "/")}">#${esc(name)}</a>`);
  return [...categories, ...tags].join(" ");
}
function postCard(post) {
  return `<article class="post-card">
<p class="post-date"><time datetime="${esc(post.date)}">${dateLabel(post.date)}</time></p>
<h2><a href="${href("/posts/" + post.slug + "/")}">${esc(post.title)}</a></h2>
<p>${esc(post.description)}</p>
<div class="tag-list">${chips(post)}</div>
<a class="read-more" href="${href("/posts/" + post.slug + "/")}">Yazıyı oku →</a>
</article>`;
}
const newest = posts[0];
const homeBody = `<section class="intro"><p class="eyebrow">Elektrik-elektronik • yazılım • kişisel projeler</p><h1>Merhaba, ben Mahmutcan.</h1><p>Elektrik-elektronik mühendisliği, gömülü yazılım, otomasyon ve geliştirdiğim projeler üzerine notlar.</p><p><a class="read-more" href="${href("/about/")}">Hakkımda →</a>　<a class="read-more" href="${href("/tools/")}">Araçlar ve simülasyonlar →</a></p></section>
<section aria-labelledby="latest"><h2 id="latest">Son yazılar</h2><div class="post-list">${posts.map(postCard).join("\n") || "<p>Henüz yazı eklenmemiş.</p>"}</div></section>`;
writeRoute("/", shell(site.title, site.description, "/", homeBody));
writeRoute("/about/", shell("Hakkımda", "Mahmutcan Zaman hakkında", "/about/", `<article class="content-page"><h1>Hakkımda</h1>${about}</article>`));
const toolCards = tools.map(tool => `<a class="tool-card" href="${href("/tools/" + tool.slug)}">
<div class="tool-preview"><img src="${href("/assets/img/tool-previews/" + tool.preview)}?v=${encodeURIComponent(version)}" alt="${esc(tool.alt)}" loading="lazy"></div>
<div class="tool-card-body"><span class="tool-category">${esc(tool.category)}</span><h2>${esc(tool.title)}</h2><p>${esc(tool.description)}</p><span class="tool-open">${esc(tool.action)} <span aria-hidden="true">↗</span></span></div>
</a>`).join("\n");
const toolsBody = `<article class="content-page"><h1>Araçlar ve Simülasyonlar</h1><div class="tools-intro"><span class="tools-kicker">Mahmutcan'ın dijital atölyesi</span><p>Mühendislik, teknoloji ve günlük hayat için hazırladığım interaktif araçları keşfet. Bir kart seçerek uygulamayı açabilirsin.</p></div><div class="tool-grid">${toolCards}</div></article>`;
writeRoute("/tools/", shell("Araçlar ve Simülasyonlar", "Mühendislik, teknoloji ve kişisel projeler için interaktif araçlar.", "/tools/", toolsBody));
writeRoute("/archives/", shell("Arşiv", "Blog yazılarının tarih sırasına göre arşivi.", "/archives/", `<section class="content-page"><h1>Arşiv</h1><ul class="archive-list">${posts.map(p => `<li><time datetime="${esc(p.date)}">${dateLabel(p.date)}</time><a href="${href("/posts/" + p.slug + "/")}">${esc(p.title)}</a></li>`).join("")}</ul></section>`));
const categories = [...new Set(posts.flatMap(p => p.categories))].sort((a,b) => a.localeCompare(b,"tr"));
const tags = [...new Set(posts.flatMap(p => p.tags))].sort((a,b) => a.localeCompare(b,"tr"));
writeRoute("/categories/", shell("Kategoriler", "Blog yazılarını kategorilere göre keşfet.", "/categories/", `<section class="content-page"><h1>Kategoriler</h1><div class="tag-cloud">${categories.map(name => `<a href="${href("/categories/" + slugify(name) + "/")}">${esc(name)} <span>(${posts.filter(p=>p.categories.includes(name)).length})</span></a>`).join("")}</div></section>`));
writeRoute("/tags/", shell("Etiketler", "Blog yazılarını etiketlere göre keşfet.", "/tags/", `<section class="content-page"><h1>Etiketler</h1><div class="tag-cloud">${tags.map(name => `<a href="${href("/tags/" + slugify(name) + "/")}">#${esc(name)} <span>(${posts.filter(p=>p.tags.includes(name)).length})</span></a>`).join("")}</div></section>`));
for (const category of categories) {
  const related = posts.filter(p => p.categories.includes(category));
  const route = "/categories/" + slugify(category) + "/";
  const body = `<section class="content-page"><p class="eyebrow">Kategori</p><h1>${esc(category)}</h1><div class="post-list">${related.map(postCard).join("")}</div></section>`;
  writeRoute(route, shell(category, category + " kategorisindeki yazılar.", route, body));
  const raw = category.toLocaleLowerCase("tr-TR").replaceAll(" ","-");
  for (const alias of new Set([raw, category.replaceAll(" ", "-")])) if (alias !== slugify(category)) writeRoute("/categories/" + alias + "/", shell(category, category + " kategorisindeki yazılar.", "/categories/" + alias + "/", body));
}
for (const tag of tags) {
  const related = posts.filter(p => p.tags.includes(tag));
  const route = "/tags/" + slugify(tag) + "/";
  const body = `<section class="content-page"><p class="eyebrow">Etiket</p><h1>#${esc(tag)}</h1><div class="post-list">${related.map(postCard).join("")}</div></section>`;
  writeRoute(route, shell(tag, tag + " etiketli yazılar.", route, body));
  const raw = tag.toLocaleLowerCase("tr-TR").replaceAll(" ","-");
  for (const alias of new Set([raw, tag.replaceAll(" ", "-")])) if (alias !== slugify(tag)) writeRoute("/tags/" + alias + "/", shell(tag, tag + " etiketli yazılar.", "/tags/" + alias + "/", body));
}
for (const post of posts) {
  const route = "/posts/" + post.slug + "/";
  const body = `<article class="post-page"><header class="post-header"><p class="post-date"><time datetime="${esc(post.date)}">${dateLabel(post.date)}</time></p><h1>${esc(post.title)}</h1><p class="post-description">${esc(post.description)}</p><div class="tag-list">${chips(post)}</div></header><div class="post-content">${post.body}</div></article>`;
  writeRoute(route, shell(post.title, post.description, route, body));
}
writeRoute("/404.html", shell("Sayfa bulunamadı", "Aradığın sayfa bulunamadı.", "/404.html", `<section class="content-page"><h1>Sayfa bulunamadı</h1><p>Aradığın sayfa burada yok. Ana sayfaya dönüp yazılara göz atabilirsin.</p><p><a href="${href("/")}" class="read-more">Ana sayfaya dön →</a></p></section>`));
function xml(value = "") {
  return String(value).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&apos;");
}
const feedEntries = posts.map(p => {
  const url = "https://rangers9017.github.io" + encodeURI(href("/posts/" + p.slug + "/"));
  const updated = new Date(p.date + "T12:00:00+03:00").toISOString();
  return `<entry><title>${xml(p.title)}</title><link href="${url}"/><id>${url}</id><published>${updated}</published><updated>${updated}</updated><summary>${xml(p.description)}</summary><author><name>${xml(site.title)}</name></author></entry>`;
}).join("\n");
fs.writeFileSync(path.join(out,"feed.xml"), `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom"><id>https://rangers9017.github.io${base}/</id><title>${xml(site.title)}</title><subtitle>${xml(site.description)}</subtitle><updated>${new Date((newest?.date || "2026-01-01") + "T12:00:00+03:00").toISOString()}</updated><link rel="self" href="https://rangers9017.github.io${base}/feed.xml"/><link rel="alternate" href="https://rangers9017.github.io${base}/"/><generator>Mahmutcan Zaman Static Blog</generator>${feedEntries}</feed>`, "utf8");
const routes = ["/","/about/","/tools/","/archives/","/categories/","/tags/",...categories.map(c=>"/categories/"+slugify(c)+"/"),...tags.map(t=>"/tags/"+slugify(t)+"/"),...posts.map(p=>"/posts/"+p.slug+"/")];
const appRoutes = tools.map(t=>"/tools/"+t.slug);
const urls = [...routes,...appRoutes].map(r=>`<url><loc>https://rangers9017.github.io${encodeURI(href(r))}</loc></url>`).join("");
fs.writeFileSync(path.join(out,"sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, "utf8");
fs.writeFileSync(path.join(out,"robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: https://rangers9017.github.io${base}/sitemap.xml\n`, "utf8");
fs.writeFileSync(path.join(out,".nojekyll"), "", "utf8");
console.log(`Built ${routes.length} custom pages and copied ${tools.length} tools to _site (no Jekyll).`);
