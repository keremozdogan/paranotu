using System.Collections.Concurrent;
using Website1.Api.Models;

namespace Website1.Api.Services;

public interface IPostStatsService
{
    Task<long> IncrementViewAsync(string slug, CancellationToken ct = default);
    Task<PostStats> GetAsync(string slug, CancellationToken ct = default);
}

/// <summary>Bellek içi görüntülenme sayacı.</summary>
public sealed class InMemoryPostStatsService : IPostStatsService
{
    private readonly ConcurrentDictionary<string, long> _views = new();

    public Task<long> IncrementViewAsync(string slug, CancellationToken ct = default)
        => Task.FromResult(_views.AddOrUpdate(slug, 1, (_, current) => current + 1));

    public Task<PostStats> GetAsync(string slug, CancellationToken ct = default)
        => Task.FromResult(new PostStats(slug, _views.GetValueOrDefault(slug)));
}
