/**
 * ============================================================================
 *  <SmartImage /> — görsel çizimi için TEK giriş noktası
 * ============================================================================
 *  Karar akışı:
 *
 *    1. Lisansı DOĞRULANMIŞ gerçek görsel var mı?  → <Image /> ile çiz
 *    2. Yoksa                                       → <CategoryArt /> çiz
 *
 *  ────────────────────────────────────────────────────────────────────────
 *  LİSANS KAPISI
 *  ────────────────────────────────────────────────────────────────────────
 *  Bir görselin çizilebilmesi için `rightsStatus === "cleared"` olması
 *  ZORUNLU. Kredi veya lisans bilgisi eksikse `resolveImage()` (news.js /
 *  evergreen.js) zaten görseli düşürüyor; burada ikinci bir kapı daha var.
 *  İki katman da aynı yönde çalışıyor çünkü lisansı belirsiz bir görselin
 *  yayına çıkması geri alınması en zor hatalardan biri.
 *
 *  ────────────────────────────────────────────────────────────────────────
 *  CLS
 *  ────────────────────────────────────────────────────────────────────────
 *  Kapsayıcı SABİT en-boy oranına sahiptir ve `fill` kullanılır. Görsel
 *  ister yüklensin ister fallback çizilsin, yükseklik önceden bellidir —
 *  hiçbir durumda içerik zıplamaz.
 * ============================================================================
 */

import Image from "next/image";

import CategoryArt from "./CategoryArt";

/** Kart/hero oranları — sınıf adı olarak sabit tutulur ki Tailwind görebilsin. */
const RATIOS = {
  "16/9": "aspect-[16/9]",
  "4/3": "aspect-[4/3]",
  "3/2": "aspect-[3/2]",
  "1/1": "aspect-square",
  wide: "aspect-[21/9]",
};

export default function SmartImage({
  image,
  category,
  /** İçeriğin slug'ı — aynı kategorideki kartlar birbirinin kopyası olmasın. */
  seed,
  alt,
  ratio = "16/9",
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  priority = false,
  showLabel = false,
  zoom = false,
  className = "",
  /* Hero'daki Ken Burns için — yalnızca gerçek görselde anlamlı. */
  imageClassName = "",
}) {
  const ratioClass = RATIOS[ratio] ?? RATIOS["16/9"];
  const usable = image?.src && image.rightsStatus === "cleared";

  return (
    <div
      className={`relative overflow-hidden bg-subtle ${ratioClass} ${
        zoom ? "media-zoom" : ""
      } ${className}`}
    >
      {usable ? (
        <Image
          src={image.src}
          /* Alt metin: görseli AÇIKLAR, anahtar kelime doldurmaz.
             Boş string dekoratif demektir — bilinçli bırakılabilir. */
          alt={alt ?? image.alt ?? ""}
          fill
          priority={priority}
          loading={priority ? undefined : "lazy"}
          sizes={sizes}
          className={imageClassName}
          style={{ objectFit: "cover", objectPosition: image.focalPoint ?? "50% 50%" }}
        />
      ) : (
        <CategoryArt category={category} seed={seed} showLabel={showLabel} />
      )}
    </div>
  );
}

/**
 * Görsel künyesi — kredi, kaynak ve lisans. Gerçek fotoğrafın ALTINDA
 * görünür; kategori grafiğinde gösterilmez (çünkü künyesi yok, bizim).
 */
export function ImageCredit({ image, className = "" }) {
  if (!image?.src || image.rightsStatus !== "cleared") return null;
  if (!image.credit) return null;

  return (
    <figcaption className={`mt-2 text-xs leading-relaxed text-muted ${className}`}>
      {image.caption ? <span>{image.caption} </span> : null}
      <span className="text-muted/80">
        Fotoğraf:{" "}
        {image.sourceUrl ? (
          <a
            href={image.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            {image.credit}
          </a>
        ) : (
          image.credit
        )}
        {image.licenseName ? (
          <>
            {" · "}
            {image.licenseUrl ? (
              <a
                href={image.licenseUrl}
                target="_blank"
                rel="noopener noreferrer license"
                className="underline underline-offset-2"
              >
                {image.licenseName}
              </a>
            ) : (
              image.licenseName
            )}
          </>
        ) : null}
      </span>
    </figcaption>
  );
}
