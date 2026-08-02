-- ============================================================================
--  ParaNotu — D1 başlangıç şeması
-- ============================================================================
--  Uygulama:  npx wrangler d1 migrations apply paranotu --remote
--
--  TASARIM İLKESİ — ÜÇ KATMAN KESİN OLARAK AYRIDIR
--  ---------------------------------------------------------------------------
--   A. external_feed_items  → ham gelişme. ASLA indexlenmez, sitemap'e girmez,
--                             tam metni saklanmaz. Yalnızca keşif amaçlıdır.
--   B. editorial_articles   → ParaNotu'nun özgün haberi. Tüm editoryal kapılar
--                             geçilirse indexlenebilir.
--   C. evergreen_guides     → kalıcı rehber. Sabit URL, gerçek değişiklikte
--                             güncellenen dateModified.
--
--  A'dan B'ye geçiş OTOMATİK DEĞİLDİR. Bir feed kaydı editoryal habere ancak
--  bir insan onayıyla dönüşür (editorial_queue). Şema bunu zorlar:
--  editorial_articles.approved_by NULL ise is_indexable 1 olamaz (CHECK).
-- ============================================================================


-- ---------------------------------------------------------------------------
--  A. HAM GELİŞMELER
-- ---------------------------------------------------------------------------
--  ⚠️ Bu tabloda `content_excerpt` alanı VARDIR ama `content_full` YOKTUR.
--  Başka bir yayının tam metnini saklamak telif ihlalidir; keşif için özet
--  ve başlık yeterlidir.
CREATE TABLE IF NOT EXISTS external_feed_items (
  id                TEXT PRIMARY KEY,          -- ulid/uuid
  source_id         TEXT NOT NULL,             -- sources kaydının kimliği
  source_name       TEXT NOT NULL,             -- görünen ad ("TCMB")
  external_id       TEXT,                      -- kaynağın kendi kimliği (guid)
  canonical_url     TEXT NOT NULL,             -- ORİJİNAL kaynağa giden adres
  title             TEXT NOT NULL,
  content_excerpt   TEXT,                      -- kısa özet (tam metin DEĞİL)
  language          TEXT DEFAULT 'tr',
  published_at      TEXT,                      -- ISO8601 UTC
  fetched_at        TEXT NOT NULL,

  -- Kümeleme ve tekrar tespiti
  cluster_id        TEXT REFERENCES event_clusters(id) ON DELETE SET NULL,
  content_hash      TEXT NOT NULL,             -- normalize edilmiş içerik hash'i
  title_fingerprint TEXT NOT NULL,             -- başlık benzerliği için

  -- Sınıflandırma (otomatik — editör değiştirebilir)
  section           TEXT,                      -- turkiye | dunya | doviz | ...
  entities          TEXT,                      -- JSON: kişi/kurum/şirket/ülke
  symbols           TEXT,                      -- JSON: ["USDTRY","XU100"]
  importance_score  INTEGER DEFAULT 0,         -- 0-100, otomatik
  source_trust      INTEGER DEFAULT 0,         -- 0-100, kaynak güvenilirliği

  -- Kullanım hakkı
  redistribution    TEXT NOT NULL DEFAULT 'link_only'
                    CHECK (redistribution IN ('link_only','excerpt','full')),

  -- Durum
  status            TEXT NOT NULL DEFAULT 'new'
                    CHECK (status IN ('new','clustered','queued','promoted','rejected','expired')),

  -- ⚠️ DEĞİŞTİRİLEMEZ: ham feed HER ZAMAN noindex.
  -- Sütun bilinçli olarak sabit; yanlışlıkla açılmasını şema engelliyor.
  is_indexable      INTEGER NOT NULL DEFAULT 0 CHECK (is_indexable = 0),

  created_at        TEXT NOT NULL DEFAULT (datetime('now')),

  UNIQUE (source_id, external_id)
);

CREATE INDEX IF NOT EXISTS idx_feed_published   ON external_feed_items (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_feed_cluster     ON external_feed_items (cluster_id);
CREATE INDEX IF NOT EXISTS idx_feed_hash        ON external_feed_items (content_hash);
CREATE INDEX IF NOT EXISTS idx_feed_fingerprint ON external_feed_items (title_fingerprint);
CREATE INDEX IF NOT EXISTS idx_feed_status      ON external_feed_items (status, importance_score DESC);


-- ---------------------------------------------------------------------------
--  OLAY KÜMELERİ
-- ---------------------------------------------------------------------------
--  Aynı olayı anlatan farklı kaynaklar TEK küme altında toplanır.
--  Bir olay habere dönüştüğünde TEK canonical ParaNotu URL'si üretilir.
CREATE TABLE IF NOT EXISTS event_clusters (
  id                  TEXT PRIMARY KEY,
  representative_title TEXT NOT NULL,          -- kümedeki en güvenilir başlık
  section             TEXT,
  entities            TEXT,                    -- JSON, birleştirilmiş
  symbols             TEXT,                    -- JSON, birleştirilmiş
  first_seen_at       TEXT NOT NULL,
  last_seen_at        TEXT NOT NULL,
  item_count          INTEGER NOT NULL DEFAULT 1,
  source_count        INTEGER NOT NULL DEFAULT 1,  -- kaç FARKLI kaynak doğruladı
  max_importance      INTEGER NOT NULL DEFAULT 0,

  -- Bu küme bir ParaNotu haberine dönüştü mü? (tek kanonik sayfa)
  editorial_article_id TEXT REFERENCES editorial_articles(id) ON DELETE SET NULL,

  status              TEXT NOT NULL DEFAULT 'open'
                      CHECK (status IN ('open','queued','promoted','ignored')),
  created_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_cluster_last_seen ON event_clusters (last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_cluster_status    ON event_clusters (status, max_importance DESC);


-- ---------------------------------------------------------------------------
--  B. EDİTORYAL HABERLER
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS editorial_articles (
  id                 TEXT PRIMARY KEY,
  slug               TEXT NOT NULL UNIQUE,
  section            TEXT NOT NULL,
  cluster_id         TEXT REFERENCES event_clusters(id) ON DELETE SET NULL,

  -- Özgün ParaNotu içeriği (kaynaktan kopyalanmaz)
  title              TEXT NOT NULL,
  short_title        TEXT,
  summary            TEXT NOT NULL,
  body               TEXT NOT NULL,            -- MDX

  -- Zorunlu özgün değer bölümleri (spec §1-B)
  why_it_matters     TEXT,                     -- "Bu gelişme neden önemli?"
  turkey_impact      TEXT,                     -- Türkiye ekonomisine etkisi
  citizen_impact     TEXT,                     -- Vatandaşa etkisi
  market_impact      TEXT,                     -- altın/döviz/faiz/borsa etkisi
  comparison         TEXT,                     -- önceki verilerle karşılaştırma

  -- Künye
  author_id          TEXT NOT NULL,
  editor_id          TEXT,
  approved_by        TEXT,                     -- onaylayan editör
  approved_at        TEXT,

  -- Tarihler
  published_at       TEXT,
  updated_at         TEXT,                     -- GERÇEK değişiklikte güncellenir

  -- SEO
  seo_title          TEXT,
  seo_description    TEXT,
  canonical_url      TEXT,                     -- self-referencing
  keywords           TEXT,                     -- JSON

  -- Editoryal bayraklar
  is_breaking        INTEGER NOT NULL DEFAULT 0,
  is_live            INTEGER NOT NULL DEFAULT 0,
  live_status        TEXT CHECK (live_status IN ('ongoing','paused','ended') OR live_status IS NULL),
  importance_score   INTEGER NOT NULL DEFAULT 0,
  editorial_priority INTEGER,                  -- doluysa otomatik puanı ezer

  -- Kalite kapıları (indexability için hepsi 1 olmalı)
  has_verified_source   INTEGER NOT NULL DEFAULT 0,
  has_original_value    INTEGER NOT NULL DEFAULT 0,
  passed_duplicate_check INTEGER NOT NULL DEFAULT 0,
  media_rights_cleared  INTEGER NOT NULL DEFAULT 1,  -- görsel yoksa sorun yok
  word_count            INTEGER NOT NULL DEFAULT 0,

  status             TEXT NOT NULL DEFAULT 'draft'
                     CHECK (status IN ('draft','review','published','retracted')),

  -- ⚠️ İNDEKSLENEBİLİRLİK KAPISI — veritabanı seviyesinde zorlanır.
  -- Uygulama katmanı unutsa bile onaysız/yetersiz içerik indexlenemez.
  is_indexable       INTEGER NOT NULL DEFAULT 0,

  created_at         TEXT NOT NULL DEFAULT (datetime('now')),

  -- ⚠️ SQLite kuralı: tablo seviyesi kısıtlar TÜM sütun tanımlarından
  -- SONRA gelmek zorundadır. Bu CHECK'i sütunların arasına koyarsan
  -- migration "syntax error" ile çöker.
  CHECK (
    is_indexable = 0 OR (
      status = 'published'
      AND approved_by IS NOT NULL
      AND has_verified_source = 1
      AND has_original_value = 1
      AND passed_duplicate_check = 1
      AND media_rights_cleared = 1
      AND word_count >= 300
      AND published_at IS NOT NULL
    )
  )
);

CREATE INDEX IF NOT EXISTS idx_editorial_published ON editorial_articles (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_editorial_section   ON editorial_articles (section, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_editorial_index     ON editorial_articles (is_indexable, published_at DESC);


-- ---------------------------------------------------------------------------
--  C. KALICI REHBERLER (EVERGREEN)
-- ---------------------------------------------------------------------------
--  ⚠️ `updated_at` YALNIZCA içerikte anlamlı değişiklik olduğunda değişir.
--  `last_checked_at` ise her kontrolde güncellenir — ikisi FARKLI şeydir.
--  Sahte güncellik üretmemek için bu ayrım şart.
CREATE TABLE IF NOT EXISTS evergreen_guides (
  id                 TEXT PRIMARY KEY,
  hub                TEXT NOT NULL,            -- asgari-ucret | faiz | enflasyon ...
  slug               TEXT NOT NULL,            -- ara-zam-olacak-mi
  title              TEXT NOT NULL,
  summary            TEXT NOT NULL,
  body               TEXT NOT NULL,

  published_at       TEXT NOT NULL,            -- İLK yayın — ASLA değişmez
  updated_at         TEXT NOT NULL,            -- gerçek içerik değişimi
  last_checked_at    TEXT,                     -- sadece kontrol edildi
  update_reason      TEXT,                     -- neden güncellendi (görünür)
  next_review_at     TEXT,                     -- sonraki kontrol tarihi

  author_id          TEXT NOT NULL,
  editor_id          TEXT,

  update_trigger     TEXT,                     -- tuik_tufe | tcmb_ppk | monthly ...
  freshness_status   TEXT NOT NULL DEFAULT 'current'
                     CHECK (freshness_status IN
                       ('current','review_due','official_data_changed',
                        'editor_update_needed','source_error','stale')),

  schema_type        TEXT NOT NULL DEFAULT 'Article'
                     CHECK (schema_type IN ('Article','BlogPosting')),

  is_indexable       INTEGER NOT NULL DEFAULT 1,
  status             TEXT NOT NULL DEFAULT 'published'
                     CHECK (status IN ('draft','published','archived')),

  created_at         TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (hub, slug)
);

CREATE INDEX IF NOT EXISTS idx_evergreen_freshness ON evergreen_guides (freshness_status, next_review_at);
CREATE INDEX IF NOT EXISTS idx_evergreen_trigger   ON evergreen_guides (update_trigger);


-- ---------------------------------------------------------------------------
--  KAYNAKLAR — her indexlenebilir içerik için görünür kaynak listesi
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS article_sources (
  id            TEXT PRIMARY KEY,
  article_id    TEXT NOT NULL,
  article_type  TEXT NOT NULL CHECK (article_type IN ('editorial','evergreen')),
  source_name   TEXT NOT NULL,
  source_url    TEXT NOT NULL,
  source_kind   TEXT NOT NULL DEFAULT 'secondary'
                CHECK (source_kind IN ('official','primary','licensed','secondary')),
  accessed_at   TEXT NOT NULL,
  quote         TEXT,                          -- kısa alıntı (tam metin değil)
  position      INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_sources_article ON article_sources (article_type, article_id, position);


-- ---------------------------------------------------------------------------
--  DEĞİŞİKLİK GEÇMİŞİ — düzeltme politikasının teknik karşılığı
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS article_revisions (
  id            TEXT PRIMARY KEY,
  article_id    TEXT NOT NULL,
  article_type  TEXT NOT NULL CHECK (article_type IN ('editorial','evergreen')),
  revised_at    TEXT NOT NULL,
  revised_by    TEXT NOT NULL,
  change_type   TEXT NOT NULL
                CHECK (change_type IN ('correction','update','retraction','minor')),
  -- Okura GÖRÜNEN not. 'minor' dışındaki her değişiklik için zorunlu.
  public_note   TEXT,
  internal_note TEXT,
  CHECK (change_type = 'minor' OR public_note IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_revisions_article ON article_revisions (article_type, article_id, revised_at DESC);


-- ---------------------------------------------------------------------------
--  GÖRSELLER — lisans belirsizse yayımlanamaz
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS article_media (
  id            TEXT PRIMARY KEY,
  article_id    TEXT,
  article_type  TEXT CHECK (article_type IN ('editorial','evergreen')),
  role          TEXT NOT NULL DEFAULT 'hero' CHECK (role IN ('hero','thumbnail','inline')),
  src           TEXT NOT NULL,
  alt           TEXT NOT NULL,                 -- boş geçilemez (erişilebilirlik)
  caption       TEXT,
  credit        TEXT NOT NULL,                 -- ⚠️ ZORUNLU
  source_name   TEXT,
  license       TEXT NOT NULL,                 -- ⚠️ ZORUNLU
  rights_status TEXT NOT NULL DEFAULT 'unknown'
                CHECK (rights_status IN ('cleared','unknown','denied')),
  focal_point   TEXT DEFAULT '50% 50%',
  width         INTEGER,
  height        INTEGER,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_media_article ON article_media (article_type, article_id, role);


-- ---------------------------------------------------------------------------
--  EDİTORYAL KUYRUK — otomatik keşif ile insan onayı arasındaki kapı
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS editorial_queue (
  id             TEXT PRIMARY KEY,
  cluster_id     TEXT REFERENCES event_clusters(id) ON DELETE CASCADE,
  suggested_title TEXT NOT NULL,
  suggested_section TEXT,
  importance_score  INTEGER NOT NULL DEFAULT 0,
  source_count      INTEGER NOT NULL DEFAULT 1,
  -- AI YALNIZCA TASLAK ÖNERİR. Bu alan doğrudan yayımlanamaz;
  -- editör okuyup kendi metnini yazar (spec §11).
  ai_draft_summary  TEXT,
  ai_model          TEXT,
  status         TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','in_progress','approved','rejected','expired')),
  assigned_to    TEXT,
  reviewed_by    TEXT,
  reviewed_at    TEXT,
  reject_reason  TEXT,
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_queue_status ON editorial_queue (status, importance_score DESC);


-- ---------------------------------------------------------------------------
--  ANA SAYFA SLOTLARI — manuel sabitleme otomatiği EZER
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS homepage_slots (
  id              TEXT PRIMARY KEY,
  slot_type       TEXT NOT NULL CHECK (slot_type IN (
                    'primary_hero','secondary_hero','breaking_news',
                    'evergreen_feature','monthly_file','market_explainer',
                    'recommended_guide')),
  content_type    TEXT NOT NULL CHECK (content_type IN ('editorial','evergreen','guide','external')),
  content_id      TEXT NOT NULL,
  position        INTEGER NOT NULL DEFAULT 0,

  starts_at       TEXT,
  ends_at         TEXT,

  -- ⚠️ is_pinned = 1 ise otomatik seçim bu slotu DEĞİŞTİREMEZ (spec §8).
  is_pinned       INTEGER NOT NULL DEFAULT 0,
  allow_auto_fill INTEGER NOT NULL DEFAULT 1,

  show_desktop    INTEGER NOT NULL DEFAULT 1,
  show_mobile     INTEGER NOT NULL DEFAULT 1,

  custom_title    TEXT,
  custom_image_id TEXT REFERENCES article_media(id) ON DELETE SET NULL,

  -- Süresi biten slot yayından kalkar ama SİLİNMEZ (spec §8).
  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active','scheduled','expired','disabled')),
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_slots_active ON homepage_slots (slot_type, status, position);


-- ---------------------------------------------------------------------------
--  İŞLETİM TABLOLARI
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ingestion_runs (
  id             TEXT PRIMARY KEY,
  trigger        TEXT NOT NULL,               -- cron ifadesi veya 'manual'
  started_at     TEXT NOT NULL,
  finished_at    TEXT,
  sources_total  INTEGER NOT NULL DEFAULT 0,
  sources_ok     INTEGER NOT NULL DEFAULT 0,
  sources_failed INTEGER NOT NULL DEFAULT 0,
  items_fetched  INTEGER NOT NULL DEFAULT 0,
  items_new      INTEGER NOT NULL DEFAULT 0,
  items_duplicate INTEGER NOT NULL DEFAULT 0,
  error_summary  TEXT
);

CREATE INDEX IF NOT EXISTS idx_runs_started ON ingestion_runs (started_at DESC);

-- Kaynak sağlığı: sürekli hata veren kaynak otomatik devre dışı bırakılır,
-- böylece bir kaynağın çökmesi tüm akışı bozmaz.
CREATE TABLE IF NOT EXISTS source_health (
  source_id           TEXT PRIMARY KEY,
  source_name         TEXT NOT NULL,
  last_success_at     TEXT,
  last_failure_at     TEXT,
  last_error          TEXT,
  consecutive_failures INTEGER NOT NULL DEFAULT 0,
  total_items         INTEGER NOT NULL DEFAULT 0,
  trust_score         INTEGER NOT NULL DEFAULT 50,  -- 0-100
  is_enabled          INTEGER NOT NULL DEFAULT 1,
  updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Piyasa verisi — lisanslı sağlayıcıdan gelen son değerler.
-- Sağlayıcı yoksa tablo BOŞ kalır; arayüz sahte değer üretmez.
CREATE TABLE IF NOT EXISTS market_data (
  symbol          TEXT PRIMARY KEY,
  value           REAL,
  previous_close  REAL,
  change_percent  REAL,
  source_name     TEXT NOT NULL,
  delay_minutes   INTEGER,
  quoted_at       TEXT,                        -- verinin ait olduğu an
  updated_at      TEXT NOT NULL
);

-- Evergreen içerik için güncelleme tetikleyicileri (spec §9).
-- Cron YALNIZCA "güncelleme gerekli" işareti koyar; içeriği değiştirmez.
CREATE TABLE IF NOT EXISTS update_schedules (
  id             TEXT PRIMARY KEY,
  guide_id       TEXT NOT NULL REFERENCES evergreen_guides(id) ON DELETE CASCADE,
  trigger_type   TEXT NOT NULL CHECK (trigger_type IN
                   ('tuik_tufe','tcmb_ppk','minimum_wage','pension','monthly','manual')),
  cron_hint      TEXT,
  last_triggered_at TEXT,
  next_check_at  TEXT,
  is_active      INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_schedules_next ON update_schedules (is_active, next_check_at);
