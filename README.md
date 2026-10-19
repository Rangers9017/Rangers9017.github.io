# Mahmutcan Zaman — Kişisel Blog

Yayın adresi: https://rangers9017.github.io/

Elektrik-elektronik mühendisliği, yazılım ve kişisel projelerim üzerine kişisel blog. Tasarım ve sayfa üretimi bu depodaki dosyalara aittir; Jekyll, tema, Ruby gemleri veya npm paketleri kullanmaz.

## Yeni yazı ekleme

`content/posts.json` içindeki diziye yeni bir nesne ekle:

- `slug`: URL'de kullanılacak kısa ad
- `title`, `description`, `date`
- `categories` ve `tags`
- `body`: HTML içerik

GitHub'a gönderildiğinde Pages iş akışı yazı sayfasını, ana sayfayı, arşivi ve ilgili etiket/kategori sayfalarını üretir.

## Yerel önizleme

Node.js 22 ile:

```sh
node scripts/build.mjs
```

Oluşan `_site` klasörünü herhangi bir statik HTTP sunucusuyla görüntüleyebilirsin. Üretim çıktısı HTML, CSS, JavaScript ve görsel dosyalarından oluşur.
