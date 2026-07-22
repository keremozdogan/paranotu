using System.Collections.Concurrent;
using Website1.Api.Models;

namespace Website1.Api.Services;

public interface ICommentService
{
    Task<IReadOnlyList<CommentDto>> GetBySlugAsync(string slug, CancellationToken ct = default);
    Task<CommentDto> AddAsync(CommentRequest request, CancellationToken ct = default);
}

/// <summary>
/// Bellek içi yorum deposu.
///
/// ÜRETİME ALMADAN ÖNCE mutlaka ekle:
///   - Moderasyon (yorum önce onay bekler)
///   - Spam koruması (hız sınırı + captcha)
///   - Kalıcı veritabanı
/// </summary>
public sealed class InMemoryCommentService : ICommentService
{
    private readonly ConcurrentDictionary<string, List<CommentDto>> _bySlug = new();
    private readonly object _lock = new();

    public Task<IReadOnlyList<CommentDto>> GetBySlugAsync(string slug, CancellationToken ct = default)
    {
        if (!_bySlug.TryGetValue(slug, out var list))
            return Task.FromResult<IReadOnlyList<CommentDto>>([]);

        lock (_lock)
        {
            return Task.FromResult<IReadOnlyList<CommentDto>>(
                list.OrderByDescending(c => c.CreatedAt).ToList());
        }
    }

    public Task<CommentDto> AddAsync(CommentRequest request, CancellationToken ct = default)
    {
        var comment = new CommentDto(
            Guid.NewGuid(),
            request.Slug,
            request.Author.Trim(),
            request.Content.Trim(),
            DateTimeOffset.UtcNow);

        var list = _bySlug.GetOrAdd(request.Slug, _ => []);
        lock (_lock)
        {
            list.Add(comment);
        }

        return Task.FromResult(comment);
    }
}
