import Link from "next/link";

import siteConfig from "~/site.config";
import Logo from "./Logo";
import MobileNav from "./MobileNav";
import SearchDialog from "./SearchDialog";
import { getSearchIndex } from "@/lib/posts";

export default function Header() {
  const { nav, features } = siteConfig;
  const searchIndex = features.search ? getSearchIndex() : [];

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-canvas/85 backdrop-blur-md supports-[backdrop-filter]:bg-canvas/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Logo />

        {/* Masaüstü navigasyon */}
        <nav
          aria-label="Ana menü"
          className="hidden flex-1 items-center gap-1 md:flex"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-subtle hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          {features.search ? <SearchDialog index={searchIndex} /> : null}
          <MobileNav items={nav} />
        </div>
      </div>
    </header>
  );
}
