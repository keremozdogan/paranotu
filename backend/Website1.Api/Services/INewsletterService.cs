using System.Collections.Concurrent;
using Website1.Api.Models;

namespace Website1.Api.Services;

public interface INewsletterService
{
    /// <returns>false → e-posta zaten kayıtlı</returns>
    Task<bool> SubscribeAsync(string email, string source, CancellationToken ct = default);

    Task<IReadOnlyList<Subscriber>> GetAllAsync(CancellationToken ct = default);
}

/// <summary>
/// Bellek içi uygulama — uygulama yeniden başlayınca veri kaybolur.
///
/// KALICI HALE GETİRMEK İÇİN:
///   1) EF Core paketini ekle (Microsoft.EntityFrameworkCore.Sqlite gibi)
///   2) Bu sınıfın aynısını DbContext ile yazan bir EfNewsletterService oluştur
///   3) Program.cs'te tek satırı değiştir:
///        builder.Services.AddSingleton&lt;INewsletterService, InMemoryNewsletterService&gt;();
///      → builder.Services.AddScoped&lt;INewsletterService, EfNewsletterService&gt;();
///   Endpoint'lere ve Next.js tarafına dokunmana gerek kalmaz.
/// </summary>
public sealed class InMemoryNewsletterService : INewsletterService
{
    private readonly ConcurrentDictionary<string, Subscriber> _subscribers =
        new(StringComparer.OrdinalIgnoreCase);

    public Task<bool> SubscribeAsync(string email, string source, CancellationToken ct = default)
    {
        var normalized = email.Trim().ToLowerInvariant();

        var subscriber = new Subscriber(
            Guid.NewGuid(),
            normalized,
            source,
            DateTimeOffset.UtcNow);

        // TryAdd false dönerse e-posta zaten kayıtlı demektir.
        return Task.FromResult(_subscribers.TryAdd(normalized, subscriber));
    }

    public Task<IReadOnlyList<Subscriber>> GetAllAsync(CancellationToken ct = default)
        => Task.FromResult<IReadOnlyList<Subscriber>>(
            _subscribers.Values.OrderByDescending(s => s.CreatedAt).ToList());
}
