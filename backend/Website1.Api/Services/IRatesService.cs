using Website1.Api.Models;

namespace Website1.Api.Services;

public interface IRatesService
{
    Task<RatesResponse> GetRatesAsync(CancellationToken ct = default);
}

/// <summary>
/// SAHTE VERİ — yalnızca çevrimdışı geliştirme ve test içindir.
///
/// Üretimde <see cref="TcmbRatesService"/> kullanılır (Program.cs'te kayıtlı).
/// Bu sınıfı canlıya almak, siteye uydurma finansal veri koymak anlamına gelir;
/// yapma.
/// </summary>
public sealed class SampleRatesService : IRatesService
{
    private static readonly RateItem[] Sample =
    [
        new("USD", "ABD Doları", 41.20m, 41.35m, 0.42m),
        new("EUR", "Euro", 44.80m, 44.98m, -0.18m),
        new("GBP", "İngiliz Sterlini", 52.10m, 52.40m, 0.06m)
    ];

    public Task<RatesResponse> GetRatesAsync(CancellationToken ct = default)
        => Task.FromResult(new RatesResponse(
            DateTimeOffset.UtcNow,
            "Örnek veri (gerçek değil)",
            "",
            Sample));
}
