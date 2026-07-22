# Yayına Alma — Sade Anlatım

Bu dosya `DEPLOY.md`'nin terim açıklamalı sürümüdür. Aynı işi anlatır,
ama hiçbir kelimeyi bildiğini varsaymaz.

---

## Önce sözlük

Aşağıda sürekli geçecek kelimeler. Bir kere okursan gerisi kolay.

| Kelime | Ne demek |
| --- | --- |
| **localhost** | "Bu bilgisayar". `localhost:3000` = sadece senin makinende çalışan site. Bilgisayarı kapatınca kapanır. |
| **Deploy (yayına alma)** | Siteyi 7/24 açık bir bilgisayara (sunucuya) taşımak, ki herkes girebilsin. |
| **Frontend (ön yüz)** | Ziyaretçinin gördüğü kısım: yazılar, tasarım, menüler. Bizde `frontend/` klasörü. |
| **Backend (arka uç)** | Perde arkası: veri saklama, hesaplama. Bizde `backend/` klasörü — döviz kuru ve bülten aboneleri için. |
| **Vercel** | Next.js sitelerini yayınlayan hizmet. Küçük siteler için **ücretsiz**. |
| **GitHub** | Kodun saklandığı yer. Vercel kodu buradan alıp yayınlıyor. |
| **DNS** | İnternetin telefon rehberi. "paranotu.com yazan kişiyi şu sunucuya götür" talimatı. |
| **SSL / HTTPS** | Adres çubuğundaki kilit simgesi. Vercel **ücretsiz ve otomatik** veriyor, satın alma. |
| **Ortam değişkeni (env variable)** | Koda gömmek istemediğin ayarlar (adresler, şifreler). Panelden girilir. |
| **Build (derleme)** | Kodun, tarayıcının anlayacağı hale getirilmesi. Vercel otomatik yapar. |
| **Docker / imaj** | Backend'i "kutulayıp" her yerde aynı çalışmasını sağlayan teknoloji. |
| **Volume (kalıcı disk)** | Sunucuda **silinmeyen** depolama alanı. Bunu ayarlamazsan veriler her güncellemede sıfırlanır. |
| **CORS** | Tarayıcı güvenlik kuralı. Backend'e "şu siteden gelen isteklere izin ver" demen gerekiyor. |
| **Sitemap** | Google'a "sitemde şu sayfalar var" diyen dosya. Bizde otomatik üretiliyor. |

---

## Önemli karar: backend'i şimdi kurma

`DEPLOY.md` iki parçayı da yayına almanı anlatıyor. **Ama zorunlu değil.**

Kod öyle yazılmış ki, backend kapalıyken site **çökmüyor** —
`frontend/src/services/api.js` içindeki `safe()` fonksiyonu devreye giriyor
ve döviz kuru kutusu sessizce gizleniyor. Yazılar, kategoriler, hesaplayıcılar,
arama, SEO — hepsi backend'siz çalışır. Bunlar zaten sitenin %95'i.

Backend sadece iki şey için gerekli:

- **Canlı döviz kuru kutusu** (TCMB'den çekiyor)
- **Bülten aboneliği** (e-posta topluyor)

İlk aylarda ziyaretçin olmayacağı için toplanacak e-posta da yok.
Yani backend'i kurmak **şimdilik para ve uğraş kaybı**.

**Önerilen sıra:**

1. **Şimdi:** Sadece frontend'i Vercel'e al (ücretsiz, ~30 dakika)
2. **Trafik gelmeye başlayınca:** Backend'i ekle

Backend'i ertelersen bülten formunu kapat, kırık form görünmesin:

```js
// frontend/site.config.js
features: {
  newsletter: false,   // backend gelince tekrar true yap
  liveRates: false,    // backend gelince tekrar true yap
  ...
}
```

---

## AŞAMA 1 — Frontend'i yayına alma (ücretsiz)

### Adım 1: Kodu GitHub'a yükle

Vercel kodu GitHub'dan okuyor.

1. [github.com](https://github.com) → hesap aç (ücretsiz)
2. Yeni **repository** (kod deposu) oluştur → **Private** (özel) seç
3. Bilgisayarındaki kodu oraya gönder

> Bu adımda takılırsan söyle, komutları birlikte çalıştırırız.

### Adım 2: Vercel'e bağla

1. [vercel.com](https://vercel.com) → **GitHub hesabınla giriş yap**
2. **Add New → Project** → az önceki depoyu seç
3. ⚠️ **En kritik ayar:** **Root Directory** kutusuna `frontend` yaz.
   Boş bırakırsan build başarısız olur — çünkü site kodu kökte değil,
   `frontend/` klasörünün içinde.
4. **Deploy** butonuna bas

Birkaç dakika sonra `proje-adi.vercel.app` gibi bir adres verecek. Site canlı.

### Adım 3: Ayarları gir

Vercel panelinde **Settings → Environment Variables**:

| Değişken | Değer | Zorunlu mu |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://paranotu.com` (sonda `/` **yok**) | ✅ Evet |
| `NEXT_PUBLIC_SITE_ENV` | `production` | ✅ Evet |
| `NEXT_PUBLIC_GA_ID` | `G-...` (Analytics kodu) | Sonra |
| `NEXT_PUBLIC_GSC_VERIFICATION` | Search Console kodu | Sonra |
| `NEXT_PUBLIC_API_URL` | Backend adresi | Backend kurunca |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | `ca-pub-...` | AdSense onayı gelince |

> ⚠️ **Önemli:** Bu değerler **build sırasında** koda gömülüyor.
> Sonradan değiştirirsen **yeniden deploy etmen** gerekir, yoksa eski değer kalır.

### Adım 4: Domaini bağla

1. Vercel → **Settings → Domains** → `paranotu.com` yaz → Add
2. Vercel sana DNS kayıtları verecek (`A` ve `CNAME` diye iki satır)
3. Bu kayıtları **domaini aldığın yerde** (Namecheap/Cloudflare) DNS bölümüne gir
4. Yayılması **birkaç dakika ile birkaç saat** sürebilir — normal, bekle

`www.paranotu.com` varyantını da ekle; Vercel birini diğerine otomatik yönlendirir.
SSL (kilit simgesi) otomatik gelir, hiçbir şey satın alma.

---

## AŞAMA 2 — Backend (sonraya bırakılabilir)

Trafik gelip bülten toplamak istediğinde yapılacak.

### En kritik nokta: kalıcı disk

Veriler `website1.db` adlı tek bir dosyada (SQLite) duruyor. Çoğu sunucu
hizmetinde dosyalar **geçicidir** — her güncellemede silinir. Aboneleri
kaybetmemek için `/data` yoluna **kalıcı disk (volume)** bağlaman şart.

| Hizmet | Nereden bağlanır | Fiyat |
| --- | --- | --- |
| Railway | Service → Settings → Volumes → Mount path: `/data` | ~$5/ay |
| Render | Service → Disks → Add Disk → Mount path: `/data` | ~$7/ay |
| Fly.io | `fly volumes create data --size 1` | Küçük kullanımda ucuz |

### Girilecek ayarlar

| Değişken | Değer | Ne işe yarar |
| --- | --- | --- |
| `ConnectionStrings__Default` | `Data Source=/data/website1.db` | Veritabanı konumu (hazır geliyor) |
| `Cors__AllowedOrigins__0` | `https://paranotu.com` | **Bunu girmezsen tarayıcı istekleri engeller** |
| `Cors__AllowedOrigins__1` | `https://www.paranotu.com` | www varyantı |
| `Comments__RequireApproval` | `true` | Yorumlar onaydan geçsin (spam koruması) |

> Ayar adlarındaki `__` (çift alt çizgi) yazım kuralıdır, bozma.

Kurduktan sonra Vercel'e dön ve `NEXT_PUBLIC_API_URL` değişkenine backend'in
adresini gir, sonra **yeniden deploy et**.

**Sağlık kontrolü:** Hizmet "health check path" sorarsa `/health` yaz.

---

## Yayın sonrası kontrol listesi

### Hemen (5 dakika)

- [ ] Site domainde açılıyor mu, kilit simgesi var mı
- [ ] `paranotu.com/sitemap.xml` → içinde **localhost yazmamalı**, gerçek domain olmalı
- [ ] `paranotu.com/robots.txt` → içinde `Disallow: /` **olmamalı** (varsa Google siteni hiç göremez)
- [ ] Birkaç yazıya, kategoriye, hesaplayıcıya tıkla — hepsi açılıyor mu
- [ ] Telefondan aç, görünüm bozuk mu

### SEO (ilk hafta)

- [ ] [Google Search Console](https://search.google.com/search-console)'a siteyi ekle ve doğrula
- [ ] `sitemap.xml`'i Search Console'a gönder
- [ ] [Google Analytics](https://analytics.google.com) hesabı aç, `G-` ile başlayan kodu Vercel'e gir
- [ ] [PageSpeed Insights](https://pagespeed.web.dev/) ile mobil hızı ölç

### AdSense başvurusundan önce

- [ ] `site.config.js` → `ads.showPlaceholders = false` ✅ *(yapıldı)*
- [ ] Hakkında sayfası gerçek kimlik içeriyor ✅ *(yapıldı)*
- [ ] `/gizlilik` ve `/sartlar` sayfalarındaki **şablon uyarı kutularını kaldır**, metinleri kendine göre düzenle
- [ ] En az 25-30 özgün yazı yayında olsun
- [ ] Site en az 2-3 aydır yayında ve düzenli güncelleniyor olsun
- [ ] Çerez onayı kutusu ekle (KVKK gereği)

---

## Bir şeyler ters giderse

**Build başarısız oldu**
→ Büyük ihtimalle **Root Directory** ayarı `frontend` değil. Vercel → Settings → General'den düzelt.

**Sitemap'te `localhost:3000` yazıyor**
→ `NEXT_PUBLIC_SITE_URL` girilmemiş **ya da** girildikten sonra yeniden deploy edilmemiş.

**Domain açılmıyor**
→ DNS yayılması sürüyor olabilir (birkaç saate kadar normal). Vercel → Domains ekranında yeşil onay var mı bak.

**Kur kutusu görünmüyor**
→ Backend kurulmadıysa **bu normal ve beklenen davranış**. Kurulduysa: `NEXT_PUBLIC_API_URL` yanlış ya da backend'in CORS listesinde domainin yok.

**Aboneler kayboldu**
→ Kalıcı disk (volume) bağlanmamış. Yukarıdaki tabloya bak.

---

## Özet: bugün yapılacaklar

1. Domaini al (~$10-15/yıl)
2. Kodu GitHub'a yükle
3. Vercel'e bağla — **Root Directory: `frontend`**
4. Ortam değişkenlerini gir
5. Domaini bağla
6. Search Console + Analytics kur

**Toplam maliyet: sadece domain.** Backend'i erteledikçe aylık gider sıfır.
