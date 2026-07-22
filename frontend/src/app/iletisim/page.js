import siteConfig from "~/site.config";
import ContactForm from "@/components/ContactForm";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "İletişim",
  description: `${siteConfig.name} ile iletişime geç.`,
  path: "/iletisim",
});

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        İletişim
      </h1>
      <p className="mt-3 text-base leading-relaxed text-muted">
        Soru, öneri veya iş birliği teklifin varsa formu doldur; genelde birkaç
        gün içinde dönüyoruz.
        {siteConfig.social.email ? (
          <>
            {" "}
            Dilersen doğrudan{" "}
            <a
              href={`mailto:${siteConfig.social.email}`}
              className="text-primary-600 underline underline-offset-2 hover:text-primary-700"
            >
              {siteConfig.social.email}
            </a>{" "}
            adresine de yazabilirsin.
          </>
        ) : null}
      </p>

      <div className="mt-8">
        <ContactForm />
      </div>
    </div>
  );
}
