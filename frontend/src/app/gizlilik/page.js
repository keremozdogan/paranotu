/**
 * GİZLİLİK POLİTİKASI — /gizlilik
 *
 * ⚠️ HUKUKİ KONTROL GEREKİYOR
 * Bu metin sitenin ŞU ANKİ gerçek davranışını anlatır; hukuki yeterlilik
 * denetiminden geçmemiştir. KVKK aydınlatma yükümlülüğü için bir hukukçuya
 * okutulması gerekir.
 *
 * ⚠️ VERİ SORUMLUSU KİMLİĞİ EKSİK
 * KVKK m.10 veri sorumlusunun kimliğini ister. Aşağıda yalnızca yayın adı ve
 * e-posta var; gerçek kişi adı veya tüzel kişilik unvanı (varsa vergi/MERSİS
 * bilgisi) eklenmelidir. Sitede kişi adı bilinçli olarak kaldırıldığı için
 * burası boş bırakıldı — bilinçli bir eksiklik, unutulmuş değil.
 *
 * ⚠️ BU SAYFA SİTEYİ TAKİP ETMEK ZORUNDA
 * Aşağıdaki "işlemiyoruz" ifadeleri site.config.js'teki kapalı özelliklere
 * dayanıyor. Bülten, yorum, ölçümleme veya reklam AÇILDIĞINDA bu sayfa aynı
 * commit'te güncellenmelidir — yoksa yanlış beyan olur.
 */

import siteConfig from "~/site.config";
import PolicyPage from "@/components/PolicyPage";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Gizlilik Politikası",
  description:
    "ParaNotu hangi verileri işler, hangilerini işlemez, çerez kullanır mı ve KVKK kapsamındaki haklarını nasıl kullanırsın.",
  path: "/gizlilik",
});

/** Metnin yürürlük tarihi. İçerik her değiştiğinde bu da güncellenmeli. */
const YURURLUK = "2026-09-05";

export default function PrivacyPage() {
  const eposta = siteConfig.social?.email;

  return (
    <PolicyPage
      title="Gizlilik Politikası"
      description="Kısaca: bu site senden veri toplamıyor. Aşağıda bunun ne anlama geldiğini ve istisnalarını açıkladık."
      path="/gizlilik"
      updatedAt={YURURLUK}
    >
      <h2>Özet</h2>
      <p>
        {siteConfig.name} bir yayın sitesidir. Üyelik yok, giriş yok, form yok.
        Siteyi gezerken <strong>bize hiçbir kişisel veri vermiyorsun</strong>.
        Bize ulaşmak istersen e-posta yazarsın; o zaman da yalnızca yazdığın
        kadarını biliriz.
      </p>

      <h2>Veri sorumlusu</h2>
      <p>
        Bu sitenin yayıncısı <strong>{siteConfig.name}</strong>
        {siteConfig.url ? (
          <>
            {" "}
            (<a href={siteConfig.url} rel="noopener noreferrer">
              {siteConfig.url.replace(/^https?:\/\//, "")}
            </a>)
          </>
        ) : null}
        .
        {eposta ? (
          <>
            {" "}
            İletişim: <a href={`mailto:${eposta}`}>{eposta}</a>
          </>
        ) : null}
      </p>

      <h2>İşlenen veriler</h2>
      <p>Şu an yalnızca iki durumda veri işleniyor:</p>
      <ul>
        <li>
          <strong>Sunucu kayıtları.</strong> Site Vercel altyapısında
          barındırılıyor. Her internet sitesinde olduğu gibi, sayfayı
          açtığında IP adresin, tarayıcı bilgin ve istediğin adres barındırma
          sağlayıcısının teknik kayıtlarına düşer. Bu kayıtlar güvenlik ve
          hata ayıklama amaçlıdır; biz bu kayıtları ayrıca saklamıyor,
          birleştirmiyor ve kimlik eşleştirmesi yapmıyoruz.
        </li>
        <li>
          <strong>Bize yazdığın e-posta.</strong> İletişim kurarsan e-posta
          adresin ve mesajın, yalnızca sana yanıt vermek için kullanılır.
          Pazarlama amacıyla kullanılmaz, üçüncü kişilerle paylaşılmaz.
        </li>
      </ul>

      <h2>İşlenmeyen veriler</h2>
      <p>
        Aşağıdakiler sitede <strong>kapalı</strong>. Açıldıkları gün bu sayfa
        aynı anda güncellenecek:
      </p>
      <ul>
        <li>Bülten aboneliği — e-posta toplanmıyor.</li>
        <li>Yorumlar — ad, e-posta veya yorum metni alınmıyor.</li>
        <li>Ziyaretçi ölçümleme (Google Analytics vb.) — kurulu değil.</li>
        <li>Reklam ağı — sitede reklam gösterilmiyor.</li>
      </ul>

      <h2>Çerezler</h2>
      <p>
        <strong>Bu site çerez kullanmıyor.</strong> Reklam çerezi, ölçümleme
        çerezi veya takip pikseli yok.
      </p>
      <p>
        Tek istisna teknik bir tercihtir: açık/koyu tema seçimin tarayıcının
        kendi hafızasında (<em>localStorage</em>) saklanır. Bu bilgi bize
        gönderilmez, sunucuya ulaşmaz ve yalnızca senin cihazında durur.
        Tarayıcı verilerini temizlersen kaybolur.
      </p>

      <h2>Yurt dışına aktarım</h2>
      <p>
        Barındırma sağlayıcısının sunucuları yurt dışında bulunabilir; siteyi
        görüntülemek teknik olarak verinin bu sunuculardan geçmesini
        gerektirir. Bunun dışında hiçbir veri yurt dışına aktarılmaz.
      </p>

      <h2>Saklama süresi</h2>
      <p>
        Bize e-posta yazarsan yazışma, konusu kapanana kadar saklanır ve
        talebin üzerine silinir. Sunucu kayıtlarının süresi barındırma
        sağlayıcısının politikasına tabidir.
      </p>

      <h2>Üçüncü taraf bağlantılar</h2>
      <p>
        İçeriklerde resmî kurumların ve haber kaynaklarının sayfalarına
        bağlantı verilir. Bu sitelerin gizlilik uygulamalarından sorumlu
        değiliz; bağlantıya tıkladığında o sitenin politikası geçerli olur.
      </p>

      <h2>KVKK kapsamındaki hakların</h2>
      <p>
        6698 sayılı Kişisel Verilerin Korunması Kanunu&apos;nun 11. maddesi
        uyarınca şunları talep edebilirsin:
      </p>
      <ul>
        <li>Kişisel verinin işlenip işlenmediğini öğrenme</li>
        <li>İşlenmişse buna ilişkin bilgi talep etme</li>
        <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
        <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
        <li>Silinmesini veya yok edilmesini isteme</li>
        <li>Düzeltme ve silme işlemlerinin üçüncü kişilere bildirilmesini isteme</li>
        <li>
          Otomatik sistemlerle analiz sonucu aleyhine bir sonuç doğmasına itiraz
          etme
        </li>
        <li>Kanuna aykırı işleme nedeniyle zarara uğrarsan zararın giderilmesini talep etme</li>
      </ul>
      <p>
        Bu haklarını kullanmak için{" "}
        {eposta ? (
          <a href={`mailto:${eposta}`}>{eposta}</a>
        ) : (
          "iletişim sayfası"
        )}{" "}
        adresine yazman yeterli. Başvurun en geç otuz gün içinde
        yanıtlanır.
      </p>

      <h2>Değişiklikler</h2>
      <p>
        Bu politika, sitede veri işleyen bir özellik açıldığında güncellenir.
        Güncel sürüm her zaman bu sayfada yayımlanır ve yukarıdaki tarih
        değiştirilir.
      </p>
    </PolicyPage>
  );
}
