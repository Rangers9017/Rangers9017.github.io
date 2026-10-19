# Mahmutcan Zaman — Kişisel Blog

[Blogu görüntüle](https://rangers9017.github.io/)

Elektrik-elektronik, yazılım ve kişisel projelerimle ilgili yazılarımı burada paylaşıyorum. Site, bu depodaki HTML, CSS ve JavaScript dosyalarıyla oluşturuluyor; Jekyll, tema, Ruby gemleri veya npm paketleri gerektirmiyor.

## Yazı eklemek

`content/posts.json` dosyasındaki listeye yeni bir yazı ekle. Her yazıda `slug`, `title`, `description`, `date`, `categories`, `tags` ve HTML içeriğini tutan `body` alanları bulunur.

GitHub'a gönderilen değişiklik, yazı sayfasını ve ilgili arşiv, kategori ve etiket sayfalarını üretir.

## Yerel önizleme

Node.js 22 kuruluysa proje klasöründe:

```sh
node scripts/build.mjs
```

Üretilen site `_site` klasörüne yazılır. Bu klasörü yerel bir statik HTTP sunucusuyla görüntüleyebilirsin.
