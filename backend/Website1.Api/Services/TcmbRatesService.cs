using System.Globalization;
using System.Xml.Linq;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using Website1.Api.Models;

namespace Website1.Api.Services;

public sealed class TcmbOptions
{
    public const string SectionName = "Tcmb";

    /// <summary>
    /// Widget'ta gösterilecek para birimleri (TCMB "Kod" alanı).
    ///
    /// DİKKAT: Burası bilerek boş bırakıldı. .NET config binder'ı dizileri
    /// mevcut değerlerin ÜZERİNE YAZMAZ, sonuna EKLER — buraya varsayılan
    /// koyulursa appsettings.json'daki liste ona eklenir ve kurlar iki kez
    /// listelenir. Varsayılan <see cref="DefaultCurrencies"/> içinde tutulur.
    /// </summary>
    public string[] Currencies { get; set; } = [];

    public static readonly string[] DefaultCurrencies = ["USD", "EUR", "GBP"];

    /// <summary>Yapılandırılmış liste — boşsa varsayılan, her hâlükârda tekilleştirilmiş.</summary>
    public IEnumerable<string> ResolvedCurrencies =>
        (Currencies.Length > 0 ? Currencies : DefaultCurrencies)
        .Distinct(StringComparer.OrdinalIgnoreCase);

    /// <summary>Kur verisinin önbellekte tutulma süresi (dakika).</summary>
    public int CacheMinutes { get; set; } = 30;

    /// <summary>Önceki iş günü aranırken geriye kaç gün bakılacağı.</summary>
    public int MaxLookbackDays { get; set; } = 10;
}

/// <summary>
/// TCMB (Türkiye Cumhuriyet Merkez Bankası) resmî günlük kur servisi.
///
///   Güncel:  https://www.tcmb.gov.tr/kurlar/today.xml
///   Geçmiş:  https://www.tcmb.gov.tr/kurlar/YYYYMM/DDMMYYYY.xml
///
/// ÖNEMLİ NOTLAR
///  • TCMB kurları her iş günü ~15:30'da yayımlar. Bu saatten önce today.xml
///    bir önceki iş gününü döner. Yani veri ANLIK DEĞİL, günlüktür.
///  • Hafta sonu ve resmî tatillerde yayın yoktur (404). Bu yüzden "önceki iş
///    günü" aranırken geriye doğru gün gün bakılır.
///  • TCMB ALTIN yayımlamaz. Gram altın için ayrı bir sağlayıcı gerekir.
///  • Kaynak resmî olduğu için atıf zorunluluğu vardır; UI'da "Kaynak: TCMB"
///    ibaresi gösterilir.
/// </summary>
public sealed class TcmbRatesService : IRatesService
{
    public const string HttpClientName = "tcmb";
    private const string CacheKey = "tcmb:rates";

    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IMemoryCache _cache;
    private readonly TcmbOptions _options;
    private readonly ILogger<TcmbRatesService> _logger;

    /// <summary>Aynı anda gelen isteklerin TCMB'yi ayrı ayrı yormasını engeller.</summary>
    private static readonly SemaphoreSlim Gate = new(1, 1);

    public TcmbRatesService(
        IHttpClientFactory httpClientFactory,
        IMemoryCache cache,
        IOptions<TcmbOptions> options,
        ILogger<TcmbRatesService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _cache = cache;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<RatesResponse> GetRatesAsync(CancellationToken ct = default)
    {
        if (_cache.TryGetValue(CacheKey, out RatesResponse? cached) && cached is not null)
            return cached;

        await Gate.WaitAsync(ct);
        try
        {
            // Kilidi beklerken başka bir istek doldurmuş olabilir.
            if (_cache.TryGetValue(CacheKey, out cached) && cached is not null)
                return cached;

            var response = await FetchAsync(ct);

            _cache.Set(CacheKey, response, new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(_options.CacheMinutes)
            });

            return response;
        }
        finally
        {
            Gate.Release();
        }
    }

    private async Task<RatesResponse> FetchAsync(CancellationToken ct)
    {
        var client = _httpClientFactory.CreateClient(HttpClientName);

        var todayDoc = await LoadXmlAsync(client, "kurlar/today.xml", ct)
            ?? throw new InvalidOperationException("TCMB güncel kur verisi alınamadı.");

        var bulletinDate = ParseBulletinDate(todayDoc);

        // Değişim yüzdesi için bir önceki yayın gününü bul (hafta sonu/tatil atlanır).
        var previousRates = await LoadPreviousBusinessDayAsync(client, bulletinDate, ct);

        var items = new List<RateItem>();

        foreach (var code in _options.ResolvedCurrencies)
        {
            var current = ReadRate(todayDoc, code);
            if (current is null)
            {
                _logger.LogWarning("TCMB bülteninde {Code} bulunamadı, atlanıyor.", code);
                continue;
            }

            decimal changePercent = 0m;
            if (previousRates is not null &&
                ReadRate(previousRates, code) is { } previous &&
                previous.Selling > 0m)
            {
                changePercent = Math.Round(
                    (current.Value.Selling - previous.Selling) / previous.Selling * 100m, 2);
            }

            items.Add(new RateItem(
                code,
                current.Value.Name,
                current.Value.Buying,
                current.Value.Selling,
                changePercent));
        }

        if (items.Count == 0)
            throw new InvalidOperationException("TCMB bülteninden hiçbir kur okunamadı.");

        _logger.LogInformation(
            "TCMB kurları güncellendi. Bülten tarihi: {Date:yyyy-MM-dd}, {Count} kur.",
            bulletinDate, items.Count);

        // updatedAt = bültenin ait olduğu tarih (isteğin yapıldığı an değil).
        var updatedAt = new DateTimeOffset(
            bulletinDate.ToDateTime(new TimeOnly(15, 30)),
            TimeSpan.FromHours(3)); // TRT (UTC+3)

        return new RatesResponse(
            updatedAt,
            "TCMB",
            "https://www.tcmb.gov.tr/kurlar/today.xml",
            items);
    }

    /// <summary>Bültenden geriye doğru giderek yayın yapılan ilk günü bulur.</summary>
    private async Task<XDocument?> LoadPreviousBusinessDayAsync(
        HttpClient client, DateOnly bulletinDate, CancellationToken ct)
    {
        for (var i = 1; i <= _options.MaxLookbackDays; i++)
        {
            var date = bulletinDate.AddDays(-i);

            // Hafta sonunda yayın olmadığı için boşuna istek atma.
            if (date.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday) continue;

            var path = $"kurlar/{date:yyyyMM}/{date:ddMMyyyy}.xml";
            var doc = await LoadXmlAsync(client, path, ct);
            if (doc is not null) return doc;
        }

        _logger.LogWarning(
            "Önceki iş günü bülteni {Days} gün geriye bakılmasına rağmen bulunamadı; " +
            "değişim yüzdeleri 0 olarak dönecek.", _options.MaxLookbackDays);

        return null;
    }

    private async Task<XDocument?> LoadXmlAsync(HttpClient client, string path, CancellationToken ct)
    {
        try
        {
            using var response = await client.GetAsync(path, ct);

            // Tatil/hafta sonu → 404. Bu bir hata değil, beklenen durum.
            if (!response.IsSuccessStatusCode) return null;

            await using var stream = await response.Content.ReadAsStreamAsync(ct);
            return await XDocument.LoadAsync(stream, LoadOptions.None, ct);
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
        {
            _logger.LogWarning(ex, "TCMB isteği başarısız: {Path}", path);
            return null;
        }
    }

    private static DateOnly ParseBulletinDate(XDocument doc)
    {
        var raw = doc.Root?.Attribute("Tarih")?.Value;

        return DateOnly.TryParseExact(raw, "dd.MM.yyyy", CultureInfo.InvariantCulture,
            DateTimeStyles.None, out var date)
            ? date
            : DateOnly.FromDateTime(DateTime.UtcNow);
    }

    private static (string Name, decimal Buying, decimal Selling)? ReadRate(XDocument doc, string code)
    {
        var node = doc.Root?
            .Elements("Currency")
            .FirstOrDefault(e => string.Equals(
                e.Attribute("Kod")?.Value, code, StringComparison.OrdinalIgnoreCase));

        if (node is null) return null;

        // TCMB bazı kurları 100 birim üzerinden verir (ör. JPY) — Unit'e bölmek şart.
        var unit = ParseDecimal(node.Element("Unit")?.Value) ?? 1m;
        if (unit <= 0m) unit = 1m;

        var buying = ParseDecimal(node.Element("ForexBuying")?.Value);
        var selling = ParseDecimal(node.Element("ForexSelling")?.Value);

        if (buying is null || selling is null) return null;

        var name = DisplayName(code, node.Element("Isim")?.Value);

        return (name, buying.Value / unit, selling.Value / unit);
    }

    /// <summary>
    /// TCMB isimleri tamamen büyük harf gelir ("ABD DOLARI"). Yaygın kodlar için
    /// elle düzeltilmiş ad kullanılır; bilinmeyenlerde başlık biçimine çevrilir.
    /// </summary>
    private static string DisplayName(string code, string? rawName)
    {
        var known = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["USD"] = "ABD Doları",
            ["EUR"] = "Euro",
            ["GBP"] = "İngiliz Sterlini",
            ["CHF"] = "İsviçre Frangı",
            ["JPY"] = "Japon Yeni",
            ["CAD"] = "Kanada Doları",
            ["AUD"] = "Avustralya Doları",
            ["SEK"] = "İsveç Kronu",
            ["NOK"] = "Norveç Kronu",
            ["DKK"] = "Danimarka Kronu",
            ["SAR"] = "Suudi Arabistan Riyali",
            ["KWD"] = "Kuveyt Dinarı",
            ["RUB"] = "Rus Rublesi",
            ["CNY"] = "Çin Yuanı"
        };

        if (known.TryGetValue(code, out var name)) return name;

        var tr = new CultureInfo("tr-TR");
        return tr.TextInfo.ToTitleCase((rawName ?? code).ToLower(tr)).Trim();
    }

    /// <summary>TCMB XML'i her zaman "." ondalık ayracı kullanır.</summary>
    private static decimal? ParseDecimal(string? value)
        => decimal.TryParse(value, NumberStyles.Any, CultureInfo.InvariantCulture, out var result)
            ? result
            : null;

}
