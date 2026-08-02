/**
 * KÜNYE — /kunye
 *
 * ⚠️ EDİTÖR KONTROLÜ GEREKİYOR
 * Bu sayfadaki tüzel kişilik, adres ve sorumlu kişi bilgileri sitenin
 * GERÇEK durumunu yansıtmalıdır. Aşağıdaki metin mevcut `site.config.js`
 * verilerinden üretildi; yayına almadan önce eksik alanları doldur.
 */

import Link from "next/link";

import siteConfig from "~/site.config";
import PolicyPage from "@/components/PolicyPage";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Künye",
  description:
    "ParaNotu'nun yayın künyesi: sorumlu kişiler, iletişim bilgileri ve yayın ilkelerine erişim.",
  path: "/kunye",
});

export default function ImprintPage() {
  const authors = Object.entries(siteConfig.authors ?? {});

  return (
    <PolicyPage
      title="Künye"
      description="ParaNotu'nu kimin yayımladığı, kime ulaşabileceğin ve hangi ilkelerle çalıştığımız."
      path="/kunye"
    >
      <h2>Yayın</h2>
      <p>
        <strong>{siteConfig.name}</strong> — {siteConfig.tagline}
      </p>
      <p>{siteConfig.description}</p>
      <p>
        Yayın adresi:{" "}
        <a href={siteConfig.url} rel="noopener noreferrer">
          {siteConfig.url.replace(/^https?:\/\//, "")}
        </a>
      </p>

      <h2>Sorumlu kişiler</h2>
      {authors.length > 0 ? (
        <ul>
          {authors.map(([id, author]) => (
            <li key={id}>
              <strong>{author.name}</strong>
              {author.title ? ` — ${author.title}` : ""}
              {author.bio ? <>. {author.bio}</> : null}{" "}
              <Link href={`/yazarlar/${id}`}>Profil</Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>Yazar bilgisi henüz tanımlanmadı.</p>
      )}

      <h2>İletişim</h2>
      <p>
        Haber ihbarı, düzeltme talebi ve genel sorular için:{" "}
        {siteConfig.social?.email ? (
          <a href={`mailto:${siteConfig.social.email}`}>{siteConfig.social.email}</a>
        ) : (
          <Link href="/iletisim">iletişim formu</Link>
        )}
        .
      </p>
      <p>
        Bir hata gördüysen lütfen bildir — düzeltme sürecimiz{" "}
        <Link href="/duzeltme-politikasi">Düzeltme Politikası</Link> sayfasında anlatılıyor.
      </p>

      <h2>Yayın ilkeleri</h2>
      <ul>
        <li>
          <Link href="/editoryal-ilkeler">Editoryal İlkeler ve Kaynak Kullanımı</Link>
        </li>
        <li>
          <Link href="/duzeltme-politikasi">Düzeltme Politikası</Link>
        </li>
        <li>
          <Link href="/yapay-zeka-politikasi">Yapay Zekâ Kullanım Politikası</Link>
        </li>
        <li>
          <Link href="/gizlilik">Gizlilik Politikası</Link>
        </li>
        <li>
          <Link href="/sartlar">Kullanım Şartları</Link>
        </li>
      </ul>

      <h2>Yasal uyarı</h2>
      <p>{siteConfig.seo.disclaimer}</p>
    </PolicyPage>
  );
}
