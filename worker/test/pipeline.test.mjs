/**
 * ============================================================================
 *  İŞLEME HATTI TESTLERİ
 * ============================================================================
 *  Çalıştır:  node --test test/
 *
 *  Bu testler kümeleme eşiğini ve normalizasyonu KİLİTLER. Eşiği veya
 *  eşanlamlı sözlüğünü değiştirirsen burası kırmızıya döner — değişikliğin
 *  bilinçli olduğunu görmek için.
 *
 *  Neden önemli: kümeleme sessizce bozulursa aynı olay için birden fazla
 *  ParaNotu sayfası açılır ya da farklı olaylar birleşip biri gömülür.
 *  İkisi de gözle fark edilmesi zor, etkisi büyük hatalardır.
 * ============================================================================
 */

import test from "node:test";
import assert from "node:assert/strict";

import {
  CLUSTER_THRESHOLD,
  clusterScore,
  computeImportance,
  detectSection,
  extractEntities,
  extractSymbols,
  normalizeText,
  shouldQueueForEditorial,
  titleFingerprint,
} from "../src/pipeline.js";

const item = (title) => ({
  fingerprint: titleFingerprint(title),
  entities: extractEntities(title),
  symbols: extractSymbols(title),
});

const score = (a, b) => clusterScore(item(a), item(b));

/* -------------------------------------------------------------------------- */

test("normalizeText: ASCII büyük I harfini kaybetmez", () => {
  /* Türkçe locale'de "I".toLocaleLowerCase("tr") === "ı" olur ve [a-z]
     filtresinde silinirdi. "BIST" → "b st" hatası buradan geliyordu. */
  assert.equal(normalizeText("BIST 100"), "bist 100");
  assert.equal(normalizeText("IMF raporu"), "imf raporu");
  assert.equal(normalizeText("İstanbul"), "istanbul");
  assert.equal(normalizeText("TÜİK"), "tuik");
});

test("normalizeText: Türkçe harfleri ASCII'ye indirger", () => {
  assert.equal(normalizeText("Bütçe Açığı"), "butce acigi");
  assert.equal(normalizeText("ÇĞÖŞÜ"), "cgosu");
});

/* -------------------------------------------------------------------------- */

test("kümeleme: eşanlamlı kurum adlarını aynı olay sayar", () => {
  const s = score("TCMB politika faizini sabit tuttu", "Merkez Bankası faizi değiştirmedi");
  assert.ok(s >= CLUSTER_THRESHOLD, `beklenen >= ${CLUSTER_THRESHOLD}, gelen ${s.toFixed(2)}`);
});

test("kümeleme: aynı olayın kısa ve uzun başlığını eşleştirir", () => {
  const s = score("Temmuz enflasyonu açıklandı", "TÜİK temmuz ayı enflasyon verisini açıkladı");
  assert.ok(s >= CLUSTER_THRESHOLD, `beklenen >= ${CLUSTER_THRESHOLD}, gelen ${s.toFixed(2)}`);
});

test("kümeleme: farklı kurumların aynı tip kararını AYIRIR", () => {
  /* Fed kararı ile TCMB kararı ayrı olaylardır — birleşirlerse biri gömülür. */
  const s = score("Fed faiz kararını açıkladı", "TCMB faiz kararını açıkladı");
  assert.ok(s < CLUSTER_THRESHOLD, `beklenen < ${CLUSTER_THRESHOLD}, gelen ${s.toFixed(2)}`);
});

test("kümeleme: alakasız haberleri ayırır", () => {
  assert.ok(score("TCMB politika faizini sabit tuttu", "Gram altın rekor kırdı") < CLUSTER_THRESHOLD);
  assert.ok(score("Asgari ücrete ara zam tartışması", "Dolar kuru yükseldi") < CLUSTER_THRESHOLD);
  assert.ok(score("Gram altın rekor kırdı", "Dolar kuru geriledi") < CLUSTER_THRESHOLD);
});

test("kümeleme: eksik sinyal karşıt kanıt sayılmaz", () => {
  /* Bir başlıkta kurum adı var, diğerinde yok. Bu, "farklı olay" demek
     değildir; sinyal karşılaştırılamaz demektir. Ağırlık sözlüksel
     benzerliğe devredilmeli, skor cezalandırılmamalı. */
  const withEntity = score("TÜİK enflasyon verisini açıkladı", "Enflasyon verisi açıklandı");
  const bothPlain = score("Enflasyon verisi açıklandı", "Enflasyon verisi açıklandı");
  assert.ok(withEntity > 0.4, `eksik sinyal skoru fazla düşürüyor: ${withEntity.toFixed(2)}`);
  assert.equal(bothPlain, 1, "birebir aynı başlık tam puan almalı");
});

/* -------------------------------------------------------------------------- */

test("bölüm tespiti: geçerken anılan kelime bölümü belirlemez", () => {
  /* Haberin konusu para politikası; "dolar" ve "altın" yan unsurlar. */
  assert.equal(
    detectSection("TCMB politika faizini sabit tuttu, dolar ve gram altın hareketlendi"),
    "turkiye",
  );
});

test("bölüm tespiti: gerçek piyasa haberlerini doğru sınıflar", () => {
  assert.equal(detectSection("BIST 100 endeksi günü yükselişle kapattı"), "borsa");
  assert.equal(detectSection("Gram altın rekor tazeledi"), "altin");
  assert.equal(detectSection("Dolar kuru serbest piyasada yükseldi"), "doviz");
  assert.equal(detectSection("Fed faiz kararını açıkladı"), "dunya");
});

test("bölüm tespiti: sinyal yoksa kaynağın varsayılanına düşer", () => {
  assert.equal(detectSection("Şirketten yeni yatırım açıklaması", "borsa"), "borsa");
});

/* -------------------------------------------------------------------------- */

test("varlık ve sembol çıkarımı", () => {
  const t = "TCMB kararı sonrası dolar ve gram altın hareketlendi";
  assert.deepEqual(extractEntities(t), ["TCMB"]);
  assert.ok(extractSymbols(t).includes("USDTRY"));
  assert.ok(extractSymbols(t).includes("XAUTRY_G"));
});

/* -------------------------------------------------------------------------- */

test("önem puanı: resmî kaynak ikincil kaynaktan yüksek", () => {
  const now = Date.parse("2026-08-03T12:00:00Z");
  const official = computeImportance(
    { sourceTrust: 100, entities: ["TCMB"], symbols: ["USDTRY"], publishedAt: "2026-08-03T11:00:00Z", sourceCount: 1 },
    now,
  );
  const secondary = computeImportance(
    { sourceTrust: 40, entities: [], symbols: [], publishedAt: "2026-08-03T11:00:00Z", sourceCount: 1 },
    now,
  );
  assert.ok(official > secondary, `resmî ${official} <= ikincil ${secondary}`);
  assert.ok(official <= 100 && secondary >= 0);
});

test("önem puanı: tazelik zamanla sönümlenir", () => {
  const now = Date.parse("2026-08-03T12:00:00Z");
  const base = { sourceTrust: 80, entities: ["TCMB"], symbols: [], sourceCount: 1 };
  const fresh = computeImportance({ ...base, publishedAt: "2026-08-03T11:00:00Z" }, now);
  const old = computeImportance({ ...base, publishedAt: "2026-08-01T11:00:00Z" }, now);
  assert.ok(fresh > old, `taze ${fresh} <= eski ${old}`);
});

/* -------------------------------------------------------------------------- */

test("editoryal kuyruk: yalnızca güçlü sinyalleri geçirir", () => {
  /* Resmî, yüksek puanlı tek kaynak → kuyruğa girer. */
  assert.equal(shouldQueueForEditorial({ status: "open", max_importance: 75, source_count: 1 }), true);
  /* Orta puanlı ama iki kaynak doğrulamış → kuyruğa girer. */
  assert.equal(shouldQueueForEditorial({ status: "open", max_importance: 58, source_count: 2 }), true);
  /* Düşük puanlı tek kaynak → girmez, editörü boğmasın. */
  assert.equal(shouldQueueForEditorial({ status: "open", max_importance: 40, source_count: 1 }), false);
  /* Zaten işlenmiş küme tekrar kuyruğa girmez. */
  assert.equal(shouldQueueForEditorial({ status: "promoted", max_importance: 90, source_count: 3 }), false);
});
