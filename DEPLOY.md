# Yayına Alma Rehberi

Mimari iki parçalı olduğu için iki ayrı yere kurulur:

| Parça | Nereye | Neden |
| --- | --- | --- |
| `frontend/` (Next.js) | **Vercel** | Next.js'i yapan firma; SSG + ISR sıfır ayarla çalışır, ücretsiz katman blog için fazlasıyla yeter |
| `backend/` (.NET 8) | **Railway / Render / Fly.io / kendi VPS'in** | Docker imajı hazır; kalıcı disk bağlaman şart |

> **Sıra önemli:** Önce backend'i yayına al, adresini not et, sonra frontend'i
> o adresle deploy et.

---

## 1. Backend (.NET API)

### Kritik: kalıcı disk

Veriler SQLite'ta (`website1.db`) tutuluyor. Çoğu PaaS'ta dosya sistemi
**geçicidir** — her deploy'da sıfırlanır. Aboneleri ve yorumları kaybetmemek için
`/data` yoluna kalıcı bir volume bağlaman **zorunlu**.

Dockerfile bunu zaten bekliyor:

```
ENV ConnectionStrings__Default="Data Source=/data/website1.db"
VOLUME /data
```

| Platform | Kalıcı disk nasıl bağlanır |
| --- | --- |
| Railway | Service → Settings → Volumes → Mount path: `/data` |
| Render | Service → Disks → Add Disk → Mount path: `/data` |
| Fly.io | `fly volumes create data --size 1` + `fly.toml` içinde `[mounts]` |
| VPS (Docker) | `docker run -v website1-data:/data ...` |

### Derleme ve çalıştırma

```bash
# Kök dizinden (Dockerfile bağlamı kök dizini bekliyor)
docker build -f backend/Website1.Api/Dockerfile -t website1-api .

docker run -d --name website1-api \
  -p 8080:8080 \
  -v website1-data:/data \
  -e 'Cors__AllowedOrigins__0=https://SENIN-DOMAININ.com' \
  website1-api
```

Şema (migration'lar) uygulama açılışında otomatik uygulanır; elle komut
çalıştırmana gerek yok.

### Ortam değişkenleri

| Değişken | Örnek | Not |
| --- | --- | --- |
| `ConnectionStrings__Default` | `Data Source=/data/website1.db` | Dockerfile'da varsayılan geliyor |
| `Cors__AllowedOrigins__0` | `https://seninsiten.com` | **Production domainini eklemezsen tarayıcı istekleri engellenir** |
| `Cors__AllowedOrigins__1` | `https://www.seninsiten.com` | www varyantını da ekle |
| `Comments__RequireApproval` | `true` | Yorumlar onaydan geçsin (spam koruması) |
| `Tcmb__CacheMinutes` | `30` | TCMB'yi gereksiz yormamak için düşürme |

> `appsettings.json` içindeki değerleri ortam değişkeniyle ezmek için iç içe
> anahtarları `__` (çift alt çizgi) ile yaz.

### Sağlık kontrolü

Platformun health check yolunu `GET /health` olarak ayarla.
`aspnet` imajında `curl` bulunmadığı için Docker `HEALTHCHECK` tanımlanmadı.

---

## 2. Frontend (Next.js → Vercel)

```bash
cd frontend
npx vercel        # ilk kurulum
npx vercel --prod # yayına al
```

Ya da GitHub deposunu Vercel'e bağla — **Root Directory** ayarını `frontend`
yap (repo kökü değil, aksi halde build bulunamaz).

### Vercel ortam değişkenleri

Vercel panelinde Settings → Environment Variables:

| Değişken | Değer |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://seninsiten.com` (sonunda `/` YOK) |
| `NEXT_PUBLIC_API_URL` | Backend'in canlı adresi, örn. `https://api.seninsiten.com` |
| `NEXT_PUBLIC_SITE_ENV` | `production` |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | `ca-pub-...` (AdSense onaylandıktan sonra) |
| `NEXT_PUBLIC_GA_ID` | `G-...` (opsiyonel) |
| `NEXT_PUBLIC_GSC_VERIFICATION` | Search Console doğrulama kodu |

> Preview/staging ortamı için `NEXT_PUBLIC_SITE_ENV=preview` ver — `robots.txt`
> otomatik olarak tüm siteyi indekslemeye kapatır, böylece test sürümün Google'a
> düşmez.

### Domain

Vercel → Domains → domainini ekle → DNS kayıtlarını uygula.
Backend için ayrı bir alt alan adı kullan (`api.seninsiten.com`) ve onu backend
sağlayıcına yönlendir.

---

## 3. Yayın sonrası kontrol listesi

### Hemen
- [ ] `https://seninsiten.com/health` değil, `API_URL/health` 200 dönüyor mu
- [ ] Ana sayfada döviz kuru kutusu görünüyor mu (görünmüyorsa CORS veya API_URL yanlış)
- [ ] Bülten formuna gerçek bir e-posta gir — 200 dönmeli
- [ ] `seninsiten.com/sitemap.xml` gerçek domaini gösteriyor mu (localhost değil)
- [ ] `seninsiten.com/robots.txt` içinde `Disallow: /` **olmamalı**

### SEO
- [ ] Google Search Console'a mülk ekle, doğrula
- [ ] `sitemap.xml`'i Search Console'a gönder
- [ ] Birkaç sayfayı [Rich Results Test](https://search.google.com/test/rich-results) ile kontrol et (JSON-LD)
- [ ] [PageSpeed Insights](https://pagespeed.web.dev/) ile mobil skoru ölç

### AdSense (başvurudan önce)
- [ ] `/gizlilik` ve `/sartlar` sayfalarındaki şablon uyarı kutularını kaldır, metinleri kendine göre yaz
- [ ] `site.config.js` → `ads.showPlaceholders = false`
- [ ] Yeterli sayıda özgün içerik yayında olsun
- [ ] İletişim sayfası ve "Hakkında" sayfası gerçek bilgi içersin

### Güvenlik / yedek
- [ ] SQLite dosyasının düzenli yedeği alınıyor mu (volume snapshot veya cron ile kopyalama)
- [ ] `.env.local` ve `*.db` dosyaları git'e girmemiş olsun (`.gitignore` kapsıyor)

---

## 4. Sık karşılaşılan sorunlar

**Kur kutusu canlıda görünmüyor**
→ `NEXT_PUBLIC_API_URL` yanlış ya da backend'in CORS listesinde domainin yok.
Tarayıcı konsolunda CORS hatası var mı bak. Kutu bilerek sessizce gizleniyor —
backend çöktüğünde site çökmesin diye.

**Sitemap'te `localhost:3000` yazıyor**
→ `NEXT_PUBLIC_SITE_URL` Vercel'de tanımlı değil. Ekledikten sonra
**yeniden deploy** et (ortam değişkenleri build sırasında gömülüyor).

**Aboneler deploy sonrası kayboldu**
→ Kalıcı volume bağlanmamış. Yukarıdaki tabloya bak.

**Yorumlar sitede görünmüyor**
→ `Comments__RequireApproval=true` olduğu için onay bekliyorlar. Şu an onay
verecek bir yönetim arayüzü yok; veritabanında `IsApproved=1` yapman gerekiyor.
