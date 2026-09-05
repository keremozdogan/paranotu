import siteConfig from "~/site.config";
import ContactForm from "@/components/ContactForm";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "İletişim",
  description: `${siteConfig.name} ile iletişime geç.`,
  path: "/iletisim",
});

export default function ContactPage() {
  /* Form .NET API'ye POST ediyor. Backend yayında değilken gönderim
     "Mesaj gönderilemedi" ile bitiyordu — çalışmayan bir form, hiç form
     olmamasından kötüdür: kullanıcı mesajını yazıp kaybediyor. Bayrak
     açılana kadar sayfa yalnızca e-posta adresini gösteriyor. */
  const formAcik = siteConfig.features.contactForm;
  const eposta = siteConfig.social?.email;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        İletişim
      </h1>

      {formAcik ? (
        <>
          <p className="mt-3 text-base leading-relaxed text-muted">
            Soru, öneri veya iş birliği teklifin varsa formu doldur; genelde
            birkaç gün içinde dönüyoruz.
            {eposta ? (
              <>
                {" "}
                Dilersen doğrudan{" "}
                <a
                  href={`mailto:${eposta}`}
                  className="text-primary-600 underline underline-offset-2 hover:text-primary-700"
                >
                  {eposta}
                </a>{" "}
                adresine de yazabilirsin.
              </>
            ) : null}
          </p>

          <div className="mt-8">
            <ContactForm />
          </div>
        </>
      ) : (
        <>
          <p className="mt-3 text-base leading-relaxed text-muted">
            Soru, öneri, düzeltme talebi veya iş birliği teklifin varsa
            e-postayla yaz; genelde birkaç gün içinde dönüyoruz.
          </p>

          {eposta ? (
            <div className="mt-8 rounded-brand border border-line bg-subtle p-6">
              <p className="text-sm text-muted">E-posta</p>
              <a
                href={`mailto:${eposta}`}
                className="mt-1 inline-block text-lg font-semibold text-primary-600 underline underline-offset-4 hover:text-primary-700"
              >
                {eposta}
              </a>
            </div>
          ) : null}

          <p className="mt-6 text-sm leading-relaxed text-muted">
            Bir içerikte hata gördüysen, hangi yazıda olduğunu ve doğrusunun ne
            olması gerektiğini yazman düzeltmeyi hızlandırır.
          </p>
        </>
      )}
    </div>
  );
}
