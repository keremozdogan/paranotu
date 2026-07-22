# White-Label Blog Platformu

Next.js (App Router) + .NET 8 Minimal API üzerine kurulu, **tek config dosyasından
yeni bir nişe dönüştürülebilen** SEO odaklı blog altyapısı.

İlk konsept: **Gençler İçin Mikro-Birikim ve Bütçe Rehberi**.

---

## Hızlı başlangıç

```bash
# 1) Backend (terminal 1)
cd backend/Website1.Api
dotnet run                      # → http://localhost:5199  (Swagger: /swagger)

# 2) Frontend (terminal 2)
cd frontend
cp .env.example .env.local      # değerleri doldur
npm install
npm run dev                     # → http://localhost:3000
```

Backend kapalıyken de site çalışır — API'ye bağlı modüller (kur widget'ı gibi)
kendini gizler, sayfa çökmez.

---

## Klasör hiyerarşisi

```
website1/
├── website1.sln                       .NET solution
├── README.md
│
├── frontend/                          ── NEXT.JS ──────────────────────────
│   ├── site.config.js                 ⭐ TEK KONTROL NOKTASI
│   ├── presets/
│   │   └── tech.config.js             Niş değiştirme örneği (teknoloji blogu)
│   ├── .env.example                   Ortam değişkeni şablonu
│   │
│   ├── content/
│   │   └── posts/                     ⭐ İÇERİK — .mdx dosyaları
│   │       ├── butce-50-30-20-kurali.mdx
│   │       ├── mikro-birikim-gunde-20-lira.mdx
│   │       ├── acil-durum-fonu-nasil-kurulur.mdx
│   │       └── enflasyon-ve-birikim-101.mdx
│   │
│   └── src/
│       ├── app/                       App Router
│       │   ├── layout.js              Kök layout + global metadata
│       │   ├── page.js                Ana sayfa
│       │   ├── globals.css            Tema köprüsü + makale tipografisi
│       │   ├── actions.js             Server Actions (form → .NET)
│       │   ├── sitemap.js             ⭐ Dinamik /sitemap.xml
│       │   ├── robots.js              ⭐ Dinamik /robots.txt
│       │   ├── not-found.js           404
│       │   ├── rss.xml/route.js       RSS beslemesi
│       │   ├── blog/
│       │   │   ├── page.js            Yazı listesi (sayfalı)
│       │   │   └── [slug]/page.js     Yazı detayı (SSG)
│       │   ├── kategori/[category]/page.js
│       │   ├── etiket/[tag]/page.js
│       │   ├── hakkinda/page.js
│       │   ├── iletisim/page.js
│       │   ├── gizlilik/page.js       AdSense için zorunlu (şablon)
│       │   └── sartlar/page.js        (şablon)
│       │
│       ├── components/
│       │   ├── AdBanner.jsx           ⭐ REKLAM ALANI
│       │   ├── AdSenseUnit.jsx        Gerçek AdSense <ins> birimi
│       │   ├── Scripts.jsx            AdSense + GA script'leri (koşullu)
│       │   ├── ThemeVars.jsx          site.config renkleri → CSS değişkenleri
│       │   ├── Header.jsx / MobileNav.jsx / Logo.jsx / Footer.jsx
│       │   ├── PostCard.jsx / Pagination.jsx / SearchDialog.jsx
│       │   ├── TableOfContents.jsx / ShareButtons.jsx
│       │   ├── Newsletter.jsx         .NET'e bağlı bülten formu
│       │   ├── ContactForm.jsx        .NET'e bağlı iletişim formu
│       │   ├── LiveRates.jsx          Nişe özel: canlı kur widget'ı
│       │   └── mdx/
│       │       ├── MdxContent.jsx     MDX render + bileşen eşlemesi
│       │       ├── Callout.jsx        MDX içi bilgi kutusu
│       │       └── KeyStat.jsx        MDX içi vurgulu sayı
│       │
│       ├── lib/
│       │   ├── posts.js               İçerik katmanı (frontmatter, TOC, ilgili yazılar)
│       │   ├── seo.js                 Metadata + JSON-LD üretimi
│       │   └── format.js              Tarih / para / yüzde biçimleme
│       │
│       └── services/
│           └── api.js                 ⭐ .NET API SERVİS KATMANI
│
└── backend/Website1.Api/              ── .NET 8 MINIMAL API ────────────────
    ├── Program.cs                     DI, CORS, JSON (camelCase), pipeline
    ├── Models/Contracts.cs            İstek/yanıt sözleşmeleri + doğrulama
    ├── Endpoints/EndpointExtensions.cs Tüm endpoint tanımları
    ├── Services/
    │   ├── IRatesService.cs           Kur verisi (örnek veri)
    │   ├── INewsletterService.cs      Bülten aboneliği
    │   ├── ICommentService.cs         Yorumlar
    │   └── IPostStatsService.cs       Görüntülenme sayacı
    └── appsettings.json               CORS izinli adresler
```

---

## 1. Yeni bir nişe geçmek (White-Label)

```bash
cd frontend
cp presets/tech.config.js site.config.js   # veya kendi preset'ini yaz
rm content/posts/*.mdx                     # eski içeriği kaldır
npm run dev
```

**Kod tabanında başka hiçbir değişiklik gerekmez.** `site.config.js` şunları yönetir:

| Alan | Ne kontrol eder |
| --- | --- |
| `name`, `tagline`, `description`, `url` | Kimlik ve tüm SEO metinleri |
| `logo` | Yazı logosu ya da `/public` içindeki görsel |
| `theme.primary` / `theme.accent` | **Tüm renk paleti** (aşağıya bak) |
| `nav`, `footerNav`, `categories` | Menüler ve kategori sayfaları |
| `ads` | AdSense client + slot ID'leri |
| `features` | Modülleri aç/kapa (`liveRates`, `comments`, `search`…) |
| `api.baseUrl` | .NET backend adresi |
| `seo` | Başlık şablonu, varsayılan anahtar kelimeler, yasal uyarı |

### Renkler nasıl çalışıyor?

`site.config.js` → `<ThemeVars />` → `--brand-*` CSS değişkenleri → `globals.css`
içindeki `@theme` bloğu → `bg-primary-600` gibi Tailwind sınıfları.

Yani **paleti değiştirmek için Tailwind'i yeniden yapılandırman gerekmez**; tek
bir objeyi düzenlemen yeterli.

---

## 2. İçerik ekleme

`frontend/content/posts/` altına bir `.mdx` dosyası at — sitemap, RSS, kategori
sayfaları ve ilgili yazılar otomatik güncellenir.

```mdx
---
title: "Yazı başlığı"
description: "Arama sonuçlarında görünecek özet (boş bırakılırsa otomatik üretilir)."
date: 2026-07-20
updated: 2026-07-22        # opsiyonel
category: butce            # site.config.js → categories slug'ı
author: editor             # site.config.js → authors anahtarı
featured: true             # ana sayfada öne çıkar
draft: false               # true → sadece geliştirmede görünür
image: /images/kapak.jpg   # opsiyonel
keywords: [bütçe, tasarruf] # meta keywords
tags: [başlangıç, alışkanlık]
---

Metin buraya. Markdown'a ek olarak şu bileşenleri kullanabilirsin:

<Callout type="tip" title="İpucu">Vurgulanacak not.</Callout>
<KeyStat value="%20" label="Birikim payı" note="Alt açıklama" />
<AdBanner placement="inArticle" />
<Newsletter variant="inline" />
```

---

## 3. AdSense'i aktif etme

Reklam alanları **şu an placeholder olarak duruyor**. Açmak için `site.config.js`:

```js
ads: {
  enabled: true,                              // ① aç
  client: "ca-pub-XXXXXXXXXXXXXXXX",          // ② AdSense publisher ID
  showPlaceholders: false,                    // ③ yer tutucuları gizle
  slots: {
    headerBelow: "1234567890",                // ④ panelden aldığın slot ID'leri
    inArticle:   "1234567891",
    sidebar:     "1234567892",
    listInline:  "1234567893",
    footer:      "1234567894",
  },
}
```

Kodda tek satır değişiklik gerekmez — `<AdBanner />` otomatik olarak gerçek
AdSense birimine döner ve script `<Scripts />` üzerinden yüklenir.

**Yayın öncesi kontrol listesi:** `/gizlilik` ve `/sartlar` sayfalarındaki şablon
metinleri kendi durumuna göre düzenle (AdSense başvurusu gizlilik politikası ister).

### Mevcut reklam konumları

| `placement` | Nerede |
| --- | --- |
| `headerBelow` | Başlık altı — ana sayfa, blog, kategori |
| `inArticle` | Yazının başı ve sonu (+ MDX içinde istediğin yere) |
| `sidebar` | Yan menü — ana sayfa ve yazı detayı |
| `listInline` | Liste araları (her `content.adEveryNPosts` karttan sonra) |
| `footer` | Alt bilgi üstü |

---

## 4. .NET entegrasyonu

Tüm API çağrıları `frontend/src/services/api.js` üzerinden geçer. Bileşenler
doğrudan `fetch` çağırmaz.

| Next.js fonksiyonu | .NET endpoint |
| --- | --- |
| `getLiveRates()` | `GET /api/rates` |
| `subscribeToNewsletter()` | `POST /api/newsletter/subscribe` |
| `getComments(slug)` | `GET /api/comments?slug=` |
| `postComment()` | `POST /api/comments` |
| `sendContactMessage()` | `POST /api/contact` |
| `trackPostView(slug)` | `POST /api/posts/{slug}/view` |
| `getPostStats(slug)` | `GET /api/posts/{slug}/stats` |
| `checkApiHealth()` | `GET /health` |

**Dayanıklılık:** her çağrının 8 saniye zaman aşımı var ve hata durumunda
güvenli bir varsayılan döner. Backend çökse bile blog ayakta kalır.

### Kalıcı veritabanına geçiş

Servisler şu an bellek içi çalışıyor (uygulama yeniden başlayınca veri silinir).
EF Core'a geçmek için arayüzün yeni bir uygulamasını yaz ve `Program.cs`'te tek
satırı değiştir:

```csharp
builder.Services.AddSingleton<INewsletterService, InMemoryNewsletterService>();
// ↓
builder.Services.AddScoped<INewsletterService, EfNewsletterService>();
```

Endpoint'ler ve Next.js tarafı aynı kalır.

---

## 5. Yayına almadan önce

- [ ] `.env.local` → `NEXT_PUBLIC_SITE_URL` gerçek domain (sonunda `/` olmadan)
- [ ] `site.config.js` → `url`, `social`, `authors` güncel
- [ ] `/public/og-default.png` (1200×630) ekle
- [ ] `/gizlilik` ve `/sartlar` metinlerini hukuki kontrolden geçir
- [ ] `ads.showPlaceholders = false`
- [ ] Google Search Console doğrulaması → `NEXT_PUBLIC_GSC_VERIFICATION`
- [ ] Staging ortamında `NEXT_PUBLIC_SITE_ENV=preview` (indekslemeyi kapatır)
- [ ] `appsettings.json` → `Cors:AllowedOrigins` production domainini içersin

---

## Teknik notlar

- **Next.js 16.2** (App Router, Turbopack) · React 19 · Tailwind CSS v4
- Yazılar build sırasında statik üretilir (SSG); `dynamicParams = false` ile
  tanımsız slug'lar 404 döner
- MDX `next-mdx-remote/rsc` ile sunucuda render edilir — istemciye MDX runtime gitmez
- Başlık id'leri `lib/posts.js` içindeki Türkçe uyumlu `slugify` ile üretilir,
  böylece içindekiler bağlantıları birebir tutar
- JSON-LD: `Organization`, `WebSite`, `BlogPosting`, `BreadcrumbList`
- Arama istemci tarafında çalışır (backend gerektirmez); içerik çok büyürse
  `services/api.js` üzerinden .NET'e taşınabilir
