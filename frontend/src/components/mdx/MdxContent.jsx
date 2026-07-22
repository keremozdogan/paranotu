/**
 * MDX render katmanı (Server Component).
 *
 * Yazı gövdesindeki markdown'ı React'e çevirir ve özel bileşenleri
 * MDX'in içinde kullanılabilir kılar. Yazı dosyasında doğrudan şunları
 * yazabilirsin:
 *
 *   <AdBanner placement="inArticle" />
 *   <Callout type="tip">Küçük bir ipucu…</Callout>
 *   <KeyStat value="%20" label="Aylık birikim hedefi" />
 *   <Newsletter variant="inline" />
 */

import Link from "next/link";
import Image from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

import AdBanner from "@/components/AdBanner";
import Newsletter from "@/components/Newsletter";
import Callout from "./Callout";
import KeyStat from "./KeyStat";
import Disclaimer from "./Disclaimer";
import Rakam, { RakamTablosu, SonGuncelleme } from "./Rakam";
import { Sutun, Yigin, Cizgi } from "./Grafik";
import { slugify } from "@/lib/posts";

/** React children ağacından düz metni toplar (başlık id'si için). */
function textOf(node) {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (node.props?.children) return textOf(node.props.children);
  return "";
}

/**
 * Başlık id'lerini `lib/posts.js` içindeki slugify ile üretiyoruz —
 * böylece <TableOfContents /> bağlantıları birebir tutuyor.
 * (rehype-slug Türkçe karakterleri farklı çevirdiği için kullanılmadı.)
 */
function heading(Tag) {
  return function Heading({ children, ...props }) {
    const id = props.id || slugify(textOf(children));
    return (
      <Tag id={id} {...props}>
        {children}
        <a href={`#${id}`} className="heading-anchor" aria-label="Bu bölüme bağlantı">
          #
        </a>
      </Tag>
    );
  };
}

const components = {
  h2: heading("h2"),
  h3: heading("h3"),

  /* İç bağlantılar client-side geçiş yapsın, dış bağlantılar güvenli açılsın */
  a: ({ href = "", children, ...props }) => {
    const isInternal = href.startsWith("/") || href.startsWith("#");
    if (isInternal) {
      return (
        <Link href={href} {...props}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  },

  /* Markdown görselleri otomatik optimize edilsin */
  img: ({ src, alt = "", width, height }) => (
    <Image
      src={src}
      alt={alt}
      width={Number(width) || 1200}
      height={Number(height) || 675}
      sizes="(max-width: 768px) 100vw, 720px"
      className="h-auto w-full"
    />
  ),

  /* Geniş tablolar sayfayı değil, kendi kutusunu kaydırsın */
  table: ({ children, ...props }) => (
    <div className="table-wrap">
      <table {...props}>{children}</table>
    </div>
  ),

  /* MDX içinden çağrılabilen bileşenler */
  AdBanner,
  Callout,
  KeyStat,
  Newsletter,

  /* Doğrulanmış rakamlar — content/data/figures.js'ten gelir */
  Rakam,
  RakamTablosu,
  SonGuncelleme,
  Disclaimer,

  /* Yazı içi grafikler — prop'lar string (bkz. Grafik.jsx) */
  Sutun,
  Yigin,
  Cizgi,
};

export default function MdxContent({ source }) {
  return (
    <div className="prose-site">
      <MDXRemote
        source={source}
        components={components}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [],
          },
        }}
      />
    </div>
  );
}
