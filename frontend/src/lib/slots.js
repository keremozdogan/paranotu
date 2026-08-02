/**
 * ============================================================================
 *  ANA SAYFA SLOT ÇÖZÜMLEYİCİ
 * ============================================================================
 *  Hero ve öne çıkan alanlarda ne gösterileceğine karar verir.
 *
 *  ────────────────────────────────────────────────────────────────────────
 *  ÖNCELİK SIRASI — bu sıra spec §8'in kalbi
 *  ────────────────────────────────────────────────────────────────────────
 *    1. MANUEL SABİTLENMİŞ slot (is_pinned = 1)  ← her şeyi ezer
 *    2. Zamanlanmış slot (starts_at / ends_at penceresi içindeyse)
 *    3. Otomatik seçim (önem puanına göre)
 *
 *  Otomatik puanlama, sabitlenmiş bir slotu ASLA değiştiremez. Editör bir
 *  içeriği manşete koyduysa, arka planda 95 puanlık bir haber gelse bile
 *  o manşet yerinde kalır. Editoryal kontrol otomasyonun üstündedir.
 *
 *  Süresi biten slot yayından kalkar ama D1'den SİLİNMEZ — geçmiş
 *  kararların kaydı korunur.
 *
 *  ────────────────────────────────────────────────────────────────────────
 *  D1 YOKSA?
 *  ────────────────────────────────────────────────────────────────────────
 *  Slot tablosu okunamazsa sistem tamamen otomatik moda düşer: mevcut
 *  içerikten önem sırasına göre seçer. Site çalışmaya devam eder.
 * ============================================================================
 */

import "server-only";
import { cache } from "react";

import { d1Query, isD1Configured, toBool } from "@/lib/d1";
import { getRankedNews } from "@/lib/news";
import { getFeaturedFiles, getGuideSummaries } from "@/lib/evergreen";

/** Slot kaydını hero/kart bileşenlerinin anladığı şekle çevirir. */
function toSlotItem(row) {
  return {
    slotType: row.slot_type,
    contentType: row.content_type,
    contentId: row.content_id,
    position: row.position ?? 0,
    isPinned: toBool(row.is_pinned),
    allowAutoFill: toBool(row.allow_auto_fill),
    showDesktop: toBool(row.show_desktop),
    showMobile: toBool(row.show_mobile),
    customTitle: row.custom_title ?? null,
  };
}

/**
 * Aktif slotları okur.
 * Zaman penceresi SQL'de değil burada değerlendiriliyor ki `now` test
 * edilebilir olsun ve ISR cache'i zaman kaymasına dayansın.
 */
export const getActiveSlots = cache(async (slotType, now = new Date()) => {
  if (!isD1Configured()) return [];

  const { rows } = await d1Query(
    `SELECT * FROM homepage_slots
     WHERE slot_type = ? AND status IN ('active','scheduled')
     ORDER BY is_pinned DESC, position ASC`,
    [slotType],
    { revalidate: 120, tags: ["homepage-slots"] },
  );

  const ts = now.getTime();

  return rows
    .filter((row) => {
      if (row.starts_at && new Date(row.starts_at).getTime() > ts) return false;
      if (row.ends_at && new Date(row.ends_at).getTime() < ts) return false;
      return true;
    })
    .map(toSlotItem);
});

/* -------------------------------------------------------------------------- */
/*  İçerik çözümleme                                                          */
/* -------------------------------------------------------------------------- */

/** Slot kaydındaki `content_id`'yi gerçek içeriğe bağlar. */
function resolveSlotContent(slot, { news, guides }) {
  if (slot.contentType === "evergreen" || slot.contentType === "guide") {
    const guide = guides.find((g) => g.id === slot.contentId || g.href === slot.contentId);
    if (!guide) return null;
    return {
      href: guide.href,
      title: slot.customTitle ?? guide.title,
      summary: guide.summary,
      sectionLabel: guide.hub.name,
      /* Kategori grafiği bu slug'a göre seçilir. */
      category: guide.hub.slug,
      image: guide.image,
      publishedAt: guide.updatedAt ?? guide.publishedAt,
      readingTime: guide.readingTime,
      badge: null,
    };
  }

  if (slot.contentType === "editorial") {
    const item = news.find((n) => n.slug === slot.contentId);
    if (!item?.section) return null;
    return {
      href: `/haber/${item.section.slug}/${item.slug}`,
      title: slot.customTitle ?? item.title,
      summary: item.summary,
      sectionLabel: item.section.shortName ?? item.section.name,
      category: item.section.slug,
      image: item.image ? { ...item.image, src: item.image.src } : null,
      publishedAt: item.publishedAt,
      readingTime: item.readingTime,
      badge: item.isBreaking ? "Son Dakika" : null,
    };
  }

  return null;
}

/** Haber özetini hero öğesine çevirir (otomatik doldurma için). */
function newsToHeroItem(item) {
  if (!item?.section) return null;
  return {
    href: `/haber/${item.section.slug}/${item.slug}`,
    title: item.title,
    summary: item.summary,
    sectionLabel: item.section.shortName ?? item.section.name,
    category: item.section.slug,
    image: item.image,
    publishedAt: item.publishedAt,
    readingTime: item.readingTime,
    badge: item.isBreaking ? "Son Dakika" : null,
  };
}

/** Rehberi hero öğesine çevirir. */
function guideToHeroItem(guide) {
  return {
    href: guide.href,
    title: guide.title,
    summary: guide.summary,
    sectionLabel: guide.hub.name,
    category: guide.hub.slug,
    image: guide.image,
    publishedAt: guide.updatedAt ?? guide.publishedAt,
    readingTime: guide.readingTime,
    badge: null,
  };
}

/**
 * Hero içeriğini çözer.
 *
 * Güncel haber ve kalıcı rehber BİRLİKTE gösterilebilir (spec §5) —
 * haber yoksa hero boş kalmaz, dosyalarla dolar.
 *
 * @returns {Promise<{primary: object[], secondary: object[]}>}
 */
export const resolveHero = cache(async () => {
  const news = getRankedNews(8);
  const guides = getGuideSummaries();

  const [primarySlots, secondarySlots] = await Promise.all([
    getActiveSlots("primary_hero"),
    getActiveSlots("secondary_hero"),
  ]);

  const context = { news, guides };

  /* 1-2. Sabitlenmiş ve zamanlanmış slotlar önce. */
  const pinnedPrimary = primarySlots
    .map((slot) => resolveSlotContent(slot, context))
    .filter(Boolean);

  const pinnedSecondary = secondarySlots
    .map((slot) => resolveSlotContent(slot, context))
    .filter(Boolean);

  /* 3. Otomatik doldurma — yalnızca sabitlenmiş içerik yetmiyorsa.
        Sabitlenmiş olanlar HER ZAMAN başta kalır. */
  const usedHrefs = new Set([...pinnedPrimary, ...pinnedSecondary].map((i) => i.href));

  const autoNews = news
    .map(newsToHeroItem)
    .filter((i) => i && !usedHrefs.has(i.href));

  /**
   * Haber yoksa öne çıkan dosyalar hero'yu doldurur.
   *
   * ⚠️ Havuz, hero'nun İHTİYACINDAN BÜYÜK olmalı: 3 ana + 4 destekleyici
   * = 7. Daha küçük bir limit (örn. 4) verilirse ana slaytlar havuzu
   * tüketir ve sağ sütun neredeyse boş kalır — masaüstünde hero'nun
   * yanında koca bir boşluk oluşur.
   */
  const autoGuides = getFeaturedFiles(8)
    .map(guideToHeroItem)
    .filter((i) => !usedHrefs.has(i.href));

  const autoPool = [...autoNews, ...autoGuides];

  const primary = [...pinnedPrimary, ...autoPool].slice(0, 3);
  const primaryHrefs = new Set(primary.map((i) => i.href));

  const secondary = [
    ...pinnedSecondary,
    ...autoPool.filter((i) => !primaryHrefs.has(i.href)),
  ].slice(0, 4);

  return { primary, secondary };
});
