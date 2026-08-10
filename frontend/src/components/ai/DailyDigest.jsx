/**
 * ============================================================================
 *  GÜNLÜK ÖZET — yapay zekâ ile günün hattı
 * ============================================================================
 *  Sunucu bileşenidir. Model çağrısı BUILD/ISR sırasında bir kez yapılır,
 *  her ziyaretçi için değil — bu yüzden maliyet ziyaretçi sayısına değil,
 *  yeniden doğrulama sıklığına bağlıdır.
 *
 *  ⚠️ Bu bileşeni kullanan sayfa `revalidate` vermeli (bkz. /haber). Vermezse
 *  her istekte model çalışır ve fatura trafikle birlikte büyür.
 *
 *  Yapay zekâ yapılandırılmamışsa veya özet üretilemezse `null` döner:
 *  boş kutu, hata mesajı veya "yakında" yazısı göstermeyiz.
 * ============================================================================
 */

import { gunlukOzet, isAiConfigured } from "@/lib/ai";
import { formatDate } from "@/lib/format";

export default async function DailyDigest({ items = [] }) {
  if (!isAiConfigured() || items.length === 0) return null;

  const sonuc = await gunlukOzet(
    items.map((h) => ({ title: h.title, summary: h.summary })),
  );
  if (!sonuc.ok) return null;

  return (
    <section
      aria-labelledby="gunluk-ozet"
      className="rounded-brand border border-accent-200 bg-accent-50/60 p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2
          id="gunluk-ozet"
          className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-accent-800"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
          Günün özeti
        </h2>
        <span className="text-xs text-muted">{formatDate(new Date().toISOString())}</span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-ink">{sonuc.text}</p>

      {/* Etiket — politika gereği zorunlu. */}
      <p className="mt-3 border-t border-accent-200 pt-2 text-xs text-muted">
        Bu paragraf, yukarıdaki haberlerin başlık ve spotlarından yapay zekâ ile
        üretildi. Haberlerin yerine geçmez; yatırım tavsiyesi değildir.
      </p>
    </section>
  );
}
