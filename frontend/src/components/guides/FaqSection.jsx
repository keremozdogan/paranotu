/**
 * SIKÇA SORULAN SORULAR — hem okur hem arama motoru için.
 *
 * Bu bileşen `faqJsonLd()` ile BİRLİKTE kullanılmalıdır: Google, şemaya
 * koyduğun soru-cevabın sayfada da görünmesini şart koşar. Biri olup
 * diğeri olmazsa yapılandırılmış veri ihlali sayılır.
 *
 * <details> kullanıldı çünkü: JavaScript olmadan çalışır, klavyeyle
 * gezilebilir, tarayıcının kendi "sayfada bul" özelliği kapalı içeriği de
 * bulur. Elle yazılmış bir akordiyon bu üçünü de bedavaya vermez.
 */
export default function FaqSection({ faq = [], title = "Sıkça sorulan sorular" }) {
  const items = faq.filter((f) => f?.q && f?.a);
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="sss" className="mt-12 border-t border-line pt-8">
      <h2 id="sss" className="mb-4 text-lg font-bold tracking-tight text-ink">
        {title}
      </h2>

      <div className="divide-y divide-line border-y border-line">
        {items.map((f) => (
          <details key={f.q} className="group py-3">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-3 text-base font-semibold text-ink marker:content-none">
              <span>{f.q}</span>
              {/* Dönen artı işareti — açık/kapalı durumu renkten bağımsız
                  olarak da belli olsun diye şekille gösteriliyor. */}
              <span
                aria-hidden="true"
                className="mt-1 shrink-0 text-muted motion-safe:transition-transform group-open:rotate-45"
              >
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                  <path d="M8 3.5v9M3.5 8h9" />
                </svg>
              </span>
            </summary>
            <p className="mt-2 pr-7 text-sm leading-relaxed text-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
