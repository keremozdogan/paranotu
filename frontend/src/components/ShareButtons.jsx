"use client";

import { useState } from "react";
import siteConfig from "~/site.config";

/**
 * Paylaşım bağlantıları. Üçüncü parti script yüklemez — sadece
 * paylaşım URL'leri; sayfa hızını etkilemez.
 */
export default function ShareButtons({ title, path }) {
  const [copied, setCopied] = useState(false);
  const url = `${siteConfig.url.replace(/\/$/, "")}${path}`;
  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const targets = [
    { name: "X", href: `https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}` },
    { name: "WhatsApp", href: `https://wa.me/?text=${encodedTitle}%20${encoded}` },
    { name: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}` },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* pano izni yoksa sessizce geç */
    }
  }

  return (
    <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-line pt-6">
      <span className="mr-1 text-sm font-medium text-muted">Paylaş:</span>
      {targets.map((t) => (
        <a
          key={t.name}
          href={t.href}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-primary-300 hover:text-primary-700"
        >
          {t.name}
        </a>
      ))}
      <button
        type="button"
        onClick={copyLink}
        className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-primary-300 hover:text-primary-700"
      >
        {copied ? "Kopyalandı ✓" : "Bağlantıyı kopyala"}
      </button>
    </div>
  );
}
