import Image from "next/image";
import Link from "next/link";
import siteConfig from "~/site.config";

/**
 * Logo — site.config.js `logo` ayarına göre yazı ya da görsel render eder.
 * type: "text"  → dosya gerekmez, marka rengiyle vurgulu yazı
 * type: "image" → /public içindeki dosyayı kullanır
 */
export default function Logo({ className = "" }) {
  const { logo, name } = siteConfig;

  return (
    <Link
      href="/"
      aria-label={`${name} — ana sayfa`}
      className={`inline-flex items-center gap-2 ${className}`}
    >
      {logo.type === "image" ? (
        <Image
          src={logo.src}
          alt={name}
          width={logo.width}
          height={logo.height}
          priority
          className="h-8 w-auto"
        />
      ) : (
        <span className="text-lg font-extrabold tracking-tight text-ink">
          {logo.text}
          <span className="text-primary-600">{logo.accentText}</span>
        </span>
      )}
    </Link>
  );
}
