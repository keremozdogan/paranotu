import Link from "next/link";

import siteConfig from "~/site.config";
import Logo from "./Logo";
import AdBanner from "./AdBanner";
import { getCategoriesWithCounts } from "@/lib/posts";

/* Sosyal ikonlar — sadece config'de dolu olanlar render edilir. */
const SOCIAL_ICONS = {
  twitter: (
    <path d="M18.9 2H22l-6.8 7.8L23 22h-6.3l-4.9-6.4L6.2 22H3l7.3-8.3L2 2h6.4l4.4 5.8L18.9 2Zm-1.1 18h1.7L7.3 3.8H5.5L17.8 20Z" />
  ),
  instagram: (
    <path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.2.06 1.8.25 2.2.42.6.22 1 .48 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c0 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2 0-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2-.1-1.3-.1-1.7-.1-4.9s0-3.6.1-4.9c0-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2Zm0 3.2a6.6 6.6 0 1 0 0 13.2 6.6 6.6 0 0 0 0-13.2Zm0 10.9a4.3 4.3 0 1 1 0-8.6 4.3 4.3 0 0 1 0 8.6Zm8.4-11.2a1.55 1.55 0 1 1-3.1 0 1.55 1.55 0 0 1 3.1 0Z" />
  ),
  youtube: (
    <path d="M23 12s0-3.5-.4-5.1a2.7 2.7 0 0 0-1.9-1.9C19 4.5 12 4.5 12 4.5s-7 0-8.7.5a2.7 2.7 0 0 0-1.9 1.9C1 8.5 1 12 1 12s0 3.5.4 5.1c.2.9.9 1.6 1.9 1.9 1.7.5 8.7.5 8.7.5s7 0 8.7-.5a2.7 2.7 0 0 0 1.9-1.9c.4-1.6.4-5.1.4-5.1ZM9.8 15.4V8.6l5.9 3.4-5.9 3.4Z" />
  ),
  linkedin: (
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.1a4.2 4.2 0 0 1 3.8-2c4 0 4.8 2.6 4.8 6.1V21h-4v-5.5c0-1.3 0-3-1.9-3s-2.1 1.4-2.1 2.9V21h-4V9Z" />
  ),
  github: (
    <path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.7.4-1.1.6-1.4-2.2-.2-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.8-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 12 2Z" />
  ),
};

function SocialLinks() {
  const { social } = siteConfig;
  const entries = Object.entries(SOCIAL_ICONS).filter(([key]) => social[key]);

  if (!entries.length && !social.email) return null;

  return (
    <div className="flex items-center gap-1">
      {entries.map(([key, icon]) => (
        <a
          key={key}
          href={social[key]}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={key}
          className="rounded-lg p-2 text-muted transition-colors hover:bg-subtle hover:text-primary-600"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            {icon}
          </svg>
        </a>
      ))}
      {social.email ? (
        <a
          href={`mailto:${social.email}`}
          aria-label="E-posta"
          className="rounded-lg p-2 text-muted transition-colors hover:bg-subtle hover:text-primary-600"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="2" />
            <path d="m3 7 9 6 9-6" stroke="currentColor" strokeWidth="2" />
          </svg>
        </a>
      ) : null}
    </div>
  );
}

export default function Footer() {
  const categories = getCategoriesWithCounts().filter((c) => c.count > 0);
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-line bg-subtle/40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <AdBanner placement="footer" className="mt-8" />

        <div className="grid grid-cols-2 gap-8 py-12 md:grid-cols-4">
          <div className="col-span-2 md:col-span-2">
            <Logo />
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
              {siteConfig.description}
            </p>
            <div className="mt-4">
              <SocialLinks />
            </div>
          </div>

          {categories.length ? (
            <nav aria-label="Kategoriler">
              <h2 className="text-xs font-bold uppercase tracking-wider text-ink">
                Kategoriler
              </h2>
              <ul className="mt-3 space-y-0.5">
                {categories.map((cat) => (
                  <li key={cat.slug}>
                    <Link
                      href={`/kategori/${cat.slug}`}
                      /* min-h-9 + inline-flex → mobilde yeterli dokunma alanı
                         (WCAG 2.5.8). Ayrı satırdaki gezinme bağlantıları
                         satır içi metin istisnasına girmez. */
                      className="inline-flex min-h-9 items-center text-sm text-muted transition-colors hover:text-link"
                    >
                      {cat.name}
                      <span className="ml-1 text-xs text-muted/60">({cat.count})</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

          <nav aria-label="Kurumsal">
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink">
              Site
            </h2>
            <ul className="mt-3 space-y-0.5">
              {siteConfig.footerNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-9 items-center text-sm text-muted transition-colors hover:text-link"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex flex-col gap-3 border-t border-line py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.name}. Tüm hakları saklıdır.
          </p>
          {siteConfig.seo.disclaimer ? (
            <p className="max-w-md sm:text-right">{siteConfig.seo.disclaimer}</p>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
