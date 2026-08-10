/**
 * ============================================================================
 *  POST /api/ai/ozet — bir haberin yapay zekâ özeti
 * ============================================================================
 *  İstemci yalnızca SLUG gönderir, metin göndermez.
 *
 *  Bu bilinçli: metni istemciden alsaydık, herkes istediği metni bize
 *  gönderip modeli kendi amacı için çalıştırabilirdi (açık uçlu ücretli
 *  uç nokta). Slug ile kendi içeriğimizi sunucuda okuyoruz; özetlenebilecek
 *  tek şey kendi yayımladığımız haberler.
 * ============================================================================
 */

import { haberOzeti, isAiConfigured } from "@/lib/ai";
import { getNewsBySlug } from "@/lib/news";

/* Özet üretimi istek anında olur — statik üretilemez. */
export const dynamic = "force-dynamic";

export async function POST(request) {
  if (!isAiConfigured()) {
    /* 503: özellik yapılandırılmamış. İstemci butonu zaten göstermiyor;
       bu ikinci kapı. */
    return Response.json(
      { ok: false, reason: "not_configured" },
      { status: 503 },
    );
  }

  let govde;
  try {
    govde = await request.json();
  } catch {
    return Response.json({ ok: false, reason: "bad_request" }, { status: 400 });
  }

  const slug = typeof govde?.slug === "string" ? govde.slug.trim() : "";
  /* Slug biçim denetimi — dosya sistemine giden bir değer, sınırlı tut. */
  if (!slug || !/^[a-z0-9-]{1,120}$/.test(slug)) {
    return Response.json({ ok: false, reason: "bad_slug" }, { status: 400 });
  }

  const haber = getNewsBySlug(slug);
  if (!haber) {
    return Response.json({ ok: false, reason: "not_found" }, { status: 404 });
  }

  const sonuc = await haberOzeti(haber);
  if (!sonuc.ok) {
    return Response.json(sonuc, { status: 502 });
  }

  return Response.json(sonuc, {
    /* Aynı haberin özeti değişmez; kenarda bir saat tutulabilir. */
    headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600" },
  });
}
